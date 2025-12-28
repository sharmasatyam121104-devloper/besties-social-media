// Environment variables from Vite
const env = import.meta.env

import { useState } from "react"
import useSWR, { mutate } from "swr"
import moment from "moment"
import { v4 as uuid } from "uuid"
import { Card as AntCard, message, Skeleton } from "antd"

import Button from "../shared/Button"
import Card from "../shared/Card"
import Divider from "../shared/Divider"
import Editor from "../shared/Editor"

import HttpInterceptor from "../../lib/HttpInterceptor"
import Fetcher from "../../lib/Fetcher"
import CatchError from "../../lib/CatchError"

/**
 * Interface to store selected file information
 */
interface FileDataInterface {
  url: string
  file: File
}

const Post = () => {
  // Fetch posts using SWR
  const { data, error, isLoading } = useSWR("/post", Fetcher)

  // Editor content state
  const [value, setValue] = useState("")

  // Attached file state
  const [fileData, setFileData] = useState<FileDataInterface | null>(null)

  // Loader state for post button
  const [posting, setPosting] = useState(false)

  /**
   * Opens file picker and stores selected file
   */
  const attachFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*,video/*"
    input.click()

    input.onchange = () => {
      if (!input.files) return

      const file = input.files[0]
      input.remove()

      const url = URL.createObjectURL(file)
      setFileData({ url, file })
    }
  }

  /**
   * Creates a new post with optional media upload
   */
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
        data.map((item: any) => (
          <Card
            key={item._id}
          >
            <div className="space-y-4">
              {/* Media */}
              {item.attachment && item.type.startsWith("image/") && (
                <img
                  src={`${env.VITE_S3_URL}/${item.attachment}`}
                  className="rounded-xl object-cover w-full max-h-[420px]"
                />
              )}

              {item.attachment && item.type.startsWith("video/") && (
                <video
                  src={`${env.VITE_S3_URL}/${item.attachment}`}
                  className="rounded-xl object-cover w-full max-h-[420px]"
                  controls
                />
              )}

              {/* Content */}
              <div
                dangerouslySetInnerHTML={{ __html: item.content }}
                className="hard-reset"
              />

              {/* Timestamp */}
              <label className="text-sm text-gray-500">
                {moment(item.createdAt).format("MMM DD YYYY, hh:mm A")}
              </label>

              {/* Divider */}
              <div className="w-full h-px bg-gray-200 my-4" />

              {/* User info */}
              <div className="flex items-center gap-3 justify-end">
                <div className="flex flex-col text-right">
                  <span className="text-sm text-gray-500">
                    Post created by
                  </span>
                  <span className="text-lg font-semibold text-gray-800 capitalize">
                    {item.user.fullname}
                  </span>
                </div>

                <img
                  src={item.user.image}
                  alt="user"
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>

              <Divider />

              {/* Action buttons */}
              <div className="flex gap-4">
                <Button icon="thumb-up-line" type="info">
                  {item.like || 0}
                </Button>
                <Button icon="thumb-down-line" type="warning">
                  {item.dislike || 0}
                </Button>
                <Button icon="chat-ai-line" type="danger">
                  {item.comment || 0}
                </Button>
              </div>
            </div>
          </Card>
        ))}
    </div>
  )
}

export default Post
