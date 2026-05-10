'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const register = useAppStore((s) => s.register);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.error('Sab fields bharein / Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords match nahi karte / Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password kam az kam 6 characters ka ho / Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = register(name, email, password);
    setIsLoading(false);
    if (!success) {
      toast.error('Email pehle se registered hai / Email already registered');
    } else {
      toast.success('Registration kamyab! / Registration successful!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001a33] via-[#003366] to-[#001a33] p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#2980b9] to-[#003366] shadow-2xl mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-blue-200 mt-1">نيا اکاؤنٹ بنائیں</p>
        </div>

        <Card className="premium-card border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center text-[#003366]">
              <UserPlus className="w-6 h-6 inline mr-2" />
              Register / رجسٹر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">
                Full Name / پورا نام *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Apna naam likhein"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-base font-medium">
                Email / ای میل *
              </Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="aap@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-base font-medium">
                Password / پاسورڈ *
              </Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Kam az kam 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-base font-medium">
                Confirm Password / پاسورڈ دوبارہ *
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Password dobara likhein"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
            </div>

            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full h-12 text-lg font-semibold bg-[#003366] hover:bg-[#001a33] text-white"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register / رجسٹر
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-gray-500 text-base">
                Account hai?{' '}
                <button
                  onClick={() => setActiveView('login')}
                  className="text-[#2980b9] hover:text-[#003366] font-semibold underline"
                >
                  Login karein / Sign In
                </button>
              </p>
            </div>

            <button
              onClick={() => setActiveView('login')}
              className="flex items-center gap-1 text-gray-400 hover:text-[#003366] text-sm mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Wapas Login / Back to Login
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
