// import { Server } from "socket.io"

// const VideoSocket = (io: Server)=>{
//     io.on("connection", (socket)=>{
        
//        socket.on("offer", ({offer, to, type, from})=>{
//             io.to(to).emit("offer", {offer ,to, from:{...from,socketId: socket.id}, type})
//        })

//        socket.on("candidate",({candidate, to})=>{
//         io.to(to).emit("candidate",{candidate, from: socket.id})
//        })

//        socket.on("answer",({answer, to})=>{
//         io.to(to).emit("answer",{answer, from: socket.id})
//        })

//        socket.on("end",({to})=>{
//         io.to(to).emit("end",{from: socket.id})
//        })
//     })
// }

// export default VideoSocket

// video.socket.ts
import { Server } from "socket.io"

const VideoSocket = (io: Server) => {
  io.on("connection", (socket) => {

    // 🔹 OFFER
    socket.on("offer", ({ offer, to, from, type }) => {
      // caller ki socket id inject
      from.socketId = socket.id

      io.to(to).emit("offer", {
        offer,
        from,        // user info + socketId
        type
      })
    })

    // 🔹 ICE CANDIDATE
    socket.on("candidate", ({ candidate, to }) => {
      io.to(to).emit("candidate", {
        candidate,
        from: socket.id
      })
    })

    // 🔹 ANSWER
    socket.on("answer", ({ answer, to }) => {
      io.to(to).emit("answer", {
        answer,
        from: socket.id
      })
    })

    // 🔹 END CALL (IMPORTANT)
    socket.on("end", ({ to }) => {
      io.to(to).emit("end", {
        from: socket.id
      })
    })

    socket.on("disconnect", () => {
      console.log("socket disconnected:", socket.id)
    })
  })
}

export default VideoSocket
