import { createSign } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const clientEmail = normalize(process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(process.env.GOOGLE_SHEETS_PRIVATE_KEY);

  const enabled = Boolean(spreadsheetId && clientEmail && privateKey);

  return {
    enabled,
    spreadsheetId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    issue: enabled
      ? ""
      : "Missing Google Sheets configuration variables in environment (.env.local)",
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
  const match = sheets.find((sheet) => normalize(sheet?.properties?.title) === normalize(tabName, "CapsuleReminders"));

  if (match?.properties?.sheetId !== undefined && match?.properties?.sheetId !== null) {
    return {
      sheetId: match.properties.sheetId,
      title: match.properties.title,
      created: false,
    };
  }

  // Auto-create sheet tab if it doesn't exist
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
              title: normalize(tabName, "CapsuleReminders") || "CapsuleReminders",
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
    throw new Error(`Sheet tab auto-create returned no sheetId`);
  }

  // Append Headers to new sheet
  await fetch(`${GOOGLE_SHEETS_URL}/${spreadsheetId}/values/${tabName}!A1:G1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      range: `${tabName}!A1:G1`,
      majorDimension: "ROWS",
      values: [
        ["Capsule ID", "Title", "Email", "Created Date", "Unlock Date", "Reminder Offset (Days)", "Status"]
      ]
    })
  });

  return {
    sheetId: createdSheet.sheetId,
    title: createdSheet.title,
    created: true,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();

    const action = normalize(body?.action, "register");
    const capsuleId = normalize(body?.capsuleId);
    const title = normalize(body?.title);
    const email = normalize(body?.email).toLowerCase();
    const createdDate = normalize(body?.createdDate);
    const unlockDate = normalize(body?.unlockDate);
    const reminderOffset = parseInt(body?.reminderOffset ?? "0", 10);

    if (action === "register") {
      if (!capsuleId || !title || !email || !createdDate || !unlockDate) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
      }
    } else if (action === "updateEmail") {
      if (!capsuleId || !email) {
        return Response.json({ error: "Missing required fields for updateEmail" }, { status: 400 });
      }
    } else if (action === "delete") {
      if (!capsuleId) {
        return Response.json({ error: "Missing required fields for delete" }, { status: 400 });
      }
    } else {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    // Check if Google Apps Script Web App Webhook URL is configured
    const webAppUrl = process.env.GOOGLE_SCRIPT_WEB_APP_URL;

    if (webAppUrl && webAppUrl.trim() !== "") {
      // POST to Apps Script Web App for instant execution
      const response = await fetch(webAppUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          capsuleId,
          title,
          email,
          createdDate,
          unlockDate,
          reminderOffset,
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Script Web App post failed: ${await response.text()}`);
      }

      const resJson = await response.json();
      if (resJson.error) {
        throw new Error(resJson.error);
      }

      return Response.json({
        ok: true,
        message: `Successfully processed action "${action}" instantly via Web App`,
        capsuleId,
      });
    }

    // FALLBACK: Directly append using Service Account credentials (only supports register)
    if (action !== "register") {
      return Response.json({ error: "Fallback sheet writer only supports 'register' action. Please configure GOOGLE_SCRIPT_WEB_APP_URL for update/delete." }, { status: 400 });
    }

    const config = readServiceAccountConfig();
    if (!config.enabled) {
      return Response.json({ error: config.issue }, { status: 500 });
    }

    const accessToken = await getGoogleAccessToken(config.credentials);
    const tabName = "CapsuleReminders";
    const sheetRef = await getSpreadsheetSheetId(accessToken, config.spreadsheetId, tabName);

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
                    { userEnteredValue: { stringValue: capsuleId } },
                    { userEnteredValue: { stringValue: title } },
                    { userEnteredValue: { stringValue: email } },
                    { userEnteredValue: { stringValue: createdDate } },
                    { userEnteredValue: { stringValue: unlockDate } },
                    { userEnteredValue: { numberValue: reminderOffset } },
                    { userEnteredValue: { stringValue: "Pending" } },
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

    return Response.json({
      ok: true,
      message: `Successfully registered reminder inside Google Sheet tab "${sheetRef.title}"`,
      capsuleId,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Google Sheets sync failure",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
