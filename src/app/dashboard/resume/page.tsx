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
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploader } from '@/components/file-uploader';

interface Resume {
  id: string;
  candidateId: string;
  title: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  contact: string;
  fileUrl: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function ResumePage() {
  const { user } = useSupabaseUser();
  const { profile, loading: profileLoading } = useUserProfile();
  const router = useRouter();
  const supabase = createClient();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    contact: '',
    fileUrl: ''
  });

  // Check if user is candidate
  useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'candidate') {
      toast.error('Access denied. Only candidates can manage resumes.');
      router.push('/dashboard');
    }
  }, [profile, profileLoading, router]);

  // Fetch existing resume
  useEffect(() => {
    if (!user || !profile || profile.role !== 'candidate') return;

    const fetchResume = async () => {
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('candidate_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setResume(data);
          setFormData({
            title: data.title || '',
            summary: data.summary || '',
            experience: data.experience || '',
            education: data.education || '',
            skills: data.skills || '',
            contact: data.contact || '',
            fileUrl: data.fileUrl || ''
          });
        }
      } catch (error: any) {
        console.error('Error fetching resume:', error);
        toast.error('Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [user, profile, supabase]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
    try {
      const resumeData = {
        candidate_id: user.id,
        title: formData.title,
        summary: formData.summary,
        experience: formData.experience,
        education: formData.education,
        skills: formData.skills,
        contact: formData.contact,
        file_url: formData.fileUrl,
        created_by: user.id
      };

      if (resume) {
        // Update existing resume
        const { error } = await supabase
          .from('resumes')
          .update({
            ...resumeData,
            updated_at: new Date().toISOString()
          })
          .eq('id', resume.id);

        if (error) throw error;
        toast.success('Resume updated successfully!');
      } else {
        // Create new resume
        const { data, error } = await supabase
          .from('resumes')
          .insert([resumeData])
          .select()
          .single();

        if (error) throw error;
        setResume(data);
        toast.success('Resume created successfully!');
      }
    } catch (error: any) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      // Here you would typically upload to your file storage service
      // For now, we'll just set a placeholder URL
      const file = files[0];
      toast.success(`File "${file.name}" uploaded successfully!`);
      handleInputChange('fileUrl', `uploads/resumes/${file.name}`);
    }
  };

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {resume ? 'Update Resume' : 'Create Resume'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {resume 
              ? 'Update your resume information and upload new files.'
              : 'Create your professional resume to apply for jobs.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Resume Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Frontend Developer Resume"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact">Contact Information *</Label>
                <Textarea
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  placeholder="Email, phone, address, LinkedIn profile, etc."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Brief overview of your professional background and career objectives"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="experience">Work Experience</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="List your work experience, including job titles, companies, dates, and key achievements"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Your educational background, degrees, institutions, and graduation dates"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  placeholder="Technical skills, programming languages, tools, certifications, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resume File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Upload Resume File (PDF, DOC, DOCX)</Label>
                <FileUploader
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024} // 5MB
                  accept={{
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                  }}
                />
                {formData.fileUrl && (
                  <Alert>
                    <Icons.check className="h-4 w-4" />
                    <AlertDescription>
                      Current file: {formData.fileUrl}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {resume ? 'Update Resume' : 'Create Resume'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
