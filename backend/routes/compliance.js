import { Router } from "express";
import { calculateCarbonChain } from "./carbon.js";

export const complianceRouter = Router();

complianceRouter.post("/demo-chain", async (req, res, next) => {
  try {
    res.json({
      compliance: {
        carbonFootprint: "Kural 1: coğrafi mesafe ve tonajdan CO2 hesabı",
        liveFx: "Kural 2: TCMB kuruyla TRY/USD/EUR karbon maliyeti",
        geoOperation: "Kural 3: açık kaynak coğrafi rota/mesafe işlemi",
      },
      result: await calculateCarbonChain(req.body ?? {}),
    });
  } catch (error) {
    next(error);
  }
});
