'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, FileText, CreditCard, Settings,
  DollarSign, TrendingUp, Eye, CheckCircle, XCircle,
  Clock, Edit, Save, Building, Smartphone,
  ArrowLeft, Plus, Trash2,
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
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'in-review':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />In Review</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
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
      <div>
        <h2 className="text-2xl font-bold text-[#003366]">Admin Panel / ایڈمن پینل</h2>
        <p className="text-gray-400">Manage services, prices, and applications</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-100 h-auto p-1">
          <TabsTrigger value="overview" className="text-sm touch-target data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="applications" className="text-sm touch-target data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-1" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="prices" className="text-sm touch-target data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-1" />
            Prices
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-sm touch-target data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <CreditCard className="w-4 h-4 mr-1" />
            Payment
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <Card className="premium-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#003366]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold text-[#003366]">{totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="premium-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applications</p>
                      <p className="text-2xl font-bold text-[#003366]">{totalApps}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="premium-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{approvedApps}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="premium-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Revenue</p>
                      <p className="text-2xl font-bold text-purple-600">Rs. {totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent applications */}
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="text-[#003366]">Recent Applications / حالیہ درخواستیں</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Koi application nahi / No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-[#003366]">{app.serviceName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(app.createdAt).toLocaleDateString('en-PK')} | Rs. {app.amount?.toLocaleString()}
                        </p>
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
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="text-[#003366]">All Applications / تمام درخواستیں</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Koi application nahi / No applications yet</p>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-gray-50 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-[#003366]">{app.serviceName}</p>
                            <p className="text-xs text-gray-400">
                              ID: {app.id} | Date: {new Date(app.createdAt).toLocaleDateString('en-PK')}
                            </p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Name:</span>
                            <p className="font-medium">{app.formData.fullName || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">CNIC:</span>
                            <p className="font-medium">{app.formData.cnic || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Phone:</span>
                            <p className="font-medium">{app.formData.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Amount:</span>
                            <p className="font-medium">Rs. {app.amount?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(app.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(app.id, 'in-review')}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                            className="text-xs"
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
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="text-[#003366]">Service Prices / سروس کی قیمتیں</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-2">
                  {allServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: service.categoryColor }}
                        />
                        <div>
                          <p className="font-medium text-[#003366] text-sm">{service.name}</p>
                          <p className="text-xs text-gray-400">{service.categoryName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingServiceId === service.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editingPrice}
                              onChange={(e) => setEditingPrice(parseInt(e.target.value) || 0)}
                              className="w-24 h-8 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSavePrice(service.id)}
                              className="bg-[#003366] text-white h-8"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#003366]">
                              Rs. {servicePrices[service.id] ?? service.price}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingServiceId(service.id);
                                setEditingPrice(servicePrices[service.id] ?? service.price);
                              }}
                            >
                              <Edit className="w-4 h-4 text-gray-400" />
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
          <Card className="premium-card border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#003366]">Payment Details / ادائیگی کی تفصیلات</CardTitle>
                {!editPayment ? (
                  <Button size="sm" onClick={() => setEditPayment(true)} className="bg-[#003366] text-white">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSavePayment} className="bg-green-600 text-white">
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditPayment(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-[#003366]">JazzCash</h3>
                </div>
                <div className="space-y-2">
                  <Label>JazzCash Number</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.jazzCashNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, jazzCashNumber: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-700">{paymentConfig.jazzCashNumber}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-[#003366]">EasyPaisa</h3>
                </div>
                <div className="space-y-2">
                  <Label>EasyPaisa Number</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.easyPaisaNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, easyPaisaNumber: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-700">{paymentConfig.easyPaisaNumber}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <Building className="w-5 h-5 text-[#003366]" />
                  <h3 className="font-semibold text-[#003366]">Bank Transfer</h3>
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.bankName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-700">{paymentConfig.bankName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.bankAccount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankAccount: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-700">{paymentConfig.bankAccount}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Account Title</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.bankTitle}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankTitle: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-700">{paymentConfig.bankTitle}</p>
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
