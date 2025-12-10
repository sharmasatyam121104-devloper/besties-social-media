import axios from "axios"
import { toast, type ToastPosition } from "react-toastify"

const CatchError = (error:unknown,position:ToastPosition = "top-center") => {
  if(axios.isAxiosError(error)){
        return toast.error(error.response?.data.message,{position})
      }

    if(error instanceof Error){
        return toast.error(error.message,{position})
    }

    return toast.error("Network error",{position})
}

export default CatchError;
