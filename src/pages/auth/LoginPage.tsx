import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display font-semibold text-2xl mb-2">Calendar</h1>
        <p className="text-sm text-muted mb-8">Tu calendario, en lenguaje natural.</p>
        <Button variant="primary" className="w-full py-2.5">
          Continuar con Google
        </Button>
      </div>
    </div>
  )
}
