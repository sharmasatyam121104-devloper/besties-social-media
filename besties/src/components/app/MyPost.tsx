// Environment variables from Vite
const env = import.meta.env

import { useState } from "react"
import useSWR, { mutate } from "swr"
import moment from "moment"
import { Empty, message, Skeleton } from "antd"

import Button from "../shared/Button"
import Card from "../shared/Card"
import Divider from "../shared/Divider"

import HttpInterceptor from "../../lib/HttpInterceptor"
import Fetcher from "../../lib/Fetcher"
import CatchError from "../../lib/CatchError"

export interface UserInterface {
  _id: string;
  fullname: string;
  email: string;
  image: string | null;
}

export interface PostItemInterface {
  _id: string;
  user: UserInterface;
  content: string;          // HTML string
  attachment?: string | null      // S3 path
  type: string;            // image/jpeg, video/mp4 etc
  createdAt: string;
  updatedAt: string;
  __v: number;
}


const MyPost = () => {
  // Fetch only my posts
  const { data, error, isLoading } = useSWR("/post/my-post", Fetcher)

  // Loader state for delete button
  const [deletingId, setDeletingId] = useState<string | null>(null)

  //Delete post by id
  const deletePost = async (postId: string) => {
    try {
      setDeletingId(postId)
      await HttpInterceptor.delete(`/post/delete-post/${postId}`)
      message.success("Post deleted successfully")
      mutate("/post/my-post") // Refresh post list
    } catch (err) {
      CatchError(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {isLoading && <Skeleton active />}

      {data && data.length === 0 && (
        <Empty description="You have not created any posts yet."/>
      )}

      {error &&  (
        <Empty description="Please try  Sometimes latters "/>
      )}


      {data &&
        data.posts.map((item: PostItemInterface) => (
          <Card key={item._id}>
            <div className="space-y-4">
              {/* Post Media */}
              {item.attachment && item.type.startsWith("image/") && (
                <img
                  src={`${env.VITE_S3_URL}/${item.attachment}`}
                  className="rounded-xl object-cover w-full max-h-[420px]"
                />
              )}

              {item.attachment && item.type.startsWith("video/") && (
                <video
                  src={`${env.VITE_S3_URL}/${item.attachment}`}
                  controls
                  className="rounded-xl object-cover w-full max-h-[420px]"
                />
              )}

              {/* Post Content */}
              <div
                dangerouslySetInnerHTML={{ __html: item.content }}
                className="hard-reset"
              />

              {/* Timestamp */}
              <label className="text-sm text-gray-500">
                {moment(item.createdAt).format("MMM DD YYYY, hh:mm A")}
              </label>

              {/* Divider */}
              <Divider />

              {/* User Info */}
              <div className="flex items-center gap-3 justify-end">
                <div className="flex flex-col text-right">
                  <span className="text-sm text-gray-500">Post created by</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {item.user.fullname}
                  </span>
                </div>

                <img
                  src={ item?.user?.image ?? "/photos/blank_profile.jpg"}
                  alt="user"
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>

              <Divider />

              {/* Delete Button */}
              <div className="flex justify-end">
                <Button
                  type="danger"
                  icon={deletingId === item._id ? "loader-4-line" : "delete-bin-6-line"}
                  disabled={deletingId === item._id}
                  onClick={() => deletePost(item._id)}
                >
                  {deletingId === item._id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
    </div>
  )
}

export default MyPost
