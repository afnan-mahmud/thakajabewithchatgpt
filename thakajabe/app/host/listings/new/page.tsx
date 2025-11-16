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
  Image as ImageIcon,
  Loader2,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';
import { compressImage, createPreviewURL, formatFileSize } from '@/lib/image-compression';

interface RoomFormData {
  title: string;
  description: string;
  address: string;
  locationName: string;
  locationMapUrl?: string;
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

interface UploadedImage {
  url: string;
  w: number;
  h: number;
  file: File;
  previewUrl: string;
  uploading?: boolean;
  originalSize?: number;
  compressedSize?: number;
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
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const isUploading = uploadedImages.some(img => img.uploading);
  
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


  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = 15 - uploadedImages.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setError('Maximum 15 images allowed');
      return;
    }

    setError(null);

    // Create placeholders for all images immediately
    const startIndex = uploadedImages.length;
    const placeholders: UploadedImage[] = filesToUpload.map((file) => ({
      url: '',
      w: 800,
      h: 600,
      file: file,
      previewUrl: createPreviewURL(file),
      uploading: true,
      originalSize: file.size,
    }));

    setUploadedImages(prev => [...prev, ...placeholders]);

    // Process all images in parallel for much faster upload!
    const uploadPromises = filesToUpload.map(async (file, index) => {
      const currentIndex = startIndex + index;
      
      try {
        // Compress image before upload (optimized for speed)
        const compressedFile = await compressImage(file, {
          maxSizeMB: 1.5,
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8
        });

        const compressedSize = compressedFile.size;

        // Upload compressed image
        const response = await api.uploads.image(compressedFile);
        
        if (response.success && response.data) {
          const uploadedUrl = (response.data as any).url;
          
          // Update the specific image with actual URL
          setUploadedImages(prev => {
            const updated = [...prev];
            if (updated[currentIndex]) {
              updated[currentIndex] = {
                ...updated[currentIndex],
                url: uploadedUrl,
                uploading: false,
                compressedSize: compressedSize,
              };
            }
            return updated;
          });

          // Return the uploaded image data
          return { 
            url: uploadedUrl, 
            w: 800, 
            h: 600,
            success: true,
            index: currentIndex
          };
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      } catch (error) {
        // Mark as failed but keep placeholder
        setUploadedImages(prev => {
          const updated = [...prev];
          if (updated[currentIndex]) {
            updated[currentIndex] = {
              ...updated[currentIndex],
              uploading: false,
            };
          }
          return updated;
        });
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          fileName: file.name,
          index: currentIndex
        };
      }
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    // Process results
    const successfulUploads = results.filter((r): r is { url: string; w: number; h: number; success: true; index: number } => r.success === true);
    const failedUploads = results.filter(r => r.success === false);

    // Update form data with all successful uploads
    if (successfulUploads.length > 0) {
      handleInputChange('images', [
        ...formData.images, 
        ...successfulUploads.map(({ url, w, h }) => ({ url, w, h }))
      ]);
    }

    // Remove failed uploads from the list
    if (failedUploads.length > 0) {
      setUploadedImages(prev => prev.filter((_, i) => 
        !failedUploads.some(failed => failed.index === i)
      ));
      
      const errorMessages = failedUploads.map(f => `${f.fileName}: ${f.error}`).join(', ');
      setError(`Some uploads failed: ${errorMessages}`);
    }
  };

  const handleRemoveUploadedImage = (index: number) => {
    const imageToRemove = uploadedImages[index];
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    
    // Remove from form data
    const newImages = formData.images.filter(img => img.url !== imageToRemove.url);
    handleInputChange('images', newImages);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.address || !formData.locationName) {
      setError('Please fill in all required fields');
      return;
    }

    if (uploadedImages.length === 0) {
      setError('Please upload at least one image');
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
      setError('Failed to create listing. Please try again.');
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
              <Label htmlFor="locationMapUrl">Google Maps URL (Optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="locationMapUrl"
                  value={formData.locationMapUrl || ''}
                  onChange={(e) => handleInputChange('locationMapUrl', e.target.value)}
                  placeholder="https://maps.google.com/@23.8103,90.4125,15z"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                📍 Open Google Maps → Find your location → Click "Share" → Copy link and paste here. The map will be shown to guests after booking confirmation.
              </p>
            </div>

            <div>
              <Label htmlFor="roomType">Room Type *</Label>
              <Select
                value={formData.roomType}
                onValueChange={(value: string) => handleInputChange('roomType', value)}
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
                onCheckedChange={(checked: boolean) => handleInputChange('instantBooking', checked)}
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
            <p className="text-sm text-gray-600">
              Upload up to 15 images of your property. Drag and drop or click to select files.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
                disabled={isUploading || uploadedImages.length >= 15}
              />
              
              <label htmlFor="image-upload" className={`cursor-pointer ${isUploading || uploadedImages.length >= 15 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {isUploading ? '🚀 Uploading images in parallel...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF - Images will be automatically optimized (parallel upload for speed!)
                    </p>
                    <p className="text-xs font-medium text-gray-700 mt-1">
                      {uploadedImages.filter(img => !img.uploading).length}/15 images uploaded
                      {isUploading && (
                        <span className="text-blue-600 animate-pulse">
                          {' '}• {uploadedImages.filter(img => img.uploading).length} uploading simultaneously
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading || uploadedImages.length >= 15}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Choose Images'}
                  </Button>
                </div>
              </label>
            </div>

            {/* Uploaded Images Grid */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                      <img
                        src={image.previewUrl}
                        alt={`Uploaded image ${index + 1}`}
                        className={`w-full h-full object-cover transition-opacity ${
                          image.uploading ? 'opacity-50' : 'opacity-100'
                        }`}
                      />
                      {image.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white rounded-full p-3 shadow-lg">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>
                    {!image.uploading && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveUploadedImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="mt-1 space-y-1">
                      <div className="text-xs text-gray-700 text-center truncate font-medium">
                        {image.file.name}
                      </div>
                      {image.compressedSize && image.originalSize && (
                        <div className="text-xs text-center">
                          <span className="text-red-500 line-through">{formatFileSize(image.originalSize)}</span>
                          <span className="mx-1">→</span>
                          <span className="text-green-600 font-semibold">{formatFileSize(image.compressedSize)}</span>
                          <div className="text-green-600 font-medium">
                            {Math.round((1 - image.compressedSize / image.originalSize) * 100)}% smaller
                          </div>
                        </div>
                      )}
                      {image.uploading && (
                        <div className="text-xs text-blue-600 text-center font-medium animate-pulse">
                          Compressing & uploading...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
