import { Router } from "express";
import { classifyWaste } from "../services/classify-waste.js";

export const classifyWasteRouter = Router();

classifyWasteRouter.post("/", async (req, res, next) => {
  try {
    res.json(await classifyWaste(req.body?.text));
  } catch (error) {
    next(error);
  }
});
