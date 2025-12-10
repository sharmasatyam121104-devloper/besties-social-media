import 'remixicon/fonts/remixicon.css'
import 'animate.css'
import type { FC } from 'react'

interface ModalInterface {
  title?: string
  children?: string
  open?: boolean
  onClose?: ()=>void
  key?: string | number
}

const Modal: FC<ModalInterface> = ({key=0, title="Modal title", children="Your content goes here", open=true, onClose}) => {
  return (
    <>
      {
        open &&
        <div 
        key={key}
          className='h-screen flex items-center justify-center fixed top-0 left-0 w-full animate__animated animate__fadeIn' 
          style={{
            background: 'rgba(0,0,0, 0.9)'
          }}
        >
            <div className='animate__animated animate__bounceIn bg-white border border-gray-100 shadow-xl px-5 py-4 rounded-lg w-[480px] space-y-2 relative'>
                <h1 className='text-lg font-semibold'>{title}</h1>
                <div className='text-gray-500'>{children}</div>
                <button className='absolute top-3 right-3 text-gray-500 hover:text-gray-600' onClick={onClose}>
                    <i className='ri-close-circle-fill'></i>
                </button>
            </div>
        </div>
      }
    </>
  )
}

export default Modal