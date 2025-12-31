import { Router } from "express";
import { createPost, deletePost, fetchMyPosts, fetchMyProfile, fetchOtherProfile, fetchPosts } from "../controller/post.controller";
const PostRouter = Router()

PostRouter.post('/', createPost)
PostRouter.get('/', fetchPosts)
PostRouter.get('/my-post', fetchMyPosts)
PostRouter.get('/my-profile', fetchMyProfile)
PostRouter.get('/other-profile/:id',fetchOtherProfile)
PostRouter.delete('/delete-post/:id', deletePost)


export default PostRouter