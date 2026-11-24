export default function FlowerAccent({ className = '' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
    >
      <path d="M60 52C52 34 55 14 60 6C65 14 68 34 60 52Z" fill="#E56B9F" />
      <path d="M67 56C82 43 102 41 112 45C103 52 84 59 67 56Z" fill="#E56B9F" />
      <path d="M65 65C82 71 96 86 100 96C89 92 73 80 65 65Z" fill="#E56B9F" />
      <path d="M55 65C47 80 31 92 20 96C24 86 38 71 55 65Z" fill="#E56B9F" />
      <path d="M53 56C36 59 17 52 8 45C18 41 38 43 53 56Z" fill="#E56B9F" />
    </svg>
  );
}
