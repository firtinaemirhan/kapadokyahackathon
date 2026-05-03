import { Router } from "express";
import { createContactRequest, listContactRequestsByEmail } from "../services/contact-requests.js";

export const contactRequestsRouter = Router();

contactRequestsRouter.get("/", async (req, res, next) => {
  try {
    const email = String(req.query.buyerEmail ?? "").trim();
    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Geçerli bir buyerEmail sorgu parametresi gerekli." });
      return;
    }
    res.json(await listContactRequestsByEmail(email));
  } catch (error) {
    next(error);
  }
});

contactRequestsRouter.post("/", async (req, res, next) => {
  try {
    res.status(201).json(await createContactRequest(req.body ?? {}));
  } catch (error) {
    next(error);
  }
});
