'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  X,
  Upload,
  MapPin,
  Home,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '@/lib/api';

interface RoomFormData {
  title: string;
  description: string;
  address: string;
  locationName: string;
  geo?: {
    lat: number;
    lng: number;
  };
  roomType: 'single' | 'double' | 'family' | 'suite' | 'other';
  amenities: string[];
  basePriceTk: number;
  images: Array<{
    url: string;
    w: number;
    h: number;
  }>;
  instantBooking: boolean;
  unavailableDates: string[];
}

const AMENITIES_OPTIONS = [
  'WiFi', 'Air Conditioning', 'Heating', 'Kitchen', 'Parking', 'Pool', 'Gym',
  'Laundry', 'TV', 'Refrigerator', 'Microwave', 'Balcony', 'Garden', 'Security',
  'Elevator', 'Pet Friendly', 'Smoking Allowed', 'Wheelchair Accessible'
];

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'double', label: 'Double Room' },
  { value: 'family', label: 'Family Room' },
  { value: 'suite', label: 'Suite' },
  { value: 'other', label: 'Other' }
];

export default function NewListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAmenity, setNewAmenity] = useState('');
  
  const [formData, setFormData] = useState<RoomFormData>({
    title: '',
    description: '',
    address: '',
    locationName: '',
    roomType: 'single',
    amenities: [],
    basePriceTk: 0,
    images: [],
    instantBooking: false,
    unavailableDates: []
  });

  const handleInputChange = (field: keyof RoomFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      handleInputChange('amenities', [...formData.amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    handleInputChange('amenities', formData.amenities.filter(a => a !== amenity));
  };

  const handleImageUrlChange = (index: number, field: 'url' | 'w' | 'h', value: string | number) => {
    const newImages = [...formData.images];
    newImages[index] = {
      ...newImages[index],
      [field]: field === 'url' ? value : Number(value)
    };
    handleInputChange('images', newImages);
  };

  const handleAddImage = () => {
    handleInputChange('images', [...formData.images, { url: '', w: 800, h: 600 }]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.address || !formData.locationName) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.images.length === 0) {
      setError('Please add at least one image');
      return;
    }

    if (formData.basePriceTk <= 0) {
      setError('Please enter a valid base price');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.hosts.createRoom(formData);
      
      if (response.success) {
        router.push('/host/listings');
      } else {
        setError(response.message || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Failed to create listing:', error);
      setError('Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-gray-600">Add a new property to your listings</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter property title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your property in detail"
                rows={4}
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="locationName">Location Name *</Label>
                <Input
                  id="locationName"
                  value={formData.locationName}
                  onChange={(e) => handleInputChange('locationName', e.target.value)}
                  placeholder="e.g., Dhaka, Chittagong"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="roomType">Room Type *</Label>
              <Select
                value={formData.roomType}
                onValueChange={(value) => handleInputChange('roomType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="basePriceTk">Base Price (Tk) *</Label>
              <Input
                id="basePriceTk"
                type="number"
                value={formData.basePriceTk}
                onChange={(e) => handleInputChange('basePriceTk', Number(e.target.value))}
                placeholder="Enter base price per night"
                min="0"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="instantBooking"
                checked={formData.instantBooking}
                onCheckedChange={(checked) => handleInputChange('instantBooking', checked)}
              />
              <Label htmlFor="instantBooking">Enable Instant Booking</Label>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(amenity)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex space-x-2">
              <Select value={newAmenity} onValueChange={setNewAmenity}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an amenity" />
                </SelectTrigger>
                <SelectContent>
                  {AMENITIES_OPTIONS.filter(option => !formData.amenities.includes(option)).map((amenity) => (
                    <SelectItem key={amenity} value={amenity}>
                      {amenity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddAmenity} disabled={!newAmenity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.images.map((image, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Image {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Image URL *</Label>
                    <Input
                      value={image.url}
                      onChange={(e) => handleImageUrlChange(index, 'url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>
                  <div>
                    <Label>Width (px)</Label>
                    <Input
                      type="number"
                      value={image.w}
                      onChange={(e) => handleImageUrlChange(index, 'w', e.target.value)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Height (px)</Label>
                    <Input
                      type="number"
                      value={image.h}
                      onChange={(e) => handleImageUrlChange(index, 'h', e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddImage}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
