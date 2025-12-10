import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-10">
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* Illustration Left */}
        <div className="flex justify-center">
          <img
            src="/photos/404.svg" // <-- apni illustration ka path
            alt="Lost astronaut"
            className="w-[350px] md:w-[420px]"
          />
        </div>

        {/* Text Right */}
        <div>
          <h1 className="text-7xl font-bold text-gray-900 mb-4">404</h1>

          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            UH OH! You're lost.
          </h2>

          <p className="text-gray-500 leading-relaxed mb-8 max-w-md">
            The page you are looking for does not exist. How you got here 
            is a mystery. But you can click the button below to go back 
            to the homepage.
          </p>

          <Link
            to="/"
            className="px-6 py-3 border border-green-500 text-green-600 rounded-full hover:bg-green-500 hover:text-white transition-all font-medium"
          >
            HOME
          </Link>
        </div>

      </div>

    </div>
  );
};

export default NotFound;
