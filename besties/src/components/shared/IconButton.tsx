import { type FC } from 'react'
import 'remixicon/fonts/remixicon.css'

const IconButtonModel = {
  primary: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded font-medium w-8 h-8 flex items-center justify-center",

  secondary: "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded font-medium w-8 h-8 flex items-center justify-center",

  danger: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded font-medium w-8 h-8 flex items-center justify-center",

  warning: "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded font-medium w-8 h-8 flex items-center justify-center",

  dark: "bg-zinc-50 text-zinc-600 hover:bg-zinc-600 hover:text-white rounded font-medium w-8 h-8 flex items-center justify-center",

  success: "bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded font-medium w-8 h-8 flex items-center justify-center",

  info: "bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white rounded font-medium w-8 h-8 flex items-center justify-center",
}



interface IconButtonInterface {
    type?: "primary" | "secondary" | "danger" | "warning" | "dark" | "success" | "info"
    onClick?: ()=>void
    icon: string
    key?: string | number
}

const IconButton: FC<IconButtonInterface> = ({  type="primary", onClick, icon})=>{
    return (
        <button  className={IconButtonModel[type]} onClick={onClick}>
                <i className={`ri-${icon}  text-base`}></i>
        </button>
    )
}

export default IconButton















