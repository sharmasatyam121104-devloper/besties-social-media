import { Request, Response } from 'express'
import twilio from 'twilio'
import { catchError, tryError } from '../util/errorHandler'

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

export const getTurnServer = async(req:Request , res: Response)=>{
    try {
        const { iceServers } = await client.tokens.create()

        if(!iceServers) {
            throw tryError("IceServers not found", 404)
        }

        res.json(iceServers)
    } 
    catch (error) {
        catchError(error, res, "Failed to genrate truns server")
    }
}