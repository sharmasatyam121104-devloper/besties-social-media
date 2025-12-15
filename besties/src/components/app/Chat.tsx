import Avatar from "../shared/Avatar";
import Button from "../shared/Button";
import Input from "../shared/Input";

const Chat = () => {
  return (
    <div>
        <div className="h-[700px] md:h-[500px] overflow-y-auto space-y-8 ">
            {
                Array(20).fill(0).map((item,index)=>(
                    <div key={index || item} className="md:space-y-12 space-y-6 md:p-6 p-2">
                        <div className="flex gap-4 items-start">
                            <Avatar image="/photos/images.jpeg"/>
                            <div className=" relative bg-[#E8F0FE] py-2 px-2 rounded-xl flex-1 text-[#1A2B4B] shadow-lg">
                                <h1 className="font-bold capitalize ">Rakesh Kumar</h1>
                                <label className="">
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minima, odio!
                                </label>
                                <i className="ri-arrow-left-s-fill absolute top-2 -left-[22px] text-4xl text-[#E8F0FE]"></i>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className=" relative bg-[#E8DEFF] py-2 px-2 rounded-xl flex-1 text-[#241A3A] shadow-lg">
                                <h1 className="font-bold capitalize ">Satyam Sharma</h1>
                                <label className="">
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptas, fugit.
                                </label>
                                <i className="ri-arrow-right-s-fill absolute top-2 -right-[22px] text-4xl text-[#E8DEFF]"></i>
                            </div>
                                <Avatar image="/photos/images.jpeg"/>
                        </div>     
                    </div>
                ))
            }
        </div>
        <div className="p-3 ">
            <div className="flex items-center gap-4">
                <form className="flex gap-4 flex-1">
                    <Input name="message" placeholder="Type your message here"/>
                    <Button type="secondary" icon="send-plane-fill">Send</Button>
                </form>
                <button className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white">
                    <i className="ri-attachment-2"></i>
                </button>
            </div>
        </div>
    </div>
  );
}

export default Chat;
