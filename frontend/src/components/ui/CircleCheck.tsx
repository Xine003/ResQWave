export default function CircleCheck({ size = 64, color = "#FFD600", checkColor = "#232323" }) {
  return (
    <span className="flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#FFD600" strokeWidth="4" />
        <path d="M20 32L30 42L44 24" stroke="#FFD600" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
