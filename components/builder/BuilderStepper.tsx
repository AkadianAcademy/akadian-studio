'use client'
import { useLessonStore } from '@/store/lessonStore'
import { useRouter } from 'next/navigation'

const STEPS = [
  { number: 1, label: 'Setup', icon: '⚙️' },
  { number: 2, label: 'Vocab', icon: '📚' },
  { number: 3, label: 'Practice 1', icon: '✍️' },
  { number: 4, label: 'Practice 2', icon: '🗣' },
  { number: 5, label: 'Preview', icon: '👁' },
]

const LOGO = "https://cdn.prod.website-files.com/67ec5d3b9fe28b1225c054c2/6a4ee16b45f610e39d0ba946_Frame%2032.png"

export default function BuilderStepper() {
  const { currentStep, setCurrentStep, lessonId, setup, slug } = useLessonStore()
  const router = useRouter()
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');
        .stepper-wrap {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(16px,3vw,32px); height: 64px;
          background: #fff;
          border-bottom: 1px solid rgba(91,60,224,0.08);
          font-family: 'Hanken Grotesk', sans-serif;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 1px 12px rgba(91,60,224,0.06);
        }
        .stepper-left { display: flex; align-items: center; gap: 12px; }
        .stepper-back { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 999px; border: 1.5px solid rgba(91,60,224,0.15); background: transparent; color: #6B6575; font-family: 'Hanken Grotesk', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; min-height: 36px; }
        .stepper-back:hover { border-color: rgba(91,60,224,0.35); color: #5B3CE0; background: rgba(91,60,224,0.04); }
        .stepper-logo { display: flex; align-items: center; gap: 8px; }
        .stepper-logo img { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid rgba(91,60,224,0.2); }
        .stepper-logo-text { font-size: 13px; font-weight: 700; color: #1A1219; }
        .stepper-steps { display: flex; align-items: center; gap: 4px; }
        .step-item { display: flex; align-items: center; gap: 4px; }
        .step-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; border: 1.5px solid transparent; font-family: 'Hanken Grotesk', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.25s; min-height: 34px; white-space: nowrap; }
        .step-done { background: rgba(200,255,61,0.1); border-color: rgba(200,255,61,0.3); color: #3A7D00; cursor: pointer; }
        .step-done:hover { background: rgba(200,255,61,0.18); }
        .step-active { background: linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%); border-color: transparent; color: #fff; box-shadow: 0 4px 14px rgba(91,60,224,0.3); }
        .step-upcoming { background: transparent; border-color: rgba(0,0,0,0.08); color: #A09AB0; cursor: default; }
        .step-num { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; }
        .step-connector { width: 20px; height: 1.5px; background: rgba(0,0,0,0.08); border-radius: 2px; flex-shrink: 0; }
        .step-connector-done { background: rgba(200,255,61,0.4); }
        .stepper-right { display: flex; align-items: center; gap: 10px; }
        .preview-link { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 999px; background: rgba(91,60,224,0.06); border: 1.5px solid rgba(91,60,224,0.15); color: #7B5CFF; font-size: 12px; font-weight: 600; font-family: 'Hanken Grotesk', sans-serif; cursor: pointer; transition: all 0.2s; text-decoration: none; min-height: 36px; }
        .preview-link:hover { background: rgba(91,60,224,0.12); border-color: rgba(91,60,224,0.3); }
        .preview-link-live { background: rgba(200,255,61,0.1); border-color: rgba(200,255,61,0.3); color: #3A7D00; }
        @media (max-width: 768px) {
          .stepper-logo-text { display: none; }
          .step-btn span:last-child { display: none; }
          .stepper-steps { gap: 2px; }
          .step-btn { padding: 6px 10px; }
        }
      `}</style>
      <div className="stepper-wrap">
        <div className="stepper-left">
          <button className="stepper-back" onClick={() => router.push('/dashboard')}>← Dashboard</button>
          <div className="stepper-logo">
            <img src={LOGO} alt="Akadian" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
            <span className="stepper-logo-text">Akadian Lesson Builder</span>
          </div>
        </div>

        <div className="stepper-steps">
          {STEPS.map((step, i) => {
            const isDone = currentStep > step.number
            const isActive = currentStep === step.number
            const isUpcoming = currentStep < step.number
            return (
              <div key={step.number} className="step-item">
                <button
                  className={`step-btn ${isDone ? 'step-done' : isActive ? 'step-active' : 'step-upcoming'}`}
                  onClick={() => isDone && setCurrentStep(step.number)}
                  disabled={isUpcoming}
                >
                  <span className="step-num"
                    style={{
                      background: isDone ? 'rgba(58,125,0,0.15)' : isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                      color: isDone ? '#3A7D00' : isActive ? '#fff' : '#A09AB0'
                    }}>
                    {isDone ? '✓' : step.number}
                  </span>
                  <span>{step.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`step-connector ${isDone ? 'step-connector-done' : ''}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="stepper-right">
          {slug ? (
            <a href={`/lesson/${slug}`} target="_blank" className="preview-link preview-link-live">
              ✓ Public preview ↗
            </a>
          ) : (
            <div className="preview-link" style={{ opacity: 0.5, cursor: 'default' }}>
              Public preview ↗
            </div>
          )}
        </div>
      </div>
    </>
  )
}
