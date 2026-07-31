'use client'

import type { SpecificGift } from '../_types'

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'

function emptyGift(): SpecificGift {
  return {
    id: crypto.randomUUID(),
    type: 'item',
    description: '',
    amount: '',
    recipientName: '',
    recipientRelationship: '',
  }
}

interface Props {
  data: SpecificGift[]
  onChange: (data: SpecificGift[]) => void
}

export default function StepSpecificGifts({ data, onChange }: Props) {
  function updateGift(id: string, updates: Partial<SpecificGift>) {
    onChange(data.map((g) => (g.id === id ? { ...g, ...updates } : g)))
  }

  function removeGift(id: string) {
    onChange(data.filter((g) => g.id !== id))
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Specific Gifts</h2>
        <p className="text-sm text-[var(--neutral)] mt-1">
          Optional. Leave specific items or cash amounts to particular people before the
          remainder of your estate is distributed.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-[var(--line)]">
          <p className="text-sm text-[var(--neutral)] mb-1">No specific gifts added</p>
          <p className="text-xs text-[var(--neutral)] mb-4">
            You can skip this step if you have no specific gifts to make.
          </p>
          <button
            type="button"
            onClick={() => onChange([emptyGift()])}
            className="text-sm font-semibold px-4 py-2 border text-white transition-colors"
            style={{ backgroundColor: 'var(--teal)', borderColor: 'var(--teal)' }}
          >
            + Add a gift
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((gift, i) => (
            <div key={gift.id} className="p-5 border border-[var(--line)] bg-[var(--paper-warm)] space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--ink)]">Gift {i + 1}</p>
                <button
                  type="button"
                  onClick={() => removeGift(gift.id)}
                  className="text-xs text-[var(--neutral)] hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>

              {/* Type toggle */}
              <div className="flex border border-[var(--line)] w-fit">
                {(['item', 'cash'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateGift(gift.id, { type: t })}
                    className="px-4 py-1.5 text-sm font-medium transition-colors"
                    style={
                      gift.type === t
                        ? { backgroundColor: 'var(--teal)', color: '#fff' }
                        : { backgroundColor: 'transparent', color: 'var(--neutral)' }
                    }
                  >
                    {t === 'item' ? 'Item / Property' : 'Cash Amount'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gift.type === 'item' ? (
                  <div className="sm:col-span-2">
                    <label className={lbl}>Description <span className="text-red-400">*</span></label>
                    <input
                      required
                      className={inp}
                      placeholder="e.g. My gold watch, the family piano"
                      value={gift.description}
                      onChange={(e) => updateGift(gift.id, { description: e.target.value })}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className={lbl}>Amount <span className="text-red-400">*</span></label>
                      <input
                        required
                        className={inp}
                        placeholder="$0"
                        value={gift.amount}
                        onChange={(e) => updateGift(gift.id, { amount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={lbl}>Description (optional)</label>
                      <input
                        className={inp}
                        placeholder="e.g. For education expenses"
                        value={gift.description}
                        onChange={(e) => updateGift(gift.id, { description: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className={lbl}>Recipient name <span className="text-red-400">*</span></label>
                  <input
                    required
                    className={inp}
                    value={gift.recipientName}
                    onChange={(e) => updateGift(gift.id, { recipientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className={lbl}>Relationship</label>
                  <input
                    className={inp}
                    placeholder="e.g. Niece, Close friend"
                    value={gift.recipientRelationship}
                    onChange={(e) => updateGift(gift.id, { recipientRelationship: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => onChange([...data, emptyGift()])}
            className="text-sm font-medium text-[var(--teal)] transition-colors"
          >
            + Add another gift
          </button>
        </div>
      )}
    </div>
  )
}
