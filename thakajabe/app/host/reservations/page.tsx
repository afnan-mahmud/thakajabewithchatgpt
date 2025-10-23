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
  Check, 
  X, 
  Calendar,
  User,
  Home,
  DollarSign,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  roomId: string;
  roomTitle: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  specialRequests?: string;
}

export default function HostReservations() {
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
      userId: 'user1',
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      guestPhone: '+8801234567890',
      checkIn: '2024-01-25',
      checkOut: '2024-01-27',
      guests: 2,
      totalAmount: 16000,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2024-01-20',
      specialRequests: 'Late check-in requested',
    },
    {
      id: '2',
      roomId: 'room2',
      roomTitle: 'Cozy Studio in Dhanmondi',
      userId: 'user2',
      guestName: 'Jane Smith',
      guestEmail: 'jane@example.com',
      guestPhone: '+8801234567891',
      checkIn: '2024-01-28',
      checkOut: '2024-01-30',
      guests: 1,
      totalAmount: 11000,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: '2024-01-21',
    },
    {
      id: '3',
      roomId: 'room3',
      roomTitle: 'Family House in Uttara',
      userId: 'user3',
      guestName: 'Mike Johnson',
      guestEmail: 'mike@example.com',
      guestPhone: '+8801234567892',
      checkIn: '2024-02-01',
      checkOut: '2024-02-03',
      guests: 4,
      totalAmount: 24000,
      status: 'cancelled',
      paymentStatus: 'refunded',
      createdAt: '2024-01-22',
    },
    {
      id: '4',
      roomId: 'room1',
      roomTitle: 'Luxury Apartment in Gulshan',
      userId: 'user4',
      guestName: 'Sarah Wilson',
      guestEmail: 'sarah@example.com',
      guestPhone: '+8801234567893',
      checkIn: '2024-01-15',
      checkOut: '2024-01-17',
      guests: 2,
      totalAmount: 16000,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: '2024-01-10',
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
        booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleApprove = async (bookingId: string) => {
    try {
      // Mock API call
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'confirmed' as const }
          : booking
      ));
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      // Mock API call
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ));
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600">Manage your property bookings</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ৳{bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">All bookings</p>
          </CardContent>
        </Card>
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
                          <User className="h-4 w-4 mr-1" />
                          {booking.guestName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {booking.guestEmail}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {booking.guestPhone}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-4 text-sm">
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
                        </div>
                        <div className="flex items-center mt-2">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <p className="text-sm">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                        </div>
                        <div className="flex items-center mt-1">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                          <p className="font-semibold">৳{booking.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {booking.specialRequests && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Special Requests:</strong> {booking.specialRequests}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Booked: {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
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
                          <DialogTitle>Booking Details - #{booking.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Guest Information */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Guest Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium">{booking.guestName}</p>
                              <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                              <p className="text-sm text-gray-600">{booking.guestPhone}</p>
                            </div>
                          </div>
                          
                          {/* Booking Details */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Property</p>
                                <p>{booking.roomTitle}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="font-semibold">৳{booking.totalAmount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Check-in</p>
                                <p>{format(new Date(booking.checkIn), 'EEEE, MMMM dd, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Check-out</p>
                                <p>{format(new Date(booking.checkOut), 'EEEE, MMMM dd, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Guests</p>
                                <p>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                {getStatusBadge(booking.status)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Special Requests */}
                          {booking.specialRequests && (
                            <div>
                              <h3 className="font-semibold text-lg mb-2">Special Requests</h3>
                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="text-sm">{booking.specialRequests}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(booking.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(booking.id)}
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
