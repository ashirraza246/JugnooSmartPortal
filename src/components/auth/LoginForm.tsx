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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001a33] via-[#003366] to-[#001a33] p-4">
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
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#2980b9] to-[#003366] shadow-2xl mb-4"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Jugnoo Smart Portal</h1>
          <p className="text-blue-200 mt-2 text-lg">Pakistani Government Services</p>
          <p className="text-blue-300 text-sm mt-1">پاکستانی حکومتی خدمات</p>
        </div>

        <Card className="premium-card border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center text-[#003366]">
              <LogIn className="w-6 h-6 inline mr-2" />
              Login / لاگ ان
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">
                Email / ای میل
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="aap@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">
                Password / پاسورڈ
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-lg pr-12"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003366]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
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
                  <LogIn className="w-5 h-5 mr-2" />
                  Login / لاگ ان
                </>
              )}
            </Button>

            {/* Demo credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-[#003366] mb-2">Demo Login / ڈیمو لاگ ان:</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#003366]" />
                  <span className="font-medium">Admin:</span> admin@jugnoo.pk / jugnoo123
                </p>
                <p className="text-xs text-gray-400 mt-1">Ya register karein neeche / Or register below</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-gray-500 text-base">
                Account nahi hai?{' '}
                <button
                  onClick={() => setActiveView('register')}
                  className="text-[#2980b9] hover:text-[#003366] font-semibold underline"
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
