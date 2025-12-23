import Avatar from '../shared/Avatar';
import { useNavigate } from 'react-router-dom';
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
  const { session,setLiveActiveSession } = useContext(Context)
  const navigate = useNavigate()
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

  const generateActiveSession = (url: string, user:OnlineUserInterface)=>{
      setLiveActiveSession(user)
      navigate(url)
  }

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
              <div className="space-x-3 py-2">
                <button  onClick={()=>generateActiveSession(`/app/chat/${item.id}`,item)}>
                  <span
                    className="hover:text-blue-600 text-blue-500 cursor-pointer"
                    title="Chat"
                  >
                    <i className="ri-chat-ai-line text-2xl"></i>
                  </span>
                </button>
                <button  onClick={()=>generateActiveSession(`/app/audio-chat/${item.id}`,item)}>
                  <span
                    className="hover:text-green-500 text-green-400 cursor-pointer"
                    title="Call"
                  >
                    <i className="ri-phone-line text-2xl"></i>
                  </span>
                </button>
                <button onClick={()=>generateActiveSession(`/app/video-chat/${item.id}`,item)}>
                  <span
                    className="hover:text-amber-600 text-amber-500 cursor-pointer"
                    title="Video Call"
                  >
                    <i className="ri-video-on-line text-2xl "></i>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default OnlineFriends
