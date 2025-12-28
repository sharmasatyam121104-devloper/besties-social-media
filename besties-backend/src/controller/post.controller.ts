import { SessionInterface } from "../middleware/auth.middleware"
import PostModel from "../model/post.model"
import { Response } from "express"
import { catchError } from "../util/errorHandler"

export const createPost = async (req: SessionInterface, res: Response)=>{
    try {
        req.body.user = req.session?.id
        const post = await PostModel.create(req.body)
        
        res.json(post)
    }
    catch(err)
    {
        catchError(err, res, "Failed to create post")
    }
}

export const fetchPosts = async (req: SessionInterface, res: Response)=>{
    try {
        const posts = await PostModel.find().sort({createdAt: -1})
        .populate('user', 'fullname image email')
        res.json(posts)
    }
    catch(err)
    {
        catchError(err, res, "Failed to fetch post")
    }
}

export const fetchMyPosts = async (req: SessionInterface, res: Response) => {
  try {
    const userId = req.session?.id;

    const posts = await PostModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "fullname image email");

    res.json(posts);
  } catch (err) {
    catchError(err, res, "Failed to fetch my posts");
  }
};

export const deletePost = async (req: SessionInterface, res: Response) => {
  try {
    const userId = req.session?.id;
    const postId = req.params.id;

    if(!userId){
         return res.status(404).json({ message: "PostId not found" });
    }

    if(!postId){
        return res.status(404).json({ message: "PostId not found" });
    }

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

     // Convert ObjectId to string for comparison
    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized delete attempt" });
    }
    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    catchError(err, res, "Failed to delete post");
  }
};