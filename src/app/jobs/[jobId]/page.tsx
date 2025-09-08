'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Job {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'pending' | 'shortlisted' | 'rejected';
  createdAt: string;
}

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const [jobId, setJobId] = useState<string>('');
  const { user } = useSupabaseUser();
  const { profile, loading: profileLoading } = useUserProfile();
  const router = useRouter();
  const supabase = createClient();

  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  // Resolve params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setJobId(resolvedParams.jobId);
    });
  }, [params]);

  // Fetch job and check if user has applied
  useEffect(() => {
    if (!jobId) return;
    const fetchData = async () => {
      try {
        // Fetch job details
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('is_public', true)
          .single();

        if (jobError) {
          if (jobError.code === 'PGRST116') {
            toast.error('Job not found or is not public');
            router.push('/');
            return;
          }
          throw jobError;
        }

        setJob(jobData);

        // If user is logged in and is a candidate, check if they have applied
        if (user && profile && profile.role === 'candidate') {
          const { data: applicationData, error: applicationError } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', jobId)
            .eq('candidate_id', user.id)
            .single();

          if (applicationError && applicationError.code !== 'PGRST116') {
            throw applicationError;
          }

          if (applicationData) {
            setApplication(applicationData);
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load job details');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, user, profile, supabase, router]);

  const handleApply = async () => {
    if (!user || !profile || profile.role !== 'candidate' || !job) return;

    setApplying(true);
    try {
      const applicationData = {
        candidate_id: user.id,
        job_id: job.id,
        status: 'pending' as const,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) throw error;

      setApplication(data);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      console.error('Error applying for job:', error);
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'shortlisted':
        return <Badge variant="default" className="bg-green-600">Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Not Selected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const isCandidate = profile?.role === 'candidate';
  const hasApplied = !!application;
  const canApply = user && isCandidate && !hasApplied;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <Icons.chevronLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card >
                <CardHeader>
                  {job.thumbnail && (
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-6 overflow-hidden">
                      <img 
                      style={{borderRadius: "10px"}}
                        src={job.thumbnail} 
                        alt={job.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                        <Badge variant={job.isPublic ? "default" : "secondary"}>
                          {job.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-4">Job Description</h3>
                    <div className="whitespace-pre-wrap text-muted-foreground">
                      {job.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Apply for this Job</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!user ? (
                    <div>
                      <Alert>
                        <Icons.user className="h-4 w-4" />
                        <AlertDescription>
                          You need to sign in to apply for this job.
                        </AlertDescription>
                      </Alert>
                      <div className="flex flex-col space-y-2 mt-4">
                        <Button onClick={() => router.push('/signin')}>
                          Sign In
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => router.push('/auth/sign-up')}
                        >
                          Create Account
                        </Button>
                      </div>
                    </div>
                  ) : !isCandidate ? (
                    <Alert>
                      <Icons.warning className="h-4 w-4" />
                      <AlertDescription>
                        Only candidates can apply for jobs. 
                        {profile?.role === 'client' && ' You are signed in as a recruiter.'}
                        {profile?.role === 'admin' && ' You are signed in as an administrator.'}
                      </AlertDescription>
                    </Alert>
                  ) : hasApplied ? (
                    <div>
                      <Alert>
                        <Icons.check className="h-4 w-4" />
                        <AlertDescription>
                          You have already applied for this job.
                        </AlertDescription>
                      </Alert>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Application Status:</span>
                          {getStatusBadge(application.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Applied on: {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => router.push('/dashboard/applications')}
                          className="w-full"
                        >
                          View My Applications
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Alert>
                        <Icons.user className="h-4 w-4" />
                        <AlertDescription>
                          Make sure your resume is up to date before applying.
                        </AlertDescription>
                      </Alert>
                      <div className="flex flex-col space-y-2 mt-4">
                        <Button 
                          onClick={handleApply}
                          disabled={applying}
                          className="w-full"
                        >
                          {applying && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                          Apply Now
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => router.push('/dashboard/resume')}
                          className="w-full"
                        >
                          Update Resume
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Job Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Job ID:</span>
                        <span className="font-mono text-xs">{job.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posted:</span>
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{new Date(job.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
