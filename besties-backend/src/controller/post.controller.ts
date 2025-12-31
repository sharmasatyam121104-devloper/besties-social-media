import { SessionInterface } from "../middleware/auth.middleware"
import PostModel from "../model/post.model"
import { Response } from "express"
import { catchError } from "../util/errorHandler"
import AuthModel from "../model/auth.model"
import FriendModel from "../model/friend.model"
import LikeModel from "../model/like.model"
import DislikeModel from "../model/dislike.model"
import CommentModel from "../model/comments.model"

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

export const fetchPosts = async (req: SessionInterface, res: Response) => {
    try {
        const userId = req.session!.id;

        const posts = await PostModel.find()
            .sort({ createdAt: -1 })
            .populate('user', 'fullname image email');

        const postIds = posts.map(post => post._id);

        const likes = await LikeModel.find({
            user: userId,
            post: { $in: postIds }
        });

        const dislikes = await DislikeModel.find({
            user: userId,
            post: { $in: postIds }
        });

        const likedSet = new Set(likes.map(l => l.post.toString()));
        const dislikedSet = new Set(dislikes.map(d => d.post.toString()));

        const finalPosts = posts.map(post => ({
            ...post.toObject(),
            isLiked: likedSet.has(post._id.toString()),
            isDisliked: dislikedSet.has(post._id.toString())
        }));

        res.json(finalPosts);
    } catch (err) {
        catchError(err, res, "Failed to fetch post");
    }
};


export const fetchMyPosts = async (req: SessionInterface, res: Response) => {
  try {
    const userId = req.session?.id;

    const posts = await PostModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "fullname image email");

    res.json({posts});
  } catch (err) {
    catchError(err, res, "Failed to fetch my posts");
  }
};

export const fetchMyProfile = async (req: SessionInterface, res: Response) => {
  try {
    const userId = req.session?.id;

    const posts = await PostModel.find({ user: userId })
      .sort({ createdAt: -1 })
    const user = await AuthModel.findById(userId).select("-password")
    const friendCount = await FriendModel.countDocuments({
                    status: "accepted",
                    $or: [
                      { user: userId },
                      { friend: userId }
                    ]
                  });

    res.json({posts,user,friendCount});
  } catch (err) {
    catchError(err, res, "Failed to fetch my posts");
  }
};

export const fetchOtherProfile = async (
  req: SessionInterface,
  res: Response
) => {
  try {
    const profileUserId = req.params.id;
    const currentUserId = req.session!.id;

    const posts = await PostModel.find({ user: profileUserId })
      .sort({ createdAt: -1 })
      .populate("user", "fullname image")
      .lean();

    const postIds = posts.map(p => p._id);

    // Find likes by current user
    const likes = await LikeModel.find({
      user: currentUserId,
      post: { $in: postIds }
    }).select("post");

    // Find dislikes by current user
    const dislikes = await DislikeModel.find({
      user: currentUserId,
      post: { $in: postIds }
    }).select("post");

    const likedSet = new Set(likes.map(l => l.post.toString()));
    const dislikedSet = new Set(dislikes.map(d => d.post.toString()));

    const finalPosts = posts.map(post => ({
      ...post,
      isLiked: likedSet.has(post._id.toString()),
      isDisliked: dislikedSet.has(post._id.toString())
    }));

    const user = await AuthModel.findById(profileUserId).select("-password");

    const friendCount = await FriendModel.countDocuments({
      status: "accepted",
      $or: [{ user: profileUserId }, { friend: profileUserId }]
    });

    res.json({
      posts: finalPosts,
      user,
      friendCount
    });
  } catch (err) {
    catchError(err, res, "Failed to fetch profile");
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

// ---------------- LIKE -------------------
export const addLike = async (req: SessionInterface, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.session!.id;

    // already liked
    const alreadyLiked = await LikeModel.findOne({ user: userId, post: postId });
    if (alreadyLiked)
      return res.status(400).json({ message: "Already liked" });

    // if user had disliked → remove dislike first
    const disliked = await DislikeModel.findOneAndDelete({
      user: userId,
      post: postId,
    });

    if (disliked) {
      await PostModel.findByIdAndUpdate(postId, {
        $inc: { dislikesCount: -1 },
      });
    }

    // add like
    await LikeModel.create({ user: userId, post: postId });
    await PostModel.findByIdAndUpdate(postId, {
      $inc: { likesCount: 1 },
    });

    res.status(200).json({
      message: "Liked",
      switchedFromDislike: !!disliked,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


export const removeLike = async (req: SessionInterface, res: Response) => {
  const { postId } = req.params;
  const like = await LikeModel.findOneAndDelete({
    user: req.session!.id,
    post: postId,
  });

  if (like) {
    await PostModel.findByIdAndUpdate(postId, {
      $inc: { likesCount: -1 },
    });
  }

  res.status(200).json({ message: "Like removed" });
};


// ---------------- DISLIKE -------------------
export const addDislike = async (req: SessionInterface, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.session!.id;

    // already disliked
    const alreadyDisliked = await DislikeModel.findOne({
      user: userId,
      post: postId,
    });
    if (alreadyDisliked)
      return res.status(400).json({ message: "Already disliked" });

    // if user had liked → remove like first
    const liked = await LikeModel.findOneAndDelete({
      user: userId,
      post: postId,
    });

    if (liked) {
      await PostModel.findByIdAndUpdate(postId, {
        $inc: { likesCount: -1 },
      });
    }

    // add dislike
    await DislikeModel.create({ user: userId, post: postId });
    await PostModel.findByIdAndUpdate(postId, {
      $inc: { dislikesCount: 1 },
    });

    res.status(200).json({
      message: "Disliked",
      switchedFromLike: !!liked,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const removeDislike = async (req: SessionInterface, res: Response) => {
  const { postId } = req.params;

  const dislike = await DislikeModel.findOneAndDelete({
    user: req.session!.id,
    post: postId,
  });

  if (dislike) {
    await PostModel.findByIdAndUpdate(postId, {
      $inc: { dislikesCount: -1 },
    });
  }

  res.status(200).json({ message: "Dislike removed" });
};


// ---------------- COMMENT -------------------
export const addComment = async (req: SessionInterface, res: Response) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        const comment = await CommentModel.create({ user: req.session!.id, post: postId, content });
        await PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

        res.status(201).json(comment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const removeComment = async (req: SessionInterface, res: Response) => {
    try {
        const { commentId, postId } = req.params;

        const comment = await CommentModel.findByIdAndDelete(commentId);
        if (!comment) return res.status(400).json({ message: "Comment not found" });

        await PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });
        res.status(200).json({ message: "Comment removed" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};