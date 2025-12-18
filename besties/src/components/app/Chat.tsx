import { useContext, useEffect, useState } from "react";
import socket from "../../lib/socket";
import Avatar from "../shared/Avatar";
import Button from "../shared/Button";
import Form from "../shared/Form";
import Input from "../shared/Input";
import Context from "../../Context";
import { useParams } from "react-router-dom";

interface fromInfo {
  id: string;
  image: string | null;
  fullname: string;
  email: string;
}

interface ChatMessage {
  from: fromInfo;
  message: string;
}

const Chat = () => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const { session } = useContext(Context);
  const { id } = useParams();

  const messageHandler = (messageReceived: ChatMessage) => {
    setChats((prev) => [...prev, messageReceived]);
  };

  useEffect(() => {
    socket.on("message", messageHandler);

    return () => {
      socket.off("message", messageHandler);
    };
  }, []);

  const sendMessage = (values: { message: string }) => {
    const payload: ChatMessage & { to: string | undefined } = {
      from: session,
      to: id,
      message: values.message,
    };
    setChats((prev) => [...prev, payload]);
    socket.emit("message", payload);
  };


  return (
    <div>
      <div className="h-[700px] md:h-[500px] overflow-y-auto space-y-8">
        {chats.map((item, index) => (
          <div key={index} className="md:space-y-12 space-y-6 md:p-6 p-2">
            {item.from?.id === session.id ? (
              <div className="flex gap-4 items-start">
                <div className="relative bg-[#E8DEFF] py-2 px-2 rounded-xl flex-1 text-[#241A3A] shadow-lg wrap-break-words ">
                  <h1 className="font-bold capitalize">You</h1>
                  <label>{item.message}</label>
                  <i className="ri-arrow-right-s-fill absolute top-2 -right-[22px] text-4xl text-[#E8DEFF]"></i>
                </div>
                <Avatar image={session.image || "/photos/images.jpeg"} />
              </div>
            ) : (
              <div className="flex gap-4 items-start">
                <Avatar image={item.from.image || "/photos/images.jpeg"} />
                <div className="relative bg-[#E8F0FE] py-2 px-2 rounded-xl flex-1 text-[#1A2B4B] shadow-lg wrap-break-words ">
                  <h1 className="font-bold capitalize">{item.from.fullname}</h1>
                  <label>{item.message}</label>
                  <i className="ri-arrow-left-s-fill absolute top-2 -left-[22px] text-4xl text-[#E8F0FE]"></i>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-4">
          <Form onValue={sendMessage} className="flex gap-4 flex-1">
            <Input name="message" placeholder="Type your message here" />
            <Button type="secondary" icon="send-plane-fill">
              Send
            </Button>
          </Form>
          <button className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white">
            <i className="ri-attachment-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
