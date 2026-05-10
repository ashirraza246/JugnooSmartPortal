import { supabase, isSupabaseConfigured } from '@/lib/supabase'

function encodePassword(password: string): string {
  return Buffer.from(`JSP:${password}`).toString('base64')
}

// Admin secret code for team member registration
const ADMIN_SECRET = 'JUGNOO2025'

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { email, password, fullName, phone, adminCode } = await req.json()

    // If adminCode is provided, create admin user
    if (adminCode) {
      if (adminCode !== ADMIN_SECRET) {
        return Response.json({ error: 'Admin code ghalt hai. Sahi code daalein.' }, { status: 400 })
      }

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
        // Update existing user to admin role
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin', is_active: true })
          .eq('email', email)
          .select()
          .single()

        if (updateError) {
          return Response.json({ error: updateError.message }, { status: 400 })
        }

        // Store password
        const encodedPassword = encodePassword(password)
        await supabase.from('users').update({ avatar_url: encodedPassword }).eq('id', updatedUser.id)
        
        try {
          const { data: cred } = await supabase.from('user_credentials').select('id').eq('user_id', updatedUser.id).single()
          if (cred) {
            await supabase.from('user_credentials').update({ password_hash: password }).eq('user_id', updatedUser.id)
          } else {
            await supabase.from('user_credentials').insert([{ user_id: updatedUser.id, password_hash: password }])
          }
        } catch { /* ignore */ }

        return Response.json({
          message: 'Admin role assign ho gaya! Ab login karein.',
          user: { id: updatedUser.id, email: updatedUser.email, full_name: updatedUser.full_name, role: 'admin', phone: updatedUser.phone, is_active: true }
        })
      }

      // Create new admin user
      const encodedPassword = encodePassword(password)
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          email,
          full_name: fullName,
          role: 'admin',
          phone: phone || '',
          is_active: true,
          avatar_url: encodedPassword,
        }])
        .select()
        .single()

      if (error) {
        return Response.json({ error: error.message }, { status: 400 })
      }

      try {
        await supabase.from('user_credentials').insert([{ user_id: newUser.id, password_hash: password }])
      } catch { /* ignore */ }

      return Response.json({
        message: 'Admin account ban gaya hai! Ab login karein.',
        user: { id: newUser.id, email: newUser.email, full_name: newUser.full_name, role: 'admin', phone: newUser.phone, is_active: true }
      })
    }

    // Without adminCode - just ensure default admin exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'admin')
      .limit(1)

    if (existingAdmin && existingAdmin.length > 0) {
      return Response.json({ message: 'Admin already exists', admin: existingAdmin[0] })
    }

    const adminPasswordEncoded = encodePassword('jugnoo123')
    const { data, error } = await supabase.from('users').insert([{
      email: 'admin@jugnoo.pk',
      full_name: 'Admin User',
      role: 'admin',
      phone: '923001000000',
      is_active: true,
      avatar_url: adminPasswordEncoded,
    }]).select()

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    try {
      await supabase.from('user_credentials').insert([{ user_id: data[0].id, password_hash: 'jugnoo123' }])
    } catch { /* ignore */ }

    return Response.json({ message: 'Admin user created', admin: data[0] })
  } catch (error) {
    console.error('Setup admin error:', error)
    return Response.json({ error: 'Failed to setup admin' }, { status: 500 })
  }
}
