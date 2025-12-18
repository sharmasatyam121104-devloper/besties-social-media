import { Response } from "express"
import { SessionInterface } from "../middleware/auth.middleware"
import ChatModel from "../model/chat.model"
import { catchError, tryError } from "../util/errorHandler"

interface payloadInterface {
    from: string
    to: string
    message: string
    file?: {
        path: string
        type: string
    }
}

export const createChat = (payload: payloadInterface)=>{
    ChatModel.create(payload)
    .catch((error)=>{
        console.log(error);
    })
}

export const fetchChats =  async(req: SessionInterface, res: Response)=>{
    try {
        if(!req.session){
            throw tryError("failed to fetch chats",500)
        }
        const chats = await ChatModel.find({
            $or : [
                {from: req.session.id, to : req.params.to},
                {from: req.params.to, to :req.session.id },
            ]
        })
        .populate("from","fullname email  mobile image")
        res.json(chats)
    } 
    catch (error) {
       catchError(error, res , "Filed to fetch chats.") 
    }
}