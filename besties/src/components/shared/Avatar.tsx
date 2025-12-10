import type { FC, ReactNode } from "react"

interface AvatarInterface {
    title?: string
    subtitle?:ReactNode
    image?:string
    titleColor?:string
    subtitleColor?:string
    size?: "lg" | "md"
    key?: string | number
    onClick?: ()=>void
}

const Avatar:FC<AvatarInterface> = ({key=0, title,subtitle = "subtitle missing" ,image,titleColor= "#000000",subtitleColor ="#f5f5f5", size="lg",onClick}) => {
  return (
    <div className="flex gap-3 items-center " key={key} >
        {
            image && 
            <img 
            onClick={onClick}
            src={image} alt="" 
            className={`${size === "lg" ? "w-12 h-12" : "h-8 w-8" } rounded-full object-cover cursor-pointer`}
            />
        }

        {
            title && subtitle && 
            <div className="flex flex-col text-white">
                <h1 className={`${size === "lg" ? "text-lg/6" : "text-sm"}text-lg/6 font-medium`} style={{color:titleColor}}>
                {title}
                </h1>
                <div style={{color:subtitleColor}}> 
                    {subtitle}
                </div>
            </div>
        }
    </div>
  )
}

export default Avatar