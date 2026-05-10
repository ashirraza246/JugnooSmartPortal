import { supabase, isSupabaseConfigured, checkTablesExist } from '@/lib/supabase'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured', needsSetup: true }, { status: 500 })
    }

    const tablesExist = await checkTablesExist()
    if (!tablesExist) {
      return Response.json({ error: 'Tables not found', needsSetup: true }, { status: 400 })
    }

    // Check if already seeded
    const { data: existingUsers } = await supabase.from('users').select('id').limit(1)
    if (existingUsers && existingUsers.length > 0) {
      return Response.json({ message: 'Database already seeded', skipped: true })
    }

    // Seed admin user (with encoded password in avatar_url as fallback)
    const adminPasswordEncoded = Buffer.from('JSP:jugnoo123').toString('base64')
    await supabase.from('users').insert([{
      email: 'admin@jugnoo.pk',
      full_name: 'Admin User',
      role: 'admin',
      phone: '923001000000',
      is_active: true,
      avatar_url: adminPasswordEncoded,
    }])

    // Seed customers
    const { data: customers } = await supabase.from('customers').insert([
      { full_name: 'Muhammad Ahmed Khan', whatsapp: '923001234567', cnic: '35201-1234567-1', email: 'ahmed@example.com', address: 'House 5, Street 3, Chowk Azam', tags: 'regular,vip', notes: 'Long-term customer', is_vip: true },
      { full_name: 'Fatima Bibi', whatsapp: '923459876543', cnic: '35201-9876543-2', address: 'Mohalla Usman, Chowk Azam', tags: 'bisp,regular', notes: 'BISP beneficiary', is_vip: false },
      { full_name: 'Hassan Ali Raza', whatsapp: '923128765432', cnic: '35201-5678901-3', email: 'hassan.raza@gmail.com', address: 'Main Bazar, Chowk Azam', tags: 'business,loan', notes: 'Small business owner', is_vip: true },
      { full_name: 'Ayesha Siddiqui', whatsapp: '923005554443', cnic: '35201-2345678-4', address: 'Jinnah Colony, Chowk Azam', tags: 'scholarship,student', notes: 'Student', is_vip: false },
      { full_name: 'Malik Imran Hussain', whatsapp: '923215556667', cnic: '35201-3456789-5', email: 'imran.malik@outlook.com', address: 'Shah Rukn-e-Alam Colony', tags: 'notarisation,regular', notes: 'Property dealer', is_vip: true },
    ]).select()

    // Seed sample orders
    if (customers && customers.length > 0) {
      const orderTypes = ['printing', 'scanning', 'copying', 'custom_print', 'photo_print']
      const statuses = ['pending', 'in_progress', 'ready', 'delivered', 'pending']
      const priorities = ['normal', 'urgent', 'vip', 'normal', 'normal']
      const descriptions = ['B&W print 50 pages assignment', 'Color photocopy of CNIC', 'Scan 10 documents for university', 'Custom wedding card printing', 'Passport size photos (8 copies)']

      for (let i = 0; i < 5; i++) {
        const amount = Math.floor(Math.random() * 2000) + 200
        await supabase.from('orders').insert([{
          order_number: `ORD-2025-${1001 + i}`,
          customer_id: customers[i].id,
          order_type: orderTypes[i],
          status: statuses[i],
          priority: priorities[i],
          description: descriptions[i],
          specifications: JSON.stringify({ pages: Math.floor(Math.random() * 50) + 5 }),
          total_amount: amount,
          paid_amount: i < 3 ? amount : Math.floor(amount * 0.5),
          payment_status: i < 3 ? 'paid' : 'partial',
        }])
      }
    }

    // Seed pricing rules
    await supabase.from('pricing_rules').insert([
      { service_type: 'printing', service_name: 'B&W Printing (A4)', unit: 'per_page', price: 10, is_active: true },
      { service_type: 'printing', service_name: 'Color Printing (A4)', unit: 'per_page', price: 30, is_active: true },
      { service_type: 'printing', service_name: 'B&W Printing (Legal)', unit: 'per_page', price: 15, is_active: true },
      { service_type: 'printing', service_name: 'Color Printing (Legal)', unit: 'per_page', price: 40, is_active: true },
      { service_type: 'scanning', service_name: 'Document Scanning', unit: 'per_page', price: 15, is_active: true },
      { service_type: 'copying', service_name: 'B&W Copy (A4)', unit: 'per_page', price: 8, is_active: true },
      { service_type: 'copying', service_name: 'Color Copy (A4)', unit: 'per_page', price: 25, is_active: true },
      { service_type: 'lamination', service_name: 'Lamination (A4)', unit: 'per_document', price: 50, is_active: true },
      { service_type: 'photo', service_name: 'Passport Photo (4 copies)', unit: 'per_service', price: 100, is_active: true },
      { service_type: 'binding', service_name: 'Spiral Binding', unit: 'per_document', price: 80, is_active: true },
    ])

    // Seed inventory
    await supabase.from('inventory').insert([
      { item_name: 'A4 Paper (Ream)', category: 'paper', current_stock: 25, minimum_stock: 10, unit: 'ream', last_restocked: '2025-01-10' },
      { item_name: 'Legal Paper (Ream)', category: 'paper', current_stock: 8, minimum_stock: 5, unit: 'ream', last_restocked: '2025-01-08' },
      { item_name: 'Photo Paper (Pack)', category: 'paper', current_stock: 3, minimum_stock: 5, unit: 'pack', last_restocked: '2024-12-20' },
      { item_name: 'Black Toner Cartridge', category: 'ink', current_stock: 4, minimum_stock: 2, unit: 'cartridge', last_restocked: '2025-01-05' },
      { item_name: 'Color Toner Set', category: 'ink', current_stock: 2, minimum_stock: 2, unit: 'set', last_restocked: '2024-12-28' },
      { item_name: 'Lamination Pouches (A4)', category: 'supply', current_stock: 50, minimum_stock: 20, unit: 'pack', last_restocked: '2025-01-12' },
      { item_name: 'Spiral Binding Coils', category: 'supply', current_stock: 30, minimum_stock: 15, unit: 'box', last_restocked: '2025-01-11' },
      { item_name: 'BISP Registration Form', category: 'form', current_stock: 100, minimum_stock: 20, unit: 'piece', last_restocked: '2025-01-13' },
      { item_name: 'Ehsaas Program Form', category: 'form', current_stock: 45, minimum_stock: 20, unit: 'piece', last_restocked: '2025-01-09' },
      { item_name: 'Stamp Paper', category: 'form', current_stock: 12, minimum_stock: 10, unit: 'piece', last_restocked: '2025-01-07' },
    ])

    return Response.json({ message: 'Database seeded successfully', data: { users: 1, customers: 5, orders: 5, pricingRules: 10, inventoryItems: 10 } })
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
