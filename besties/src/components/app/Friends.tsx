import Card from "../shared/Card"

const Friends = () => {
  return (
    <div className="grid grid-cols-3 gap-8">
      {
        Array(20).fill(0).map((item, index)=>(
          <Card key={item+index}>
            <div className="flex flex-col item-center gap-3">
              <img src="/photos/images.jpeg" alt=" pic" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <h1 className="text-base font-medium text-black">Ashwin Kumar</h1>
              <button className="bg-rose-400 text-white font-medium rounded px-2 py-1 text-xs hover:bg-rose-500 cursor-pointer mt-1">
                  <i className="ri-user-minus-line mr-1"></i>
                   Unfriend
              </button>
            </div>
            
          </Card>
        ))
      }
    </div>
  )
}

export default Friends