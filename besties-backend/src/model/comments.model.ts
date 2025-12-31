import mongoose, { Schema, model } from 'mongoose';

const commentSchema = new Schema({
    user: { 
        type: mongoose.Types.ObjectId,
        ref: 'Auth',
        required: true 
    },
    post: { 
        type: mongoose.Types.ObjectId,
        ref: 'Post', 
        required: true 
    },
    content: { 
        type: String,
        required: true 
    }
}, { timestamps: true });

const CommentModel = model('Comment', commentSchema);
export default CommentModel;
