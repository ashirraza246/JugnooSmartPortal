'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, GraduationCap, Briefcase, Languages, FileText,
  Printer, Download, ArrowLeft, ArrowRight, Check,
  HelpCircle, Plus, X, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { cvTemplates, pakistaniCities } from '@/lib/data';
import { toast } from 'sonner';

const CV_STEPS = [
  { id: 1, label: 'Template / ٹیمپلیٹ', icon: Sparkles },
  { id: 2, label: 'Personal / ذاتی', icon: User },
  { id: 3, label: 'Education / تعلیم', icon: GraduationCap },
  { id: 4, label: 'Skills / ہنر', icon: Briefcase },
  { id: 5, label: 'Experience / تجربہ', icon: FileText },
  { id: 6, label: 'Languages / زبانیں', icon: Languages },
  { id: 7, label: 'Preview / جائزہ', icon: Printer },
];

export default function CVBuilder() {
  const cvData = useAppStore((s) => s.cvData);
  const updateCVData = useAppStore((s) => s.updateCVData);
  const resetCVData = useAppStore((s) => s.resetCVData);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [currentStep, setCurrentStep] = useState(1);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const progressPercent = (currentStep / CV_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < CV_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      updateCVData({ skills: [...cvData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    updateCVData({ skills: cvData.skills.filter((_, i) => i !== index) });
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      updateCVData({ languages: [...cvData.languages, newLanguage.trim()] });
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    updateCVData({ languages: cvData.languages.filter((_, i) => i !== index) });
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>CV - ${cvData.fullName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; color: #003366; }
                h1 { color: #003366; border-bottom: 3px solid #2980b9; padding-bottom: 10px; }
                h2 { color: #003366; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 25px; }
                .info { display: flex; gap: 20px; margin-bottom: 5px; }
                .label { font-weight: bold; color: #2980b9; }
                .skills { display: flex; flex-wrap: wrap; gap: 8px; }
                .skill { background: #e8f0fe; padding: 4px 12px; border-radius: 12px; font-size: 14px; }
                .languages { display: flex; gap: 15px; }
                .lang { background: #f0f9ff; padding: 4px 12px; border-radius: 8px; }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
    toast.success('CV print ho rahi hai / CV is being printed');
  };

  const handleDownload = () => {
    const cvText = `
═══════════════════════════════════════════
              CURRICULUM VITAE
═══════════════════════════════════════════

NAME: ${cvData.fullName}
FATHER'S NAME: ${cvData.fatherName}
CNIC: ${cvData.cnic}
PHONE: ${cvData.phone}
ADDRESS: ${cvData.address}, ${cvData.city}
AGE: ${cvData.age}
GENDER: ${cvData.gender}

─────────────────────────────────────────────
EDUCATION / تعلیم
─────────────────────────────────────────────
${cvData.education || 'No formal education / کویی رسمی تعلیم نہیں'}

─────────────────────────────────────────────
SKILLS / ہنر
─────────────────────────────────────────────
${cvData.skills.join(', ') || 'No skills listed'}

─────────────────────────────────────────────
WORK EXPERIENCE / کام کا تجربہ
─────────────────────────────────────────────
${cvData.workExperience || 'No experience listed'}

─────────────────────────────────────────────
LANGUAGES / زبانیں
─────────────────────────────────────────────
${cvData.languages.join(', ')}

═══════════════════════════════════════════
Generated by Jugnoo Smart Portal
═══════════════════════════════════════════
`.trim();

    const blob = new Blob([cvText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${cvData.fullName.replace(/\s+/g, '_') || 'My'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CV download ho gayi / CV downloaded');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-lg text-gray-600">Pehle ek template chunein / First select a template</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cvTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      cvData.template === template.id
                        ? 'border-[#003366] bg-blue-50'
                        : 'border-gray-100 hover:border-[#2980b9]/30'
                    }`}
                    onClick={() => {
                      updateCVData({
                        template: template.id,
                        skills: template.skills,
                      });
                      toast.success(`${template.title} template select ho gaya / Template selected`);
                    }}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-bold text-[#003366] text-lg">{template.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {template.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                        {template.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{template.skills.length - 3} more</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Full Name / پورا نام *</Label>
                <Input
                  value={cvData.fullName}
                  onChange={(e) => updateCVData({ fullName: e.target.value })}
                  className="h-12 text-lg"
                  placeholder="Apna naam likhein"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Father&apos;s Name / والد کا نام</Label>
                <Input
                  value={cvData.fatherName}
                  onChange={(e) => updateCVData({ fatherName: e.target.value })}
                  className="h-12 text-lg"
                  placeholder="Abu ka naam"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">CNIC / شناختی کارڈ</Label>
                <Input
                  value={cvData.cnic}
                  onChange={(e) => updateCVData({ cnic: e.target.value })}
                  className="h-12 text-lg"
                  placeholder="XXXXX-XXXXXXX-X"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Phone / فون نمبر</Label>
                <Input
                  value={cvData.phone}
                  onChange={(e) => updateCVData({ phone: e.target.value })}
                  className="h-12 text-lg"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Age / عمر</Label>
                <Input
                  value={cvData.age}
                  onChange={(e) => updateCVData({ age: e.target.value })}
                  className="h-12 text-lg"
                  placeholder="Umar likhein"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Gender / جنس</Label>
                <Select value={cvData.gender} onValueChange={(v) => updateCVData({ gender: v })}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Chunein" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male / مرد</SelectItem>
                    <SelectItem value="female">Female / عورت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-base font-medium">Address / پتہ</Label>
                <Input
                  value={cvData.address}
                  onChange={(e) => updateCVData({ address: e.target.value })}
                  className="h-12 text-lg"
                  placeholder="Mukammal pata likhein"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">City / شہر</Label>
                <Select value={cvData.city} onValueChange={(v) => updateCVData({ city: v })}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Shehar chunein" />
                  </SelectTrigger>
                  <SelectContent>
                    {pakistaniCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Agar aapne koi formal education nahi li to &quot;No formal education&quot; likh dein / If you have no formal education, write &quot;No formal education&quot;
              </p>
            </div>
            <div className="space-y-3">
              <Label className="text-base font-medium">Education / تعلیم</Label>
              <Select value={cvData.education} onValueChange={(v) => updateCVData({ education: v })}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Taleem ka level chunein" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No formal education">No formal education / کویی رسمی تعلیم نہیں</SelectItem>
                  <SelectItem value="Primary (1-5)">Primary / پرائمری (1-5)</SelectItem>
                  <SelectItem value="Middle (6-8)">Middle / مڈل (6-8)</SelectItem>
                  <SelectItem value="Matric (9-10)">Matric / میٹرک (9-10)</SelectItem>
                  <SelectItem value="Intermediate (11-12)">Intermediate / انٹر (11-12)</SelectItem>
                  <SelectItem value="Bachelor's Degree">Bachelor&apos;s / بی اے</SelectItem>
                  <SelectItem value="Master's Degree">Master&apos;s / ایم اے</SelectItem>
                  <SelectItem value="Diploma">Diploma / ڈپلوما</SelectItem>
                  <SelectItem value="Hafiz-e-Quran">Hafiz-e-Quran / حافظ قرآن</SelectItem>
                  <SelectItem value="Madrasa Education">Madrasa Education / مدرسہ تعلیم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Skills / ہنر</Label>
            <p className="text-sm text-gray-500">Apne skills add karein / Add your skills</p>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="h-12 text-lg"
                placeholder="Skill likhein (e.g., Driving)"
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} className="bg-[#003366] hover:bg-[#001a33] text-white h-12 px-4">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, i) => (
                <Badge key={i} className="bg-blue-50 text-[#003366] hover:bg-blue-100 text-sm py-1.5 px-3">
                  {skill}
                  <button onClick={() => removeSkill(i)} className="ml-2 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Apna kaam ka tajraba likhein / Write about your work experience. Agar koi experience nahi to &quot;Fresh / No experience&quot; likhein.
              </p>
            </div>
            <Label className="text-base font-semibold">Work Experience / کام کا تجربہ</Label>
            <Textarea
              value={cvData.workExperience}
              onChange={(e) => updateCVData({ workExperience: e.target.value })}
              className="min-h-[150px] text-lg"
              placeholder="Apna kaam ka tajraba likhein...&#10;Example: 3 saal driver ka kaam, Lahore mein security guard, etc."
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Languages / زبانیں</Label>
            <p className="text-sm text-gray-500">Kiya kiya zubanein aati hain? / What languages do you know?</p>
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="h-12 text-lg"
                placeholder="Zuban likhein (e.g., Punjabi)"
                onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
              />
              <Button onClick={addLanguage} className="bg-[#003366] hover:bg-[#001a33] text-white h-12 px-4">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {cvData.languages.map((lang, i) => (
                <Badge key={i} className="bg-green-50 text-green-700 hover:bg-green-100 text-sm py-1.5 px-3">
                  {lang}
                  <button onClick={() => removeLanguage(i)} className="ml-2 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={handlePrint} className="bg-[#003366] hover:bg-[#001a33] text-white flex-1 h-12 text-lg">
                <Printer className="w-5 h-5 mr-2" />
                Print / پرنٹ
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1 h-12 text-lg border-[#003366] text-[#003366]">
                <Download className="w-5 h-5 mr-2" />
                Download
              </Button>
            </div>

            {/* CV Preview */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-6" ref={printRef}>
                <h1 className="text-2xl font-bold text-[#003366] border-b-2 border-[#2980b9] pb-2">
                  {cvData.fullName || 'Your Name'}
                </h1>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
                  {cvData.fatherName && <p><span className="font-semibold text-[#2980b9]">Father:</span> {cvData.fatherName}</p>}
                  {cvData.cnic && <p><span className="font-semibold text-[#2980b9]">CNIC:</span> {cvData.cnic}</p>}
                  {cvData.phone && <p><span className="font-semibold text-[#2980b9]">Phone:</span> {cvData.phone}</p>}
                  {cvData.age && <p><span className="font-semibold text-[#2980b9]">Age:</span> {cvData.age} years</p>}
                  {cvData.gender && <p><span className="font-semibold text-[#2980b9]">Gender:</span> {cvData.gender === 'male' ? 'Male' : 'Female'}</p>}
                  {(cvData.address || cvData.city) && <p><span className="font-semibold text-[#2980b9]">Address:</span> {cvData.address}{cvData.city ? `, ${cvData.city}` : ''}</p>}
                </div>

                <Separator className="my-4" />

                <h2 className="text-lg font-bold text-[#003366] border-b border-gray-200 pb-1">Education / تعلیم</h2>
                <p className="mt-2 text-gray-600">{cvData.education || 'No formal education / کویی رسمی تعلیم نہیں'}</p>

                <h2 className="text-lg font-bold text-[#003366] border-b border-gray-200 pb-1 mt-4">Skills / ہنر</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {cvData.skills.length > 0 ? cvData.skills.map((skill, i) => (
                    <span key={i} className="bg-blue-50 text-[#003366] px-3 py-1 rounded-full text-sm">{skill}</span>
                  )) : <span className="text-gray-400">No skills listed</span>}
                </div>

                <h2 className="text-lg font-bold text-[#003366] border-b border-gray-200 pb-1 mt-4">Work Experience / کام کا تجربہ</h2>
                <p className="mt-2 text-gray-600 whitespace-pre-line">{cvData.workExperience || 'No experience listed'}</p>

                <h2 className="text-lg font-bold text-[#003366] border-b border-gray-200 pb-1 mt-4">Languages / زبانیں</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {cvData.languages.map((lang, i) => (
                    <span key={i} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">{lang}</span>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-6 text-center">Generated by Jugnoo Smart Portal</p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView('dashboard')}
            className="text-[#2980b9] hover:text-[#003366]"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Wapas / Back
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetCVData();
            setCurrentStep(1);
          }}
          className="text-red-400 hover:text-red-600"
        >
          Reset
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#003366]">CV Builder / سی وی بنائیں</h2>
        <p className="text-gray-400">Aasaan tariqe se CV banayein / Build your CV easily</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Step {currentStep} of {CV_STEPS.length}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Step content */}
      <Card className="premium-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            {(() => {
              const StepIcon = CV_STEPS[currentStep - 1]?.icon || User;
              return <StepIcon className="w-5 h-5" />;
            })()}
            {CV_STEPS[currentStep - 1]?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="touch-target"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Pichla / Back
        </Button>
        {currentStep < CV_STEPS.length ? (
          <Button
            onClick={handleNext}
            className="bg-[#003366] hover:bg-[#001a33] text-white touch-target"
          >
            Aagay / Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => {
              toast.success('CV tayyar hai! / CV is ready!');
            }}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white touch-target"
          >
            <Check className="w-4 h-4 mr-2" />
            Finish / مکمل
          </Button>
        )}
      </div>
    </div>
  );
}
