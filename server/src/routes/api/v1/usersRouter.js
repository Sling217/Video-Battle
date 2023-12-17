import express from "express";
import passport from "passport";
import { User } from "../../../models/index.js";

const usersRouter = new express.Router();

usersRouter.post("/", async (req, res) => {
  const { email, password, passwordConfirmation, username } = req.body;
  try {
    const role = "guest"
    const persistedUser = await User.query().insertAndFetch({ email, username, password, role });
    return req.login(persistedUser, () => {
      return res.status(201).json({ user: persistedUser });
    });
  } catch (error) {
    console.log(error);
    return res.status(422).json({ errors: error.data });
  }
});

export default usersRouter;
