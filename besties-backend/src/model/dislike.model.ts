import mongoose, { Schema, model } from 'mongoose';

const dislikeSchema = new Schema({
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

const DislikeModel = model('Dislike', dislikeSchema);
export default DislikeModel;
