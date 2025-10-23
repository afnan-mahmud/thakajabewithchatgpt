'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Gallery } from '@/components/room/Gallery';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatDrawer } from '@/components/chat/ChatDrawer';
import { api } from '@/lib/api';
import { Room } from '@/lib/store';
import { useAppStore } from '@/lib/store';
import { usePixelTracking } from '@/hooks/usePixelTracking';

// Backend room response interface
interface BackendRoom {
  _id: string;
  title: string;
  description: string;
  address: string;
  locationName: string;
  roomType: 'single' | 'double' | 'family' | 'suite' | 'other';
  amenities: string[];
  basePriceTk: number;
  commissionTk: number;
  totalPriceTk: number;
  images: Array<{
    url: string;
    w: number;
    h: number;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  instantBooking: boolean;
  unavailableDates: string[];
  hostId: {
    _id: string;
    displayName: string;
    locationName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface RoomResponse {
  success: boolean;
  data: BackendRoom;
}
import { 
  Star, 
  MapPin, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Shield, 
  MessageCircle,
  ArrowLeft,
  Calendar,
  User
} from 'lucide-react';

export default function RoomDetails() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const { trackRoomView } = usePixelTracking();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const { selectedDates, setSelectedDates } = useAppStore();

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const response = await api.rooms.get<RoomResponse>(roomId);
      if (response.success && response.data) {
        const backendRoom: BackendRoom = response.data;
        
        // Map backend data to frontend Room structure
        const roomData: Room = {
          id: backendRoom._id,
          name: backendRoom.title,
          description: backendRoom.description,
          price: backendRoom.totalPriceTk,
          originalPrice: backendRoom.basePriceTk,
          images: backendRoom.images.map(img => img.url),
          category: backendRoom.locationName,
          subcategory: backendRoom.roomType,
          stock: 1, // Default for rooms
          ratings: {
            average: 4.5, // Default rating since not in API yet
            count: 25, // Default review count
          },
          sellerId: backendRoom.hostId._id,
          hostId: backendRoom.hostId._id,
          instantBooking: backendRoom.instantBooking,
          isActive: backendRoom.status === 'approved',
          isFeatured: false, // Default
          amenities: backendRoom.amenities,
          createdAt: backendRoom.createdAt,
          updatedAt: backendRoom.updatedAt,
        };
        
        setRoom(roomData);
        trackRoomView(roomData.id, roomData.price);
      } else {
        console.error('Room not found or API error:', response);
        setRoom(null);
      }
    } catch (error) {
      console.error('Failed to load room:', error);
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    if (!room) return;

    try {
      // Create booking
      const bookingData = {
        roomId: room.id,
        checkIn: selectedDates.checkIn.toISOString(),
        checkOut: selectedDates.checkOut.toISOString(),
        guests,
        mode: room.instantBooking ? 'instant' : 'request'
      };

      const response = await api.bookings.create(bookingData);
      
      if (response.success) {
        if (room.instantBooking) {
          // Instant booking - redirect to payment
          const data = response.data as any;
          const paymentUrl = `/api/payments/ssl/init?bookingId=${data.bookingId}`;
          window.location.href = paymentUrl;
        } else {
          // Request mode - show success message
          alert('Booking request submitted! The host will review and respond.');
          router.push('/bookings');
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  // Map backend amenities to display format
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return Wifi;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('car')) return Car;
    if (lowerAmenity.includes('kitchen') || lowerAmenity.includes('cooking')) return Coffee;
    if (lowerAmenity.includes('security') || lowerAmenity.includes('safe')) return Shield;
    return Wifi; // Default icon
  };

  const amenities = room ? room.amenities?.map(amenity => ({
    icon: getAmenityIcon(amenity),
    name: amenity
  })) : [];

  return (
    <Layout>
      <div className="bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Room Details</h1>
          <div></div>
        </div>

        {/* Gallery */}
        <div className="p-4">
          <Gallery images={room.images} alt={room.name} />
        </div>

        {/* Room Info */}
        <div className="p-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{room.name}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{room.category}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{room.ratings.average.toFixed(1)} ({room.ratings.count})</span>
              </div>
            </div>
          </div>

          {/* Host Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{room.hostId ? 'Host' : 'Property Owner'}</h3>
                    <p className="text-sm text-gray-600">Verified Host</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Host
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{room.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Amenities</h2>
            <div className="grid grid-cols-2 gap-3">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <amenity.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Section */}
          <div className="mt-6">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>৳{room.price.toLocaleString()}</span>
                <span className="text-sm font-normal text-gray-600">per night</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Dates</label>
                <DateRangePicker
                  checkIn={selectedDates.checkIn}
                  checkOut={selectedDates.checkOut}
                  onDatesChange={setSelectedDates}
                />
              </div>

              {/* Guests Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Guests</label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{guests}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuests(guests + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Book Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleBooking}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Confirm Booking
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      {/* Chat Drawer */}
      {room && (
        <ChatDrawer
          roomId={room.id}
          hostId={room.hostId || 'unknown'}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </Layout>
  );
}
