import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// Simple encoding for password storage (NOT for production - use bcrypt in production)
function encodePassword(password: string): string {
  return Buffer.from(`JSP:${password}`).toString('base64')
}

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { email, password, fullName, phone } = await req.json()

    if (!email || !password || !fullName) {
      return Response.json({ error: 'Email, password aur naam chahiye' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password kam az kam 6 characters ka hona chahiye' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (existingUser && existingUser.length > 0) {
      return Response.json({ error: 'Yeh email pehle se registered hai' }, { status: 400 })
    }

    // Try to store password in user_credentials table first
    let credentialsStored = false
    const encodedPassword = encodePassword(password)

    // Create user in users table
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email,
        full_name: fullName,
        role: 'customer',
        phone: phone || '',
        is_active: true,
        avatar_url: encodedPassword, // Fallback: store encoded password in avatar_url
      }])
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    // Try to also store in user_credentials table (if it exists)
    const { error: credError } = await supabase
      .from('user_credentials')
      .insert([{
        user_id: newUser.id,
        password_hash: password,
      }])

    if (!credError) {
      credentialsStored = true
    }

    return Response.json({
      message: 'Account ban gaya hai! Ab login karein.',
      credentialsStored,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        phone: newUser.phone,
        is_active: newUser.is_active,
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    return Response.json({ error: 'Registration failed. Dobara try karein.' }, { status: 500 })
  }
}
