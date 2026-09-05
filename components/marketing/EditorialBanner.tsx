import Image from 'next/image'

type Props = {
  src: string
  alt: string
  position?: string
}

export default function EditorialBanner({ src, alt, position = 'center' }: Props) {
  return (
    <div className="editorial-hero-image" style={{ background: 'var(--mkt-surface)' }}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1240px"
        style={{ objectFit: 'cover', objectPosition: position, transform: 'scale(1.01)' }}
      />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(90deg, var(--mkt-surface-2) 0%, rgba(244,247,246,.94) 10%, rgba(244,247,246,.42) 30%, transparent 58%)' }} />
    </div>
  )
}
