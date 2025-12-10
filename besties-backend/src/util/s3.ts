import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { tryError } from "./errorHandler"
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
    } 
    catch (error) {
        return false
    }
}

export const downlodObject = async(path:string)=>{
    const isexists = await isFileExists(path)

        if(!isexists) {
            throw tryError("File dosen't Exists",404)
        }

        const command = new GetObjectCommand({
            Bucket:process.env.S3_BUCKET,
            Key: path,
        })
        const url = await getSignedUrl(conn, command, {expiresIn: 60} )
        return url
}

export const uploadObject = async(path:string , type: string)=>{
    const command = new PutObjectCommand({
            Bucket:process.env.S3_BUCKET,
            Key: path,
            ContentType: type
        })

        const url = await getSignedUrl(conn, command, {expiresIn: 60})
        return url
}