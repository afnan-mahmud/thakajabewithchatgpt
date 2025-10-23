'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  User,
  Phone,
  Mail,
  Calendar,
  Home,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'guest' | 'host' | 'admin';
  totalBookings: number;
  totalSpent: number;
  joinedAt: string;
  lastActive: string;
  isActive: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+8801234567890',
      role: 'guest',
      totalBookings: 5,
      totalSpent: 25000,
      joinedAt: '2024-01-01',
      lastActive: '2024-01-20',
      isActive: true,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+8801234567891',
      role: 'host',
      totalBookings: 0,
      totalSpent: 0,
      joinedAt: '2024-01-15',
      lastActive: '2024-01-18',
      isActive: true,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+8801234567892',
      role: 'guest',
      totalBookings: 12,
      totalSpent: 45000,
      joinedAt: '2023-12-01',
      lastActive: '2024-01-15',
      isActive: true,
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+8801234567893',
      role: 'host',
      totalBookings: 0,
      totalSpent: 0,
      joinedAt: '2024-01-10',
      lastActive: '2024-01-12',
      isActive: false,
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock API call
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      guest: 'bg-blue-100 text-blue-800',
      host: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={variants[role as keyof typeof variants]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage platform users and their activity</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-gray-500 mt-1">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hosts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'host').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Property owners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users.reduce((sum, user) => sum + user.totalBookings, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time bookings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.isActive)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-2" />
                          {user.phone}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Home className="h-4 w-4 mr-2" />
                          {user.totalBookings} {user.totalBookings === 1 ? 'booking' : 'bookings'}
                        </p>
                        {user.totalBookings > 0 && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <DollarSign className="h-4 w-4 mr-2" />
                            ৳{user.totalSpent.toLocaleString()} spent
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined: {format(new Date(user.joinedAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Last active: {format(new Date(user.lastActive), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
