import { Server } from "socket.io"
import { createChat } from "../controller/chat.controller"
import { downlodObject } from "../util/s3"

const ChatSocket = (io: Server)=>{
    io.on("connection", (socket)=>{
        socket.on("message", (payload)=>{
            createChat({
                ...payload,
                from: payload.from.id,
            })
            io.to(payload.to).emit("message", {
                from: payload.from,
                message: payload.message,
            }
            )
        })

        socket.on("attachment", async(payload)=>{
            try {
                createChat({
                    ...payload,
                    from: payload.from.id,
                })
                io.to(payload.to).emit("attachment", {
                    ...payload,
                    message: payload.message,
                    file: {
                        path: await downlodObject(payload.file.path),
                        type: payload.file.type
                    }
                }
                )
            } catch (error) {
                console.log("Attachment socket error:", error);
            }
        })
    })
}

export default ChatSocket

