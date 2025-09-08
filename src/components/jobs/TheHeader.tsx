'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TheHeader() {
  const router = useRouter();

  const handleSignInClick = () => {
    router.push('/signin');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Board</h1>
          <p className="text-muted-foreground">Browse available job listings</p>
        </div>
        <Button   onClick={handleSignInClick}>
          Sign In
        </Button>
      </div>
    </div>
  );
}