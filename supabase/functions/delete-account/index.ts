import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: corsHeaders })
  }

  const authorization = request.headers.get('Authorization')
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) {
    return Response.json({ error: 'A valid signed-in session is required.' }, { status: 401, headers: corsHeaders })
  }

  const projectUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!projectUrl || !anonKey || !serviceRoleKey) {
    return Response.json({ error: 'Account deletion is not configured on the Supabase project.' }, { status: 503, headers: corsHeaders })
  }

  const userClient = createClient(projectUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user }, error: verifyError } = await userClient.auth.getUser(token)
  if (verifyError || !user) {
    return Response.json({ error: 'The signed-in session could not be verified.' }, { status: 401, headers: corsHeaders })
  }

  const adminClient = createClient(projectUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
  if (deleteError) {
    return Response.json({ error: 'The account could not be deleted. Try again later.' }, { status: 500, headers: corsHeaders })
  }

  return Response.json({ success: true }, { headers: corsHeaders })
})
