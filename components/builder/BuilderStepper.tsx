'use client'
import { useLessonStore } from '@/store/lessonStore'
import { useRouter } from 'next/navigation'

const STEPS = [
  { number: 1, label: 'Setup' },
  { number: 2, label: 'Vocab' },
  { number: 3, label: 'Practice' },
  { number: 4, label: 'Preview' },
]

export default function BuilderStepper() {
  const { currentStep, setCurrentStep, lessonId, setup, slug } = useLessonStore()
  const router = useRouter()
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  const previewSlug = slug || ''

  function handleStepClick(stepNumber: number) {
    if (stepNumber < currentStep) setCurrentStep(stepNumber)
    if (stepNumber > currentStep && lessonId && stepNumber <= currentStep + 1) setCurrentStep(stepNumber)
  }

  function canClick(stepNumber: number) {
    if (stepNumber < currentStep) return true
    if (stepNumber <= currentStep + 1 && lessonId) return true
    return false
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', width: '100%' }}>
        <div style={{
          height: '100%', width: progress + '%',
          background: 'linear-gradient(90deg, #ff4b55, #00bc7c)',
          transition: 'width 0.5s ease',
          borderRadius: '0 2px 2px 0'
        }} />
      </div>

      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '8px', padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Logo + back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '24px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            ← Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="https://cdn.prod.website-files.com/67ec5d3b9fe28b1225c054c2/69cbd2f11214dfc14b33eadb_logo%20akadian.png"
              style={{ width: 28, height: 28, borderRadius: '50%' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 500 }}>
              Akadian Lesson Builder
            </span>
          </div>
        </div>

        {/* Steps */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {STEPS.map((step, i) => {
            const done = currentStep > step.number
            const active = currentStep === step.number
            const clickable = canClick(step.number)
            return (
              <div key={step.number} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  onClick={() => handleStepClick(step.number)}
                  title={done ? 'Go back to ' + step.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '6px 14px', borderRadius: '100px',
                    background: active ? 'rgba(255,75,85,0.15)' : done ? 'rgba(0,188,124,0.1)' : 'transparent',
                    border: '1px solid ' + (active ? 'rgba(255,75,85,0.4)' : done ? 'rgba(0,188,124,0.3)' : 'rgba(255,255,255,0.08)'),
                    transition: 'all 0.2s ease',
                    cursor: clickable ? 'pointer' : 'default',
                    opacity: !active && !done && !clickable ? 0.4 : 1,
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? '#ff4b55' : done ? '#00bc7c' : 'rgba(255,255,255,0.08)',
                    fontSize: '11px', fontWeight: 600,
                    color: active || done ? '#fff' : 'rgba(255,255,255,0.3)',
                    flexShrink: 0,
                  }}>
                    {done ? '✓' : step.number}
                  </div>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : done ? '#00bc7c' : 'rgba(255,255,255,0.35)',
                  }}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Public preview button */}
        {lessonId && previewSlug ? (
          <a
            href={'/lesson/' + previewSlug}
            target="_blank"
            style={{
              padding: '6px 14px', borderRadius: '100px',
              border: '1px solid rgba(0,188,124,0.3)',
              fontSize: '12px', color: '#00bc7c',
              display: 'flex', alignItems: 'center', gap: '6px',
              textDecoration: 'none',
              background: 'rgba(0,188,124,0.08)',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bc7c', animation: 'blink 2s ease-in-out infinite' }} />
            Public preview ↗
          </a>
        ) : (
          <div style={{
            padding: '6px 14px', borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '12px', color: 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            Public preview
          </div>
        )}
      </div>
    </div>
  )
}
