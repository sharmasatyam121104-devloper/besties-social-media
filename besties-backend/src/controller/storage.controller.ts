import { Request, Response } from "express"
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { catchError, tryError } from "../util/errorHandler"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const conn = new S3Client({
    region: process.env.REGION,
    endpoint: `https://s3-${process.env.REGION}.amazonaws.com`,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS!,
    }
})

const isFileExists = async(path: string)=>{
    try {
        const command = new HeadObjectCommand({
            Bucket:process.env.S3_BUCKET,
            Key: path,
        })
        await conn.send(command)
        return true
    } catch (error) 
    {
        return false
    }
}

export const downloadFile = async(req:Request, res:Response)=>{
    try {
        const path = req.body?.path
        
        if(!path ){
            throw tryError("Failed to genrate download url because path is missing",400)
        }

        const isexists = await isFileExists(path)

        if(!isexists) {
            throw tryError("File dosen't Exists",404)
        }

        const command = new GetObjectCommand({
            Bucket:process.env.S3_BUCKET,
            Key: path,
        })
        const url = await getSignedUrl(conn, command, {expiresIn: 60} )
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

        if(!path || !type){
            throw tryError("Invalid Request path or type are required", 400)
        }
        
        const command = new PutObjectCommand({
            Bucket:process.env.S3_BUCKET,
            Key: path,
            ContentType: type
        })

        const url = await getSignedUrl(conn, command, {expiresIn: 60})
        res.json({url})
    } 
    catch (error) {
        catchError(error,res, "Faild to genrate upload url")
    }
}