import type { FC } from "react";

interface ErrorInterface {
  message: string;
}

const Error: FC<ErrorInterface> = ({ message }) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
      <svg
        className="h-5 w-5 shrink-0 text-red-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
        />
      </svg>

      <p className="text-sm font-medium leading-relaxed">
        {message}
      </p>
    </div>
  );
};

export default Error;
