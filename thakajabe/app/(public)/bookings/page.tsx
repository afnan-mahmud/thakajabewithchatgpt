'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, MessageCircle, ExternalLink, CreditCard, Star } from 'lucide-react';
import Image from 'next/image';
import { env } from '@/lib/env';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ReviewDialog } from '@/components/room/ReviewDialog';

interface Booking {
  _id: string;
  roomId: {
    _id: string;
    title: string;
    images: Array<{ url: string; w: number; h: number }>;
    locationName: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  amountTk: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  hasReview: boolean;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await api.bookings.list<{ bookings: Booking[] }>();
      
      if (response.success && response.data) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const canReview = (booking: Booking) => {
    const now = new Date();
    const checkOut = new Date(booking.checkOut);
    return (
      booking.status === 'confirmed' &&
      booking.paymentStatus === 'paid' &&
      checkOut < now &&
      !booking.hasReview
    );
  };

  const handleOpenReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewDialogOpen(true);
  };

  const handleReviewSuccess = () => {
    loadBookings(); // Reload bookings to update review status
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
              <Card key={booking._id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                    {/* Room Image */}
                    <div className="relative w-full md:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={booking.roomId.images[0]?.url || '/placeholder-room.jpg'}
                        alt={booking.roomId.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg truncate pr-2">
                          {booking.roomId.title}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{booking.roomId.locationName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-lg font-bold text-brand">
                          ৳{booking.amountTk.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {booking.status === 'confirmed' && booking.paymentStatus === 'unpaid' && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              const paymentUrl = `/payment?bookingId=${booking._id}`;
                              window.location.href = paymentUrl;
                            }}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                        
                        {/* Review Button - Shows only for completed stays */}
                        {canReview(booking) && (
                          <Button 
                            size="sm"
                            variant="default"
                            className="bg-brand hover:bg-brand/90"
                            onClick={() => handleOpenReview(booking)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Write Review
                          </Button>
                        )}
                        
                        {booking.hasReview && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            Reviewed
                          </Badge>
                        )}

                        <Link href={`/room/${booking.roomId._id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Room
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        {selectedBooking && (
          <ReviewDialog
            open={reviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            bookingId={selectedBooking._id}
            roomTitle={selectedBooking.roomId.title}
            onSuccess={handleReviewSuccess}
          />
        )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
