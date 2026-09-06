'use client'

import type { Asset, AssetType } from '../_types'
import TriageFlag from './TriageFlag'

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  real_estate: 'Real Estate',
  bank_account: 'Bank Account',
  superannuation: 'Superannuation',
  shares: 'Shares / Investments',
  life_insurance: 'Life Insurance',
  vehicle: 'Vehicle',
  digital_asset: 'Cryptocurrency',
  other: 'Other',
}

function emptyCryptoAsset(): Asset {
  return {
    id: crypto.randomUUID(),
    assetType: 'digital_asset', ownershipType: 'sole', propertyAddress: '', estimatedValue: '',
    bankName: '', bsb: '', accountNumber: '', fundName: '', memberNumber: '',
    companyName: '', numberOfShares: '', insurerName: '', policyNumber: '',
    coverAmount: '', make: '', model: '', year: '', rego: '', description: '', otherValue: '',
    accessLocation: '',
    hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '',
  }
}

function emptyAsset(): Asset {
  return {
    id: crypto.randomUUID(),
    assetType: '', ownershipType: '', propertyAddress: '', estimatedValue: '',
    bankName: '', bsb: '', accountNumber: '', fundName: '', memberNumber: '',
    companyName: '', numberOfShares: '', insurerName: '', policyNumber: '',
    coverAmount: '', make: '', model: '', year: '', rego: '', description: '', otherValue: '',
    accessLocation: '',
    hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '',
  }
}

function DeathBenefitNomination({ asset, onChange, kind }: { asset: Asset; onChange: (asset: Asset) => void; kind: 'super' | 'insurance' }) {
  return (
    <div className="border border-amber-100 bg-amber-50 p-3 space-y-2">
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={asset.hasDeathBenefitNomination}
          onChange={(e) => onChange({ ...asset, hasDeathBenefitNomination: e.target.checked })}
          className="w-4 h-4 mt-0.5 accent-[var(--teal)]"
        />
        <span className="text-xs text-amber-700">
          This {kind === 'super' ? 'super fund' : 'policy'} has a binding death benefit nomination on file with
          the provider. <strong>Note:</strong> {kind === 'super' ? 'superannuation' : 'life insurance proceeds'} often
          pass directly to the nominated person and are not controlled by this will.
        </span>
      </label>
      {asset.hasDeathBenefitNomination && (
        <input
          className={inp}
          placeholder="Nominated beneficiary/ies"
          value={asset.deathBenefitNominees}
          onChange={(e) => onChange({ ...asset, deathBenefitNominees: e.target.value })}
        />
      )}
    </div>
  )
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

      {asset.ownershipType === 'joint_tenants' && (
        <div className="border border-amber-100 bg-amber-50 px-3 py-2.5">
          <p className="text-xs text-amber-700">
            Assets held as joint tenants pass automatically to the surviving owner and are <strong>not</strong>{' '}
            distributed by this will.
          </p>
        </div>
      )}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Estimated value (optional)</label>
            <input className={inp} placeholder="$0" value={asset.estimatedValue} onChange={(e) => set('estimatedValue', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Description (optional)</label>
            <input className={inp} placeholder="e.g. everyday account, savings account" value={asset.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </div>
      )}

      {asset.assetType === 'superannuation' && (
        <div className="space-y-4">
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
          <DeathBenefitNomination asset={asset} onChange={onChange} kind="super" />
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
        <div className="space-y-4">
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
          <DeathBenefitNomination asset={asset} onChange={onChange} kind="insurance" />
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

      {asset.assetType === 'digital_asset' && (
        <div className="space-y-4">
          <div className="border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-700 space-y-1">
            <p><strong>Disclosure only.</strong> Record what you hold and where your access instructions are kept. Do not enter passwords, seed phrases, or private keys here - Wills become public on probate.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Description <span className="text-red-400">*</span></label>
              <input className={inp} placeholder="e.g. Bitcoin on Coinbase, Ethereum cold wallet" value={asset.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Estimated value (optional)</label>
              <input className={inp} placeholder="$0" value={asset.estimatedValue} onChange={(e) => set('estimatedValue', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={lbl}>Where are the access instructions kept?</label>
            <input
              className={inp}
              placeholder="e.g. Sealed envelope with my executor, safe at home, LastPass vault"
              value={asset.accessLocation}
              onChange={(e) => set('accessLocation', e.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--neutral)]">Location only - not the credentials themselves.</p>
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

      {asset.assetType && (
        <div className="pt-1 space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={asset.isOverseas}
              onChange={(e) => onChange({ ...asset, isOverseas: e.target.checked })}
              className="w-4 h-4 accent-[var(--teal)]"
            />
            <span className="text-sm text-[var(--ink)]">This asset is located outside Australia</span>
          </label>
          {asset.isOverseas && (
            <input
              className={inp}
              placeholder="Which country?"
              value={asset.overseasCountry}
              onChange={(e) => onChange({ ...asset, overseasCountry: e.target.value })}
            />
          )}
          {asset.isOverseas && <TriageFlag />}
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
  const nonCryptoAssets = data.filter((a) => a.assetType !== 'digital_asset')
  const cryptoAssets = data.filter((a) => a.assetType === 'digital_asset')

  function updateAsset(id: string, updated: Asset) {
    onChange(data.map((a) => (a.id === id ? updated : a)))
  }

  function removeAsset(id: string) {
    onChange(data.filter((a) => a.id !== id))
  }

  function addAsset() {
    onChange([...data, emptyAsset()])
  }

  function addCryptoAsset() {
    onChange([...data, emptyCryptoAsset()])
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Assets</h2>
        <p className="text-sm text-[var(--neutral)] mt-1">
          List the assets you wish to include in your estate.
        </p>
      </div>

      {data.filter((a) => a.assetType !== 'digital_asset').length === 0 ? (
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
          {nonCryptoAssets.map((asset, i) => (
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

      {/* Cryptocurrency prompt */}
      <div className="border border-[var(--line)] bg-[var(--paper-warm)] p-5 space-y-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">Do you hold any cryptocurrency?</p>
          <p className="text-xs text-[var(--neutral)] mt-0.5">
            Bitcoin, Ethereum, or other digital assets can be listed in your estate register for your executor to locate.
          </p>
        </div>

        {cryptoAssets.length > 0 && (
          <div className="space-y-4">
            {cryptoAssets.map((asset, i) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                index={i}
                showRemove
                onChange={(updated) => updateAsset(asset.id, updated)}
                onRemove={() => removeAsset(asset.id)}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addCryptoAsset}
          className="text-sm font-medium text-[var(--teal)] transition-colors"
        >
          + {cryptoAssets.length === 0 ? 'Yes, add cryptocurrency' : 'Add another'}
        </button>
      </div>
    </div>
  )
}
