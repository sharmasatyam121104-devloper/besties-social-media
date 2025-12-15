import AuthApiDoc from "../swagger/auth.swagger"
import FriendApiDoc from "../swagger/friend.swagger"
import StorageApiDoc from "../swagger/storage.swagger"

const SwaggerConfig = {
    openapi: "3.0.0",
    info: {
        title: "Besties-backend official API",
        description: "All the public and private APIs listed here",
        version: "1.0.0",
        contact: {
            name: "Satyam Sharma",
            email: "sharma.satyam121104@gmail.com"
        }
    },
    servers: [
        { url: process.env.SERVER }
    ],
    paths: {
        ...AuthApiDoc,
        ...FriendApiDoc,
        ...StorageApiDoc
    }
}

export default SwaggerConfig
