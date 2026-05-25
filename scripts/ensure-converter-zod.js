const fs = require("node:fs");
const path = require("node:path");

function ensureZodForConverter() {
  const rootDir = process.cwd();
  const sourceDir = path.join(rootDir, "node_modules", "zod");
  const targetDir = path.join(rootDir, "node_modules", "@matbee", "libreoffice-converter", "node_modules", "zod");

  if (!fs.existsSync(sourceDir)) {
    return;
  }

  if (fs.existsSync(targetDir)) {
    return;
  }

  fs.mkdirSync(path.dirname(targetDir), { recursive: true });

  try {
    fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });
  } catch (error) {
    if (!fs.existsSync(targetDir)) {
      throw error;
    }
  }
}

ensureZodForConverter();
