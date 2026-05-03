import { Router } from "express";
import { getRatesWithCache } from "../services/tcmb.js";

export const exchangeRatesRouter = Router();

exchangeRatesRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await getRatesWithCache());
  } catch (error) {
    next(error);
  }
});
