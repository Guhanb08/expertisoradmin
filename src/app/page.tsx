import JobBoard from '@/components/jobs/jobBoard';
import TheHeader from '@/components/jobs/TheHeader';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { userId } = await auth();
/* 
  if (!userId) {
    return redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/overview');
  } */
  return (
    <div className="min-h-screen">
      <TheHeader />
      <div className="pb-8">
        <JobBoard />
      </div>
    </div>
  );
}
