import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume.io | Home" },
    { name: "description", content: "Analyze your resume with AI!" },
  ];
}

export default function Home() {

  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/')
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoading(true);
      try {
        console.log('Loading resumes...');
        const resumeKeys = await kv.list('resume-*') as string[];
        console.log('Found resume keys:', resumeKeys);
        
        const parsedResumes: Resume[] = [];
        
        for (const key of resumeKeys) {
          console.log('Processing key:', key);
          
          // Skip metadata keys and only process actual resume keys
          if (key.startsWith('resume-') && !key.includes('last_change_timestamp')) {
            try {
              // Get the actual value using the key
              const resumeData = await kv.get(key);
              console.log('Retrieved data for key', key, ':', resumeData);
              
              if (resumeData) {
                const parsed = JSON.parse(resumeData) as Resume;
                parsedResumes.push(parsed);
              }
            } catch (error) {
              console.error('Failed to process resume key:', error, key);
            }
          }
        }
        
        console.log('Final parsed resumes:', parsedResumes);
        setResumes(parsedResumes);
      } catch (error) {
        console.error('Failed to load resumes:', error);
        setResumes([]);
      }
      setLoading(false);
    };
    
    if (auth.isAuthenticated) {
      loadResumes();
    }
  }, [auth.isAuthenticated, kv]);

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Applications & Resume Ratings</h1>
        {!loading && resumes.length === 0 ? (
          <h2>No resumes found. Upload your resume to get started.</h2>
        ) : (
          <h2>Review your submissions and check AI-powered feedback.</h2>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center">
          <img src="/images/resume-scan-2.gif" alt="Loading..." className="w-16 h-16"/>
        </div>
      )}

    {!loading && resumes.length !== 0 && (
      <div className="resumes-section">
        {resumes.map((resume) => (
          <ResumeCard key={resume.id} resume={resume} />
        ))}
      </div>
    )}
    {!loading && resumes.length === 0 && (
      <div className="flex flex-col items-center justify-center mt-10 gap-4">
        <Link to="/upload" className="primary-button w-fit text-xl font-semibold ">
          Upload Resume
        </Link>
      </div>
    )}
    </section>
  </main>;
}

