'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, CheckCircle, XCircle, Clock,
  AlertCircle, CreditCard, Banknote,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';

export default function ApplicationsList() {
  const applications = useAppStore((s) => s.applications);
  const user = useAppStore((s) => s.user);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const userApps = user?.role === 'admin'
    ? applications
    : applications.filter((a) => a.userId === user?.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'in-review': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved / منظور</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected / مسترد</Badge>;
      case 'in-review':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">In Review / جائزہ</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Pending / زیر عمل</Badge>;
    }
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

      <div>
        <h2 className="text-2xl font-bold text-[#003366]">
          {user?.role === 'admin' ? 'All Applications / تمام درخواستیں' : 'My Applications / میری درخواستیں'}
        </h2>
        <p className="text-gray-400">
          Total: {userApps.length} applications
        </p>
      </div>

      {userApps.length === 0 ? (
        <Card className="premium-card border-0">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <p className="text-xl text-gray-400">Koi application nahi / No applications yet</p>
            <Button
              onClick={() => setActiveView('services')}
              className="mt-4 bg-[#003366] text-white"
            >
              Abhi apply karein / Apply Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {userApps.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="premium-card border-0">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(app.status)}
                      <div>
                        <h3 className="font-bold text-[#003366] text-lg">{app.serviceName}</h3>
                        <p className="text-xs text-gray-400">
                          ID: {app.id.slice(0, 12)}... | {new Date(app.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {app.formData.fullName && (
                      <div>
                        <p className="text-xs text-gray-400">Name / نام</p>
                        <p className="text-sm font-medium text-gray-700">{app.formData.fullName}</p>
                      </div>
                    )}
                    {app.formData.cnic && (
                      <div>
                        <p className="text-xs text-gray-400">CNIC / شناختی</p>
                        <p className="text-sm font-medium text-gray-700">{app.formData.cnic}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-400">Amount / رقم</p>
                      <p className="text-sm font-bold text-[#003366] flex items-center gap-1">
                        <Banknote className="w-3 h-3" />
                        Rs. {app.amount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Payment / ادائیگی</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        {app.paymentStatus === 'paid' ? (
                          <><CheckCircle className="w-3 h-3 text-green-600" /> Paid</>
                        ) : (
                          <><CreditCard className="w-3 h-3 text-red-500" /> Unpaid</>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
