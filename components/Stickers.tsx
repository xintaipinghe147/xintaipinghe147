import type { CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
};

export function StickerFlower({ className = "", style }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      <g fill="#f7c6d4" stroke="#eda7ba" strokeWidth="2.5" strokeLinejoin="round">
        <ellipse cx="32" cy="15" rx="8.5" ry="12" />
        <ellipse cx="32" cy="15" rx="8.5" ry="12" transform="rotate(60 32 32)" />
        <ellipse cx="32" cy="15" rx="8.5" ry="12" transform="rotate(120 32 32)" />
        <ellipse cx="32" cy="15" rx="8.5" ry="12" transform="rotate(180 32 32)" />
        <ellipse cx="32" cy="15" rx="8.5" ry="12" transform="rotate(240 32 32)" />
        <ellipse cx="32" cy="15" rx="8.5" ry="12" transform="rotate(300 32 32)" />
      </g>
      <circle cx="32" cy="32" r="6.5" fill="#f7e08a" stroke="#e5c46b" strokeWidth="2.5" />
    </svg>
  );
}

export function StickerCloud({ className = "", style }: Props) {
  return (
    <svg viewBox="0 0 80 52" className={className} style={style} aria-hidden="true">
      <path
        d="M16 40h48a9 9 0 0 0 1.2-17.9A13.5 13.5 0 0 0 39 17.2a16.5 16.5 0 0 0-31 6.4A10.2 10.2 0 0 0 16 40Z"
        fill="#dfeff7"
        stroke="#b7d8ea"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StickerStar({ className = "", style }: Props) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden="true">
      <path
        d="M24 4.5 29.4 18.6 44 19.2 32.6 28.3 36.4 42.5 24 34.3 11.6 42.5 15.4 28.3 4 19.2 18.6 18.6Z"
        fill="#fbe9a6"
        stroke="#e8cd74"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StickerHeart({ className = "", style }: Props) {
  return (
    <svg viewBox="0 0 48 44" className={className} style={style} aria-hidden="true">
      <path
        d="M24 40C10 30 3.5 21 3.5 13.2 3.5 6.8 8.2 3.4 13 3.4c4.4 0 8.7 2.9 11 6.2C26.3 6.3 30.6 3.4 35 3.4c4.8 0 9.5 3.4 9.5 9.8C44.5 21 38 30 24 40Z"
        fill="#fbd4dd"
        stroke="#f3a9ba"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
