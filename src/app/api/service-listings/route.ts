import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { GOVT_SERVICES } from '@/lib/govt-services-data'

// Build a lookup map from GOVT_SERVICES for enriching default services with personal_info_fields
const govtServicesLookup = new Map(GOVT_SERVICES.map(s => [s.id, s]))

export async function GET(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    let query = supabase.from('service_listings').select('*').eq('is_active', true).order('sort_order', { ascending: true })
    if (category) query = query.eq('category', category)

    const { data, error } = await query

    if (error) {
      // If table doesn't exist yet, return default services
      return Response.json(getDefaultServices(category))
    }

    // If no data in table, return defaults
    if (!data || data.length === 0) {
      return Response.json(getDefaultServices(category))
    }

    return Response.json(data)
  } catch (error) {
    console.error('Service listings error:', error)
    return Response.json(getDefaultServices(null))
  }
}

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await req.json()

    // Try to insert into service_listings table
    const { data, error } = await supabase.from('service_listings').insert([{
      id: body.id || undefined,
      name: body.name,
      category: body.category,
      description: body.description || '',
      icon: body.icon || 'FileText',
      base_price: body.base_price || 0,
      features: body.features || [],
      required_documents: body.required_documents || [],
      is_active: body.is_active !== false,
      sort_order: body.sort_order || 0,
      official_url: body.official_url || '',
      apply_process: body.apply_process || '',
      personal_info_fields: body.personal_info_fields || [],
      eligibility: body.eligibility || '',
      deadlines: body.deadlines || {},
      loan_tiers: body.loan_tiers || [],
      important_details: body.important_details || [],
      processing_time: body.processing_time || '',
      special_notes: body.special_notes || '',
      fee_info: body.fee_info || '',
      apply_steps: body.apply_steps || [],
    }]).select().single()

    if (error) {
      // Table might not exist - try creating with default
      if (error.code === '42P01') {
        return Response.json({
          error: 'service_listings table nahi mili. Supabase SQL Editor mein schema run karein.',
          needsSetup: true,
          sql: getTableSQL(),
        }, { status: 400 })
      }
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json(data)
  } catch (error) {
    console.error('Service listings POST error:', error)
    return Response.json({ error: 'Failed to create service' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return Response.json({ error: 'Service ID chahiye' }, { status: 400 })
    }

    const { data, error } = await supabase.from('service_listings').update({
      name: updates.name,
      category: updates.category,
      description: updates.description,
      icon: updates.icon,
      base_price: updates.base_price,
      features: updates.features,
      required_documents: updates.required_documents,
      is_active: updates.is_active,
      sort_order: updates.sort_order,
      official_url: updates.official_url,
      apply_process: updates.apply_process,
      personal_info_fields: updates.personal_info_fields,
      eligibility: updates.eligibility,
      deadlines: updates.deadlines,
      loan_tiers: updates.loan_tiers,
      important_details: updates.important_details,
      processing_time: updates.processing_time,
      special_notes: updates.special_notes,
      fee_info: updates.fee_info,
      apply_steps: updates.apply_steps,
    }).eq('id', id).select().single()

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json(data)
  } catch (error) {
    console.error('Service listings PUT error:', error)
    return Response.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Service ID chahiye' }, { status: 400 })
    }

    const { error } = await supabase.from('service_listings').delete().eq('id', id)

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true, message: 'Service delete ho gayi!' })
  } catch (error) {
    console.error('Service listings DELETE error:', error)
    return Response.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}

function getTableSQL() {
  return `CREATE TABLE IF NOT EXISTS service_listings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  icon TEXT DEFAULT 'FileText',
  base_price NUMERIC DEFAULT 0,
  features JSONB DEFAULT '[]',
  required_documents JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  official_url TEXT DEFAULT '',
  apply_process TEXT DEFAULT '',
  personal_info_fields JSONB DEFAULT '[]',
  eligibility TEXT DEFAULT '',
  deadlines JSONB DEFAULT '{}',
  loan_tiers JSONB DEFAULT '[]',
  important_details JSONB DEFAULT '[]',
  processing_time TEXT DEFAULT '',
  special_notes TEXT DEFAULT '',
  fee_info TEXT DEFAULT '',
  apply_steps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on service_listings" ON service_listings FOR ALL USING (true) WITH CHECK (true);`
}

