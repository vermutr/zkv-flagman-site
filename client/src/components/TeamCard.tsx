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
    <article className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Avatar name={member.name} photo={member.photo} className="h-40 w-full rounded-2xl text-4xl" />
      <h3 className="mt-5 text-lg font-bold text-brand-900">{member.name}</h3>
      <p className="text-sm text-stone-600">{member.role}</p>
      <p className="mt-1 text-xs font-medium text-accent-600">Опыт {years(member.experienceYears)}</p>
      <p className="mt-3 flex-1 text-sm text-stone-700">{member.bio}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {member.specialties.map((s) => (
          <li key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {s}
          </li>
        ))}
      </ul>
    </article>
  )
}
