import { useContext, useEffect, useRef, useState } from "react";
import CatchError from "../../lib/CatchError";
import Button from "../shared/Button";
import Context from "../../Context";
import { toast } from "react-toastify";
import socket from "../../lib/socket";
import {  useParams } from "react-router-dom";
import { Modal, notification,} from "antd";
import HttpInterceptor from "../../lib/HttpInterceptor";

// const config = {
//     iceServers: [
//         {urls: "stun:stun.l.google.com:19302" }
//     ]
// }

export type callType = "pending" | "calling" | "incoming" |"talking" | "end"

export type audioSrcType = "/audio/senderRing.mp3" | "/audio/callCutNotification.mp3" | "/audio/bussyRing.mp3" | "/audio/notification_tone.mp3"

interface fromInterface {
  id: string;
  fullname: string;
  email: string;
  mobile: string;
  image: string;
  socketId: string;
}


export interface onOfferInterface {
    offer: RTCSessionDescriptionInit
    from: fromInterface,
    type: "video" | "audio" 
}

export interface onAnswerInterface {
    answer: RTCSessionDescriptionInit
    from: string
}

export interface onCandidateInterface {
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
    const [open, setOpne] = useState(false)
    const { session, sdp, setSdp } = useContext(Context)
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
    const { liveActiveSession } = useContext(Context)
    const [isMic, setisMic] = useState(false)
    const [status, setStatus] = useState<callType>("pending")
    const [callTimer, setCallTimer] = useState(0)
    const statusRef = useRef<callType>("pending")



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

    const toggleScreen = async () => {
    try {
        const rtc = webRtcRef.current
        if (!rtc) return

        const sender = rtc
        .getSenders()
        .find(s => s.track?.kind === "video")

        if (!sender) return

        const cameraStream = localStreamRef.current
        const cameraTrack = cameraStream?.getVideoTracks()[0]

        // SCREEN OFF (second click)
        if (isScreenSharing) {
        setIsScreenSharing(false)

        if (cameraTrack) {
            cameraTrack.enabled = true
            setIsVideoSharing(true)
            await sender.replaceTrack(cameraTrack)
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = cameraStream
        }

        return
        }

        // SCREEN ON (first click)
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
        })

        const screenTrack = screenStream.getVideoTracks()[0]
        if (!screenTrack) return

        // camera OFF
        if (cameraTrack) {
        cameraTrack.enabled = false
        setIsVideoSharing(false)
        }

        await sender.replaceTrack(screenTrack)

