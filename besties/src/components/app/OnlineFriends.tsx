import Avatar from '../shared/Avatar';
import { Link } from 'react-router-dom';
import Card from '../shared/Card';
import { useContext, useEffect, useState } from 'react';
import socket from '../../lib/socket';
import Context from '../../Context';
import { Empty } from 'antd';

export interface OnlineUserInterface {
  id: string
  email: string
  fullname: string
  mobile: string
  image: string | null
  iat: number
  exp: number
}


const OnlineFriends = () => {
  const [onlineUsers, setOnlineUsers] = useState([])
  const {session} = useContext(Context)

  useEffect(()=>{
    socket.on("online",(users)=>{
      setOnlineUsers(users)
    })
 
    socket.emit("get-online")
  },[])

  return (
    <div className='overflow-y-auto md:h-full h-189'>
      <Card title="Online Friends" divider noPadding={false}>
          <div className="space-y-5 ">
            {onlineUsers.length === 1 && (
              <Empty description="Looks like no users are online right now"/>
            )}
            {
              session && onlineUsers.filter((item: OnlineUserInterface)=>item.id !== session.id).map((item: OnlineUserInterface, index)=>(
                <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between">
                  <Avatar
                  size="md"
                  image={item.image || "/photos/images.jpeg"}
                  title={item?.fullname}
                  subtitle={
                    <small className={`text-green-400 font-medium }`}>
                      Online
                    </small>
                  }
                />
                <div className="space-x-3">
                  <Link to={`/app/chat/${item.id}`}>
                    <button className="hover:text-blue-600 text-blue-500 cursor-pointer" title="Chat">
                      <i className="ri-chat-ai-line"></i>
                    </button>
                  </Link>

                  <Link to="/app/audio-chat">
                    <button className="hover:text-green-500 text-green-400 cursor-pointer" title="Call">
                      <i className="ri-phone-line"></i>
                    </button>
                  </Link>

                  <Link to='/app/video-chat'>
                    <button className="hover:text-amber-600 text-amber-500 cursor-pointer" title="Video Call">
                    <i className="ri-video-on-line"></i>
                  </button>
                  </Link>

                </div>
                </div>
              ))
            }
          </div>
        </Card>
    </div>
  );
}

export default OnlineFriends;
