import { type FC } from "react";
import "remixicon/fonts/remixicon.css";

const ButtonModel = {
  primary: "bg-blue-500 hover:bg-blue-600",
  secondary: "bg-indigo-500 hover:bg-indigo-600",
  danger: "bg-rose-500 hover:bg-rose-600",
  warning: "bg-amber-500 hover:bg-amber-600",
  dark: "bg-zinc-500 hover:bg-zinc-600",
  success: "bg-green-500 hover:bg-green-600",
  info: "bg-cyan-500 hover:bg-cyan-600",
};

interface SmallButtonInterface {
  children?: string;
  type?: keyof typeof ButtonModel;
  onClick?: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
}

const SmallButton: FC<SmallButtonInterface> = ({
  children ,
  type = "primary",
  onClick,
  icon,
  loading = false,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-1
        rounded-md px-3 py-1.5 text-xs font-medium text-white
        ${ButtonModel[type]}
        ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      {loading ? (
        <i className="ri-loader-4-line animate-spin text-sm"></i>
      ) : (
        icon && <i className={`ri-${icon} text-sm`}></i>
      )}

      <span>{children}</span>
    </button>
  );
};

export default SmallButton;
