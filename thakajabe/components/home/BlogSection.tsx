'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  publishedAt: string;
}

interface BlogSectionProps {
  className?: string;
}

export function BlogSection({ className }: BlogSectionProps) {
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Top 10 Hidden Gems in Dhaka for Your Next Stay',
      excerpt: 'Discover the most charming and unique accommodations in Dhaka that offer authentic local experiences.',
      image: '/images/blog/dhaka-gems.jpg',
      readTime: '5 min read',
      publishedAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'A Complete Guide to Cox\'s Bazar Beachfront Stays',
      excerpt: 'Everything you need to know about finding the perfect beachfront accommodation in Cox\'s Bazar.',
      image: '/images/blog/coxs-bazar.jpg',
      readTime: '7 min read',
      publishedAt: '2024-01-10',
    },
    {
      id: '3',
      title: 'Budget-Friendly Family Stays in Chittagong',
      excerpt: 'Find comfortable and affordable accommodations perfect for family trips in Chittagong.',
      image: '/images/blog/chittagong-family.jpg',
      readTime: '4 min read',
      publishedAt: '2024-01-05',
    },
    {
      id: '4',
      title: 'Sylhet Tea Garden Retreats: A Nature Lover\'s Paradise',
      excerpt: 'Experience the serene beauty of Sylhet with these amazing tea garden accommodations.',
      image: '/images/blog/sylhet-tea.jpg',
      readTime: '6 min read',
      publishedAt: '2024-01-01',
    },
  ];

  return (
    <section className={`py-10 md:py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 mb-4">
            Thaka Jabe Stories & Blogs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Read insights, travel guides and tips from our community
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-gray-700">{post.readTime}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-brand transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="group/btn hover:bg-brand hover:text-white hover:border-brand transition-all duration-200"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="group hover:bg-brand hover:text-white hover:border-brand transition-all duration-200"
          >
            View All Stories
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
