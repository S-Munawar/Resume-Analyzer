import React from 'react'
import {useState} from 'react'
import Navbar from '~/components/Navbar'
import type { FormEvent } from 'react';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { convertPdfToImage } from '../lib/PdfToImg';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '../../constants/index';

const Upload = () => {
  const {auth, fs, ai, kv, isLoading } = usePuterStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null); // State to hold the selected file
  const handleFileSelect = (file: File | null) => { 
    setFile(file);
  }
  const handleAnalyze = async function analyzeResume({companyName, jobTitle, jobDescription, file}: {companyName: string; jobTitle: string; jobDescription: string; file: File;}) {
    
    try {
        setIsProcessing(true);
        console.log('Starting analysis for:', {companyName, jobTitle, file: file.name});
        
        setStatusText('Uploading resume...');
        const uploadFile = await fs.upload([file]);
        console.log('File upload result:', uploadFile);

        if (!uploadFile) {
            setIsProcessing(false);
            setStatusText('Failed to upload file');
            return;
        }
        
        setStatusText('Converting PDF to image...');
        const image = await convertPdfToImage(file);
        console.log('PDF conversion result:', image);
        
        if (!image.file) {
            setIsProcessing(false);
            setStatusText(image.error || 'Failed to convert PDF to image');
            return;
        }
        
        setStatusText('Uploading image...');
        const uploadImage = await fs.upload([image.file]);
        console.log('Image upload result:', uploadImage);
        
        if (!uploadImage) {
            setIsProcessing(false);
            setStatusText('Failed to upload image');
            return;
        }
        
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
        
        console.log('Saving initial data to KV store...');
        await kv.set(`resume-${uuid}`, JSON.stringify(data));
    setStatusText('Analyzing...');
    
    try {
        console.log('Calling AI feedback with:', {
            filePath: uploadFile.path,
            instructions: prepareInstructions({jobTitle, jobDescription})
        });
        
        const feedback = await ai.feedback(
            uploadFile.path,
            prepareInstructions({jobTitle, jobDescription})
        );
        
        console.log('AI feedback received:', feedback);

        if (!feedback) {
            console.error('No feedback received from AI');
            setIsProcessing(false);
            setStatusText('Failed to get AI feedback');
            return;
        }

        setStatusText('Done!');
        setIsProcessing(false);

        const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;
        data.feedback = feedbackText;
        
        console.log('Saving data to KV store:', data);
        await kv.set(`resume-${uuid}`, JSON.stringify(data));
        
        setStatusText('Analysis complete! redirecting...');
        console.log('Final data:', data);
        console.log('Feedback text:', feedbackText);
    } catch (error) {
        console.error('Error during AI analysis:', error);
        setIsProcessing(false);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setStatusText(`Analysis failed: ${errorMessage}`);
        return;
    }
    } catch (overallError) {
        console.error('Overall error in handleAnalyze:', overallError);
        setIsProcessing(false);
        const errorMessage = overallError instanceof Error ? overallError.message : 'Unknown error occurred';
        setStatusText(`Error: ${errorMessage}`);
    }
}

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
