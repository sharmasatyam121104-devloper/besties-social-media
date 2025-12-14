import { Router } from "express"
import { acceptFriendRequest, addFriend, deleteFriend, fetchFriend, friendRequests, friendSuggestion } from "../controller/friend.controller"

const FriendRouter = Router()

FriendRouter.post('/add-friend',addFriend)
FriendRouter.get('/fetch-friend',fetchFriend)
FriendRouter.get('/friend-suggestion',friendSuggestion)
FriendRouter.post('/delete-friend',deleteFriend)
FriendRouter.get('/friend-request',friendRequests)
FriendRouter.post('/accept-request',acceptFriendRequest)

export default  FriendRouter