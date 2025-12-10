import { Link, Outlet, useLocation } from "react-router-dom"
import Avatar from "../shared/Avatar"
import Card from "../shared/Card"
import { useContext, useState } from "react"
import Dashboard from "./Dashboard"
import Context from "../../Context"
import HttpInterceptor from "../../lib/HttpInterceptor"
import {v4 as uuid} from 'uuid'

const Layout = () => {

  const [leftAsideSize, setLeftAsideSize] = useState(350)
  const { pathname } = useLocation()
  const { session, setSession } = useContext(Context)
  const menu = [
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
      const path =`profile-pictures${uuid}.png`
      const payLoad = {
        path,
        type: file.type,
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
        setSession({...session , image:user.image})
        
      } 
      catch (error) {
        console.log(error);
      }
     
    }

  }

  return (
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
            src="/photos/images.jpeg" alt="" 
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
              <button title="Logout" className="flex items-center gap-2 text-gray-300 py-3 hover:text-gray-50 cursor-pointer px-2">
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
        <div className="h-[250px] overflow-y-hidden">
            <Card title="Suggested" divider>
              <div className="space-y-8 h-[170px] overflow-y-auto">
                  {
                    Array(20).fill(0).map((item,index)=>(
                      <div key={index+item} className="flex gap-4">
                        <img src="/photos/images.jpeg" alt="avt" 
                        className="h-16 w-16 rounded object-cover"
                        />
                        <div>
                          <h1 className="text-black font-medium">Ravi Ranjan Kumar</h1>
                          <button className="bg-green-400 text-white rounded px-2 py-1 text-xs hover:bg-green-500 mt-1">
                              <i className="ri-user-add-line mr-1"></i>
                              Add Friend
                          </button>
                        </div>
                      </div>
                    ))
                  }
              </div>
            </Card>
        </div>
        <Card title="Friends" divider>
          <div className="space-y-5">
            {
              Array(20).fill(0).map((item, index)=>(
                <div key={index || item} className="bg-gray-50 p-3 rounded-lg flex justify-between">
                  <Avatar
                  size="md"
                  image="/photos/images.jpeg"
                  title="Satyam Sharma"
                  subtitle={
                    <small className={`${index % 2 === 0 ? 'text-zinc-400' : 'text-green-400 font-medium' }`}>
                      {index % 2 === 0 ? 'Ofline' : 'Online'}
                    </small>
                  }
                />
                <div className="space-x-3">
                  <Link to="/app/chat">
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
      </aside>
      
    </div>
  )
}

export default Layout