import { Link } from "react-router-dom"
import Button from "./shared/Button"
import Card from "./shared/Card"
import Input from "./shared/Input"
import Form, { type FormDataType } from "./shared/Form"
import HttpInterceptor from "../lib/HttpInterceptor"



const Signup = () => {
  const handleSignup = async (value: FormDataType)=>{
    try {
      const {data} = await HttpInterceptor.post("/auth/signup", value)
      console.log(data);
    } catch (error) 
    {
      console.log(error);
    }
  }
  return (
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

                <Button type="danger" icon="arrow-right-up-line">Sign up</Button>
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
  )
}

export default Signup