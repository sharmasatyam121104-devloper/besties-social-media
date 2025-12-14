import { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Context from "../Context";
import HttpInterceptor from "../lib/HttpInterceptor";
import { Skeleton } from "antd";



const AuthGaurd = () => {
    const { session, setSession} = useContext(Context)

    const getSession = async()=>{
        try {
            const { data } = await HttpInterceptor.get('/auth/session')
            setSession(data)
        } catch (error) 
        {
            console.log(error)
            setSession(false)
        }
    }
    
    useEffect(()=>{
        getSession()
    },[])

    if(session === null){
        return  <Skeleton active/>
    }

    if(session === false){
        return <Navigate to={"/login"} />
    }
    
    return <Outlet/>



}

export default AuthGaurd;
