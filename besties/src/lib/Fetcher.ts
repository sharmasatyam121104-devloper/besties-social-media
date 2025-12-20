import HttpInterceptor from "./HttpInterceptor"
import { AxiosError } from "axios"

const Fetcher = async (url: string) => {
  try {
    const { data } = await HttpInterceptor.get(url)
    return data
  } catch (err: unknown) {
    // Agar AxiosError hai
    if (err instanceof AxiosError) {
      const backendMessage = (err.response?.data as { message?: string })?.message
      throw new Error(backendMessage || err.message)
    }

    // Agar normal JS Error hai
    if (err instanceof Error) {
      throw new Error(err.message)
    }

    // Agar kuch aur unknown error hai
    throw new Error("Unknown error occurred")
  }
}

export default Fetcher
