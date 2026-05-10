export interface ServiceCategory {
  id: string;
  name: string;
  nameUrdu: string;
  icon: string;
  description: string;
  color: string;
  services: Service[];
}

export interface Service {
  id: string;
  name: string;
  nameUrdu: string;
  description: string;
  type: 'loan' | 'registration' | 'certificate' | 'subsidy' | 'application';
  price: number;
  eligibilityCriteria: EligibilityCriteria;
  deadlines?: { from: string; to: string };
  loanTiers?: LoanTier[];
  importantDetails: string[];
  requiredDocuments: string[];
}

export interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  minIncome?: number;
  maxIncome?: number;
  requiredCities?: string[];
  requiredGender?: 'male' | 'female' | 'any';
  requiredEmployment?: string[];
  description: string;
}

export interface LoanTier {
  name: string;
  nameUrdu: string;
  amount: number;
  interestRate: string;
  duration: string;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'ehsaas',
    name: 'Ehsaas Program',
    nameUrdu: 'احساس پروگرام',
    icon: 'Heart',
    description: 'Social welfare and poverty alleviation programs',
    color: '#16a34a',
    services: [
      {
        id: 'ehsaas-kafalat',
        name: 'Ehsaas Kafalat',
        nameUrdu: 'احساس کفالت',
        description: 'Monthly stipend of Rs. 14,000 for poorest women across Pakistan',
        type: 'subsidy',
        price: 500,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 65,
          maxIncome: 30000,
          requiredGender: 'female',
          description: 'Poor women with no government job, monthly income below Rs. 30,000',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Monthly stipend of Rs. 14,000 directly to bank account',
          'Biometric verification required at payment centers',
          'Must have valid CNIC',
          'Survey conducted by NSER team',
        ],
        requiredDocuments: ['CNIC', 'B-Form (if applicable)', 'Utility Bill', 'Bank Account Details'],
      },
      {
        id: 'ehsaas-rashan',
        name: 'Ehsaas Rashan Riayat',
        nameUrdu: 'احساس رعایت',
        description: 'Subsidized ration for low-income families - 30% discount on essential items',
        type: 'subsidy',
        price: 300,
        eligibilityCriteria: {
          minAge: 18,
          maxIncome: 40000,
          requiredGender: 'any',
          description: 'Families with monthly income below Rs. 40,000',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          '30% discount on flour, ghee, sugar, pulses',
          'Available at designated utility stores',
          'One subsidy per household',
          'OTP-based verification at store',
        ],
        requiredDocuments: ['CNIC', 'Registered Mobile Number', 'Utility Bill'],
      },
      {
        id: 'ehsaas-emergency-cash',
        name: 'Ehsaas Emergency Cash',
        nameUrdu: 'احساس ایمرجنسی کیش',
        description: 'One-time emergency cash assistance of Rs. 25,000 for affected families',
        type: 'subsidy',
        price: 400,
        eligibilityCriteria: {
          minAge: 18,
          maxIncome: 35000,
          requiredGender: 'any',
          description: 'Families affected by emergencies, income below Rs. 35,000',
        },
        deadlines: { from: '2025-03-01', to: '2025-09-30' },
        importantDetails: [
          'One-time payment of Rs. 25,000',
          'SMS verification required (send CNIC to 8171)',
          'Biometric verification at payment center',
          'Only one member per family eligible',
        ],
        requiredDocuments: ['CNIC', 'Mobile Number', 'Proof of Emergency (if applicable)'],
      },
    ],
  },
  {
    id: 'bisp',
    name: 'BISP',
    nameUrdu: 'بنیادی آمدنی سپورٹ پروگرام',
    icon: 'HandCoins',
    description: 'Benazir Income Support Program for women empowerment',
    color: '#e11d48',
    services: [
      {
        id: 'bisp-kafalat',
        name: 'BISP Kafalat',
        nameUrdu: 'بسپ کفالت',
        description: 'Quarterly stipend of Rs. 10,500 for eligible women',
        type: 'subsidy',
        price: 500,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 65,
          maxIncome: 30000,
          requiredGender: 'female',
          description: 'Destitute women, widows, or divorced women with income below Rs. 30,000',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Quarterly payment of Rs. 10,500',
          'Payment through Benazir Smart Card or bank account',
          'Dynamic survey required for eligibility',
          'Payments made in January, April, July, October',
        ],
        requiredDocuments: ['CNIC', 'Death Certificate (for widows)', 'Divorce Certificate (if applicable)', 'Bank Account Details'],
      },
      {
        id: 'bisp-taleemi-wazaif',
        name: 'BISP Taleemi Wazaif',
        nameUrdu: 'بسپ تعلیمی وظیفہ',
        description: 'Education stipends for children of BISP beneficiary families',
        type: 'subsidy',
        price: 300,
        eligibilityCriteria: {
          requiredGender: 'any',
          description: 'Children of BISP Kafalat beneficiaries aged 4-22 years',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Primary level: Rs. 1,500/quarter (boys), Rs. 2,000/quarter (girls)',
          'Secondary level: Rs. 2,500/quarter (boys), Rs. 3,000/quarter (girls)',
          'Higher secondary: Rs. 3,500/quarter (boys), Rs. 4,000/quarter (girls)',
          '70% attendance required for continued eligibility',
        ],
        requiredDocuments: ['Child B-Form/CNIC', 'School Enrollment Certificate', 'Mother CNIC', 'Attendance Certificate'],
      },
    ],
  },
  {
    id: 'youth-loans',
    name: 'Youth Programs',
    nameUrdu: 'نوجوان پروگرام',
    icon: 'Rocket',
    description: 'PM Kamyab Jawan - Youth loans and skill development',
    color: '#f59e0b',
    services: [
      {
        id: 'pm-kamyab-jawan',
        name: 'PM Kamyab Jawan Loan',
        nameUrdu: 'وزیراعظم کامیاب نوجوان قرضہ',
        description: 'Business loans for youth entrepreneurs from Rs. 100,000 to Rs. 5,000,000',
        type: 'loan',
        price: 1000,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 45,
          requiredGender: 'any',
          description: 'Pakistani youth aged 18-45 with viable business plan, no default history',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        loanTiers: [
          {
            name: 'Tier 1 - Micro',
            nameUrdu: 'ٹائر 1 - مائیکرو',
            amount: 100000,
            interestRate: '3%',
            duration: '3 Years',
          },
          {
            name: 'Tier 2 - Small',
            nameUrdu: 'ٹائر 2 - چھوٹا',
            amount: 500000,
            interestRate: '5%',
            duration: '5 Years',
          },
          {
            name: 'Tier 3 - Medium',
            nameUrdu: 'ٹائر 3 - درمیانہ',
            amount: 2000000,
            interestRate: '7%',
            duration: '7 Years',
          },
          {
            name: 'Tier 4 - Large',
            nameUrdu: 'ٹائر 4 - بڑا',
            amount: 5000000,
            interestRate: '8%',
            duration: '8 Years',
          },
        ],
        importantDetails: [
          'Tier 1 (Rs. 100K-500K): 3% markup, 3 years',
          'Tier 2 (Rs. 500K-2M): 5% markup, 5 years',
          'Tier 3 (Rs. 2M-5M): 7% markup, 7 years',
          'No collateral for Tier 1 loans',
          'Guarantor required for Tier 2 and above',
        ],
        requiredDocuments: ['CNIC', 'Business Plan', 'Educational Certificates', 'Guarantor CNIC (Tier 2+)', 'Bank Statement'],
      },
      {
        id: 'pm-youth-skill',
        name: 'PM Youth Skill Development',
        nameUrdu: 'وزیراعظم نوجوان ہنر ترقی',
        description: 'Free skill training programs with stipend for youth',
        type: 'application',
        price: 200,
        eligibilityCriteria: {
          minAge: 16,
          maxAge: 35,
          requiredGender: 'any',
          description: 'Pakistani youth aged 16-35, unemployed or underemployed',
        },
        deadlines: { from: '2025-02-01', to: '2025-08-31' },
        importantDetails: [
          'Free 3-6 month training courses',
          'Monthly stipend of Rs. 5,000 during training',
          'Courses in IT, construction, hospitality, etc.',
          'Certificate upon completion',
        ],
        requiredDocuments: ['CNIC', 'Educational Certificates', 'Domicile', 'Photographs'],
      },
    ],
  },
  {
    id: 'housing',
    name: 'Housing Scheme',
    nameUrdu: 'ہاؤسنگ سکیم',
    icon: 'Home',
    description: 'Naya Pakistan Housing Development Authority',
    color: '#0ea5e9',
    services: [
      {
        id: 'naya-pakistan-housing',
        name: 'Naya Pakistan Housing',
        nameUrdu: 'نیا پاکستان ہاؤسنگ',
        description: 'Affordable housing units with easy installments for low-income families',
        type: 'loan',
        price: 1500,
        eligibilityCriteria: {
          minAge: 25,
          maxAge: 55,
          minIncome: 25000,
          maxIncome: 100000,
          requiredGender: 'any',
          description: 'Pakistani citizens aged 25-55, monthly income Rs. 25,000-100,000, no owned house',
        },
        deadlines: { from: '2025-01-01', to: '2025-06-30' },
        loanTiers: [
          {
            name: 'Apartment Unit',
            nameUrdu: 'اپارٹمنٹ یونٹ',
            amount: 2000000,
            interestRate: '5%',
            duration: '20 Years',
          },
          {
            name: 'House 3-Marla',
            nameUrdu: 'گھر 3 مرلہ',
            amount: 3500000,
            interestRate: '5%',
            duration: '20 Years',
          },
          {
            name: 'House 5-Marla',
            nameUrdu: 'گھر 5 مرلہ',
            amount: 5000000,
            interestRate: '5%',
            duration: '20 Years',
          },
        ],
        importantDetails: [
          'Subsidized markup rate of 5%',
          'Monthly installments starting from Rs. 15,000',
          'Housing units in major cities across Pakistan',
          'First come first served basis',
          'Cannot own another house',
        ],
        requiredDocuments: ['CNIC', 'Income Certificate', 'Employment Letter', 'Bank Statements (6 months)', 'Family Registration Certificate'],
      },
    ],
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    nameUrdu: 'زراعت',
    icon: 'Wheat',
    description: 'Agriculture loans and Kissan packages',
    color: '#65a30d',
    services: [
      {
        id: 'ztbl-loan',
        name: 'ZTBL Agriculture Loan',
        nameUrdu: 'زرعی ترقیاتی بینک قرضہ',
        description: 'Agriculture loans from Zarai Taraqiati Bank for farmers',
        type: 'loan',
        price: 800,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 60,
          minIncome: 15000,
          requiredGender: 'any',
          requiredEmployment: ['farmer', 'agriculture'],
          description: 'Active farmers with land ownership or lease, age 18-60',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        loanTiers: [
          {
            name: 'Kharif Crop',
            nameUrdu: 'خریف فصل',
            amount: 200000,
            interestRate: '5.5%',
            duration: '1 Year',
          },
          {
            name: 'Rabi Crop',
            nameUrdu: 'ربی فصل',
            amount: 300000,
            interestRate: '5.5%',
            duration: '1 Year',
          },
          {
            name: 'Farm Mechanization',
            nameUrdu: 'فارم مکینائزیشن',
            amount: 1500000,
            interestRate: '6%',
            duration: '5 Years',
          },
        ],
        importantDetails: [
          'Subsidized markup for small farmers',
          'Loan for seeds, fertilizer, machinery',
          'Land documents required as security',
          'One window operation at ZTBL branches',
        ],
        requiredDocuments: ['CNIC', 'Land Ownership Documents', 'Passbook', 'Agriculture Certificate', 'Guarantor CNIC'],
      },
      {
        id: 'kissan-package',
        name: 'PM Kissan Package',
        nameUrdu: 'وزیراعظم کسان پیکیج',
        description: 'Subsidized fertilizer, seeds, and electricity for farmers',
        type: 'subsidy',
        price: 300,
        eligibilityCriteria: {
          minAge: 18,
          requiredGender: 'any',
          description: 'Registered farmers with land up to 12.5 acres',
        },
        deadlines: { from: '2025-04-01', to: '2025-10-31' },
        importantDetails: [
          'Subsidy of Rs. 1,000 per bag on DAP fertilizer',
          'Free seeds for wheat and cotton',
          'Tubewell electricity at subsidized rates',
          'Registered through Kissan Portal',
        ],
        requiredDocuments: ['CNIC', 'Land Record', 'Kissan Registration', 'Bank Account'],
      },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    nameUrdu: 'صحت',
    icon: 'Stethoscope',
    description: 'Health card and medical assistance programs',
    color: '#dc2626',
    services: [
      {
        id: 'sehat-card',
        name: 'Sehat Card Plus',
        nameUrdu: 'سیٹ کارڈ پلس',
        description: 'Free health insurance coverage up to Rs. 10,00,000 per family per year',
        type: 'application',
        price: 500,
        eligibilityCriteria: {
          minAge: 18,
          maxIncome: 50000,
          requiredGender: 'any',
          description: 'Pakistani families with monthly income below Rs. 50,000',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Coverage up to Rs. 10,00,000 per family per year',
          'Covers hospitalization, surgeries, maternity',
          'Available at empaneled hospitals across Pakistan',
          'No cash payment required at hospital',
          'Covers pre-existing conditions',
        ],
        requiredDocuments: ['CNIC', 'Family Members CNIC/B-Form', 'Income Certificate', 'Utility Bill'],
      },
      {
        id: 'ehsaas-health',
        name: 'Ehsaas Health Program',
        nameUrdu: 'احساس صحت پروگرام',
        description: 'Free medical treatment for chronic diseases for poor families',
        type: 'application',
        price: 400,
        eligibilityCriteria: {
          minAge: 18,
          maxIncome: 35000,
          requiredGender: 'any',
          description: 'Low-income families suffering from chronic diseases',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Free treatment for diabetes, heart disease, cancer',
          'Free medicines at government hospitals',
          'Diagnostic tests covered',
          'Telemedicine consultation available',
        ],
        requiredDocuments: ['CNIC', 'Medical Reports', 'Doctor Referral', 'Income Certificate'],
      },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    nameUrdu: 'تعلیم',
    icon: 'GraduationCap',
    description: 'Scholarships and education support programs',
    color: '#7c3aed',
    services: [
      {
        id: 'peef-scholarship',
        name: 'PEEF Scholarship',
        nameUrdu: 'پنجاب ایجوکیشنل انڈومنٹ فنڈ',
        description: 'Merit and need-based scholarships for talented students',
        type: 'application',
        price: 300,
        eligibilityCriteria: {
          minAge: 16,
          maxAge: 30,
          maxIncome: 40000,
          requiredGender: 'any',
          description: 'Students with minimum 60% marks, family income below Rs. 40,000',
        },
        deadlines: { from: '2025-08-01', to: '2025-11-30' },
        importantDetails: [
          'Intermediate level: Rs. 3,000/month',
          'Graduation level: Rs. 5,000/month',
          'Post-graduation level: Rs. 7,000/month',
          'Must maintain 2.5 CGPA for renewal',
        ],
        requiredDocuments: ['CNIC/B-Form', 'Previous Result Card', 'Income Certificate', 'Domicile', 'Admission Letter'],
      },
      {
        id: 'hec-scholarship',
        name: 'HEC Need-Based Scholarship',
        nameUrdu: 'ایچ ای سی ضرورت پر مبنی اسکالرشپ',
        description: 'Full tuition and living expenses for deserving university students',
        type: 'application',
        price: 400,
        eligibilityCriteria: {
          minAge: 17,
          maxAge: 28,
          maxIncome: 45000,
          requiredGender: 'any',
          description: 'University students with financial need, enrolled in HEC recognized institutions',
        },
        deadlines: { from: '2025-09-01', to: '2025-12-31' },
        importantDetails: [
          'Covers full tuition fee',
          'Living allowance of Rs. 8,000/month',
          'Book allowance included',
          'Available at all HEC recognized universities',
        ],
        requiredDocuments: ['CNIC', 'University Admission Letter', 'Income Certificate', 'Previous Academic Records', 'Domicile'],
      },
    ],
  },
  {
    id: 'women-empowerment',
    name: 'Women Empowerment',
    nameUrdu: 'خواتین بااختیار بنانا',
    icon: 'Sparkles',
    description: 'Business loans and skill training for women',
    color: '#ec4899',
    services: [
      {
        id: 'women-business-loan',
        name: 'Women Business Loan',
        nameUrdu: 'خواتین کاروباری قرضہ',
        description: 'Interest-free business loans for women entrepreneurs',
        type: 'loan',
        price: 600,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 55,
          requiredGender: 'female',
          description: 'Women entrepreneurs with viable business plan, age 18-55',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        loanTiers: [
          {
            name: 'Micro Enterprise',
            nameUrdu: 'مائیکرو انٹرپرائز',
            amount: 100000,
            interestRate: '0%',
            duration: '3 Years',
          },
          {
            name: 'Small Business',
            nameUrdu: 'چھوٹا کاروبار',
            amount: 500000,
            interestRate: '0%',
            duration: '5 Years',
          },
          {
            name: 'Growth Capital',
            nameUrdu: 'ترقیاتی سرمایہ',
            amount: 1000000,
            interestRate: '3%',
            duration: '5 Years',
          },
        ],
        importantDetails: [
          'Interest-free loans up to Rs. 500,000',
          'No collateral required for loans up to Rs. 100,000',
          'Business training included',
          'Priority to rural and underserved areas',
        ],
        requiredDocuments: ['CNIC', 'Business Plan', 'Guarantor CNIC', 'Utility Bill', 'Photographs'],
      },
      {
        id: 'women-skill-training',
        name: 'Women Skills Training',
        nameUrdu: 'خواتین ہنر کی تربیت',
        description: 'Free skills training in stitching, embroidery, IT, and more',
        type: 'application',
        price: 200,
        eligibilityCriteria: {
          minAge: 16,
          maxAge: 50,
          requiredGender: 'female',
          description: 'Women aged 16-50 seeking skill development',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Free 3-6 month training',
          'Stipend of Rs. 3,000/month during training',
          'Training in stitching, embroidery, IT, beauty',
          'Certificate upon completion',
          'Job placement assistance',
        ],
        requiredDocuments: ['CNIC', 'Photographs', 'Educational Certificate (if any)'],
      },
    ],
  },
  {
    id: 'utility',
    name: 'Utility Bills',
    nameUrdu: 'یوٹیلیٹی بلز',
    icon: 'Zap',
    description: 'WAPDA, Sui Gas registration and bill management',
    color: '#f97316',
    services: [
      {
        id: 'wapda-connection',
        name: 'WAPDA New Connection',
        nameUrdu: 'واپڈا نیا کنکشن',
        description: 'Apply for new electricity connection',
        type: 'registration',
        price: 500,
        eligibilityCriteria: {
          minAge: 18,
          requiredGender: 'any',
          description: 'Pakistani citizens with valid property/rent agreement',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Application processed within 30 days',
          'Connection fee varies by load',
          'Single phase: Rs. 15,000-25,000',
          'Three phase: Rs. 50,000-100,000',
        ],
        requiredDocuments: ['CNIC', 'Property Papers / Rent Agreement', 'Map of Location', 'Neighbour NOC', 'Paid Application Fee Receipt'],
      },
      {
        id: 'sui-gas-connection',
        name: 'Sui Gas New Connection',
        nameUrdu: 'سوئی گیس نیا کنکشن',
        description: 'Apply for new natural gas connection',
        type: 'registration',
        price: 600,
        eligibilityCriteria: {
          minAge: 18,
          requiredGender: 'any',
          description: 'Pakistani citizens in areas with gas infrastructure',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Domestic connection fee: Rs. 6,000-15,000',
          'Connection within 60 days of approval',
          'Gas availability subject to area infrastructure',
          'Demand notice must be paid within 15 days',
        ],
        requiredDocuments: ['CNIC', 'Property Papers', 'Location Map', 'Neighbour Affidavit', 'Application Form'],
      },
    ],
  },
  {
    id: 'nadra',
    name: 'CNIC / NADRA',
    nameUrdu: 'شناختی کارڈ / نادرا',
    icon: 'CreditCard',
    description: 'CNIC issuance, renewal, and B-Form services',
    color: '#6366f1',
    services: [
      {
        id: 'new-cnic',
        name: 'New CNIC',
        nameUrdu: 'نیا شناختی کارڈ',
        description: 'Apply for new Computerized National Identity Card',
        type: 'certificate',
        price: 400,
        eligibilityCriteria: {
          minAge: 18,
          requiredGender: 'any',
          description: 'Pakistani citizens aged 18 and above',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Normal delivery: 30 days (Rs. 400)',
          'Urgent delivery: 15 days (Rs. 800)',
          'Executive: 5 days (Rs. 1,600)',
          'Must apply in person at NADRA center',
        ],
        requiredDocuments: ['Birth Certificate / B-Form', 'Parent CNIC', 'Domicile', 'Photographs'],
      },
      {
        id: 'cnic-renewal',
        name: 'CNIC Renewal',
        nameUrdu: 'شناختی کارڈ تجدید',
        description: 'Renew expired or expiring CNIC',
        type: 'certificate',
        price: 400,
        eligibilityCriteria: {
          minAge: 18,
          requiredGender: 'any',
          description: 'Pakistani citizens with expired or expiring CNIC',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Renew before expiry to avoid late fee',
          'Late fee of Rs. 1,000 after 1 year of expiry',
          'Same fee structure as new CNIC',
          'Update biometrics during renewal',
        ],
        requiredDocuments: ['Old CNIC', 'Updated Documents (if any change)', 'Photographs'],
      },
      {
        id: 'b-form',
        name: 'B-Form (Child Registration)',
        nameUrdu: 'بی-فارم (بچے کی رجسٹریشن)',
        description: 'Register children under 18 for B-Form / CRC',
        type: 'certificate',
        price: 200,
        eligibilityCriteria: {
          requiredGender: 'any',
          description: 'Children under 18 years of Pakistani parents',
        },
        deadlines: { from: '2025-01-01', to: '2025-12-31' },
        importantDetails: [
          'Must be registered within 6 months of birth',
          'Free if registered within 6 months',
          'Late registration fee applies after 6 months',
          'Required for school admission',
        ],
        requiredDocuments: ['Birth Certificate (Hospital)', 'Parent CNIC', 'Marriage Certificate', 'Vaccination Card'],
      },
    ],
  },
];

export const pakistaniCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Abbottabad',
  'Mardan', 'Mingora', 'Dera Ghazi Khan', 'Sahiwal', 'Larkana',
  'Muzaffarabad', 'Mirpur', 'Gilgit', 'Skardu', 'Chitral',
  'Kohat', 'Bannu', 'Dera Ismail Khan', 'Jhang', 'Kasur',
  'Okara', 'Vehari', 'Khanewal', 'Toba Tek Singh', 'Hafizabad',
  'Mandi Bahauddin', 'Narowal', 'Nankana Sahib', 'Sheikhupura', 'Rahim Yar Khan',
];

