export type Language = 'en' | 'ur'

export type TemplateStyle = 'professional' | 'modern' | 'creative'

export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
}

export interface Education {
  id: string
  degree: string
  institution: string
  year: string
  grade: string
}

export interface Experience {
  id: string
  company: string
  position: string
  duration: string
  description: string
}

export interface Reference {
  id: string
  name: string
  position: string
  contact: string
}

export interface CVData {
  personalInfo: PersonalInfo
  objective: string
  education: Education[]
  experience: Experience[]
  skills: string[]
  languages: string[]
  references: Reference[]
}

export const defaultCVData: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  },
  objective: '',
  education: [{ id: '1', degree: '', institution: '', year: '', grade: '' }],
  experience: [{ id: '1', company: '', position: '', duration: '', description: '' }],
  skills: [],
  languages: ['English'],
  references: [{ id: '1', name: '', position: '', contact: '' }],
}

export const translations = {
  en: {
    title: 'CV Builder',
    subtitle: 'Create Professional Resumes with AI',
    steps: {
      personal: 'Personal Info',
      objective: 'Objective',
      education: 'Education',
      experience: 'Experience',
      skills: 'Skills',
      languages: 'Languages',
      references: 'References',
      preview: 'Preview & Export',
    },
    form: {
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Address',
      city: 'City',
      objective: 'Career Objective / Summary',
      objectivePlaceholder: 'Write a brief career objective or professional summary...',
      degree: 'Degree / Certificate',
      institution: 'Institution / University',
      year: 'Year',
      grade: 'Grade / CGPA',
      company: 'Company / Organization',
      position: 'Position / Job Title',
      duration: 'Duration',
      durationPlaceholder: 'e.g., Jan 2020 - Dec 2022',
      description: 'Job Description',
      descriptionPlaceholder: 'Describe your responsibilities and achievements...',
      skillPlaceholder: 'Type a skill and press Enter',
      languagePlaceholder: 'Type a language and press Enter',
      refName: 'Reference Name',
      refPosition: 'Position / Relation',
      refContact: 'Contact Info',
      addEducation: 'Add Education',
      addExperience: 'Add Experience',
      addReference: 'Add Reference',
      remove: 'Remove',
    },
    preview: {
      careerObjective: 'Career Objective',
      education: 'Education',
      experience: 'Experience',
      skills: 'Skills',
      languages: 'Languages',
      references: 'References',
    },
    actions: {
      next: 'Next',
      previous: 'Previous',
      generateAI: '✨ Generate with AI',
      improveAI: '✨ Improve with AI',
      exportPDF: '📄 Export PDF',
      changeTemplate: 'Change Template',
    },
    templates: {
      professional: 'Professional',
      modern: 'Modern',
      creative: 'Creative',
    },
    ai: {
      generating: 'AI is crafting your CV...',
      improving: 'AI is enhancing your content...',
      success: 'Content generated successfully!',
      error: 'Failed to generate content. Please try again.',
      promptTitle: 'AI CV Generator',
      promptDescription: 'Describe the type of CV you want to create',
      promptPlaceholder: 'e.g., A software developer with 5 years experience in web development...',
      generate: 'Generate CV',
    },
    langSwitch: 'اردو',
  },
  ur: {
    title: 'سی وی بنانا',
    subtitle: 'AI کے ساتھ پروفیشنل ریزیومے بنائیں',
    steps: {
      personal: 'ذاتی معلومات',
      objective: 'مقصد',
      education: 'تعلیم',
      experience: 'تجربہ',
      skills: 'مہارتیں',
      languages: 'زبانیں',
      references: 'حوالہ جات',
      preview: 'پیش منظر اور ایکسپورٹ',
    },
    form: {
      fullName: 'پورا نام',
      email: 'ای میل',
      phone: 'فون نمبر',
      address: 'پتہ',
      city: 'شہر',
      objective: 'کیریئر کا مقصد / خلاصہ',
      objectivePlaceholder: 'مختصر کیریئر مقصد یا پروفیشنل خلاصہ لکھیں...',
      degree: 'ڈگری / سرٹیفکیٹ',
      institution: 'ادارہ / یونیورسٹی',
      year: 'سال',
      grade: 'گریڈ / CGPA',
      company: 'کمپنی / تنظیم',
      position: 'عہدہ / ملازمت',
      duration: 'مدت',
      durationPlaceholder: 'مثلاً: جنوری 2020 - دسمبر 2022',
      description: 'ملازمت کی تفصیل',
      descriptionPlaceholder: 'اپنی ذمہ داریوں اور کامیابیوں کی وضاحت کریں...',
      skillPlaceholder: 'مہارت لکھیں اور انٹر دبائیں',
      languagePlaceholder: 'زبان لکھیں اور انٹر دبائیں',
      refName: 'حوالہ کا نام',
      refPosition: 'عہدہ / تعلق',
      refContact: 'رابطہ معلومات',
      addEducation: 'تعلیم شامل کریں',
      addExperience: 'تجربہ شامل کریں',
      addReference: 'حوالہ شامل کریں',
      remove: 'ہٹائیں',
    },
    preview: {
      careerObjective: 'کیریئر کا مقصد',
      education: 'تعلیم',
      experience: 'تجربہ',
      skills: 'مہارتیں',
      languages: 'زبانیں',
      references: 'حوالہ جات',
    },
    actions: {
      next: 'اگلا',
      previous: 'پچھلا',
      generateAI: '✨ AI سے بنائیں',
      improveAI: '✨ AI سے بہتر کریں',
      exportPDF: '📄 PDF ایکسپورٹ',
      changeTemplate: 'ٹیمپلیٹ تبدیل کریں',
    },
    templates: {
      professional: 'پروفیشنل',
      modern: 'ماڈرن',
      creative: 'تخلیقی',
    },
    ai: {
      generating: 'AI آپ کا سی وی تیار کر رہا ہے...',
      improving: 'AI آپ کے مواد کو بہتر بنا رہا ہے...',
      success: 'مواد کامیابی سے تیار ہو گیا!',
      error: 'مواد تیار کرنے میں ناکام۔ دوبارہ کوشش کریں۔',
      promptTitle: 'AI سی وی جنریٹر',
      promptDescription: 'سی وی کی قسم کی وضاحت کریں جو آپ بنانا چاہتے ہیں',
      promptPlaceholder: 'مثلاً: 5 سال کے تجربے کے ساتھ سافٹ ویئر ڈویلپر...',
      generate: 'سی وی بنائیں',
    },
    langSwitch: 'English',
  },
}

export const WIZARD_STEPS = [
  'personal',
  'objective',
  'education',
  'experience',
  'skills',
  'languages',
  'references',
  'preview',
] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]
