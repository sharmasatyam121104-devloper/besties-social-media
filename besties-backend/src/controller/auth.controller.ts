import { Request, Response } from "express"
import AuthModel from "../model/auth.model"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import { catchError, tryError } from "../util/errorHandler"
import { payloadIterface } from "../middleware/auth.middleware"


const accessTokenExpiry = "10m"


 
const genrateToken = (payload: payloadIterface)=>{
    const accessToken = jwt.sign(payload, process.env.AUTH_SECRET!, {expiresIn: accessTokenExpiry})
    return accessToken
}

export const signup = async (req: Request, res: Response)=>{
    try {
        await AuthModel.create(req.body)
        res.json({message: "signup success"})
    } 
    catch (error: unknown) 
    {
       catchError(error,res)
    }
}

export const login = async (req: Request, res: Response)=>{
    try {
        const {email , password} = req.body
        const user = await AuthModel.findOne({email})
        
        if(!user){
            throw tryError("User not found. Please sign up before proceeding.",404) 
        }

        const isLogin = await bcrypt.compare(password, user.password)

        if(!isLogin){
            throw tryError("Invalid credentials. Please check your email or password and try again.",401)
        }

        const payload ={
            id: user._id,
            fullname: user.fullname,
            mobile: user.mobile,
            email: user.email,
        }
        const options = {
            httpOnly: true,
            maxAge: (10*60)*1000,
            secure: false,
            domain: 'localhost'
        }
        const accessToken = genrateToken(payload)
        res.cookie("accessToken", accessToken, options)
        res.json({message: "Login success"})

    } catch (error: unknown) 
    {
        catchError(error,res,"Login failed please try sometime later.")
    }
}

export const forgotPassword = (req: Request, res: Response)=>{
    res.send("forgotPassword")
}

export const getSession = async(req: Request, res: Response)=>{
    try {
        const accessToken = req.cookies.accessToken
        
        if (!accessToken) {
            throw tryError("Invalid session",401)
        }

        const session = await jwt.verify(accessToken, process.env.AUTH_SECRET!)
        res.json(session)
    } catch (error) 
    {
        catchError(error,res,"Invalid session")
    }
}