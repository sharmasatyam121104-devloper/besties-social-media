import { Response } from "express"
import { SessionInterface } from "../middleware/auth.middleware"
import ChatModel from "../model/chat.model"
import { catchError, tryError } from "../util/errorHandler"
import { downlodObject } from "../util/s3"

interface payloadInterface {
    from: string
    to: string
    message: string
    file?: {
        path: string
        type: string
    }
}

export const createChat = async (payload: payloadInterface) => {
  try {
    if (!payload.message && !payload.file) {
      throw new Error("Message or file is required");
    }

    await ChatModel.create({
      ...payload,
      message: payload.message || "", // file-only chat safe
    });
  } catch (error) {
    console.error("Create chat failed:", error);
  }
};


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
        .populate("from","fullname email  mobile image createdAt")
        .lean()

        const modifiedChat = await Promise.all(
                    chats.map(async (item) => {
                        if (item.file?.path) {
                        let filePath = null;

                        try {
                            filePath = await downlodObject(item.file.path);
                        } catch (err) {
                           
                        }

                        return {
                            ...item,
                            file: {
                            path: filePath,
                            type: item.file.type,
                            },
                        };
                        }

                        return item;
                    })
                    );

        res.json(modifiedChat)
    } 
    catch (error) {
       catchError(error, res , "Filed to fetch chats.") 
    }
}