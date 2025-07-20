import React, { useEffect, useState } from "react";

type ToastProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  message: string;
  theme?: "success" | "error" | "info";
  timeout?: number; // in milliseconds
};

const themeStyles: Record<string, string> = {
  success: "bg-emerald-400 text-white",
  error: "bg-red-400 text-white",
  info: "bg-yellow-300 text-white",
};

const Toast: React.FC<ToastProps> = ({
  visible,
  setVisible,
  message,
  theme = "info",
  timeout = 2000,
}) => {
  const [timer, setTimer] = useState<string | number | NodeJS.Timeout | undefined>();
  useEffect(() => {
    if (visible) {
      if (timer) clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          setVisible(false);
        }, timeout),
      );
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <div
      className={`${visible ? 'opacity-100' : 'opacity-0'} fixed left-1/2 transform -translate-x-1/2 top-12 px-4 py-2 rounded shadow-lg transition-opacity duration-300 ${themeStyles[theme]}`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Toast;
