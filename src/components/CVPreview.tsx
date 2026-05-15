import React from 'react';
import { Download } from 'lucide-react';

interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    summary: string;
  };
  experience: {
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    link: string;
  }[];
}

interface CVPreviewProps {
  data: string; // JSON string
}

export const CVPreview: React.FC<CVPreviewProps> = ({ data }) => {
  let cv: CVData;
  try {
    cv = JSON.parse(data);
  } catch (e) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Gagal mengurai data CV: JSON tidak valid.</div>;
  }

  const handleDownload = () => {
    window.print(); // Easy printing, the CSS can have print media queries to only print this specific CV
  };

  return (
    <div className="w-full flex flex-col items-center my-6 group">
      <div className="flex w-full justify-between items-center mb-3 max-w-[210mm]">
        <h3 className="font-semibold text-gray-800">Preview CV (ATS Friendly)</h3>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Cetak / Simpan PDF</span>
        </button>
      </div>

      <div className="bg-white shadow-lg border border-gray-200 overflow-hidden text-gray-900 w-full max-w-[210mm] relative" id="cv-document">
        
        {/* Style scoped within the component via inline/tailwind */}
        <div className="p-8 sm:p-12 text-[11px] sm:text-sm leading-relaxed overflow-x-auto cv-template print-exact-size" style={{ fontFamily: 'Times New Roman, serif' }}>
          
          {/* Header */}
          <div className="text-center mb-6 border-b border-gray-900 pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-2">{cv.personalInfo?.name || 'Nama Lengkap'}</h1>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-gray-700">
              {cv.personalInfo?.location && <span>{cv.personalInfo.location}</span>}
              {cv.personalInfo?.phone && <span>• {cv.personalInfo.phone}</span>}
              {cv.personalInfo?.email && <span>• {cv.personalInfo.email}</span>}
              {cv.personalInfo?.linkedin && <span>• {cv.personalInfo.linkedin}</span>}
              {cv.personalInfo?.portfolio && <span>• {cv.personalInfo.portfolio}</span>}
            </div>
          </div>

          {/* Summary */}
          {cv.personalInfo?.summary && (
            <div className="mb-5">
              <h2 className="text-[13px] sm:text-base font-bold uppercase border-b border-gray-300 mb-2 pb-1">Professional Summary</h2>
              <p className="text-justify">{cv.personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {cv.experience && cv.experience.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[13px] sm:text-base font-bold uppercase border-b border-gray-300 mb-3 pb-1">Work Experience</h2>
              <div className="flex flex-col gap-4">
                {cv.experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[12px] sm:text-[15px]">{exp.role}</h3>
                      <span className="font-semibold tabular-nums">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <div className="flex justify-between items-baseline mb-2 italic">
                      <span>{exp.company}</span>
                      <span>{exp.location}</span>
                    </div>
                    {exp.description && exp.description.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1">
                        {exp.description.map((desc, dIdx) => (
                          <li key={dIdx} className="text-justify pl-1">{desc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cv.education && cv.education.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[13px] sm:text-base font-bold uppercase border-b border-gray-300 mb-3 pb-1">Education</h2>
              <div className="flex flex-col gap-3">
                {cv.education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[12px] sm:text-[15px]">{edu.institution}</h3>
                      <span className="font-semibold tabular-nums">{edu.startDate} - {edu.endDate}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="italic">{edu.degree}</span>
                      <span>{edu.location}</span>
                    </div>
                    {edu.gpa && <div className="mt-1">GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {cv.projects && cv.projects.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[13px] sm:text-base font-bold uppercase border-b border-gray-300 mb-3 pb-1">Projects</h2>
              <div className="flex flex-col gap-3">
                {cv.projects.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[12px] sm:text-[15px]">{proj.name}</h3>
                      {proj.link && <a href={proj.link} className="text-blue-600 hover:underline text-xs">{proj.link}</a>}
                    </div>
                    <p className="text-justify mb-1">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <p className="italic text-gray-700">Technologies: {proj.technologies.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {cv.skills && cv.skills.length > 0 && (
            <div className="mb-2">
              <h2 className="text-[13px] sm:text-base font-bold uppercase border-b border-gray-300 mb-3 pb-1">Skills</h2>
              <div className="grid grid-cols-1 gap-2">
                {cv.skills.map((skillGroup, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-bold min-w-[100px]">{skillGroup.category}:</span>
                    <span>{skillGroup.items?.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
