'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  thumbnail: string | null;
  description: string;
  is_public: boolean;
  createdBy: string;
  created_at: string;
  updatedAt: string;
}

const JobCard = ({ job }: { job: Job }) => {
    console.log(job);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleJobClick = () => {
    window.location.href = `/jobs/${job.id}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer pt-0" onClick={handleJobClick}>
      {/* Image placeholder */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg overflow-hidden">
        {job.thumbnail ? (
          <img 
            src={job.thumbnail} 
            alt={job.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-100 to-blue-200">
            <Icons.product className="h-12 w-12 text-blue-400" />
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {job.description}
        </p>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Created: {formatDate(job.created_at)}</span>
          <Badge variant={job.is_public ? "default" : "secondary"} className="text-xs">
            {job.is_public ? "Public" : "Private"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Fetch jobs from database
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setJobs(data || []);
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs');
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [supabase]);

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-12">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.warning className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Jobs</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="max-w-md mx-auto">
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Job Stats */}
      <div className="mb-6 text-center">
        <p className="text-muted-foreground">
          {searchTerm 
            ? `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`
            : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} available`
          }
        </p>
      </div>

      {/* Job Grid */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.product className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No jobs found' : 'No jobs available'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms or browse all available jobs.'
                : 'Jobs will appear here when they are posted by recruiters.'
              }
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}