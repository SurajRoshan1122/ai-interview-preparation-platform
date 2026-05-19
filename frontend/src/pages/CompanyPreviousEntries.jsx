import { useEffect, useState } from "react";
import axios from "axios";

function CompanyPreviousEntries() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [sessions, setSessions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSet, setSelectedSet] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/company-question-history/${user.email}`
      );

      setSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch previous entries:", error);
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

  const sets = sessions.filter(
    (item) =>
      item.company === selectedCompany &&
      item.roles?.includes(selectedRole)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-cyan-400 mb-4">
          Previous Entries
        </h1>

        <p className="text-center text-gray-300 mb-12">
          Browse your company-wise interview practice history.
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white/10 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              History Browser
            </h2>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-200 mb-3">
                Companies
              </h3>

              <div className="space-y-3">
                {companies.length > 0 ? (
                  companies.map((company, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedCompany(company);
                        setSelectedRole("");
                        setSelectedSet(null);
                      }}
                      className={`w-full text-left rounded-xl p-4 border transition ${
                        selectedCompany === company
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                          : "bg-black/40 border-white/10 text-gray-300 hover:border-cyan-400"
                      }`}
                    >
                      {company}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-400">
                    No company entries found.
                  </p>
                )}
              </div>
            </div>

            {selectedCompany && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-200 mb-3">
                  Roles
                </h3>

                <div className="space-y-3">
                  {roles.map((role, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedRole(role);
                        setSelectedSet(null);
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

            {selectedRole && (
              <div>
                <h3 className="text-lg font-bold text-gray-200 mb-3">
                  Sets
                </h3>

                <div className="space-y-3">
                  {sets.map((set, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSet(set)}
                      className={`w-full text-left rounded-xl p-4 border transition ${
                        selectedSet?._id === set._id
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                          : "bg-black/40 border-white/10 text-gray-300 hover:border-cyan-400"
                      }`}
                    >
                      <p className="font-semibold">
                        Set #{sets.length - index}
                      </p>

                      <p className="text-cyan-400 text-sm">
                        Score: {set.result?.overall_score}/100
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white/10 border border-white/10 rounded-3xl p-8">
            {!selectedCompany && (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <h2 className="text-4xl font-bold text-cyan-400 mb-4">
                    Choose the company
                  </h2>

                  <p className="text-gray-300">
                    Select a company from the left panel to continue.
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

            {selectedCompany && selectedRole && !selectedSet && (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <h2 className="text-4xl font-bold text-cyan-400 mb-4">
                    Choose the set
                  </h2>

                  <p className="text-gray-300">
                    Select one saved question set to view details.
                  </p>
                </div>
              </div>
            )}

            {selectedSet && (
              <div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-3">
                  {selectedSet.company}
                </h2>

                <p className="text-gray-300 mb-8">
                  Role:{" "}
                  <span className="text-cyan-400 font-bold">
                    {selectedRole}
                  </span>
                </p>

                <div className="grid md:grid-cols-5 gap-4 mb-8">
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400">Overall</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {selectedSet.result?.overall_score}/100
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400">Technical</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {selectedSet.result?.technical_score}/100
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400">Communication</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {selectedSet.result?.communication_score}/100
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400">Problem Solving</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {selectedSet.result?.problem_solving_score}/100
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400">Company Fit</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {selectedSet.result?.company_fit_score}/100
                    </p>
                  </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 mb-8">
                  <h3 className="text-xl font-bold text-cyan-400 mb-3">
                    Overall Feedback
                  </h3>

                  <p className="text-gray-300">
                    {selectedSet.result?.overall_feedback}
                  </p>
                </div>

                <div className="space-y-6">
                  {selectedSet.questions?.map((item, index) => (
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

                      <p className="text-gray-200 bg-white/5 rounded-xl p-4 mb-4">
                        {item.answer || "No answer given"}
                      </p>

                      <p className="text-gray-400 mb-2">
                        AI Feedback:
                      </p>

                      <p className="text-gray-200 bg-white/5 rounded-xl p-4">
                        {selectedSet.result?.question_feedback?.[index]
                          ?.feedback || "No feedback available"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyPreviousEntries;