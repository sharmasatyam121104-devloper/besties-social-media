import { Router } from "express"
import { changePassword, getSession, login, logout, refreshToken, signup, upadteProfile, upadteProfileData } from "../controller/auth.controller"
import { AuthMiddleware } from "../middleware/auth.middleware"
import RefreshToken from "../middleware/refresh.middleware"
const AuthRouter = Router()

AuthRouter.post("/signup",signup)
AuthRouter.post('/login',login)
AuthRouter.post('/logout',logout)
AuthRouter.get('/refresh-token', RefreshToken, refreshToken)
AuthRouter.get('/session',AuthMiddleware, getSession)
AuthRouter.put('/profile-picture', AuthMiddleware, upadteProfile)
AuthRouter.put('/profile-data', AuthMiddleware, upadteProfileData)
AuthRouter.put("/change-password", AuthMiddleware, changePassword)




export default AuthRouter