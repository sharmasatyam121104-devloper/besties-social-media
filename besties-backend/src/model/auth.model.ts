import { Schema, model } from "mongoose"
import bcrypt from 'bcrypt'

const authSchema = new Schema({
    image: {
        type: String,
        default: null,
    },
    fullname: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
},{timestamps: true})

authSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password.toString(), 12)
    next
})

const AuthModel = model("Auth", authSchema)
export default AuthModel