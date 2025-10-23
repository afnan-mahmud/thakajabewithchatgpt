'use client';

import { SectionHeader } from '@/components/home/SectionHeader';
import { RoomRail } from '@/components/home/RoomRail';
import { WhyChoose } from '@/components/home/WhyChoose';
import { DownloadApp } from '@/components/home/DownloadApp';
import { BlogSection } from '@/components/home/BlogSection';
import { PolicyLinks } from '@/components/home/PolicyLinks';
import { useRooms, Room } from '@/lib/hooks/useRooms';
import { Skeleton } from '@/components/ui/skeleton';

function RoomRailSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-72">
          <Skeleton className="w-full h-48 rounded-xl mb-3" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

export default function HomePageContent() {
  // Fetch different categories of rooms
  const { rooms: bangladeshRooms, loading: loadingBangladesh, error: errorBangladesh, refetch: refetchBangladesh } = useRooms({
    limit: 6,
    status: 'approved',
    location: 'bangladesh'
  });

  const { rooms: familyRooms, loading: loadingFamily, error: errorFamily, refetch: refetchFamily } = useRooms({
    limit: 6,
    status: 'approved',
    roomType: 'family'
  });

  const { rooms: singleRooms, loading: loadingSingle, error: errorSingle, refetch: refetchSingle } = useRooms({
    limit: 6,
    status: 'approved',
    roomType: 'single'
  });

  const { rooms: suiteRooms, loading: loadingSuite, error: errorSuite, refetch: refetchSuite } = useRooms({
    limit: 6,
    status: 'approved',
    roomType: 'suite'
  });

  const { rooms: dhakaRooms, loading: loadingDhaka, error: errorDhaka, refetch: refetchDhaka } = useRooms({
    limit: 6,
    status: 'approved',
    location: 'dhaka'
  });

  const { rooms: chittagongRooms, loading: loadingChittagong, error: errorChittagong, refetch: refetchChittagong } = useRooms({
    limit: 6,
    status: 'approved',
    location: 'chittagong'
  });

  // Convert API rooms to the format expected by RoomRail
  const convertRooms = (rooms: Room[]) => {
    return rooms.map(room => ({
      id: room._id,
      title: room.title,
      location: room.locationName,
      price: room.totalPriceTk,
      image: room.images[0]?.url || '/images/placeholder-room.jpg',
      rating: 4.5, // Default rating since we don't have this in the API yet
      reviews: Math.floor(Math.random() * 100) + 10, // Mock reviews count
    }));
  };

  return (
    <div className="container space-y-14 py-8 md:py-12">
      {/* Bangladesh Gateways */}
      <SectionHeader 
        title="Bangladesh Gateways" 
        subtitle="Discover the best accommodations across Bangladesh"
        viewAllHref="/search?location=bangladesh"
      />
      {loadingBangladesh ? (
        <RoomRailSkeleton />
      ) : errorBangladesh ? (
        <ErrorState message={errorBangladesh} onRetry={refetchBangladesh} />
      ) : (
        <RoomRail items={convertRooms(bangladeshRooms)} />
      )}

      {/* Signature Apartments */}
      <SectionHeader 
        title="Signature Apartments" 
        subtitle="Premium accommodations with exceptional amenities"
        viewAllHref="/search?type=family"
      />
      {loadingFamily ? (
        <RoomRailSkeleton />
      ) : errorFamily ? (
        <ErrorState message={errorFamily} onRetry={refetchFamily} />
      ) : (
        <RoomRail items={convertRooms(familyRooms)} />
      )}

      {/* Dhaka Homes */}
      <SectionHeader 
        title="Dhaka Homes" 
        subtitle="Experience the capital city like a local"
        viewAllHref="/search?location=dhaka"
      />
      {loadingDhaka ? (
        <RoomRailSkeleton />
      ) : errorDhaka ? (
        <ErrorState message={errorDhaka} onRetry={refetchDhaka} />
      ) : (
        <RoomRail items={convertRooms(dhakaRooms)} />
      )}

      {/* Chittagong Comfort Homes */}
      <SectionHeader 
        title="Chittagong Comfort Homes" 
        subtitle="Relax in the port city's finest accommodations"
        viewAllHref="/search?location=chittagong"
      />
      {loadingChittagong ? (
        <RoomRailSkeleton />
      ) : errorChittagong ? (
        <ErrorState message={errorChittagong} onRetry={refetchChittagong} />
      ) : (
        <RoomRail items={convertRooms(chittagongRooms)} />
      )}

      {/* Studio Apartments */}
      <SectionHeader 
        title="Studio Apartments" 
        subtitle="Perfect for solo travelers and short stays"
        viewAllHref="/search?type=single"
      />
      {loadingSingle ? (
        <RoomRailSkeleton />
      ) : errorSingle ? (
        <ErrorState message={errorSingle} onRetry={refetchSingle} />
      ) : (
        <RoomRail items={convertRooms(singleRooms)} />
      )}

      {/* Small Gatherings */}
      <SectionHeader 
        title="Small Gatherings" 
        subtitle="Spaces perfect for events and group stays"
        viewAllHref="/search?type=suite"
      />
      {loadingSuite ? (
        <RoomRailSkeleton />
      ) : errorSuite ? (
        <ErrorState message={errorSuite} onRetry={refetchSuite} />
      ) : (
        <RoomRail items={convertRooms(suiteRooms)} />
      )}

      {/* Why Choose Section */}
      <WhyChoose />

      {/* Download App Section */}
      <DownloadApp />

      {/* Blog Section */}
      <BlogSection />

      {/* Policy Links */}
      <div className="py-10 md:py-16 bg-gray-50 -mx-4 md:-mx-6 px-4 md:px-6">
        <PolicyLinks />
      </div>
    </div>
  );
}
