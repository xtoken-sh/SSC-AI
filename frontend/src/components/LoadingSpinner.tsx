type TLoadingSpinnerProps = {
  className?: string
  label?: string
}

export default function LoadingSpinner({ className, label }: TLoadingSpinnerProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`} role="status">
      <span
        className="inline-block h-4 w-4 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin"
        aria-hidden
      />
      {label ? (
        <span className="text-sm text-slate-300 animate-pulse">{label}</span>
      ) : null}
    </span>
  )
}
