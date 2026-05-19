import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PrepForm from "./pages/PrepForm";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Questions from "./pages/Questions";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompanyQuestions from "./pages/CompanyQuestions";
import CompanyPreviousEntries from "./pages/CompanyPreviousEntries";
import MockInterview from "./pages/MockInterview";
import MockInterviewHistory from "./pages/MockInterviewHistory";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prep-form" element={<PrepForm />} />
        <Route path="/results" element={<Results />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume-analysis" element={<ResumeAnalysis />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/company-questions" element={<CompanyQuestions />} />
        <Route path="/company-previous-entries" element={<CompanyPreviousEntries />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/mock-interview-history" element={<MockInterviewHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;