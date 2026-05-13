interface Props {
  rows?: number;
  cols?: number;
  className?: string;
}

export default function SkeletonLoader({ rows = 5, cols = 4, className = "" }: Props) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="skeleton h-9 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
}
