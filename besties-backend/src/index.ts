import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
mongoose.connect(process.env.DB!)

import  express  from 'express'
import { createServer } from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { serve, setup } from 'swagger-ui-express'
import SwaggerConfig from './util/swagger'
import AuthRouter from './routes/auth.router'
import StorageRouter from './routes/storage.router'
import { AuthMiddleware } from './middleware/auth.middleware'
import FriendRouter from './routes/freind.router'
import { Server } from 'socket.io'
import StatusSocket from './socket/status.socket'
import corsConfig from './util/cors'
import ChatSocket from './socket/chat.soket'
import ChatRouter from './routes/chat.router'
import VideoSocket from './socket/video.socket'
import TwilioRouter from './routes/twilio.router'

const app = express()
const server = createServer(app)
server.listen(
    process.env.PORT || 8080, 
    ()=>console.log(`Server is running on ${process.env.PORT}`)
)

//Socket Connections
const io = new Server(server, { cors: corsConfig})
StatusSocket(io)
ChatSocket(io)
VideoSocket(io)

//Middleware
app.use(cors(corsConfig))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//Endpoint
app.use("/api-docs", serve, setup(SwaggerConfig))
app.use('/auth', AuthRouter)
app.use('/storage',AuthMiddleware, StorageRouter)
app.use('/friend', AuthMiddleware, FriendRouter)
app.use('/chat',ChatRouter)
app.use('/twilio', TwilioRouter)