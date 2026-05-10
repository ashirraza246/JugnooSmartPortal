'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, Clock, DollarSign, Info,
  FileText, User, HelpCircle, AlertTriangle, CheckCircle,
  XCircle, Calendar, Banknote, CreditCard, Smartphone, Building,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { pakistaniCities } from '@/lib/data';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, label: 'Eligibility / اہلیت', icon: CheckCircle },
  { id: 2, label: 'Deadlines / آخری تاریخ', icon: Calendar },
  { id: 3, label: 'Loan Tiers / قرضہ', icon: Banknote },
  { id: 4, label: 'Amount / رقم', icon: DollarSign },
  { id: 5, label: 'Details / تفصیلات', icon: Info },
  { id: 6, label: 'Personal / ذاتی', icon: User },
  { id: 7, label: 'Eligibility Check / چیک', icon: Check },
  { id: 8, label: 'Payment / ادائیگی', icon: CreditCard },
];

export default function ServiceApplicationWizard() {
  const selectedService = useAppStore((s) => s.selectedService);
  const currentStep = useAppStore((s) => s.currentStep);
  const setCurrentStep = useAppStore((s) => s.setCurrentStep);
  const selectedLoanAmount = useAppStore((s) => s.selectedLoanAmount);
  const setSelectedLoanAmount = useAppStore((s) => s.setSelectedLoanAmount);
  const selectedLoanTier = useAppStore((s) => s.selectedLoanTier);
  const setSelectedLoanTier = useAppStore((s) => s.setSelectedLoanTier);
  const user = useAppStore((s) => s.user);
  const submitApplication = useAppStore((s) => s.submitApplication);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const resetWizard = useAppStore((s) => s.resetWizard);
  const addNotification = useAppStore((s) => s.addNotification);

  const [formData, setFormData] = useState<Record<string, string>>({
    fullName: user?.name || '',
    cnic: user?.cnic || '',
    phone: user?.phone || '',
    email: user?.email || '',
    income: user?.income?.toString() || '',
    city: user?.city || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    employment: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    reasons: string[];
  } | null>(null);

  if (!selectedService) return null;

  const isLoanService = selectedService.type === 'loan';
  // Adjust total steps based on service type
  const totalSteps = isLoanService ? 8 : 6;
  const progressPercent = (currentStep / totalSteps) * 100;

  const getActiveSteps = () => {
    if (isLoanService) return STEPS;
    return STEPS.filter((_, i) => i !== 2 && i !== 3); // Skip loan tiers and amount for non-loan
  };

  const handleNext = () => {
    // Validation for step 6 (personal details)
    if (currentStep === 6) {
      if (!formData.fullName || !formData.cnic || !formData.phone) {
        toast.error('Name, CNIC aur Phone zaruri hain / Name, CNIC and Phone are required');
        return;
      }
      // Auto-check eligibility
      checkEligibility();
      if (isLoanService) {
        setCurrentStep(7);
      } else {
        setCurrentStep(5); // go to payment directly after personal details
        // Actually, let's adjust - for non-loan: step 5 = personal, step 6 = eligibility, step 7 = payment
        // Let me recalculate
        setCurrentStep(6);
      }
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const checkEligibility = () => {
    const criteria = selectedService.eligibilityCriteria;
    const reasons: string[] = [];
    let eligible = true;

    const age = parseInt(formData.age);
    const income = parseInt(formData.income);

    if (criteria.minAge && age && age < criteria.minAge) {
      eligible = false;
      reasons.push(`Umar kam az kam ${criteria.minAge} saal honi chahiye / Age must be at least ${criteria.minAge}`);
    }
    if (criteria.maxAge && age && age > criteria.maxAge) {
      eligible = false;
      reasons.push(`Umar ${criteria.maxAge} saal se zyada nahi honi chahiye / Age must not exceed ${criteria.maxAge}`);
    }
    if (criteria.maxIncome && income && income > criteria.maxIncome) {
      eligible = false;
      reasons.push(`Maheenawar aamdani Rs. ${criteria.maxIncome} se kam honi chahiye / Monthly income must be below Rs. ${criteria.maxIncome.toLocaleString()}`);
    }
    if (criteria.minIncome && income && income < criteria.minIncome) {
      eligible = false;
      reasons.push(`Maheenawar aamdani Rs. ${criteria.minIncome} se zyada honi chahiye / Monthly income must be above Rs. ${criteria.minIncome.toLocaleString()}`);
    }
    if (criteria.requiredGender && criteria.requiredGender !== 'any') {
      if (formData.gender && formData.gender !== criteria.requiredGender) {
        eligible = false;
        reasons.push(
          criteria.requiredGender === 'female'
            ? 'Yeh service sirf khawateen ke liye hai / This service is only for women'
            : 'Yeh service sirf mardoon ke liye hai / This service is only for men'
        );
      }
    }
    if (criteria.requiredCities && criteria.requiredCities.length > 0 && formData.city) {
      if (!criteria.requiredCities.includes(formData.city)) {
        // Don't make it ineligible since we have many cities, just note it
        reasons.push(`Aap ka shehar list mein nahi hai, lekin aap apply kar sakte hain / Your city may not be in priority list`);
      }
    }

    setEligibilityResult({ eligible, reasons });
  };

  const handleSubmitApplication = () => {
    if (!paymentConfirmed) {
      toast.error('Pehle payment confirm karein / Please confirm payment first');
      return;
    }
    const application = {
      id: `app-${Date.now()}`,
      userId: user?.id || '',
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      status: 'pending' as const,
      amount: selectedLoanAmount || selectedService.price,
      paymentStatus: 'paid' as const,
      paymentMethod,
      formData,
      createdAt: new Date().toISOString(),
    };
    submitApplication(application);
    toast.success('Application submit ho gayi! / Application submitted successfully!');
    setActiveView('success');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <EligibilityStep service={selectedService} />;
      case 2:
        return <DeadlinesStep service={selectedService} />;
      case 3:
        return isLoanService ? <LoanTiersStep service={selectedService} /> : <PersonalDetailsStep formData={formData} setFormData={setFormData} />;
      case 4:
        return isLoanService ? <LoanAmountStep service={selectedService} /> : null;
      case 5:
        return isLoanService ? <ImportantDetailsStep service={selectedService} /> : <PersonalDetailsStep formData={formData} setFormData={setFormData} />;
      // For loan: step 6 = personal, step 7 = eligibility result, step 8 = payment
      // For non-loan: step 6 = eligibility result, step 7 = payment
      default:
        if (currentStep === 6 && isLoanService) return <PersonalDetailsStep formData={formData} setFormData={setFormData} />;
        if (currentStep === 7 && isLoanService) return <EligibilityResultStep result={eligibilityResult} />;
        if (currentStep === 8 && isLoanService) return <PaymentStep service={selectedService} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} paymentConfirmed={paymentConfirmed} setPaymentConfirmed={setPaymentConfirmed} />;
        if (currentStep === 6 && !isLoanService) return <EligibilityResultStep result={eligibilityResult} />;
        if (currentStep === 7 && !isLoanService) return <PaymentStep service={selectedService} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} paymentConfirmed={paymentConfirmed} setPaymentConfirmed={setPaymentConfirmed} />;
        return null;
    }
  };

  const isLastStep = currentStep === totalSteps;
  const isEligibilityStep = (isLoanService && currentStep === 7) || (!isLoanService && currentStep === 6);
  const canProceedFromEligibility = !eligibilityResult || eligibilityResult.eligible;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetWizard();
            setActiveView('services');
          }}
          className="text-[#2980b9] hover:text-[#003366]"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Wapas / Back
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#003366]">{selectedService.name}</h2>
        <p className="text-gray-400">{selectedService.nameUrdu}</p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        {/* Step indicators */}
        <div className="hidden sm:flex items-center justify-between mt-2">
          {getActiveSteps().map((step, idx) => {
            const stepNum = idx + 1;
            const isComplete = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const StepIcon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${isComplete ? 'step-complete' : isCurrent ? 'step-active' : 'step-inactive'}
                `}>
                  {isComplete ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className="text-xs text-gray-400 hidden md:block">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
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

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="touch-target"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Pichla / Back
        </Button>

        {isLastStep ? (
          <Button
            onClick={handleSubmitApplication}
            disabled={!paymentConfirmed}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white touch-target font-semibold"
          >
            <Check className="w-4 h-4 mr-2" />
            Submit / جمع کرائیں
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={isEligibilityStep && !canProceedFromEligibility}
            className="bg-[#003366] hover:bg-[#001a33] text-white touch-target"
          >
            Aagay / Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Step Components
function EligibilityStep({ service }: { service: NonNullable<ReturnType<typeof useAppStore.getState>['selectedService']> }) {
  const criteria = service.eligibilityCriteria;
  return (
    <Card className="premium-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#003366]">
          <CheckCircle className="w-5 h-5" />
          Step 1: Eligibility Criteria / اہلیت کے معیار
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-lg">{criteria.description}</p>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {criteria.minAge && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-[#2980b9]" />
              <div>
                <p className="text-sm font-semibold text-[#003366]">Minimum Age / کم از کم عمر</p>
                <p className="text-lg font-bold text-[#2980b9]">{criteria.minAge} saal / years</p>
              </div>
            </div>
          )}
          {criteria.maxAge && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-[#2980b9]" />
              <div>
                <p className="text-sm font-semibold text-[#003366]">Maximum Age / زیادہ سے زیادہ عمر</p>
                <p className="text-lg font-bold text-[#2980b9]">{criteria.maxAge} saal / years</p>
              </div>
            </div>
          )}
          {criteria.minIncome && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-[#003366]">Minimum Income / کم از کم آمدنی</p>
                <p className="text-lg font-bold text-green-600">Rs. {criteria.minIncome.toLocaleString()}</p>
              </div>
            </div>
          )}
          {criteria.maxIncome && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-[#003366]">Maximum Income / زیادہ سے زیادہ آمدنی</p>
                <p className="text-lg font-bold text-green-600">Rs. {criteria.maxIncome.toLocaleString()}</p>
              </div>
            </div>
          )}
          {criteria.requiredGender && criteria.requiredGender !== 'any' && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-semibold text-[#003366]">Gender / جنس</p>
                <p className="text-lg font-bold text-purple-600">
                  {criteria.requiredGender === 'female' ? 'Khawateen / Women Only' : 'Mard / Men Only'}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800">Required Documents / ضروری دستاویزات:</p>
            <ul className="mt-2 space-y-1">
              {service.requiredDocuments.map((doc, i) => (
                <li key={i} className="text-sm text-yellow-700 flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DeadlinesStep({ service }: { service: NonNullable<ReturnType<typeof useAppStore.getState>['selectedService']> }) {
  return (
    <Card className="premium-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#003366]">
          <Calendar className="w-5 h-5" />
          Step 2: Deadlines / آخری تاریخ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {service.deadlines ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-sm font-semibold text-green-700">Opening Date / آغاز کی تاریخ</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {new Date(service.deadlines.from).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-sm font-semibold text-red-700">Closing Date / آخری تاریخ</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {new Date(service.deadlines.to).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <p className="text-lg font-semibold text-[#003366]">No specific deadline / Kohi deadline nahi</p>
            <p className="text-gray-500 mt-1">You can apply anytime / Aap kabhi bhi apply kar sakte hain</p>
          </div>
        )}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">
            Jaldi apply karein! Last date se pehle application submit karein / Apply early! Submit before the closing date.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoanTiersStep({ service }: { service: NonNullable<ReturnType<typeof useAppStore.getState>['selectedService']> }) {
  const selectedLoanTier = useAppStore((s) => s.selectedLoanTier);
  const setSelectedLoanTier = useAppStore((s) => s.setSelectedLoanTier);
  const setSelectedLoanAmount = useAppStore((s) => s.setSelectedLoanAmount);

  return (
    <Card className="premium-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#003366]">
          <Banknote className="w-5 h-5" />
          Step 3: Loan Tiers / قرضے کی اقسام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-lg">Kitna loan chahiye? Neeche se tier select karein / Select a loan tier below</p>
        <RadioGroup value={selectedLoanTier} onValueChange={(val) => {
          const tier = service.loanTiers?.find(t => t.name === val);
          if (tier) {
            setSelectedLoanTier(val);
            setSelectedLoanAmount(tier.amount);
          }
        }}>
          <div className="space-y-3">
            {service.loanTiers?.map((tier) => (
              <motion.label
                key={tier.name}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedLoanTier === tier.name
                    ? 'border-[#003366] bg-blue-50'
                    : 'border-gray-100 hover:border-[#2980b9]/30'
                }`}>
                  <RadioGroupItem value={tier.name} id={tier.name} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#003366]">{tier.name}</p>
                        <p className="text-sm text-gray-400">{tier.nameUrdu}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#2980b9]">Rs. {tier.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="text-xs">
                        MarkUp: {tier.interestRate}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Duration: {tier.duration}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.label>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

function LoanAmountStep({ service }: { service: NonNullable<ReturnType<typeof useAppStore.getState>['selectedService']> }) {
  const selectedLoanAmount = useAppStore((s) => s.selectedLoanAmount);
  const setSelectedLoanAmount = useAppStore((s) => s.setSelectedLoanAmount);
  const selectedTier = service.loanTiers?.find(t => t.name === useAppStore.getState().selectedLoanTier);

  return (
    <Card className="premium-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#003366]">
          <DollarSign className="w-5 h-5" />
          Step 4: Kitna Loan Chahiye? / کتنا قرضہ چاہیے؟
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedTier && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">Selected Tier / منتخب قسم</p>
            <p className="text-lg font-bold text-[#003366]">{selectedTier.name}</p>
            <p className="text-3xl font-bold text-[#2980b9] mt-1">Rs. {selectedTier.amount.toLocaleString()}</p>
          </div>
        )}
        <div>
          <Label className="text-base font-medium">Apni maangat rakam likhein / Enter your requested amount</Label>
          <Input
            type="number"
            value={selectedLoanAmount || ''}
            onChange={(e) => setSelectedLoanAmount(parseInt(e.target.value) || 0)}
            className="h-14 text-xl font-bold mt-2"
            placeholder="Rs. likhein..."
          />
          {selectedTier && selectedLoanAmount > selectedTier.amount && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Yeh amount tier ki had se zyada hai / This amount exceeds the tier limit
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ImportantDetailsStep({ service }: { service: NonNullable<ReturnType<typeof useAppStore.getState>['selectedService']> }) {
  return (
    <Card className="premium-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#003366]">
          <Info className="w-5 h-5" />
          Step 5: Important Details / اہم تفصیلات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {service.importantDetails.map((detail, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {i + 1}
            </div>
            <p className="text-base text-gray-700">{detail}</p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

function PersonalDetailsStep({
  formData,
  setFormData,
}: {
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="premium-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#003366]">
          <User className="w-5 h-5" />
          Personal Details / ذاتی تفصیلات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base font-medium">Full Name / پورا نام *</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              className="h-12 text-lg"
              placeholder="Apna naam likhein"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-medium">CNIC / شناختی کارڈ نمبر *</Label>
            <Input
              value={formData.cnic}
              onChange={(e) => updateField('cnic', e.target.value)}
              className="h-12 text-lg"
              placeholder="XXXXX-XXXXXXX-X"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-medium">Phone / فون نمبر *</Label>
            <Input
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="h-12 text-lg"
              placeholder="03XX-XXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-medium">Email / ای میل</Label>
            <Input
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="h-12 text-lg"
              placeholder="aap@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-medium">Age / عمر</Label>
            <Input
              type="number"
              value={formData.age}
              onChange={(e) => updateField('age', e.target.value)}
              className="h-12 text-lg"
              placeholder="Umar likhein"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-medium">Monthly Income / ماہانہ آمدنی</Label>
            <Input
              type="number"
              value={formData.income}
              onChange={(e) => updateField('income', e.target.value)}
              className="h-12 text-lg"
              placeholder="Rs. likhein"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-medium">Gender / جنس</Label>
            <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Select / Chunein" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male / مرد</SelectItem>
                <SelectItem value="female">Female / عورت</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-medium">City / شہر</Label>
            <Select value={formData.city} onValueChange={(v) => updateField('city', v)}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="City Chunein" />
              </SelectTrigger>
              <SelectContent>
                {pakistaniCities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-base font-medium">Address / پتہ</Label>
          <Input
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            className="h-12 text-lg"
            placeholder="Mukammal pata likhein"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function EligibilityResultStep({ result }: { result: { eligible: boolean; reasons: string[] } | null }) {
  if (!result) {
    return (
      <Card className="premium-card border-0">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <CheckCircle className="w-16 h-16 mx-auto text-gray-300" />
            <p className="text-gray-400 mt-4 text-lg">Checking eligibility / Ahalit check ho rahi hai...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`premium-card border-0 ${result.eligible ? 'border-2 border-green-300' : 'border-2 border-red-300'}`}>
      <CardContent className="p-6 text-center space-y-4">
        {result.eligible ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-600 mt-4">
              Aap eligible hain! / You are eligible! ✅
            </h3>
            <p className="text-gray-600 mt-2">
              Aghay barhein aur payment karein / Proceed to payment
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-600 mt-4">
              Aap eligible nahi hain / You are not eligible ❌
            </h3>
            <div className="space-y-2 mt-4">
              {result.reasons.map((reason, i) => (
                <p key={i} className="text-red-500 text-sm flex items-center gap-2 justify-center">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {reason}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentStep({
  service,
  paymentMethod,
  setPaymentMethod,
  paymentConfirmed,
  setPaymentConfirmed,
}: {
  service: NonNullable<ReturnType<typeof useAppStore.getState>['selectedService']>;
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;
  paymentConfirmed: boolean;
  setPaymentConfirmed: (c: boolean) => void;
}) {
  const paymentConfig = useAppStore((s) => s.paymentConfig);
  const selectedLoanAmount = useAppStore((s) => s.selectedLoanAmount);
  const amount = selectedLoanAmount > 0 ? service.price : service.price;

  return (
    <Card className="premium-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#003366]">
          <CreditCard className="w-5 h-5" />
          Payment / ادائیگی
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Amount */}
        <div className="bg-gradient-to-r from-[#001a33] to-[#003366] rounded-xl p-5 text-center text-white">
          <p className="text-blue-200 text-sm">Application Fee / فیس</p>
          <p className="text-4xl font-bold mt-1">Rs. {amount.toLocaleString()}</p>
          <p className="text-blue-300 text-xs mt-1">Service: {service.name}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="font-semibold text-yellow-800 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Payment zaruri hai / Payment is mandatory
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Bina payment ke application submit nahi hogi / Application will not be submitted without payment
          </p>
        </div>

        {/* Payment method selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Payment Method / ادائیگی کا طریقہ</Label>

          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <motion.label whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <div className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'jazzcash' ? 'border-[#003366] bg-blue-50' : 'border-gray-100'
              }`}>
                <RadioGroupItem value="jazzcash" id="jazzcash" />
                <Smartphone className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-semibold text-[#003366]">JazzCash</p>
                  <p className="text-sm text-gray-400">JazzCash Number: {paymentConfig.jazzCashNumber}</p>
                </div>
              </div>
            </motion.label>

            <motion.label whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <div className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'easypaisa' ? 'border-[#003366] bg-blue-50' : 'border-gray-100'
              }`}>
                <RadioGroupItem value="easypaisa" id="easypaisa" />
                <Smartphone className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold text-[#003366]">EasyPaisa</p>
                  <p className="text-sm text-gray-400">EasyPaisa Number: {paymentConfig.easyPaisaNumber}</p>
                </div>
              </div>
            </motion.label>

            <motion.label whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <div className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'bank' ? 'border-[#003366] bg-blue-50' : 'border-gray-100'
              }`}>
                <RadioGroupItem value="bank" id="bank" />
                <Building className="w-6 h-6 text-[#003366]" />
                <div>
                  <p className="font-semibold text-[#003366]">Bank Transfer</p>
                  <p className="text-sm text-gray-400">{paymentConfig.bankName}</p>
                  <p className="text-xs text-gray-400">Account: {paymentConfig.bankAccount}</p>
                  <p className="text-xs text-gray-400">Title: {paymentConfig.bankTitle}</p>
                </div>
              </div>
            </motion.label>
          </RadioGroup>
        </div>

        {/* Payment confirmation */}
        {paymentMethod && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={paymentConfirmed}
                onChange={(e) => setPaymentConfirmed(e.target.checked)}
                className="mt-1 w-5 h-5 accent-green-600"
              />
              <div>
                <p className="font-semibold text-green-800">
                  Maine payment kar di hai / I have made the payment
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Rs. {amount.toLocaleString()} ki payment {paymentMethod === 'jazzcash' ? 'JazzCash' : paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'Bank Transfer'} se kar di hai
                </p>
              </div>
            </label>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
