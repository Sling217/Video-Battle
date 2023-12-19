import express from "express";
import userSessionsRouter from "./api/v1/userSessionsRouter.js";
import usersRouter from "./api/v1/usersRouter.js";
import clientRouter from "./clientRouter.js";
import videoLinksRouter from "./api/v1/videoLinksRouter.js";
import chatRouter from "./api/v1/chatRouter.js";
import listUsersRouter from "./api/v1/listUsersRouter.js";

const rootRouter = new express.Router();
rootRouter.use("/", clientRouter);
rootRouter.use("/api/v1/user-sessions", userSessionsRouter);
rootRouter.use("/api/v1/users", usersRouter);
rootRouter.use("/api/v1/videoLinks", videoLinksRouter);
rootRouter.use("/api/v1/chats", chatRouter);
rootRouter.use("/api/v1/listUsers", listUsersRouter)

export default rootRouter;