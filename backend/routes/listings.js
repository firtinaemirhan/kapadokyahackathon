import { Router } from "express";
import { createListing, deleteListing, getListing, listListings } from "../services/listings.js";

export const listingsRouter = Router();

listingsRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await listListings());
  } catch (error) {
    next(error);
  }
});

listingsRouter.post("/", async (req, res, next) => {
  try {
    res.status(201).json(await createListing(req.body ?? {}));
  } catch (error) {
    next(error);
  }
});

listingsRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await getListing(req.params.id));
  } catch (error) {
    next(error);
  }
});

listingsRouter.delete("/:id", async (req, res, next) => {
  try {
    res.json(await deleteListing(req.params.id));
  } catch (error) {
    next(error);
  }
});
