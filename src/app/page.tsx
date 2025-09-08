import JobBoard from '@/components/jobs/jobBoard';
import TheHeader from '@/components/jobs/TheHeader';

export default function Page() {
  return (
    <div className="min-h-screen">
      <TheHeader />
      <div className="pb-8">
        <JobBoard />
      </div>
    </div>
  );
}
