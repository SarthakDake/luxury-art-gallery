import { splitSiteName } from "@/lib/site-name";

export function SiteBrandName({
  name,
  className = "",
  mainClassName = "",
  subClassName = "",
}: {
  name: string;
  className?: string;
  mainClassName?: string;
  subClassName?: string;
}) {
  const { main, sub } = splitSiteName(name);

  return (
    <span className={`site-brand-name ${className}`.trim()}>
      <span className={`site-brand-main ${mainClassName}`.trim()}>{main}</span>
      {sub ? (
        <span className={`site-brand-sub ${subClassName}`.trim()}>{sub}</span>
      ) : null}
    </span>
  );
}
