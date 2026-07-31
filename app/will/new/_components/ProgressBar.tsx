interface Props {
  steps: string[]
  currentIndex: number
  onStepClick?: (index: number) => void
}

export default function ProgressBar({ steps, currentIndex, onStepClick }: Props) {
  const pct = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-[var(--ink)]">{steps[currentIndex]}</p>
        <p className="text-xs text-[var(--neutral)]">
          Step {currentIndex + 1} of {steps.length}
        </p>
      </div>

      {/* Track */}
      <div className="h-px bg-[var(--line)] overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(2, pct)}%`, backgroundColor: 'var(--teal)' }}
        />
      </div>

      {/* Step chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
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
              className={`text-xs px-2.5 py-0.5 border font-medium transition-colors ${
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
