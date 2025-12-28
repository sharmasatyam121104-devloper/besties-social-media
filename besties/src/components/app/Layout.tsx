import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import Avatar from "../shared/Avatar"
import Card from "../shared/Card"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import Dashboard from "./Dashboard"
import Context from "../../Context"
import HttpInterceptor from "../../lib/HttpInterceptor"
import {v4 as uuid} from 'uuid'
import useSWR, { mutate } from "swr"
import Fetcher from "../../lib/Fetcher"
import CatchError from "../../lib/CatchError"
import Friendsuggestion from "./Friendsuggestion"
import FriendRequest from "./FriendRequest"
import { useMediaQuery } from "react-responsive"
import Logo from "../shared/Logo"
import OnlineFriends, { type OnlineUserInterface } from "./OnlineFriends"
import socket from "../../lib/socket"
import type { audioSrcType, onOfferInterface } from "./Video"
import { notification } from "antd"

const EightMinInMs = 8*60*1000

export interface ChatFile {
  path: string;
  type: string;
}

export interface ChatUser {
  id: string;
  fullname: string;
  email: string;
  mobile: string;
  image: string | null;
}


export interface ChatMessage {
  from: ChatUser;
  message: string;
  file?: ChatFile | null;
}






 const ActivesessionUi = ({ liveActiveSession }: { liveActiveSession: OnlineUserInterface }) => {
   const navigate = useNavigate()

    useEffect(() => {
      if (!liveActiveSession) {
        navigate("/app/online-friends")
      }
    }, [liveActiveSession, navigate]);

    if (!liveActiveSession) {
      return null; 
    }

    return (
      <div className="w-full max-w-md bg-white rounded-xl p-2 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition">
        
        {/* Avatar */}
        <img
          src={ liveActiveSession.image || "/photos/blank_profile.jpeg" }
          alt="user"
          className="w-14 h-14 rounded-full object-cover"
        />

        {/* User Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            { liveActiveSession.fullname}
          </h3>
          <span className="text-sm text-green-600 font-medium">
              Online
            </span>
        </div>

      </div>
    );

    };

const Layout = () => {

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
  const [leftAsideSize, setLeftAsideSize] = useState(350)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { session, setSession,liveActiveSession, setLiveActiveSession,setSdp } = useContext(Context)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const params = useParams()
  const paramsArray = Object.keys(params)
  const audio  = useRef<HTMLAudioElement | null>(null)
  const [notify, notifyUi] = notification.useNotification()
  

  const { error} = useSWR('/auth/refresh-token', Fetcher, {
    refreshInterval: EightMinInMs, shouldRetryOnError: false
  })

  const stopAudio = ()=>{
          if(!audio.current) {
              return
          }
  
          const palyer =  audio.current
          palyer.pause()
          palyer.currentTime = 0
      }
  
      const playAudio = (src: audioSrcType, loop: boolean = false)=>{
          stopAudio()
          if(!audio.current) {
              audio.current = new Audio()
          }
          const palyer =  audio.current
          palyer.src = src
          palyer.loop = loop
          palyer.play()
      }

  
  const baseMenu = [
    {
      herf: "/app/dashboard",
      icon: "ri-dashboard-line",
      label: "Dashboard",
    },
    {
      herf: "/app/my-posts",
      icon: "ri-article-line",
      label: "My Posts",
    },
    {
      herf: "/app/friends",
      icon: "ri-group-line",
      label: "Friends",
    },
    
  ]

  const mobileMenu = [
    {
      herf: "/app/online-friends",
      icon: "ri-user-star-line ",
      label: "Online Friends",
    },
    {
      herf: "/app/suggestion",
      icon: "ri-function-add-line",
      label: "Add new friend",
    },
    {
      herf: "/app/accept-friend-request",
      icon: "ri-user-add-line",
      label: "Friend Requests",
    },
  ]

  const menu = isTabletOrMobile
  ? [...baseMenu, ...mobileMenu]
  : baseMenu


  const handleLogout = useCallback(async () => {
    try {
      await HttpInterceptor.post("/auth/logout")
      navigate("/login")
    } catch (error) {
      CatchError(error)
    }
  }, [navigate])

  useEffect(() => {
    if (error) {
      (async () => {
        try {
          // pehle session check kar
          await HttpInterceptor.get("/auth/session")
        } catch (err) {
          // agar session bhi invalid hai tabhi logout kar
          console.error("Session check failed:", err)
          handleLogout()
        }
      })()
    }
  }, [error, handleLogout])


  const getPathname = (path: string)=>{
    return path.split('/').pop()?.split("-").join(' ')
  }

  const handleLeftAsideSize = ()=>{

    if(leftAsideSize === 350) setLeftAsideSize(137)

    if(leftAsideSize !== 350) setLeftAsideSize(350)

  }

  const uploadImage = ()=>{
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.click()
    input.onchange = async()=>{

      if(!input.files) return

      const file = input.files[0]
      const path =`profile-pictures/${uuid()}.png`
      const payLoad = {
        path,
        type: file.type,
        status: "public-read"
      }

      try {
        const options = {
          headers: {
            'Content-Type': file.type
          }
        }
        const { data } = await HttpInterceptor.post("/storage/upload", payLoad)
        await HttpInterceptor.put(data.url, file , options)
        const {data: user} = await HttpInterceptor.put('/auth/profile-picture', {path})
        setSession({...session, image: user.image})
        mutate('/auth/refresh-token')
        
      } 
      catch (error) {
        CatchError(error)
      }
     
    }
  }

  const onOffer = useCallback((payload: onOfferInterface) => {
    setSdp(payload);
    setLiveActiveSession(payload.from);
    if(payload.type === "video") {
     navigate(`/app/video-chat/${payload.from.socketId}`);
    }

    if(payload.type === "audio") {
     navigate(`/app/audio-chat/${payload.from.socketId}`);
    }
  }, [setSdp, setLiveActiveSession, navigate]);

  const startChat = (payLoad: ChatMessage)=>{
    console.log(payLoad);
    notify.destroy()
    setLiveActiveSession(payLoad.from)
    navigate(`/app/chat/${payLoad.from.id}`)
  }

  const onMessage = (payLoad:ChatMessage)=>{
    if(location.href.includes(`/app/chat/${payLoad.from.id}`)) {
      return
    }
    playAudio("/audio/notification_tone.mp3")
    notify.open({
      title: <h1 className="font-medium capitalize">{payLoad.from.fullname}</h1>,
      description: payLoad.message,
      placement: "bottomRight",
      duration: 30,
      actions: [
        <button key="chat" className="bg-green-400 px-3 py-2 rounded text-white hover:bg-green-500" onClick={()=>startChat(payLoad)}>Accept Call</button>
      ]
    })

  }


  useEffect(() => {

    socket.on("offer", onOffer);
    socket.on("message", onMessage);

    return () => {
      socket.off("offer", onOffer);
      socket.off("message", onMessage);
    };
  }, [onOffer]);

    

  return (
    <>
    {
      isTabletOrMobile && 
      <div className="h-screen flex flex-col">

        {/* <MobileSideBar/> */}
        {isTabletOrMobile && isMobileSidebarOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-999 "
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-full w-[280px] bg-[linear-gradient(135deg,#1f1b3f,#0b0f2e)] z-1000 p-4 animate__animated animate__fadeInLeft animate__faster">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                {
                  session &&
                  leftAsideSize === 137 
                  ?   (<img 
                  src={session.image || "/photos/images.jpeg"} alt="" 
                  className="w-10 h-10 rounded-full object-cover"/>)
                  : (<Avatar 
                      title={session.fullname}
                      subtitle={session.email}
                      image={session.image || "/photos/images.jpeg"}
                      titleColor="white"
                      subtitleColor="#f5f5f5"
                      onClick={uploadImage}
                    />)
                  }
                  <button
                    className="text-white text-2xl ml-10"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

              {/* Menu */}
              <div className="space-y-2">
                {menu.map((item, index) => (
                  <Link
                    key={index}
                    to={item.herf}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-200 hover:bg-white/10"
                    >
                    <i className={`${item.icon} text-2xl`} />
                    <span className="text-xl capitalize">{item.label}</span>
                  </Link>
                ))}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-white/10 w-full text-xl"
                  >
                  <i className="ri-logout-circle-r-line text-2xl" />
                  Logout
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Navbar */}
        <nav className="bg-[linear-gradient(135deg,#1f1b3f,#0b0f2e)] h-16 w-full py-2 px-3 flex justify-between items-center sticky top-0 z-50">
          <button className="text-white" onClick={() => setIsMobileSidebarOpen(true)}>
            <i className="ri-menu-line text-3xl"></i>
          </button>
          <div>
            <Logo />
          </div>
          <div>
            {session ? (
              <div className="flex">
              <div className=" px-2">
                <h1 className="text-white capitalize">{session.fullname}</h1>
                <p className="text-gray-300 ">{session.email}</p>
              </div>
              <img
                src={session.image || "/photos/images.jpeg"}
                alt=""
                className="w-10 h-10 rounded-full object-cover mt-1"
              />
              </div>
            ) : (
              <Avatar
                title={session.fullname}
                subtitle={session.email}
                image={session.image || "/photos/images.jpeg"}
                titleColor="white"
                subtitleColor="#f5f5f5"
                onClick={uploadImage}
              />
            )}
          </div>
        </nav>

        {/* Pathname heading sticky under navbar */}
        <div className="sticky top-16  z-40 px-4 py-2">
          <h1 className="text-gray-700 text-xl font-bold capitalize">{paramsArray.length === 0 ? getPathname(pathname) : <ActivesessionUi liveActiveSession={liveActiveSession}/>}</h1>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto ">
          <Card >
            {pathname === "/app" ? <Dashboard /> : <Outlet />}
          </Card>
        </div>

      </div>

    }

    { 
      !isTabletOrMobile &&
      <div className=" min-h-screen ">
      <aside 
      className={`bg-white w-[${leftAsideSize}px] fixed top-0 left-0 h-full p-8 overflow-y-auto  text-white transition-all duration-300`}
      style={{

      }}
      >
        <div className=" space-y-8 px-4 bg-[linear-gradient(135deg,#1f1b3f,#0b0f2e)] h-full rounded-2xl py-4 ">
          {
            session &&
            leftAsideSize === 137 
            ?   (<img 
            src={session.image || "/photos/images.jpeg"} alt="" 
            className="w-10 h-10 rounded-full object-cover"/>)
             : (<Avatar 
                title={session.fullname}
                subtitle={session.email}
                image={session.image || "/photos/images.jpeg"}
                titleColor="white"
                subtitleColor="#f5f5f5"
                onClick={uploadImage}
              />)
          }
            
            <div className={`${leftAsideSize === 350 && "animate__animated animate__fadeInLeft "}`}>

              {
                menu.map((item, index)=>(
              <Link to={item.herf} key={index} title={item.label} className="flex items-center gap-4 text-gray-300 py-3 px-2 hover:text-gray-50">
                <i className={`${item.icon} text-2xl`}></i>
                {
                  leftAsideSize === 350 &&
                  <label>{item.label}</label>
                }
              </Link>
                ))
              }
              <button title="Logout" onClick={handleLogout} className="flex items-center gap-2 text-gray-300 py-3 hover:text-gray-50 cursor-pointer px-2">
                <i className="ri-logout-circle-r-line text-2xl"></i>
                {
                  leftAsideSize === 350 &&
                  <label >Logout</label>
                }
              </button>
            </div>
        </div>
      </aside>

     <section
        className="rounded-2xl py-8 px-1 transition-all duration-300"
        style={{
          width: `calc(100% - ${leftAsideSize + 450}px)`,
          marginLeft: `${leftAsideSize}px`,
        }}
      >
        <Card
         title={
          <div className="flex gap-4 items-center">
            <button
             className="bg-gray-100 w-10 h-10 rounded-full hover:bg-slate-200"
             onClick={handleLeftAsideSize}
             >
              <i className="ri-arrow-left-line"></i>
            </button>
            <h1>{paramsArray.length === 0 ? getPathname(pathname) : <ActivesessionUi liveActiveSession={liveActiveSession}/>}</h1>
          </div>
         }
         divider
        >
          {
            pathname === "/app" ?
            <Dashboard />
            :
            <Outlet/>
          }
        </Card>
      </section>

      <aside className="bg-white w-[450px] fixed top-0 right-1 h-full p-8 overflow-auto space-y-8">
        <div className="h-[258px] overflow-y-hidden shadow-lg">
          <Friendsuggestion />
        </div>
        <div className="h-[258px] overflow-y-hidden shadow-lg mb-8 rounded-b-xl">
          <FriendRequest/>
        </div>
        <div className="">
          <OnlineFriends/>
        </div>
      </aside>
      
      </div>
    }
    {notifyUi}
    </>
  )
}

export default Layout