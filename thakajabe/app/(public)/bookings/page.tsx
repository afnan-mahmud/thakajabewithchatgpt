'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, MessageCircle, ExternalLink, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { env } from '@/lib/env';
import Link from 'next/link';

interface Booking {
  id: string;
  room: {
    id: string;
    name: string;
    images: string[];
    category: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch from API
      // const response = await api.bookings.list();
      
      // Mock data for demo
      const mockBookings: Booking[] = [
        {
          id: 'BOOKING_001',
          room: {
            id: 'room_001',
            name: 'Cozy Apartment in Dhanmondi',
            images: ['/placeholder-room.jpg'],
            category: 'Apartment',
          },
          checkIn: new Date().toISOString(),
          checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          guests: 2,
          totalAmount: 5000,
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: new Date().toISOString(),
        },
      ];
      
      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your reservations and bookings</p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-4">Start exploring and book your perfect stay</p>
              <Link href="/">
                <Button>Browse Rooms</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    {/* Room Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={booking.room.images[0].startsWith('http') ? booking.room.images[0] : `${env.IMG_BASE_URL}${booking.room.images[0]}`}
                        alt={booking.room.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {booking.room.name}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.room.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="text-lg font-bold text-primary">
                          ৳{booking.totalAmount.toLocaleString()}
                        </div>
                        <div className="flex space-x-2">
                          {booking.status === 'confirmed' && booking.paymentStatus === 'unpaid' && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                const paymentUrl = `/api/payments/ssl/init?bookingId=${booking.id}`;
                                window.location.href = paymentUrl;
                              }}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Proceed to Pay
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message Host
                          </Button>
                          <Link href={`/room/${booking.room.id}`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Room
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
