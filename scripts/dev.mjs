import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PORT = 3005;
const URL = `http://127.0.0.1:${PORT}`;
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function waitForPort(port, maxAttempts = 60) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const tryConnect = () => {
      const socket = createConnection({ port, host: "127.0.0.1" }, () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        attempts += 1;
        if (attempts >= maxAttempts) {
          reject(new Error(`Server did not start on port ${port}`));
          return;
        }
        setTimeout(tryConnect, 500);
      });
    };
    tryConnect();
  });
}

function openBrowser(url) {
  const platform = process.platform;
  const cmd =
    platform === "darwin"
      ? `open "${url}"`
      : platform === "win32"
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.log(`Open in your browser: ${url}`);
  });
}

console.log(`Starting dev server on ${URL} ...\n`);

const nextBin = join(projectRoot, "node_modules", ".bin", "next");

const next = spawn(
  nextBin,
  ["dev", "-p", String(PORT), "-H", "127.0.0.1"],
  { cwd: projectRoot, stdio: "inherit", env: process.env }
);

next.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

waitForPort(PORT)
  .then(() => {
    console.log(`\nOpening ${URL} in your browser...\n`);
    openBrowser(URL);
  })
  .catch((err) => console.error(err.message));

next.on("close", (code) => process.exit(code ?? 0));

process.on("SIGINT", () => {
  next.kill("SIGINT");
});
