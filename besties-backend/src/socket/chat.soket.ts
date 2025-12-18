import { Server } from "socket.io"
import { createChat } from "../controller/chat.controller"

const ChatSocket = (io: Server)=>{
    io.on("connection", (socket)=>{
        socket.on("message", (paylod)=>{
            createChat({
                ...paylod,
                from: paylod.from.id,
            })
            io.to(paylod.to).emit("message", {
                from: paylod.from,
                message: paylod.message,
            }
            )
        })
    })
}

export default ChatSocket

