import { Response } from "express";
import { catchError, tryError } from "../util/errorHandler";
import { SessionInterface } from "../middleware/auth.middleware";
import FriendModel from "../model/friend.model";
import AuthModel from "../model/auth.model";
import mongoose from "mongoose";

export const addFriend = async(req: SessionInterface, res: Response)=>{
    try {
        const user = req.session

        if(!user) {
            throw tryError("User not found",404)
        }

        const friendId = req.body.friend

        if (!friendId) {
            throw tryError("Friend id is required", 400)
        }

        if (friendId === user.id.toString()) {
            throw tryError("You cannot add yourself", 400)
        }

        const friendUser = await AuthModel.findById(friendId)

        if (!friendUser) {
            throw tryError("Friend user not found", 404)
        }

        const request = await FriendModel.create({
            user: user.id,        
            friend: friendId,
        });

        res.json({
            message: "Friend request sent",
            request
        })

    } 
    catch (error) {
        catchError(error,res,"Failed to add friend.")
    }
}

export const fetchFriend = async(req: SessionInterface, res: Response)=>{
    try {
        const user = req.session

        if(!user) {
            throw tryError("User not found",404)
        }

        const friends = await FriendModel.find({user: user.id})

        res.json({
            message: "Fetch all friend.",
            friends
        })

    } 
    catch (error) {
        catchError(error,res,"Failed to add friend.")
    }
}

export const friendSuggestion = async (req: SessionInterface, res: Response) => {
  try {
    const user = req.session;

    if (!user) {
      throw tryError("User not found", 404);
    }

    // Fetch relations
    const relations = await FriendModel.find({
      $or: [
        { user: user.id },
        { friend: user.id }
      ]
    })

    //Extract user IDs to exclude
    const relatedUserIds = relations.flatMap(r => [
      r.user.toString(),
      r.friend.toString(),
    ])

    //exclude current user
    relatedUserIds.push(user.id.toString())

    // Fetch non-related users
    const suggestions = await AuthModel.aggregate([
      {
        $match: {
          _id: { $nin: relatedUserIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      { $sample: { size: 5 } },
      {
        $project: {
          fullname: 1,
          email: 1,
          image: 1
        }
      }
    ]);

    res.json({
      message: "Friend suggestions fetched.",
      suggestions
    });

  } catch (error) {
    catchError(error, res, "Failed to fetch friend suggestions.");
  }
}