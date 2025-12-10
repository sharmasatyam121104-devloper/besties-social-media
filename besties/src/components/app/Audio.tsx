import Button from '../shared/Button';
import Card from '../shared/Card';

const Audio = () => {
  return (
    <div className="space-y-6 animate__animated animate__fadeInUp">
        <div className="grid grid-cols-2 gap-4">
            <Card title="Satyam Sharma">
                <div className='flex flex-col items-center'>
                    <img src="/photos/images.jpeg" alt="avt" className='w-40 h-40 rounded-full object-cover'/>
                </div>
            </Card>
            <Card title="Rahul Kumar">
                <div className='flex flex-col items-center'>
                    <img src="/photos/images.jpeg" alt="avt" className='w-40 h-40 rounded-full object-cover'/>
                </div>
            </Card>
        </div>

      <div className=" flex justify-between items-center">
       <div className="space-x-4">
            <button className="bg-amber-500 text-white w-12 h-12 rounded-full hover:bg-amber-400 hover:text-white">
                <i className="ri-mic-line"></i>
            </button>
       </div>
       <Button type="danger" icon="close-circle-fill px-2">End</Button>
      </div>
    </div>
  );
}

export default Audio;
