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

type callType = "pending" | "calling" | "incoming" |"talking" | "end"

interface onOfferInterface {
    offer: RTCSessionDescriptionInit
    from: string
}

interface onAnswerInterface {
    answer: RTCSessionDescriptionInit
    from: string
}

interface onCandidateInterface {
    candidate: RTCIceCandidateInit,
    from: string
}

function formatCallTime(seconds: number): string {
    const hr = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;

    if (hr > 0) {
        // H:MM:SS
        return `${hr}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    }

    // MM:SS
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
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
    const audio  = useRef<HTMLAudioElement | null>(null)

    const [isVideoSharing, setIsVideoSharing] = useState(false)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [isMic, setisMic] = useState(false)
    const [status, setStatus] = useState<callType>("pending")
    const [callTimer, setCallTimer] = useState(0)


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

        localStream.getTracks().forEach((track)=>{
            rtc.addTrack(track, localStream)
        })

        rtc.onicecandidate = (e)=>{
            if(e.candidate) {
                socket.emit("candidate", {candidate: e.candidate, to: id})
            }
        } 

        rtc.onconnectionstatechange = ()=>{
            console.log(rtc.connectionState);
        }

        rtc.ontrack = (e)=>{
            const remoteStream = e.streams[0]
            const remoteVideo = remoteVideoRef.current

            if(!remoteStream || !remoteVideo){
                return
            }

            remoteVideo.srcObject = remoteStream
 
            const videoTracks = remoteStream.getVideoTracks()[0]

            if(videoTracks) {
               videoTracks.onmute = ()=>{
                    remoteVideo.style.display = "none"
                    console.log("Video off from remote side")
               } 

               videoTracks.onunmute = ()=>{
                   remoteVideo.style.display = ""
                   console.log("Video on from remote side")
               }

               videoTracks.onended = ()=>{
                   remoteVideo.srcObject = null
                   remoteVideo.style.display = "none"
                   console.log("Video end")
               }
            }
            
        }

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
           setStatus("calling")
           notify.open({
            title: "Riya Kumari",
            description: "Calling...",
            duration: 30,
            placement: "bottomRight",
            actions: [
                <button 
                key="end" 
                className="bg-rose-400 px-3 py-2 rounded text-white hover:bg-rose-500"
                onClick={endCall}
                >
                    Reject Call
                </button>
            ]
           })
           socket.emit("offer", {offer, to:id})
        } 
        catch (error) {
           CatchError(error) 
        }
    }

    const accept = async(payload: onOfferInterface)=>{
        try {
           webRtcConnection() 

           const rtc = webRtcRef.current
           if(!rtc){
             return
           }

           const offer = new RTCSessionDescription(payload.offer)
           await rtc.setRemoteDescription(offer)

           const answer = await rtc.createAnswer()
           await rtc.setLocalDescription(answer)
           notify.destroy()
           setStatus("talking")
           socket.emit("answer", {answer, to:id})
        } 
        catch (error) {
            CatchError(error)
        }
    }

    //this is for who end and who rejected the call first
    const endCall = ()=>{
         try {
           setStatus("end")
           socket.emit("end", {to: id})
           setCallTimer(0)
        } 
        catch (error) {
           CatchError(error) 
        }
    }

    //to end call for remote controller
    const onEnd = ()=>{
        endCall()
    }

    
    //Event listeners
    const onOffer = (payload: onOfferInterface)=>{
        setStatus("incoming")
        notify.open({
            title: "satyam",
            description: "Incoming call",
            duration: 30,
            placement: "bottomRight",
            actions: [
                <div key="calls" className="space-x-4">
                    <button  className="bg-green-400 px-3 py-2 rounded text-white hover:bg-green-500" onClick={()=>accept(payload)}>Accept Call</button>
                    <button  className="bg-rose-400 px-3 py-2 rounded text-white hover:bg-rose-500" onClick={endCall}>End Call</button>
                </div>
            ]
        })
    }

    //Connect both user via webrtc
    const onCandidate = async(payload: onCandidateInterface )=>{
        try {
            const rtc = webRtcRef.current

            if(!rtc){
                return
            }

            const candidate =  new RTCIceCandidate(payload.candidate)
            await rtc.addIceCandidate(candidate)

        } 
        catch (error) {
            CatchError(error)    
        }
    }

    const OnAnswer = async(payload: onAnswerInterface)=>{
        try {
            const rtc = webRtcRef.current

            if(!rtc){
                return
            }

            const answer = new RTCSessionDescription(payload.answer)
            await rtc.setRemoteDescription(answer)
            setStatus("talking")
            notify.destroy()
        } 
        catch (error) {
            CatchError(error) 
        }
    }

    //Control Sound
    useEffect(()=>{
        let interval: any

        if(status === "pending") {
            return
        }

        if(!audio.current) {
            clearInterval(interval)
            audio.current = new Audio()
        }

        if(status === "calling" || status === "incoming") {
            clearInterval(interval)
            audio.current.pause()
            audio.current.src = "/audio/senderRing.mp3"
            audio.current.currentTime = 0
            audio.current.load()
            audio.current.play()
        }

        if(status === "end") {
            clearInterval(interval)
            audio.current.pause()
            audio.current.src = "/audio/callCutNotification.mp3"
            audio.current.currentTime = 0
            audio.current.load()
            audio.current.play()
            notify.destroy()
        }

        if(status === "talking") {
            clearInterval(interval)
            audio.current.pause()
            audio.current.currentTime = 0
            interval = setInterval(()=>{
                setCallTimer((prev)=>prev+1)
            },1000)
        }

        return ()=>{
            if(audio.current){
               audio.current.pause()
               audio.current.currentTime = 0 
               audio.current = null
            }
            clearInterval(interval)
        }

    },[status])


    useEffect(()=>{
        socket.on("offer", onOffer)
        socket.on("candidate", onCandidate)
        socket.on("answer", OnAnswer)
        socket.on("end", onEnd)

        return ()=>{
            socket.off("offer", onOffer)
            socket.off("candidate",onCandidate)
             socket.off("answer", OnAnswer)
             socket.on("end", onEnd)
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
       <div className="flex flex-col gap-2 lg:flex-row lg:gap-4">
        {
            status === "talking" 
            ?
            <label className="font-semibold text-lg">{formatCallTime(callTimer)}</label>
            :
            <Button onClick={startCall} type="success" icon="phone-line">Call</Button>
        }

        {
            status === "talking" &&
            <Button onClick={endCall} type="danger" icon="close-circle-fill">End</Button>
        }
       </div>

      </div>
      {notifyUi}
    </div>
  );
}

export default Video;
