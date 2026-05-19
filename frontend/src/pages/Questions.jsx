import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Questions() {
    const isSubmitted = localStorage.getItem("prepFormSubmitted") === "true";
    const userData = JSON.parse(localStorage.getItem("prepUserData"));
    const savedQuestions = JSON.parse(localStorage.getItem("generatedQuestions"));

    const [questions, setQuestions] = useState(savedQuestions);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    if (!isSubmitted || !userData || !questions) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-28">
                <div className="max-w-3xl mx-auto bg-white/10 border border-white/10 rounded-3xl p-10 text-center">
                    <h1 className="text-4xl font-bold text-cyan-400 mb-4">
                        Fill the Form First
                    </h1>

                    <p className="text-gray-300 mb-8">
                        Please complete the interview preparation form before practicing questions.
                    </p>

                    <Link to="/prep-form">
                        <button className="bg-cyan-500 hover:bg-cyan-600 px-8 py-4 rounded-xl font-bold">
                            Go to Prep Form
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const allQuestions = [
        ...(questions.hr || []).map((q) => ({ category: "HR", question: q })),
        ...(questions.technical || []).map((q) => ({
            category: "Technical",
            question: q,
        })),
        ...(questions.project || []).map((q) => ({
            category: "Project",
            question: q,
        })),
    ];

    const handleAnswerChange = (index, value) => {
        setAnswers({
            ...answers,
            [index]: value,
        });
    };

    const handleVerifyAll = async () => {
        const formattedAnswers = allQuestions.map((item, index) => ({
            category: item.category,
            question: item.question,
            answer: answers[index] || "",
        }));

        try {
            setLoadingVerify(true);

            const response = await axios.post(
                "http://127.0.0.1:5000/verify-all-answers",
                {
                    email: JSON.parse(localStorage.getItem("user"))?.email,
                    role: userData.role,
                    skills: Array.isArray(userData.skills)
                        ? userData.skills.join(", ")
                        : userData.skills,
                    answers: formattedAnswers,
                }
            );

            setResult(response.data);
            const oldHistory = JSON.parse(localStorage.getItem("questionScores")) || [];

            const newRecord = {
                ...response.data,
                date: new Date().toISOString(),
            };

            localStorage.setItem(
                "questionScores",
                JSON.stringify([newRecord, ...oldHistory])
            );
        } catch (error) {
            console.error(error);
            alert("Failed to verify answers. Please check backend.");
        } finally {
            setLoadingVerify(false);
        }
    };

    const handleGenerateNewQuestions = async () => {
        try {
            setLoadingQuestions(true);

            const apiData = {
                ...userData,
                skills: Array.isArray(userData.skills)
                    ? userData.skills.join(", ")
                    : userData.skills,
                projects: Array.isArray(userData.projects)
                    ? userData.projects.join(", ")
                    : userData.projects,
            };

            const response = await axios.post(
                "http://127.0.0.1:5000/generate-questions",
                apiData
            );

            localStorage.setItem("generatedQuestions", JSON.stringify(response.data));

            setQuestions(response.data);
            setAnswers({});
            setResult(null);
        } catch (error) {
            console.error(error);
            alert("Failed to generate new questions.");
        } finally {
            setLoadingQuestions(false);
        }
    };

    const totalAnswered = Object.values(answers).filter(
        (answer) => answer.trim() !== ""
    ).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-28">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-5xl font-bold text-center text-cyan-400 mb-4">
                    Practice Questions
                </h1>

                <p className="text-center text-gray-300 mb-2">
                    Answer all questions for{" "}
                    <span className="text-cyan-400 font-bold">{userData.role}</span>
                </p>

                <p className="text-center text-gray-400 mb-10">
                    Answered {totalAnswered} out of {allQuestions.length} questions
                </p>

                <div className="space-y-8">
                    {allQuestions.map((item, index) => (
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
                        <h2 className="text-3xl font-bold text-cyan-400 mb-5">
                            AI Evaluation Result
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-gray-300 mb-2">Total Score</h3>
                                <p className="text-5xl font-bold text-cyan-400">
                                    {result.total_score}/100
                                </p>
                            </div>

                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 md:col-span-2">
                                <h3 className="text-gray-300 mb-2">Overall Feedback</h3>
                                <p className="text-gray-200">{result.overall_feedback}</p>
                            </div>
                        </div>

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
                    onClick={result ? handleGenerateNewQuestions : handleVerifyAll}
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
            </div>
        </div>
    );
}

export default Questions;