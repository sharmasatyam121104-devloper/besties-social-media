import { Server } from "socket.io"

const VideoSocket = (io: Server)=>{
    io.on("connection", (socket)=>{
       socket.on("offer", ({offer, to})=>{
            io.to(to).emit("offer", {offer , from: socket.id})
       })

       socket.on("candidate",({candidate, to})=>{
        io.to(to).emit("candidate",{candidate, from: socket.id})
       })

       socket.on("answer",({answer, to})=>{
        io.to(to).emit("answer",{answer, from: socket.id})
       })

       socket.on("end",({to})=>{
        io.to(to).emit("end",{from: socket.id})
       })
    })
}

export default VideoSocket