import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Context from "../Context";
import HttpInterceptor from "../lib/HttpInterceptor";

const RedirectGaurd = () => {
    const { session, setSession } = useContext(Context);

    // Fetch session
    useEffect(() => {
        const getSession = async () => {
            try {
                const { data } = await HttpInterceptor.get('/auth/session');
                setSession(data);
            } catch (error) {
                console.log(error);
                setSession(false);
            }
        };
        getSession();
    }, []);

    // Redirect if logged in
    useEffect(() => {

        if (session) {
            window.location.href = '/app'; // full reload
        }
        
    }, [session]);

    // Session check pending
    if (session === null) return null;

    // User not logged in, render protected routes
    if (session === false) return <Outlet />;

    // Logged in: nothing to render because redirect will happen
    return null;
};

export default RedirectGaurd;
