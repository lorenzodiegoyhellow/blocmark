import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Serve static files (images, etc.) before Vite middleware
  const attachedAssetsPath = path.resolve(__dirname, "..", "attached_assets");
  const clientAssetsPath = path.resolve(__dirname, "..", "client", "public", "assets");
  
  // Serve attached assets (images, etc.)
  if (fs.existsSync(attachedAssetsPath)) {
    app.use("/attached_assets", express.static(attachedAssetsPath));
    console.log(`[VITE] Serving attached assets from: ${attachedAssetsPath}`);
  } else {
    console.log(`[VITE] Attached assets path not found: ${attachedAssetsPath}`);
  }
  
  // Serve client assets (logos, etc.)
  if (fs.existsSync(clientAssetsPath)) {
    app.use("/assets", express.static(clientAssetsPath));
    console.log(`[VITE] Serving client assets from: ${clientAssetsPath}`);
  }

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  const attachedAssetsPath = path.resolve(__dirname, "..", "attached_assets");
  const clientAssetsPath = path.resolve(__dirname, "..", "client", "public", "assets");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve the built React app
  app.use(express.static(distPath));
  
  // Serve attached assets (images, etc.)
  if (fs.existsSync(attachedAssetsPath)) {
    app.use("/attached_assets", express.static(attachedAssetsPath));
    console.log(`[STATIC] Serving attached assets from: ${attachedAssetsPath}`);
  } else {
    console.log(`[STATIC] Attached assets path not found: ${attachedAssetsPath}`);
  }
  
  // Serve client assets (logos, etc.)
  if (fs.existsSync(clientAssetsPath)) {
    app.use("/assets", express.static(clientAssetsPath));
  }

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
