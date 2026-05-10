import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

function mapInventoryItem(i: Record<string, unknown>) {
  return {
    id: i.id,
    itemName: i.item_name,
    category: i.category,
    currentStock: i.current_stock || 0,
    minimumStock: i.minimum_stock || 0,
    unit: i.unit,
    lastRestocked: i.last_restocked,
    createdAt: i.created_at,
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { data, error } = await supabase.from('inventory').select('*').order('category', { ascending: true })
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ items: (data || []).map(mapInventoryItem) })
  } catch (error) {
    console.error('Inventory GET error:', error)
    return Response.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { data, error } = await supabase.from('inventory').insert([{
      item_name: body.itemName,
      category: body.category,
      current_stock: body.currentStock || 0,
      minimum_stock: body.minimumStock || 5,
      unit: body.unit,
      last_restocked: body.lastRestocked || null,
    }]).select()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ item: mapInventoryItem(data[0]) })
  } catch (error) {
    console.error('Inventory POST error:', error)
    return Response.json({ error: 'Failed to create inventory item' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { id, ...updates } = body

    const mapped: Record<string, unknown> = {}
    if (updates.itemName !== undefined) mapped.item_name = updates.itemName
    if (updates.category !== undefined) mapped.category = updates.category
    if (updates.currentStock !== undefined) mapped.current_stock = updates.currentStock
    if (updates.minimumStock !== undefined) mapped.minimum_stock = updates.minimumStock
    if (updates.unit !== undefined) mapped.unit = updates.unit
    if (updates.restock) { mapped.last_restocked = new Date().toISOString().split('T')[0] }

    const { data, error } = await supabase.from('inventory').update(mapped).eq('id', id).select()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ item: mapInventoryItem(data[0]) })
  } catch (error) {
    console.error('Inventory PUT error:', error)
    return Response.json({ error: 'Failed to update inventory item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('inventory').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Inventory DELETE error:', error)
    return Response.json({ error: 'Failed to delete inventory item' }, { status: 500 })
  }
}
