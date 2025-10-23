'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
  className?: string;
}

export function RoomCard({ 
  id, 
  title, 
  location, 
  price, 
  image, 
  rating = 4.5, 
  reviews = 0,
  className 
}: RoomCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Link href={`/room/${id}`} className="block group">
      <div className={cn(
        'relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1',
        className
      )}>
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Heart Icon Overlay */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart 
              className={cn(
                'h-4 w-4 transition-colors',
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
              )} 
            />
          </button>

          {/* Rating Badge */}
          {rating > 0 && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-900">{rating}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-brand transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-bold text-brand">৳{price.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">/night</span>
            </div>
            
            {reviews > 0 && (
              <div className="text-xs text-gray-500">
                ({reviews} reviews)
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
