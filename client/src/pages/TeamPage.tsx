import { Container } from '../components/Container'
import { SectionHeading } from '../components/SectionHeading'
import { TeamCard } from '../components/TeamCard'
import { team } from '../content/team'
import { company } from '../content/company'

export default function TeamPage() {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Команда"
        title="Люди, которые ведут ваш учёт"
        subtitle={`В «${company.name}» работают аттестованные бухгалтеры с опытом в разных отраслях. За каждым клиентом закреплён персональный специалист.`}
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((m) => (
          <TeamCard key={m.slug} member={m} />
        ))}
      </div>
    </Container>
  )
}
