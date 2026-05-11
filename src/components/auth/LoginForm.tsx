'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAppStore((s) => s.login);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Email aur password donon likhein / Please enter both email and password');
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = login(email, password);
    setIsLoading(false);
    if (!success) {
      toast.error('Login fail! Email ya password galat hai / Invalid credentials');
    } else {
      toast.success('Khush aamdeed! / Welcome!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A3C5E] via-[#003E6B] to-[#1A3C5E] p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-auto max-w-[200px] h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-[#F5A623]/20 shadow-2xl mb-4 px-2"
          >
            <img src="/jugnoo-photos-logo.jpg" alt="Jugnoo Photos" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Jugnoo Smart Portal</h1>
          <p className="text-[#F5A623] mt-2 text-lg font-medium">Pakistani Government Services</p>
          <p className="text-white/50 text-sm mt-1">پاکستانی حکومتی خدمات</p>
        </div>

        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 bg-white">
            <CardTitle className="text-xl text-center text-[#1A3C5E]">
              <LogIn className="w-5 h-5 inline mr-2" />
              Login / لاگ ان
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 bg-white">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#1C1C1E]">
                Email / ای میل
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="aap@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base bg-[#F3F4F6] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl focus:ring-0 focus:ring-offset-0 placeholder:text-[#6B7280]/50"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[#1C1C1E]">
                Password / پاسورڈ
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base pr-12 bg-[#F3F4F6] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl focus:ring-0 focus:ring-offset-0 placeholder:text-[#6B7280]/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A3C5E]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-[52px] text-base font-semibold bg-[#1A3C5E] hover:bg-[#0F2A42] text-white rounded-xl shadow-sm"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Login / لاگ ان
                </>
              )}
            </Button>

            {/* Demo credentials */}
            <div className="bg-[#F5F7FA] rounded-xl p-4 mt-4">
              <p className="text-sm font-semibold text-[#1A3C5E] mb-2">Demo Login / ڈیمو لاگ ان:</p>
              <div className="space-y-1 text-sm text-[#6B7280]">
                <p className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#1A3C5E]" />
                  <span className="font-medium text-[#1C1C1E]">Admin:</span> admin@jugnoo.pk / jugnoo123
                </p>
                <p className="text-xs text-[#6B7280]/60 mt-1">Ya register karein neeche / Or register below</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-[#6B7280] text-sm">
                Account nahi hai?{' '}
                <button
                  onClick={() => setActiveView('register')}
                  className="text-[#F5A623] hover:text-[#FFB300] font-semibold"
                >
                  Register karein / Sign Up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
