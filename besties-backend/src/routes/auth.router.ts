import { Router } from "express"
import { forgotPassword, getSession, login, signup, upadteProfile } from "../controller/auth.controller"
import { AuthMiddleware } from "../middleware/auth.middleware"
const AuthRouter = Router()

AuthRouter.post("/signup",signup)
AuthRouter.post('/login',login)
AuthRouter.post('/forgot-password',forgotPassword)
AuthRouter.get('/session', getSession)
AuthRouter.put('/profile-picture', AuthMiddleware, upadteProfile)

export default AuthRouter