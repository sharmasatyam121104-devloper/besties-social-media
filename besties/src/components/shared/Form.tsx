import type { FC, FormEvent, ReactNode } from "react";

export type FormDataType = Record<string, string>

interface FormInterface {
  children: ReactNode
  className: string
  onValue?: (value:FormDataType)=>void
}

const Form: FC<FormInterface>= ({children, className, onValue }) => {
  const handleForm = (e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data: FormDataType = {}
    formData.forEach((value, name)=>(
      data[name] = value.toString()
    ))
    if(onValue){
      onValue(data)
    }
  }

  return (
    <form className={className} onSubmit={handleForm}>
      {children}
    </form>
  );
}

export default Form;
