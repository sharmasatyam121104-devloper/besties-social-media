import useSWR, { mutate } from "swr"
import Card from "../shared/Card"
import Fetcher from "../../lib/Fetcher"
import { Empty, Skeleton } from "antd"
import Error from "../shared/Error"
import CatchError from "../../lib/CatchError"
import HttpInterceptor from "../../lib/HttpInterceptor"
import { useState } from "react"
import { toast } from "react-toastify"
import moment from "moment"
import { useNavigate } from "react-router-dom"

interface LoadingInterface {
  index: number | null
  action: "accept" | "reject" | null
}

export interface FriendUser {
  _id: string
  image?: string | null
  fullname?: string
  email?: string
}

export interface ItemInterface {
  _id: string
  user: FriendUser
  status?: "requested" | "accepted" | "rejected"
  createdAt?: string
}

const FriendRequest = () => {
  const [loading, setLoading] = useState<LoadingInterface>({
    index: null,
    action: null,
  })
  const navigate = useNavigate()

  const { data, error, isLoading } = useSWR(
    "/friend/friend-request",
    Fetcher
  )

  const handleAcceptFriendRequest = async (
    friendId: string,
    index: number
  ) => {
    try {
      setLoading({ index, action: "accept" })
      await HttpInterceptor.post("/friend/accept-request", { friendId })
      toast.success("Friend request accepted!", { position: "top-center" })
      mutate("/friend/friend-request")
      mutate("/friend/fetch-friend")
    } catch (error) {
      CatchError(error)
    } finally {
      setLoading({ index: null, action: null })
    }
  }

  const handleRejectFriendRequest = async (
    friendId: string,
    index: number
  ) => {
    try {
      setLoading({ index, action: "reject" })
      await HttpInterceptor.post("/friend/delete-friend", { friendId })
      toast.warning("Friend request rejected!", { position: "top-center" })
      mutate("/friend/friend-request")
      mutate("/friend/fetch-friend")
    } catch (error) {
      CatchError(error)
    } finally {
      setLoading({ index: null, action: null })
    }
  }

  const handleOtherprofile = (id:string)=>{
      navigate(`/app/other-profile/${id}`) 
    }

  return (
    <div className="md:h-[250px] h-190 sm:overflow-y-hidden">
      <Card title="Friend Requests" divider>
        {isLoading && <Skeleton active />}

        {error && <Error message={error.message} />}

        {!isLoading && data?.friends?.length === 0 && (
          <Empty description="Not found any friends request."/>
        )}

        <div className="md:h-[180px] overflow-y-auto space-y-4 pr-1">
          {data?.friends?.map((item: ItemInterface, index: number) => (
            <div
              key={item._id}
              className="flex items-center justify-between gap-3"
            >
              {/* Left */}
              <div className="flex items-center gap-3">
                <img
                  src={item.user.image || "/photos/blank_profile.jpg"}
                  alt="avatar"
                  className="h-12 w-12 rounded-full object-cover"
                  onClick={()=>handleOtherprofile(item?.user?._id)}
                />

                <div>
                  <h1 className="text-sm font-semibold capitalize text-gray-900">
                    {item.user.fullname}
                  </h1>
                  <p className="text-xs text-gray-500">
                    Request received on{" "}
                    {moment(item.createdAt).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2">
                {/* Accept */}
                <button
                  disabled={loading.index === index}
                  onClick={() =>
                    handleAcceptFriendRequest(item.user._id, index)
                  }
                  title="Accept"
                  className={`
                    h-8 w-8 flex items-center justify-center rounded-full
                    text-white text-sm transition
                    ${
                      loading.index === index &&
                      loading.action === "accept"
                        ? "bg-emerald-300 cursor-not-allowed"
                        : "bg-emerald-400 hover:bg-emerald-600"
                    }
                  `}
                >
                  {loading.index === index &&
                  loading.action === "accept" ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <i className="ri-check-line"></i>
                  )}
                </button>

                {/* Reject */}
                <button
                  disabled={loading.index === index}
                  onClick={() =>
                    handleRejectFriendRequest(item.user._id, index)
                  }
                  title="Reject"
                  className={`
                    h-8 w-8 flex items-center justify-center rounded-full
                    text-white text-sm transition
                    ${
                      loading.index === index &&
                      loading.action === "reject"
                        ? "bg-rose-300 cursor-not-allowed"
                        : "bg-rose-400 hover:bg-rose-600"
                    }
                  `}
                >
                  {loading.index === index &&
                  loading.action === "reject" ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <i className="ri-close-line"></i>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default FriendRequest
