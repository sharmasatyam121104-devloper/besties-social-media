import Avatar from '../shared/Avatar';
import { Link } from 'react-router-dom';
import Card from '../shared/Card';
import { useContext, useEffect, useState } from 'react';
import socket from '../../lib/socket';
import Context from '../../Context';
import { Empty, Skeleton } from 'antd';
import Error from '../shared/Error';
import useSWR from 'swr';
import Fetcher from '../../lib/Fetcher';

export interface OnlineUserInterface {
  id: string
  email: string
  fullname: string
  mobile: string
  image: string | null
  iat: number
  exp: number
}

interface FriendInfo {
  _id: string
  image: string | null
  fullname: string
  email: string
}

interface ItemInterface {
  _id: string
  user: FriendInfo
  friend: FriendInfo
  status: string
  createdAt: string
}


const OnlineFriends = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserInterface[]>([])
  const { session } = useContext(Context)
  const { data, error, isLoading } = useSWR("/friend/fetch-friend", Fetcher)

useEffect(() => {
  const handler = (users: OnlineUserInterface[]) => setOnlineUsers(users)

  socket.on("online", handler)
  socket.emit("get-online")

  // Cleanup: remove listener
  return () => {
    socket.off("online", handler)
  }
}, [])


  if (isLoading) return <Skeleton active />
  if (error) return <Error message={error.message} />

  // Extract accepted friend IDs
  const friendIds = new Set(
    (data?.friends as ItemInterface[])
      ?.filter((item) => item.status === "accepted")
      .map((item) =>
        item.user._id === session?.id ? item.friend._id : item.user._id
      )
  )


  // Deduplicate online users by id
  const uniqueOnlineUsers = onlineUsers.filter(
    (user, index, self) =>
      index === self.findIndex(u => u.id === user.id)
  )

  // Filter: only friends + not self
  const onlineFriends = uniqueOnlineUsers.filter(
    (user: OnlineUserInterface) =>
      user.id !== session?.id && friendIds.has(user.id)
  )

  return (
    <div className="overflow-y-auto md:h-full h-189">
      <Card title="Online Friends" divider noPadding={false}>
        <div className="space-y-5 ">
          {onlineFriends.length === 0 && (
            <Empty description="Looks like no friends are online right now" />
          )}
          {onlineFriends.map((item: OnlineUserInterface) => (
            <div
              key={item.id}
              className="bg-gray-50 p-3 rounded-lg flex justify-between"
            >
              <Avatar
                size="md"
                image={item.image || "/photos/images.jpeg"}
                title={item.fullname}
                subtitle={
                  <small className="text-green-400 font-medium">Online</small>
                }
              />
              <div className="space-x-3">
                <Link to={`/app/chat/${item.id}`}>
                  <button
                    className="hover:text-blue-600 text-blue-500 cursor-pointer"
                    title="Chat"
                  >
                    <i className="ri-chat-ai-line"></i>
                  </button>
                </Link>
                <Link to="/app/audio-chat">
                  <button
                    className="hover:text-green-500 text-green-400 cursor-pointer"
                    title="Call"
                  >
                    <i className="ri-phone-line"></i>
                  </button>
                </Link>
                <Link to="/app/video-chat">
                  <button
                    className="hover:text-amber-600 text-amber-500 cursor-pointer"
                    title="Video Call"
                  >
                    <i className="ri-video-on-line"></i>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default OnlineFriends
