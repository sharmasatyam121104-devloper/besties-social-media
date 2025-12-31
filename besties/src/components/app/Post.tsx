// Environment variables from Vite
const env = import.meta.env

import { useState } from "react"
import useSWR, { mutate } from "swr"
import moment from "moment"
import { v4 as uuid } from "uuid"
import { Card as AntCard, Avatar, message, Result, Skeleton } from "antd"

import Button from "../shared/Button"
import Editor from "../shared/Editor"

import HttpInterceptor from "../../lib/HttpInterceptor"
import Fetcher from "../../lib/Fetcher"
import CatchError from "../../lib/CatchError"
import {  useNavigate } from "react-router-dom"

/**
 * Interface to store selected file information
 */
interface FileDataInterface {
  url: string
  file: File
}

export interface PostUserInterface {
  _id: string
  fullname?: string
  image?: string
}

export interface PostInterface {
  _id: string
  user: PostUserInterface   
  attachment?: string | null
  type?: string | null
  content: string
  createdAt: string
  updatedAt: string
  like?: number
  dislike?: number
  comment?: number
}


const Post = () => {

  const navigate = useNavigate() 

  // Fetch posts using SWR
  const { data, error, isLoading } = useSWR("/post", Fetcher)

  
  // Editor content state
  const [value, setValue] = useState("")
  
  // Attached file state
  const [fileData, setFileData] = useState<FileDataInterface | null>(null)
  
  // Loader state for post button
  const [posting, setPosting] = useState(false)
  
  //  Opens file picker and stores selected file
 
 const attachFile = () => {
   const input = document.createElement("input")
   input.type = "file"
   input.accept = "image/*,video/*"
   input.click()
   
   input.onchange = () => {
     if (!input.files) return
     
     const file = input.files[0]
     input.remove()
     
      if (
        !file.type.startsWith("image/") &&
        !file.type.startsWith("video/")
        ) {
        message.error("Only image and video files are allowed")
        return
      }

      const maxSize = 15 * 1024 * 1024 // 15MB
      
      if (file.size > maxSize) {
        message.error("File size cannot exceed 15MB")
        return
      }

     
     const url = URL.createObjectURL(file)
     setFileData({ url, file })
    }
  }
  
  
  // Creates a new post with optional media upload
  
 const createPost = async () => {
   try {
     setPosting(true)
     let path: string | null = null
     
     // Upload file if attached
     if (fileData) {
       const ext = fileData.file.name.split(".").pop()
       const filename = `${uuid()}.${ext}`
       path = `posts/${filename}`
       
       const payload = {
         path,
         status: "public-read",
         type: fileData.file.type
        }
        
        const options = {
          headers: {
            "Content-Type": fileData.file.type
          }
        }
        
        const { data } = await HttpInterceptor.post("/storage/upload", payload)
        await HttpInterceptor.put(data.url, fileData.file, options)
      }

      // Final post payload
      const formData = {
        attachment: path,
        type: path ? fileData?.file.type : null,
        content: value
      }

      await HttpInterceptor.post("/post", formData)

      // Refresh post list
      mutate("/post")

      message.success("Post created successfully")

      // Reset editor and file
      setValue("")
      setFileData(null)
    } catch (err) {
      CatchError(err)
    } finally {
      setPosting(false)
    }
  }

  const handleOtherprofile = (id:string)=>{
    navigate(`/app/other-profile/${id}`) 
  }

  if(error){
          return (<Result
            title="Something went wrong"
            subTitle="We couldn’t load the data. Please try again."
          />)
  }

  return (
    <div className="space-y-8">
      {/* Post creation section */}
      <div className="flex flex-col gap-8">
        {value.length === 0 && (
          <h1 className="text-lg font-medium text-black">
            Write your post here
          </h1>
        )}

        {/* Live preview */}
        {(value.length > 0 || fileData) && (
          <AntCard className="border border-gray-200 shadow-sm rounded-xl">
            <div className="space-y-6">
              {fileData && fileData.file.type.startsWith("image/") && (
                <img
                  src={fileData.url}
                  className="rounded-xl object-cover w-full max-h-[420px]"
                />
              )}

              {fileData && fileData.file.type.startsWith("video/") && (
                <video
                  src={fileData.url}
                  className="rounded-xl object-cover w-full max-h-[420px]"
                  controls
                />
              )}

              <div
                dangerouslySetInnerHTML={{ __html: value }}
                className="hard-reset"
              />

              <label className="text-gray-500 text-sm">
                {moment().format("MMM DD, hh:mm A")}
              </label>
            </div>
          </AntCard>
        )}

        {/* Rich text editor */}
        <Editor value={value} onChange={setValue} />

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button
            type="danger"
            icon="attachment-line"
            onClick={attachFile}
            disabled={posting}
          >
            Attach
          </Button>

          {fileData && (
            <Button
              type="warning"
              icon="loop-left-line"
              onClick={() => setFileData(null)}
              disabled={posting}
            >
              Reset
            </Button>
          )}

          <Button
            type="secondary"
            icon={posting ? "loader-4-line" : "upload-2-line"}
            onClick={createPost}
            disabled={posting || (!value && !fileData)}
          >
            {posting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <Skeleton active />}

      {/* Posts list */}
        {data &&
          data.map((post: PostInterface) => (
            <div
              key={post._id}
              className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6"
            >
              {/* Post Header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar src={post.user.image || "/photos/blank_profile.jpg"} size={44} onClick={()=>handleOtherprofile(post.user._id)}/>
                <div>
                  <p className="font-medium text-gray-800 capitalize">
                    {post.user.fullname}
                  </p>
                  <p className="text-xs text-gray-500">
                    {moment(post.createdAt).format("MMM DD, YYYY • hh:mm A")}
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
                className="px-4 py-4 text-gray-800 hard-reset"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Actions */}
              <div className="border-t px-4 py-3 flex gap-12 text-sm text-gray-600">
                <button className="flex items-center gap-1 hover:text-blue-600 transition">
                  <i className="ri-thumb-up-line text-2xl"></i>
                  {post.like || 0}
                </button>

                <button className="flex items-center gap-1 hover:text-red-500 transition">
                  <i className="ri-thumb-down-line text-2xl"></i>
                  {post.dislike || 0}
                </button>

                <button className="flex items-center gap-1 hover:text-green-600 transition">
                  <i className="ri-chat-1-line text-2xl"></i>
                  {post.comment || 0}
                </button>
              </div>
            </div>
          ))
        }
    </div>
  )
}

export default Post
