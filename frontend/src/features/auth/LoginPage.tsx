import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Toast } from 'primereact/toast'
import { z } from 'zod'
import { getGoogleClientId } from '../../shared/config/env'
import { loginAluno, loginWithGoogle } from '../../shared/api/auth-api'
import { useAuthStore } from '../../shared/stores/auth-store'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('Informe um e-mail valido.'),
  senha: z.string().min(1, 'Informe sua senha.'),
})

type LoginForm = z.infer<typeof loginSchema>

let googleInitializedClientId: string | null = null

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const toast = useRef<Toast | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const googleClientId = getGoogleClientId()
  const googleButtonRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let intervalId: number | undefined

    const loadGoogleScript = async (): Promise<void> => {
      if ((window as any).google?.accounts?.id) {
        return
      }

      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
          'script[src="https://accounts.google.com/gsi/client"]',
        )
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve())
          existingScript.addEventListener('error', () => reject())
          return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject()
        document.head.appendChild(script)
      })
    }

    const initializeGoogle = async () => {
      if (!googleClientId) {
        return false
      }

      try {
        await loadGoogleScript()
      } catch (error) {
        console.error('Erro ao carregar script Google:', error)
        return false
      }

      const google = (window as any).google
      if (!google || !google.accounts?.id) {
        return false
      }

      if (googleInitializedClientId !== googleClientId) {
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              return
            }

            setIsSubmitting(true)
            try {
              const user = await loginWithGoogle({ idToken: response.credential })
              login(user)
              navigate('/')
            } catch (error) {
              console.error(error)
              toast.current?.show({
                severity: 'error',
                summary: 'Falha no login com Google',
                detail: 'Não foi possível autenticar com Google.',
                life: 5000,
              })
            } finally {
              setIsSubmitting(false)
            }
          },
        })
        googleInitializedClientId = googleClientId
      }

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = ''
        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
        })
      }

      setGoogleReady(true)
      return true
    }

    initializeGoogle().then((ready) => {
      if (!ready) {
        intervalId = window.setInterval(async () => {
          const readyAgain = await initializeGoogle()
          if (readyAgain && intervalId) {
            window.clearInterval(intervalId)
          }
        }, 300)
      }
    })

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [googleClientId, login, navigate])

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
        summary: 'Não foi possível entrar',
        detail: 'E-mail ou senha inválidos. Verifique e tente novamente.',
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
          <img className="favicon" src="/favicon.png" alt="" />
          <h1>GestãoTCC Pro</h1>
        </div>

        <p className="auth-hero__tagline">
          A plataforma completa para gestão de Trabalhos de Conclusão de Curso.
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
            <span>Relatórios inteligentes e indicadores em tempo real</span>
          </li>
          <li>
            <span className="auth-hero__feature-icon">
              <i className="pi pi-users" aria-hidden="true" />
            </span>
            <span>Comunicação integrada entre alunos, orientadores e banca</span>
          </li>
        </ul>
      </aside>

      <div className="auth-content">
        <form className="auth-card" onSubmit={handleSubmit(onSubmit)}>
          <h2>Bem-vindo de volta</h2>
          <p className="muted-text">Entre na sua conta para continuar</p>

          <div ref={googleButtonRef} style={{ width: '100%' }} />

          {!googleReady && (
            <Button
              className="auth-google-button"
              disabled={true}
              icon="pi pi-google"
              label="Carregando Google..."
              outlined
              type="button"
            />
          )}

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
                detail: 'Recuperação de senha ainda não está disponível.',
                life: 4000,
              })
            }
          />

          <Button label="Entrar" loading={isSubmitting} type="submit" />

          <Button
            className="auth-forgot-link"
            label="Criar nova conta"
            link
            type="button"
            onClick={() => navigate('/register')}
          />

          <p className="auth-footnote">Acesso para Coordenação, Aluno e Professor Avaliador.</p>
        </form>
      </div>
    </div>
  )
}
