'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';

interface Job {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
}

interface ApplicationWithJob {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'pending' | 'shortlisted' | 'rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  job: Job;
}

export default function ApplicationsPage() {
  const { user } = useSupabaseUser();
  const { profile, loading: profileLoading } = useUserProfile();
  const router = useRouter();
  const supabase = createClient();

  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is candidate
  useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'candidate') {
      toast.error('Access denied. Only candidates can view applications.');
      router.push('/dashboard');
    }
  }, [profile, profileLoading, router]);

  // Fetch applications
  useEffect(() => {
    if (!user || !profile || profile.role !== 'candidate') return;

    const fetchApplications = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            job:jobs!applications_job_id_fkey (
              id,
              title,
              thumbnail,
              description,
              is_public,
              created_at
            )
          `)
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (error: any) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, profile, supabase]);

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

  const filteredApplications = applications.filter(app =>
    app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile || profile.role !== 'candidate') {
    return null;
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-2">
            Track the status of your job applications
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

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icons.user className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No applications found' : 'No applications yet'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start applying for jobs to see your applications here'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/')}>
                  Browse Jobs
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {application.job.thumbnail && (
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={application.job.thumbnail} 
                          alt={application.job.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold line-clamp-1">
                            {application.job.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {application.job.description}
                          </p>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/jobs/${application.job.id}`)}
                        >
                          <Icons.eye className="h-4 w-4 mr-1" />
                          View Job
                        </Button>
                      </div>
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
