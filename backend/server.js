import "dotenv/config";
import cors from "cors";
import express from "express";
import { carbonRouter } from "./routes/carbon.js";
import { classifyWasteRouter } from "./routes/classify-waste.js";
import { complianceRouter } from "./routes/compliance.js";
import { contactRequestsRouter } from "./routes/contact-requests.js";
import { exchangeRatesRouter } from "./routes/exchange-rates.js";
import { geoRouter } from "./routes/geo.js";
import { listingsRouter } from "./routes/listings.js";
import { liveTestsRouter } from "./routes/live-tests.js";
import { productsRouter } from "./routes/products.js";
import { routeDistanceRouter } from "./routes/route-distance.js";
import { usersRouter } from "./routes/users.js";

export function createApp() {
  const app = express();
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const requestCounts = new Map();

  app.use(
    cors({
      origin: frontendOrigin === "*" ? true : frontendOrigin,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use((req, res, next) => {
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const windowMs = 60_000;
    const maxRequests = 120;
    const current = requestCounts.get(key);

    if (!current || current.resetAt < now) {
      requestCounts.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;
    if (current.count > maxRequests) {
      res.status(429).json({ error: "Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin." });
      return;
    }

    next();
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "tortu-backend", time: new Date().toISOString() });
  });

  app.use("/api", geoRouter);
  app.use("/api/exchange-rates", exchangeRatesRouter);
  app.use("/api/route-distance", routeDistanceRouter);
  app.use("/api/carbon", carbonRouter);
  app.use("/api/classify-waste", classifyWasteRouter);
  app.use("/api/compliance", complianceRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/listings", listingsRouter);
  app.use("/api/contact-requests", contactRequestsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/live-tests", liveTestsRouter);

  app.use((req, res) => {
    res.status(404).json({ error: `Endpoint bulunamadı: ${req.method} ${req.path}` });
  });

  app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : "Beklenmeyen backend hatası.";
    const status =
      message.includes("bulunamadı") || message.includes("bulunamaz")
        ? 404
        : message.includes("gerekli") ||
            message.includes("olmalı") ||
            message.includes("Desteklenmeyen")
          ? 400
          : 502;
    res.status(status).json({ error: message });
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 3000);
  const server = createApp().listen(port, () => {
    console.log(`Tortu backend http://localhost:${port} üzerinde çalışıyor.`);
  });
  const keepAlive = setInterval(() => undefined, 60 * 60 * 1000);

  process.on("SIGTERM", () => server.close(() => process.exit(0)));
  process.on("SIGINT", () => server.close(() => process.exit(0)));
  server.on("close", () => clearInterval(keepAlive));
}
