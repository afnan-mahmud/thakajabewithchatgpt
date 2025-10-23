'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Eye, 
  Check, 
  X, 
  User,
  DollarSign,
  Calendar,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentRequest {
  id: string;
  hostId: string;
  hostName: string;
  hostEmail: string;
  method: 'bank_transfer' | 'mobile_banking' | 'cash';
  amountTk: number;
  status: 'pending' | 'approved' | 'rejected';
  accountDetails: {
    bankName?: string;
    accountNumber?: string;
    mobileNumber?: string;
    provider?: string;
  };
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export default function AdminPayments() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PaymentRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockPaymentRequests: PaymentRequest[] = [
    {
      id: '1',
      hostId: 'host1',
      hostName: 'John Doe',
      hostEmail: 'john@example.com',
      method: 'bank_transfer',
      amountTk: 25000,
      status: 'pending',
      accountDetails: {
        bankName: 'Dutch-Bangla Bank',
        accountNumber: '1234567890',
      },
      requestedAt: '2024-01-20T10:30:00Z',
      notes: 'Monthly earnings payout',
    },
    {
      id: '2',
      hostId: 'host2',
      hostName: 'Jane Smith',
      hostEmail: 'jane@example.com',
      method: 'mobile_banking',
      amountTk: 15000,
      status: 'approved',
      accountDetails: {
        mobileNumber: '+8801234567890',
        provider: 'bKash',
      },
      requestedAt: '2024-01-18T14:20:00Z',
      processedAt: '2024-01-19T09:15:00Z',
      notes: 'Commission payout',
    },
    {
      id: '3',
      hostId: 'host3',
      hostName: 'Mike Johnson',
      hostEmail: 'mike@example.com',
      method: 'mobile_banking',
      amountTk: 30000,
      status: 'rejected',
      accountDetails: {
        mobileNumber: '+8801234567891',
        provider: 'Nagad',
      },
      requestedAt: '2024-01-15T16:45:00Z',
      processedAt: '2024-01-16T11:30:00Z',
      notes: 'Incorrect account details provided',
    },
  ];

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [paymentRequests, searchTerm, statusFilter]);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      // Mock API call
      setPaymentRequests(mockPaymentRequests);
    } catch (error) {
      console.error('Failed to fetch payment requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = paymentRequests;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.hostEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async (requestId: string) => {
    try {
      // Mock API call
      setPaymentRequests(requests => 
        requests.map(request => 
          request.id === requestId 
            ? { 
                ...request, 
                status: 'approved' as const,
                processedAt: new Date().toISOString()
              }
            : request
        )
      );
      
      // In real implementation, this would:
      // 1. Create a negative ledger entry
      // 2. Update the request status
      // 3. Process the actual payment
    } catch (error) {
      console.error('Failed to approve payment request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      // Mock API call
      setPaymentRequests(requests => 
        requests.map(request => 
          request.id === requestId 
            ? { 
                ...request, 
                status: 'rejected' as const,
                processedAt: new Date().toISOString()
              }
            : request
        )
      );
    } catch (error) {
      console.error('Failed to reject payment request:', error);
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

  const getMethodBadge = (method: string) => {
    const variants = {
      bank_transfer: 'bg-blue-100 text-blue-800',
      mobile_banking: 'bg-green-100 text-green-800',
      cash: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={variants[method as keyof typeof variants]}>
        {method.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Requests</h1>
          <p className="text-gray-600">Manage host payout requests</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentRequests.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {paymentRequests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ৳{paymentRequests.reduce((sum, r) => sum + r.amountTk, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">All requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ৳{paymentRequests
                .filter(r => r.status === 'pending')
                .reduce((sum, r) => sum + r.amountTk, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Requests</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request #{request.id}
                      </h3>
                      {getStatusBadge(request.status)}
                      {getMethodBadge(request.method)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{request.hostName}</h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <User className="h-4 w-4 mr-1" />
                          {request.hostEmail}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-lg font-semibold text-gray-900 flex items-center">
                          <DollarSign className="h-5 w-5 mr-1" />
                          ৳{request.amountTk.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(request.requestedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">Account Details:</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {request.method === 'bank_transfer' && (
                          <div className="space-y-1">
                            <p className="text-sm"><span className="font-medium">Bank:</span> {request.accountDetails.bankName}</p>
                            <p className="text-sm"><span className="font-medium">Account:</span> {request.accountDetails.accountNumber}</p>
                          </div>
                        )}
                        {request.method === 'mobile_banking' && (
                          <div className="space-y-1">
                            <p className="text-sm"><span className="font-medium">Provider:</span> {request.accountDetails.provider}</p>
                            <p className="text-sm"><span className="font-medium">Number:</span> {request.accountDetails.mobileNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {request.notes}
                        </p>
                      </div>
                    )}
                    
                    {request.processedAt && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Processed:</span> {format(new Date(request.processedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Payment Request Details - #{request.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Host Information */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Host Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium">{request.hostName}</p>
                              <p className="text-sm text-gray-600">{request.hostEmail}</p>
                            </div>
                          </div>
                          
                          {/* Payment Details */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Payment Details</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">Amount:</span>
                                <span className="font-semibold">৳{request.amountTk.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Method:</span>
                                <span>{getMethodBadge(request.method)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Status:</span>
                                <span>{getStatusBadge(request.status)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Account Details */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Account Details</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              {request.method === 'bank_transfer' && (
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium">Bank Name:</span>
                                    <p className="text-sm">{request.accountDetails.bankName}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Account Number:</span>
                                    <p className="text-sm font-mono">{request.accountDetails.accountNumber}</p>
                                  </div>
                                </div>
                              )}
                              {request.method === 'mobile_banking' && (
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium">Provider:</span>
                                    <p className="text-sm">{request.accountDetails.provider}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Mobile Number:</span>
                                    <p className="text-sm font-mono">{request.accountDetails.mobileNumber}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Notes */}
                          {request.notes && (
                            <div>
                              <h3 className="font-semibold text-lg mb-2">Notes</h3>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm">{request.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {request.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No payment requests found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
