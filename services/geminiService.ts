import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are an expert Resume Strategist.
Your task is to rewrite a given resume (PDF) to align with a Job Description, while STRICTLY preserving the original structure and formatting style.

**VISUAL STYLE & FORMATTING RULES (Tailwind CSS):**
The user wants a compact, professional look. You MUST use the following HTML structure and Tailwind classes:

1.  **Main Container**: Return ONLY the inner content.
2.  **Name**: \`<h1 class="text-3xl font-bold text-center uppercase text-slate-800 mb-1">Name</h1>\`
3.  **Contact Info**: \`<p class="text-center text-sm text-gray-600 mb-4 border-b-2 border-gray-800 pb-2">Phone • Email • LinkedIn • Location</p>\`
4.  **Section Headers**: \`<h2 class="text-lg font-bold uppercase text-slate-800 border-b border-gray-300 mb-3 mt-5">Section Title</h2>\`
5.  **Experience/Education Entries**:
    *   **Header Line (Company/School + Date)**: Use Flexbox.
        \`<div class="flex justify-between items-baseline mb-0"><strong class="text-base text-gray-900">Company Name</strong><span class="text-sm text-gray-600 font-medium">Date Range</span></div>\`
    *   **Sub-Header Line (Role/Degree)**:
        \`<div class="italic text-sm text-gray-700 mb-1">Role or Degree</div>\`
    *   **Bullets**:
        \`<ul class="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">\`
        \`<li>Bullet point...</li>\`
        \`</ul>\`

**CONTENT & LENGTH RULES:**
1.  **MAX 2 PAGES**: Be concise. Select only the top 3-5 most impactful bullets per role.
2.  **NO EMPTY SPACES**: Ensure you generate **ALL** sections (Summary, Experience, Education, Skills, Projects). Do not stop after Education.
3.  **DENSITY**: Do not add extra <br> tags. Use the margins defined in the classes above.
4.  **LOGIC**: Match the Job Description keywords in the summary and bullets.

**Input Handling**:
- Analyze the PDF content.
- Map it to the structure above.
- If a section exists in the PDF, include it in the output.

Output **strictly** the HTML string with these classes.
`;

export const tuneResumeWithGemini = async (
  resumeBase64: string,
  jobDescription: string
): Promise<string> => {
  try {
    // 1. Initialize the client
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Prepare the payload
    // The base64 string from FileReader includes the prefix "data:application/pdf;base64,", which we need to strip.
    const cleanBase64 = resumeBase64.split(',')[1] || resumeBase64;

    const pdfPart = {
      inlineData: {
        mimeType: 'application/pdf',
        data: cleanBase64,
      },
    };

    const promptPart = {
      text: `Target Job Description:\n${jobDescription}\n\nPlease generate the tuned resume as HTML using the requested Tailwind classes. Ensure ALL sections (Education, Experience, Skills) are included.`
    };

    // 3. Call the model
    // Using gemini-3-flash-preview for a good balance of context window (for PDFs) and speed.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [pdfPart, promptPart]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    // 4. Return text
    if (response.text) {
      // Cleanup: sometimes models might still add markdown backticks despite instructions.
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```html')) {
        cleanText = cleanText.replace(/^```html/, '').replace(/```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```/, '').replace(/```$/, '');
      }
      return cleanText;
    } else {
      throw new Error("No text response generated from Gemini.");
    }

  } catch (error) {
    console.error("Error tuning resume:", error);
    throw error;
  }
};