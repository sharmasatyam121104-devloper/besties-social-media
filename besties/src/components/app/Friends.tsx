import useSWR, { mutate } from "swr"
import Card from "../shared/Card"
import Fetcher from "../../lib/Fetcher"
import Error from "../shared/Error"
import { Empty, Skeleton } from "antd"
import moment from "moment"
import HttpInterceptor from "../../lib/HttpInterceptor"
import CatchError from "../../lib/CatchError"
import { toast } from "react-toastify"
import { useContext } from "react"
import Context from "../../Context"


interface FriendInfo {
  _id: string
  image: string | null
  fullname: string
  email: string
}

interface ItemInterface {
  _id: string
  user: FriendInfo
  friend: FriendInfo
  status: string
  type?: string
  createdAt: string
}

const Friends = () => {
  const { session } = useContext(Context)
  const currentUserId = session?.email // yahan session ya context se current user id aayega

  const { data, error, isLoading } = useSWR("/friend/fetch-friend", Fetcher)
  if (isLoading) {
    return <Skeleton active />
  }

  if (error) {
    return <Error message={error.message} />
  }

  const handleUnfriend = async (id: string) => {
    try {
      const { data } = await HttpInterceptor.post("/friend/delete-friend", { friendId: id })
      console.log(data)
      toast.success("Unfriend request success !")
      mutate("/friend/fetch-friend")
    } catch (error) {
      CatchError(error)
    }
  }

  return (
    <div className="h-[575px] overflow-y-auto">
      
        {data?.friends?.length === 0 && (
          <div className="h-[400px] flex items-center justify-center">
            <Empty description="No friends found" />
          </div>
        )}

      <div className="grid grid-cols-3 gap-8 px-5">
        {data?.friends?.map((item: ItemInterface, index: number) => {
          // frontend me decide kaun friend hai
          const friend = item.user.email === currentUserId ? item.friend : item.user
          
          return (
            <Card key={index}>
              <div className="flex flex-col items-center gap-3 text-center">
                <img
                  src={friend.image || "/photos/images.jpeg"}
                  alt="pic"
                  className="w-16 h-16 rounded-full object-cover"
                />

                <h1 className="text-base font-medium text-black">{friend.fullname}</h1>

                {item.status === "requested" ? (
                  <>
                    <p className="text-xs text-amber-500 font-medium">Request Sent</p>
                    <p className="text-xs text-gray-400">
                      Sent at: {moment(item.createdAt).format("DD MMM YYYY")}
                    </p>
                    <button
                      onClick={() => handleUnfriend(friend._id)}
                      className="bg-rose-400 text-white font-medium rounded px-2 py-1 text-xs hover:bg-rose-500 cursor-pointer mt-1"
                    >
                      <i className="ri-user-minus-line mr-1"></i>
                      Cancel Request
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-green-500 font-medium">Friend</p>
                    <p className="text-xs text-gray-400">
                      Added on: {moment(item.createdAt).format("DD MMM YYYY")}
                    </p>
                    <button
                      onClick={() => handleUnfriend(friend._id)}
                      className="bg-rose-500 text-white font-medium rounded px-2 py-1 text-xs hover:bg-rose-600 cursor-pointer mt-1"
                    >
                      <i className="ri-user-minus-line mr-1"></i>
                      Unfriend
                    </button>
                  </>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default Friends
