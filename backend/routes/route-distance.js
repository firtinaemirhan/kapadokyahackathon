import { Router } from "express";
import { getDistanceKm } from "../services/route-distance.js";

export const routeDistanceRouter = Router();

routeDistanceRouter.post("/", async (req, res, next) => {
  try {
    const { from, to, mode, includeGeometry } = req.body ?? {};
    res.json(await getDistanceKm(from, to, mode, { includeGeometry }));
  } catch (error) {
    next(error);
  }
});
