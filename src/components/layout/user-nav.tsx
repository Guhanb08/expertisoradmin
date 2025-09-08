'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import { useUserProfile } from '@/hooks/use-user-profile';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function UserNav() {
  const { user, loading } = useSupabaseUser();
  const { profile } = useUserProfile();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      router.push('/signin');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const getInitials = (email: string) => {
    if (email.includes('@')) {
      const username = email.split('@')[0];
      return username.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getUserRole = () => {
    if (!profile) return 'User';
    
    switch (profile.role) {
      case 'admin': return 'Admin';
      case 'candidate': return 'Candidate';
      case 'client': return 'Client';
      default: return 'User';
    }
  };

  const getUserDisplayName = () => {
    return profile?.fullName || user?.email || 'User';
  };

  if (loading) {
    return (
      <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (user) {
    const initials = getInitials(user.email || '');
    const role = getUserRole();
    const displayName = getUserDisplayName();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-56'
          align='end'
          sideOffset={10}
          forceMount
        >
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-none font-medium'>
                {displayName}
              </p>
              <p className='text-muted-foreground text-xs leading-none'>
                {role} • {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Show sign-in button if not authenticated
  return (
    <Button onClick={() => router.push('/signin')} variant="outline" size="sm">
      Sign In
    </Button>
  );
}
