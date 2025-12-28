import { Router } from "express";
import { createPost, deletePost, fetchMyPosts, fetchPosts } from "../controller/post.controller";
const PostRouter = Router()

PostRouter.post('/', createPost)
PostRouter.get('/', fetchPosts)
PostRouter.get('/my-post', fetchMyPosts)
PostRouter.delete('/delete-post/:id', deletePost)


export default PostRouter