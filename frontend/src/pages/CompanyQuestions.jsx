import { useState } from "react";
import axios from "axios";

function CompanyQuestions() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [company, setCompany] = useState("");
    const [roleInput, setRoleInput] = useState("");
    const [roles, setRoles] = useState([]);

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [loadingVerify, setLoadingVerify] = useState(false);

    const addRole = () => {
        if (!roleInput.trim()) return;

        setRoles([...roles, roleInput.trim()]);
        setRoleInput("");
    };

    const removeRole = (index) => {
        setRoles(roles.filter((_, i) => i !== index));
    };

    const handleGenerateQuestions = async () => {
        if (!company.trim() || roles.length === 0) return;

        try {
            setLoadingQuestions(true);
            setResult(null);
            setAnswers({});

            const response = await axios.post(
                "http://127.0.0.1:5000/generate-company-questions",
                {
                    company,
                    roles,
                }
            );

            setQuestions(response.data.questions || []);
        } catch (error) {
            console.error(error);
            alert("Failed to generate company questions.");
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleAnswerChange = (index, value) => {
        setAnswers({
            ...answers,
            [index]: value,
        });
    };

    const handleVerifyAnswers = async () => {
        const formattedAnswers = questions.map((item, index) => ({
            category: item.category,
            question: item.question,
            answer: answers[index] || "",
        }));

        try {
            setLoadingVerify(true);

            const response = await axios.post(
                "http://127.0.0.1:5000/verify-company-answers",
                {
                    email: user?.email,
                    company,
                    roles,
                    answers: formattedAnswers,
                }
            );

            setResult(response.data);
        } catch (error) {
            console.error(error);
            alert("Failed to verify answers.");
        } finally {
            setLoadingVerify(false);
        }
    };

    const totalAnswered = Object.values(answers).filter(
        (answer) => answer.trim() !== ""
    ).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-28">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-5xl font-bold text-center text-cyan-400 mb-4">
                    Smart Question Generator
                </h1>

                <p className="text-center text-gray-300 mb-12">
                    Generate company-specific interview questions based on your target
                    company and role.
                </p>

                <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-10">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 text-gray-300">
                                Company Name
                            </label>

                            <input
                                type="text"
                                placeholder="Google, TCS, Amazon..."
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-gray-300">
                                Target Role / Roles
                            </label>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Software Engineer, Data Analyst..."
                                    value={roleInput}
                                    onChange={(e) => setRoleInput(e.target.value)}
                                    className="flex-1 p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
                                />

                                <button
                                    type="button"
                                    onClick={addRole}
                                    className="bg-cyan-500 hover:bg-cyan-600 px-6 rounded-xl font-bold"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4">
                                {roles.map((role, index) => (
                                    <span
                                        key={index}
                                        className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 px-4 py-2 rounded-full flex items-center gap-3"
                                    >
                                        {role}

                                        <button
                                            type="button"
                                            onClick={() => removeRole(index)}
                                            className="text-red-300 hover:text-red-500 font-bold"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mt-8">
                        <button
                            onClick={handleGenerateQuestions}
                            disabled={!company.trim() || roles.length === 0 || loadingQuestions}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition py-4 rounded-xl text-lg font-bold"
                        >
                            {loadingQuestions ? "Generating Questions..." : "Generate Questions"}
                        </button>

                        <button
                            type="button"
                            onClick={() => window.location.href = "/company-previous-entries"}
                            className="w-full border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition py-4 rounded-xl text-lg font-bold"
                        >
                            Previous Entries
                        </button>
                    </div>
                </div>

                {questions.length > 0 && (
                    <>
                        <p className="text-center text-gray-400 mb-8">
                            Answered {totalAnswered} out of {questions.length} questions
                        </p>

                        <div className="space-y-8">
                            {questions.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white/10 border border-white/10 rounded-3xl p-8"
                                >
                                    <div className="mb-4">
                                        <span className="text-sm bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 px-3 py-1 rounded-full">
                                            {item.category}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-5">
                                        <span className="text-cyan-400">Q{index + 1}.</span>{" "}
                                        {item.question}
                                    </h2>

                                    <textarea
                                        value={answers[index] || ""}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        rows="5"
                                        disabled={!!result}
                                        placeholder="Type your answer here..."
                                        className="w-full p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                                    />
                                </div>
                            ))}
                        </div>

                        {result && (
                            <div className="mt-10 bg-white/10 border border-white/10 rounded-3xl p-8">
                                <h2 className="text-3xl font-bold text-cyan-400 mb-6">
                                    AI Evaluation Result
                                </h2>

                                <div className="grid md:grid-cols-5 gap-4 mb-8">
                                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                        <p className="text-gray-400">Overall</p>
                                        <p className="text-2xl font-bold text-cyan-400">
                                            {result.overall_score}/100
                                        </p>
                                    </div>

                                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                        <p className="text-gray-400">Technical</p>
                                        <p className="text-2xl font-bold text-cyan-400">
                                            {result.technical_score}/100
                                        </p>
                                    </div>

                                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                        <p className="text-gray-400">Communication</p>
                                        <p className="text-2xl font-bold text-cyan-400">
                                            {result.communication_score}/100
                                        </p>
                                    </div>

                                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                        <p className="text-gray-400">Problem Solving</p>
                                        <p className="text-2xl font-bold text-cyan-400">
                                            {result.problem_solving_score}/100
                                        </p>
                                    </div>

                                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                        <p className="text-gray-400">Company Fit</p>
                                        <p className="text-2xl font-bold text-cyan-400">
                                            {result.company_fit_score}/100
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-300 mb-8">
                                    {result.overall_feedback}
                                </p>

                                <div className="space-y-4">
                                    {result.question_feedback?.map((item, index) => (
                                        <div
                                            key={index}
                                            className="bg-black/40 border border-white/10 rounded-xl p-5"
                                        >
                                            <h4 className="font-bold text-cyan-400 mb-2">
                                                Q{index + 1} Feedback
                                            </h4>

                                            <p className="text-gray-300">{item.feedback}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={result ? handleGenerateQuestions : handleVerifyAnswers}
                            disabled={loadingVerify || loadingQuestions || totalAnswered === 0}
                            className="w-full mt-10 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed py-4 rounded-xl text-lg font-bold"
                        >
                            {loadingVerify
                                ? "Verifying Answers..."
                                : loadingQuestions
                                    ? "Generating New Set..."
                                    : result
                                        ? "Generate New Set"
                                        : "Verify All Answers"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default CompanyQuestions;