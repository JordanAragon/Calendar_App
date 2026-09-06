import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)
    try { await signInWithGoogle() }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display font-semibold text-2xl mb-2">Calendar</h1>
        <p className="text-sm text-muted mb-8">Tu calendario, en lenguaje natural.</p>
        <Button disabled={loading} variant="primary" onClick={handleLogin} className="w-full py-2.5">
          {loading ? 'Conectando…' : 'Continuar con Google'}
        </Button>
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        <p className="mt-8 text-[11px] text-muted">La autenticación se gestiona con Supabase Auth.</p>
      </div>
    </div>
  )
}
