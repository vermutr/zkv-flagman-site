import type { TeamMember } from '../content/types'
import { Avatar } from './Avatar'

function years(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} год`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} года`
  return `${n} лет`
}

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group flex h-full flex-col rounded-3xl bg-white shadow-card ring-1 ring-stone-200/80 transition-[box-shadow,--tw-ring-color] duration-300 hover:shadow-card-hover hover:ring-gold-500 p-6">
      <Avatar name={member.name} photo={member.photo} className="h-40 w-full rounded-2xl text-4xl transition-transform duration-500 ease-out group-hover:scale-[1.02]" />
      <h3 className="mt-5 text-lg font-bold text-brand-900">{member.name}</h3>
      <p className="text-sm text-stone-600">{member.role}</p>
      <p className="mt-1 text-xs font-medium text-gold-700">Опыт {years(member.experienceYears)}</p>
      <p className="mt-3 flex-1 text-sm text-stone-700">{member.bio}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {member.specialties.map((s) => (
          <li key={s} className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold-800 ring-1 ring-gold-200/60">
            {s}
          </li>
        ))}
      </ul>
    </article>
  )
}
