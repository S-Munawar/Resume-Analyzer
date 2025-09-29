import React, { use, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import Summary from '~/components/summary';
import ATS from '~/components/ats';
import Details from '~/components/details';

export const meta = () => ([
  { title: 'Resume.io | Resume' },
  { name: 'description', content: 'View your resume details' }
])

const Resume = () => {
    const {auth, isLoading, fs, kv} = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

      useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

    useEffect(() => {
        const loadResume = async () => {
            console.log('Loading resume with ID:', id);
            const resumeData = await kv.get(`resume-${id}`);
            console.log('Resume data from KV:', resumeData);

            if (!resumeData) {
                console.error('No resume data found for ID:', id);
                return;
            }
            const data = JSON.parse(resumeData);
            console.log('Loaded resume data:', data);
            
            try {
                // Load PDF file
                const resumeBlob = await fs.read(data.resumePath);
                if (!resumeBlob) {
                    console.error('Failed to read resume file from path:', data.resumePath);
                    return;
                }
                const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                const resumeUrl = URL.createObjectURL(pdfBlob);
                setResumeUrl(resumeUrl);
                console.log('Resume PDF loaded successfully');
                
                // Load image file
                const imageBlob = await fs.read(data.imagePath);
                if (!imageBlob) {
                    console.error('Failed to read image file from path:', data.imagePath);
                    return;
                }
                const imageUrl = URL.createObjectURL(imageBlob);
                setImageUrl(imageUrl);
                console.log('Resume image loaded successfully');
                
                // Set feedback
                setFeedback(data.feedback);
                console.log('All resume data loaded successfully:', { 
                    hasImageUrl: !!imageUrl, 
                    hasResumeUrl: !!resumeUrl, 
                    hasFeedback: !!data.feedback 
                });
                
            } catch (fileError) {
                console.error('Error loading resume files:', fileError);
            }
        };

        if (id && auth && !isLoading) {
            loadResume().catch(error => {
                console.error('Error in loadResume:', error);
            });
        } else {
            console.log('Waiting for auth or missing ID:', { id, auth, isLoading });
        }

    }, [id, auth, isLoading, kv, fs]);


  return (
    <main>
        <nav className='resume-nav'>
            <Link to="/" className='back-button'>
            <img src= "/icons/back.svg" alt="logo" className='w-2.5 h-2.5' />
            <span className='text-gray-800 text-sm font-semibold'>Back to Home</span>
            </Link>
        </nav>
        <div className="flex flex-row w-full max-lg:flex-col-reverse">
            {/* Resume Image Section */}
            <section className='feedback-section w-1/2 max-lg:w-full bg-cover h-screen sticky top-0 flex items-center justify-center p-8' style={{backgroundImage: "url('/images/bg-small.svg')"}}>
                {imageUrl && resumeUrl ? (
                    <div className='animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-xl:h-fit w-fit max-w-full'>
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className='h-full w-full block'>
                            <img src={imageUrl} alt="Resume" className='w-full h-full object-contain rounded-2xl' title="Click to open PDF"/>
                        </a>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-600">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p>Loading resume...</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Feedback Section */}
            <section className='feedback-section w-1/2 max-lg:w-full bg-white h-screen overflow-y-auto p-8'>
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold text-black">Resume Review</h1>

                    {feedback ? (
                        <div className="flex flex-col gray">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-600">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p>Loading resume...</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    </main>
  )
}
export default Resume;