import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  tone?: "success" | "warning" | "danger";
  onDismiss: () => void;
}

export default function Toast({
  message,
  tone = "success",
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3200);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div className="toast" role="status" aria-live="polite">
      <div className={`tag ${tone}`}>{tone.toUpperCase()}</div>
      <div>{message}</div>
    </div>
  );
}
