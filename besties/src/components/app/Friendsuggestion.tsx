import useSWR, { mutate } from "swr"
import Card from "../shared/Card"
import Fetcher from "../../lib/Fetcher"
import { Skeleton } from "antd"
import Error from "../shared/Error"
import SmallButton from "../shared/SmallButton"
import CatchError from "../../lib/CatchError"
import HttpInterceptor from "../../lib/HttpInterceptor"
import { useState } from "react"
import { toast } from "react-toastify"
import moment from "moment"
import { useNavigate } from "react-router-dom"


interface LoadingInterface {
  state: boolean
  index: null | number
}

interface ItemInterface {
  _id: string
  image: string
  fullname: string
  createdAt: string
}

const Friendsuggestion = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<LoadingInterface>({state: false, index: null})
  const {data, error, isLoading} = useSWR('/friend/friend-suggestion', Fetcher)
  

    const sendFriendRequest = async(id: string, index: number)=>{
        try {
          setLoading({state: true, index})
          await HttpInterceptor.post('/friend/add-friend',{friend:id})
          toast.success("Friend request send.!", { position: "top-center", })
          mutate('/friend/friend-suggestion')
          mutate('/friend/fetch-friend')
        } 
        catch (error) {
          CatchError(error)  
        }
        finally{
          setLoading({state: false, index: null})
        }
    }

    const handleOtherprofile = (id:string)=>{
      navigate(`/app/other-profile/${id}`) 
    }

  return (
    <div className="md:h-[250px] overflow-hidden ">
      <Card title="Add new friend" divider>

        {isLoading && <Skeleton active />}

        {error && <Error message={error?.message} />}

        <div className="md:h-[180px] overflow-y-auto space-y-4 pr-1  ">
          {data?.suggestions?.map((item: ItemInterface, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3"
            >
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <img
                  src={item.image || "/photos/blank_profile.jpg"}
                  alt="avatar"
                  className="h-12 w-12 rounded-full object-cover"
                  onClick={()=>handleOtherprofile(item._id)}
                />

                <div>
                  <h1 className="text-sm font-semibold capitalize text-gray-900">
                    {item.fullname}
                  </h1>
                  <p className="text-xs text-gray-500">
                    Joined {moment(item.createdAt).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <SmallButton
                onClick={() => sendFriendRequest(item._id, index)}
                icon="user-add-line"
                type="secondary"
                loading={loading.state && loading.index === index}
              >
                Add
              </SmallButton>
            </div>
          ))}
        </div>
      </Card>
  </div>

  );
}

export default Friendsuggestion;
