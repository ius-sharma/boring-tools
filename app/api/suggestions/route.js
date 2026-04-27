import { appendFile, mkdir, readFile } from "fs/promises";
import { createSign } from "crypto";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const QUEUE_FILE = path.join(DATA_DIR, "suggestions.jsonl");
const RECENT_LIMIT = 25;
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function normalize(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function normalizePrivateKey(value) {
  return normalize(value).replace(/\\n/g, "\n");
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function readServiceAccountConfig() {
  const spreadsheetId = normalize(process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
  const tabName = normalize(process.env.GOOGLE_SHEETS_TAB_NAME, "Suggestions") || "Suggestions";
  const rawJson = normalize(process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON);
  const clientEmail = normalize(process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(process.env.GOOGLE_SHEETS_PRIVATE_KEY);

  let credentials = null;
  let source = "not-configured";

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      credentials = {
        client_email: normalize(parsed?.client_email),
        private_key: normalizePrivateKey(parsed?.private_key),
      };
      source = "json";
    } catch {
      return {
        enabled: false,
        spreadsheetId,
        tabName,
        source: "invalid-json",
        issue: "GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON is not valid JSON",
      };
    }
  } else if (clientEmail && privateKey) {
    credentials = {
      client_email: clientEmail,
      private_key: privateKey,
    };
    source = "env-pair";
  }

  const enabled = Boolean(spreadsheetId && credentials?.client_email && credentials?.private_key);

  return {
    enabled,
    spreadsheetId,
    tabName,
    source,
    credentials,
    issue: enabled
      ? ""
      : "Missing GOOGLE_SHEETS_SPREADSHEET_ID plus either GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON or GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY",
  };
}

function buildJwtAssertion(credentials) {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: GOOGLE_SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: issuedAt,
    exp: issuedAt + 3600,
  };
  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(normalizePrivateKey(credentials.private_key), "base64");

  return `${unsignedToken}.${signature.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")}`;
}

async function getGoogleAccessToken(credentials) {
  const assertion = buildJwtAssertion(credentials);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${await response.text()}`);
  }

  const data = await response.json();
  if (!data?.access_token) {
    throw new Error("Google token response did not include an access token");
  }

  return data.access_token;
}

async function getSpreadsheetSheetId(accessToken, spreadsheetId, tabName) {
  const response = await fetch(
    `${GOOGLE_SHEETS_URL}/${spreadsheetId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Google spreadsheet lookup failed: ${await response.text()}`);
  }

  const data = await response.json();
  const sheets = Array.isArray(data?.sheets) ? data.sheets : [];
  const match = sheets.find((sheet) => normalize(sheet?.properties?.title) === normalize(tabName, "Suggestions"));

  if (match?.properties?.sheetId !== undefined && match?.properties?.sheetId !== null) {
    return {
      sheetId: match.properties.sheetId,
      title: match.properties.title,
      fallbackUsed: false,
      created: false,
    };
  }

  const firstSheet = sheets[0]?.properties;
  if (firstSheet?.sheetId !== undefined && firstSheet?.sheetId !== null) {
    const createResponse = await fetch(`${GOOGLE_SHEETS_URL}/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: normalize(tabName, "Suggestions") || "Suggestions",
              },
            },
          },
        ],
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Sheet tab not found and auto-create failed: ${await createResponse.text()}`);
    }

    const createdData = await createResponse.json();
    const createdSheet = createdData?.replies?.[0]?.addSheet?.properties;
    if (!createdSheet?.sheetId) {
      throw new Error(`Sheet tab not found and auto-create returned no sheetId: ${normalize(tabName, "Suggestions")}`);
    }

    return {
      sheetId: createdSheet.sheetId,
      title: createdSheet.title || normalize(tabName, "Suggestions") || "Suggestions",
      fallbackUsed: true,
      created: true,
    };
  }

  throw new Error(`Sheet tab not found: ${tabName || "Suggestions"}`);
}

async function appendToGoogleSheet(config, entry) {
  if (!config.enabled) {
    return {
      status: "disabled",
      message: config.issue,
    };
  }

  const accessToken = await getGoogleAccessToken(config.credentials);
  const sheetRef = await getSpreadsheetSheetId(accessToken, config.spreadsheetId, config.tabName);
  const response = await fetch(`${GOOGLE_SHEETS_URL}/${config.spreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          appendCells: {
            sheetId: sheetRef.sheetId,
            rows: [
              {
                values: [
                  { userEnteredValue: { stringValue: entry.createdAt } },
                  { userEnteredValue: { stringValue: entry.name } },
                  { userEnteredValue: { stringValue: entry.email } },
                  { userEnteredValue: { stringValue: entry.category } },
                  { userEnteredValue: { stringValue: entry.suggestion } },
                  { userEnteredValue: { stringValue: entry.source } },
                  { userEnteredValue: { stringValue: entry.pipeline } },
                ],
              },
            ],
            fields: "userEnteredValue",
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets append failed: ${await response.text()}`);
  }

  return {
    status: "synced",
    message: sheetRef.created
      ? `Created and appended to ${sheetRef.title}`
      : sheetRef.fallbackUsed
        ? `Appended to ${sheetRef.title} (fallback from ${config.tabName || "Suggestions"})`
        : `Appended to ${sheetRef.title}`,
  };
}

function parseQueue(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
}

async function readQueue() {
  try {
    const raw = await readFile(QUEUE_FILE, "utf8");
    return parseQueue(raw);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function appendQueue(entry) {
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(QUEUE_FILE, `${JSON.stringify(entry)}\n`, "utf8");
}

export async function GET() {
  const queue = await readQueue();
  const sheetConfig = readServiceAccountConfig();

  return Response.json({
    mode: "local-queue",
    total: queue.length,
    recent: queue.slice(-RECENT_LIMIT).reverse(),
    sheetSync: {
      enabled: sheetConfig.enabled,
      status: sheetConfig.enabled ? "ready" : "disabled",
      tabName: sheetConfig.tabName,
      message: sheetConfig.enabled ? `Ready to sync to ${sheetConfig.tabName}` : sheetConfig.issue,
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sheetConfig = readServiceAccountConfig();
    const suggestion = normalize(body?.suggestion);

    if (!suggestion) {
      return Response.json({ error: "Suggestion text is required" }, { status: 400 });
    }

    const entry = {
      id: `suggestion_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      name: normalize(body?.name),
      email: normalize(body?.email).toLowerCase(),
      category: normalize(body?.category, "New Tool Idea"),
      suggestion,
      source: "homepage",
      pipeline: "local-queue",
    };

    let queue = [];
    try {
      await appendQueue(entry);
      queue = await readQueue();
    } catch {
      queue = [];
    }

    let sheetSync = {
      status: "disabled",
      message: sheetConfig.issue,
    };

    try {
      sheetSync = await appendToGoogleSheet(sheetConfig, entry);
    } catch (error) {
      sheetSync = {
        status: "failed",
        message: error instanceof Error ? error.message : "Google Sheets sync failed",
      };
    }

    return Response.json({
      ok: true,
      mode: "local-queue",
      queued: queue.length,
      item: entry,
      sheetSync,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Unexpected suggestion pipeline failure",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}