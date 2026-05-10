'use client';

import { motion } from 'framer-motion';
import {
  Heart, HandCoins, Rocket, Home, Wheat, Stethoscope,
  GraduationCap, Sparkles, Zap, CreditCard, ArrowLeft,
  ArrowRight, Info, HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';

const iconMap: Record<string, React.ElementType> = {
  Heart, HandCoins, Rocket, Home, Wheat, Stethoscope,
  GraduationCap, Sparkles, Zap, CreditCard,
};

export default function ServicesBrowser() {
  const categories = useAppStore((s) => s.categories);
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedService = useAppStore((s) => s.setSelectedService);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const resetWizard = useAppStore((s) => s.resetWizard);

  const handleServiceClick = (service: typeof categories[0]['services'][0]) => {
    setSelectedService(service);
    resetWizard();
    setActiveView('wizard');
  };

  if (!selectedCategory) {
    // Show all categories
    return (
      <div className="space-y-6 pb-6">
        <h2 className="text-2xl font-bold text-[#003366]">All Services / تمام خدمات</h2>
        {categories.map((category, catIdx) => {
          const Icon = iconMap[category.icon] || Heart;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: catIdx * 0.05 }}
            >
              <Card className="premium-card border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-[#003366]">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <span className="text-lg">{category.name}</span>
                      <span className="block text-xs text-gray-400 font-normal">{category.nameUrdu}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.services.map((service) => (
                      <motion.div
                        key={service.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className="border border-gray-100 cursor-pointer hover:border-[#2980b9]/30 transition-all"
                          onClick={() => handleServiceClick(service)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-[#003366]">{service.name}</h4>
                                <p className="text-xs text-gray-400">{service.nameUrdu}</p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-[#2980b9] flex-shrink-0 mt-1" />
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="outline" className="text-xs">
                                {service.type === 'loan' ? '💰 Loan / قرضہ' :
                                 service.type === 'subsidy' ? '🎁 Subsidy / سبسڈی' :
                                 service.type === 'certificate' ? '📄 Certificate / سرٹیفکیٹ' :
                                 service.type === 'registration' ? '📝 Registration / رجسٹریشن' :
                                 '📋 Application / درخواست'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Rs. {service.price}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Show services for selected category
  const Icon = iconMap[selectedCategory.icon] || Heart;
  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            useAppStore.getState().setSelectedCategory(null);
          }}
          className="text-[#2980b9] hover:text-[#003366]"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Wapas / Back
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${selectedCategory.color}15` }}
        >
          <Icon className="w-7 h-7" style={{ color: selectedCategory.color }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#003366]">{selectedCategory.name}</h2>
          <p className="text-gray-400">{selectedCategory.nameUrdu} - {selectedCategory.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedCategory.services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="premium-card border-0 cursor-pointer h-full"
              onClick={() => handleServiceClick(service)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    {service.type === 'loan' ? '💰 Loan' :
                     service.type === 'subsidy' ? '🎁 Subsidy' :
                     service.type === 'certificate' ? '📄 Certificate' :
                     service.type === 'registration' ? '📝 Registration' :
                     '📋 Application'}
                  </Badge>
                  <div className="flex items-center gap-1 text-[#d4a843]">
                    <Info className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-bold text-[#003366] text-lg">{service.name}</h3>
                <p className="text-sm text-gray-400">{service.nameUrdu}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{service.description}</p>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#003366]">
                    Fee: Rs. {service.price}
                  </span>
                  <Button size="sm" className="bg-[#003366] hover:bg-[#001a33] text-white">
                    Apply / درخواست
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
