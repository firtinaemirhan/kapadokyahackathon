import { Router } from "express";
import { createProduct, listProducts } from "../services/products.js";

export const productsRouter = Router();

productsRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await listProducts());
  } catch (error) {
    next(error);
  }
});

productsRouter.post("/", async (req, res, next) => {
  try {
    res.status(201).json(await createProduct(req.body ?? {}));
  } catch (error) {
    next(error);
  }
});
