import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultsView from './components/ResultsView';
import { AppStatus, ResumeState } from './types';
import { tuneResumeWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [resumeData, setResumeData] = useState<ResumeState>({ file: null, base64: null, fileName: null });
  const [jobDescription, setJobDescription] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelect = (file: File, base64: string) => {
    setResumeData({
      file,
      base64,
      fileName: file.name
    });
    setErrorMsg('');
  };

  const handleTune = async () => {
    if (!resumeData.base64 || !jobDescription.trim()) {
      setErrorMsg("Please upload a resume and enter a job description.");
      return;
    }

    setStatus(AppStatus.LOADING);
    setErrorMsg('');

    try {
      const tunedContent = await tuneResumeWithGemini(resumeData.base64, jobDescription);
      setResult(tunedContent);
      setStatus(AppStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to tune resume. Please try again. Ensure your PDF is text-readable.");
      setStatus(AppStatus.ERROR);
    }
  };

  const resetApp = () => {
    setStatus(AppStatus.IDLE);
    setResumeData({ file: null, base64: null, fileName: null });
    setJobDescription('');
    setResult('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">ResuTune AI</h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            Powered by Gemini
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {status === AppStatus.SUCCESS ? (
          <ResultsView content={result} onReset={resetApp} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Inputs */}
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold mr-3">1</span>
                  Upload Resume
                </h2>
                <FileUpload onFileSelect={handleFileSelect} selectedFileName={resumeData.fileName} />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                 <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold mr-3">2</span>
                  Job Description
                </h2>
                <div className="w-full">
                  <textarea
                    id="jobDescription"
                    rows={8}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4 border resize-none"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>

               {errorMsg && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{errorMsg}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleTune}
                disabled={status === AppStatus.LOADING || !resumeData.file || !jobDescription.trim()}
                className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-medium text-white transition-all duration-200 ${
                  status === AppStatus.LOADING || !resumeData.file || !jobDescription.trim()
                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {status === AppStatus.LOADING ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Tuning Resume... This might take a minute.
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Tune My Resume
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Information / Decor */}
            <div className="hidden lg:block relative h-full min-h-[500px] animate-fade-in delay-100">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl transform rotate-1 opacity-90"></div>
               <div className="absolute inset-0 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col transform -rotate-1 transition-transform hover:rotate-0 duration-500">
                  <div className="p-8 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">How it works</h3>
                  </div>
                  <div className="p-8 space-y-8 flex-grow">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">1. Context Analysis</h4>
                        <p className="mt-2 text-base text-gray-500">
                          We read your PDF to understand your career history, skills, and achievements.
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">2. Job Matching</h4>
                        <p className="mt-2 text-base text-gray-500">
                          We analyze the job description to find the keywords and qualifications the recruiter needs.
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">3. Optimization</h4>
                        <p className="mt-2 text-base text-gray-500">
                          Gemini rewrites your resume to highlight the matches, increasing your chances of getting hired.
                        </p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;