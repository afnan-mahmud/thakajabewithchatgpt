'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Eye, 
  Calendar,
  User,
  Home,
  DollarSign,
  CreditCard,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  roomId: string;
  roomTitle: string;
  roomAddress: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockBookings: Booking[] = [
    {
      id: '1',
      roomId: 'room1',
      roomTitle: 'Luxury Apartment in Gulshan',
      roomAddress: 'House 123, Road 45, Gulshan 1',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userPhone: '+8801234567890',
      checkIn: '2024-01-20',
      checkOut: '2024-01-22',
      guests: 2,
      totalAmount: 16000,
      status: 'confirmed',
      paymentStatus: 'paid',
      transactionId: 'TXN123456789',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      roomId: 'room2',
      roomTitle: 'Cozy Studio in Dhanmondi',
      roomAddress: 'House 456, Road 27, Dhanmondi',
      userId: 'user2',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      userPhone: '+8801234567891',
      checkIn: '2024-01-25',
      checkOut: '2024-01-27',
      guests: 1,
      totalAmount: 11000,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: '2024-01-18',
    },
    {
      id: '3',
      roomId: 'room3',
      roomTitle: 'Family House in Uttara',
      roomAddress: 'House 789, Sector 7, Uttara',
      userId: 'user3',
      userName: 'Mike Johnson',
      userEmail: 'mike@example.com',
      userPhone: '+8801234567892',
      checkIn: '2024-01-10',
      checkOut: '2024-01-12',
      guests: 4,
      totalAmount: 24000,
      status: 'cancelled',
      paymentStatus: 'refunded',
      transactionId: 'TXN987654321',
      createdAt: '2024-01-05',
    },
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Mock API call
      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      unpaid: 'bg-gray-100 text-gray-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800',
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Monitor and manage all bookings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bookings</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
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
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Booking #{booking.id}
                      </h3>
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{booking.roomTitle}</h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {booking.roomAddress}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{booking.userName}</h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-1" />
                          {booking.userEmail}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {booking.userPhone}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <p className="font-medium">Check-in</p>
                          <p>{format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <p className="font-medium">Check-out</p>
                          <p>{format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <p className="font-medium">Guests</p>
                          <p>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <p className="font-medium">Total Amount</p>
                          <p className="font-semibold">৳{booking.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {booking.transactionId && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Transaction ID:</span> {booking.transactionId}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Booking Details - #{booking.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Room Information */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Room Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium">{booking.roomTitle}</h4>
                              <p className="text-sm text-gray-600 mt-1">{booking.roomAddress}</p>
                            </div>
                          </div>
                          
                          {/* Guest Information */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Guest Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium">{booking.userName}</p>
                              <p className="text-sm text-gray-600">{booking.userEmail}</p>
                              <p className="text-sm text-gray-600">{booking.userPhone}</p>
                            </div>
                          </div>
                          
                          {/* Booking Details */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Check-in Date</p>
                                <p>{format(new Date(booking.checkIn), 'EEEE, MMMM dd, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Check-out Date</p>
                                <p>{format(new Date(booking.checkOut), 'EEEE, MMMM dd, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Number of Guests</p>
                                <p>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="font-semibold">৳{booking.totalAmount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                {getStatusBadge(booking.status)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Payment Status</p>
                                {getPaymentStatusBadge(booking.paymentStatus)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Transaction Information */}
                          {booking.transactionId && (
                            <div>
                              <h3 className="font-semibold text-lg mb-2">Transaction Information</h3>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                                <p className="font-mono">{booking.transactionId}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredBookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No bookings found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
