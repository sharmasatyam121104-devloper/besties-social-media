import { Request, Response } from "express"
import AuthModel from "../model/auth.model"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import { catchError, tryError } from "../util/errorHandler"
import { payloadIterface, SessionInterface } from "../middleware/auth.middleware"
import { downlodObject } from "../util/s3"
import {v4 as uuid} from 'uuid'
import moment from "moment"


const accessTokenExpiry = "10m"
const tenMinutesInMs = ((10*60)*1000)
const sevenDaysInMs =  (7*24*60*60)
 
const genrateToken = (payload: payloadIterface)=>{
    const accessToken = jwt.sign(payload, process.env.AUTH_SECRET!, {expiresIn: accessTokenExpiry})
    const refreshToken = uuid()
    return {
        accessToken,
        refreshToken
    }
}

const getOptions = (tokenType: "at" | "rt")=>{
    return {
            httpOnly: true,
            maxAge: tokenType === "at" ? tenMinutesInMs : sevenDaysInMs,
            secure: false,
            domain: 'localhost'
        }
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
            image: (user.image ? await downlodObject(user.image) : null),
        }
        const {accessToken, refreshToken } = genrateToken(payload)
        await AuthModel.updateOne({_id: user._id}, {$set: {refreshToken, expiry:moment().add(7, 'days').toDate()}})

        
        res.cookie("accessToken", accessToken, getOptions('at'))
        res.cookie("refreshToken", refreshToken, getOptions('rt'))
        res.json({message: "Login success"})

    } catch (error: unknown) 
    {
        catchError(error,res,"Login failed please try sometime later.")
    }
}

export const refreshToken = async (req: SessionInterface, res: Response)=>{
    try {
        if(!req.session){
           throw tryError("Failed to refresh token",401)
        }
        req.session.image = (req.session.image ? await downlodObject(req.session.image) : null)
       const {accessToken,refreshToken} = genrateToken(req.session)
       await AuthModel.updateOne({_id: req.session.id},{$set: {
        refreshToken,
        expiry: moment().add(7,"days").toDate()
       }})

       res.cookie("accessToken", accessToken, getOptions('at'))
        res.cookie("refreshToken", refreshToken, getOptions('rt'))
        res.json({message: "Token refreshed"})
       
    } 
    catch (error) {
        catchError(error,res, "Failed to refresh token.")
    }
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


export const upadteProfile = async(req: SessionInterface, res: Response)=>{
    try {
        const path = req.body?.path

        if(!path || !req.session){
            throw tryError("Failed to upadte profile picture",400)
        }

        await AuthModel.updateOne({_id: req.session?.id},{$set: {image: path}})
        const url = await downlodObject(path)
        res.json({image: url})
    } 
    catch (error) {
        catchError(error,res, "Failed to update Profile picture.")
    }
}