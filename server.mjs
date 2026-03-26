import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const PORT = Number(process.env.PORT) || 5173;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = process.cwd();

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function getSafeFilePath(urlPath) {
  const cleaned = urlPath === "/" ? "index.html" : urlPath.replace(/^[/\\]+/, "");
  const normalized = normalize(cleaned);

  if (normalized.startsWith("..")) {
    return null;
  }

  return join(ROOT, normalized);
}

const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, `http://${req.headers.host}`).pathname;
    const filePath = getSafeFilePath(path);
    if (!filePath) {
      throw new Error("Unsafe path");
    }
    const file = await readFile(filePath);
    const extension = extname(filePath);
    const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";

    res.writeHead(200, { "content-type": contentType });
    res.end(file);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Snake web server running at http://${HOST}:${PORT}`);
});
