import { useEffect, useState } from "react";
import axios from "axios";

function ResumeAnalysis() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResumeHistory();
  }, []);

  const fetchResumeHistory = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/user-resumes/${user.email}`
      );

      setResumeHistory(response.data);

      if (response.data.length > 0) {
        setAnalysis(response.data[0].analysis);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAnalyzeResume = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("resume", selectedFile);
      formData.append("email", user.email);

      const response = await axios.post(
        "http://127.0.0.1:5000/analyze-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAnalysis(response.data);

      fetchResumeHistory();
    } catch (error) {
      console.error(error);
      alert("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-cyan-400 mb-4">
          AI Resume Analysis
        </h1>

        <p className="text-center text-gray-300 mb-12">
          Upload resumes, track ATS scores, and improve your job readiness.
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              Upload Resume
            </h2>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400/40 rounded-3xl p-10 cursor-pointer hover:bg-cyan-400/10 transition">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="text-6xl mb-4">📄</div>

              <h3 className="text-xl font-bold text-cyan-400 mb-2">
                Choose Resume
              </h3>

              <p className="text-gray-300 text-center">
                Upload your resume in PDF format.
              </p>

              {selectedFile && (
                <p className="mt-4 text-green-400 font-semibold text-center">
                  {selectedFile.name}
                </p>
              )}
            </label>

            <button
              onClick={handleAnalyzeResume}
              disabled={!selectedFile || loading}
              className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition py-4 rounded-xl text-lg font-bold"
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>

            <div className="mt-10">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">
                Resume History
              </h3>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {resumeHistory.map((resume, index) => (
                  <button
                    key={index}
                    onClick={() => setAnalysis(resume.analysis)}
                    className="w-full text-left bg-black/40 border border-white/10 rounded-xl p-4 hover:border-cyan-400 transition"
                  >
                    <p className="text-white font-semibold">
                      {resume.file_name}
                    </p>

                    <p className="text-cyan-400">
                      ATS: {resume.analysis?.ats_score}/100
                    </p>
                  </button>
                ))}

                {resumeHistory.length === 0 && (
                  <p className="text-gray-400">
                    No resumes uploaded yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-8">
              Resume Insights
            </h2>

            {analysis ? (
              <div className="space-y-8">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-center">
                  <p className="text-gray-300 mb-2">ATS Score</p>

                  <p className="text-6xl font-bold text-cyan-400">
                    {analysis.ats_score}/100
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-3">
                    Summary
                  </h3>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-gray-300">
                    {analysis.summary}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-3">
                    Strengths
                  </h3>

                  <div className="space-y-3">
                    {analysis.strengths?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-black/40 border border-white/10 rounded-xl p-4"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-3">
                    Missing Keywords
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    {analysis.missing_keywords?.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 px-4 py-2 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-3">
                    Improvement Tips
                  </h3>

                  <div className="space-y-3">
                    {analysis.improvement_tips?.map((tip, index) => (
                      <div
                        key={index}
                        className="bg-black/40 border border-white/10 rounded-xl p-4"
                      >
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">
                Upload and analyze a resume to view insights.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalysis;