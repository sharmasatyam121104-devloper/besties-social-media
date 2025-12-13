import type { FC, ReactElement, ReactNode } from "react"


interface CardInterface {
  children?: ReactNode
  title?: ReactNode
  footer?: ReactElement
  divider?: boolean
  key?: string | number
  noPadding?: boolean
}

const Card: FC<CardInterface> = ({noPadding=false ,key=0,children, title, footer ,divider=false}) => {
  return (
    <div key={key} className={`bg-white shadow-lg ${noPadding ? '' : 'px-5 py-4'} rounded-lg border border-gray-100 space-y-2`}>
      {
        title &&
        <h1 className='text-lg font-semibold capitalize'>{title}</h1>
      }
      {
        divider &&
         <div className="border-b border-b-gray-100 -mx-4"></div>
      }
      {
        children &&
        <div className='text-gray-500'>{children}</div>
      }
      {
          footer &&
          <div className='mt-4'>
              {footer}
          </div>
      }
    </div>
  )
}

export default Card