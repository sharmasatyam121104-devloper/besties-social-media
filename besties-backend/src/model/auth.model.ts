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
    refreshToken: {
        type: String,
    },
    expiry: {
        type: Date
    },
    bio: {
        type: String,
        default: "" 
    }
},{timestamps: true})

authSchema.pre('save', async function(next) {
    const count = await model("Auth").countDocuments({mobile: this.mobile})

    // Checking duplicate mobile
    if(count > 0)
        throw (new Error("Mobile number already exist"))

    next
})

authSchema.pre("save",async function(next){
    const count = await model("Auth").countDocuments({email:this.email})

    //checking duplicate email
    if (count>0) {
        throw (new Error("Email is already registerd"))
    }
    next
})

authSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password.toString(), 12)
    next
})


authSchema.pre('save', async function(next){
    this.refreshToken = null
    this.expiry = null
    next
})

const AuthModel = model("Auth", authSchema)
export default AuthModel