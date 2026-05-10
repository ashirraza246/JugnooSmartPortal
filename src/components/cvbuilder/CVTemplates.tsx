'use client'

import type { CVData, TemplateStyle, Language } from './types'
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Star, Globe, Users } from 'lucide-react'

interface TemplateProps {
  data: CVData
  lang: Language
  labels: Record<string, string>
}

function SectionTitle({ children, style }: { children: React.ReactNode; style: TemplateStyle }) {
  if (style === 'professional') {
    return (
      <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#003366] border-b-2 border-[#003366] pb-1.5 mb-3">
        {children}
      </h3>
    )
  }
  if (style === 'modern') {
    return (
      <h3 className="text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#1a5276] to-[#2980b9] px-3 py-1.5 rounded-md mb-3 inline-block">
        {children}
      </h3>
    )
  }
  return (
    <h3 className="text-sm font-bold uppercase tracking-wider text-[#2980b9] mb-3 flex items-center gap-2">
      <span className="w-6 h-0.5 bg-gradient-to-r from-[#3498db] to-transparent" />
      {children}
      <span className="flex-1 h-0.5 bg-gradient-to-r from-[#3498db]/30 to-transparent" />
    </h3>
  )
}

function ProfessionalTemplate({ data, labels }: TemplateProps) {
  const hasContent = (arr: unknown[]) => arr.length > 0
  const isUrdu = false

  return (
    <div className="bg-white text-slate-800 font-serif" style={{ fontSize: '11px', lineHeight: '1.5' }}>
      {/* Header */}
      <div className="bg-[#003366] text-white px-8 py-7">
        <h1 className="text-2xl font-bold tracking-wide mb-2">
          {data.personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-blue-200 text-xs">
          {data.personalInfo.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              {data.personalInfo.email}
            </span>
          )}
          {data.personalInfo.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              {data.personalInfo.phone}
            </span>
          )}
          {(data.personalInfo.address || data.personalInfo.city) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {[data.personalInfo.address, data.personalInfo.city].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Objective */}
        {data.objective && (
          <div>
            <SectionTitle style="professional">{labels.careerObjective}</SectionTitle>
            <p className="text-slate-600 leading-relaxed">{data.objective}</p>
          </div>
        )}

        {/* Education */}
        {hasContent(data.education) && data.education.some((e) => e.degree || e.institution) && (
          <div>
            <SectionTitle style="professional">{labels.education}</SectionTitle>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#1a5276]">{edu.degree}</p>
                    <p className="text-slate-500">{edu.institution}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-slate-500">{edu.year}</p>
                    {edu.grade && <p className="text-[#2980b9] font-medium">{edu.grade}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {hasContent(data.experience) && data.experience.some((e) => e.company || e.position) && (
          <div>
            <SectionTitle style="professional">{labels.experience}</SectionTitle>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-[#1a5276]">{exp.position}</p>
                      <p className="text-slate-500">{exp.company}</p>
                    </div>
                    <p className="text-slate-500 shrink-0 ml-4">{exp.duration}</p>
                  </div>
                  {exp.description && (
                    <p className="text-slate-600 mt-1.5 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <SectionTitle style="professional">{labels.skills}</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 bg-[#003366]/5 text-[#003366] rounded text-xs font-medium border border-[#003366]/10"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div>
            <SectionTitle style="professional">{labels.languages}</SectionTitle>
            <div className="flex flex-wrap gap-3">
              {data.languages.map((lang) => (
                <span key={lang} className="text-slate-600">
                  • {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {hasContent(data.references) && data.references.some((r) => r.name) && (
          <div>
            <SectionTitle style="professional">{labels.references}</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {data.references
                .filter((r) => r.name)
                .map((ref) => (
                  <div key={ref.id}>
                    <p className="font-semibold text-[#1a5276]">{ref.name}</p>
                    <p className="text-slate-500 text-xs">{ref.position}</p>
                    <p className="text-slate-400 text-xs">{ref.contact}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ModernTemplate({ data, labels }: TemplateProps) {
  const hasContent = (arr: unknown[]) => arr.length > 0

  return (
    <div className="bg-white text-slate-800 font-sans" style={{ fontSize: '11px', lineHeight: '1.5' }}>
      <div className="flex min-h-full">
        {/* Sidebar */}
        <div className="w-[38%] bg-gradient-to-b from-[#003366] via-[#1a5276] to-[#1a5276] text-white px-5 py-7 space-y-6">
          {/* Avatar & Name */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-white/10 mx-auto mb-3 flex items-center justify-center border-2 border-white/20">
              <span className="text-2xl font-bold">
                {data.personalInfo.fullName
                  ? data.personalInfo.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'YN'}
              </span>
            </div>
            <h1 className="text-lg font-bold leading-tight">
              {data.personalInfo.fullName || 'Your Name'}
            </h1>
          </div>

          {/* Contact */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">Contact</h4>
            {data.personalInfo.email && (
              <p className="flex items-start gap-2 text-blue-100">
                <Mail className="w-3 h-3 mt-0.5 shrink-0" />
                <span className="break-all">{data.personalInfo.email}</span>
              </p>
            )}
            {data.personalInfo.phone && (
              <p className="flex items-start gap-2 text-blue-100">
                <Phone className="w-3 h-3 mt-0.5 shrink-0" />
                {data.personalInfo.phone}
              </p>
            )}
            {(data.personalInfo.address || data.personalInfo.city) && (
              <p className="flex items-start gap-2 text-blue-100">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                {[data.personalInfo.address, data.personalInfo.city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          {/* Skills */}
          {data.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">{labels.skills}</h4>
              <div className="space-y-1.5">
                {data.skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3498db]" />
                    <span className="text-blue-100 text-xs">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">{labels.languages}</h4>
              <div className="space-y-1.5">
                {data.languages.map((lang) => (
                  <div key={lang} className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-[#3498db]" />
                    <span className="text-blue-100 text-xs">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {hasContent(data.references) && data.references.some((r) => r.name) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">{labels.references}</h4>
              <div className="space-y-2">
                {data.references
                  .filter((r) => r.name)
                  .map((ref) => (
                    <div key={ref.id} className="text-xs">
                      <p className="text-white font-medium">{ref.name}</p>
                      <p className="text-blue-200">{ref.position}</p>
                      <p className="text-blue-300">{ref.contact}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 px-7 py-7 space-y-6">
          {/* Objective */}
          {data.objective && (
            <div>
              <SectionTitle style="modern">{labels.careerObjective}</SectionTitle>
              <p className="text-slate-600 leading-relaxed mt-2">{data.objective}</p>
            </div>
          )}

          {/* Experience */}
          {hasContent(data.experience) && data.experience.some((e) => e.company || e.position) && (
            <div>
              <SectionTitle style="modern">{labels.experience}</SectionTitle>
              <div className="space-y-4 mt-2">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l-2 border-[#2980b9]/30">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[#2980b9]" />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-[#003366]">{exp.position}</p>
                        <p className="text-[#2980b9] text-xs font-medium">{exp.company}</p>
                      </div>
                      <span className="text-slate-400 text-xs shrink-0 ml-4">{exp.duration}</span>
                    </div>
                    {exp.description && (
                      <p className="text-slate-600 mt-1.5 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {hasContent(data.education) && data.education.some((e) => e.degree || e.institution) && (
            <div>
              <SectionTitle style="modern">{labels.education}</SectionTitle>
              <div className="space-y-3 mt-2">
                {data.education.map((edu) => (
                  <div key={edu.id} className="relative pl-4 border-l-2 border-[#2980b9]/30">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[#3498db]" />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-[#003366]">{edu.degree}</p>
                        <p className="text-slate-500 text-xs">{edu.institution}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-slate-400 text-xs">{edu.year}</p>
                        {edu.grade && (
                          <p className="text-[#2980b9] text-xs font-medium">{edu.grade}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CreativeTemplate({ data, labels }: TemplateProps) {
  const hasContent = (arr: unknown[]) => arr.length > 0

  return (
    <div className="bg-white text-slate-800 font-sans" style={{ fontSize: '11px', lineHeight: '1.5' }}>
      {/* Header */}
      <div className="relative overflow-hidden px-8 py-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2980b9] via-[#1a5276] to-[#003366]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
        }} />
        <div className="relative text-white">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            {data.personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="h-0.5 w-16 bg-[#3498db] mb-3" />
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-blue-100 text-xs">
            {data.personalInfo.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {data.personalInfo.email}
              </span>
            )}
            {data.personalInfo.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {data.personalInfo.phone}
              </span>
            )}
            {(data.personalInfo.address || data.personalInfo.city) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />{' '}
                {[data.personalInfo.address, data.personalInfo.city].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Objective */}
        {data.objective && (
          <div>
            <SectionTitle style="creative">{labels.careerObjective}</SectionTitle>
            <p className="text-slate-600 leading-relaxed bg-gradient-to-r from-blue-50 to-transparent pl-3 py-2 rounded-l-md border-l-2 border-[#3498db]">
              {data.objective}
            </p>
          </div>
        )}

        {/* Experience */}
        {hasContent(data.experience) && data.experience.some((e) => e.company || e.position) && (
          <div>
            <SectionTitle style="creative">
              <Briefcase className="w-3.5 h-3.5" /> {labels.experience}
            </SectionTitle>
            <div className="space-y-3">
              {data.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-gradient-to-r from-slate-50 to-blue-50/30 p-3 rounded-lg border border-slate-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#003366]">{exp.position}</p>
                      <p className="text-[#2980b9] text-xs font-medium">{exp.company}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-[#2980b9]/10 text-[#2980b9] rounded text-xs font-medium shrink-0 ml-4">
                      {exp.duration}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-slate-600 mt-1.5 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {hasContent(data.education) && data.education.some((e) => e.degree || e.institution) && (
          <div>
            <SectionTitle style="creative">
              <GraduationCap className="w-3.5 h-3.5" /> {labels.education}
            </SectionTitle>
            <div className="space-y-2">
              {data.education.map((edu) => (
                <div
                  key={edu.id}
                  className="flex justify-between items-start bg-gradient-to-r from-slate-50 to-blue-50/30 p-3 rounded-lg border border-slate-100"
                >
                  <div>
                    <p className="font-bold text-[#003366]">{edu.degree}</p>
                    <p className="text-slate-500 text-xs">{edu.institution}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-slate-400 text-xs">{edu.year}</p>
                    {edu.grade && (
                      <span className="inline-block px-2 py-0.5 bg-[#3498db]/10 text-[#3498db] rounded text-xs font-medium mt-0.5">
                        {edu.grade}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <SectionTitle style="creative">
              <Star className="w-3.5 h-3.5" /> {labels.skills}
            </SectionTitle>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gradient-to-r from-[#003366] to-[#1a5276] text-white rounded-full text-xs font-medium shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div>
            <SectionTitle style="creative">
              <Globe className="w-3.5 h-3.5" /> {labels.languages}
            </SectionTitle>
            <div className="flex flex-wrap gap-3">
              {data.languages.map((lang) => (
                <div key={lang} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#2980b9] to-[#3498db]" />
                  <span className="text-slate-600 text-xs font-medium">{lang}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {hasContent(data.references) && data.references.some((r) => r.name) && (
          <div>
            <SectionTitle style="creative">
              <Users className="w-3.5 h-3.5" /> {labels.references}
            </SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {data.references
                .filter((r) => r.name)
                .map((ref) => (
                  <div
                    key={ref.id}
                    className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-100"
                  >
                    <p className="font-bold text-[#003366]">{ref.name}</p>
                    <p className="text-slate-500 text-xs">{ref.position}</p>
                    <p className="text-[#2980b9] text-xs">{ref.contact}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function CVTemplateRenderer({
  data,
  template,
  lang,
  labels,
}: {
  data: CVData
  template: TemplateStyle
  lang: Language
  labels: Record<string, string>
}) {
  const props: TemplateProps = { data, lang, labels }

  switch (template) {
    case 'modern':
      return <ModernTemplate {...props} />
    case 'creative':
      return <CreativeTemplate {...props} />
    case 'professional':
    default:
      return <ProfessionalTemplate {...props} />
  }
}
