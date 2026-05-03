import { Router } from "express";
import { geocodeAddress, reverseGeocode } from "../services/geocode.js";

export const geoRouter = Router();

geoRouter.post("/geocode", async (req, res, next) => {
  try {
    res.json(await geocodeAddress(req.body?.query));
  } catch (error) {
    next(error);
  }
});

geoRouter.post("/reverse-geocode", async (req, res, next) => {
  try {
    res.json(await reverseGeocode(req.body?.lat, req.body?.lng));
  } catch (error) {
    next(error);
  }
});
