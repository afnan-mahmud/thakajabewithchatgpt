'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadField } from '@/components/ui/UploadField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Home, MapPin, Phone, User, FileText, Mail, Lock } from 'lucide-react';
import { api, ApiResponse } from '@/lib/api';

const hostApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  whatsapp: z.string().min(10, 'Please enter a valid WhatsApp number'),
  location: z.string().min(5, 'Please enter a valid location'),
  mapLink: z.string().url('Please enter a valid map link'),
});

type HostApplicationForm = z.infer<typeof hostApplicationSchema>;

export default function JoinHostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostApplicationForm>({
    resolver: zodResolver(hostApplicationSchema),
  });

  const onSubmit = async (data: HostApplicationForm) => {
    if (!nidFront || !nidBack) {
      alert('Please upload both NID front and back images');
      return;
    }

    try {
      setSubmitting(true);
      
      // Step 1: Upload NID images using public route
      const [nidFrontResponse, nidBackResponse] = await Promise.all([
        api.uploads.image(nidFront, true), // Use public route
        api.uploads.image(nidBack, true), // Use public route
      ]);

      if (!nidFrontResponse.success) {
        throw new Error(nidFrontResponse.error ?? 'Failed to upload NID front image');
      }

      if (!nidBackResponse.success) {
        // Clean up the first upload if the second fails
        try {
          await api.uploads.delete((nidFrontResponse.data as any).filename);
        } catch (cleanupError) {
          // Cleanup failed
        }
        throw new Error(nidBackResponse.error ?? 'Failed to upload NID back image');
      }

      // Step 2: Register user and create host profile in one step
      const registerResponse: ApiResponse = await api.auth.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        isHost: true,
        hostData: {
          displayName: data.name,
          phone: data.phone,
          whatsapp: data.whatsapp,
          locationName: data.location,
          locationMapUrl: data.mapLink,
          nidFrontUrl: (nidFrontResponse.data as any).url,
          nidBackUrl: (nidBackResponse.data as any).url,
        }
      });

      if (!registerResponse.success) {
        if (registerResponse.message?.includes('already exists')) {
          // User already exists, proceed to login
        } else {
          const errorMessage = registerResponse.error ?? registerResponse.message ?? 'Registration failed';
          alert(errorMessage);
          return;
        }
      }

      // Step 3: Sign in
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        alert('Login failed: ' + signInResult.error);
        return;
      }

      // Success
      setApplicationSubmitted(true);
      alert('Host application submitted successfully! An admin will review your application and get back to you within 24-48 hours.');

    } catch (error) {
      alert('Failed to submit application: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:py-8 md:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
        {/* Container with max width for desktop */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Home className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join as a Host
            </h1>
            <p className="text-gray-700 text-base md:text-lg font-medium">Start earning by hosting your space</p>
          </div>

          {/* Desktop: Side-by-side layout | Mobile: Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Benefits - Takes 1 column on desktop */}
            <div className="lg:col-span-1">
              <Card className="h-full border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/50 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl md:text-2xl">Why Host with Thaka Jabe?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 border border-green-200 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-base text-green-900">Earn extra income</p>
                      <p className="text-sm text-green-700">Turn your space into a source of income</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-base text-blue-900">Flexible hosting</p>
                      <p className="text-sm text-blue-700">Host when you want, how you want</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50 border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-base text-orange-900">24/7 support</p>
                      <p className="text-sm text-orange-700">We're here to help you succeed</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-purple-50 border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-base text-purple-900">Secure payments</p>
                      <p className="text-sm text-purple-700">Get paid securely and on time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Application Form - Takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-blue-200 bg-white shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl md:text-2xl">Host Application Form</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Personal Information */}
                    <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
                      <h3 className="font-semibold text-lg md:text-xl flex items-center text-blue-900">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        Personal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Full Name *</label>
                          <Input
                            {...register('name')}
                            placeholder="Enter your full name"
                            className={errors.name ? 'border-red-500' : ''}
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Email Address *</label>
                          <Input
                            {...register('email')}
                            type="email"
                            placeholder="Enter your email address"
                            className={errors.email ? 'border-red-500' : ''}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Password *</label>
                          <Input
                            {...register('password')}
                            type="password"
                            placeholder="Enter your password (min 6 characters)"
                            className={errors.password ? 'border-red-500' : ''}
                          />
                          {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Phone Number *</label>
                          <Input
                            {...register('phone')}
                            placeholder="+880 1234 567890"
                            className={errors.phone ? 'border-red-500' : ''}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">WhatsApp Number *</label>
                          <Input
                            {...register('whatsapp')}
                            placeholder="+880 1234 567890"
                            className={errors.whatsapp ? 'border-red-500' : ''}
                          />
                          {errors.whatsapp && (
                            <p className="text-red-500 text-sm mt-1">{errors.whatsapp.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
                      <h3 className="font-semibold text-lg md:text-xl flex items-center text-green-900">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        Location Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Property Location *</label>
                          <Input
                            {...register('location')}
                            placeholder="Enter your property address"
                            className={errors.location ? 'border-red-500' : ''}
                          />
                          {errors.location && (
                            <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Google Maps Link *</label>
                          <Input
                            {...register('mapLink')}
                            placeholder="https://maps.google.com/..."
                            className={errors.mapLink ? 'border-red-500' : ''}
                          />
                          {errors.mapLink && (
                            <p className="text-red-500 text-sm mt-1">{errors.mapLink.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document Upload */}
                    <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500">
                      <h3 className="font-semibold text-lg md:text-xl flex items-center text-orange-900">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        Required Documents
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">NID Front *</label>
                          <UploadField
                            onFileSelect={setNidFront}
                            accept="image/*"
                            maxSize={5 * 1024 * 1024} // 5MB
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">NID Back *</label>
                          <UploadField
                            onFileSelect={setNidBack}
                            accept="image/*"
                            maxSize={5 * 1024 * 1024} // 5MB
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                      size="lg"
                      disabled={submitting || applicationSubmitted}
                    >
                      {submitting 
                        ? '🚀 Submitting Application...' 
                        : applicationSubmitted 
                          ? '✅ Application Submitted' 
                          : '🎉 Submit Application'
                      }
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Terms */}
          <div className="text-center text-sm md:text-base max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border-2 border-purple-200 shadow-md">
              <p className="text-gray-700">
                By submitting this application, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors">
                  Terms of Service
                </a>
                {', '}
                <a href="/privacy" className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors">
                  Privacy Policy
                </a>
                {' and '}
                <a href="/refund" className="text-pink-600 hover:text-pink-800 font-semibold hover:underline transition-colors">
                  Refund Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
