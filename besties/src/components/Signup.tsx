import { Link, useNavigate } from "react-router-dom"
import Button from "./shared/Button"
import Card from "./shared/Card"
import Input from "./shared/Input"
import Form, { type FormDataType } from "./shared/Form"
import HttpInterceptor from "../lib/HttpInterceptor"
import { toast } from "react-toastify"
import CatchError from "../lib/CatchError"
import { useMediaQuery } from "react-responsive"
import { useState } from "react"



const Signup = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
  const handleSignup = async (value: FormDataType)=>{
    try {
      setLoading(true)
      const {data} = await HttpInterceptor.post("/auth/signup", value)
      toast.success(data.message)
      navigate('/login')
      setLoading(false)
    } catch (error) 
    {
      CatchError(error)
    }
    finally{
      setLoading(false)
    }
  }
  return (
    <>
    {
      isTabletOrMobile && 
            <div>
              <div className="overflow-hidden h-70 w-50 mx-auto my-5  bg-linear-to-t from-sky-500 to-indigo-500 flex items-center justify-center rounded-xl">
                <img src="/photos/login.svg" alt="auth" className="w-50 h-50 animate__animated animate__slideInUp animate__faster" />
              </div>
              <Card noPadding divider={false} shadow={false}>
                <div className="">
                  <div className="p-8 space-y-6">
                    <div>
                      <h1 className="text-xl font-bold text-black">SIGN UP</h1>
                      <p className="text-gray-500">Start your first chat now !</p>
                    </div>
                    <Form className="space-y-6" onValue = {handleSignup}>
                      <Input 
                        name="fullname"
                        placeholder="Fullname"
                      />

                      <Input 
                        name="email"
                        placeholder="Email id"
                      />

                      <Input 
                        type="password"
                        name="password"
                        placeholder="Password"
                      />

                      <Input 
                        name="mobile"
                        placeholder="Mobile"
                      />
                      <Button type="danger" loading={loading} icon="arrow-right-up-line">Sign up</Button>
                    </Form>
                    <div className="flex gap-2">
                      <p>Don`t` have an account ?</p>
                      <Link to="/login" className="text-green-400 font-medium hover:underline">Sign in</Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
    }

    {
      !isTabletOrMobile &&
      <div className="bg-gray-100 flex items-center justify-center h-screen">
        <div className="w-6/12 animate__animated animate__fadeIn">
          <Card noPadding>
            <div className="grid grid-cols-2">
              <div className="p-8 space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-black">SIGN UP</h1>
                  <p className="text-gray-500">Start your first chat now !</p>
                </div>
                <Form className="space-y-6" onValue={handleSignup}>
                  <Input 
                    name="fullname"
                    placeholder="Fullname"
                  />

                  <Input 
                    name="email"
                    placeholder="Email id"
                  />

                  <Input 
                    type="password"
                    name="password"
                    placeholder="Password"
                  />

                  <Input 
                    name="mobile"
                    placeholder="Mobile"
                  />

                  <Button type="danger" loading={loading} icon="arrow-right-up-line">Sign up</Button>
                </Form>
                <div className="flex gap-2">
                  <p>Already have an account ?</p>
                  <Link to="/login" className="text-green-400 font-medium hover:underline">Sign in</Link>
                </div>
              </div>
              <div className="overflow-hidden h-[500px] bg-linear-to-t from-sky-500 to-indigo-500 flex items-center justify-center rounded-r-xl">
                  <img src="/photos/auth.svg" alt="auth" className="w-full animate__animated animate__slideInUp animate__faster" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    }
    </>
  )
}

export default Signup