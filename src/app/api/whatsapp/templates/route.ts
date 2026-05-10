import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

function mapTemplate(t: Record<string, unknown>) {
  return {
    id: t.id,
    name: t.name,
    category: t.category,
    content: t.content,
    variables: t.variables,
    isFavorite: t.is_favorite || false,
    usageCount: t.usage_count || 0,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const favoritesOnly = searchParams.get('favorites') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const from = (page - 1) * limit

    let query = supabase.from('whatsapp_templates').select('*', { count: 'exact' }).order('usage_count', { ascending: false }).range(from, from + limit - 1)

    if (category) query = query.eq('category', category)
    if (search) query = query.or(`name.ilike.%${search}%,content.ilike.%${search}%`)
    if (favoritesOnly) query = query.eq('is_favorite', true)

    const { data, count, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 400 })

    return Response.json({ templates: (data || []).map(mapTemplate), total: count })
  } catch (error) {
    console.error('Templates GET error:', error)
    return Response.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { data, error } = await supabase.from('whatsapp_templates').insert([{
      name: body.name,
      category: body.category,
      content: body.content,
      variables: body.variables || null,
      is_favorite: body.isFavorite || false,
    }]).select()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ template: mapTemplate(data[0]) })
  } catch (error) {
    console.error('Templates POST error:', error)
    return Response.json({ error: 'Failed to create template' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { id, ...updates } = body

    const mapped: Record<string, unknown> = {}
    if (updates.name !== undefined) mapped.name = updates.name
    if (updates.category !== undefined) mapped.category = updates.category
    if (updates.content !== undefined) mapped.content = updates.content
    if (updates.variables !== undefined) mapped.variables = updates.variables
    if (updates.isFavorite !== undefined) mapped.is_favorite = updates.isFavorite

    const { data, error } = await supabase.from('whatsapp_templates').update(mapped).eq('id', id).select()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ template: mapTemplate(data[0]) })
  } catch (error) {
    console.error('Templates PUT error:', error)
    return Response.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('whatsapp_templates').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Templates DELETE error:', error)
    return Response.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
