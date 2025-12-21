import { BrowserRouter, Route, Routes } from "react-router-dom"
import 'remixicon/fonts/remixicon.css'
import 'animate.css'
import { ToastContainer } from 'react-toastify'
import Home from "./components/Home"
import Login from "./components/Login"
import Signup from "./components/Signup"
import Layout from "./components/app/Layout"
import Dashboard from "./components/app/Dashboard"
import Friends from "./components/app/Friends"
import Post from "./components/app/Post"
import Video from "./components/app/Video"
import Audio from "./components/app/Audio"
import Chat from "./components/app/Chat"
import NotFound from "./components/NotFound"
import Context from "./Context"
import { useState } from "react"
import AuthGaurd from "./guards/AuthGaurd"
import RedirectGaurd from "./guards/RedirectGaurd"
import Friendsuggestion from "./components/app/Friendsuggestion"
import FriendRequest from "./components/app/FriendRequest"
import OnlineFriends from "./components/app/OnlineFriends"


const App = () => {
  const [session , setSession] = useState(null)
  return (
      <Context.Provider value={{session, setSession}}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route element={<RedirectGaurd/>}>
              <Route path="/login" element={<Login/>}/>
              <Route path="/signup" element={<Signup/>}/>
            </Route>
          <Route element={<AuthGaurd/>}>
            <Route path="/app" element={<Layout/>}>
              <Route path="dashboard" element={<Dashboard/>}/>
              <Route path="friends" element={<Friends/>}/>
              <Route path="my-posts" element={<Post/>}/>
              <Route path="video-chat/:id" element={<Video/>}/>
              <Route path="audio-chat/:id" element={<Audio/>}/>
              <Route path="chat/:id" element={<Chat/>}/>
              <Route path="suggestion" element={<Friendsuggestion/>}/>
              <Route path="accept-friend-request" element={<FriendRequest/>}/>
              <Route path="online-friends" element={<OnlineFriends/>}/>
            </Route>
          </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer/>
        </BrowserRouter>
      </Context.Provider>
  )
}

export default App

