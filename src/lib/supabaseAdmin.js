/**
 * Supabase Admin Client — СЕРВЕРНЫЙ (service_role)
 * ⚠️ ТОЛЬКО для API routes! НИКОГДА не импортировать в клиентский код!
 * 
 * Env переменные (добавить в Vercel → Settings → Environment Variables):
 *   SUPABASE_URL=https://xxxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
 * 
 * ⚠️ БЕЗ префикса NEXT_PUBLIC_ — иначе утечёт в браузер!
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
  console.error('⚠️ SUPABASE_SERVICE_ROLE_KEY не задан! Admin API routes не будут работать.')
}

const supabaseAdmin = serviceRoleKey && supabaseUrl
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

export default supabaseAdmin
