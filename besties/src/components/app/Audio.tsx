import { useContext,useEffect,useRef, useState } from 'react';
import Button from '../shared/Button';
import Context from '../../Context';
import { useNavigate, useParams } from 'react-router-dom';
import {  Card, Modal, notification } from 'antd';
import CatchError from '../../lib/CatchError';
import HttpInterceptor from '../../lib/HttpInterceptor';
import socket from '../../lib/socket';
import type { callType, onAnswerInterface, onCandidateInterface, onOfferInterface } from './Video';


const AudioChat = () => {
    const  id = useParams().id; 
    console.log("Audio chat with user id:", id);
    const navigate = useNavigate()
    const {session,liveActiveSession, sdp, setSdp } = useContext(Context)
    const [isMic, setIsMic] = useState(false)
    const localAudio = useRef<HTMLAudioElement | null>(null)
    const remoteAudio = useRef<HTMLAudioElement | null>(null)
    const localStream = useRef<MediaStream | null>(null)
    const rtc = useRef<RTCPeerConnection | null>(null)
    const [notify, notifyUi] =  notification.useNotification()
    const audio = useRef<HTMLAudioElement | null>(null)
    const [status, setStatus] = useState<callType>('pending')
    const [open , setOpen] =  useState(false)

    const stopAudio = ()=>{
        if (!audio.current) {
            return
        }

        audio.current.pause()
        audio.current.currentTime= 0
    }

    const playAudio = async(src: string, loop: boolean = false)=>{
        if (audio.current) {
            stopAudio()
        }

        if (!audio.current) {
            audio.current = new Audio()
        }

        const player =  audio.current
        player.src = src
        player.loop = loop
        player.load()
        player.play()
    }

    const toggleMic = async()=>{
        try {

            if(!localStream.current && !isMic){
                const stream = await navigator.mediaDevices.getUserMedia({audio: true})

                if(localAudio.current) {
                    localAudio.current.srcObject = stream
                    localAudio.current.play()
                }
    
                localStream.current = stream
                setIsMic(true)
            }
            else {
                localStream.current?.getTracks().forEach((track)=>track.stop())
                if(localAudio.current){
                    localAudio.current?.pause()
                    localAudio.current.srcObject = null
                }

                localStream.current = null
                setIsMic(false)
            }
        } 
        catch (error) {
            CatchError(error)
        }
    }

    const connction  = async ()=>{
        try {
            const {data} = await HttpInterceptor.get('/twilio/turn-server')
            rtc.current = new RTCPeerConnection({iceServers: data})
            let localStreaming = localStream.current

            if (!localStreaming) {
                localStreaming = await navigator.mediaDevices.getUserMedia({ audio: true })

                localStream.current = localStreaming

                if (localAudio.current) {
                    localAudio.current.srcObject = localStreaming
                    localAudio.current.muted = true
                    await localAudio.current.play()
                }

                setIsMic(true)
}

            localStreaming?.getTracks().forEach((track)=>{
                rtc.current?.addTrack(track, localStreaming)
            })

            rtc.current.onicecandidate = (e)=>{
                console.log("e", e);
                if (e.candidate) {
                    socket.emit("candidate",{candidate: e.candidate, to: id})
                    console.log("e.candidate :", e.candidate);
                }
            }

            rtc.current.onconnectionstatechange = ()=>{
                console.log(rtc.current?.connectionState);
            }

            rtc.current.ontrack = (e)=>{
                console.log("Something comming from remote");
                if(e && remoteAudio.current) {
                    const remoteStream = e.streams[0]
                    remoteAudio.current.srcObject = remoteStream
                    remoteAudio.current.play().catch(()=>{})

                }
            }
        } 
        catch (error) {
            CatchError(error)    
        }
    }


    const startCall = async()=>{
        try {
            await connction()

            if (!rtc.current) {
                return
            }

            const offer = await rtc.current.createOffer()
            await rtc.current.setLocalDescription(offer)

            notify.open({
                title: <span className='capitalize font-medium'>{liveActiveSession.fullname}</span>,
                description: 'calling...',
                duration: 30,
                placement: "bottomRight",
                onClose: stopAudio,
                actions: [
                <button key="end" className="bg-red-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-500 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">End Call</button> 
                ]
               
            })
            
            playAudio("/audio/senderRing.mp3", true)

            setStatus("calling")
            socket.emit("offer", {offer, to:id,  type: "audio",from:session})

        } 
        catch (error) {
            CatchError(error)    
        }
    }

     const acceptCall = async(payLoad: onOfferInterface)=>{
        try {
            setSdp(null)
            await connction()

            if (!rtc.current) {
                return
            }

            const offer = new RTCSessionDescription(payLoad.offer)
            await rtc.current.setRemoteDescription(offer)

            const answer = await rtc.current.createAnswer()
            await rtc.current.setLocalDescription(answer)
            notify.destroy()
            setStatus("talking")
            stopAudio()
            socket.emit("answer", {answer, to: payLoad.from.socketId })
        } 
        catch (error) {
            CatchError(error)    
        }
    }

    
    const onOffer = (payload: onOfferInterface)=>{
        try {
            console.log("onoffer",payload);
            notify.open({
                title: <span className='capitalize font-medium'>{payload && payload.from.fullname}</span>,
                description: 'Incoming...',
                duration: 30,
                placement: "bottomRight",
                onClose: stopAudio,
                actions:  [
                        <div key="calls" className="space-x-4">
                            <button key="accept" className="bg-green-400 px-3 py-2 rounded text-white hover:bg-green-500" onClick={()=>acceptCall(payload)}>Accept Call</button>
                            <button key="end" className="bg-red-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-500 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2" onClick={endCallOnLocal}>End Call</button> 
                        </div>
                    ]
            })
            
            playAudio("/audio/senderRing.mp3", true)
    
            setStatus("incoming")
        } 
        catch (error) {
            CatchError(error)  
        }
    }

    const onAnswer = async(payload: onAnswerInterface)=>{
       try {
            console.log("onAns",payload);
            if(!rtc.current){
                return
            }

            const answer = new RTCSessionDescription(payload.answer)
            await rtc.current.setRemoteDescription(answer)

            setStatus("talking")
            stopAudio()
            notify.destroy()
       } 
       catch (error) {
        CatchError(error)   
       }
    }

    const endStreaming = ()=>{
        localStream.current?.getTracks().forEach((track)=>track.stop())

        if(localAudio.current){
            localAudio.current.srcObject = null
        }

        if(remoteAudio.current){
            remoteAudio.current.srcObject = null
        }
    }
    

    const onEndCallRemote = ()=>{
        console.log("🔥 END EVENT RECEIVED FROM SOCKET");
        setStatus("end")
        notify.destroy()
        playAudio("/audio/callCutNotification.mp3")
        endStreaming()
        setOpen(true)
    }
    
    const endCallOnLocal = ()=>{
        setStatus("end")
        playAudio("/audio/callCutNotification.mp3")
        notify.destroy()
        socket.emit("end", {to: id})
        endStreaming()
        setOpen(true)
    }

    const onCandidate = async(payload: onCandidateInterface)=>{
       try {
            console.log("oncnad",payload);
            if(!rtc.current){
                return
            }

            const candidate = new RTCIceCandidate(payload.candidate)
             await rtc.current.addIceCandidate(candidate)
       } 
       catch (error) {
        CatchError(error)   
       }
    }

    const redirectOnCallEnd = ()=>{
        setOpen(false)
        navigate("/app/online-friends")
    }

    useEffect(()=>{
        socket.on("offer", onOffer)
        socket.on("candidate", onCandidate)
        socket.on("answer", onAnswer)
        socket.on("end", onEndCallRemote)

        return ()=>{
            socket.off("offer", onOffer)
            socket.off("candidate", onCandidate)
            socket.off("answer", onAnswer)
            socket.off("end", onEndCallRemote)
        }
    },[])

    useEffect(() => {
        if (sdp) {
            notify.destroy()
            setTimeout(() => {
            onOffer(sdp);
            }, 0);
        }
    }, [sdp]);


    if (!liveActiveSession) {
        navigate("/app/online-friends")
        return
    }

    // Event listeners


  return (
    <div className="space-y-6 animate__animated animate__fadeInUp">

        {/* Photo Cards */}
        <div className="grid grid-cols-2 gap-6">

            <Card
                className="rounded-xl shadow-sm"
                title={
                    <span className="font-semibold text-gray-800">
                    {session.fullname} <span className="text-sm text-gray-500">(You)</span>
                    </span>
                    }
                    >
                <audio className='hidden' ref={localAudio} muted/>
                <audio className='hidden' ref={remoteAudio} autoPlay playsInline/>
                <div className="flex flex-col items-center py-4">
                    <img
                    src={session.image || "/photos/blank_profile.jpg"}
                    alt="avt"
                    className="w-40 h-40 rounded-full object-cover
                                border-4 border-gray-200 shadow-md"
                            />
                </div>
            </Card>

            <Card
                className="rounded-xl shadow-sm"
                title={
                    <span className="font-semibold text-gray-800">
                    {liveActiveSession.fullname}
                    </span>}
                >
                <div className="flex flex-col items-center py-4">
                    <img
                    src={liveActiveSession.image || "/photos/blank_profile.jpg"}
                    alt="avt"
                    className="w-40 h-40 rounded-full object-cover
                                border-4 border-gray-200 shadow-md"
                            />
                </div>
            </Card>

        </div>

        {/* Controls (UNCHANGED) */}
        <div className="flex justify-between items-center">
            <div className="space-x-4">
            <button onClick={toggleMic} className="bg-amber-500 text-white w-12 h-12 rounded-full hover:bg-amber-400 hover:text-white">
               {
                 isMic 
                 ?  <i className="ri-mic-line"></i>
                 :  <i className="ri-mic-off-line"></i> 
               }
            </button>
            </div>
            {
                (status === "pending" || status === "end") &&
                <Button onClick={startCall} type="success" icon="phone-line px-2">Start Call</Button>
            }
            {
                (status === "calling" || status === "talking") && 
                <Button type="danger" icon="close-circle-fill px-2" onClick={endCallOnLocal}>End</Button> 
            }
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

export default AudioChat;
