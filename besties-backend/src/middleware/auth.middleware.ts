import { NextFunction, Request, Response,  } from "express";
import { catchError, tryError } from "../util/errorHandler";
import mongoose from "mongoose"
import  jwt, { JwtPayload } from "jsonwebtoken";

 export interface payloadIterface {
    id:mongoose.Types.ObjectId
    fullname: string
    email: string
    mobile: string
    image: string | null
}

export interface SessionInterface extends Request{
  session? : payloadIterface  
}

export const AuthMiddleware = async(req: SessionInterface, res:Response, next:NextFunction)=>{
    try {
        const accessToken = req.cookies?.accessToken

        if(!accessToken){
            throw tryError("Failed to authorize user",401)
        }

        const payload = await jwt.verify(accessToken, process.env.AUTH_SECRET!) as JwtPayload
        req.session = {
            id: payload.id,
            email: payload.email,
            mobile: payload.mobile,
            fullname: payload.fullname,
            image: payload.image
        }
        
        next()
    } catch (error) {
        catchError(error,res,"Invalid Session")
    }
}