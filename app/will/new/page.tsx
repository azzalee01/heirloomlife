import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { loadWillFormData } from './_data'
import type { StepId } from './_types'
import { STEP_IDS } from './_types'
import WillWizard from './_components/WillWizard'

export default async function WillNewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const willIdParam = typeof params.willId === 'string' ? params.willId : undefined
  const stepParam = typeof params.step === 'string' ? params.step : undefined
  const initialStep = (STEP_IDS as readonly string[]).includes(stepParam ?? '')
    ? (stepParam as StepId)
    : undefined

  const { formData } = await loadWillFormData(supabase, user.id, willIdParam)

  return <WillWizard initialData={formData} initialStep={initialStep} />
}
