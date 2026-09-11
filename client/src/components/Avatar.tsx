export function Avatar({ name, photo, className = '' }: { name: string; photo?: string; className?: string }) {
  if (photo) return <img src={photo} alt={name} className={`object-cover ${className}`} />
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  return (
    <div
      aria-hidden="true"
      className={`grid place-items-center bg-linear-to-br from-brand-500 to-brand-700 font-bold text-white ${className}`}
    >
      {initials}
    </div>
  )
}
