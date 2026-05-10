import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// GET - List all team members (admin users)
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, phone, is_active, created_at')
      .in('role', ['admin', 'staff'])
      .order('created_at', { ascending: true })

    if (error) {
      // Try just admin role
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('id, email, full_name, role, phone, is_active, created_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: true })

      if (adminError) {
        return Response.json({ members: [] })
      }

      return Response.json({ members: adminData || [] })
    }

    return Response.json({ members: data || [] })
  } catch (error) {
    console.error('Team GET error:', error)
    return Response.json({ members: [] })
  }
}

// POST - Add new team member (admin user)
export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { email, fullName, phone, password, role } = body

    if (!email || !fullName || !password) {
      return Response.json({ error: 'Email, naam aur password zaroori hai' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Update existing user to admin role
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: role || 'admin',
          full_name: fullName,
          phone: phone || null,
          is_active: true,
        })
        .eq('id', existingUser.id)

      if (updateError) {
        return Response.json({ error: updateError.message }, { status: 400 })
      }

      // Update password in credentials
      try {
        const { error: credError } = await supabase
          .from('user_credentials')
          .upsert({
            user_id: existingUser.id,
            password_hash: password,
          }, { onConflict: 'user_id' })

        if (credError) {
          // Try saving in avatar_url as fallback
          await supabase.from('users').update({
            avatar_url: Buffer.from(`JSP:${password}`).toString('base64'),
          }).eq('id', existingUser.id)
        }
      } catch {
        // Fallback: save in avatar_url
        await supabase.from('users').update({
          avatar_url: Buffer.from(`JSP:${password}`).toString('base64'),
        }).eq('id', existingUser.id)
      }

      return Response.json({ message: 'Member update ho gaya aur admin access mil gaya!', id: existingUser.id })
    }

    // Create new admin user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        email,
        full_name: fullName,
        phone: phone || null,
        role: role || 'admin',
        is_active: true,
        avatar_url: Buffer.from(`JSP:${password}`).toString('base64'),
      }])
      .select()
      .single()

    if (createError) {
      return Response.json({ error: createError.message }, { status: 400 })
    }

    // Save credentials
    try {
      await supabase.from('user_credentials').insert([{
        user_id: newUser.id,
        password_hash: password,
      }])
    } catch {
      // Credentials table might not exist, avatar_url fallback already saved
    }

    return Response.json({ message: 'Team member add ho gaya!', id: newUser.id })
  } catch (error) {
    console.error('Team POST error:', error)
    return Response.json({ error: 'Team member add nahi ho saka' }, { status: 500 })
  }
}

// DELETE - Remove admin access from a team member
export async function DELETE(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'User ID chahiye' }, { status: 400 })
    }

    // Don't allow removing the main admin
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (user?.email === 'admin@jugnoo.pk') {
      return Response.json({ error: 'Main admin ko remove nahi kar sakte' }, { status: 400 })
    }

    // Change role to customer instead of deleting
    const { error } = await supabase
      .from('users')
      .update({ role: 'customer' })
      .eq('id', userId)

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ message: 'Admin access remove ho gaya. Account customer ban gaya hai.' })
  } catch (error) {
    console.error('Team DELETE error:', error)
    return Response.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