function getDefaultServices(category: string | null) {
  // Comprehensive govt scheme services with detailed documents from web research
  const govtAndScholarshipServices = [
    // BISP
    { id: 'bisp-registration', name: 'BISP (Benazir Income Support Program)', category: 'govt_scheme', description: 'Pakistan\'s largest social protection program providing quarterly financial assistance (Rs. 13,500+) to low-income families. Women-headed households given priority. SMS 8171 for eligibility.', icon: 'Wallet', base_price: 500, features: ['Quarterly cash payments Rs. 13,500+', 'Women-headed household priority', 'SMS check via 8171', 'Biometric payment verification'], required_documents: [{ id: 'bisp-d1', name: 'CNIC Copy (Head of Household)', is_mandatory: true, description: 'Valid NADRA CNIC, both sides photocopy' }, { id: 'bisp-d2', name: 'Husband/Father CNIC Copy', is_mandatory: true, description: 'Both sides for family verification' }, { id: 'bisp-d3', name: 'B-Form (Children under 18)', is_mandatory: false, description: 'NADRA CRC for dependent children' }, { id: 'bisp-d4', name: 'Proof of Income / Unemployment', is_mandatory: false, description: 'Income cert or unemployment declaration' }, { id: 'bisp-d5', name: 'Death Certificate (widows)', is_mandatory: false, description: 'From Union Council, if applicable' }, { id: 'bisp-d6', name: 'Divorce Certificate', is_mandatory: false, description: 'Union Council issued, if applicable' }, { id: 'bisp-d7', name: 'Disability Certificate', is_mandatory: false, description: 'Medical board certificate, if applicable' }, { id: 'bisp-d8', name: 'Utility Bill (Proof of Residence)', is_mandatory: true, description: 'Recent electricity/gas bill' }, { id: 'bisp-d9', name: 'Active Mobile Phone Number', is_mandatory: true, description: 'Registered on CNIC for 8171 SMS' }], is_active: true, sort_order: 1, official_url: 'https://8171.bisp.gov.pk', apply_process: '1. SMS CNIC to 8171 for eligibility check\n2. If eligible, visit nearest BISP Tehsil Office\n3. Complete NSER survey registration\n4. Biometric verification\n5. Receive confirmation SMS\n6. Collect payments from designated centers\n\nOR via 8171 Web Portal:\n1. Visit 8171.bisp.gov.pk\n2. Enter CNIC and mobile number\n3. Fill household details\n4. Submit and save confirmation slip' },
    // Ehsaas Kafalat
    { id: 'ehsaas-kafalat', name: 'Ehsaas Kafalat Program', category: 'govt_scheme', description: 'Monthly cash stipends for poorest women across Pakistan. Current stipend: Rs. 12,000+ per quarter. Part of Ehsaas framework under PASS.', icon: 'Heart', base_price: 500, features: ['Quarterly stipend Rs. 12,000+', 'Women-only beneficiary', 'Biometric payment', 'SMS 8171 registration'], required_documents: [{ id: 'ek-d1', name: 'CNIC Copy (Applicant Woman)', is_mandatory: true, description: 'Valid NADRA CNIC, both sides' }, { id: 'ek-d2', name: 'Husband CNIC Copy', is_mandatory: true, description: 'Both sides for verification' }, { id: 'ek-d3', name: 'B-Form of Children', is_mandatory: false, description: 'For children under 18' }, { id: 'ek-d4', name: 'Utility Bill (Proof of Residence)', is_mandatory: true, description: 'Recent electricity/gas bill' }, { id: 'ek-d5', name: 'Death Certificate (Widows)', is_mandatory: false, description: 'From Union Council, if applicable' }, { id: 'ek-d6', name: 'Active Mobile SIM (on own CNIC)', is_mandatory: true, description: 'For 8171 SMS notifications' }], is_active: true, sort_order: 2, official_url: 'https://ehsaas.nadra.gov.pk', apply_process: '1. SMS CNIC to 8171\n2. Check eligibility status\n3. Visit Ehsaas Registration Center / NADRA office\n4. Biometric verification\n5. Open bank account if directed\n6. Receive stipend via payment method' },
    // Ehsaas Rashan
    { id: 'ehsaas-rashan', name: 'Ehsaas Rashan Program', category: 'govt_scheme', description: 'Food subsidies and cash for ration to low-income families. Rs. 2,000 monthly + up to 40% discount on essential items at utility stores. SMS 8123.', icon: 'ShoppingBag', base_price: 400, features: ['Monthly cash Rs. 2,000', '40% discount on food items', 'SMS registration via 8123', 'Digital vouchers for stores'], required_documents: [{ id: 'er-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Valid NADRA CNIC, both sides' }, { id: 'er-d2', name: 'Family Members Details', is_mandatory: true, description: 'Names, ages, relationships' }, { id: 'er-d3', name: 'Proof of Income (Below Rs. 50,000)', is_mandatory: true, description: 'Income cert or declaration' }, { id: 'er-d4', name: 'Active Mobile Number', is_mandatory: true, description: 'For SMS verification' }, { id: 'er-d5', name: 'Utility Bill (Proof of Address)', is_mandatory: true, description: 'Recent electricity or gas bill' }], is_active: true, sort_order: 3, official_url: 'https://ehsaas.nadra.gov.pk', apply_process: '1. Send CNIC via SMS to 8123\n2. Receive eligibility confirmation\n3. Visit E-Khidmat Markaz or registration center\n4. Provide documents for verification\n5. Receive ration card or digital voucher\n6. Collect from designated utility stores' },
    // NADRA CNIC
    { id: 'nadra-cnic-new', name: 'NADRA CNIC - New Application', category: 'govt_scheme', description: 'First-time CNIC issuance for citizens turning 18. Mandatory for all adult Pakistanis. Required for every government service.', icon: 'CreditCard', base_price: 300, features: ['Mandatory at age 18', 'Normal/Urgent/Executive processing', 'Biometric verification', 'Home delivery available'], required_documents: [{ id: 'ncn-d1', name: 'B-Form / CRC', is_mandatory: true, description: 'Original NADRA Child Registration Certificate' }, { id: 'ncn-d2', name: 'Birth Certificate (Union Council)', is_mandatory: true, description: 'Computerized birth registration' }, { id: 'ncn-d3', name: 'Father/Mother CNIC Copy', is_mandatory: true, description: 'At least one parent CNIC, both sides' }, { id: 'ncn-d4', name: 'FRC (Family Registration Certificate)', is_mandatory: false, description: 'Optional, speeds up verification' }, { id: 'ncn-d5', name: 'Matric / Educational Certificate', is_mandatory: false, description: 'For name and DOB verification' }], is_active: true, sort_order: 4, official_url: 'https://nadra.gov.pk', apply_process: '1. Visit nearest NADRA Registration Center\n2. Get token from reception\n3. Present documents at counter\n4. Photo capture and biometric verification\n5. Verify details on screen\n6. Pay fee (Normal Rs.750 / Urgent Rs.1,500 / Executive Rs.2,500)\n7. Receive tracking slip\n8. Collect CNIC or opt for home delivery' },
    // NADRA CNIC Renewal
    { id: 'nadra-cnic-renewal', name: 'NADRA CNIC - Renewal / Correction / Duplicate', category: 'govt_scheme', description: 'CNIC renewal (every 10 years), correction of details (name, address, DOB), or duplicate for lost/damaged card.', icon: 'RefreshCw', base_price: 300, features: ['Renewal on expiry', 'Name/Address/DOB correction', 'Duplicate for lost card', 'Online tracking'], required_documents: [{ id: 'ncr-d1', name: 'Old CNIC (Original)', is_mandatory: true, description: 'For renewal/correction. If lost, bring FIR copy' }, { id: 'ncr-d2', name: 'FIR Copy (for lost CNIC)', is_mandatory: false, description: 'Police FIR if CNIC is lost' }, { id: 'ncr-d3', name: 'Supporting Document for Correction', is_mandatory: false, description: 'e.g., Matric cert for name, utility bill for address' }, { id: 'ncr-d4', name: 'Father/Husband CNIC Copy', is_mandatory: true, description: 'For family verification' }], is_active: true, sort_order: 5, official_url: 'https://nadra.gov.pk', apply_process: '1. Visit NADRA Registration Center with old CNIC\n2. Specify service: renewal, correction, or duplicate\n3. Provide supporting documents for corrections\n4. Biometric verification\n5. Pay fee (Normal Rs.750 / Urgent Rs.1,500 / Executive Rs.2,500)\n6. Receive tracking slip\n7. Collect new CNIC or opt for delivery' },
    // NADRA B-Form
    { id: 'nadra-bform', name: 'NADRA B-Form (Child Registration Certificate)', category: 'govt_scheme', description: 'CRC/B-Form for children under 18. Mandatory for school admission, passport, and future CNIC. Age-based biometrics: 0-3y no photo, 3-10y photo, 10-18y photo+fingerprints.', icon: 'FileText', base_price: 200, features: ['Mandatory for children under 18', 'Required for school & passport', 'Online via Pak ID App (infants)', 'Age-based biometric stages'], required_documents: [{ id: 'nbf-d1', name: 'Computerized Birth Certificate', is_mandatory: true, description: 'From Union Council/Municipal Committee' }, { id: 'nbf-d2', name: 'Parent CNIC (at least one)', is_mandatory: true, description: 'Valid CNIC or NICOP, both preferred' }, { id: 'nbf-d3', name: 'Parent Biometric Verification', is_mandatory: true, description: 'Parent must be present at NADRA' }], is_active: true, sort_order: 6, official_url: 'https://nadra.gov.pk', apply_process: 'Infants (up to 1 year):\n1. Download Pak ID App\n2. Select Child Registration Certificate\n3. Enter parent CNIC\n4. Upload documents\n5. Parent fingerprint on device\n6. Submit and track\n\nChildren 1-18:\n1. Visit NADRA Registration Center\n2. Present birth certificate and parent CNIC\n3. Child photo (3+) and fingerprints (10+)\n4. Pay fee (Normal Rs.50 / Urgent Rs.500)\n5. Receive tracking slip' },
    // PM Youth Loan
    { id: 'pm-youth-loan', name: 'PM Youth Business & Agriculture Loan', category: 'loan', description: 'Government business loans for youth. Tier 1: Up to Rs.500K (0% interest), Tier 2: Rs.500K-1.5M (5%), Tier 3: Rs.1.5M-7.5M (7%). 9+ partner banks.', icon: 'Banknote', base_price: 1500, features: ['Tier 1: Up to Rs.500K (0% interest, 3yr)', 'Tier 2: Rs.500K-1.5M (5% markup, 5yr)', 'Tier 3: Rs.1.5M-7.5M (7% markup, 8yr)', 'No collateral for Tier 1'], required_documents: [{ id: 'pyl-d1', name: 'CNIC Copy (Front & Back)', is_mandatory: true, description: 'Valid NADRA CNIC, both sides' }, { id: 'pyl-d2', name: 'Passport-size Photographs (2)', is_mandatory: true, description: 'Recent, white/blue background' }, { id: 'pyl-d3', name: 'Educational/Skill Certificates', is_mandatory: false, description: 'Optional but preferred' }, { id: 'pyl-d4', name: 'Business Plan / Feasibility Report', is_mandatory: true, description: 'Detailed plan with cost estimates' }, { id: 'pyl-d5', name: 'Utility Bill (Latest)', is_mandatory: true, description: 'Proof of address' }, { id: 'pyl-d6', name: 'Bank Account Details', is_mandatory: false, description: 'IBAN for loan disbursement' }, { id: 'pyl-d7', name: 'Experience Proof (existing business)', is_mandatory: false, description: 'Business registration or tax returns' }, { id: 'pyl-d8', name: 'Collateral Documents (Tier 3)', is_mandatory: false, description: 'Property papers for Tier 3' }], is_active: true, sort_order: 20, official_url: 'https://pmyp.gov.pk', apply_process: '1. Visit pmyp.gov.pk or pmybals.pmyp.gov.pk\n2. Click Apply Now for Business Loan\n3. Create account (CNIC, mobile, email)\n4. Receive OTP for verification\n5. Fill online form with business details\n6. Upload documents (CNIC, business plan, certificates)\n7. Select preferred bank\n8. Submit and note Tracking ID\n9. Bank reviews and contacts for approval' },
    // PM Kamyab Jawan
    { id: 'pm-kamyab-jawan', name: 'PM Kamyab Jawan Loan Program (YES)', category: 'loan', description: 'Youth Entrepreneurship Scheme. Same tiered loans (0-7% interest). Includes NAVTTC/SMEDA training. Digital/paperless application. Rs.8B+ disbursed.', icon: 'Rocket', base_price: 1500, features: ['Tier 1: Rs.500K (0%, no collateral)', 'Tier 2: Rs.500K-1.5M (5%)', 'Tier 3: Rs.1.5M-7.5M (7%)', 'NAVTTC & SMEDA training', 'Women quota reserved'], required_documents: [{ id: 'pkj-d1', name: 'CNIC Copy (Front & Back)', is_mandatory: true, description: 'Valid NADRA CNIC' }, { id: 'pkj-d2', name: 'Passport-size Photographs (2)', is_mandatory: true, description: 'Recent photos' }, { id: 'pkj-d3', name: 'Educational Certificate (Min Matric for IT)', is_mandatory: true, description: 'Attested copies' }, { id: 'pkj-d4', name: 'Business Plan / Feasibility Report', is_mandatory: true, description: 'Detailed with financial projections' }, { id: 'pkj-d5', name: 'Proof of Income / Employment', is_mandatory: true, description: 'Salary slip, business proof, or declaration' }, { id: 'pkj-d6', name: 'Utility Bill (Latest)', is_mandatory: true, description: 'Proof of address' }, { id: 'pkj-d7', name: 'Collateral Documents (Tier 3)', is_mandatory: false, description: 'For Tier 3 loans only' }], is_active: true, sort_order: 21, official_url: 'https://kamyabjawan.gov.pk', apply_process: '1. Visit kamyabjawan.gov.pk\n2. Select Youth Entrepreneurship Scheme (YES)\n3. Create account with CNIC and mobile\n4. Fill personal, educational, business details\n5. Upload documents\n6. Select preferred bank\n7. Submit - completely digital and paperless\n8. Track via SMS/email. Approval: 2-4 weeks' },
    // PEEF Scholarship
    { id: 'peef-scholarship', name: 'PEEF Scholarship (Punjab Educational Endowment Fund)', category: 'scholarship', description: 'Merit and need-based scholarships for Punjab domicile students. Full tuition + stipend for undergraduate and diploma programs.', icon: 'GraduationCap', base_price: 500, features: ['Full tuition fee coverage', 'Monthly stipend', 'Merit and need-based', 'Special quotas: orphans, disabled, minorities'], required_documents: [{ id: 'psf-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Both sides' }, { id: 'psf-d2', name: 'Father/Guardian CNIC Copy', is_mandatory: true, description: 'Both sides' }, { id: 'psf-d3', name: 'Domicile Certificate (Punjab)', is_mandatory: true, description: 'From Deputy Commissioner office' }, { id: 'psf-d4', name: 'Matric Certificate (Attested)', is_mandatory: true, description: 'Board-issued' }, { id: 'psf-d5', name: 'Intermediate Certificate (Attested)', is_mandatory: true, description: 'Board-issued' }, { id: 'psf-d6', name: 'Admission Letter', is_mandatory: true, description: 'From participating institution' }, { id: 'psf-d7', name: 'Income Certificate (Tehsildar)', is_mandatory: true, description: 'Within eligible range' }, { id: 'psf-d8', name: 'Passport-size Photographs (4)', is_mandatory: true, description: 'Recent, white background' }], is_active: true, sort_order: 30, official_url: 'https://peef.org.pk', apply_process: '1. Visit peef.org.pk\n2. Download or fill online application form\n3. Attach all attested documents\n4. Submit to institution financial aid office or PEEF\n5. Track status online' },
    // HEC Scholarship
    { id: 'hec-scholarship', name: 'HEC Scholarship (Higher Education Commission)', category: 'scholarship', description: 'Multiple scholarship programs: Indigenous PhD, Foreign scholarships (CSC, Commonwealth), Need-based undergraduate. Full tuition + stipend + books.', icon: 'GraduationCap', base_price: 600, features: ['Indigenous PhD Scholarships', 'Foreign Scholarships', 'Need-based Undergraduate', 'Research grants'], required_documents: [{ id: 'hsc-d1', name: 'CNIC Copy', is_mandatory: true, description: 'Both sides' }, { id: 'hsc-d2', name: 'All Academic Transcripts & Degrees', is_mandatory: true, description: 'Attested copies' }, { id: 'hsc-d3', name: 'Domicile Certificate', is_mandatory: true, description: 'Province/district domicile' }, { id: 'hsc-d4', name: 'Research Proposal (for PhD)', is_mandatory: false, description: 'For graduate/PhD scholarships' }, { id: 'hsc-d5', name: 'Recommendation Letters (2-3)', is_mandatory: true, description: 'From academic supervisors' }, { id: 'hsc-d6', name: 'Statement of Purpose', is_mandatory: true, description: 'Academic goals and need' }, { id: 'hsc-d7', name: 'Income Certificate / Salary Slip', is_mandatory: true, description: 'Financial need proof' }, { id: 'hsc-d8', name: 'Passport (for foreign scholarships)', is_mandatory: false, description: 'For overseas programs' }], is_active: true, sort_order: 31, official_url: 'https://scholarship.hec.gov.pk', apply_process: '1. Create account on scholarship.hec.gov.pk\n2. Select scholarship program\n3. Fill application form\n4. Upload required documents\n5. Submit before deadline\n6. Shortlisted candidates called for interview' },
    // Govt Job Application
    { id: 'govt-job-application', name: 'Government Job Application (FPSC/PPSC/Departmental)', category: 'govt_scheme', description: 'Assistance with FPSC, PPSC, SPSC, KPPSC, BPSC, or direct departmental recruitment applications. Form filling and document preparation.', icon: 'Briefcase', base_price: 500, features: ['FPSC/PPSC online application', 'Document preparation', 'Challan form preparation', 'All commission types supported'], required_documents: [{ id: 'gja-d1', name: 'CNIC Copy (Both sides)', is_mandatory: true, description: 'Valid NADRA CNIC' }, { id: 'gja-d2', name: 'Domicile Certificate', is_mandatory: true, description: 'From Deputy Commissioner' }, { id: 'gja-d3', name: 'Educational Certificates (All, Attested)', is_mandatory: true, description: 'Matric through highest degree' }, { id: 'gja-d4', name: 'Experience Certificate(s)', is_mandatory: false, description: 'On official letterhead' }, { id: 'gja-d5', name: 'Passport-size Photographs (4-6)', is_mandatory: true, description: 'Recent, white/blue background' }, { id: 'gja-d6', name: 'Character Certificate', is_mandatory: true, description: 'From gazetted officer' }, { id: 'gja-d7', name: 'Treasury/Challan Fee Receipt', is_mandatory: true, description: 'Deposited in State/National Bank' }], is_active: true, sort_order: 40, official_url: 'https://www.fpsc.gov.pk', apply_process: 'FPSC:\n1. Visit fpsc.gov.pk, create account\n2. Apply online for desired post\n3. Upload documents and photo\n4. Download challan, deposit fee\n5. Submit before deadline\n\nPPSC:\n1. Visit ppsc.gop.pk, create account\n2. Apply, pay fee via challan\n3. Appear in written test\n\nDepartmental:\n1. Get form from department\n2. Fill and attach documents\n3. Submit via registered post or in person' },
    // Zakat Application
    { id: 'zakat-application', name: 'Zakat Application (Guzara/Health/Education/Marriage)', category: 'govt_scheme', description: 'Apply for Zakat funds: Guzara Allowance (monthly), Health Care, Education Stipends, Marriage Assistance (Rs.20,000), Social Rehabilitation.', icon: 'Heart', base_price: 300, features: ['Guzara Allowance (monthly)', 'Health Care support', 'Education Stipends', 'Marriage Assistance Rs.20,000', 'Social Rehabilitation'], required_documents: [{ id: 'zak-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Both sides' }, { id: 'zak-d2', name: 'Application Form (specific program)', is_mandatory: true, description: 'From Local Zakat Committee or zakat.punjab.gov.pk' }, { id: 'zak-d3', name: 'Income Certificate / Poverty Proof', is_mandatory: true, description: 'Tehsildar cert or BISP/Ehsaas card' }, { id: 'zak-d4', name: 'B-Form / Family CNICs', is_mandatory: true, description: 'Household verification' }, { id: 'zak-d5', name: 'Medical Reports (for Health Care)', is_mandatory: false, description: 'For health applications only' }, { id: 'zak-d6', name: 'Educational Documents (for Stipends)', is_mandatory: false, description: 'Admission proof, fee slip' }, { id: 'zak-d7', name: 'Unmarried Certificate (for Marriage)', is_mandatory: false, description: 'From Union Council' }, { id: 'zak-d8', name: 'Passport-size Photographs (2)', is_mandatory: true, description: 'Recent photos' }], is_active: true, sort_order: 45, official_url: 'https://zakat.punjab.gov.pk', apply_process: '1. Get form from Local Zakat Committee or download from zakat.punjab.gov.pk/forms\n2. Fill the form completely (Urdu/English versions available)\n3. Attach all required documents\n4. Submit to Local Zakat Committee (LZC)\n5. LZC verifies and forwards to District Zakat Committee\n6. Approval and disbursement through LZC' },
    // WAPDA New Connection
    { id: 'wapda-new-connection', name: 'WAPDA / Electricity New Connection', category: 'govt_scheme', description: 'New electricity connection through regional DISCO (LESCO, FESCO, MEPCO, IESCO, PESCO, etc.). Online via ENC portal. Domestic/Commercial/Industrial.', icon: 'Zap', base_price: 500, features: ['Online via ENC portal', 'Domestic/Commercial/Industrial', 'All DISCOs supported', 'NEPRA-regulated timelines'], required_documents: [{ id: 'wap-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Both sides' }, { id: 'wap-d2', name: 'Proof of Ownership / Sale Deed', is_mandatory: true, description: 'Property ownership document' }, { id: 'wap-d3', name: 'Site Map / Location Sketch', is_mandatory: true, description: 'Property location and meter point' }, { id: 'wap-d4', name: 'NOC from Landlord (if rented)', is_mandatory: false, description: 'For rented properties' }, { id: 'wap-d5', name: 'Completion Certificate (Local Council)', is_mandatory: true, description: 'Building completion from authority' }, { id: 'wap-d6', name: 'Load Details Form (A-1)', is_mandatory: true, description: 'Required load in kW' }, { id: 'wap-d7', name: 'Test Report (licensed electrician)', is_mandatory: true, description: 'Wiring test report' }], is_active: true, sort_order: 50, official_url: 'https://enc.gov.pk', apply_process: '1. Identify your DISCO (LESCO, FESCO, MEPCO, etc.)\n2. Visit DISCO website or enc.gov.pk\n3. Create account\n4. Fill online application form\n5. Upload documents\n6. Pay application fee\n7. Receive reference number\n8. Track online\n\nDomestic: 15-30 days. Commercial: 30-45 days. Industrial: 45-90 days.' },
    // Utility Bill Services
    { id: 'utility-bill-service', name: 'Utility Bill Services (Duplicate/Correction/Transfer)', category: 'govt_scheme', description: 'Duplicate bill print, name correction, bill ownership transfer, new gas (SNGPL/SSGC) or water (WASA) connection.', icon: 'Receipt', base_price: 200, features: ['Duplicate bill print', 'Name correction', 'Ownership transfer', 'Gas connection', 'Water connection'], required_documents: [{ id: 'ubs-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Both sides' }, { id: 'ubs-d2', name: 'Latest Paid Bill / Reference Number', is_mandatory: true, description: 'Previous bill consumer reference' }, { id: 'ubs-d3', name: 'Sale Deed (for transfer)', is_mandatory: false, description: 'For ownership transfer only' }, { id: 'ubs-d4', name: 'Property Ownership Proof', is_mandatory: false, description: 'For name correction or transfer' }], is_active: true, sort_order: 51, official_url: 'https://enc.gov.pk', apply_process: 'Duplicate Bill:\n1. Visit DISCO website\n2. Enter consumer number\n3. Download/print\n\nName Correction/Transfer:\n1. Visit DISCO customer service center\n2. Submit application with documents\n3. Pay processing fee\n\nGas Connection:\n1. Visit SNGPL/SSGC office\n2. Submit application with property docs\n3. Pay fee, get meter installed' },
    // Sehat Sahulat (keeping existing)
    { id: 'sehat-sahulat', name: 'Sehat Sahulat (Health Insurance)', category: 'govt_scheme', description: 'Free health insurance card for poor families. Covers hospital treatment at empaneled hospitals.', icon: 'Shield', base_price: 300, features: ['Free hospital treatment', 'Family coverage', 'Empaneled hospitals nationwide'], required_documents: [{ id: 'ss-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Both sides' }, { id: 'ss-d2', name: 'Family Members CNICs', is_mandatory: true, description: 'All members' }, { id: 'ss-d3', name: 'B-Form for children', is_mandatory: true, description: 'Under 18 members' }], is_active: true, sort_order: 7, official_url: 'https://pmhealthprogram.gov.pk', apply_process: '1. Visit Sehat Sahulat center or website\n2. Register with CNIC\n3. Add family members\n4. Select empaneled hospital\n5. Receive Sehat Card' },
    // Printing & Other services (keeping existing)
    { id: '11', name: 'Document Printing', category: 'printing', description: 'Black & White aur Color printing services', icon: 'Printer', base_price: 10, features: ['A4 Size', 'Color/B&W', 'Bulk Orders'], required_documents: [], is_active: true, sort_order: 70, official_url: '', apply_process: '' },
    { id: '12', name: 'Photo Printing', category: 'printing', description: 'Passport size aur photo printing', icon: 'Camera', base_price: 50, features: ['Passport Size', '4x6', '5x7'], required_documents: [], is_active: true, sort_order: 71, official_url: '', apply_process: '' },
    { id: '13', name: 'Banner Printing', category: 'printing', description: 'Flex banner aur vinyl printing', icon: 'Image', base_price: 500, features: ['Flex Banner', 'Vinyl Sticker', 'Standee'], required_documents: [], is_active: true, sort_order: 72, official_url: '', apply_process: '' },
    { id: '14', name: 'Business Card Printing', category: 'printing', description: 'Professional business cards', icon: 'CreditCard', base_price: 500, features: ['Standard', 'Premium', 'Transparent'], required_documents: [], is_active: true, sort_order: 73, official_url: '', apply_process: '' },
    { id: '15', name: 'Document Scanning', category: 'scanning', description: 'High quality document scanning', icon: 'Scan', base_price: 20, features: ['Single Page', 'Multi Page', 'PDF Conversion'], required_documents: [], is_active: true, sort_order: 80, official_url: '', apply_process: '' },
    { id: '16', name: 'Photocopy', category: 'scanning', description: 'Black & White aur Color photocopy', icon: 'Copy', base_price: 5, features: ['A4 Size', 'Color/B&W', 'Certified Copy'], required_documents: [], is_active: true, sort_order: 81, official_url: '', apply_process: '' },
    { id: '17', name: 'Affidavit', category: 'notarisation', description: 'Affidavit preparation aur notarisation', icon: 'FileText', base_price: 500, features: ['Draft Preparation', 'Stamp Paper', 'Notary Attestation'], required_documents: [{ id: 'd32', name: 'CNIC Copy', is_mandatory: true, description: '' }], is_active: true, sort_order: 90, official_url: '', apply_process: '' },
    { id: '18', name: 'Power of Attorney', category: 'notarisation', description: 'Power of Attorney document preparation', icon: 'Scale', base_price: 1000, features: ['General POA', 'Special POA', 'Attestation'], required_documents: [{ id: 'd33', name: 'CNIC Copy', is_mandatory: true, description: 'Both parties' }, { id: 'd34', name: 'Property Documents', is_mandatory: false, description: 'If property related' }], is_active: true, sort_order: 91, official_url: '', apply_process: '' },
    { id: '19', name: 'Agreement Drafting', category: 'notarisation', description: 'Legal agreements aur contracts', icon: 'FileText', base_price: 800, features: ['Rent Agreement', 'Sale Agreement', 'Partnership Deed'], required_documents: [{ id: 'd35', name: 'CNIC Copy', is_mandatory: true, description: 'Both parties' }, { id: 'd36', name: 'Property Documents', is_mandatory: false, description: '' }], is_active: true, sort_order: 92, official_url: '', apply_process: '' },
    { id: '20', name: 'Attestation', category: 'notarisation', description: 'Document attestation aur verification', icon: 'CheckCircle', base_price: 200, features: ['Copy Attestation', 'Photo Attestation'], required_documents: [{ id: 'd37', name: 'Original Document', is_mandatory: true, description: 'For verification' }, { id: 'd38', name: 'CNIC Copy', is_mandatory: true, description: '' }], is_active: true, sort_order: 93, official_url: '', apply_process: '' },
    { id: '21', name: 'Form Filling', category: 'other', description: 'Online aur offline form filling service', icon: 'ClipboardList', base_price: 200, features: ['Government Forms', 'Bank Forms', 'Admission Forms'], required_documents: [], is_active: true, sort_order: 100, official_url: '', apply_process: '' },
    { id: '22', name: 'Typing Service', category: 'other', description: 'Urdu aur English typing service', icon: 'Type', base_price: 100, features: ['Urdu Typing', 'English Typing', 'Legal Documents'], required_documents: [], is_active: true, sort_order: 101, official_url: '', apply_process: '' },
    { id: '23', name: 'Lamination', category: 'other', description: 'Document aur photo lamination', icon: 'Layers', base_price: 100, features: ['A4 Size', 'ID Card Size', 'Photo Size'], required_documents: [], is_active: true, sort_order: 103, official_url: '', apply_process: '' },
    // CV Builder - Paid Service
    {
      id: 'cv-builder-service',
      name: 'CV / Resume Builder',
      category: 'other',
      description: 'Professional CV banwaein! Hum aapki details se ek premium CV taiyar karenge. Jobs ke liye apply karne ke liye zaroori hai. Multiple templates available hain.',
      icon: 'FilePlus2',
      base_price: 500,
      features: ['Professional CV Design', 'Multiple Templates', 'AI-powered Content', 'PDF Download', 'Urdu/English Support'],
      required_documents: [
        { id: 'cv-d1', name: 'CNIC Copy', is_mandatory: true, description: 'Applicant ki CNIC copy' },
        { id: 'cv-d2', name: 'Educational Certificates', is_mandatory: true, description: 'All degrees and certificates' },
        { id: 'cv-d3', name: 'Experience Letter (if any)', is_mandatory: false, description: 'Previous job experience letters' },
        { id: 'cv-d4', name: 'Passport-size Photo', is_mandatory: true, description: 'Recent photo for CV' },
      ],
      is_active: true,
      sort_order: 104,
      official_url: '',
      apply_process: '1. CV Builder service ke liye apply karein\n2. Apni personal details fill karein\n3. Education aur experience bataein\n4. Skills aur languages add karein\n5. Payment karein\n6. Hum aapka professional CV taiyar karenge\n7. CV PDF format mein mil jayega',
      personal_info_fields: [
        { id: 'cv-fullName', label: 'Full Name / پورا نام', label_urdu: 'پورا نام', field_type: 'text', is_required: true, placeholder: 'Apna poora naam likhein', placeholder_urdu: 'اپنا پورا نام لکھیں' },
        { id: 'cv-fatherName', label: 'Father Name / والد کا نام', label_urdu: 'والد کا نام', field_type: 'text', is_required: true, placeholder: 'Father name', placeholder_urdu: 'والد کا نام' },
        { id: 'cv-cnic', label: 'CNIC Number', label_urdu: 'شناختی کارڈ نمبر', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X', placeholder_urdu: 'XXXXX-XXXXXXX-X' },
        { id: 'cv-phone', label: 'Phone Number', label_urdu: 'فون نمبر', field_type: 'phone', is_required: true, placeholder: '923001234567', placeholder_urdu: '923001234567' },
        { id: 'cv-email', label: 'Email Address', label_urdu: 'ای میل', field_type: 'text', is_required: false, placeholder: 'your@email.com', placeholder_urdu: 'your@email.com' },
        { id: 'cv-address', label: 'Address / پتہ', label_urdu: 'پتہ', field_type: 'text', is_required: true, placeholder: 'Mukkamal pata likhein', placeholder_urdu: 'مکمل پتہ لکھیں' },
        { id: 'cv-city', label: 'City / شہر', label_urdu: 'شہر', field_type: 'text', is_required: true, placeholder: 'Shehr ka naam', placeholder_urdu: 'شہر کا نام' },
        { id: 'cv-dob', label: 'Date of Birth / تاریخ پیدائش', label_urdu: 'تاریخ پیدائش', field_type: 'date', is_required: true, placeholder: '', placeholder_urdu: '' },
        { id: 'cv-gender', label: 'Gender / جنس', label_urdu: 'جنس', field_type: 'select', is_required: true, placeholder: 'Select gender', placeholder_urdu: 'جنس منتخب کریں', options: [{ value: 'male', label: 'Male', label_urdu: 'مرد' }, { value: 'female', label: 'Female', label_urdu: 'عورت' }] },
        { id: 'cv-objective', label: 'Career Objective / کیریئر کا مقصد', label_urdu: 'کیریئر کا مقصد', field_type: 'textarea', is_required: false, placeholder: 'Apna career goal likhein...', placeholder_urdu: 'اپنا کیریئر مقصد لکھیں' },
        { id: 'cv-education', label: 'Education / تعلیم (Matric, Inter, BA etc.)', label_urdu: 'تعلیم', field_type: 'textarea', is_required: true, placeholder: 'Matric - ABC School - 2018\nInter - XYZ College - 2020', placeholder_urdu: 'میٹرک - اے بی سی اسکول - 2018' },
        { id: 'cv-experience', label: 'Work Experience / کام کا تجربہ', label_urdu: 'کام کا تجربہ', field_type: 'textarea', is_required: false, placeholder: 'Company Name - Position - Duration\nE.g., ABC Corp - Clerk - 2 years', placeholder_urdu: 'کمپنی نام - عہدہ - مدت' },
        { id: 'cv-skills', label: 'Skills / مہارتیں', label_urdu: 'مہارتیں', field_type: 'textarea', is_required: false, placeholder: 'Computer, MS Office, Driving, etc.', placeholder_urdu: 'کمپیوٹر، ایم ایس آفس، ڈرائیونگ وغیرہ' },
        { id: 'cv-languages', label: 'Languages / زبانیں', label_urdu: 'زبانیں', field_type: 'textarea', is_required: false, placeholder: 'Urdu, English, Punjabi etc.', placeholder_urdu: 'اردو، انگریزی، پنجابی وغیرہ' },
        { id: 'cv-references', label: 'References / حوالہ جات', label_urdu: 'حوالہ جات', field_type: 'textarea', is_required: false, placeholder: 'Name - Position - Phone\nE.g., Ahmed - Teacher - 03001234567', placeholder_urdu: 'نام - عہدہ - فون' },
      ],
      eligibility: 'Koi bhi shaks jo job dhundh raha hai ya CV banwana chahta hai / Anyone looking for a job or needing a professional CV',
      important_details: ['CV 24-48 ghanton mein taiyar hoga / CV ready in 24-48 hours', 'Professional templates available hain / Professional templates available', 'Urdu ya English mein CV ban sakta hai / CV in Urdu or English', 'PDF format mein milega / Delivered in PDF format'],
      processing_time: '24-48 hours',
      fee_info: 'Rs. 500 - Professional CV with template selection',
      special_notes: 'CV ke liye sahi details dena zaroori hai. Jitni achi details, utna acha CV banega.',
    },
  ]

  // Enrich each service with personal_info_fields from GOVT_SERVICES static data
  const enriched = govtAndScholarshipServices.map(service => {
    const govtData = govtServicesLookup.get(service.id)
    return {
      ...service,
      personal_info_fields: govtData?.personal_info_fields || [],
    }
  })

  if (category) {
    return enriched.filter(s => s.category === category)
  }
  return enriched
}
