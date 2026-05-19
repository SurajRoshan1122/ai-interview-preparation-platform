import { useEffect, useState } from "react";
import axios from "axios";

function MockInterview() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [company, setCompany] = useState("");
    const [roleInput, setRoleInput] = useState("");
    const [roles, setRoles] = useState([]);

    const [resumeHistory, setResumeHistory] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);

    const [uploadedResume, setUploadedResume] = useState(null);

    const [interviewStarted, setInterviewStarted] = useState(false);

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answer, setAnswer] = useState("");
    const [conversation, setConversation] = useState([]);
    const [latestFeedback, setLatestFeedback] = useState("");
    const [loadingNext, setLoadingNext] = useState(false);
    const [sessionId, setSessionId] = useState("");

    const [finalResult, setFinalResult] = useState(null);
    const [loadingFinish, setLoadingFinish] = useState(false);


    useEffect(() => {
        fetchResumeHistory();
    }, []);

    const fetchResumeHistory = async () => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:5000/user-resumes/${user.email}`
            );

            setResumeHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch resumes:", error);
        }
    };

    const addRole = () => {
        if (!roleInput.trim()) return;

        setRoles([...roles, roleInput.trim()]);
        setRoleInput("");
    };

    const removeRole = (index) => {
        setRoles(roles.filter((_, i) => i !== index));
    };

    const handleResumeUpload = (e) => {
        setUploadedResume(e.target.files[0]);
        setSelectedResume(null);
    };

    const speakText = (text) => {
        if (!text) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.95;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;

            setAnswer(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };
    };

    const handleStartInterview = async () => {
        if (!company.trim() || roles.length === 0) {
            alert("Please fill company and roles.");
            return;
        }

        if (!selectedResume && !uploadedResume) {
            alert("Please select or upload a resume.");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("email", user?.email || "");
            formData.append("company", company);
            formData.append("roles", JSON.stringify(roles));

            if (selectedResume) {
                formData.append("resume_id", selectedResume._id);
            }

            if (uploadedResume) {
                formData.append("resume", uploadedResume);
            }

            const response = await axios.post(
                "http://127.0.0.1:5000/start-mock-interview",
                formData
            );

            const newSessionId = response.data.session_id;

            setSessionId(newSessionId);

            const firstQuestion = {
                question: response.data.question,
                category: response.data.category,
            };

            setCurrentQuestion(firstQuestion);
            setConversation([firstQuestion]);

            speakText(firstQuestion.question);

            setInterviewStarted(true);
        } catch (error) {
            console.error(error);
            alert("Failed to start interview.");
        }
    };

    const handleNextQuestion = async () => {
        if (!sessionId) {
            alert("Session ID missing. Please restart the mock interview.");
            return;
        }

        try {
            setLoadingNext(true);

            console.log("SESSION ID:", sessionId);
            console.log("ANSWER:", answer);

            const response = await axios.post(
                "http://127.0.0.1:5000/next-mock-question",
                {
                    session_id: sessionId,
                    answer: answer,
                }
            );

            const nextQuestion = {
                question: response.data.question,
                category: response.data.category,
            };

            setLatestFeedback(response.data.feedback);
            setCurrentQuestion(nextQuestion);
            speakText(nextQuestion.question);
            setConversation((prev) => [...prev, nextQuestion]);
            setAnswer("");
        } catch (error) {
            console.error("Next question error:", error);
            console.error("Backend response:", error.response?.data);
            alert(error.response?.data?.error || "Failed to get next question.");
        } finally {
            setLoadingNext(false);
        }
    };

    const handleFinishInterview = async () => {
        try {
            setLoadingFinish(true);

            const response = await axios.post(
                "http://127.0.0.1:5000/finish-mock-interview",
                {
                    session_id: sessionId,
                }
            );

            setFinalResult(response.data);
        } catch (error) {
            console.error(error);
            alert("Failed to finish interview.");
        } finally {
            setLoadingFinish(false);
        }
    };

    if (interviewStarted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-28">
                <div className="max-w-4xl mx-auto bg-white/10 border border-white/10 rounded-3xl p-10">
                    <h1 className="text-5xl font-bold text-cyan-400 mb-4 text-center">
                        AI Mock Interview
                    </h1>

                    <p className="text-center text-gray-300 mb-10">
                        {company} · {roles.join(", ")}
                    </p>

                    <div className="mb-6">
                        <span className="text-sm bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 px-3 py-1 rounded-full">
                            {currentQuestion?.category}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold mb-6">
                        {currentQuestion?.question}
                    </h2>

                    {latestFeedback && (
                        <div className="bg-green-500/10 border border-green-400/30 text-green-300 rounded-xl p-4 mb-6">
                            {latestFeedback}
                        </div>
                    )}

                    <textarea
                        rows="7"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
                    />
                    <button
                        onClick={startListening}
                        className="w-full mt-4 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition py-3 rounded-xl font-bold"
                    >
                        🎤 Speak Answer
                    </button>

                    <button
                        onClick={handleNextQuestion}
                        disabled={!answer.trim() || loadingNext || !sessionId}
                        className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition py-4 rounded-xl text-lg font-bold"
                    >
                        {loadingNext ? "Generating Next Question..." : "Submit Answer & Next Question"}
                    </button>
                    <button
                        onClick={handleFinishInterview}
                        disabled={loadingFinish || conversation.length < 3}
                        className="w-full mt-4 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black disabled:border-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed transition py-4 rounded-xl text-lg font-bold"
                    >
                        {loadingFinish ? "Evaluating Interview..." : "Finish Interview"}
                    </button>
                    {finalResult && (
                        <div className="mt-10 bg-white/10 border border-white/10 rounded-3xl p-8">
                            <h2 className="text-3xl font-bold text-cyan-400 mb-6">
                                Final Interview Evaluation
                            </h2>

                            <div className="grid md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                    <p className="text-gray-400">Overall</p>
                                    <p className="text-3xl font-bold text-cyan-400">
                                        {finalResult.overall_score}/100
                                    </p>
                                </div>

                                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                    <p className="text-gray-400">Confidence</p>
                                    <p className="text-3xl font-bold text-cyan-400">
                                        {finalResult.confidence_score}/100
                                    </p>
                                </div>

                                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                    <p className="text-gray-400">Communication</p>
                                    <p className="text-3xl font-bold text-cyan-400">
                                        {finalResult.communication_score}/100
                                    </p>
                                </div>

                                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                    <p className="text-gray-400">Clarity</p>
                                    <p className="text-3xl font-bold text-cyan-400">
                                        {finalResult.clarity_score}/100
                                    </p>
                                </div>

                                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                    <p className="text-gray-400">Technical Depth</p>
                                    <p className="text-3xl font-bold text-cyan-400">
                                        {finalResult.technical_depth_score}/100
                                    </p>
                                </div>

                                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                    <p className="text-gray-400">Company Fit</p>
                                    <p className="text-3xl font-bold text-cyan-400">
                                        {finalResult.company_fit_score}/100
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-300 mb-6">
                                {finalResult.overall_feedback}
                            </p>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="text-xl font-bold text-cyan-400 mb-3">
                                        Strengths
                                    </h3>
                                    {finalResult.strengths?.map((item, index) => (
                                        <p key={index} className="bg-black/40 rounded-xl p-3 mb-2">
                                            {item}
                                        </p>
                                    ))}
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-cyan-400 mb-3">
                                        Weaknesses
                                    </h3>
                                    {finalResult.weaknesses?.map((item, index) => (
                                        <p key={index} className="bg-black/40 rounded-xl p-3 mb-2">
                                            {item}
                                        </p>
                                    ))}
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-cyan-400 mb-3">
                                        Improvement Tips
                                    </h3>
                                    {finalResult.improvement_tips?.map((item, index) => (
                                        <p key={index} className="bg-black/40 rounded-xl p-3 mb-2">
                                            {item}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-28">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-5xl font-bold text-center text-cyan-400 mb-4">
                    AI Mock Interview
                </h1>

                <p className="text-center text-gray-300 mb-12">
                    Prepare for real interviews with AI-powered company-specific mock
                    interviews.
                </p>

                <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-10">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Company */}
                        <div>
                            <label className="block mb-3 text-gray-300">
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

                        {/* Roles */}
                        <div>
                            <label className="block mb-3 text-gray-300">
                                Target Role / Roles
                            </label>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Software Engineer..."
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

                    {/* Resume Selection */}
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold text-cyan-400 mb-6">
                            Choose Resume
                        </h2>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Existing Resumes */}
                            <div>
                                <h3 className="text-xl font-bold mb-4">
                                    Previous Resumes
                                </h3>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {resumeHistory.length > 0 ? (
                                        resumeHistory.map((resume, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedResume(resume);
                                                    setUploadedResume(null);
                                                }}
                                                className={`w-full text-left border rounded-2xl p-5 transition ${selectedResume?._id === resume._id
                                                    ? "bg-cyan-500/20 border-cyan-400"
                                                    : "bg-black/40 border-white/10 hover:border-cyan-400"
                                                    }`}
                                            >
                                                <p className="font-bold text-white">
                                                    {resume.file_name}
                                                </p>

                                                <p className="text-cyan-400 mt-2">
                                                    ATS Score: {resume.analysis?.ats_score}/100
                                                </p>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-gray-400">
                                            No previous resumes found.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Upload New Resume */}
                            <div>
                                <h3 className="text-xl font-bold mb-4">
                                    Upload New Resume
                                </h3>

                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400/40 rounded-3xl p-12 cursor-pointer hover:bg-cyan-400/10 transition">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleResumeUpload}
                                        className="hidden"
                                    />

                                    <div className="text-6xl mb-4">📄</div>

                                    <h2 className="text-2xl font-bold text-cyan-400 mb-2">
                                        Upload Resume
                                    </h2>

                                    <p className="text-gray-300 text-center">
                                        Upload a new resume for this interview.
                                    </p>

                                    {uploadedResume && (
                                        <p className="mt-6 text-green-400 font-semibold">
                                            {uploadedResume.name}
                                        </p>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleStartInterview}
                        className="w-full mt-12 bg-cyan-500 hover:bg-cyan-600 transition py-5 rounded-2xl text-xl font-bold"
                    >
                        Start Mock Interview
                    </button>
                    <button
                        type="button"
                        onClick={() => window.location.href = "/mock-interview-history"}
                        className="w-full mt-6 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition py-5 rounded-2xl text-xl font-bold"
                    >
                        Previous Interviews
                    </button>
                </div>
            </div>
        </div>
    );

}



export default MockInterview;