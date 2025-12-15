// src/components/Logo.tsx
import React from "react";

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 bg-transparent">
      {/* Logo Icon */}
      <div className="w-8 h-8 bg-linear-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
        B
      </div>

      {/* Logo Text */}
      <span className="text-lg font-bold text-white">Besties</span>
    </div>
  );
};

export default Logo;
