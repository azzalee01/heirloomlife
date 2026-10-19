/**
 * Vitest global setup — runs in the main process before any worker forks.
 *
 * Vite's loadEnv (used internally by Vitest) only pipes VITE_-prefixed vars
 * into worker process.env by default.  NEXT_PUBLIC_* and SUPABASE_* vars stay
 * out unless we inject them here.  Workers inherit process.env from the main
 * process, so setting them once here covers all test files.
 *
 * Using empty-string prefix loads every variable from all .env.[mode].* files,
 * including .env.test.local (highest priority), which overrides .env.local.
 */
import { loadEnv } from 'vite'

export default function globalSetup() {
  const env = loadEnv('test', process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value
  }
}
