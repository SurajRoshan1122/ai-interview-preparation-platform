import { useEffect, useState } from "react";
import axios from "axios";

function MockInterviewHistory() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [sessions, setSessions] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/mock-interview-history/${user.email}`
      );

      setSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch mock interview history:", error);
    }
  };

  const companies = [...new Set(sessions.map((item) => item.company))];

  const roles = [
    ...new Set(
      sessions
        .filter((item) => item.company === selectedCompany)
        .flatMap((item) => item.roles || [])
    ),
  ];

  const interviews = sessions.filter(
    (item) =>
      item.company === selectedCompany &&
      item.roles?.includes(selectedRole)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-cyan-400 mb-4">
          Mock Interview History
        </h1>

        <p className="text-center text-gray-300 mb-12">
          Browse all your AI mock interview sessions.
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT PANEL */}
          <div className="lg:col-span-1 bg-white/10 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              Interview Browser
            </h2>

            {/* Companies */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3">
                Companies
              </h3>

              <div className="space-y-3">
                {companies.map((company, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedCompany(company);
                      setSelectedRole("");
                      setSelectedInterview(null);
                    }}
                    className={`w-full text-left rounded-xl p-4 border transition ${
                      selectedCompany === company
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                        : "bg-black/40 border-white/10 text-gray-300 hover:border-cyan-400"
                    }`}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>

            {/* Roles */}
            {selectedCompany && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-3">
                  Roles
                </h3>

                <div className="space-y-3">
                  {roles.map((role, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedRole(role);
                        setSelectedInterview(null);
                      }}
                      className={`w-full text-left rounded-xl p-4 border transition ${
                        selectedRole === role
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                          : "bg-black/40 border-white/10 text-gray-300 hover:border-cyan-400"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sessions */}
            {selectedRole && (
              <div>
                <h3 className="text-lg font-bold mb-3">
                  Sessions
                </h3>

                <div className="space-y-3">
                  {interviews.map((session, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedInterview(session)}
                      className={`w-full text-left rounded-xl p-4 border transition ${
                        selectedInterview?._id === session._id
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                          : "bg-black/40 border-white/10 text-gray-300 hover:border-cyan-400"
                      }`}
                    >
                      <p className="font-semibold">
                        Interview #{interviews.length - index}
                      </p>

                      <p className="text-cyan-400 text-sm mt-2">
                        Score:{" "}
                        {session.evaluation?.overall_score || "—"}/100
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-2 bg-white/10 border border-white/10 rounded-3xl p-8">
            {!selectedCompany && (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <h2 className="text-4xl font-bold text-cyan-400 mb-4">
                    Choose the company
                  </h2>

                  <p className="text-gray-300">
                    Select a company to continue.
                  </p>
                </div>
              </div>
            )}

            {selectedCompany && !selectedRole && (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <h2 className="text-4xl font-bold text-cyan-400 mb-4">
                    Choose the role
                  </h2>

                  <p className="text-gray-300">
                    Select a role under {selectedCompany}.
                  </p>
                </div>
              </div>
            )}

            {selectedCompany &&
              selectedRole &&
              !selectedInterview && (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <h2 className="text-4xl font-bold text-cyan-400 mb-4">
                      Choose the session
                    </h2>

                    <p className="text-gray-300">
                      Select one interview session to view details.
                    </p>
                  </div>
                </div>
              )}

            {selectedInterview && (
              <div>
                <h2 className="text-4xl font-bold text-cyan-400 mb-3">
                  {selectedInterview.company}
                </h2>

                <p className="text-gray-300 mb-8">
                  {selectedRole}
                </p>

                {/* Scores */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400">Overall</p>
                    <p className="text-3xl font-bold text-cyan-400">
                      {selectedInterview.evaluation?.overall_score}/100
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400">Confidence</p>
                    <p className="text-3xl font-bold text-cyan-400">
                      {selectedInterview.evaluation?.confidence_score}/100
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400">Communication</p>
                    <p className="text-3xl font-bold text-cyan-400">
                      {selectedInterview.evaluation?.communication_score}/100
                    </p>
                  </div>
                </div>

                {/* Feedback */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 mb-8">
                  <h3 className="text-xl font-bold text-cyan-400 mb-3">
                    Overall Feedback
                  </h3>

                  <p className="text-gray-300">
                    {selectedInterview.evaluation?.overall_feedback}
                  </p>
                </div>

                {/* Conversation */}
                <div className="space-y-6">
                  {selectedInterview.conversation?.map(
                    (item, index) => (
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

                        <p className="text-gray-400 mb-2">
                          Your Answer:
                        </p>

                        <p className="text-gray-200 bg-white/5 rounded-xl p-4">
                          {item.answer || "No answer given"}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockInterviewHistory;