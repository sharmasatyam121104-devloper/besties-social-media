import { useContext, useEffect, useRef, useState, type ChangeEvent, type FC } from "react";
import socket from "../../lib/socket";
import Avatar from "../shared/Avatar";
import Button from "../shared/Button";
import Form, { type FormDataType } from "../shared/Form";
import Input from "../shared/Input";
import Context from "../../Context";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import Fetcher from "../../lib/Fetcher";
import CatchError from "../../lib/CatchError";
import HttpInterceptor from "../../lib/HttpInterceptor";
import {v4 as uuid} from 'uuid'
import SmallButton from "../shared/SmallButton";
import moment from "moment";
import { message } from "antd";

interface fromInfo {
  id: string;
  _id: string;
  image: string | null;
  fullname: string;
  email: string;
}

interface ChatMessage {
  from: fromInfo;
  message: string;
  file?: {
    path: string;
    type: string;
  },
  createdAt?: string;
}

interface AttachmentInterface {
  file: {
    path: string;
    type: string;
  }
}

const AttachmentUi: FC<AttachmentInterface> = ({ file }) => {

  // IMAGE
  if (file.type.startsWith("image/")) {
    return (
      <div className="mt-2 max-w-xs rounded-xl overflow-hidden border shadow-sm bg-white">
        <img
          src={file.path || "/photos/blank_profile.jpg"}
          alt="attachment"
          className="w-full h-auto object-cover"
        />
      </div>
    );
  }

  // VIDEO
  if (file.type.startsWith("video/")) {
    return (
      <div className="mt-2 max-w-xs rounded-xl overflow-hidden border shadow-sm bg-white">
        <video
          src={file.path}
          controls
          className="w-full h-auto"
        />
      </div>
    );
  }

  // AUDIO
  if (file.type.startsWith("audio/")) {
    return (
      <div className="mt-2 max-w-xs p-3 flex items-center gap-3 rounded-xl bg-indigo-50 border">
        <i className="ri-music-2-line text-xl text-indigo-600"></i>
        <audio controls className="w-full" src={file.path} />
      </div>
    );
  }

  // PDF
  if (file.type === "application/pdf") {
    return (
      <a
        href={file.path}
        target="_blank"
        className="mt-2 flex items-center gap-3 p-3 max-w-xs rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition"
      >
        <i className="ri-file-pdf-line text-xl text-red-600"></i>
        <span className="text-sm font-medium text-red-700 truncate">
          Open PDF
        </span>
      </a>
    );
  }

  // TEXT FILE
  if (file.type.startsWith("text/")) {
    return (
      <a
        href={file.path}
        target="_blank"
        className="mt-2 flex items-center gap-3 p-3 max-w-xs rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
      >
        <i className="ri-file-text-line text-xl text-blue-600"></i>
        <span className="text-sm font-medium text-blue-700 truncate">
          Open Text File
        </span>
      </a>
    );
  }

  // GENERIC FILE
  return (
    <a
      href={file.path}
      target="_blank"
      download
      className="mt-2 flex items-center gap-3 p-3 max-w-xs rounded-xl bg-gray-100 border hover:bg-gray-200 transition"
    >
      <i className="ri-file-line text-xl text-gray-600"></i>
      <span className="text-sm font-medium text-gray-800 truncate">
        Download File
      </span>
    </a>
  );
};


