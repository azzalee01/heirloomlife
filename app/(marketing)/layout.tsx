import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main style={{ paddingTop: 76 }}>
        {children}
      </main>
      <MarketingFooter />
    </>
  )
}
