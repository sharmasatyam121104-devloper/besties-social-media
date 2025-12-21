import { useContext, useEffect, useRef, useState } from "react";
import CatchError from "../../lib/CatchError";
import Button from "../shared/Button";
import Context from "../../Context";
import { toast } from "react-toastify";
import socket from "../../lib/socket";
import { useParams } from "react-router-dom";
import { notification } from "antd";

const config = {
    iceServers: [
        {urls: "stun:stun.l.google.com:19302" }
    ]
}

const Video = () => {
    const { session } = useContext(Context)
    const {id} = useParams()
    const [notify, notifyUi] = notification.useNotification()

    const localVideoContainerRef = useRef<HTMLDivElement | null >(null)
    const localVideoRef = useRef<HTMLVideoElement | null >(null)
    const remoteVideoContainerRef = useRef<HTMLDivElement | null >(null)
    const remoteVideoRef = useRef<HTMLVideoElement | null >(null)
    const localStreamRef = useRef<MediaStream | null>(null)
    const webRtcRef = useRef<RTCPeerConnection | null>(null)

    const [isVideoSharing, setIsVideoSharing] = useState(false)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [isMic, setisMic] = useState(false)


    const toggleScreen = async()=>{
        try {

            const localVideo = localVideoRef.current
            
            if(!localVideo){
                return
            }

            if(!isScreenSharing) {

                const stream = await navigator.mediaDevices.getDisplayMedia({video: true})
                
    
                localVideo.srcObject = stream
                localStreamRef.current = stream
                setIsScreenSharing(true)
            }
            else {
                const localStream = localStreamRef.current
                

                if (!localStream ) {
                    return
                }

                localStream.getTracks().forEach((track)=>{
                    track.stop()
                })

                localVideo.srcObject = null
                localStreamRef.current = null
                setIsScreenSharing(false)
            }
        } 
        catch (error) {
            CatchError(error)
        }
    }

    const toggleVideo = async()=>{
        try {
            const localVideo = localVideoRef.current

            if(!isVideoSharing){
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true})
    
                if(!localVideo) {
                    return
                }
    
                localVideo.srcObject = stream
                localStreamRef.current = stream
                setIsVideoSharing(true)
                setisMic(true)
            }
            else{
                const localStream =  localStreamRef.current

                if(!localStream) {
                    return
                }

                localStream.getTracks().forEach((track)=>{
                    track.stop()
                })
                setIsVideoSharing(false)
                setisMic(false)
            }

        } 
        catch (error) {
            CatchError(error)
        }
    }

    const toggleMic = ()=>{
         try {
            const localStream = localStreamRef.current

            if(!localStream) {
                return
            }

            const audioTrack = localStream.getTracks().find((track)=>track.kind === "audio")

            if(audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setisMic(audioTrack.enabled)
            }
        } 
        catch (error) {
            CatchError(error)
        }
    }

    const toggleFullScreen = (type: "local" | "remote")=>{
        try {

            if (!isVideoSharing && !isScreenSharing) {
                return toast.warn("Please start your video first", {position: "top-center"})
            }

            const videoContainer = type === "local" ?  localVideoContainerRef.current : remoteVideoContainerRef.current

            if(!videoContainer){
                return
            }

            if(!document.fullscreenElement) {
                videoContainer.requestFullscreen()
            }
            else {
                document.exitFullscreen()
            }
        } 
        catch (error) {
            CatchError(error)
        }
    }

    const webRtcConnection = ()=>{
        webRtcRef.current =  new RTCPeerConnection(config)

        
        const localStream = localStreamRef.current

        if(!localStream){
            return
        }

        const rtc = webRtcRef.current

        if(!rtc){
            return
        }

        rtc.onicecandidate = (e)=>{
            console.log(e.candidate);
        } 

        rtc.onconnectionstatechange = ()=>{
            console.log(rtc.connectionState);
        }

        rtc.ontrack = ()=>{
            console.log("something is comming from remote user");
        }

        localStream.getTracks().forEach((track)=>{
            rtc.addTrack(track, localStream)
        })
    }

    const startCall = async()=>{
        try {
            if(!isVideoSharing && !isScreenSharing) {
                return toast.warning("Start your video first", {position: 'top-center'})
            }

            webRtcConnection()
            
           const rtc = webRtcRef.current
           if(!rtc){
                return
           }

           const offer = await rtc.createOffer()
           await rtc.setLocalDescription(offer)
           socket.emit("offer", {offer, to:id})
        } 
        catch (error) {
           CatchError(error) 
        }
    }

    const endCall = ()=>{
         try {
            console.log("end call");
        } 
        catch (error) {
           CatchError(error) 
        }
    }

    //Event listeners
    const onOffer = (payload)=>{
        notification.open({
            title: "satyam",
            description: "Incoming call",
            duration: 30
        })
    }

    useEffect(()=>{
        socket.on("offer", onOffer)

        return ()=>{
            socket.off("offer", onOffer)
        }
    }, [])

  return (
    <div className="space-y-6 animate__animated ">
      <div ref={remoteVideoContainerRef} className="bg-black w-full h-0 relative pb-[56.25%] rounded-xl">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full absolute top-0 left-0">
        </video>
        <button className="absolute bottom-5 left-5 text-xs px-2.5 py-1 rounded-lg text-white" style={{
            background: 'rgba(255,255,255,0.1)'
        }}>
            Satyam Sharma
        </button>
        <button onClick={()=>toggleFullScreen("remote")} className="absolute bottom-5 right-5 text-xs px-2.5 py-1 rounded-lg text-white hover:bg-white hover:scale-125" style={{
            background: 'rgba(255,255,255,0.1)'
        }}>
            <i className="ri-fullscreen-line"></i>
        </button>
      </div>

        <div className="grid md:grid-cols-3 grid-cols-2 gap-4">
           <div ref={localVideoContainerRef} className="bg-black w-full h-0  relative pb-[56.25%] rounded-xl">
                <video ref={localVideoRef} autoPlay playsInline className="w-full h-full absolute top-0 left-0">
                </video>
                <button className="absolute bottom-2 left-2 text-xs px-2.5 py-1 rounded-lg text-white capitalize" style={{
                    background: 'rgba(255,255,255,0.1)'
                }}>
                    { session && session.fullname}
                </button>
                <button onClick={()=>toggleFullScreen("local")} className="absolute bottom-2 right-2 text-xs px-2.5 py-1 rounded-lg text-white hover:bg-white hover:scale-125" style={{
                    background: 'rgba(255,255,255,0.1)'
                }}>
                    <i className="ri-fullscreen-line"></i>
                </button>
            </div>
            <Button icon="user-add-line">
                Add
            </Button>
        </div>

      <div className=" flex justify-between items-center">
       <div className="space-x-4">
            <button onClick={toggleVideo} className="bg-green-500 text-white w-12 h-12 rounded-full hover:bg-green-400 hover:text-white">
                {
                    isVideoSharing 
                    ? 
                    <i className="ri-video-on-ai-line"></i>
                    :
                    <i className="ri-video-off-line"></i>
                }
            </button>

            <button onClick={toggleMic} className="bg-amber-500 text-white w-12 h-12 rounded-full hover:bg-amber-400 hover:text-white">
                {
                    isMic 
                    ? 
                    <i className="ri-mic-line"></i>
                    :
                    <i className="ri-mic-off-line"></i>
                }
            </button>

            <button onClick={toggleScreen} className="bg-blue-500 text-white w-12 h-12 rounded-full hover:bg-blue-400 hover:text-white">
                {
                    isScreenSharing 
                    ? 
                    <i className="ri-tv-2-line"></i>
                    :
                    <i className="ri-chat-off-line"></i>
                }
            </button>
       </div>
       <div className="md:flex md:gap-4 space-y-2">
            <Button onClick={startCall} type="success" icon="phone-line ">Call</Button>
            <Button onClick={endCall} type="danger" icon="close-circle-fill ">End</Button>
       </div>
      </div>
      {notifyUi}
    </div>
  );
}

export default Video;
