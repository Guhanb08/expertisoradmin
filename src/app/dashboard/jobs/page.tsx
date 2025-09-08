'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Job {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function JobsPage() {
  const { user } = useSupabaseUser();
  const { profile, loading: profileLoading } = useUserProfile();
  const router = useRouter();
  const supabase = createClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // No role restriction - all authenticated users can view jobs

  // Fetch jobs based on user role
  useEffect(() => {
    if (!user || !profile) return;

    const fetchJobs = async () => {
      try {
        let query = supabase.from('jobs').select('*');
        
        // If recruiter (client), only show their jobs
        if (profile.role === 'client') {
          query = query.eq('created_by', user.id);
        }
        // If candidate, only show public jobs
        else if (profile.role === 'candidate') {
          query = query.eq('is_public', true);
        }
        // If admin, show all jobs (no filter needed)
        
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setJobs(data || []);
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, profile, supabase]);

  const handleDeleteJob = async (jobId: string) => {
    if (!user || !profile) return;

    setDeleting(jobId);
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    } finally {
      setDeleting(null);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isRecruiter = profile.role === 'client';
  const isAdmin = profile.role === 'admin';
  const isCandidate = profile.role === 'candidate';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {isAdmin ? 'All Jobs' : isCandidate ? 'Available Jobs' : 'My Jobs'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAdmin 
                ? 'Manage all jobs in the system'
                : isCandidate
                  ? 'Browse and apply for available job opportunities'
                  : 'Manage your job postings and applications'
              }
            </p>
          </div>
          {isRecruiter && (
            <Button onClick={() => router.push('/dashboard/jobs/create')}>
              <Icons.add className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icons.post className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No jobs found' : isRecruiter ? 'No jobs posted yet' : isCandidate ? 'No jobs available' : 'No jobs available'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : isRecruiter 
                    ? 'Start by posting your first job'
                    : isCandidate
                      ? 'No public jobs are currently available. Check back later for new opportunities.'
                      : 'Jobs will appear here when they are created'
                }
              </p>
              {isRecruiter && !searchTerm && (
                <Button onClick={() => router.push('/dashboard/jobs/create')}>
                  Post Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow pt-0">
                {job.thumbnail && (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={job.thumbnail} 
                      alt={job.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                    <Badge variant={job.is_public ? "default" : "secondary"}>
                      {job.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {job.description}
                  </p>
                  
                  <div className="flex justify-between text-xs text-muted-foreground mb-4">
                    <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(job.updated_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {isRecruiter && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/jobs/${job.id}/edit`)}
                          >
                            <Icons.userPen className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/jobs/${job.id}/applications`)}
                          >
                            <Icons.user className="h-4 w-4 mr-1" />
                            Applications
                          </Button>
                        </>
                      )}
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                        >
                          <Icons.eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                      {isCandidate && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => router.push(`/jobs/${job.id}`)}
                        >
                          <Icons.eye className="h-4 w-4 mr-1" />
                          View & Apply
                        </Button>
                      )}
                    </div>

                    {(isRecruiter || isAdmin) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deleting === job.id}
                          >
                            {deleting === job.id ? (
                              <Icons.spinner className="h-4 w-4 animate-spin" />
                            ) : (
                              <Icons.trash className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{job.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteJob(job.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
