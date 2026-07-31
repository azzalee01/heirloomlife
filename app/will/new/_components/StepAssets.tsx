'use client'

import type { Asset, AssetType } from '../_types'

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  real_estate: 'Real Estate',
  bank_account: 'Bank Account',
  superannuation: 'Superannuation',
  shares: 'Shares / Investments',
  life_insurance: 'Life Insurance',
  vehicle: 'Vehicle',
  other: 'Other',
}

function emptyAsset(): Asset {
  return {
    id: crypto.randomUUID(),
    assetType: '', ownershipType: '', propertyAddress: '', estimatedValue: '',
    bankName: '', bsb: '', accountNumber: '', fundName: '', memberNumber: '',
    companyName: '', numberOfShares: '', insurerName: '', policyNumber: '',
    coverAmount: '', make: '', model: '', year: '', rego: '', description: '', otherValue: '',
  }
}

interface AssetCardProps {
  asset: Asset
  index: number
  showRemove: boolean
  onChange: (asset: Asset) => void
  onRemove: () => void
}

function AssetCard({ asset, index, showRemove, onChange, onRemove }: AssetCardProps) {
  function set(field: keyof Asset, value: string) {
    onChange({ ...asset, [field]: value })
  }

  return (
    <div className="p-5 border border-[var(--line)] bg-[var(--paper-warm)] space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--ink)]">Asset {index + 1}</p>
        {showRemove && (
          <button type="button" onClick={onRemove} className="text-xs text-[var(--neutral)] hover:text-red-500 transition-colors">
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Asset type <span className="text-red-400">*</span></label>
          <select required className={inp} value={asset.assetType} onChange={(e) => set('assetType', e.target.value)}>
            <option value="">Select type…</option>
            {(Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map((t) => (
              <option key={t} value={t}>{ASSET_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Ownership <span className="text-red-400">*</span></label>
          <select required className={inp} value={asset.ownershipType} onChange={(e) => set('ownershipType', e.target.value)}>
            <option value="">Select…</option>
            <option value="sole">Sole ownership</option>
            <option value="joint_tenants">Joint ownership (joint tenants)</option>
            <option value="tenants_in_common">Joint ownership (tenants in common)</option>
          </select>
        </div>
      </div>

      {asset.assetType === 'real_estate' && (
        <div className="space-y-3">
          <div>
            <label className={lbl}>Property address</label>
            <input className={inp} placeholder="Full address" value={asset.propertyAddress} onChange={(e) => set('propertyAddress', e.target.value)} />
          </div>
          <div className="sm:max-w-xs">
            <label className={lbl}>Estimated value</label>
            <input className={inp} placeholder="$0" value={asset.estimatedValue} onChange={(e) => set('estimatedValue', e.target.value)} />
          </div>
        </div>
      )}

      {asset.assetType === 'bank_account' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={lbl}>Bank name</label>
            <input className={inp} placeholder="e.g. Commonwealth Bank" value={asset.bankName} onChange={(e) => set('bankName', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>BSB</label>
            <input className={inp} placeholder="000-000" value={asset.bsb} onChange={(e) => set('bsb', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Account number</label>
            <input className={inp} value={asset.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} />
          </div>
        </div>
      )}

      {asset.assetType === 'superannuation' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Fund name</label>
            <input className={inp} placeholder="e.g. AustralianSuper" value={asset.fundName} onChange={(e) => set('fundName', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Member number</label>
            <input className={inp} value={asset.memberNumber} onChange={(e) => set('memberNumber', e.target.value)} />
          </div>
        </div>
      )}

      {asset.assetType === 'shares' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Company / Fund name</label>
            <input className={inp} placeholder="e.g. BHP, Vanguard ETF" value={asset.companyName} onChange={(e) => set('companyName', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Number of shares / units</label>
            <input className={inp} value={asset.numberOfShares} onChange={(e) => set('numberOfShares', e.target.value)} />
          </div>
        </div>
      )}

      {asset.assetType === 'life_insurance' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={lbl}>Insurer</label>
            <input className={inp} placeholder="e.g. TAL" value={asset.insurerName} onChange={(e) => set('insurerName', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Policy number</label>
            <input className={inp} value={asset.policyNumber} onChange={(e) => set('policyNumber', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Cover amount</label>
            <input className={inp} placeholder="$0" value={asset.coverAmount} onChange={(e) => set('coverAmount', e.target.value)} />
          </div>
        </div>
      )}

      {asset.assetType === 'vehicle' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className={lbl}>Make</label>
            <input className={inp} placeholder="Toyota" value={asset.make} onChange={(e) => set('make', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Model</label>
            <input className={inp} placeholder="Camry" value={asset.model} onChange={(e) => set('model', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Year</label>
            <input className={inp} placeholder="2020" maxLength={4} value={asset.year} onChange={(e) => set('year', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Registration</label>
            <input className={inp} placeholder="ABC123" value={asset.rego} onChange={(e) => set('rego', e.target.value)} />
          </div>
        </div>
      )}

      {asset.assetType === 'other' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Description</label>
            <input className={inp} placeholder="Describe the asset" value={asset.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Estimated value</label>
            <input className={inp} placeholder="$0" value={asset.otherValue} onChange={(e) => set('otherValue', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  data: Asset[]
  onChange: (data: Asset[]) => void
}

export default function StepAssets({ data, onChange }: Props) {
  function updateAsset(id: string, updated: Asset) {
    onChange(data.map((a) => (a.id === id ? updated : a)))
  }

  function removeAsset(id: string) {
    onChange(data.filter((a) => a.id !== id))
  }

  function addAsset() {
    onChange([...data, emptyAsset()])
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Assets</h2>
        <p className="text-sm text-[var(--neutral)] mt-1">
          List the assets you wish to include in your estate.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-[var(--line)]">
          <p className="text-sm text-[var(--neutral)] mb-3">No assets added yet</p>
          <button
            type="button"
            onClick={addAsset}
            className="text-sm font-semibold px-4 py-2 border text-white transition-colors"
            style={{ backgroundColor: 'var(--teal)', borderColor: 'var(--teal)' }}
          >
            + Add asset
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((asset, i) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              index={i}
              showRemove={data.length > 0}
              onChange={(updated) => updateAsset(asset.id, updated)}
              onRemove={() => removeAsset(asset.id)}
            />
          ))}

          <button
            type="button"
            onClick={addAsset}
            className="text-sm font-medium text-[var(--teal)] transition-colors"
          >
            + Add another asset
          </button>
        </div>
      )}
    </div>
  )
}
