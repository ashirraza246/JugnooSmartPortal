'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, FileText, CreditCard, Settings,
  DollarSign, TrendingUp, Eye, CheckCircle, XCircle,
  Clock, Edit, Save, Building, Smartphone,
  ArrowLeft, Plus, Trash2, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { serviceCategories } from '@/lib/data';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const applications = useAppStore((s) => s.applications);
  const paymentConfig = useAppStore((s) => s.paymentConfig);
  const updatePaymentConfig = useAppStore((s) => s.updatePaymentConfig);
  const servicePrices = useAppStore((s) => s.servicePrices);
  const setServicePrice = useAppStore((s) => s.setServicePrice);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const totalUsers = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('jugnoo-users') || '[]').length + 1
    : 1;
  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === 'approved').length;
  const pendingApps = applications.filter((a) => a.status === 'pending').length;
  const totalRevenue = applications
    .filter((a) => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  const [editPayment, setEditPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState(paymentConfig);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);

  const handleSavePayment = () => {
    updatePaymentConfig(paymentForm);
    setEditPayment(false);
    toast.success('Payment details update ho gayi / Payment details updated');
  };

  const handleSavePrice = (serviceId: string) => {
    setServicePrice(serviceId, editingPrice);
    setEditingServiceId(null);
    toast.success('Price update ho gayi / Price updated');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-[#E8F5E9] text-[#2E7D32] border-0 text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-[#FFEBEE] text-[#E53935] border-0 text-[10px]"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'in-review':
        return <Badge className="bg-[#FFF3D6] text-[#F5A623] border-0 text-[10px]"><Clock className="w-3 h-3 mr-1" />In Review</Badge>;
      default:
        return <Badge className="bg-[#E8F0FE] text-[#1A3C5E] border-0 text-[10px]"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const updateApplicationStatus = (appId: string, status: 'approved' | 'rejected' | 'in-review') => {
    const updatedApps = applications.map((app) =>
      app.id === appId ? { ...app, status } : app
    );
    useAppStore.setState({ applications: updatedApps });
    toast.success(`Application ${status} ho gayi / Application ${status}`);
  };

  // Get all services flat
  const allServices = serviceCategories.flatMap((cat) =>
    cat.services.map((svc) => ({
      ...svc,
      categoryName: cat.name,
      categoryColor: cat.color,
    }))
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Card - UBL Style */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1A3C5E] to-[#003E6B] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#F5A623]/10 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-[#F5A623] text-sm font-medium mb-1">Admin Panel / ایڈمن پینل</p>
          <p className="text-3xl sm:text-4xl font-bold mb-2">Dashboard</p>
          <p className="text-white/70 text-sm">Manage services, prices, and applications</p>
          <div className="flex items-center gap-3 mt-4">
            <Button
              size="sm"
              className="bg-[#F5A623] hover:bg-[#FFB300] text-[#1A3C5E] font-semibold rounded-xl h-10 px-5 shadow-sm"
              onClick={() => setActiveView?.('applications')}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Applications
            </Button>
            <Button
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl h-10 px-5"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Quick Stats
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: totalUsers, color: '#1A3C5E', bgColor: '#E8F0FE', icon: Users },
          { label: 'Applications', value: totalApps, color: '#F5A623', bgColor: '#FFF3D6', icon: FileText },
          { label: 'Approved', value: approvedApps, color: '#2E7D32', bgColor: '#E8F5E9', icon: CheckCircle },
          { label: 'Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: '#7B1FA2', bgColor: '#F3E5F5', icon: TrendingUp },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: stat.bgColor }}>
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#6B7280] font-medium">{stat.label}</p>
                      <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F5F7FA] h-auto p-1.5 rounded-xl">
          <TabsTrigger value="overview" className="text-xs touch-target data-[state=active]:bg-[#1A3C5E] data-[state=active]:text-white rounded-lg data-[state=active]:shadow-sm">
            <BarChart3 className="w-4 h-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="applications" className="text-xs touch-target data-[state=active]:bg-[#1A3C5E] data-[state=active]:text-white rounded-lg data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-1" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="prices" className="text-xs touch-target data-[state=active]:bg-[#1A3C5E] data-[state=active]:text-white rounded-lg data-[state=active]:shadow-sm">
            <DollarSign className="w-4 h-4 mr-1" />
            Prices
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs touch-target data-[state=active]:bg-[#1A3C5E] data-[state=active]:text-white rounded-lg data-[state=active]:shadow-sm">
            <CreditCard className="w-4 h-4 mr-1" />
            Payment
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base text-[#1C1C1E]">Recent Applications / حالیہ درخواستیں</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-10 text-[#6B7280]">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-[#1A3C5E]/10" />
                  <p className="text-sm">Koi application nahi / No applications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-[#F5F7FA] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center">
                          <FileText className="w-4 h-4 text-[#1A3C5E]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1C1C1E] text-sm">{app.serviceName}</p>
                          <p className="text-[10px] text-[#6B7280]">
                            {new Date(app.createdAt).toLocaleDateString('en-PK')} | Rs. {app.amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base text-[#1C1C1E]">All Applications / تمام درخواستیں</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-10 text-[#6B7280]">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-[#1A3C5E]/10" />
                  <p className="text-sm">Koi application nahi / No applications yet</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-[#F5F7FA] rounded-2xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center">
                              <FileText className="w-4 h-4 text-[#1A3C5E]" />
                            </div>
                            <div>
                              <p className="font-bold text-[#1C1C1E] text-sm">{app.serviceName}</p>
                              <p className="text-[10px] text-[#6B7280]">
                                ID: {app.id} | {new Date(app.createdAt).toLocaleDateString('en-PK')}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-[#6B7280] text-xs">Name:</span>
                            <p className="font-medium text-[#1C1C1E] text-xs">{app.formData.fullName || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[#6B7280] text-xs">CNIC:</span>
                            <p className="font-medium text-[#1C1C1E] text-xs">{app.formData.cnic || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[#6B7280] text-xs">Phone:</span>
                            <p className="font-medium text-[#1C1C1E] text-xs">{app.formData.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[#6B7280] text-xs">Amount:</span>
                            <p className="font-medium text-[#1C1C1E] text-xs">Rs. {app.amount?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(app.id, 'approved')}
                            className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs rounded-xl h-8"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(app.id, 'in-review')}
                            className="bg-[#F5A623] hover:bg-[#FFB300] text-[#1A3C5E] text-xs rounded-xl h-8"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                            className="text-xs rounded-xl h-8"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prices Tab */}
        <TabsContent value="prices" className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base text-[#1C1C1E]">Service Prices / سروس کی قیمتیں</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-2">
                  {allServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-[#F5F7FA] rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: service.categoryColor }}
                        />
                        <div>
                          <p className="font-medium text-[#1C1C1E] text-sm">{service.name}</p>
                          <p className="text-[10px] text-[#6B7280]">{service.categoryName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingServiceId === service.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editingPrice}
                              onChange={(e) => setEditingPrice(parseInt(e.target.value) || 0)}
                              className="w-24 h-8 text-sm rounded-xl"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSavePrice(service.id)}
                              className="bg-[#1A3C5E] text-white h-8 rounded-xl"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1A3C5E] text-sm">
                              Rs. {servicePrices[service.id] ?? service.price}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingServiceId(service.id);
                                setEditingPrice(servicePrices[service.id] ?? service.price);
                              }}
                              className="h-8 w-8 p-0 rounded-lg"
                            >
                              <Edit className="w-4 h-4 text-[#6B7280]" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Config Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1C1C1E]">Payment Details / ادائیگی کی تفصیلات</CardTitle>
                {!editPayment ? (
                  <Button size="sm" onClick={() => setEditPayment(true)} className="bg-[#1A3C5E] text-white rounded-xl h-8">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSavePayment} className="bg-[#2E7D32] text-white rounded-xl h-8">
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditPayment(false)} className="rounded-xl h-8">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-[#1C1C1E]">JazzCash</h3>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs">JazzCash Number</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.jazzCashNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, jazzCashNumber: e.target.value })}
                      className="h-12 bg-[#F5F7FA] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl"
                    />
                  ) : (
                    <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{paymentConfig.jazzCashNumber}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-[#1C1C1E]">EasyPaisa</h3>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs">EasyPaisa Number</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.easyPaisaNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, easyPaisaNumber: e.target.value })}
                      className="h-12 bg-[#F5F7FA] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl"
                    />
                  ) : (
                    <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{paymentConfig.easyPaisaNumber}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center">
                    <Building className="w-5 h-5 text-[#1A3C5E]" />
                  </div>
                  <h3 className="font-semibold text-[#1C1C1E]">Bank Transfer</h3>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs">Bank Name</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.bankName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                      className="h-12 bg-[#F5F7FA] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl"
                    />
                  ) : (
                    <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{paymentConfig.bankName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs">Account Number</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.bankAccount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankAccount: e.target.value })}
                      className="h-12 bg-[#F5F7FA] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl"
                    />
                  ) : (
                    <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{paymentConfig.bankAccount}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs">Account Title</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.bankTitle}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankTitle: e.target.value })}
                      className="h-12 bg-[#F5F7FA] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl"
                    />
                  ) : (
                    <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{paymentConfig.bankTitle}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
