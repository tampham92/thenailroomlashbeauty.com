import { site } from "@/data/site";

export default function SocialLinks({
  className = "",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  const items = [
    {
      href: site.social.facebook,
      label: "Facebook",
      path: "M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z",
    },
    {
      href: site.social.instagram,
      label: "Instagram",
      path: "M12 8.2A3.8 3.8 0 1 0 12 15.8 3.8 3.8 0 0 0 12 8.2Zm0 6.3a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm5.4-6.5a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0ZM8 3.5h8A4.5 4.5 0 0 1 20.5 8v8A4.5 4.5 0 0 1 16 20.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5Zm0 1.4A3.1 3.1 0 0 0 4.9 8v8A3.1 3.1 0 0 0 8 19.1h8a3.1 3.1 0 0 0 3.1-3.1V8A3.1 3.1 0 0 0 16 4.9H8Z",
    },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          className="opacity-70 transition-opacity hover:opacity-100"
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d={item.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}
