import { supabase, isSupabaseConfigured } from '@/lib/supabase'

function encodePassword(password: string): string {
  return Buffer.from(`JSP:${password}`).toString('base64')
}

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { email, newPassword } = await req.json()

    if (!email) {
      return Response.json({ error: 'Email chahiye' }, { status: 400 })
    }

    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (!user) {
      // Don't reveal if email exists or not
      return Response.json({ message: 'Agar yeh email registered hai, toh password reset ho jayega.' })
    }

    // If newPassword is provided, reset the password
    if (newPassword) {
      if (newPassword.length < 6) {
        return Response.json({ error: 'Password kam az kam 6 characters ka hona chahiye' }, { status: 400 })
      }

      // Update password in avatar_url
      const encodedPassword = encodePassword(newPassword)
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: encodedPassword })
        .eq('id', user.id)

      if (updateError) {
        return Response.json({ error: 'Password reset nahi ho saka. Dobara try karein.' }, { status: 500 })
      }

      // Also try to update in user_credentials table
      try {
        const { data: cred } = await supabase
          .from('user_credentials')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (cred) {
          await supabase
            .from('user_credentials')
            .update({ password_hash: newPassword })
            .eq('user_id', user.id)
        } else {
          await supabase
            .from('user_credentials')
            .insert([{ user_id: user.id, password_hash: newPassword }])
        }
      } catch {
        // user_credentials table might not exist, that's ok
      }

      return Response.json({ message: 'Password update ho gaya hai! Ab login karein.' })
    }

    // If no newPassword, just confirm email exists
    return Response.json({ message: 'Agar yeh email registered hai, toh password reset ho jayega.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return Response.json({ error: 'Password reset nahi ho saka. Dobara try karein.' }, { status: 500 })
  }
}
