import { Response } from "express"

interface ErrorMessage extends Error{
    status?: number
 }

export const tryError = (message:string , status:number)=>{
    const error: ErrorMessage = new Error(message)
    error.status = status 
    return error
}

export const catchError = (error: unknown, res: Response, prodMessage: string ="Internal Server Error" )=>{
    if(error instanceof Error){
        const message = (process.env.NODE_ENV === "dev" ? error.message : prodMessage)
            const status = (error as ErrorMessage).status || 500
            res.status(status).json({message})
        }
}