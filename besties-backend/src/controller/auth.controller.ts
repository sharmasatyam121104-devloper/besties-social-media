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
const sevenDaysInMs = (7 * 24 * 60 * 60 * 1000)
 
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
            samesite: 'none',
            domain: process.env.NODE_ENv === "dev" ? "localhost" : process.env.CLIENT!.split("//").pop()
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
            image: user?.image,
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

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken
    if (!token) {
      throw tryError("No refresh token", 401)
    }

    // DB me refresh token check karo
    const user = await AuthModel.findOne({ refreshToken: token })
    if (!user) {
      throw tryError("Invalid refresh token", 401)
    }

    // Naya access token banao
    const payload = {
      id: user._id,
      fullname: user.fullname,
      mobile: user.mobile,
      email: user.email,
      image: user.image,
    }

    const accessToken = jwt.sign(payload, process.env.AUTH_SECRET!, { expiresIn: accessTokenExpiry })
    const newRefreshToken = uuid()

    await AuthModel.updateOne(
      { _id: user._id },
      { $set: { refreshToken: newRefreshToken, expiry: moment().add(7, "days").toDate() } }
    )

    res.cookie("accessToken", accessToken, getOptions("at"))
    res.cookie("refreshToken", newRefreshToken, getOptions("rt"))
    res.json({ message: "Token refreshed" })
  } catch (error) {
    catchError(error, res, "Failed to refresh token.")
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
        const path = `${process.env.S3_URL}/${req.body?.path}`

        if(!path || !req.session){
            throw tryError("Failed to upadte profile picture",400)
        }

        await AuthModel.updateOne({_id: req.session?.id},{$set: {image: path}})
        res.json({image: path})
    } 
    catch (error) {
        catchError(error,res, "Failed to update Profile picture.")
    }
}

export const upadteProfileData = async(req: SessionInterface, res: Response)=>{
    try {

        if (!req.session?.id) {
            throw tryError("Unauthorized", 401)
        }
        const { fullname, bio, path } = req.body
        
        const updateData: any = {}

        if (path) {
            updateData.image = `${process.env.S3_URL}/${path}`
        }

        if (fullname) {
            updateData.fullname = fullname
        }

        if (bio) {
            updateData.bio = bio
        }

        if (Object.keys(updateData).length === 0) {
            throw tryError(
                "At least one field (image, fullname, bio) is required",
                400
            )
        }

        const user = await AuthModel.findByIdAndUpdate(
            req.session.id,
            { $set: updateData },
            { new: true }
            )

            res.json({
                message: "Profile updated successfully",
                updatedFields: updateData,
                user
            })
        } 
    catch (error) {
        catchError(error,res, "Failed to update Profile .")
    }
}

export const logout = async(req: Request, res: Response)=>{
    try {
        const options = {
            httpOnly: true,
            maxAge: 0,
            secure: false,
            domain: 'localhost'
        }
       res.clearCookie("accessToken", options)
       res.clearCookie("refreshToken", options)
       res.json({message: "Logout success"})
    } 
    catch (error) {
        catchError(error,res, "Failed to logout.")
    }
}


export const changePassword = async ( req: SessionInterface, res: Response ) => {
  try {
    const userId = req.session?.id
    const { currentPassword, newPassword, confirmPassword } = req.body

    //  Validate input 
    if (!currentPassword || !newPassword || !confirmPassword) {
        throw tryError("All password fields are required",400)
    }

    if (newPassword !== confirmPassword) {
        throw tryError("New password and confirm password do not match",400)
    }

    if (currentPassword === newPassword) {
        throw tryError("New password must be different from current password",400)
    }

    // Find user 
    const user = await AuthModel.findById(userId)
    if (!user) {
        throw tryError("User not found",404)
    }

    //  Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!isMatch) {
        throw tryError("Current password is incorrect",401)
    }

    //  Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password 
    await AuthModel.updateOne(
        { _id: userId },
        { $set: { password: hashedPassword } }
    )

    //  Success response 
    return res.status(200).json({
      message: "Password updated successfully"
    })

  } 
  catch (error) {
    catchError(error,res,"Failed to change password. Please try again later.")
  }
}
