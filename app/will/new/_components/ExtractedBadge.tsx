export default function ExtractedBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
      color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a',
      borderRadius: 3, padding: '1px 5px', marginBottom: 3,
    }}>
      from your uploaded Will
    </span>
  )
}
