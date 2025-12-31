import axios from "axios"
import { toast, type ToastPosition } from "react-toastify"

const CatchError = (
  error: unknown,
  position: ToastPosition = "top-center"
) => {
  // Axios error
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong"

    toast.error(message, { position })
    return
  }

  // JS Error
  if (error instanceof Error) {
    toast.error(error.message, { position })
    return
  }

  // Fallback
  toast.error("Network error. Please try again.", { position })
}

export default CatchError
