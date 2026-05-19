import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-40">

        <h1 className="text-6xl font-extrabold leading-tight max-w-5xl">
          Crack Interviews with
          <span className="text-cyan-400"> AI-Powered </span>
          Preparation
        </h1>

        <p className="mt-6 text-gray-300 text-xl max-w-2xl">
          Generate interview questions, analyze resumes,
          practice mock interviews, and improve your confidence
          using AI.
        </p>

        <div className="mt-10 flex gap-5">

          <Link to="/prep-form">
            <button className="bg-cyan-500 hover:bg-cyan-600 transition px-8 py-4 rounded-2xl font-bold text-lg">
              Start Preparing
            </button>
          </Link>

          <Link to="/resume-analysis">
            <button className="border border-cyan-400 hover:bg-cyan-400 hover:text-black transition px-8 py-4 rounded-2xl font-bold text-lg">
              Analyze Resume
            </button>
          </Link>

        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 px-10 py-24">

        {/* Resume Analysis */}
        <button
          onClick={() => window.location.href = "/resume-analysis"}
          className="text-left bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10 hover:border-cyan-400 hover:scale-105 transition duration-300"
        >
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            Resume Analysis
          </h2>

          <p className="text-gray-300">
            Upload your resume and get AI-generated feedback,
            ATS insights, missing keywords, and improvement suggestions.
          </p>
        </button>

        {/* AI Mock Interviews */}
        <button
          onClick={() => window.location.href = "/mock-interview"}
          className="text-left bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10 hover:border-cyan-400 hover:scale-105 transition duration-300"
        >
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            AI Mock Interviews
          </h2>

          <p className="text-gray-300">
            Practice real interview questions with AI-generated
            responses and performance scoring.
          </p>
        </button>

        {/* Smart Question Generator */}
        <button
          onClick={() => window.location.href = "/company-questions"}
          className="text-left bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10 hover:border-cyan-400 hover:scale-105 transition duration-300"
        >
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            Smart Question Generator
          </h2>

          <p className="text-gray-300">
            Generate company-specific and role-specific interview
            questions instantly.
          </p>
        </button>

      </div>
    </div>
  );
}

export default Home;