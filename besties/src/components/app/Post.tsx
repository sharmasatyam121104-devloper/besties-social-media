import Button from "../shared/Button"
import Card from "../shared/Card"
import Divider from "../shared/Divider"
import IconButton from "../shared/IconButton"

const Post = () => {
  return (
    <div className="space-y-5">
      {
        Array(20).fill(0).map((item,index)=>(
         <Card key={index}
         >
          <div className="space-y-3">
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Minima porro aspernatur molestiae autem esse quos vitae numquam nostrum non architecto.
            </p>
          <div className="flex justify-between items-center">
            <label className="text-base"> Jan 2, 2030 07:00 Pm</label>
            <div className="flex gap-4 cur">
              <IconButton icon="edit-2-line" type="info"/>
              <IconButton icon="delete-bin-6-line " type="danger"/>
            </div>
          </div>
          <Divider />
          <div className="space-x-4 flex">
            <Button icon="thumb-up-line" type="info">20k</Button>
            <Button icon="thumb-down-line" type="warning">20k</Button>
            <Button icon="chat-ai-line" type="danger">20k</Button>
          </div>
          </div>
          
         </Card> 
        ))
      }
    </div>
  )
}

export default Post