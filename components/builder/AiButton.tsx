'use client'

interface Props {
  label: string
  loadingLabel?: string
  loading: boolean
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export default function AiButton({ label, loadingLabel, loading, onClick, variant = 'primary', disabled }: Props) {
  const isPrimary = variant === 'primary'

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        padding: '9px 16px', borderRadius: '10px',
        background: isPrimary ? 'rgba(255,75,85,0.12)' : 'rgba(0,188,124,0.1)',
        border: `1px solid ${isPrimary ? 'rgba(255,75,85,0.3)' : 'rgba(0,188,124,0.25)'}`,
        color: isPrimary ? '#ff4b55' : '#00bc7c',
        fontSize: '13px', fontWeight: 600,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? (
        <>
          <div style={{
            width: 13, height: 13,
            border: `2px solid ${isPrimary ? 'rgba(255,75,85,0.3)' : 'rgba(0,188,124,0.3)'}`,
            borderTopColor: isPrimary ? '#ff4b55' : '#00bc7c',
            borderRadius: '50%',
            animation: 'spin 0.65s linear infinite',
            flexShrink: 0,
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          {loadingLabel || label}
        </>
      ) : (
        <>
          <span style={{ fontSize: '14px' }}>{isPrimary ? '✦' : '✢'}</span>
          {label}
        </>
      )}
    </button>
  )
}
