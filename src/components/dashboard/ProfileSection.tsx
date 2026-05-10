'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Save, Phone, CreditCard, MapPin, Calendar,
  ArrowLeft, Edit, Mail, Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { pakistaniCities } from '@/lib/data';
import { toast } from 'sonner';

export default function ProfileSection() {
  const user = useAppStore((s) => s.user);
  const updateUserProfile = useAppStore((s) => s.updateUserProfile);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    cnic: user?.cnic || '',
    city: user?.city || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    income: user?.income?.toString() || '',
  });

  const handleSave = () => {
    updateUserProfile({
      name: formData.name,
      phone: formData.phone,
      cnic: formData.cnic,
      city: formData.city,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender,
      income: formData.income ? parseInt(formData.income) : undefined,
    });
    setIsEditing(false);
    toast.success('Profile update ho gayi! / Profile updated!');
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveView(user?.role === 'admin' ? 'admin' : 'dashboard')}
          className="text-[#2980b9] hover:text-[#003366]"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Wapas / Back
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#003366]">Profile / پروفائل</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-[#003366] text-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit / ترمیم
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-green-600 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save / محفوظ
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile header */}
      <Card className="premium-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-[#2980b9]">
              <AvatarFallback className="bg-gradient-to-br from-[#003366] to-[#2980b9] text-white text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold text-[#003366]">{user?.name}</h3>
              <p className="text-gray-500 flex items-center gap-1"><Mail className="w-4 h-4" />{user?.email}</p>
              <Badge className="mt-1 bg-blue-100 text-blue-700">{user?.role === 'admin' ? 'Admin' : 'Customer'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile details */}
      <Card className="premium-card border-0">
        <CardHeader>
          <CardTitle className="text-[#003366]">Personal Details / ذاتی تفصیلات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name / پورا نام
              </Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 text-lg"
                />
              ) : (
                <p className="text-lg text-gray-700 p-2">{user?.name || 'N/A'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone / فون
              </Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 text-lg"
                  placeholder="03XX-XXXXXXX"
                />
              ) : (
                <p className="text-lg text-gray-700 p-2">{user?.phone || 'N/A'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> CNIC / شناختی کارڈ
              </Label>
              {isEditing ? (
                <Input
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  className="h-12 text-lg"
                  placeholder="XXXXX-XXXXXXX-X"
                />
              ) : (
                <p className="text-lg text-gray-700 p-2">{user?.cnic || 'N/A'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> City / شہر
              </Label>
              {isEditing ? (
                <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Chunein" />
                  </SelectTrigger>
                  <SelectContent>
                    {pakistaniCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg text-gray-700 p-2">{user?.city || 'N/A'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Age / عمر
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="h-12 text-lg"
                />
              ) : (
                <p className="text-lg text-gray-700 p-2">{user?.age ? `${user.age} saal` : 'N/A'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <User className="w-4 h-4" /> Gender / جنس
              </Label>
              {isEditing ? (
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Chunein" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male / مرد</SelectItem>
                    <SelectItem value="female">Female / عورت</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg text-gray-700 p-2">
                  {user?.gender === 'male' ? 'Male / مرد' : user?.gender === 'female' ? 'Female / عورت' : 'N/A'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Monthly Income / ماہانہ آمدنی
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  className="h-12 text-lg"
                  placeholder="Rs."
                />
              ) : (
                <p className="text-lg text-gray-700 p-2">
                  {user?.income ? `Rs. ${user.income.toLocaleString()}` : 'N/A'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


