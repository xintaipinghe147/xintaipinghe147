import Link from "next/link";

export default function SectionHeading({
  title,
  href,
  hrefLabel,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <h2 className="font-display text-2xl text-ink sm:text-[1.7rem]">{title}</h2>
      {href && hrefLabel ? (
        <Link href={href} className="nav-link shrink-0">
          {hrefLabel}
        </Link>
      ) : null}
    </div>
  );
}
