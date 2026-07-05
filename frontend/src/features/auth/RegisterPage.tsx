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
import { loginWithGoogle, registerAluno } from '../../shared/api/auth-api'
import { useAuthStore } from '../../shared/stores/auth-store'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'

const registerSchema = z.object({
  nome: z.string().optional(),
  email: z.string().min(1, 'Informe seu e-mail.').email('Informe um e-mail valido.'),
  senha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const toast = useRef<Toast | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const googleClientId = getGoogleClientId()

  useEffect(() => {
    const google = (window as any).google
    if (!google || !googleClientId) {
      return
    }

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
  }, [googleClientId, login, navigate])

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { nome: '', email: '', senha: '' },
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(formData: RegisterForm) {
    setIsSubmitting(true)

    try {
      const user = await registerAluno(formData)
      login(user)
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.current?.show({
        severity: 'error',
        summary: 'Não foi possível registrar',
        detail: 'Verifique os dados e tente novamente.',
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
          Crie sua conta para acessar a gestão de TCC e acompanhar suas etapas.
        </p>
      </aside>

      <div className="auth-content">
        <form className="auth-card" onSubmit={handleSubmit(onSubmit)}>
          <h2>Registrar nova conta</h2>
          <p className="muted-text">Informe seus dados ou use o login pelo Google.</p>

          <FormField error={errors.nome?.message} htmlFor="nome" label="Nome">
            <Controller
              control={control}
              name="nome"
              render={({ field }) => (
                <InputText
                  id="nome"
                  placeholder="Seu nome"
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
          </FormField>

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

          <Button label="Registrar" loading={isSubmitting} type="submit" />

          <Button
            className="auth-google-button"
            disabled={!googleClientId}
            icon="pi pi-google"
            label={googleClientId ? 'Cadastrar com Google' : 'Cadastrar com Google (configurar cliente)'}
            outlined
            type="button"
            onClick={() => {
              const google = (window as any).google
              if (google && google.accounts?.id) {
                google.accounts.id.prompt()
              } else {
                toast.current?.show({
                  severity: 'warn',
                  summary: 'Google não disponível',
                  detail: 'Verifique a configuração do cliente OAuth.',
                  life: 5000,
                })
              }
            }}
          />

          <Button
            className="auth-forgot-link"
            label="Já tem conta? Entrar"
            link
            type="button"
            onClick={() => navigate('/login')}
          />
        </form>
      </div>
    </div>
  )
}
