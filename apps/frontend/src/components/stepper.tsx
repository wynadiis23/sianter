import { CheckCircle2 } from 'lucide-react'

interface StepperProps {
  steps: string[]
  current: number
  error?: boolean
}

export function Stepper({ steps, current, error }: StepperProps) {
  return (
    <nav aria-label="Langkah" className="border-b border-border bg-card">
      <ol className="mx-auto flex max-w-xl items-center justify-center gap-0 px-4 py-4">
        {steps.map((label, i) => {
          const step = i + 1
          const isActive = step === current
          const isCompleted = step < current
          const isError = error && isActive

          return (
            <li key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors
                    ${isError ? 'bg-destructive text-destructive-foreground' : ''}
                    ${isActive && !isError ? 'bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2 ring-offset-card' : ''}
                    ${isCompleted ? 'bg-primary/10 text-primary' : ''}
                    ${!isActive && !isCompleted && !isError ? 'bg-muted text-muted-foreground/40' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <span className="font-bold">{step}</span>
                  )}
                </div>
                <span
                  className={`hidden whitespace-nowrap text-xs sm:block font-wordmark
                    ${isActive ? 'font-semibold text-foreground' : ''}
                    ${isCompleted ? 'text-muted-foreground' : ''}
                    ${!isActive && !isCompleted ? 'text-muted-foreground/40' : ''}`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 mb-6 h-px w-10 sm:w-16 md:w-24
                    ${step <= current ? 'bg-primary/30' : 'bg-border'}`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}