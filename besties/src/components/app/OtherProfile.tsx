// Environment variables from Vite
const env = import.meta.env

import React from "react"
import { Avatar, Skeleton, Empty } from "antd"
import moment from "moment"
import Fetcher from "../../lib/Fetcher"
import useSWR from "swr"
import { useParams } from "react-router-dom"
import type { PostInterface } from "./Post"



const OtherProfile: React.FC = () => {
  const {id} = useParams()
  const { data, error, isLoading } = useSWR(`/post/other-profile/${id}`, Fetcher)
  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Skeleton avatar paragraph={{ rows: 4 }} active />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Empty description="Failed to load profile" />
      </div>
    )
  }

  return (
    <div className="h-190 bg-gray-50 flex flex-col overflow-hidden">
      {/* Sticky Profile Header */}
      <div className="bg-white border-b sticky top-0 z-50 o">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <Avatar
            src={data.user.image || "/photos/blank_profile.jpg"}
            size={110}
            className="border-4 border-white shadow-md"
          />

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-semibold text-gray-800 capitalize">
              {data.user.fullname}
            </h1>

            <p className="text-gray-500 mt-1 capitalize">
              {data.user.bio || "No bio given"}
            </p>

            <div className="flex justify-center sm:justify-start gap-6 mt-4 text-sm">
              <span>
                <b>{data.posts.length}</b> Posts
              </span>
              <span>
                <b>{data.friendCount}</b> Friends
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Posts */}
      <div className="flex-1 overflow-y-auto">
        {
          (!data.posts || data.posts.length === 0) 
          ?  <div className="h-40 flex items-center justify-center">
              <Empty description="No posts yet" />
            </div> 
          :  <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
              {data.posts.map((post: PostInterface) => (
                <div
                  key={post._id}
                  className="bg-white rounded-2xl shadow-sm border overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Avatar src={data.user.image || "/photos/blank_profile.jpg"} size={44} />
                    <div>
                      <p className="font-medium text-gray-800 capitalize">
                        {data.user.fullname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {moment(post.createdAt).format(
                          "MMM DD, YYYY • hh:mm A"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Media */}
                  {post.attachment && post.type?.startsWith("image/") && (
                    <img
                      src={`${env.VITE_S3_URL}/${post.attachment}`}
                      className="w-full max-h-[520px] object-cover"
                    />
                  )}

                  {post.attachment && post.type?.startsWith("video/") && (
                    <video
                      src={`${env.VITE_S3_URL}/${post.attachment}`}
                      controls
                      className="w-full max-h-[520px] object-cover"
                    />
                  )}

                  {/* Content */}
                  <div
                    className="px-4 py-4 text-gray-800"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Actions */}
                  <div className="border-t px-4 py-3 flex gap-12 text-sm text-gray-600">
                    <button className="flex items-center gap-1 hover:text-blue-600">
                      <i className="ri-thumb-up-line text-2xl"></i> {post.like || 0}
                    </button>
                    <button className="flex items-center gap-1 hover:text-red-500">
                      <i className="ri-thumb-down-line text-2xl"></i> {post.dislike || 0}
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-600">
                      <i className="ri-chat-1-line text-2xl"></i> {post.comment || 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}

export default OtherProfile
