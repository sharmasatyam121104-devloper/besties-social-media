import {CKEditor} from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import type { FC } from 'react'

const toolbar: string[] = [
    'heading',
    '|',
    'bold',
    'italic',
    '|',
    'numberedList',
    'bulletedList',
    '|',
    'undo',
    'redo'

]

interface EditorInterface {
    value: string,
    onChange: (v: any)=>void
}

const Editor: FC<EditorInterface> = ({value, onChange}) => {
    const handleChange = (_:unknown, editor:any)=>{
        const v = editor.getData()
        onChange(v)
    }

  return (
    <div>
      <CKEditor
        data={value}
        editor={ClassicEditor as any}
        config={{toolbar: toolbar}}
        onChange={handleChange}
      />
    </div>
  );
}

export default Editor;
