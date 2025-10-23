'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface HostStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalEarnings: number;
  totalRooms: number;
  activeRooms: number;
}

export interface HostRoom {
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
  createdAt: string;
  updatedAt: string;
}

export interface HostBooking {
  _id: string;
  roomId: {
    _id: string;
    title: string;
    locationName: string;
    images: Array<{ url: string; w: number; h: number }>;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  mode: 'instant' | 'request';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  amountTk: number;
  createdAt: string;
  updatedAt: string;
}

export function useHostStats() {
  const [stats, setStats] = useState<HostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.hosts.stats();
        
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError(response.message || 'Failed to fetch host stats');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useHostRooms() {
  const [rooms, setRooms] = useState<HostRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.hosts.rooms();
        
        if (response.success && response.data) {
          setRooms(response.data);
        } else {
          setError(response.message || 'Failed to fetch host rooms');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return { rooms, loading, error };
}

export function useHostBookings() {
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.hosts.bookings();
        
        if (response.success && response.data) {
          setBookings(response.data);
        } else {
          setError(response.message || 'Failed to fetch host bookings');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return { bookings, loading, error };
}