        if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream
        }

        setIsScreenSharing(true)

        // screen band hone (browser stop share)
        screenTrack.onended = async () => {
        setIsScreenSharing(false)

        if (cameraTrack) {
            cameraTrack.enabled = true
            setIsVideoSharing(true)
            await sender.replaceTrack(cameraTrack)
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = cameraStream
        }
        }

    } catch (error) {
        CatchError(error)
    }
    }

    const toggleVideo = async () => {
        try {
            // First time: stream hi nahi hai
            if (!localStreamRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            })

            localStreamRef.current = stream

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
            }

            // WebRTC me track add 
            const rtc = webRtcRef.current
            if (rtc) {
                stream.getTracks().forEach(track => {
                rtc.addTrack(track, stream)
                })
            }

            setIsVideoSharing(true)
            setisMic(true)
            return
            }

            // Stream already exists → sirf enable / disable
            const videoTrack = localStreamRef.current.getVideoTracks()[0]
            if (!videoTrack) return

            videoTrack.enabled = !videoTrack.enabled
            setIsVideoSharing(videoTrack.enabled)

        } catch (error) {
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

    const webRtcConnection = async ()=>{
        const {data} = await HttpInterceptor.get('/twilio/turn-server')
        webRtcRef.current =  new RTCPeerConnection({iceServers: data})

        
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
                // return toast.warning("Start your video first", {position: 'top-center'})
                await toggleVideo()
            }

            await webRtcConnection()
            
           const rtc = webRtcRef.current
           if(!rtc){
                return 
           }

           const offer = await rtc.createOffer()
           await rtc.setLocalDescription(offer)
           setStatus("calling")
           playAudio("/audio/senderRing.mp3", true)
           notify.open({
            title: <h1 className="capitalize">{liveActiveSession.fullname}</h1>,
            description: "Calling...",
            duration: 30,
            placement: "bottomRight",
            onClose: stopAudio,
            actions: [
                <button 
                key="end" 
                className="bg-rose-400 px-3 py-2 rounded text-white hover:bg-rose-500"
                onClick={endCallFromLocal}
                >
                    Reject Call
                </button>
            ]
           })
           socket.emit("offer", {offer, to:id, type: 'video', from:session})
        } 
        catch (error) {
           CatchError(error) 
        }
    }

    const accept = async(payload: onOfferInterface)=>{
        try {
            setSdp(null)
            await toggleVideo()
            await webRtcConnection() 

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
           stopAudio()
           socket.emit("answer", {answer, to:id})
           console.log("oof",answer);
        } 
        catch (error) {
            CatchError(error)
        }
    }

    //this is for who end and who rejected the call first
    const endCallFromLocal = () => {
        try {
            setStatus("end")
            playAudio("/audio/callCutNotification.mp3")
            notify.destroy()

            socket.emit("end", { to: id })

            setCallTimer(0)
            endStreaming()
            setOpne(true)
            
        } catch (error) {
            playAudio("/audio/callCutNotification.mp3")
            CatchError(error)
        }
    }


    const redirectOnCallEnd = ()=>{
        setOpne(false)
        window.location.href = '/app/online-friends';
        // navigate("/app/online-friends")
    }

    const endStreaming = () => {
        /* Stop and reset local media */
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.enabled = false
                track.stop()
            })
            localStreamRef.current = null
        }

        /* Force stop all RTCRtpSenders (mic, cam, screen) */
        if (webRtcRef.current) {
            webRtcRef.current.getSenders().forEach(sender => {
                if (sender.track) {
                    sender.track.enabled = false
                    sender.track.stop()
                }
            })

            webRtcRef.current.onicecandidate = null
            webRtcRef.current.ontrack = null
            webRtcRef.current.onconnectionstatechange = null

            webRtcRef.current.close()
            webRtcRef.current = null
        }

        /* Reset media elements */
        if (localVideoRef.current) {
            localVideoRef.current.pause()
            localVideoRef.current.srcObject = null
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.pause()
            remoteVideoRef.current.srcObject = null
        }

        /* Reset UI related flags (optional but recommended) */
        setisMic(false)
        setIsVideoSharing(false)
        setIsScreenSharing(false)

    }



    //to end call for remote controller
    const endCallFromRemote = () => {
        setStatus("end")
        playAudio("/audio/callCutNotification.mp3")
        notify.destroy()
        setCallTimer(0)
        endStreaming()
        setOpne(true)
    }


    
    //Event listeners
    const onOffer = (payload: onOfferInterface)=>{
        if (statusRef.current === "talking") {

            notification.open({
                message: "📞 Busy",
                description: "Please finish your current call before receiving another one.",
                placement: "bottomRight",
                duration: 15,
                className: "bg-yellow-100 border border-yellow-400 rounded-xl p-4 shadow-lg text-yellow-800 text-sm font-medium",
            });

            socket.emit("busy", { to: payload.from.socketId })
            return
        }
        setStatus("incoming")
        notify.open({
            title: <h1 className="capitalize">{payload.from.fullname}</h1>,
            description: "Incoming call",
            duration: 30,
            placement: "bottomRight",
            actions: [
                <div key="calls" className="space-x-4">
                    <button  className="bg-green-400 px-3 py-2 rounded text-white hover:bg-green-500" onClick={()=>accept(payload)}>Accept Call</button>
                    <button  className="bg-rose-400 px-3 py-2 rounded text-white hover:bg-rose-500" onClick={endCallFromLocal}>End Call</button>
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

    const onBusy = () => {
        stopAudio()
        notify.destroy()

        notify.open({
        message: "⏳ User Busy",
        description: "The user is currently on another call.",
        placement: "bottomRight",
        duration: 15,
        className: "bg-yellow-50 border border-yellow-300 rounded-xl p-4 shadow-md text-yellow-800 text-sm font-medium flex flex-col gap-1",
        });

    }

    const OnAnswer = async(payload: onAnswerInterface)=>{
        console.log("eee",payload);
        try {
            const rtc = webRtcRef.current

            if(!rtc){
                return
            }

            const answer = new RTCSessionDescription(payload.answer)
            await rtc.setRemoteDescription(answer)
            setStatus("talking")
            stopAudio()
            notify.destroy()
        } 
        catch (error) {
            CatchError(error) 
        }
    }

    useEffect(() => {
        statusRef.current = status
    }, [status])


    useEffect(()=>{
        socket.on("offer", onOffer)
        socket.on("candidate", onCandidate)
        socket.on("answer", OnAnswer)
        socket.on("end", endCallFromRemote)
        socket.on("busy", onBusy)

        return ()=>{
            socket.off("offer", onOffer)
            socket.off("candidate",onCandidate)
            socket.off("answer", OnAnswer)
            socket.off("end", endCallFromRemote)
            socket.off("busy", onBusy)
        }
    }, [])

    useEffect(()=>{
        if(!liveActiveSession) {
            endCallFromLocal()
        }
    },[liveActiveSession])

    useEffect(()=>{
        let interval: number | undefined

        if(status === "talking") {
            interval = setInterval(()=>{
                setCallTimer((prev)=>prev+1)
            }, 1000)
        }

        return ()=>{
            clearInterval(interval)
        }
    },[status])

    //Detect comming offer
    useEffect(() => {
    if (sdp) {
        notify.destroy()
        // Defer state update to avoid cascading renders
        setTimeout(() => {
        onOffer(sdp);
        }, 0);
    }
    }, []);


  return (
    <div className="space-y-6 animate__animated ">
      <div ref={remoteVideoContainerRef} className="bg-black w-full h-0 relative pb-[56.25%] rounded-xl">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full absolute top-0 left-0">
            </video>
            <button className="absolute bottom-5 left-5 text-xs px-2.5 py-1 rounded-lg text-white" style={{
                background: 'rgba(255,255,255,0.1)'
                }}>
                {`${session.fullname}(You)`}
            </button>
            <button onClick={()=>toggleFullScreen("remote")} className="absolute bottom-5 right-5 text-xs px-2.5 py-1 rounded-lg text-white hover:bg-white hover:scale-125" style={{
                background: 'rgba(255,255,255,0.1)'
                }}>
                <i className="ri-fullscreen-line"></i>
            </button>
      </div>

        <div className="grid md:grid-cols-3 grid-cols-2 gap-4">
           <div ref={localVideoContainerRef} className="bg-black w-full h-0  relative pb-[56.25%] rounded-xl">
                <video ref={localVideoRef} muted autoPlay playsInline className="w-full h-full absolute top-0 left-0">
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
            <Button onClick={endCallFromLocal} type="danger" icon="close-circle-fill">End</Button>
        }
       </div>

      </div>
      <Modal
        open={open}
        footer={null}
        centered
        maskClosable={false}
        width={420}
        onCancel={redirectOnCallEnd}
        >
        <div className="flex flex-col items-center text-center gap-4 py-6">

            {/* Call End Icon */}
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-100">
            <i className="ri-close-large-line text-4xl text-red-500"></i>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-800">
            Call Disconnected
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-sm max-w-xs">
            The call has ended or the other user disconnected.
            Please go back and try again.
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-gray-200 my-2"></div>

            {/* Normal Button */}
            <button
                onClick={redirectOnCallEnd}
                className="
                w-full
                flex items-center justify-center gap-2
                bg-blue-600 hover:bg-blue-700
                text-white font-medium
                py-3 rounded-lg
                transition
                ">
                Thank You!
            </button>
        </div>
        </Modal>
        {notifyUi}
    </div>
  );
}

export default Video;