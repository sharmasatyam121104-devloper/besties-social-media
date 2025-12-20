import { NextFunction, Request, Response } from "express";
import { catchError, tryError } from "../util/errorHandler";
import AuthModel from "../model/auth.model";
import moment from "moment";
import { SessionInterface } from "./auth.middleware";

const RefreshToken  = async(req: SessionInterface,res: Response, next:NextFunction)=>{
    try {
        const refreshToken = req.cookies.refreshToken

        if(!refreshToken){
            throw tryError( "Failed to refersh token",401)
        }

        const user = await AuthModel.findOne({refreshToken})

        if(!user){
            throw tryError( "Failed to refersh token",401)
        }

        const today = moment()
        const expiry = moment(user.expiry)

        const isExpired = today.isAfter(expiry)

        if(isExpired){
            throw tryError( "Failed to refersh token",401)
        }

        req.session = {
            id: user._id,
            email: user.email,
            mobile: user.mobile,
            fullname: user.fullname,
            image: user.image
        }
        next()


    } catch (error) {
        catchError(error, res, "Failed to refersh token")
    }
}

export default RefreshToken