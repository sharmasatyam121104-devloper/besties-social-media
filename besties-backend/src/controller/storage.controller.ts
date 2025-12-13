import { Request, Response } from "express"
import { catchError, tryError } from "../util/errorHandler"
import { downlodObject, uploadObject } from "../util/s3"




export const downloadFile = async(req:Request, res:Response)=>{
    try {
        const path = req.body?.path
        
        if(!path ){
            throw tryError("Failed to genrate download url because path is missing",400)
        }
        
        const url = await downlodObject(path)
        res.json({url})
        
    } 
    catch (error) {
        catchError(error,res, "Faild to genrate download url")
    }
}

export const uploadFile = async(req:Request, res:Response)=>{
    try {
        const path = req.body?.path
        const type = req.body?.type
        const status = req.body?.status

        if(!path || !type || !status){
            throw tryError("Invalid Request path or type are required", 400)
        }

        const url = await uploadObject(path, type, status)
        res.json({url})
    } 
    catch (error) {
        catchError(error,res, "Faild to genrate upload url")
    }
}