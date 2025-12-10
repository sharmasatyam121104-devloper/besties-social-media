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
import Gaurd from "./Gaurd"
import Context from "./Context"
import { useState } from "react"


const App = () => {
  const [session , setSession] = useState(null)
  return (
      <Context.Provider value={{session, setSession}}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
          <Route element={<Gaurd/>}>
            <Route path="/app" element={<Layout/>}>
              <Route path="dashboard" element={<Dashboard/>}/>
              <Route path="friends" element={<Friends/>}/>
              <Route path="my-posts" element={<Post/>}/>
              <Route path="video-chat" element={<Video/>}/>
              <Route path="audio-chat" element={<Audio/>}/>
              <Route path="chat" element={<Chat/>}/>
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

