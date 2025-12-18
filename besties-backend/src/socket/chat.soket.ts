import { Server } from "socket.io"

const ChatSocket = (io: Server)=>{
    io.on("connection", (socket)=>{
        socket.on("message", (paylod)=>{
            io.to(paylod.to).emit("message", {
                from: paylod.from,
                message: paylod.message,
            }
            )
        })
    })
}

export default ChatSocket

