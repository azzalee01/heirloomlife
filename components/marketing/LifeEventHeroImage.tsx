import Image from 'next/image'

// Renders a life-event hero illustration with a top and bottom fade mask so the
// artwork melts into the page background rather than sitting in a hard-edged box.
// Top fade: transparent→opaque over the first 12% (copies the near-white left
// fade already baked into the source images).
// Bottom fade: opaque→transparent over the last 18%.
export default function LifeEventHeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      style={{
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 12%, black 82%, transparent 100%)',
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 12%, black 82%, transparent 100%)',
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={1080}
        height={830}
        priority
        quality={85}
        sizes="(min-width: 1024px) 560px, 100vw"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  )
}
