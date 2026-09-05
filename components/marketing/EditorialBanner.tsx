import Image from 'next/image'

type Props = {
  src: string
  alt: string
  position?: string
}

export default function EditorialBanner({ src, alt, position = 'center' }: Props) {
  return (
    <div style={{ position: 'relative', height: 'clamp(14rem, 31vw, 21rem)', marginTop: '2.75rem', overflow: 'hidden', border: '1px solid var(--mkt-line)', borderRadius: 16, background: 'var(--mkt-surface)' }}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1240px"
        style={{ objectFit: 'cover', objectPosition: position, filter: 'saturate(.78)', transform: 'scale(1.01)' }}
      />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(244,247,246,.42) 0%, rgba(244,247,246,.06) 42%, transparent 72%)' }} />
    </div>
  )
}
