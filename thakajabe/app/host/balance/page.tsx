'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'mobile_banking' | 'cash';
  provider?: string;
  accountNumber?: string;
  mobileNumber?: string;
  bankName?: string;
  isDefault: boolean;
  createdAt: string;
}

interface PayoutRequest {
  id: string;
  method: string;
  amountTk: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  accountDetails: string;
}

interface Earnings {
  totalEarnings: number;
  availableBalance: number;
  pendingAmount: number;
  monthlyEarnings: number;
  totalPayouts: number;
}

export default function HostBalance() {
  const [earnings, setEarnings] = useState<Earnings>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingAmount: 0,
    monthlyEarnings: 0,
    totalPayouts: 0,
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [showRequestPayout, setShowRequestPayout] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'bank_transfer' as 'bank_transfer' | 'mobile_banking' | 'cash',
    provider: '',
    accountNumber: '',
    mobileNumber: '',
    bankName: '',
  });
  const [payoutRequest, setPayoutRequest] = useState({
    method: '',
    amount: '',
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockEarnings: Earnings = {
    totalEarnings: 125000,
    availableBalance: 45000,
    pendingAmount: 15000,
    monthlyEarnings: 25000,
    totalPayouts: 80000,
  };

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'bank_transfer',
      bankName: 'Dutch-Bangla Bank',
      accountNumber: '1234567890',
      isDefault: true,
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      type: 'mobile_banking',
      provider: 'bKash',
      mobileNumber: '+8801234567890',
      isDefault: false,
      createdAt: '2024-01-10',
    },
  ];

  const mockPayoutRequests: PayoutRequest[] = [
    {
      id: '1',
      method: 'Dutch-Bangla Bank - 1234567890',
      amountTk: 25000,
      status: 'approved',
      requestedAt: '2024-01-15',
      processedAt: '2024-01-16',
      accountDetails: 'Dutch-Bangla Bank - 1234567890',
    },
    {
      id: '2',
      method: 'bKash - +8801234567890',
      amountTk: 15000,
      status: 'pending',
      requestedAt: '2024-01-20',
      accountDetails: 'bKash - +8801234567890',
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock API calls
      setEarnings(mockEarnings);
      setPaymentMethods(mockPaymentMethods);
      setPayoutRequests(mockPayoutRequests);
    } catch (error) {
      console.error('Failed to fetch balance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newMethod.type || (!newMethod.accountNumber && !newMethod.mobileNumber)) {
      return;
    }

    try {
      const method: PaymentMethod = {
        id: Date.now().toString(),
        ...newMethod,
        isDefault: paymentMethods.length === 0,
        createdAt: new Date().toISOString(),
      };

      setPaymentMethods(prev => [...prev, method]);
      setNewMethod({
        type: 'bank_transfer',
        provider: '',
        accountNumber: '',
        mobileNumber: '',
        bankName: '',
      });
      setShowAddMethod(false);

      // Mock API call
      console.log('Adding payment method:', method);
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutRequest.method || !payoutRequest.amount) {
      return;
    }

    try {
      const method = paymentMethods.find(m => m.id === payoutRequest.method);
      const request: PayoutRequest = {
        id: Date.now().toString(),
        method: method ? `${method.bankName || method.provider} - ${method.accountNumber || method.mobileNumber}` : '',
        amountTk: parseFloat(payoutRequest.amount),
        status: 'pending',
        requestedAt: new Date().toISOString(),
        accountDetails: method ? `${method.bankName || method.provider} - ${method.accountNumber || method.mobileNumber}` : '',
      };

      setPayoutRequests(prev => [request, ...prev]);
      setPayoutRequest({ method: '', amount: '' });
      setShowRequestPayout(false);

      // Mock API call
      console.log('Requesting payout:', request);
    } catch (error) {
      console.error('Failed to request payout:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return <CreditCard className="h-4 w-4" />;
      case 'mobile_banking':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Balance & Payouts</h1>
          <p className="text-gray-600">Manage your earnings and payment methods</p>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ৳{earnings.availableBalance.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ৳{earnings.totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ৳{earnings.pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ৳{earnings.monthlyEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Current month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Methods</CardTitle>
              <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Payment Type</Label>
                      <Select value={newMethod.type} onValueChange={(value: any) => setNewMethod(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newMethod.type === 'bank_transfer' && (
                      <>
                        <div>
                          <Label>Bank Name</Label>
                          <Input
                            value={newMethod.bankName}
                            onChange={(e) => setNewMethod(prev => ({ ...prev, bankName: e.target.value }))}
                            placeholder="e.g., Dutch-Bangla Bank"
                          />
                        </div>
                        <div>
                          <Label>Account Number</Label>
                          <Input
                            value={newMethod.accountNumber}
                            onChange={(e) => setNewMethod(prev => ({ ...prev, accountNumber: e.target.value }))}
                            placeholder="Enter account number"
                          />
                        </div>
                      </>
                    )}

                    {newMethod.type === 'mobile_banking' && (
                      <>
                        <div>
                          <Label>Provider</Label>
                          <Select value={newMethod.provider} onValueChange={(value) => setNewMethod(prev => ({ ...prev, provider: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bKash">bKash</SelectItem>
                              <SelectItem value="Nagad">Nagad</SelectItem>
                              <SelectItem value="Rocket">Rocket</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Mobile Number</Label>
                          <Input
                            value={newMethod.mobileNumber}
                            onChange={(e) => setNewMethod(prev => ({ ...prev, mobileNumber: e.target.value }))}
                            placeholder="+8801234567890"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddMethod(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPaymentMethod}>
                        Add Method
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getMethodIcon(method.type)}
                    <div>
                      <p className="font-medium text-sm">
                        {method.bankName || method.provider}
                      </p>
                      <p className="text-xs text-gray-500">
                        {method.accountNumber || method.mobileNumber}
                      </p>
                    </div>
                    {method.isDefault && (
                      <Badge variant="outline" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {paymentMethods.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payment methods added</p>
                  <p className="text-sm">Add a payment method to receive payouts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payout Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payout Requests</CardTitle>
              <Dialog open={showRequestPayout} onOpenChange={setShowRequestPayout}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={earnings.availableBalance <= 0 || paymentMethods.length === 0}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Request Payout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Payout</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Available Balance</Label>
                      <p className="text-2xl font-bold text-green-600">
                        ৳{earnings.availableBalance.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <Label>Payment Method</Label>
                      <Select value={payoutRequest.method} onValueChange={(value) => setPayoutRequest(prev => ({ ...prev, method: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.bankName || method.provider} - {method.accountNumber || method.mobileNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Amount (Tk)</Label>
                      <Input
                        type="number"
                        value={payoutRequest.amount}
                        onChange={(e) => setPayoutRequest(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Enter amount"
                        max={earnings.availableBalance}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum: ৳{earnings.availableBalance.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowRequestPayout(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleRequestPayout} disabled={!payoutRequest.method || !payoutRequest.amount}>
                        Request Payout
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payoutRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">Request #{request.id}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600">{request.method}</p>
                    <p className="text-lg font-semibold">৳{request.amountTk.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      Requested: {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                    </p>
                    {request.processedAt && (
                      <p className="text-xs text-gray-500">
                        Processed: {format(new Date(request.processedAt), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {payoutRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payout requests</p>
                  <p className="text-sm">Request a payout when you have available balance</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock transaction data */}
            {[
              { id: '1', type: 'booking', amount: 8000, description: 'Booking payment - Luxury Apartment', date: '2024-01-20', status: 'completed' },
              { id: '2', type: 'payout', amount: -25000, description: 'Payout to Dutch-Bangla Bank', date: '2024-01-18', status: 'completed' },
              { id: '3', type: 'booking', amount: 5500, description: 'Booking payment - Cozy Studio', date: '2024-01-15', status: 'completed' },
              { id: '4', type: 'payout', amount: -15000, description: 'Payout to bKash', date: '2024-01-10', status: 'completed' },
            ].map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  {transaction.type === 'booking' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <DollarSign className="h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}৳{Math.abs(transaction.amount).toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
