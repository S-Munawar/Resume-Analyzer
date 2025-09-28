import React from 'react'
import {useState} from 'react'
import Navbar from '~/components/Navbar'
import type { FormEvent } from 'react';
import FileUploader from '~/components/FileUploader';

const upload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null); // State to hold the selected file
  const handleFileSelect = (file: File | null) => { 
    console.log("Selected file:", file);   
    setFile(file);
  }
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget.closest('form');
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get('companyName');
    const jobTitle = formData.get('jobTitle');
    const jobDescription = formData.get('jobDescription');
    console.log({companyName, jobTitle, jobDescription, file});
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

export default upload
