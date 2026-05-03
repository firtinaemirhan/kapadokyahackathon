import { Router } from "express";
import { getUser, loginUser, signupUser, updateUser } from "../services/users.js";

export const usersRouter = Router();

usersRouter.post("/signup", async (req, res, next) => {
  try {
    res.status(201).json(await signupUser(req.body ?? {}));
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    res.json(await loginUser(req.body ?? {}));
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await getUser(req.params.id));
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:id", async (req, res, next) => {
  try {
    res.json(await updateUser(req.params.id, req.body ?? {}));
  } catch (error) {
    next(error);
  }
});
