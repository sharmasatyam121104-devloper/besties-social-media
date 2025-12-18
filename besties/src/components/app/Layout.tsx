import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import Avatar from "../shared/Avatar"
import Card from "../shared/Card"
import { useCallback, useContext, useEffect, useState } from "react"
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
import OnlineFriends from "./OnlineFriends"

const EightMinInMs = 8*60*1000

const Layout = () => {

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
  const [leftAsideSize, setLeftAsideSize] = useState(350)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { session, setSession } = useContext(Context)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)


  const { error} = useSWR('/auth/refresh-token', Fetcher, {
    refreshInterval: EightMinInMs, shouldRetryOnError: false
  })

  
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
      handleLogout()
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
        console.log("success");
        const {data: user} = await HttpInterceptor.put('/auth/profile-picture', {path})
        setSession({...session, image: user.image})
        mutate('/auth/refresh-token')
        
      } 
      catch (error) {
        console.log(error);
      }
     
    }
  }


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
          <h1 className="text-gray-700 text-xl font-bold capitalize">{getPathname(pathname)}</h1>
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
            <h1>{getPathname(pathname)}</h1>
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
    </>
  )
}

export default Layout