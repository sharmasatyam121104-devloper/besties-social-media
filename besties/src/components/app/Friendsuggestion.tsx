import useSWR from "swr"
import Card from "../shared/Card"
import Fetcher from "../../lib/Fetcher"
import { Skeleton } from "antd"
import Error from "../shared/Error"
import SmallButton from "../shared/SmallButton"
import CatchError from "../../lib/CatchError"
import HttpInterceptor from "../../lib/HttpInterceptor"
import { useState } from "react"


interface LoadingInterface {
  state: boolean
  index: null | number
}

const Friendsuggestion = () => {
  const [loading, setLoading] = useState<LoadingInterface>({state: false, index: null})
    const {data, error, isLoading} = useSWR('/friend/friend-suggestion', Fetcher)

    const sendFriendRequest = async(id: string, index: number)=>{
        try {
          setLoading({state: true, index})
          const { data } = await HttpInterceptor.post('/friend/add-friend',{friend:id})
          console.log(data);
        } 
        catch (error) {
          CatchError(error)  
        }
        finally{
          setLoading({state: false, index: null})
        }
    }

  return (
    <div className="h-[250px] overflow-y-hidden">
            <Card title="Suggested" divider>
                 {isLoading && <Skeleton active />}

                 {error && <Error message = {error?.message}/>}
              <div className="space-y-8 h-[170px] overflow-y-auto">               
                  {
                    data && data?.suggestions?.map((item: any,index: number)=>(
                      <div key={index} className="flex gap-4">
                        <img
                         src={item.image || "/photos/images.jpeg"}
                         alt="avt" 
                        className="h-16 w-16 rounded object-cover"
                        />
                        <div>
                          <h1 className="text-black font-medium capitalize mb-2">{item.fullname}</h1>
                          <SmallButton onClick ={()=>sendFriendRequest(item._id, index)} icon="user-add-line mr-2 load" type="secondary" loading={loading.state && loading.index === index}>
                            Add Friend
                          </SmallButton>
                        </div>
                      </div>
                    ))
                  }
              </div>
            </Card>
        </div>
  );
}

export default Friendsuggestion;
