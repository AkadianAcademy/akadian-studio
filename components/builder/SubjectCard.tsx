'use client'

interface Props {
  icon: string
  label: string
  description: string
  active: boolean
  comingSoon?: boolean
  onClick: () => void
}

export default function SubjectCard({ icon, label, description, active, comingSoon, onClick }: Props) {
  return (
    <div
      onClick={comingSoon ? undefined : onClick}
      style={{
        padding: '20px',
        borderRadius: '14px',
        border: `1px solid ${active ? 'rgba(255,75,85,0.5)' : 'rgba(255,255,255,0.07)'}`,
        background: active ? 'rgba(255,75,85,0.1)' : 'rgba(255,255,255,0.03)',
        cursor: comingSoon ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        opacity: comingSoon ? 0.5 : 1,
      }}
    >
      {comingSoon && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          padding: '3px 8px', borderRadius: '100px',
          background: 'rgba(255,255,255,0.06)',
          fontSize: '10px', color: 'rgba(255,255,255,0.3)',
          fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase'
        }}>
          Coming soon
        </div>
      )}
      <div style={{
        width: 40, height: 40, borderRadius: '10px',
        background: active ? '#ff4b55' : 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', marginBottom: '12px',
        transition: 'background 0.2s'
      }}>
        {icon}
      </div>
      <p style={{
        fontSize: '14px', fontWeight: 600,
        color: active ? '#fff' : 'rgba(255,255,255,0.7)',
        marginBottom: '4px'
      }}>
        {label}
      </p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.5' }}>
        {description}
      </p>
    </div>
  )
}
