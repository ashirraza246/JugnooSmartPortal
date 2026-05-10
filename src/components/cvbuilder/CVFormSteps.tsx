'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import type { CVData, Education, Experience, Reference, Language } from './types'

interface StepProps {
  data: CVData
  onChange: (data: CVData) => void
  labels: Record<string, string>
  isUrdu: boolean
}

export function PersonalInfoStep({ data, onChange, labels, isUrdu }: StepProps) {
  const update = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value },
    })
  }

  return (
    <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-semibold text-slate-700">{labels.fullName}</Label>
            <Input
              value={data.personalInfo.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              placeholder={isUrdu ? 'اپنا پورا نام لکھیں' : 'Enter your full name'}
              className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all"
              dir={isUrdu ? 'rtl' : 'ltr'}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">{labels.email}</Label>
            <Input
              type="email"
              value={data.personalInfo.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="example@email.com"
              className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">{labels.phone}</Label>
            <Input
              value={data.personalInfo.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+92 300 1234567"
              className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">{labels.address}</Label>
            <Input
              value={data.personalInfo.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder={isUrdu ? 'اپنا پتہ لکھیں' : 'Enter your address'}
              className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all"
              dir={isUrdu ? 'rtl' : 'ltr'}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">{labels.city}</Label>
            <Input
              value={data.personalInfo.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder={isUrdu ? 'شہر کا نام' : 'City name'}
              className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all"
              dir={isUrdu ? 'rtl' : 'ltr'}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ObjectiveStep({ data, onChange, labels, isUrdu }: StepProps) {
  return (
    <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">{labels.objective}</Label>
          <Textarea
            value={data.objective}
            onChange={(e) => onChange({ ...data, objective: e.target.value })}
            placeholder={labels.objectivePlaceholder}
            rows={8}
            className="border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all resize-none"
            dir={isUrdu ? 'rtl' : 'ltr'}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function EducationStep({ data, onChange, labels, isUrdu }: StepProps) {
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      year: '',
      grade: '',
    }
    onChange({ ...data, education: [...data.education, newEdu] })
  }

  const removeEducation = (id: string) => {
    if (data.education.length <= 1) return
    onChange({ ...data, education: data.education.filter((e) => e.id !== id) })
  }

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      education: data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    })
  }

  return (
    <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-5">
        {data.education.map((edu, index) => (
          <div
            key={edu.id}
            className="relative p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                {isUrdu ? `تعلیم ${index + 1}` : `Education ${index + 1}`}
              </span>
              {data.education.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(edu.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">{labels.degree}</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  placeholder={isUrdu ? 'بی اے، ایم اے وغیرہ' : 'B.A., M.A., etc.'}
                  className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">{labels.institution}</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  placeholder={isUrdu ? 'یونیورسٹی / کالج کا نام' : 'University / College name'}
                  className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">{labels.year}</Label>
                <Input
                  value={edu.year}
                  onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                  placeholder="2020"
                  className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">{labels.grade}</Label>
                <Input
                  value={edu.grade}
                  onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                  placeholder="A / 3.5 CGPA"
                  className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addEducation}
          className="w-full border-dashed border-[#2980b9]/30 text-[#2980b9] hover:bg-[#2980b9]/5 hover:border-[#2980b9]/50 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          {labels.addEducation}
        </Button>
      </CardContent>
    </Card>
  )
}

export function ExperienceStep({ data, onChange, labels, isUrdu }: StepProps) {
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      duration: '',
      description: '',
    }
    onChange({ ...data, experience: [...data.experience, newExp] })
  }

  const removeExperience = (id: string) => {
    if (data.experience.length <= 1) return
    onChange({ ...data, experience: data.experience.filter((e) => e.id !== id) })
  }

  const updateExperience = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      experience: data.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    })
  }

  return (
    <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-5">
        {data.experience.map((exp, index) => (
          <div
            key={exp.id}
            className="relative p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                {isUrdu ? `تجربہ ${index + 1}` : `Experience ${index + 1}`}
              </span>
              {data.experience.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(exp.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">{labels.company}</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  placeholder={isUrdu ? 'کمپنی کا نام' : 'Company name'}
                  className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">{labels.position}</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                  placeholder={isUrdu ? 'عہدہ' : 'Job title'}
                  className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-medium text-slate-600">{labels.duration}</Label>
                <Input
                  value={exp.duration}
                  onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                  placeholder={labels.durationPlaceholder}
                  className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-medium text-slate-600">{labels.description}</Label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  placeholder={labels.descriptionPlaceholder}
                  rows={4}
                  className="border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 resize-none"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addExperience}
          className="w-full border-dashed border-[#2980b9]/30 text-[#2980b9] hover:bg-[#2980b9]/5 hover:border-[#2980b9]/50 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          {labels.addExperience}
        </Button>
      </CardContent>
    </Card>
  )
}

export function SkillsStep({ data, onChange, labels, isUrdu }: StepProps) {
  const [inputValue, setInputValue] = ''

  const addSkill = (skill: string) => {
    if (skill.trim() && !data.skills.includes(skill.trim())) {
      onChange({ ...data, skills: [...data.skills, skill.trim()] })
    }
  }

  const removeSkill = (skill: string) => {
    onChange({ ...data, skills: data.skills.filter((s) => s !== skill) })
  }

  return (
    <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            {isUrdu ? 'مہارتیں' : 'Skills'}
          </Label>
          <Input
            placeholder={labels.skillPlaceholder}
            className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const val = (e.target as HTMLInputElement).value
                addSkill(val)
                ;(e.target as HTMLInputElement).value = ''
              }
            }}
            dir={isUrdu ? 'rtl' : 'ltr'}
          />
        </div>
        <div className="flex flex-wrap gap-2 min-h-[48px]">
          {data.skills.length === 0 && (
            <p className="text-sm text-slate-400 italic">
              {isUrdu ? 'مہارتیں شامل کرنے کے لیے ٹائپ کریں اور انٹر دبائیں' : 'Type a skill and press Enter to add'}
            </p>
          )}
          {data.skills.map((skill) => (
            <button
              key={skill}
              onClick={() => removeSkill(skill)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-[#003366] to-[#1a5276] text-white shadow-sm hover:shadow-md hover:from-[#1a5276] hover:to-[#2980b9] transition-all duration-200 cursor-pointer group"
            >
              {skill}
              <span className="text-white/60 group-hover:text-white transition-colors">&times;</span>
            </button>
          ))}
        </div>
        {data.skills.length > 0 && (
          <p className="text-xs text-slate-400">
            {isUrdu ? 'ہٹانے کے لیے کلک کریں' : 'Click to remove'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function LanguagesStep({ data, onChange, labels, isUrdu }: StepProps) {
  const addLanguage = (lang: string) => {
    if (lang.trim() && !data.languages.includes(lang.trim())) {
      onChange({ ...data, languages: [...data.languages, lang.trim()] })
    }
  }

  const removeLanguage = (lang: string) => {
    if (data.languages.length <= 1) return
    onChange({ ...data, languages: data.languages.filter((l) => l !== lang) })
  }

  const commonLanguages = isUrdu
    ? ['اردو', 'انگریزی', 'عربی', 'پنجابی', 'سندھی', 'پشتو']
    : ['English', 'Urdu', 'Arabic', 'Punjabi', 'Sindhi', 'Pashto', 'Hindi']

  return (
    <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            {isUrdu ? 'زبانیں' : 'Languages'}
          </Label>
          <Input
            placeholder={labels.languagePlaceholder}
            className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const val = (e.target as HTMLInputElement).value
                addLanguage(val)
                ;(e.target as HTMLInputElement).value = ''
              }
            }}
            dir={isUrdu ? 'rtl' : 'ltr'}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {data.languages.map((lang) => (
            <button
              key={lang}
              onClick={() => removeLanguage(lang)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-[#2980b9] to-[#3498db] text-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              {lang}
              {data.languages.length > 1 && (
                <span className="text-white/60 group-hover:text-white transition-colors">&times;</span>
              )}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-500">
            {isUrdu ? 'جلد شامل کریں:' : 'Quick add:'}
          </Label>
          <div className="flex flex-wrap gap-2">
            {commonLanguages
              .filter((l) => !data.languages.includes(l))
              .map((lang) => (
                <button
                  key={lang}
                  onClick={() => addLanguage(lang)}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-slate-200 text-slate-500 hover:border-[#2980b9] hover:text-[#2980b9] hover:bg-[#2980b9]/5 transition-all duration-200"
                >
                  + {lang}
                </button>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReferencesStep({ data, onChange, labels, isUrdu }: StepProps) {
  const addReference = () => {
    const newRef: Reference = {
      id: Date.now().toString(),
      name: '',
      position: '',
      contact: '',
    }
    onChange({ ...data, references: [...data.references, newRef] })
  }

  const removeReference = (id: string) => {
    if (data.references.length <= 1) return
    onChange({ ...data, references: data.references.filter((r) => r.id !== id) })
  }

  const updateReference = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      references: data.references.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    })
  }

  return (
    <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-5">
        {data.references.map((ref, index) => (
          <div
            key={ref.id}
            className="relative p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                {isUrdu ? `حوالہ ${index + 1}` : `Reference ${index + 1}`}
              </span>
              {data.references.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReference(ref.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">{labels.refName}</Label>
                <Input
                  value={ref.name}
                  onChange={(e) => updateReference(ref.id, 'name', e.target.value)}
                  placeholder={isUrdu ? 'نام' : 'Name'}
                  className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">{labels.refPosition}</Label>
                <Input
                  value={ref.position}
                  onChange={(e) => updateReference(ref.id, 'position', e.target.value)}
                  placeholder={isUrdu ? 'عہدہ / تعلق' : 'Position / Relation'}
                  className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">{labels.refContact}</Label>
                <Input
                  value={ref.contact}
                  onChange={(e) => updateReference(ref.id, 'contact', e.target.value)}
                  placeholder={isUrdu ? 'فون / ای میل' : 'Phone / Email'}
                  className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addReference}
          className="w-full border-dashed border-[#2980b9]/30 text-[#2980b9] hover:bg-[#2980b9]/5 hover:border-[#2980b9]/50 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          {labels.addReference}
        </Button>
      </CardContent>
    </Card>
  )
}
