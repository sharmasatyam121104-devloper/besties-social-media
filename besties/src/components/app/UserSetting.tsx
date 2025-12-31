import React, { useContext,  useState } from "react"
import {
  Tabs,
  Switch,
  Upload,
  Button,
  Input,
  Select,
  message
} from "antd"
import type { TabsProps } from "antd"
import { SaveOutlined, UploadOutlined } from "@ant-design/icons"
import { v4 as uuid } from "uuid"

import CatchError from "../../lib/CatchError"
import HttpInterceptor from "../../lib/HttpInterceptor"
import Context from "../../Context"
import type { ChatUser } from "./Layout"

const { Option } = Select

/* ================= TYPES ================= */

type UpdateProfilePayload = {
  fullname?: string
  bio?: string
  path?: string
}

/* ================= COMPONENT ================= */

const UserSettings: React.FC = () => {
  const {  setSession } = useContext(Context)

  const [fullname, setFullname] = useState("")
  const [bio, setBio] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")


 

  /* Upload handler */
  const handleUpload = (file: File) => {
    setFile(file)
    return false // stop auto upload
  }

  /* Submit */
  const handleSubmit = async () => {
    try {
      setLoading(true)

      let path: string | undefined

      /* File upload (optional) */
      if (file) {
        const ext = file.name.split(".").pop()
        const filename = `${uuid()}.${ext}`
        path = `posts/${filename}`

        const payload = {
          path,
          status: "public-read",
          type: file.type
        }

        const options = {
          headers: {
            "Content-Type": file.type
          }
        }

        const { data } = await HttpInterceptor.post(
          "/storage/upload",
          payload
        )
        await HttpInterceptor.put(data.url, file, options)
      }

      /* Dynamic payload */
      const updatePayload: UpdateProfilePayload = {}

      if (fullname.trim()) updatePayload.fullname = fullname.trim()
      if (bio.trim()) updatePayload.bio = bio.trim()
      if (path) updatePayload.path = path

      if (Object.keys(updatePayload).length === 0) {
        message.warning("Nothing to update")
        return
      }

      /* API call */
      const { data: res } = await HttpInterceptor.put(
        "/auth/profile-data",
        updatePayload
      )

      /* Session update */
      setSession((prev: ChatUser) => ({
        ...prev,
        ...res.updatedFields
      }))

      message.success("Profile updated successfully")
      setFile(null)
    } catch (error) {
      CatchError(error)
    } finally {
      setLoading(false)
      setFullname("")
      setBio("")
      setFile(null)
    }
  }

  const handleComingSoon = () => {
    message.info("This feature is coming soon!")
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      message.error("All password fields are required.")
      return
    }

    if (currentPassword === newPassword) {
      message.error("Your new password must be different from your current password.")
      return
    }

    if (newPassword !== confirmPassword) {
      message.error("New password and confirm password do not match.")
      return
    }

    try {
      const payload = {
        currentPassword,
        newPassword,
        confirmPassword
      }

      const { data } = await HttpInterceptor.put(
        "/auth/change-password",
        payload
      )

      message.success(data.message || "Password updated successfully.")

      // reset fields after success
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      CatchError(error)
    }
  }



  /* ================= TABS ================= */

  const tabItems: TabsProps["items"] = [
    {
      key: "1",
      label: "Profile",
      children: (
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Change Name</label>
            <Input
              placeholder="Enter your name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Bio</label>
            <Input.TextArea
              placeholder="Write something about yourself"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Profile Picture
            </label>
            <Upload beforeUpload={handleUpload} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </div>

          <div className="flex justify-end">
            <Button
              type="primary"
              loading={loading}
              icon={<SaveOutlined />}
              onClick={handleSubmit}
            >
              Save
            </Button>
          </div>
        </div>
      )
    },
    {
      key: "2",
      label: "Account",
      children: (
        <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Current Password</label>
                <Input.Password
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">New Password</label>
                <Input.Password
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Confirm New Password</label>
                <Input.Password
                  type="password"
                  placeholder="Confirm New password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="primary" onClick={handlePasswordChange}>
                Update Password
              </Button>

              <div className="flex items-center justify-between">
                <span>Two-Factor Authentication</span>
                <Switch checked={false} onClick={handleComingSoon}/>
              </div>
              <Button danger  className="mt-4" onClick={handleComingSoon}>Deactivate Account</Button>
            </div>
      )
    },
    {
      key: "3",
      label: "Privacy",
      children: (
         <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Profile Visibility</span>
                <Select
                  defaultValue="public"
                  style={{ width: 150 }}
                  onChange={handleComingSoon}
                >
                  <Option value="public">Public</Option>
                  <Option value="friends">Friends</Option>
                  <Option value="private">Private</Option>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <span>Allow tagging</span>
                <Switch checked={false} onClick={handleComingSoon} />
              </div>
              <div className="flex items-center justify-between">
                <span>Blocked Users</span>
                <Button onClick={handleComingSoon}>Manage</Button>
              </div>
            </div>
      )
    },
    {
      key: "4",
      label: "Notifications",
      children: (
        <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Push Notifications</span>
                <Switch checked={false} onClick={handleComingSoon}  />
              </div>
              <div className="flex items-center justify-between">
                <span>Email Notifications</span>
                <Switch checked={false} onClick={handleComingSoon}  />
              </div>
              <div className="flex items-center justify-between">
                <span>In-App Notifications</span>
                <Switch checked={false} onClick={handleComingSoon}  />
              </div>
            </div>
      )
    },
    {
      key: "5",
      label: "Appearance",
      children:(
        <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <Switch checked={false} onClick={handleComingSoon}  />
              </div>
            </div>
      )
    }
  ]

  /* ================= JSX ================= */

  return (
    <div className="min-h-screen bg-white py-4 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-6">User Settings</h1>

        <Tabs
          defaultActiveKey="1"
          type="card"
          items={tabItems}
        />
      </div>
    </div>
  )
}

export default UserSettings
