import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [profile, setProfile] = useState(null);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [mockHistory, setMockHistory] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const profileResponse = await axios.get(
        `http://127.0.0.1:5000/user-profile/${user.email}`
      );

      const resumeResponse = await axios.get(
        `http://127.0.0.1:5000/user-resumes/${user.email}`
      );

      const questionResponse = await axios.get(
        `http://127.0.0.1:5000/user-question-results/${user.email}`
      );

      const mockResponse = await axios.get(
        `http://127.0.0.1:5000/mock-interview-history/${user.email}`
      );

      setProfile(profileResponse.data.profile);
      setResumeHistory(resumeResponse.data);
      setQuestionHistory(questionResponse.data);
      setMockHistory(mockResponse.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
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

  const stats = [
    {
      title: "Resume ATS Score",
      value: latestResume ? `${latestResume.analysis?.ats_score}/100` : "—",
    },
    {
      title: "Latest Question Score",
      value: latestQuestion ? `${latestQuestion.result?.total_score}/100` : "—",
    },
    {
      title: "Latest Mock Score",
      value: latestMock ? `${latestMock.evaluation?.overall_score}/100` : "—",
    },
    {
      title: "Mock Interviews",
      value: completedMocks.length || "—",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-cyan-400 mb-4">
            Dashboard
          </h1>

          <p className="text-gray-300 text-lg">
            Welcome back,{" "}
            <span className="text-cyan-400 font-bold">
              {user?.name || "User"}
            </span>
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8"
            >
              <h2 className="text-gray-300 text-lg mb-4">{item.title}</h2>

              <p className="text-3xl font-bold text-cyan-400 break-words">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              Profile Summary
            </h2>

            {profile ? (
              <div className="space-y-5 text-gray-200">
                <p>
                  <span className="text-cyan-400 font-bold">Name:</span>{" "}
                  {profile.name}
                </p>

                <p>
                  <span className="text-cyan-400 font-bold">Role:</span>{" "}
                  {profile.role}
                </p>

                <p>
                  <span className="text-cyan-400 font-bold">Experience:</span>{" "}
                  {profile.experience}
                </p>

                <div>
                  <span className="text-cyan-400 font-bold">Skills:</span>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-cyan-400 font-bold">Projects:</span>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.projects?.map((project, index) => (
                      <span
                        key={index}
                        className="bg-white/10 border border-white/10 text-gray-200 px-3 py-1 rounded-full text-sm"
                      >
                        {project}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">
                No profile information available yet.
              </p>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              Performance Summary
            </h2>

            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-white font-semibold">
                  Average Question Score
                </p>
                <p className="text-cyan-400">
                  {averageQuestionScore === "—"
                    ? "—"
                    : `${averageQuestionScore}/100`}
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-white font-semibold">
                  Average Mock Interview Score
                </p>
                <p className="text-cyan-400">
                  {averageMockScore === "—" ? "—" : `${averageMockScore}/100`}
                </p>
              </div>

              {latestMock && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                  <p className="text-white font-semibold">
                    Latest Mock Company
                  </p>
                  <p className="text-cyan-400">{latestMock.company}</p>
                </div>
              )}

              {!latestResume && !latestQuestion && !latestMock && (
                <p className="text-gray-400">No activity available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;