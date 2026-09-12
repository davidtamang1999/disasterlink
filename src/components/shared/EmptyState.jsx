export default function EmptyState({
  icon = "inbox",
  title = "Nothing here yet",
  description = "",
  action,
  compact = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-8" : "py-16"}`}>
      <span className={`material-symbols-outlined mb-3 block text-gray-300 ${compact ? "text-4xl" : "text-6xl"}`}>
        {icon}
      </span>
      <h3 className={`font-semibold text-[#1b1b1e] ${compact ? "text-base" : "text-xl"}`}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[#76767f]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}