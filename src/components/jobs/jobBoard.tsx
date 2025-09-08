'use client';

import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock job data based on job schema
const mockJobs = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Frontend Developer",
    thumbnail: "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/380256505/original/3cf737dfc09ec01f92ab8bb8ea4a09c7c95253b6.png",
    description: "Looking for an experienced frontend developer to build a modern React application with TypeScript and Tailwind CSS.",
    isPublic: true,
    createdBy: "550e8400-e29b-41d4-a716-446655440002",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "UI/UX Designer",
    description: "Seeking a creative UI/UX designer to design mobile app interfaces and create interactive prototypes.",
    isPublic: true,
    thumbnail: "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/240890002/original/359842d17c1daa3d878d225a07c98fdb87291303.png",  
    createdBy: "550e8400-e29b-41d4-a716-446655440004",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    title: "Backend Developer",
    description: "Need a backend developer with Node.js and PostgreSQL experience to build scalable APIs.",
    isPublic: true,
    thumbnail: "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/205691936/original/ecd4846d5c839df886b0dbb777ca174f0538a696.png",  
        createdBy: "550e8400-e29b-41d4-a716-446655440006",
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    title: "Graphic Designer",
    description: "Looking for a talented graphic designer to create brand identity and marketing materials.",
    isPublic: true,
    createdBy: "550e8400-e29b-41d4-a716-446655440008",
    thumbnail: "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/300273148/original/ad2f8ea91513ab98e76aaa2d8ddaee79ab598fb6.jpg",  
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    title: "Content Writer",
    description: "Seeking an experienced content writer to create engaging blog posts and website copy.",
    isPublic: false,
    thumbnail: "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/424365813/original/e10a8d08f1565856a1b4647c2f773f1e7013ed4d.png",  
    createdBy: "550e8400-e29b-41d4-a716-446655440010",
    createdAt: "2024-01-11T11:30:00Z",
    updatedAt: "2024-01-11T11:30:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    title: "DevOps Engineer",
    description: "Need a DevOps engineer to set up CI/CD pipelines and manage cloud infrastructure.",
    isPublic: true,
    thumbnail: "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/321892047/original/c6652df8704d8e679854f71a45da16d0a6f49bc4.png",  
    createdBy: "550e8400-e29b-41d4-a716-446655440012",
    createdAt: "2024-01-10T13:20:00Z",
    updatedAt: "2024-01-10T13:20:00Z"
  }
];

const JobCard = ({ job }: { job: typeof mockJobs[0] }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer pt-0">
      {/* Image placeholder */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <img src={job.thumbnail} alt={job.title} style={{borderTopLeftRadius: "10px", borderTopRightRadius: "10px"}}/>
      </div>

      <CardHeader >
        <CardTitle className="text-lg">{job.title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {job.description}
        </p>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Created: {formatDate(job.createdAt)}</span>
          <span className={job.isPublic ? "text-green-600" : "text-orange-600"}>
            {job.isPublic ? "Public" : "Private"}
          </span>
        </div>
        
      </CardContent>
    </Card>
  );
};

export default function JobBoard() {
  return (
    <div className="container mx-auto px-4">
      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}