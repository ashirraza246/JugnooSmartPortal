/**
 * Comprehensive Pakistani Government Schemes & Services Data
 * 
 * Researched from official sources (2025):
 * - BISP: bisp.gov.pk, 8171.bisp.gov.pk
 * - Ehsaas: ehsaas.nadra.gov.pk, pass.gov.pk
 * - PM Youth: pmyp.gov.pk, pmybals.pmyp.gov.pk
 * - PM Kamyab Jawan: kamyabjawan.gov.pk
 * - NADRA: nadra.gov.pk, Pak ID App
 * - PEEF: peef.org.pk
 * - HEC: hec.gov.pk
 * - Zakat: zakat.punjab.gov.pk
 * - WAPDA/DISCOs: Enc portal, respective DISCO websites
 * 
 * CNIC Format: XXXXX-XXXXXXX-X (13 digits, hyphen-separated)
 * Example: 35201-1234567-1
 * - First 5 digits: District/City code
 * - Next 7 digits: Unique sequential number
 * - Last 1 digit: Gender (odd = Male, even = Female)
 */

export interface RequiredDoc {
  id: string
  name: string
  is_mandatory: boolean
  description: string
}

export interface PersonalInfoField {
  id: string
  label: string
  field_type: 'text' | 'cnic' | 'phone' | 'date' | 'select' | 'number' | 'textarea'
  is_required: boolean
  placeholder?: string
  options?: string[]
  validation?: string
}

export interface ServiceInfo {
  id: string
  name: string
  category: string
  subcategory: string
  description: string
  icon: string
  base_price: number
  features: string[]
  required_documents: RequiredDoc[]
  personal_info_fields: PersonalInfoField[]
  official_url: string
  apply_process: string
  cnic_required: boolean
  cnic_format_note: string
  fee_info: string
  eligibility: string
  processing_time: string
  special_notes: string
  is_active: boolean
  sort_order: number
}

// ============================================================
// CNIC FORMAT REQUIREMENTS (Universal across all services)
// ============================================================
export const CNIC_FORMAT = {
  pattern: 'XXXXX-XXXXXXX-X',
  regex: '^[0-9]{5}-[0-9]{7}-[0-9]{1}$',
  total_digits: 13,
  description: '13-digit number in format XXXXX-XXXXXXX-X. First 5 digits = district code, next 7 = unique number, last digit = gender (odd=male, even=female)',
  validation_rules: [
    'Must be exactly 13 digits (excluding hyphens)',
    'Must be issued by NADRA',
    'Must not be expired',
    'Both sides photocopy required for most applications',
    'CNIC must match the name on other documents',
  ],
}

// ============================================================
// COMPREHENSIVE GOVERNMENT SERVICES DATA
// ============================================================

