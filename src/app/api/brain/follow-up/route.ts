import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handle DELETE for sequences
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const sequenceId = url.searchParams.get('sequence_id')

  if (!sequenceId) {
    return NextResponse.json({ error: 'sequence_id is required' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  const { error } = await supabase
    .from('follow_up_sequences')
    .delete()
    .eq('id', sequenceId)
    .eq('account_id', profile.account_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}