'use client';

import { motion } from 'framer-motion';
import {
  Heart, HandCoins, Rocket, Home, Wheat, Stethoscope,
  GraduationCap, Sparkles, Zap, CreditCard, ArrowRight,
  FileText, Clock, CheckCircle, AlertCircle, Briefcase,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { serviceCategories } from '@/lib/data';

const iconMap: Record<string, React.ElementType> = {
  Heart, HandCoins, Rocket, Home, Wheat, Stethoscope,
  GraduationCap, Sparkles, Zap, CreditCard,
};

export default function CustomerDashboard() {
  const user = useAppStore((s) => s.user);
  const applications = useAppStore((s) => s.applications);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const handleCategoryClick = (category: typeof serviceCategories[0]) => {
    setSelectedCategory(category);
    setActiveView('services');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'in-review':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />In Review</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><FileText className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#001a33] via-[#003366] to-[#2980b9] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#d4a843]/30 translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Assalam-o-Alaikum, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-blue-100 mt-2 text-lg">
            Jugnoo Smart Portal mein khush aamdeed / Welcome to Jugnoo Smart Portal
          </p>
          <p className="text-blue-200 mt-1 text-sm">
            Neeche services mein se choose karein / Choose a service below
          </p>
        </div>
      </motion.div>

      {/* Service Categories */}
      <div>
        <h3 className="text-xl font-bold text-[#003366] mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Services / خدمات
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {serviceCategories.map((category, index) => {
            const Icon = iconMap[category.icon] || Heart;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="premium-card cursor-pointer border-0 group"
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardContent className="p-4 sm:p-5 text-center">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: category.color }} />
                    </div>
                    <h4 className="font-bold text-[#003366] text-sm sm:text-base leading-tight">{category.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 hidden sm:block">{category.nameUrdu}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      {category.services.length} services
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Active Applications */}
      {applications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#003366] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              My Applications / میری درخواستیں
            </h3>
            <Button
              variant="ghost"
              onClick={() => setActiveView('applications')}
              className="text-[#2980b9] hover:text-[#003366]"
            >
              Sab dekhein / View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {applications.slice(0, 4).map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="premium-card border-0">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#003366]">{app.serviceName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString('en-PK')}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-[#003366] mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5" />
          Quick Actions / فوری اقدامات
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="premium-card border-0 cursor-pointer" onClick={() => setActiveView('cv-builder')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-[#003366]">CV Builder / سی وی بنائیں</p>
                <p className="text-xs text-gray-400">Free CV banayein</p>
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card border-0 cursor-pointer" onClick={() => { setSelectedCategory(serviceCategories[2]); setActiveView('services'); }}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-[#003366]">Youth Loan / نوجوان قرضہ</p>
                <p className="text-xs text-gray-400">PM Kamyab Jawan</p>
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card border-0 cursor-pointer" onClick={() => { setSelectedCategory(serviceCategories[5]); setActiveView('services'); }}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-[#003366]">Sehat Card / سیٹ کارڈ</p>
                <p className="text-xs text-gray-400">Free health insurance</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
