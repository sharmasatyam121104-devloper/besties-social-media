import { Server } from "socket.io"
import * as cookie from "cookie"
import jwt, { JwtPayload } from 'jsonwebtoken'

const onlineUser = new Map()

const StatusSocket = (io: Server) => {
  io.on("connection", (socket) => {

    try {
      const rawCookies = socket.handshake.headers.cookie || ""
      const cookies = cookie.parse(rawCookies)
      const accessToken = cookies.accessToken

      if(!accessToken){
        throw new Error("Access Token not found.")
      }
      
      const user = jwt.verify(accessToken, process.env.AUTH_SECRET!) as JwtPayload

      // Track online users
      onlineUser.set(socket.id, user)
      socket.join(user.id)

      io.emit("online", Array.from(onlineUser.values()))

      // If a client wants online list
      socket.on("get-online", () => {
        io.emit("online", Array.from(onlineUser.values()))
      })

      // disconnect
      socket.on("disconnect", () => {
        onlineUser.delete(socket.id)
        io.emit("online", Array.from(onlineUser.values()))
      })
    } 
    catch (error) {
      if(error instanceof Error) {
        socket.disconnect()
      }
      
    }
  })
}

export default StatusSocket
