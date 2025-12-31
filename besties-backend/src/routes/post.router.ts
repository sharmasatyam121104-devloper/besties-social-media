import { Router } from "express";
import { addComment, addDislike, addLike, createPost, deletePost, fetchMyPosts, fetchMyProfile, fetchOtherProfile, fetchPosts, removeComment, removeDislike, removeLike } from "../controller/post.controller";
const PostRouter = Router()

PostRouter.get('/', fetchPosts)
PostRouter.get('/my-post', fetchMyPosts)
PostRouter.post('/', createPost)
PostRouter.get('/my-profile', fetchMyProfile)
PostRouter.get('/other-profile/:id',fetchOtherProfile)
PostRouter.delete('/delete-post/:id', deletePost)

// Likes
PostRouter.post('/like/:postId',  addLike);
PostRouter.delete('/like/:postId',  removeLike);

// Dislikes
PostRouter.post('/dislike/:postId', addDislike);
PostRouter.delete('/dislike/:postId', removeDislike);

// Comments
PostRouter.post('/comment/:postId', addComment);
PostRouter.delete('/comment/:postId/:commentId', removeComment);


export default PostRouter