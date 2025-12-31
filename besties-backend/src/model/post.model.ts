import mongoose, {model, Schema} from 'mongoose'

const postSchema = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    attachment: {
        type: String,
        default: null
    },
    type: {
        type: String,
        default: null
    },
    content: {
        type: String,
        required: true
    },
    likesCount: { 
        type: Number,
         default: 0 
    },
    dislikesCount: { 
        type: Number, default: 0
    },
    commentsCount: { 
        type: Number, default: 0 
    }
}, {timestamps: true})

const PostModel = model('Post', postSchema)
export default PostModel