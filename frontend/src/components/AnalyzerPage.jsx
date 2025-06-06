import React, { useState } from 'react';
import { Upload, FileText, Brain, Target, TrendingUp, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const AnalyzerPage = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'text'

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if ((!resumeFile && !resumeText.trim()) || !jobDescription.trim()) {
      setError('Please provide both a resume and job description');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      
      if (uploadMethod === 'file' && resumeFile) {
        formData.append('resume_file', resumeFile);
      } else {
        formData.append('resume_text', resumeText);
      }
      
      formData.append('job_description', jobDescription);

      const response = await fetch('http://localhost:5000/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!results) return;

    try {
      const response = await fetch('http://localhost:5000/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results),
      });

      if (!response.ok) {
        throw new Error('Report generation failed');
      }

      const data = await response.json();
      
      // Download PDF
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${data.pdf_content}`;
      link.download = data.filename;
      link.click();
    } catch (err) {
      setError('Failed to generate report');
      console.error('Report error:', err);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-title mb-4">Resume Analyzer</h1>
          <p className="text-gray-300 text-lg">
            Upload your resume and job description to get AI-powered insights
          </p>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Resume Upload */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-100">
                <Upload className="h-5 w-5" />
                Resume Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Method Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    uploadMethod === 'file'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUploadMethod('text')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    uploadMethod === 'text'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Paste Text
                </button>
              </div>

              {uploadMethod === 'file' ? (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">
                      {resumeFile ? resumeFile.name : 'Click to upload resume'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, DOC, DOCX, TXT
                    </p>
                  </label>
                </div>
              ) : (
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="w-full h-40 p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-100">
                <FileText className="h-5 w-5" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-64 p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Analyze Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!resumeFile && !resumeText.trim()) || !jobDescription.trim()}
            className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                Analyze Resume
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Score Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass-card text-center">
                <CardContent className="pt-6">
                  <Target className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">ATS Score</h3>
                  <div className={`text-3xl font-bold ${getScoreColor(results.ats_score)}`}>
                    {results.ats_score}%
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {getScoreStatus(results.ats_score)}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardContent className="pt-6">
                  <TrendingUp className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Match Score</h3>
                  <div className={`text-3xl font-bold ${getScoreColor(results.match_score)}`}>
                    {results.match_score}%
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {getScoreStatus(results.match_score)}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardContent className="pt-6">
                  <CheckCircle className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keywords</h3>
                  <div className="text-3xl font-bold text-cyan-400">
                    {results.job_keywords?.length || 0}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Identified
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Skills Analysis */}
              {results.skill_analysis && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-cyan-100">Skills Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.skill_analysis.match_analysis && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-400 mb-2">Matched Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {results.skill_analysis.match_analysis.matched_skills?.slice(0, 10).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-red-400 mb-2">Missing Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {results.skill_analysis.match_analysis.missing_skills?.slice(0, 10).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-cyan-100">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.recommendations?.slice(0, 5).map((rec, index) => (
                      <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                        <h4 className="font-semibold text-cyan-300 mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-300">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Download Report Button */}
            <div className="text-center">
              <button
                onClick={handleDownloadReport}
                className="btn-primary"
              >
                <Download className="h-5 w-5" />
                Download Full Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzerPage;
