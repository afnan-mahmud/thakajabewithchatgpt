/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost', 
      'thakajabe.com', 
      'api.thakajabe.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'cdn.pixabay.com',
      'images.pexels.com',
      'via.placeholder.com',
      'picsum.photos',
      'source.unsplash.com',
      'images.unsplash.com',
      'plus.unsplash.com',
      'images.unsplash.com',
      'unsplash.com',
      'amazonaws.com',
      's3.amazonaws.com',
      's3-us-west-2.amazonaws.com',
      's3-eu-west-1.amazonaws.com',
      'firebasestorage.googleapis.com',
      'storage.googleapis.com'
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_IMG_BASE_URL: process.env.NEXT_PUBLIC_IMG_BASE_URL,
    NEXT_PUBLIC_FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
    NEXT_PUBLIC_TIKTOK_PIXEL_ID: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_DB_URL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
}

module.exports = nextConfig
