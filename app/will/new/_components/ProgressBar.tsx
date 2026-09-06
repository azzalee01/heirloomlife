interface Props {
  steps: string[]
  currentIndex: number
  onStepClick?: (index: number) => void
}

export default function ProgressBar({ steps, currentIndex, onStepClick }: Props) {
  return (
    <div>
      {/* Segmented track */}
      <div className="flex items-center gap-0.5 mb-3">
        {steps.map((_, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <div
              key={i}
              className="h-1 flex-1 transition-all duration-300"
              style={{
                backgroundColor: done || active ? 'var(--teal)' : 'var(--line)',
                opacity: active ? 0.7 : done ? 1 : 1,
              }}
            />
          )
        })}
      </div>

      {/* Step label + chips */}
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
          {steps[currentIndex]}
        </p>
        <p className="text-xs shrink-0" style={{ color: 'var(--neutral)' }}>
          {currentIndex + 1} / {steps.length}
        </p>
      </div>

      {/* Clickable step chips — desktop only */}
      <div className="mt-2 hidden sm:flex flex-wrap gap-1">
        {steps.map((label, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          const clickable = done && !!onStepClick
          return (
            <button
              type="button"
              key={i}
              disabled={!clickable}
              onClick={() => clickable && onStepClick!(i)}
              className={`text-xs px-2 py-0.5 border font-medium transition-colors ${
                clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
              }`}
              style={
                active
                  ? { backgroundColor: 'var(--teal)', color: '#fff', borderColor: 'var(--teal)' }
                  : done
                  ? { color: 'var(--teal)', borderColor: 'var(--teal)', backgroundColor: 'rgba(42,180,174,0.06)' }
                  : { color: 'var(--neutral)', borderColor: 'var(--line)' }
              }
            >
              {done && '✓ '}
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
