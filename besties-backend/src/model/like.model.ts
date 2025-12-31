import mongoose, { Schema, model } from 'mongoose';

const likeSchema = new Schema({
    user: { 
        type: mongoose.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    post: { 
        type: mongoose.Types.ObjectId,
        ref: 'Post',
        required: true 
    }
}, { timestamps: true });

const LikeModel = model('Like', likeSchema);
export default LikeModel;
