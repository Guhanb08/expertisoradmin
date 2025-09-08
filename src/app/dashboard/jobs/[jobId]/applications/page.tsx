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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Job {
  id: string;
  title: string;
  description: string;
  createdBy: string;
}

interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'pending' | 'shortlisted' | 'rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationWithProfile extends Application {
  profile: {
    fullName: string;
  };
}

interface PageProps {
  params: {
    jobId: string;
  };
}

export default function JobApplicationsPage({ params }: PageProps) {
  const { jobId } = params;
  const { user } = useSupabaseUser();
  const { profile, loading: profileLoading } = useUserProfile();
  const router = useRouter();
  const supabase = createClient();

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Check if user is recruiter
  useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'client') {
      toast.error('Access denied. Only recruiters can view applications.');
      router.push('/dashboard');
    }
  }, [profile, profileLoading, router]);

  // Fetch job and applications
  useEffect(() => {
    if (!user || !profile || profile.role !== 'client') return;

    const fetchData = async () => {
      try {
        // First, fetch the job to ensure it belongs to the user
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('created_by', user.id)
          .single();

        if (jobError) {
          if (jobError.code === 'PGRST116') {
            toast.error('Job not found or you do not have permission to view its applications');
            router.push('/dashboard/jobs');
            return;
          }
          throw jobError;
        }

        setJob(jobData);

        // Fetch applications with candidate profiles
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select(`
            *,
            profile:profiles!applications_candidate_id_fkey (
              full_name
            )
          `)
          .eq('job_id', jobId)
          .order('created_at', { ascending: false });

        if (applicationsError) throw applicationsError;

        setApplications(applicationsData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load applications');
        router.push('/dashboard/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile, jobId, supabase, router]);

  const handleStatusUpdate = async (applicationId: string, newStatus: 'pending' | 'shortlisted' | 'rejected') => {
    if (!user || !profile || profile.role !== 'client') return;

    setUpdating(applicationId);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
          : app
      ));

      toast.success(`Application ${newStatus} successfully`);
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'shortlisted':
        return <Badge variant="default" className="bg-green-600">Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    const counts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      pending: counts.pending || 0,
      shortlisted: counts.shortlisted || 0,
      rejected: counts.rejected || 0,
      total: applications.length
    };
  };

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile || profile.role !== 'client' || !job) {
    return null;
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/jobs')}
              className="p-0 h-auto"
            >
              Jobs
            </Button>
            <span>/</span>
            <span>Applications</span>
          </div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground mt-2">
            Manage applications for this job posting
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statusCounts.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Shortlisted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statusCounts.shortlisted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icons.user className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground text-center">
                Applications will appear here when candidates apply for this job.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {application.profile?.fullName || 'Unknown Candidate'}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Select
                        value={application.status}
                        onValueChange={(value) => handleStatusUpdate(application.id, value as any)}
                        disabled={updating === application.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="shortlisted">Shortlist</SelectItem>
                          <SelectItem value="rejected">Reject</SelectItem>
                        </SelectContent>
                      </Select>

                      {updating === application.id && (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/candidates/${application.candidateId}`)}
                      >
                        <Icons.user className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                    </div>
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
