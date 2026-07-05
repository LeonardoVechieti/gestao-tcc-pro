import { IconBadge } from '../../atoms/IconBadge'

type ComingSoonProps = {
  title: string
  icon: string
}

export function ComingSoon({ title, icon }: ComingSoonProps) {
  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{title}</h1>
          <p>Esta funcionalidade ainda esta em desenvolvimento.</p>
        </div>
      </section>

      <section className="coming-soon">
        <IconBadge icon={icon} size="lg" />
        <h2>Em breve</h2>
        <p className="muted-text">
          Estamos trabalhando nesta tela. Ela ainda nao esta disponivel, mas ja pode navegar
          pelas demais areas do portal.
        </p>
      </section>
    </div>
  )
}
