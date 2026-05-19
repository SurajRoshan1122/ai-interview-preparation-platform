import { useEffect, useState } from "react";
import axios from "axios";

function Results() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [resumeHistory, setResumeHistory] = useState([]);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [mockHistory, setMockHistory] = useState([]);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const resumeResponse = await axios.get(
        `http://127.0.0.1:5000/user-resumes/${user.email}`
      );

      const questionResponse = await axios.get(
        `http://127.0.0.1:5000/user-question-results/${user.email}`
      );

      const mockResponse = await axios.get(
        `http://127.0.0.1:5000/mock-interview-history/${user.email}`
      );

      setResumeHistory(resumeResponse.data);
      setQuestionHistory(questionResponse.data);
      setMockHistory(mockResponse.data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    }
  };

  const latestResume = resumeHistory[0];
  const latestQuestion = questionHistory[0];

  const completedMocks = mockHistory.filter(
    (mock) => mock.status === "completed" && mock.evaluation
  );

  const latestMock = completedMocks[0];

  const averageQuestionScore =
    questionHistory.length > 0
      ? Math.round(
          questionHistory.reduce(
            (sum, item) => sum + (item.result?.total_score || 0),
            0
          ) / questionHistory.length
        )
      : "—";

  const averageMockScore =
    completedMocks.length > 0
      ? Math.round(
          completedMocks.reduce(
            (sum, item) => sum + (item.evaluation?.overall_score || 0),
            0
          ) / completedMocks.length
        )
      : "—";

  const ScoreRow = ({ label, value }) => (
    <div className="flex justify-between items-center bg-black/40 border border-white/10 rounded-xl p-4">
      <span className="text-gray-300">{label}</span>
      <span className="text-cyan-400 font-bold">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-cyan-400 mb-4">
          Performance Results
        </h1>

        <p className="text-center text-gray-300 mb-12">
          View all your AI interview preparation analytics.
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Resume Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              Resume Analysis
            </h2>

            {latestResume ? (
              <>
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-6 text-center">
                  <p className="text-gray-300 mb-2">Latest ATS Score</p>
                  <p className="text-5xl font-bold text-cyan-400">
                    {latestResume.analysis?.ats_score}/100
                  </p>
                </div>

                <h3 className="text-lg font-bold mb-3">Missing Keywords</h3>

                <div className="flex flex-wrap gap-2">
                  {latestResume.analysis?.missing_keywords?.map(
                    (keyword, index) => (
                      <span
                        key={index}
                        className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-400">No resume analysis available.</p>
            )}
          </div>

          {/* Question Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              Question Performance
            </h2>

            {latestQuestion ? (
              <div className="space-y-4">
                <ScoreRow
                  label="Latest Overall Score"
                  value={`${latestQuestion.result?.total_score}/100`}
                />

                <ScoreRow
                  label="Average of All Sets"
                  value={`${averageQuestionScore}/100`}
                />

                <ScoreRow
                  label="HR Score"
                  value={`${latestQuestion.result?.hr_score}/100`}
                />

                <ScoreRow
                  label="Technical Score"
                  value={`${latestQuestion.result?.technical_score}/100`}
                />

                <ScoreRow
                  label="Project Score"
                  value={`${latestQuestion.result?.project_score}/100`}
                />
              </div>
            ) : (
              <p className="text-gray-400">No question results available.</p>
            )}
          </div>

          {/* Mock Interview Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              Mock Interview Performance
            </h2>

            {latestMock ? (
              <div className="space-y-4">
                <ScoreRow
                  label="Latest Overall Score"
                  value={`${latestMock.evaluation?.overall_score}/100`}
                />

                <ScoreRow
                  label="Average of All Mocks"
                  value={
                    averageMockScore === "—"
                      ? "—"
                      : `${averageMockScore}/100`
                  }
                />

                <ScoreRow
                  label="Confidence"
                  value={`${latestMock.evaluation?.confidence_score}/100`}
                />

                <ScoreRow
                  label="Communication"
                  value={`${latestMock.evaluation?.communication_score}/100`}
                />

                <ScoreRow
                  label="Clarity"
                  value={`${latestMock.evaluation?.clarity_score}/100`}
                />

                <ScoreRow
                  label="Technical Depth"
                  value={`${latestMock.evaluation?.technical_depth_score}/100`}
                />

                <ScoreRow
                  label="Problem Solving"
                  value={`${latestMock.evaluation?.problem_solving_score}/100`}
                />

                <ScoreRow
                  label="Company Fit"
                  value={`${latestMock.evaluation?.company_fit_score}/100`}
                />

                <button
                  onClick={() => window.location.href = "/mock-interview-history"}
                  className="w-full mt-4 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition py-3 rounded-xl font-bold"
                >
                  View Interview History
                </button>
              </div>
            ) : (
              <p className="text-gray-400">
                No completed mock interviews available.
              </p>
            )}
          </div>
        </div>

        {/* Question Set History */}
        <div className="mt-10 bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-cyan-400 mb-6">
            Question Set History
          </h2>

          {questionHistory.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedQuestionSet(item)}
                  className="text-left bg-black/40 border border-white/10 rounded-xl p-4 hover:border-cyan-400 transition"
                >
                  <p className="text-white font-semibold">
                    Set #{questionHistory.length - index}
                  </p>

                  <p className="text-cyan-400">
                    Score: {item.result?.total_score}/100
                  </p>

                  <p className="text-gray-400 text-sm mt-2">
                    Click to view questions, answers, and feedback
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No saved question sets yet.</p>
          )}
        </div>

        {selectedQuestionSet && (
          <div className="mt-10 bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">
              Saved Question Set Details
            </h2>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400">Overall</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {selectedQuestionSet.result?.total_score}/100
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400">HR</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {selectedQuestionSet.result?.hr_score}/100
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400">Technical</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {selectedQuestionSet.result?.technical_score}/100
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400">Project</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {selectedQuestionSet.result?.project_score}/100
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-8">
              {selectedQuestionSet.result?.overall_feedback}
            </p>

            <div className="space-y-6">
              {selectedQuestionSet.question_set?.map((item, index) => (
                <div
                  key={index}
                  className="bg-black/40 border border-white/10 rounded-2xl p-6"
                >
                  <span className="text-sm bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 px-3 py-1 rounded-full">
                    {item.category}
                  </span>

                  <h3 className="text-xl font-bold mt-4 mb-3">
                    Q{index + 1}. {item.question}
                  </h3>

                  <p className="text-gray-400 mb-2">Your Answer:</p>

                  <p className="text-gray-200 bg-white/5 rounded-xl p-4 mb-4">
                    {item.answer || "No answer given"}
                  </p>

                  <p className="text-gray-400 mb-2">AI Feedback:</p>

                  <p className="text-gray-200 bg-white/5 rounded-xl p-4">
                    {selectedQuestionSet.result?.question_feedback?.[index]
                      ?.feedback || "No feedback available"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Results;