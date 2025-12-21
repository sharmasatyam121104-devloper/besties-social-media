import { Server } from "socket.io"

const VideoSocket = (io: Server)=>{
    io.on("connection", (socket)=>{
       socket.on("offer", ({offer, to})=>{
            io.to(to).emit("offer", {offer , from: socket.id})
       })
    })
}

export default VideoSocket