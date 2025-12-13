import { Router } from "express"
import { addFriend, fetchFriend, friendSuggestion } from "../controller/friend.controller"

const FriendRouter = Router()

FriendRouter.post('/add-friend',addFriend)
FriendRouter.get('/fetch-friend',fetchFriend)
FriendRouter.get('/friend-suggestion',friendSuggestion)

export default  FriendRouter