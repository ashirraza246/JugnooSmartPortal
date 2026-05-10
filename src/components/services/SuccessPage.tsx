'use client';

import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, FileText, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export default function SuccessPage() {
  const setActiveView = useAppStore((s) => s.setActiveView);
  const resetWizard = useAppStore((s) => s.resetWizard);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-full max-w-lg"
      >
        <Card className="premium-card border-0 text-center">
          <CardContent className="p-8 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-14 h-14 text-green-600" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-green-600">
                Kamyab! / Successful! 🎉
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                Aap ki application successfully submit ho gayi hai
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Your application has been submitted successfully
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4"
            >
              <p className="text-sm text-blue-700">
                Aap ko 3-5 working days mein application ki status ka update milega. Notifications check karte rahein.
              </p>
              <p className="text-xs text-blue-500 mt-1">
                You will receive a status update within 3-5 working days.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={() => {
                  resetWizard();
                  setActiveView('applications');
                }}
                className="flex-1 bg-[#003366] hover:bg-[#001a33] text-white h-12"
              >
                <FileText className="w-5 h-5 mr-2" />
                Applications dekhein / View
              </Button>
              <Button
                onClick={() => {
                  resetWizard();
                  setActiveView('dashboard');
                }}
                variant="outline"
                className="flex-1 h-12 border-[#003366] text-[#003366]"
              >
                <Home className="w-5 h-5 mr-2" />
                Home / ہوم
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
