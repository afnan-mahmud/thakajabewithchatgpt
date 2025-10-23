'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { MobileSearchModal } from './MobileSearchModal';

export function MobileSearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full h-12 flex items-center gap-2 rounded-full border bg-white shadow-sm px-4 text-gray-600"
      >
        <Search className="h-5 w-5 text-gray-400" />
        <span className="text-sm font-medium">Start your search</span>
      </button>
      
      <MobileSearchModal open={open} onOpenChange={setOpen} />
    </>
  );
}