export const GOVT_SERVICES: ServiceInfo[] = [

  // ─────────────────────────────────────────────
  // 1. BISP (Benazir Income Support Program)
  // ─────────────────────────────────────────────
  {
    id: 'bisp-registration',
    name: 'BISP (Benazir Income Support Program)',
    category: 'govt_scheme',
    subcategory: 'bisp',
    description: 'Pakistan\'s largest social protection initiative providing quarterly financial assistance (Rs. 13,500+) to low-income families. Women-headed households given priority.',
    icon: 'Wallet',
    base_price: 500,
    features: [
      'Quarterly cash payments (Rs. 13,500+)',
      'Women-headed household priority',
      'Biometric verification for payments',
      'SMS eligibility check via 8171',
      'Payment via designated centers or bank accounts',
    ],
    required_documents: [
      { id: 'bisp-d1', name: 'CNIC Copy (Applicant - Head of Household)', is_mandatory: true, description: 'Valid NADRA-issued CNIC, both sides photocopy. Must be current/not expired.' },
      { id: 'bisp-d2', name: 'Husband/Father CNIC Copy', is_mandatory: true, description: 'Both sides photocopy. Required for family verification.' },
      { id: 'bisp-d3', name: 'B-Form (Children under 18)', is_mandatory: false, description: 'NADRA Child Registration Certificate for all dependent children.' },
      { id: 'bisp-d4', name: 'Proof of Income / Unemployment', is_mandatory: false, description: 'Income certificate or unemployment declaration if applicable.' },
      { id: 'bisp-d5', name: 'Death Certificate (for widows)', is_mandatory: false, description: 'Required if applicant is a widow. Must be from Union Council.' },
      { id: 'bisp-d6', name: 'Divorce Certificate (for divorced women)', is_mandatory: false, description: 'Required if applicant is divorced. Union Council issued.' },
      { id: 'bisp-d7', name: 'Disability Certificate (if applicable)', is_mandatory: false, description: 'Medical board certificate for disabled applicants.' },
      { id: 'bisp-d8', name: 'Utility Bill (Proof of Residence)', is_mandatory: true, description: 'Recent electricity/gas bill showing address.' },
      { id: 'bisp-d9', name: 'Active Mobile Phone Number', is_mandatory: true, description: 'Registered on applicant CNIC for SMS notifications from 8171.' },
    ],
    personal_info_fields: [
      { id: 'bisp-p1', label: 'Applicant Full Name (as per CNIC)', field_type: 'text', is_required: true, placeholder: 'Exactly as printed on CNIC' },
      { id: 'bisp-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X', validation: '13-digit NADRA CNIC' },
      { id: 'bisp-p3', label: 'CNIC Issue Date', field_type: 'date', is_required: true },
      { id: 'bisp-p4', label: 'CNIC Expiry Date', field_type: 'date', is_required: true },
      { id: 'bisp-p5', label: 'Date of Birth', field_type: 'date', is_required: true },
      { id: 'bisp-p6', label: 'Gender', field_type: 'select', is_required: true, options: ['Male', 'Female', 'Transgender'] },
      { id: 'bisp-p7', label: 'Marital Status', field_type: 'select', is_required: true, options: ['Single', 'Married', 'Widowed', 'Divorced'] },
      { id: 'bisp-p8', label: 'Husband/Father Name', field_type: 'text', is_required: true },
      { id: 'bisp-p9', label: 'Mobile Number', field_type: 'phone', is_required: true, placeholder: '0300-1234567' },
      { id: 'bisp-p10', label: 'Family Size (Number of Members)', field_type: 'number', is_required: true, placeholder: 'e.g., 5' },
      { id: 'bisp-p11', label: 'Monthly Income (PKR)', field_type: 'number', is_required: true, placeholder: 'Must be below Rs. 25,000 (urban) / Rs. 20,000 (rural)' },
      { id: 'bisp-p12', label: 'Residential Address', field_type: 'textarea', is_required: true },
      { id: 'bisp-p13', label: 'District / Tehsil', field_type: 'text', is_required: true },
      { id: 'bisp-p14', label: 'Residence Type', field_type: 'select', is_required: true, options: ['Urban', 'Rural'] },
    ],
    official_url: 'https://8171.bisp.gov.pk',
    apply_process: '1. SMS CNIC number to 8171 for eligibility check\n2. If eligible, visit nearest BISP Tehsil Office with documents\n3. Complete NSER survey registration at BISP center\n4. Biometric verification will be conducted\n5. Receive confirmation SMS when approved\n6. Collect payments from designated centers\n\nOR Apply via 8171 Web Portal:\n1. Visit 8171.bisp.gov.pk\n2. Enter CNIC number and mobile number\n3. Fill household details\n4. Submit and save confirmation slip',
    cnic_required: true,
    cnic_format_note: 'Valid 13-digit CNIC required. Both sides photocopy mandatory. CNIC must not be expired.',
    fee_info: 'No government fee for BISP registration. Photostate shop may charge Rs. 300-500 for document preparation.',
    eligibility: 'Urban families: Monthly income < Rs. 25,000. Rural families: Monthly income < Rs. 20,000. Priority to women-headed households, widows, divorced women. Government employees NOT eligible. Families with foreign assets NOT eligible.',
    processing_time: '2-4 weeks after NSER survey completion. SMS notification sent on approval.',
    special_notes: 'NSER (National Socio-Economic Registry) survey is mandatory for new applicants. Payment amount revised quarterly. Call helpline 0800-26477 for assistance.',
    is_active: true,
    sort_order: 1,
  },

  // ─────────────────────────────────────────────
  // 2. Ehsaas Program / Ehsaas Kafalat
  // ─────────────────────────────────────────────
  {
    id: 'ehsaas-kafalat',
    name: 'Ehsaas Kafalat Program',
    category: 'govt_scheme',
    subcategory: 'ehsaas',
    description: 'Ehsaas Kafalat provides monthly cash stipends to poorest women across Pakistan. Part of the broader Ehsaas framework under PASS (Ministry of Poverty Alleviation). Current stipend: Rs. 12,000+ per quarter.',
    icon: 'Heart',
    base_price: 500,
    features: [
      'Quarterly cash stipend (Rs. 12,000+)',
      'Women-only beneficiary program',
      'Biometric payment verification',
      'SMS registration via 8171',
      'Savings account opening support',
    ],
    required_documents: [
      { id: 'ek-d1', name: 'CNIC Copy (Applicant Woman)', is_mandatory: true, description: 'Valid NADRA CNIC, both sides. Must be current.' },
      { id: 'ek-d2', name: 'Husband CNIC Copy', is_mandatory: true, description: 'Both sides photocopy for family verification.' },
      { id: 'ek-d3', name: 'B-Form of Children', is_mandatory: false, description: 'For all children under 18.' },
      { id: 'ek-d4', name: 'Proof of Residence (Utility Bill)', is_mandatory: true, description: 'Recent electricity/gas bill.' },
      { id: 'ek-d5', name: 'Death Certificate (Widows)', is_mandatory: false, description: 'If applicable, from Union Council.' },
      { id: 'ek-d6', name: 'Disability Certificate', is_mandatory: false, description: 'Medical board certificate if disabled.' },
      { id: 'ek-d7', name: 'Active Mobile SIM (on own CNIC)', is_mandatory: true, description: 'For SMS notifications from 8171.' },
    ],
    personal_info_fields: [
      { id: 'ek-p1', label: 'Applicant Woman Full Name (as per CNIC)', field_type: 'text', is_required: true, placeholder: 'As on CNIC' },
      { id: 'ek-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'ek-p3', label: 'Date of Birth', field_type: 'date', is_required: true },
      { id: 'ek-p4', label: 'Husband/Father Name', field_type: 'text', is_required: true },
      { id: 'ek-p5', label: 'Husband CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'ek-p6', label: 'Marital Status', field_type: 'select', is_required: true, options: ['Married', 'Widowed', 'Divorced', 'Single'] },
      { id: 'ek-p7', label: 'Mobile Number', field_type: 'phone', is_required: true, placeholder: '0300-1234567' },
      { id: 'ek-p8', label: 'Number of Dependents', field_type: 'number', is_required: true },
      { id: 'ek-p9', label: 'Monthly Household Income', field_type: 'number', is_required: true },
      { id: 'ek-p10', label: 'Complete Address', field_type: 'textarea', is_required: true },
      { id: 'ek-p11', label: 'District', field_type: 'text', is_required: true },
    ],
    official_url: 'https://ehsaas.nadra.gov.pk',
    apply_process: '1. SMS your CNIC number to 8171\n2. Check eligibility status via reply\n3. If eligible, visit Ehsaas Registration Center / NADRA office\n4. Biometric verification required\n5. Open bank account (if directed)\n6. Receive stipend via designated payment method\n\nEhsaas One-Window Centers also available for registration.',
    cnic_required: true,
    cnic_format_note: '13-digit valid CNIC. Both sides photocopy mandatory. Women must have CNIC in their own name.',
    fee_info: 'No government fee. Photostate shop service charge: Rs. 300-500.',
    eligibility: 'Only women can be beneficiaries. Must be from poorest households (PMT score below threshold). Not already receiving government employment benefits. No government employee in household.',
    processing_time: '2-6 weeks after registration and NSER verification.',
    special_notes: 'Ehsaas Kafalat is specifically for women. New NSER survey data is used for eligibility. Program now integrated with BISP payment system.',
    is_active: true,
    sort_order: 2,
  },

  // ─────────────────────────────────────────────
  // 3. Ehsaas Rashan
  // ─────────────────────────────────────────────
  {
    id: 'ehsaas-rashan',
    name: 'Ehsaas Rashan Program',
    category: 'govt_scheme',
    subcategory: 'ehsaas',
    description: 'Ehsaas Rashan provides food subsidies and cash for ration to low-income families. Eligible families get Rs. 2,000 monthly cash + up to 40% discount on essential food items (flour, oil, sugar, pulses) at designated utility stores.',
    icon: 'ShoppingBag',
    base_price: 400,
    features: [
      'Monthly cash support Rs. 2,000',
      'Up to 40% discount on essential food items',
      'Digital vouchers for utility stores',
      'Physical ration cards available',
      'SMS registration via 8123',
    ],
    required_documents: [
      { id: 'er-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Valid NADRA CNIC, both sides photocopy.' },
      { id: 'er-d2', name: 'Family Members Details', is_mandatory: true, description: 'Names, ages, and relationship of all family members.' },
      { id: 'er-d3', name: 'Proof of Income (Below Rs. 50,000)', is_mandatory: true, description: 'Income certificate or self-declaration.' },
      { id: 'er-d4', name: 'Active Mobile Number', is_mandatory: true, description: 'For SMS verification and notifications.' },
      { id: 'er-d5', name: 'B-Form of Children', is_mandatory: false, description: 'For dependent children registration.' },
      { id: 'er-d6', name: 'Utility Bill (Proof of Address)', is_mandatory: true, description: 'Recent electricity or gas bill.' },
    ],
    personal_info_fields: [
      { id: 'er-p1', label: 'Applicant Full Name (as per CNIC)', field_type: 'text', is_required: true, placeholder: 'As on CNIC' },
      { id: 'er-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'er-p3', label: 'Date of Birth', field_type: 'date', is_required: true },
      { id: 'er-p4', label: 'Gender', field_type: 'select', is_required: true, options: ['Male', 'Female'] },
      { id: 'er-p5', label: 'Mobile Number', field_type: 'phone', is_required: true, placeholder: '0300-1234567' },
      { id: 'er-p6', label: 'Number of Family Members', field_type: 'number', is_required: true },
      { id: 'er-p7', label: 'Monthly Household Income', field_type: 'number', is_required: true, placeholder: 'Must be below Rs. 50,000' },
      { id: 'er-p8', label: 'Complete Address', field_type: 'textarea', is_required: true },
      { id: 'er-p9', label: 'Are you already registered in Ehsaas/BISP?', field_type: 'select', is_required: true, options: ['Yes', 'No'] },
    ],
    official_url: 'https://ehsaas.nadra.gov.pk',
    apply_process: '1. Send CNIC number via SMS to 8123\n2. Receive eligibility confirmation via SMS\n3. If eligible, visit nearest E-Khidmat Markaz or registration center\n4. Provide documents for verification\n5. Receive ration card or digital voucher\n6. Collect ration from designated utility stores\n\nCan also register at E-Khidmat Markaz centers across Punjab.',
    cnic_required: true,
    cnic_format_note: '13-digit valid CNIC required. SMS to 8123 for eligibility check.',
    fee_info: 'No government fee. Photostate shop service: Rs. 200-400.',
    eligibility: 'Pakistani citizen. Monthly household income below Rs. 50,000. Priority: BISP/Ehsaas beneficiaries, widows, senior citizens (60+), disabled persons. MT score below 40.',
    processing_time: '1-3 weeks. SMS notification on approval.',
    special_notes: 'Previously registered Ehsaas/BISP beneficiaries are auto-eligible. Discount available at registered utility stores. Program periodically re-launched with new phases.',
    is_active: true,
    sort_order: 3,
  },

  // ─────────────────────────────────────────────
  // 4. PM Youth Loan Program
  // ─────────────────────────────────────────────
  {
    id: 'pm-youth-loan',
    name: 'PM Youth Business & Agriculture Loan (PMYB&ALS)',
    category: 'loan',
    subcategory: 'pm_loan',
    description: 'Government-backed business loans for Pakistani youth. Three tiers: Tier 1 (up to Rs. 500K, 0% interest), Tier 2 (Rs. 500K-1.5M, 5% markup), Tier 3 (Rs. 1.5M-7.5M, 7% markup). Supervised by State Bank of Pakistan.',
    icon: 'Banknote',
    base_price: 1500,
    features: [
      'Tier 1: Up to Rs. 500,000 (Interest-Free, 3 years)',
      'Tier 2: Rs. 500K-1.5M (5% markup, 5 years)',
      'Tier 3: Rs. 1.5M-7.5M (7% markup, 8 years)',
      'No collateral for Tier 1',
      '9+ partner banks including NBP, BOP, HBL',
      'Grace period for initial repayment',
    ],
    required_documents: [
      { id: 'pyl-d1', name: 'CNIC Copy (Front & Back)', is_mandatory: true, description: 'Valid NADRA CNIC, both sides clear photocopy.' },
      { id: 'pyl-d2', name: 'Passport-size Photographs (2)', is_mandatory: true, description: 'Recent photos with white or blue background.' },
      { id: 'pyl-d3', name: 'Educational/Skill Certificates', is_mandatory: false, description: 'Optional but preferred. Degrees, diplomas, skill certificates.' },
      { id: 'pyl-d4', name: 'Business Plan / Feasibility Report', is_mandatory: true, description: 'Detailed business idea or expansion plan with cost estimates.' },
      { id: 'pyl-d5', name: 'Utility Bill (Latest)', is_mandatory: true, description: 'Electricity or gas bill as proof of address.' },
      { id: 'pyl-d6', name: 'Bank Account Details', is_mandatory: false, description: 'IBAN or account number for loan disbursement.' },
      { id: 'pyl-d7', name: 'Experience Proof (if existing business)', is_mandatory: false, description: 'Business registration, tax returns, or proof of operation.' },
      { id: 'pyl-d8', name: 'Collateral Documents (Tier 3 only)', is_mandatory: false, description: 'Property papers or other security for Tier 3 loans.' },
    ],
    personal_info_fields: [
      { id: 'pyl-p1', label: 'Full Name (as per CNIC)', field_type: 'text', is_required: true, placeholder: 'As on CNIC' },
      { id: 'pyl-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X', validation: '13-digit NADRA CNIC' },
      { id: 'pyl-p3', label: 'CNIC Issue Date', field_type: 'date', is_required: true },
      { id: 'pyl-p4', label: 'Date of Birth', field_type: 'date', is_required: true },
      { id: 'pyl-p5', label: 'Gender', field_type: 'select', is_required: true, options: ['Male', 'Female', 'Transgender'] },
      { id: 'pyl-p6', label: 'Loan Tier', field_type: 'select', is_required: true, options: ['Tier 1: Up to Rs. 500K (0% interest)', 'Tier 2: Rs. 500K-1.5M (5%)', 'Tier 3: Rs. 1.5M-7.5M (7%)'] },
      { id: 'pyl-p7', label: 'Business Name', field_type: 'text', is_required: true, placeholder: 'Proposed or existing business name' },
      { id: 'pyl-p8', label: 'Business Type / Sector', field_type: 'select', is_required: true, options: ['Retail', 'Manufacturing', 'IT/E-Commerce', 'Agriculture', 'Services', 'Food', 'Other'] },
      { id: 'pyl-p9', label: 'Loan Amount Required (PKR)', field_type: 'number', is_required: true },
      { id: 'pyl-p10', label: 'Annual Income (PKR)', field_type: 'number', is_required: true },
      { id: 'pyl-p11', label: 'Mobile Number', field_type: 'phone', is_required: true, placeholder: '0300-1234567' },
      { id: 'pyl-p12', label: 'Email Address', field_type: 'text', is_required: true, placeholder: 'your@email.com' },
      { id: 'pyl-p13', label: 'Residential Address', field_type: 'textarea', is_required: true },
      { id: 'pyl-p14', label: 'Preferred Bank', field_type: 'select', is_required: true, options: ['National Bank of Pakistan (NBP)', 'Bank of Punjab (BOP)', 'Habib Bank Limited (HBL)', 'Allied Bank', 'Meezan Bank', 'UBL', 'Askari Bank', 'Bank Alfalah', 'ZTBL'] },
      { id: 'pyl-p15', label: 'Are you a defaulter of any bank?', field_type: 'select', is_required: true, options: ['No', 'Yes'] },
    ],
    official_url: 'https://pmyp.gov.pk',
    apply_process: '1. Visit official portal: pmyp.gov.pk or pmybals.pmyp.gov.pk\n2. Click "Apply Now" for Business Loan\n3. Create account with CNIC, mobile, email\n4. Receive OTP for verification\n5. Fill online application form with business details\n6. Upload required documents (CNIC, business plan, certificates)\n7. Select preferred bank\n8. Submit and note Tracking ID\n9. Bank will review and contact for approval\n10. Loan disbursed to bank account on approval\n\nCNIC Issue Date and DOB will be verified by NADRA.',
    cnic_required: true,
    cnic_format_note: '13-digit valid CNIC. CNIC Issue Date and DOB must match NADRA records. Both sides copy required.',
    fee_info: 'No application fee. Loan markup: Tier 1 = 0%, Tier 2 = 5%, Tier 3 = 7%. Photostate service: Rs. 1,000-1,500.',
    eligibility: 'Pakistani citizen with valid CNIC. Age 21-45 years (18 for IT/e-commerce). Must have business idea or existing setup. Not a bank defaulter. Special quota for women, transgenders, differently-abled.',
    processing_time: '2-4 weeks for bank verification and approval.',
    special_notes: 'Online application only through pmyp.gov.pk. CNIC details verified against NADRA database. Tracking ID for status updates via SMS/email. Processing time: ~30 days max.',
    is_active: true,
    sort_order: 20,
  },

  // ─────────────────────────────────────────────
  // 5. PM Kamyab Jawan Program
  // ─────────────────────────────────────────────
  {
    id: 'pm-kamyab-jawan',
    name: 'PM Kamyab Jawan Loan Program (YES)',
    category: 'loan',
    subcategory: 'pm_loan',
    description: 'Youth Entrepreneurship Scheme under PM Kamyab Jawan. Tiered business loans for ages 18-45. Same structure as PMYB&ALS but specifically branded for youth entrepreneurship. Training & mentorship via NAVTTC and SMEDA.',
    icon: 'Rocket',
    base_price: 1500,
    features: [
      'Tier 1: Up to Rs. 500K (0% interest, no collateral)',
      'Tier 2: Rs. 500K-1.5M (5% markup)',
      'Tier 3: Rs. 1.5M-7.5M (7% markup, collateral needed)',
      'Digital/paperless application process',
      'Women quota reserved',
      'NAVTTC & SMEDA training support',
      'Rs. 8 billion+ disbursed to date',
    ],
    required_documents: [
      { id: 'pkj-d1', name: 'CNIC Copy (Front & Back)', is_mandatory: true, description: 'Valid NADRA CNIC, both sides.' },
      { id: 'pkj-d2', name: 'Passport-size Photographs (2)', is_mandatory: true, description: 'Recent photos.' },
      { id: 'pkj-d3', name: 'Educational Certificate (Minimum Matric for IT)', is_mandatory: true, description: 'Attested copies of degrees/diplomas.' },
      { id: 'pkj-d4', name: 'Business Plan / Feasibility Report', is_mandatory: true, description: 'Detailed business proposal with financial projections.' },
      { id: 'pkj-d5', name: 'Proof of Income / Employment', is_mandatory: true, description: 'Salary slip, business proof, or unemployment declaration.' },
      { id: 'pkj-d6', name: 'Utility Bill (Latest)', is_mandatory: true, description: 'Proof of residential address.' },
      { id: 'pkj-d7', name: 'Bank Statement (if available)', is_mandatory: false, description: 'Last 6 months for existing business.' },
      { id: 'pkj-d8', name: 'Collateral Documents (Tier 3)', is_mandatory: false, description: 'Property papers for Tier 3 loans only.' },
    ],
    personal_info_fields: [
      { id: 'pkj-p1', label: 'Full Name (as per CNIC)', field_type: 'text', is_required: true, placeholder: 'As on CNIC' },
      { id: 'pkj-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'pkj-p3', label: 'Date of Birth', field_type: 'date', is_required: true },
      { id: 'pkj-p4', label: 'Age (18-45)', field_type: 'number', is_required: true },
      { id: 'pkj-p5', label: 'Gender', field_type: 'select', is_required: true, options: ['Male', 'Female', 'Transgender'] },
      { id: 'pkj-p6', label: 'Education Level', field_type: 'select', is_required: true, options: ['Matric', 'Intermediate', 'Graduate', 'Post-Graduate', 'Diploma/Technical'] },
      { id: 'pkj-p7', label: 'Loan Tier Required', field_type: 'select', is_required: true, options: ['Tier 1: Up to Rs. 500K', 'Tier 2: Rs. 500K-1.5M', 'Tier 3: Rs. 1.5M-7.5M'] },
      { id: 'pkj-p8', label: 'Business Sector', field_type: 'select', is_required: true, options: ['Agriculture', 'IT/E-Commerce', 'Retail', 'Manufacturing', 'Services', 'Food', 'Other'] },
      { id: 'pkj-p9', label: 'Business Plan Summary', field_type: 'textarea', is_required: true, placeholder: 'Brief description of business idea...' },
      { id: 'pkj-p10', label: 'Loan Amount (PKR)', field_type: 'number', is_required: true },
      { id: 'pkj-p11', label: 'Mobile Number', field_type: 'phone', is_required: true },
      { id: 'pkj-p12', label: 'Email Address', field_type: 'text', is_required: true },
      { id: 'pkj-p13', label: 'Residential Address', field_type: 'textarea', is_required: true },
      { id: 'pkj-p14', label: 'Preferred Bank', field_type: 'select', is_required: true, options: ['Bank Alfalah', 'Bank of Khyber (BOK)', 'NBP', 'BOP', 'HBL', 'Meezan Bank', 'UBL', 'Askari Bank', 'ZTBL'] },
    ],
    official_url: 'https://kamyabjawan.gov.pk',
    apply_process: '1. Visit kamyabjawan.gov.pk\n2. Select "Youth Entrepreneurship Scheme (YES)"\n3. Create account with CNIC and mobile\n4. Fill personal, educational, and business details\n5. Upload required documents\n6. Select preferred bank\n7. Submit application\n8. Track status via SMS/email\n\nApplication is completely digital and paperless. Processing takes 2-4 weeks.',
    cnic_required: true,
    cnic_format_note: '13-digit valid CNIC. Must match NADRA records. Both sides photocopy required.',
    fee_info: 'No application fee. Markup: 0% (Tier 1), 5% (Tier 2), 7% (Tier 3). Photostate service: Rs. 1,000-1,500.',
    eligibility: 'Pakistani citizen, age 18-45 (21+ for non-IT). Valid CNIC. Minimum matric for IT businesses. Viable business plan required. No prior loan default. One loan per applicant only.',
    processing_time: '2-4 weeks for bank verification and approval.',
    special_notes: 'Only one loan per applicant. Women quota available. NAVTTC training recommended before applying. SMEDA provides free business plan templates. Approval timeline: 2-4 weeks.',
    is_active: true,
    sort_order: 21,
  },

  // ─────────────────────────────────────────────
  // 6. NADRA Services - CNIC New
  // ─────────────────────────────────────────────
  {
    id: 'nadra-cnic-new',
    name: 'NADRA CNIC - New Application',
    category: 'govt_scheme',
    subcategory: 'nadra',
    description: 'First-time CNIC issuance for Pakistani citizens who have turned 18. The Computerized National Identity Card is mandatory for all adult citizens and required for virtually every government service.',
    icon: 'CreditCard',
    base_price: 300,
    features: [
      'Mandatory at age 18',
      'Required for all government services',
      'Biometric verification',
      'Normal / Urgent / Executive processing',
      'Home delivery available',
    ],
    required_documents: [
      { id: 'ncn-d1', name: 'B-Form / CRC (Child Registration Certificate)', is_mandatory: true, description: 'Original NADRA B-Form issued when child was registered.' },
      { id: 'ncn-d2', name: 'Birth Certificate (Union Council)', is_mandatory: true, description: 'Computerized birth registration from Union Council/Municipal Committee.' },
      { id: 'ncn-d3', name: 'Father/Mother CNIC Copy', is_mandatory: true, description: 'At least one parent CNIC required. Both sides photocopy.' },
      { id: 'ncn-d4', name: 'Family Registration Certificate (FRC)', is_mandatory: false, description: 'Optional but helps speed up verification.' },
      { id: 'ncn-d5', name: 'Matric Certificate / Educational Documents', is_mandatory: false, description: 'For name verification and date of birth confirmation.' },
      { id: 'ncn-d6', name: 'Passport-size Photographs', is_mandatory: false, description: 'Usually taken at NADRA center, but keep extras.' },
    ],
    personal_info_fields: [
      { id: 'ncn-p1', label: 'Full Name', field_type: 'text', is_required: true, placeholder: 'As per birth certificate/B-Form' },
      { id: 'ncn-p2', label: 'Date of Birth', field_type: 'date', is_required: true },
      { id: 'ncn-p3', label: 'Gender', field_type: 'select', is_required: true, options: ['Male', 'Female'] },
      { id: 'ncn-p4', label: 'Father Name', field_type: 'text', is_required: true },
      { id: 'ncn-p5', label: 'Father CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'ncn-p6', label: 'Mother Name', field_type: 'text', is_required: false },
      { id: 'ncn-p7', label: 'Mother CNIC Number', field_type: 'cnic', is_required: false, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'ncn-p8', label: 'Permanent Address', field_type: 'textarea', is_required: true },
      { id: 'ncn-p9', label: 'Current Address', field_type: 'textarea', is_required: true },
      { id: 'ncn-p10', label: 'Processing Type', field_type: 'select', is_required: true, options: ['Normal (Rs. 750 - 30+ days)', 'Urgent (Rs. 1,500 - 12-15 days)', 'Executive (Rs. 2,500 - 5-7 days)'] },
      { id: 'ncn-p11', label: 'Mobile Number', field_type: 'phone', is_required: true },
    ],
    official_url: 'https://nadra.gov.pk',
    apply_process: '1. Visit nearest NADRA Registration Center (NRC) with documents\n2. Get token from reception\n3. Present documents at counter\n4. Photo capture and biometric verification (fingerprints + iris)\n5. Review and verify all details on screen\n6. Pay fee at designated counter\n7. Receive slip with tracking ID\n8. Collect CNIC from center or opt for home delivery\n\nPak ID App: For some services, apply online via Pak ID mobile app.',
    cnic_required: false,
    cnic_format_note: 'N/A (this IS the CNIC application). Applicant will receive a 13-digit CNIC number upon issuance.',
    fee_info: 'Normal: Rs. 750 (30+ days). Urgent: Rs. 1,500 (12-15 days). Executive: Rs. 2,500 (5-7 days). Free for orphans and disabled persons (with certificate). Photostate service: Rs. 200-300.',
    eligibility: 'Pakistani citizen who has turned 18. Mandatory under NADRA Ordinance 2000. Must apply within 30 days of turning 18.',
    processing_time: 'Normal: 30+ days. Urgent: 12-15 days. Executive: 5-7 days.',
    special_notes: 'Biometric verification mandatory (fingerprints + iris scan). Must apply in person. NADRA centers open 6 days a week. Tracking ID can be checked online or via Pak ID App.',
    is_active: true,
    sort_order: 30,
  },

  // ─────────────────────────────────────────────
  // 6b. NADRA Services - CNIC Renewal/Correction
  // ─────────────────────────────────────────────
  {
    id: 'nadra-cnic-renewal',
    name: 'NADRA CNIC - Renewal / Correction / Duplicate',
    category: 'govt_scheme',
    subcategory: 'nadra',
    description: 'CNIC renewal (every 10 years or on expiry), correction of details (name, address, DOB), or duplicate issuance (lost/damaged card).',
    icon: 'RefreshCw',
    base_price: 300,
    features: [
      'Renewal on expiry (every 10 years)',
      'Name/Address/DOB correction',
      'Duplicate for lost/damaged CNIC',
      'Online tracking via Pak ID App',
      'Home delivery available',
    ],
    required_documents: [
      { id: 'ncr-d1', name: 'Old CNIC (Original)', is_mandatory: true, description: 'For renewal/correction. If lost, bring FIR copy.' },
      { id: 'ncr-d2', name: 'FIR Copy (for lost CNIC)', is_mandatory: false, description: 'Required only if CNIC is lost. Police station FIR.' },
      { id: 'ncr-d3', name: 'Supporting Document for Correction', is_mandatory: false, description: 'e.g., Matric certificate for name/DOB correction, utility bill for address change.' },
      { id: 'ncr-d4', name: 'Father/Husband CNIC Copy', is_mandatory: true, description: 'For family verification.' },
    ],
    personal_info_fields: [
      { id: 'ncr-p1', label: 'Full Name (as per current CNIC)', field_type: 'text', is_required: true },
      { id: 'ncr-p2', label: 'Current CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'ncr-p3', label: 'Service Type', field_type: 'select', is_required: true, options: ['Renewal (Expiring/Expired)', 'Correction (Name/Address/DOB)', 'Duplicate (Lost/Damaged)'] },
      { id: 'ncr-p4', label: 'Correction Details (if applicable)', field_type: 'textarea', is_required: false, placeholder: 'Describe what needs to be corrected...' },
      { id: 'ncr-p5', label: 'Mobile Number', field_type: 'phone', is_required: true },
      { id: 'ncr-p6', label: 'Processing Type', field_type: 'select', is_required: true, options: ['Normal (Rs. 750)', 'Urgent (Rs. 1,500)', 'Executive (Rs. 2,500)'] },
    ],
    official_url: 'https://nadra.gov.pk',
    apply_process: '1. Visit NADRA Registration Center with old CNIC\n2. Specify service: renewal, correction, or duplicate\n3. Provide supporting documents for corrections\n4. Biometric verification\n5. Pay applicable fee\n6. Receive tracking slip\n7. Collect new CNIC or opt for delivery',
    cnic_required: true,
    cnic_format_note: 'Existing 13-digit CNIC number required. New card will have same number.',
    fee_info: 'Normal: Rs. 750. Urgent: Rs. 1,500. Executive: Rs. 2,500. Duplicate: same fee structure. Photostate service: Rs. 200-300.',
    eligibility: 'Any Pakistani citizen with existing or expired CNIC.',
    processing_time: 'Normal: 30+ days. Urgent: 12-15 days. Executive: 5-7 days.',
    special_notes: 'CNIC must be renewed before or shortly after expiry. Name corrections require supporting documents (Matric certificate, etc.). Address change requires utility bill proof.',
    is_active: true,
    sort_order: 31,
  },

  // ─────────────────────────────────────────────
  // 6c. NADRA Services - B-Form (CRC)
  // ─────────────────────────────────────────────
  {
    id: 'nadra-bform',
    name: 'NADRA B-Form (Child Registration Certificate)',
    category: 'govt_scheme',
    subcategory: 'nadra',
    description: 'Child Registration Certificate (CRC), commonly known as B-Form, is the primary identity document for Pakistani children under 18. Mandatory under NADRA Ordinance 2000. Required for school admission, passport, and future CNIC.',
    icon: 'FileText',
    base_price: 200,
    features: [
      'Mandatory for all children under 18',
      'Required for school admissions',
      'Needed for child passport',
      'Links child to family tree in NADRA',
      'Age-based biometric requirements',
      'Online apply via Pak ID App (for infants up to 1 year)',
    ],
    required_documents: [
      { id: 'nbf-d1', name: 'Computerized Birth Certificate (Union Council)', is_mandatory: true, description: 'Issued by Union Council, Municipal Committee, or Cantonment Board.' },
      { id: 'nbf-d2', name: 'Parent CNIC (at least one)', is_mandatory: true, description: 'Valid CNIC or NICOP of at least one parent. Both preferred.' },
      { id: 'nbf-d3', name: 'Parent Biometric Verification', is_mandatory: true, description: 'Parent must be present for biometric verification at NADRA center.' },
      { id: 'nbf-d4', name: 'Child Photograph (Age 3-18)', is_mandatory: false, description: 'Required for children aged 3+. Taken at NADRA center.' },
      { id: 'nbf-d5', name: 'Foreign Birth Certificate (if born abroad)', is_mandatory: false, description: 'S-1 Form or detailed birth certificate from foreign authority.' },
    ],
    personal_info_fields: [
      { id: 'nbf-p1', label: 'Child Full Name', field_type: 'text', is_required: true, placeholder: 'As per birth certificate' },
      { id: 'nbf-p2', label: 'Child Date of Birth', field_type: 'date', is_required: true },
      { id: 'nbf-p3', label: 'Child Gender', field_type: 'select', is_required: true, options: ['Male', 'Female'] },
      { id: 'nbf-p4', label: 'Father Name (as per CNIC)', field_type: 'text', is_required: true },
      { id: 'nbf-p5', label: 'Father CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'nbf-p6', label: 'Mother Name (as per CNIC)', field_type: 'text', is_required: true },
      { id: 'nbf-p7', label: 'Mother CNIC Number', field_type: 'cnic', is_required: false, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'nbf-p8', label: 'Place of Birth', field_type: 'text', is_required: true },
      { id: 'nbf-p9', label: 'Child Age Group', field_type: 'select', is_required: true, options: ['0-3 years (No photo/biometric)', '3-10 years (Photo required)', '10-18 years (Photo + Fingerprints)'] },
      { id: 'nbf-p10', label: 'Processing Type', field_type: 'select', is_required: true, options: ['Normal (Rs. 50 - 30+ days)', 'Urgent (Rs. 500 - 5-7 days)'] },
    ],
    official_url: 'https://nadra.gov.pk',
    apply_process: 'For children up to 1 year:\n1. Download Pak ID App\n2. Select "Child Registration Certificate"\n3. Enter parent CNIC\n4. Upload child photo and documents\n5. Parent fingerprint verification on device\n6. Submit and track\n\nFor children 1-18 years:\n1. Visit nearest NADRA Registration Center\n2. Present birth certificate and parent CNIC\n3. Child photograph (3+ years) and fingerprints (10+ years) taken\n4. Pay applicable fee\n5. Receive tracking slip\n6. Collect B-Form or opt for delivery',
    cnic_required: false,
    cnic_format_note: 'N/A for child. Parent CNIC required. Child will be linked to family tree in NADRA database.',
    fee_info: 'Normal: Rs. 50 (30+ days). Urgent: Rs. 500 (5-7 days). Home delivery extra. Photostate service: Rs. 150-250.',
    eligibility: 'All Pakistani children under 18. Must register within 1 month of birth (legally mandated). At least one parent must have valid CNIC.',
    processing_time: 'Normal: 30+ days. Urgent: 5-7 days. Online (infants): 1-3 working days.',
    special_notes: 'Age-based biometric system: 0-3 years (no photo/biometric), 3-10 years (photo only), 10-18 years (photo + fingerprints). B-Form must be updated at each age milestone. CRC is renewed at ages 3 and 10.',
    is_active: true,
    sort_order: 32,
  },

  // ─────────────────────────────────────────────
  // 7. Pakistan Scholarship Programs
  // ─────────────────────────────────────────────
  {
    id: 'peef-scholarship',
    name: 'PEEF Scholarship (Punjab Educational Endowment Fund)',
    category: 'scholarship',
    subcategory: 'scholarship',
    description: 'Merit and need-based scholarships for Punjab domicile students pursuing undergraduate (4-5 year) programs or diplomas at participating institutions. Covers tuition and provides stipend.',
    icon: 'GraduationCap',
    base_price: 500,
    features: [
      'Full tuition fee coverage',
      'Monthly stipend',
      'Merit and need-based',
      'For Punjab domicile holders',
      'Undergraduate and diploma programs',
    ],
    required_documents: [
      { id: 'psf-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Both sides photocopy.' },
      { id: 'psf-d2', name: 'Father/Guardian CNIC Copy', is_mandatory: true, description: 'Both sides.' },
      { id: 'psf-d3', name: 'Domicile Certificate (Punjab)', is_mandatory: true, description: 'Issued by Deputy Commissioner office.' },
      { id: 'psf-d4', name: 'Matric Certificate (Attested)', is_mandatory: true, description: 'Board-issued, attested copy.' },
      { id: 'psf-d5', name: 'Intermediate Certificate (Attested)', is_mandatory: true, description: 'Board-issued, attested copy.' },
      { id: 'psf-d6', name: 'University/College Admission Letter', is_mandatory: true, description: 'From participating institution.' },
      { id: 'psf-d7', name: 'Income Certificate (Tehsildar verified)', is_mandatory: true, description: 'Must show income within eligible range.' },
      { id: 'psf-d8', name: 'Passport-size Photographs (4)', is_mandatory: true, description: 'Recent photos with white background.' },
      { id: 'psf-d9', name: 'Disability Certificate (if applicable)', is_mandatory: false, description: 'For special quota.' },
      { id: 'psf-d10', name: 'Orphan Certificate / Death Certificate of Father', is_mandatory: false, description: 'For orphan quota.' },
    ],
    personal_info_fields: [
      { id: 'psf-p1', label: 'Student Full Name', field_type: 'text', is_required: true },
      { id: 'psf-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'psf-p3', label: 'Date of Birth', field_type: 'date', is_required: true },
      { id: 'psf-p4', label: 'Gender', field_type: 'select', is_required: true, options: ['Male', 'Female'] },
      { id: 'psf-p5', label: 'Father/Guardian Name', field_type: 'text', is_required: true },
      { id: 'psf-p6', label: 'Father CNIC Number', field_type: 'cnic', is_required: true },
      { id: 'psf-p7', label: 'Domicile District', field_type: 'text', is_required: true },
      { id: 'psf-p8', label: 'Last Exam Passed', field_type: 'select', is_required: true, options: ['Matric', 'Intermediate', 'Diploma'] },
      { id: 'psf-p9', label: 'Marks Obtained (%)', field_type: 'number', is_required: true },
      { id: 'psf-p10', label: 'University/College Name', field_type: 'text', is_required: true },
      { id: 'psf-p11', label: 'Degree Program', field_type: 'text', is_required: true },
      { id: 'psf-p12', label: 'Family Monthly Income', field_type: 'number', is_required: true },
      { id: 'psf-p13', label: 'Mobile Number', field_type: 'phone', is_required: true },
      { id: 'psf-p14', label: 'Home Address', field_type: 'textarea', is_required: true },
    ],
    official_url: 'https://peef.org.pk',
    apply_process: '1. Visit PEEF website: peef.org.pk\n2. Download or fill online application form\n3. Attach all required documents (attested copies)\n4. Submit to institution\'s financial aid office OR PEEF office\n5. Track application status online\n\nApplication form available on PEEF website in PDF format.',
    cnic_required: true,
    cnic_format_note: '13-digit valid CNIC. Must be applicant\'s own CNIC (not B-Form). Both sides photocopy.',
    fee_info: 'No application fee. Full scholarship covers tuition + stipend. Photostate service: Rs. 400-600.',
    eligibility: 'Pakistani national. Punjab domicile. Secured admission in approved discipline at participating institution. Enrolled in undergraduate (4-5 year) or diploma program. Family income within PEEF threshold. Special quotas for orphans, disabled, minorities.',
    processing_time: '4-8 weeks after application deadline.',
    special_notes: 'Application deadlines vary by institution. Special quotas: Orphans, children of government employees (Grade 1-4), disabled, minorities. Attested documents required.',
    is_active: true,
    sort_order: 40,
  },

  {
    id: 'hec-scholarship',
    name: 'HEC Scholarship (Higher Education Commission)',
    category: 'scholarship',
    subcategory: 'scholarship',
    description: 'Multiple scholarship programs by HEC for undergraduate, graduate, and PhD studies. Includes indigenous scholarships, foreign scholarships (CSC, Commonwealth), and need-based programs.',
    icon: 'GraduationCap',
    base_price: 600,
    features: [
      'Indigenous PhD Scholarships',
      'Foreign Scholarships (China, UK, etc.)',
      'Need-based Undergraduate Scholarships',
      'Research grants',
      'Full tuition + stipend + books',
    ],
    required_documents: [
      { id: 'hsc-d1', name: 'CNIC Copy', is_mandatory: true, description: 'Both sides.' },
      { id: 'hsc-d2', name: 'All Academic Transcripts & Degrees', is_mandatory: true, description: 'Attested copies of all degrees and transcripts.' },
      { id: 'hsc-d3', name: 'Domicile Certificate', is_mandatory: true, description: 'Province/district domicile.' },
      { id: 'hsc-d4', name: 'Research Proposal (for PhD)', is_mandatory: false, description: 'Detailed research proposal for graduate/PhD scholarships.' },
      { id: 'hsc-d5', name: 'Recommendation Letters (2-3)', is_mandatory: true, description: 'From academic supervisors or employers.' },
      { id: 'hsc-d6', name: 'Statement of Purpose / Motivation Letter', is_mandatory: true, description: 'Explaining academic goals and need.' },
      { id: 'hsc-d7', name: 'Income Certificate / Salary Slip', is_mandatory: true, description: 'Proof of financial need.' },
      { id: 'hsc-d8', name: 'Passport-size Photographs', is_mandatory: true, description: 'Recent photos.' },
      { id: 'hsc-d9', name: 'Valid Passport (for foreign scholarships)', is_mandatory: false, description: 'Required for overseas scholarship programs.' },
      { id: 'hsc-d10', name: 'IELTS/TOEFL Score (for foreign)', is_mandatory: false, description: 'If applying for international scholarship.' },
    ],
    personal_info_fields: [
      { id: 'hsc-p1', label: 'Full Name', field_type: 'text', is_required: true },
      { id: 'hsc-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'hsc-p3', label: 'Date of Birth', field_type: 'date', is_required: true },
      { id: 'hsc-p4', label: 'Scholarship Category', field_type: 'select', is_required: true, options: ['Indigenous PhD', 'Foreign PhD', 'Undergraduate Need-Based', 'MS/MPhil'] },
      { id: 'hsc-p5', label: 'Current Qualification', field_type: 'select', is_required: true, options: ['Intermediate', 'Bachelor (14 years)', 'Master (16 years)', 'MPhil/MS (18 years)'] },
      { id: 'hsc-p6', label: 'CGPA / Percentage', field_type: 'text', is_required: true, placeholder: 'e.g., 3.5/4.0 or 85%' },
      { id: 'hsc-p7', label: 'Proposed Field of Study', field_type: 'text', is_required: true },
      { id: 'hsc-p8', label: 'Mobile Number', field_type: 'phone', is_required: true },
      { id: 'hsc-p9', label: 'Email Address', field_type: 'text', is_required: true },
      { id: 'hsc-p10', label: 'Home Address', field_type: 'textarea', is_required: true },
    ],
    official_url: 'https://scholarship.hec.gov.pk',
    apply_process: '1. Create account on HEC scholarship portal: scholarship.hec.gov.pk\n2. Select scholarship program\n3. Fill application form with academic and personal details\n4. Upload required documents\n5. Submit before deadline\n6. Shortlisted candidates called for interview\n\nDifferent deadlines for different programs. Check HEC website regularly.',
    cnic_required: true,
    cnic_format_note: '13-digit valid CNIC required. Both sides photocopy.',
    fee_info: 'No application fee. Full scholarship coverage (tuition + stipend + books). Photostate service: Rs. 500-700.',
    eligibility: 'Pakistani/AJK national. Varies by program. Generally: strong academic record, valid CNIC, domicile, admission in HEC-recognized institution.',
    processing_time: '2-6 months depending on scholarship category.',
    special_notes: 'Different programs have different deadlines. HEC portal account required. Must check HEC website for open scholarships. Interview stage for most programs.',
    is_active: true,
    sort_order: 41,
  },

  // ─────────────────────────────────────────────
  // 8. Government Job Applications
  // ─────────────────────────────────────────────
  {
    id: 'govt-job-application',
    name: 'Government Job Application (FPSC/PPSC/Departmental)',
    category: 'govt_scheme',
    subcategory: 'employment',
    description: 'Assistance with government job applications through FPSC (Federal), PPSC (Punjab), SPSC (Sindh), KPPSC (KP), BPSC (Balochistan), or direct departmental recruitment. Includes form filling and document preparation.',
    icon: 'Briefcase',
    base_price: 500,
    features: [
      'FPSC online application',
      'PPSC online application',
      'Departmental direct applications',
      'Document preparation & attestation',
      'Challan form preparation',
    ],
    required_documents: [
      { id: 'gja-d1', name: 'CNIC Copy (Both sides)', is_mandatory: true, description: 'Valid NADRA CNIC, both sides clear copy.' },
      { id: 'gja-d2', name: 'Domicile Certificate', is_mandatory: true, description: 'Issued by Deputy Commissioner. Province/district specific.' },
      { id: 'gja-d3', name: 'Educational Certificates (All, Attested)', is_mandatory: true, description: 'Matric, Inter, BA/BSc, MA/MSc etc. Attested by gazetted officer.' },
      { id: 'gja-d4', name: 'Experience Certificate(s)', is_mandatory: false, description: 'If required by the job posting. On official letterhead.' },
      { id: 'gja-d5', name: 'Passport-size Photographs (4-6)', is_mandatory: true, description: 'Recent, with white or blue background.' },
      { id: 'gja-d6', name: 'Character Certificate', is_mandatory: true, description: 'From gazetted officer or last institution.' },
      { id: 'gja-d7', name: 'Treasury/Challan Fee Deposit Receipt', is_mandatory: true, description: 'Fee deposited in State/National Bank as per advertisement.' },
      { id: 'gja-d8', name: 'Medical Certificate (if required)', is_mandatory: false, description: 'From authorized medical officer.' },
      { id: 'gja-d9', name: 'Disabled Person Certificate (if applicable)', is_mandatory: false, description: 'From Medical Board for quota.' },
      { id: 'gja-d10', name: 'Father/Husband CNIC Copy', is_mandatory: false, description: 'For some departmental applications.' },
    ],
    personal_info_fields: [
      { id: 'gja-p1', label: 'Full Name (as per CNIC)', field_type: 'text', is_required: true },
      { id: 'gja-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'gja-p3', label: 'Date of Birth', field_type: 'date', is_required: true },
      { id: 'gja-p4', label: 'Gender', field_type: 'select', is_required: true, options: ['Male', 'Female'] },
      { id: 'gja-p5', label: 'Father/Husband Name', field_type: 'text', is_required: true },
      { id: 'gja-p6', label: 'Domicile District', field_type: 'text', is_required: true },
      { id: 'gja-p7', label: 'Highest Qualification', field_type: 'select', is_required: true, options: ['Middle', 'Matric', 'Intermediate', 'Bachelor', 'Master', 'MPhil/MS', 'PhD'] },
      { id: 'gja-p8', label: 'Total Experience (Years)', field_type: 'number', is_required: false, placeholder: '0 if fresh' },
      { id: 'gja-p9', label: 'Applying Through', field_type: 'select', is_required: true, options: ['FPSC (Federal)', 'PPSC (Punjab)', 'SPSC (Sindh)', 'KPPSC (KP)', 'BPSC (Balochistan)', 'Direct Departmental'] },
      { id: 'gja-p10', label: 'Post Applied For', field_type: 'text', is_required: true, placeholder: 'e.g., Assistant Director, Clerk, etc.' },
      { id: 'gja-p11', label: 'Advertisement / Reference Number', field_type: 'text', is_required: true, placeholder: 'From newspaper/website' },
      { id: 'gja-p12', label: 'Mobile Number', field_type: 'phone', is_required: true },
      { id: 'gja-p13', label: 'Permanent Address', field_type: 'textarea', is_required: true },
      { id: 'gja-p14', label: 'Postal Address', field_type: 'textarea', is_required: true },
    ],
    official_url: 'https://www.fpsc.gov.pk',
    apply_process: 'FPSC:\n1. Visit fpsc.gov.pk\n2. Create account\n3. Apply online for desired post\n4. Upload documents and photo\n5. Download challan, deposit fee in bank\n6. Submit application before deadline\n7. Download roll number slip for test\n\nPPSC:\n1. Visit ppsc.gop.pk\n2. Create account\n3. Apply for desired post\n4. Pay fee via challan\n5. Appear in written test\n\nDepartmental:\n1. Get application form from department\n2. Fill form and attach documents\n3. Send via registered post or submit in person\n4. Keep copy of submitted application',
    cnic_required: true,
    cnic_format_note: '13-digit valid CNIC required. Both sides photocopy. Name on CNIC must match educational certificates.',
    fee_info: 'FPSC fee: Rs. 300-1,500 (varies by grade). PPSC fee: Rs. 400-1,000. Photostate service: Rs. 400-700. Attestation charges extra.',
    eligibility: 'Varies by post. Generally: Pakistani citizen, valid CNIC, domicile, required qualification, age limit (18-30+ with relaxation).',
    processing_time: 'Written test within 2-3 months. Interview 1-2 months after test. Final selection 2-6 months total.',
    special_notes: 'Age relaxation available for government servants, disabled, minorities. Domicile is mandatory. All documents must be attested by gazetted officer. Keep photocopies of everything submitted. Check NJP (njp.gov.pk) for all government job listings.',
    is_active: true,
    sort_order: 50,
  },

  // ─────────────────────────────────────────────
  // 9. Zakat Applications
  // ─────────────────────────────────────────────
  {
    id: 'zakat-application',
    name: 'Zakat Application (Guzara / Health / Education / Marriage)',
    category: 'govt_scheme',
    subcategory: 'zakat',
    description: 'Apply for Zakat funds through District/Local Zakat Committee. Multiple programs: Guzara Allowance (monthly for poor), Health Care (medical treatment), Education Stipends, Marriage Assistance (Rs. 20,000 for unmarried women), and Social Rehabilitation.',
    icon: 'HandCoins',
    base_price: 300,
    features: [
      'Guzara Allowance (Monthly for chronic poor)',
      'Health Care (Medical treatment support)',
      'Education Stipends (School/University)',
      'Marriage Assistance (Rs. 20,000)',
      'Social Rehabilitation Scheme',
      'Leprosy Patient Support',
    ],
    required_documents: [
      { id: 'zak-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Both sides photocopy.' },
      { id: 'zak-d2', name: 'Application Form (Specific to program)', is_mandatory: true, description: 'Obtained from Local Zakat Committee or zakat.punjab.gov.pk.' },
      { id: 'zak-d3', name: 'Income Certificate / Poverty Proof', is_mandatory: true, description: 'Tehsildar certificate or BISP/Ehsaas card.' },
      { id: 'zak-d4', name: 'B-Form / Family Members CNICs', is_mandatory: true, description: 'For household verification.' },
      { id: 'zak-d5', name: 'Medical Reports (for Health Care)', is_mandatory: false, description: 'Required only for health-related Zakat applications.' },
      { id: 'zak-d6', name: 'Educational Documents (for Stipends)', is_mandatory: false, description: 'Admission proof, fee slip, previous result.' },
      { id: 'zak-d7', name: 'Unmarried Certificate (for Marriage)', is_mandatory: false, description: 'For marriage assistance. From Union Council.' },
      { id: 'zak-d8', name: 'Passport-size Photographs (2)', is_mandatory: true, description: 'Recent photos.' },
    ],
    personal_info_fields: [
      { id: 'zak-p1', label: 'Full Name (as per CNIC)', field_type: 'text', is_required: true },
      { id: 'zak-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'zak-p3', label: 'Date of Birth', field_type: 'date', is_required: true },
      { id: 'zak-p4', label: 'Gender', field_type: 'select', is_required: true, options: ['Male', 'Female'] },
      { id: 'zak-p5', label: 'Zakat Program Type', field_type: 'select', is_required: true, options: ['Guzara Allowance', 'Health Care', 'Education Stipend (General)', 'Education Stipend (Deeni Madaris)', 'Education Stipend (Technical)', 'Marriage Assistance', 'Social Rehabilitation'] },
      { id: 'zak-p6', label: 'Father/Husband Name', field_type: 'text', is_required: true },
      { id: 'zak-p7', label: 'Number of Dependents', field_type: 'number', is_required: true },
      { id: 'zak-p8', label: 'Monthly Income', field_type: 'number', is_required: true },
      { id: 'zak-p9', label: 'District / Tehsil', field_type: 'text', is_required: true },
      { id: 'zak-p10', label: 'Complete Address', field_type: 'textarea', is_required: true },
      { id: 'zak-p11', label: 'Mobile Number', field_type: 'phone', is_required: true },
    ],
    official_url: 'https://zakat.punjab.gov.pk',
    apply_process: '1. Get application form from Local Zakat Committee or download from zakat.punjab.gov.pk/forms\n2. Fill the form completely\n3. Attach all required documents\n4. Submit to Local Zakat Committee (LZC)\n5. LZC verifies and forwards to District Zakat Committee\n6. Approval and disbursement through LZC\n\nForms available in Urdu and English. Different forms for each program (Guzara, Health, Education, Marriage).',
    cnic_required: true,
    cnic_format_note: '13-digit valid CNIC. Both sides photocopy. Must be a Muslim (Zakat is for Mustahiqeen).',
    fee_info: 'No application fee. Guzara allowance: monthly payment. Marriage assistance: Rs. 20,000 one-time. Health: as per treatment cost. Photostate service: Rs. 200-400.',
    eligibility: 'Must be a Muslim. Must be Mustahiq (deserving) as per Shariah. Below poverty line. Priority to widows, orphans, disabled, elderly. Verified by Local Zakat Committee.',
    processing_time: '2-8 weeks depending on program and district committee schedule.',
    special_notes: 'Forms available in both Urdu and English on zakat.punjab.gov.pk. Must apply through Local Zakat Committee. Zakat is deducted on 1st of Ramazan from bank accounts. CZ-50 form for Zakat exemption. Different provinces have separate Zakat departments.',
    is_active: true,
    sort_order: 55,
  },

  // ─────────────────────────────────────────────
  // 10. WAPDA / Utility Bill Services
  // ─────────────────────────────────────────────
  {
    id: 'wapda-new-connection',
    name: 'WAPDA / Electricity New Connection',
    category: 'govt_scheme',
    subcategory: 'utility',
    description: 'Apply for new electricity connection through your regional DISCO (LESCO, FESCO, MEPCO, GEPCO, IESCO, PESCO, HESCO, SEPCO, QESCO, TESCO, K-Electric). Online application via ENC portal or DISCO website.',
    icon: 'Zap',
    base_price: 500,
    features: [
      'Online application via ENC portal',
      'Domestic / Commercial / Industrial connections',
      'Track application status online',
      'All DISCOs supported',
      'Meter installation within defined timeline',
    ],
    required_documents: [
      { id: 'wap-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Both sides clear photocopy.' },
      { id: 'wap-d2', name: 'Proof of Ownership / Sale Deed', is_mandatory: true, description: 'Property ownership document or sale agreement.' },
      { id: 'wap-d3', name: 'Site Map / Location Sketch', is_mandatory: true, description: 'Drawing showing property location and meter point.' },
      { id: 'wap-d4', name: 'NOC from Landlord (if rented)', is_mandatory: false, description: 'Required only for rented properties.' },
      { id: 'wap-d5', name: 'Completion Certificate (Local Council)', is_mandatory: true, description: 'Building completion certificate from local authority.' },
      { id: 'wap-d6', name: 'Load Details Form (A-1 Form)', is_mandatory: true, description: 'Specifying required load in kW.' },
      { id: 'wap-d7', name: 'Test Report (from licensed electrician)', is_mandatory: true, description: 'Wiring test report from licensed electrician.' },
      { id: 'wap-d8', name: 'Abridged Conditions of Supply', is_mandatory: true, description: 'Signed agreement of supply terms.' },
      { id: 'wap-d9', name: 'Environmental Clearance (Industrial)', is_mandatory: false, description: 'Required only for industrial connections.' },
    ],
    personal_info_fields: [
      { id: 'wap-p1', label: 'Applicant Full Name (as per CNIC)', field_type: 'text', is_required: true },
      { id: 'wap-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'wap-p3', label: 'Connection Type', field_type: 'select', is_required: true, options: ['Domestic (Residential)', 'Commercial (Shop/Office)', 'Industrial (Factory)', 'Agricultural (Tube Well)'] },
      { id: 'wap-p4', label: 'Required Load (kW)', field_type: 'number', is_required: true, placeholder: 'e.g., 5, 10, 20 kW' },
      { id: 'wap-p5', label: 'Supply Type', field_type: 'select', is_required: true, options: ['Single Phase (1-phase)', 'Three Phase (3-phase)'] },
      { id: 'wap-p6', label: 'Regional DISCO', field_type: 'select', is_required: true, options: ['LESCO (Lahore)', 'FESCO (Faisalabad)', 'MEPCO (Multan)', 'GEPCO (Gujranwala)', 'IESCO (Islamabad)', 'PESCO (Peshawar)', 'HESCO (Hyderabad)', 'SEPCO (Sukkur)', 'QESCO (Quetta)', 'TESCO (Tribal)', 'K-Electric (Karachi)'] },
      { id: 'wap-p7', label: 'Property Address', field_type: 'textarea', is_required: true },
      { id: 'wap-p8', label: 'Nearest Reference / Landmark', field_type: 'text', is_required: true },
      { id: 'wap-p9', label: 'Mobile Number', field_type: 'phone', is_required: true },
      { id: 'wap-p10', label: 'Is Property Rented?', field_type: 'select', is_required: true, options: ['Owned', 'Rented'] },
    ],
    official_url: 'https://enc.gov.pk',
    apply_process: '1. Identify your regional DISCO (LESCO, FESCO, MEPCO, etc.)\n2. Visit DISCO website or ENC portal: enc.gov.pk\n3. Create account if required\n4. Fill online application form\n5. Upload required documents\n6. Pay application fee (varies by load and type)\n7. Receive reference number\n8. Track application online\n9. NEPRA monitors: Connection must be given within timeline\n\nDomestic connections: Typically 15-30 days. Commercial: 30-45 days. Industrial: 45-90 days.',
    cnic_required: true,
    cnic_format_note: '13-digit valid CNIC. Must match property owner name. Both sides photocopy.',
    fee_info: 'Application fee varies: Domestic Rs. 500-5,000. Commercial Rs. 2,000-20,000. Security deposit: Refundable, varies by load. Meter cost included. Photostate service: Rs. 300-500.',
    eligibility: 'Property owner or authorized tenant. Valid CNIC. Complete wiring by licensed electrician. No outstanding dues on same property.',
    processing_time: 'Domestic: 15-30 days. Commercial: 30-45 days. Industrial: 45-90 days. NEPRA mandates timelines.',
    special_notes: 'NEPRA regulates connection timelines. Complain to NEPRA if delayed beyond timeline. K-Electric has separate process from WAPDA DISCOs. ENC portal works for all DISCOs except K-Electric. Fee includes meter cost, wiring to pole, and security deposit.',
    is_active: true,
    sort_order: 60,
  },

  {
    id: 'utility-bill-service',
    name: 'Utility Bill Services (Duplicate / Correction / Transfer)',
    category: 'govt_scheme',
    subcategory: 'utility',
    description: 'Utility bill related services: duplicate bill print, name correction, bill transfer on property sale, new gas connection (SNGPL/SSGC), and water connection (WASA).',
    icon: 'Receipt',
    base_price: 200,
    features: [
      'Duplicate bill print',
      'Consumer name correction',
      'Bill ownership transfer',
      'Gas connection application',
      'Water connection application',
    ],
    required_documents: [
      { id: 'ubs-d1', name: 'CNIC Copy (Applicant)', is_mandatory: true, description: 'Both sides.' },
      { id: 'ubs-d2', name: 'Latest Paid Bill / Reference Number', is_mandatory: true, description: 'Previous bill for consumer reference.' },
      { id: 'ubs-d3', name: 'Sale Deed / Transfer Documents (for transfer)', is_mandatory: false, description: 'Required only for ownership transfer.' },
      { id: 'ubs-d4', name: 'NOC from Previous Owner', is_mandatory: false, description: 'For bill transfer.' },
      { id: 'ubs-d5', name: 'Property Ownership Proof', is_mandatory: false, description: 'For name correction or transfer.' },
    ],
    personal_info_fields: [
      { id: 'ubs-p1', label: 'Applicant Full Name', field_type: 'text', is_required: true },
      { id: 'ubs-p2', label: 'CNIC Number', field_type: 'cnic', is_required: true, placeholder: 'XXXXX-XXXXXXX-X' },
      { id: 'ubs-p3', label: 'Service Type', field_type: 'select', is_required: true, options: ['Duplicate Bill (Electricity)', 'Duplicate Bill (Gas)', 'Duplicate Bill (Water)', 'Name Correction', 'Ownership Transfer', 'New Gas Connection', 'New Water Connection'] },
      { id: 'ubs-p4', label: 'Consumer / Reference Number', field_type: 'text', is_required: true, placeholder: 'From previous bill' },
      { id: 'ubs-p5', label: 'Mobile Number', field_type: 'phone', is_required: true },
    ],
    official_url: 'https://enc.gov.pk',
    apply_process: 'Duplicate Bill:\n1. Visit respective DISCO website\n2. Enter consumer number\n3. Download/print duplicate bill\n\nName Correction / Transfer:\n1. Visit DISCO customer service center\n2. Submit application with documents\n3. Pay processing fee\n4. Changes reflected in next bill\n\nGas Connection:\n1. Visit SNGPL/SSGC office or website\n2. Submit application with property documents\n3. Pay connection fee\n4. Gas meter installation',
    cnic_required: true,
    cnic_format_note: '13-digit valid CNIC required. Both sides photocopy.',
    fee_info: 'Duplicate bill: Free online. Name correction: Rs. 100-500. Transfer: Rs. 200-1,000. Photostate service: Rs. 100-200.',
    eligibility: 'Property owner or authorized tenant with valid CNIC.',
    processing_time: 'Duplicate bill: Instant. Corrections: 1-2 weeks. Transfer: 2-4 weeks.',
    special_notes: 'Most duplicate bills available free online. Check DISCO websites for online bill services. SNGPL covers Punjab/KPK, SSGC covers Sindh/Balochistan.',
    is_active: true,
    sort_order: 61,
  },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getServiceById(id: string): ServiceInfo | undefined {
  return GOVT_SERVICES.find(s => s.id === id)
}

export function getServicesByCategory(category: string): ServiceInfo[] {
  return GOVT_SERVICES.filter(s => s.category === category)
}

export function getServicesBySubcategory(subcategory: string): ServiceInfo[] {
  return GOVT_SERVICES.filter(s => s.subcategory === subcategory)
}

export function validateCNIC(cnic: string): { valid: boolean; message: string } {
  // Remove hyphens and spaces
  const clean = cnic.replace(/[-\s]/g, '')
  
  if (clean.length !== 13) {
    return { valid: false, message: 'CNIC must be exactly 13 digits' }
  }
  
  if (!/^\d{13}$/.test(clean)) {
    return { valid: false, message: 'CNIC must contain only digits' }
  }
  
  const lastDigit = parseInt(clean[12])
  const gender = lastDigit % 2 === 0 ? 'Female' : 'Male'
  
  return { valid: true, message: `Valid CNIC format (Gender: ${gender})` }
}

export function formatCNIC(cnic: string): string {
  const clean = cnic.replace(/[-\s]/g, '')
  if (clean.length !== 13) return cnic
  return `${clean.slice(0, 5)}-${clean.slice(5, 12)}-${clean.slice(12)}`
}

export function getCNICGender(cnic: string): 'Male' | 'Female' | null {
  const clean = cnic.replace(/[-\s]/g, '')
  if (clean.length !== 13) return null
  const lastDigit = parseInt(clean[12])
  return lastDigit % 2 === 0 ? 'Female' : 'Male'
}

// Convert to service-listings format for backward compatibility
export function getServicesForListings() {
  return GOVT_SERVICES.map(service => ({
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    icon: service.icon,
    base_price: service.base_price,
    features: service.features,
    required_documents: service.required_documents,
    is_active: service.is_active,
    sort_order: service.sort_order,
    official_url: service.official_url,
    apply_process: service.apply_process,
  }))
}
