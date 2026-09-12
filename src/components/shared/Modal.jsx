export default function Modal({
  title,
  onClose,
  children,
  tone = "default",
  size = "md",
  footer,
}) {
  const titleColor = tone === "danger" ? "text-red-600" : "text-[#1b1b1e]";
  const widthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size] || "max-w-md";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClass} rounded-2xl bg-white`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h3 className={`text-2xl font-bold ${titleColor}`}>{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>

        {/* Footer (optional) */}
        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}