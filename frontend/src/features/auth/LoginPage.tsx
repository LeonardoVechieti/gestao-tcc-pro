import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Toast } from 'primereact/toast'
import { z } from 'zod'
import { loginAluno } from '../../shared/api/auth-api'
import { useAuthStore } from '../../shared/stores/auth-store'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('Informe um e-mail valido.'),
  senha: z.string().min(1, 'Informe sua senha.'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const toast = useRef<Toast | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: '', senha: '' },
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(formData: LoginForm) {
    setIsSubmitting(true)

    try {
      const user = await loginAluno(formData)
      login(user)
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.current?.show({
        severity: 'error',
        summary: 'Nao foi possivel entrar',
        detail: 'E-mail ou senha invalidos. Verifique e tente novamente.',
        life: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <Toast ref={toast} />

      <aside className="auth-hero">
        <div className="auth-hero__brand">
          <div className="auth-hero__brand-mark">
            <i className="pi pi-graduation-cap" aria-hidden="true" />
          </div>
          <h1>GestaoTCC Pro</h1>
        </div>

        <p className="auth-hero__tagline">
          A plataforma completa para gestao de Trabalhos de Conclusao de Curso.
        </p>

        <ul className="auth-hero__features">
          <li>
            <span className="auth-hero__feature-icon">
              <i className="pi pi-shield" aria-hidden="true" />
            </span>
            <span>Organize e acompanhe todas as etapas do TCC</span>
          </li>
          <li>
            <span className="auth-hero__feature-icon">
              <i className="pi pi-chart-bar" aria-hidden="true" />
            </span>
            <span>Relatorios inteligentes e indicadores em tempo real</span>
          </li>
          <li>
            <span className="auth-hero__feature-icon">
              <i className="pi pi-users" aria-hidden="true" />
            </span>
            <span>Comunicacao integrada entre alunos, orientadores e banca</span>
          </li>
        </ul>
      </aside>

      <div className="auth-content">
        <form className="auth-card" onSubmit={handleSubmit(onSubmit)}>
          <h2>Bem-vindo de volta</h2>
          <p className="muted-text">Entre na sua conta para continuar</p>

          <Button
            className="auth-google-button"
            disabled
            icon="pi pi-google"
            label="Entrar com Google (em breve)"
            outlined
            type="button"
          />

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <FormField error={errors.email?.message} htmlFor="email" label="E-mail">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <InputText
                  id="email"
                  invalid={Boolean(errors.email)}
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
          </FormField>

          <FormField error={errors.senha?.message} htmlFor="senha" label="Senha">
            <Controller
              control={control}
              name="senha"
              render={({ field }) => (
                <Password
                  feedback={false}
                  inputId="senha"
                  invalid={Boolean(errors.senha)}
                  placeholder="********"
                  toggleMask
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
          </FormField>

          <Button
            className="auth-forgot-link"
            label="Esqueci minha senha"
            link
            type="button"
            onClick={() =>
              toast.current?.show({
                severity: 'info',
                summary: 'Em breve',
                detail: 'Recuperacao de senha ainda nao esta disponivel.',
                life: 4000,
              })
            }
          />

          <Button label="Entrar" loading={isSubmitting} type="submit" />

          <p className="auth-footnote">Acesso para Coordenacao, Aluno e Professor Avaliador.</p>
        </form>
      </div>
    </div>
  )
}
