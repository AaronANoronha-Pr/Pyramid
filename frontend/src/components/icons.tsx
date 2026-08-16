import Image from "next/image";

export function PyramidLogo({ className }: { className?: string }) {
  return (
    <span className={`inline-block overflow-hidden rounded-[22%] ${className ?? ""}`}>
      <Image
        src="/pyramid-logo.png"
        alt="Pyramid"
        width={48}
        height={48}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945z" />
    </svg>
  );
}

