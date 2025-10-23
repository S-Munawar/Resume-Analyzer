import React from 'react'
import {useState} from 'react'
import Navbar from '~/components/Navbar'
import type { FormEvent } from 'react';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { convertPdfToImage } from '../lib/PdfToImg';
import { generateUUID } from '~/lib/utils';
import { useNavigate } from 'react-router';
import { extractTextFromPdf } from '~/lib/PdfToImg';
import { analyzeResumeLocally } from '~/lib/localAnalyzer';

export const meta = () => ([
  { title: 'Resume.io | Upload' },
  { name: 'description', content: 'Upload your resume' }
])

const Upload = () => {
  const navigate = useNavigate();
  const {auth, fs, ai, kv, isLoading } = usePuterStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null); // State to hold the selected file, holds file object or null
  const handleFileSelect = (file: File | null) => { 
    setFile(file);
  }
  const handleAnalyze = async function analyzeResume({companyName, jobTitle, jobDescription, file}: {companyName: string; jobTitle: string; jobDescription: string; file: File;}) {
    
    try {
        setIsProcessing(true);
        
        setStatusText('Uploading resume...');
        const uploadFile = await fs.upload([file]);

        if (!uploadFile) return setStatusText('Failed to upload file');
        
        setStatusText('Converting PDF to image...');
        const image = await convertPdfToImage(file);
        
        if (!image.file) return setStatusText(image.error || 'Failed to convert PDF to image');
        
        setStatusText('Uploading image...');
        const uploadImage = await fs.upload([image.file]);
        if (!uploadImage) return setStatusText('Failed to upload image');
        
        setStatusText('Preparing data...');
        const uuid = await generateUUID();
        const data = {
            companyName,
            jobTitle,
            jobDescription,
            resumePath: uploadFile.path,
            imagePath: uploadImage.path,
            id: uuid,
            feedback: '',
        }
        
        await kv.set(`resume-${uuid}`, JSON.stringify(data));
        setStatusText('Analyzing...');

        const resumeText = await extractTextFromPdf(file);
        const feedback = await analyzeResumeLocally(resumeText, jobTitle, jobDescription);
        console.log('Local analysis completed successfully');

        if (!feedback) return setStatusText('Analysis failed. Please try uploading your resume again.');

        // analyzeResumeLocally returns a JSON string directly
        data.feedback = JSON.parse(feedback);
        await kv.set(`resume-${uuid}`, JSON.stringify(data));
        
        setStatusText('Analysis complete! redirecting...');
        console.log('Final data:', data);
        navigate(`/resume/${uuid}`);
    }
    catch (overallError) {
        console.error('Overall error in handleAnalyze:', overallError);
        setIsProcessing(false);
        const errorMessage = overallError instanceof Error ? overallError.message : 'Unknown error occurred';
        setStatusText(`Error: ${errorMessage}`);
    }
}

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior
    const form = event.currentTarget;
    if (!form) return;
    const formData = new FormData(form);
    const companyName = (formData.get('companyName') ?? '') as string;
    const jobTitle = (formData.get('jobTitle') ?? '') as string;
    const jobDescription = (formData.get('jobDescription') ?? '') as string;
    if (!file) return;
    handleAnalyze({companyName, jobTitle, jobDescription, file});


};

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
    <section className="main-section">
      <div className="page-heading py-16">
       <h1>Smart feedback for your dream job</h1>
       {isProcessing ? (
        <>
        <h2>{statusText}</h2>
        <img src="/images/resume-scan.gif" alt="Processing..." className="w-full"/>
        </>
       ) : (
        <>
        <h2>Upload your resume to get started!</h2>
        <form id="upload-form" className="flex flex-col gap-4 mt-8" onSubmit={handleSubmit}>
          <div className='form-div'>
            <label htmlFor="company-name">Company Name</label>
            <input type="text" id="company-name" name="companyName" placeholder="Company Name" required />
          </div>
          <div className='form-div'>
            <label htmlFor="job-title">Job Title</label>
            <input type="text" id="job-title" name="jobTitle" placeholder="Job Title" required />
          </div>
          <div className='form-div'>
            <label htmlFor="job-description">Job Description</label>
            <input type="text" id="job-description" name="jobDescription" placeholder="Job Description" required />
          </div>
          <div className='form-div'>
            <label htmlFor="uploader">Upload Resume</label>
            <FileUploader onFileSelect={handleFileSelect} />
          </div>
          <button className='primary-button' type="submit">Analyze Resume</button>
        </form>
        </>
       )}
      </div>
    </section>
  </main>
  )
}


export default Upload
