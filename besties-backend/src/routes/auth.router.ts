import { Router } from "express"
import { forgotPassword, getSession, login, signup } from "../controller/auth.controller"
const AuthRouter = Router()

AuthRouter.post("/signup",signup)
AuthRouter.post('/login',login)
AuthRouter.post('/forgot-password',forgotPassword)
AuthRouter.get('/session', getSession)

export default AuthRouter