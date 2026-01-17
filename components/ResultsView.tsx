import React, { useState } from 'react';

interface ResultsViewProps {
  content: string; // This is now HTML string
  onReset: () => void;
}

// Declare html2pdf global from the script tag in index.html
declare const html2pdf: any;

const ResultsView: React.FC<ResultsViewProps> = ({ content, onReset }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = () => {
    const element = document.getElementById('resume-content');
    if (!element) return;

    setIsDownloading(true);
    // Optimized settings for creating a clean 2-page max PDF
    const opt = {
      margin: [0.4, 0.4], // Tighter margins [top/bottom, left/right] in inches
      filename: 'Tuned_Resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloading(false);
    }).catch((err: any) => {
      console.error("PDF generation failed", err);
      setIsDownloading(false);
    });
  };

  return (
    <div className="animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Tuned Resume</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isDownloading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isDownloading ? (
               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Download PDF
          </button>
          
          <button
            onClick={onReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Start Over
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 overflow-auto">
        {/* 
          Visual container mimicking a standard document.
          max-width set to roughly 8.5 inches (816px) to simulate letter size.
        */}
        <div 
          id="resume-content" 
          className="bg-white mx-auto shadow-lg p-8 md:p-12 max-w-[816px] text-gray-800"
        >
          {/* 
            We REMOVED the 'prose' class here because the Gemini model is now instructed 
            to return HTML with explicit Tailwind classes (text-3xl, flex, etc.).
            Using 'prose' on top of that would conflict and add unwanted margins.
            
            We just need a standard block container.
          */}
          <div 
            className="w-full text-left"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ResultsView;