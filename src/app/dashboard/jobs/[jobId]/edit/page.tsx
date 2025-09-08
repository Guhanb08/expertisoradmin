'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';

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

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default function EditJobPage({ params }: PageProps) {
  const [jobId, setJobId] = useState<string>('');
  const { user } = useSupabaseUser();
  const { profile, loading: profileLoading } = useUserProfile();
  const router = useRouter();
  const supabase = createClient();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    is_public: true
  });

  // Resolve params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setJobId(resolvedParams.jobId);
    });
  }, [params]);

  // Check if user is recruiter
  useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'client') {
      toast.error('Access denied. Only recruiters can edit jobs.');
      router.push('/dashboard');
    }
  }, [profile, profileLoading, router]);

  // Fetch job data
  useEffect(() => {
    if (!user || !profile || profile.role !== 'client' || !jobId) return;

    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('created_by', user.id) // Ensure user can only edit their own jobs
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            toast.error('Job not found or you do not have permission to edit it');
            router.push('/dashboard/jobs');
            return;
          }
          throw error;
        }

        setJob(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          thumbnail: data.thumbnail || '',
          is_public: data.is_public ?? true
        });
      } catch (error: any) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job');
        router.push('/dashboard/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [user, profile, jobId, supabase, router]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || profile.role !== 'client' || !job) return;

    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Job description is required');
      return;
    }

    setUpdating(true);
    try {
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        thumbnail: formData.thumbnail.trim() || null,
        is_public: formData.is_public,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', job.id)
        .eq('created_by', user.id);

      if (error) throw error;

      toast.success('Job updated successfully!');
      router.push('/dashboard/jobs');
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    } finally {
      setUpdating(false);
    }
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Job</h1>
          <p className="text-muted-foreground mt-2">
            Update your job posting details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the job role, responsibilities, requirements, and qualifications..."
                  rows={8}
                  required
                />
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  placeholder="https://example.com/job-image.jpg"
                  type="url"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Optional: Add a thumbnail image to make your job posting more attractive
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                />
                <Label htmlFor="is_public" className="cursor-pointer">
                  Make this job public
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Public jobs are visible to all candidates. Private jobs are only visible to invited candidates.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/jobs')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updating}>
              {updating && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Update Job
            </Button>
          </div>
        </form>

        {/* Preview Card */}
        {(formData.title || formData.description) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4">
                {formData.thumbnail && (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={formData.thumbnail} 
                      alt="Job thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">
                  {formData.title || 'Job Title'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {formData.description || 'Job description will appear here...'}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
                  <span className={formData.is_public ? "text-green-600" : "text-orange-600"}>
                    {formData.is_public ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