const Chat = () => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const { session } = useContext(Context);
  const chatContainer = useRef<HTMLDivElement | null>(null)
  const { id } = useParams();
  const {data} = useSWR(id ? `/chat/${id}` : null, id ? Fetcher : null )
   

  const messageHandler = (messageReceived: ChatMessage) => {
    setChats((prev) => [...prev, messageReceived]);
  };

  const attachmentHandler = (messageReceived: ChatMessage)=>{
    setChats((prev) => [...prev, messageReceived]);
  }

  //Listening all socket event
  useEffect(() => {
    socket.on("message", messageHandler);
    socket.on("attachment",attachmentHandler)

    return () => {
      socket.off("message", messageHandler);
      socket.off("attachment",attachmentHandler)
    };
  }, []);

  //Setting old chat
  useEffect(()=>{
    if(data){
      if (data) { 
        Promise.resolve().then(() => setChats(data))
      }
    }
  },[data])

  //Setup scroll bar 
  useEffect(()=>{
     const chatDiv = chatContainer.current
      if(chatDiv){
        chatDiv.scrollTop = chatDiv.scrollHeight
      }
  },[chats])

  const sendMessage = (values: { message: string }) => {
    if (!values.message.trim()) {
       return;
      }
    const payload: ChatMessage & { to: string | undefined } = {
      from: session,
      to: id,
      message: values.message,
    };
    setChats((prev) => [...prev, payload]);
    socket.emit("message", payload);
  };

  const fileSharing = async(e: ChangeEvent<HTMLInputElement>)=>{
    try {
      const input = e.target
      if(!input.files){
        return
      }
      const file = input.files[0]
      const url = URL.createObjectURL(file)
      const ext = file.name.split(".").pop()
      const filename = `${uuid()}.${ext}`
      const path = `chats/${filename}`
      const maxSize = 15 * 1024 * 1024 // 15MB
      if (file.size > maxSize) {
        message.error("File size cannot exceed 15MB")
        return
      }

      const payload = {
        path,
        type:file.type,
        status: "private"
      }
      const options = {
        headers: {
          'Content-Type': file.type
        }
      }
      const remoteMetaData = {
        from: session,
        to: id,
        message: filename,
        file: {
          path,
          type: file.type
        }
      }
      const localMetaData = {
        from: session,
        to: id,
        message: filename,
        file: {
          path: url,
          type: file.type
        }
      }
      const {data} = await HttpInterceptor.post('/storage/upload', payload)
      await HttpInterceptor.put(data.url, file, options)
      setChats((prev) => [...prev, localMetaData]);
      socket.emit("attachment", remoteMetaData)
      
    } 
    catch (error) {
      CatchError(error)
    }
  }

  const download = async (filename :string)=>{
    try {
      const path = `chats/${filename}`
      const {data} = await HttpInterceptor.post("/storage/download",{path})
      const a = document.createElement("a")
      a.href = data.url
      a.download = filename
      a.click()
    } 
    catch (error) {
      CatchError(error)  
    }
  }

  const handleFormSubmit = (values: FormDataType) => { 
    const message = values["message"]; 
    if (!message?.trim()) return; sendMessage({ message });
  };


  return (
    <div>
      <div className="h-[650px] md:h-[500px] overflow-y-auto space-y-8" ref={chatContainer}>
        {chats.map((item, index) => (
        <div
            key={index}
            className="md:space-y-10 space-y-6 md:px-6 px-3"
          >
          {(item.from?.id === session.id) || (item.from?._id === session.id) ? (
            // YOU MESSAGE
            <div className="flex gap-3 items-start justify-end">
              <div className="relative max-w-[75%] bg-linear-to-r from-[#E8DEFF] to-[#F4EEFF] py-3 px-4 rounded-2xl shadow-md text-[#2A1D46]">

                <h1 className="font-semibold mb-1 text-sm opacity-70">You</h1>

                {item.file && (
                  <div className="mt-2">
                    <AttachmentUi file={item.file} />
                  </div>
                )}

                <p className="mt-2 wrap-break-words leading-relaxed">{item.message}</p>

                {item.file && (
                  <div className="mt-3 flex justify-start">
                    <SmallButton onClick={()=>download(item.message)} type="primary" icon="download-2-line">Download</SmallButton>
                  </div>
                )}
                 <div className="text-gray-500 text-xs p-1 ">
                  { moment().format('MMM DD, YYYY hh:mm:ss A')}
                </div>
              </div>

              <Avatar image={session.image || "/photos/images.jpeg"} />
            </div>
          ) : (
            // OTHER MESSAGE
            <div className="flex gap-3 items-start">
              <Avatar image={item.from.image || "/photos/images.jpeg"} />

              <div className="relative max-w-[75%] bg-linear-to-r from-[#E8F0FE] to-[#FFFFFF] py-3 px-4 rounded-2xl shadow-md text-[#1B2A4C]">

                <h1 className="font-semibold mb-1 text-sm opacity-70">
                  {item.from.fullname}
                </h1>

                {item.file && (
                  <div className="mt-2">
                    <AttachmentUi file={item.file} />
                  </div>
                )}

                <p className="mt-2 wrap-break-words leading-relaxed">{item.message}</p>

                {item.file && (
                  <div className="mt-3 flex justify-start">
                    <SmallButton onClick={()=>download(item.message)} type="success" icon="download-2-line">Download</SmallButton>
                  </div>
                )}
                <div className="text-gray-500 text-xs p-1 text-end">
                  {moment(item.createdAt).format('MMM DD, YYYY hh:mm:ss A')}
                </div>
              </div>
            </div>
          )}
        </div>

        ))}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-4">
          <Form onValue={handleFormSubmit} reset className="flex gap-4 flex-1">
            <Input name="message" placeholder="Type your message here" />
            <Button type="secondary" icon="send-plane-fill">
              Send
            </Button>
          </Form>
          <button className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white relative">
            <i className="ri-attachment-2"></i>
            <input type="file" onChange={fileSharing} className=" h-full w-full absolute top-0 left-0 rounded-full opacity-0"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
