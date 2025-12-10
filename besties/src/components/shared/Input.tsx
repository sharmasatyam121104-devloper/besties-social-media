import { type FC } from 'react'

interface InputInterface {
  name: string
  type?: string
  placeholder?: string
  key?: string |number
}

const Input: FC<InputInterface> = ({ key=0,name, placeholder, type="text"}) => {
  return (
    <input 
        key={key}
        className='border border-gray-300 rounded px-3 py-2 w-full'
        placeholder={placeholder}
        name={name}
        type={type}
    />
  )
}

export default Input