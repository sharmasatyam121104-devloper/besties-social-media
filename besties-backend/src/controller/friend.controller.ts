import { Response } from "express";
import { catchError, tryError } from "../util/errorHandler";
import { SessionInterface } from "../middleware/auth.middleware";
import FriendModel from "../model/friend.model";
import AuthModel from "../model/auth.model";
import mongoose from "mongoose";
import { read } from "fs";

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

        const friends = await FriendModel.find({
          $or: [
            //  current user sender hai (status kuch bhi)
            { user: user.id },

            //  current user receiver hai + accepted
            { friend: user.id, status: "accepted" }
          ]
        })
        .populate('friend', 'fullname email image')
        .populate('user', 'fullname email image')

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
          image: 1,
          createdAt: 1,
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

export const deleteFriend = async(req: SessionInterface, res: Response)=>{
    try {
        const user = req.session
        const friendId = req?.body.friendId

        if(!user) {
            throw tryError("User not found",404)
        }

        if(!friendId) {
            throw tryError("User not found",404)
        }

        const result = await FriendModel.deleteOne({
          $or: [
            { user: user.id, friend: friendId },
            { user: friendId, friend: user.id }
          ]
        })

        if (result.deletedCount === 0) {
          return res.status(404).json({
            message: "Friend record not found"
          })
        }

        return res.json({
          message: "Unfriend or Deletefriend successful"
        })

    } 
    catch (error) {
        catchError(error,res,"Failed to add friend.")
    }
}

export const friendRequests = async(req: SessionInterface, res: Response)=>{
    try {
        const user = req.session

        if(!user) {
            throw tryError("User not found",404)
        }

         const friends = await FriendModel.find({
          friend: user.id,
          status: "requested"
        })
        .populate('user', 'fullname email image')


        res.json({friends})

    } 
    catch (error) {
        catchError(error,res,"Failed to fetch friend request.")
    }
}

export const acceptFriendRequest = async(req: SessionInterface, res: Response)=>{
    try {
        const user = req.session
        const friendId = req?.body.friendId

        if(!user) {
            throw tryError("User not found",404)
        }

        if(!friendId) {
            throw tryError("User not found",404)
        }

        const result = await FriendModel.updateOne(
          {
            user: friendId,        //  sender
            friend: user.id,       //  receiver (logged in user)
            status: "requested"
          },
          {
            $set: { status: "accepted" }
          }
        )

        if (result.matchedCount === 0) {
          return res.status(404).json({
            message: "Friend request not found"
          })
        }

        return res.json({
          message: "Friend request accepted successful"
        })

    } 
    catch (error) {
        catchError(error,res,"Failed to accepte friend request.")
    }
}