import { Router } from "express";
import { fetchChats } from "../controller/chat.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const ChatRouter = Router()

ChatRouter.get("/:to", AuthMiddleware, fetchChats)

export default ChatRouter