export const cvTemplates = [
  {
    id: 'driver',
    title: 'Driver / ڈرائیور',
    titleUrdu: 'ڈرائیور',
    skills: ['Car Driving', 'Truck Driving', 'Route Knowledge', 'Vehicle Maintenance', 'License Holder'],
    description: 'Professional driver with experience in city and long route driving',
  },
  {
    id: 'cook',
    title: 'Cook / باورچی',
    titleUrdu: 'باورچی',
    skills: ['Pakistani Cuisine', 'Biryani', 'BBQ', 'Kitchen Management', 'Food Safety'],
    description: 'Experienced cook specializing in Pakistani traditional food',
  },
  {
    id: 'security-guard',
    title: 'Security Guard / سیکیورٹی گارڈ',
    titleUrdu: 'سیکیورٹی گارڈ',
    skills: ['Night Patrol', 'CCTV Monitoring', 'Access Control', 'Emergency Response', 'Physical Fitness'],
    description: 'Reliable security guard for residential and commercial buildings',
  },
  {
    id: 'laborer',
    title: 'Laborer / مزدور',
    titleUrdu: 'مزدور',
    skills: ['Construction', 'Loading/Unloading', 'Brick Laying', 'Plastering', 'General Labor'],
    description: 'Hardworking laborer for construction and general work',
  },
  {
    id: 'electrician',
    title: 'Electrician / الیکٹریشن',
    titleUrdu: 'الیکٹریشن',
    skills: ['Wiring', 'AC Installation', 'Generator Repair', 'Electrical Safety', 'Appliance Repair'],
    description: 'Skilled electrician for residential and commercial electrical work',
  },
  {
    id: 'plumber',
    title: 'Plumber / پلمبر',
    titleUrdu: 'پلمبر',
    skills: ['Pipe Fitting', 'Water Tank Installation', 'Drainage', 'Bathroom Fitting', 'Gas Line'],
    description: 'Experienced plumber for all water and gas fitting work',
  },
];
