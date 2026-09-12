export default function PageHeader({ title, subtitle, actions, children }) {
  return (
    <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {typeof title === "string" ? (
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e]">
            {title}
          </h2>
        ) : (
          title
        )}
        {subtitle && (
          <p className="mt-2 max-w-2xl text-[#45464e]">{subtitle}</p>
        )}
        {children}
      </div>

      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </section>
  );
}