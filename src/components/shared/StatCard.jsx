export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "text-[#4b41e1]",
  valueColor = "text-[#1b1b1e]",
  subtitleColor = "text-[#45464e]",
  borderColor = "",
  accent,
  className = "",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[20px] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        borderColor ? `border-l-4 ${borderColor}` : ""
      } ${accent || ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="mb-4 flex items-start justify-between">
        {icon && (
          <span className={`material-symbols-outlined rounded-lg p-2 ${iconColor}`}>
            {icon}
          </span>
        )}
        {title && !icon && (
          <span className="text-xs font-bold uppercase tracking-wider text-[#45464e]">
            {title}
          </span>
        )}
      </div>

      <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>

      {title && icon && (
        <p className="mt-2 text-sm font-semibold text-[#45464e]">{title}</p>
      )}

      {subtitle && (
        <p className={`mt-1 text-xs ${subtitleColor}`}>{subtitle}</p>
      )}
    </div>
  );
}