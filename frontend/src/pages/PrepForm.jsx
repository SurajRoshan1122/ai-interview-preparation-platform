import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PrepForm() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    skills: [],
    projects: [],
    experience: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [projectInput, setProjectInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (!user?.email) {
        setProfileLoaded(true);
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:5000/user-profile/${user.email}`
      );

      if (response.data.profile) {
        const profile = response.data.profile;

        setFormData({
          name: profile.name || "",
          role: profile.role || "",
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          projects: Array.isArray(profile.projects) ? profile.projects : [],
          experience: profile.experience || "",
        });
      }

      setProfileLoaded(true);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setProfileLoaded(true);
    }
  };

  const isProfileSaved =
    formData.name ||
    formData.role ||
    formData.skills.length > 0 ||
    formData.projects.length > 0 ||
    formData.experience;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;

    setFormData({
      ...formData,
      skills: [...formData.skills, skillInput.trim()],
    });

    setSkillInput("");
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const addProject = () => {
    if (!projectInput.trim()) return;

    setFormData({
      ...formData,
      projects: [...formData.projects, projectInput.trim()],
    });

    setProjectInput("");
  };

  const removeProject = (index) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post("http://127.0.0.1:5000/save-profile", {
        email: user?.email,
        ...formData,
      });

      const apiData = {
        ...formData,
        skills: formData.skills.join(", "),
        projects: formData.projects.join(", "),
      };

      const response = await axios.post(
        "http://127.0.0.1:5000/generate-questions",
        apiData
      );

      localStorage.setItem("prepFormSubmitted", "true");
      localStorage.setItem("generatedQuestions", JSON.stringify(response.data));

      window.dispatchEvent(new Event("prepFormUpdated"));

      navigate("/questions");
    } catch (error) {
      console.error("Error saving profile/generating questions:", error);
      alert("Failed to save profile or generate questions.");
    } finally {
      setLoading(false);
    }
  };

  if (!profileLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <p className="text-cyan-400 text-xl font-bold">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex justify-center items-center px-6 py-28">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-10">
        <h1 className="text-4xl font-bold text-cyan-400 mb-3 text-center">
          {isProfileSaved ? "Skills & Info" : "Interview Preparation Form"}
        </h1>

        <p className="text-gray-300 text-center mb-8">
          {isProfileSaved
            ? "Update your skills, projects, and interview profile."
            : "Enter your details to generate AI-powered interview questions."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-300">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">Target Role</label>
            <input
              type="text"
              name="role"
              placeholder="Frontend Developer, Data Analyst..."
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">Skills</label>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add a skill, e.g. React"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
              />

              <button
                type="button"
                onClick={addSkill}
                className="bg-cyan-500 hover:bg-cyan-600 px-6 rounded-xl font-bold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 px-4 py-2 rounded-full flex items-center gap-3"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-300 hover:text-red-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">Projects</label>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add a project, e.g. AI Symptom Checker"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                className="flex-1 p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
              />

              <button
                type="button"
                onClick={addProject}
                className="bg-cyan-500 hover:bg-cyan-600 px-6 rounded-xl font-bold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {formData.projects.map((project, index) => (
                <span
                  key={index}
                  className="bg-white/10 border border-white/10 text-gray-200 px-4 py-2 rounded-full flex items-center gap-3"
                >
                  {project}
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="text-red-300 hover:text-red-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Experience Level
            </label>

            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
            >
              <option value="">Select Experience</option>
              <option value="Fresher">Fresher</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Experienced">Experienced</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              formData.skills.length === 0 ||
              formData.projects.length === 0
            }
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition py-4 rounded-xl text-lg font-bold"
          >
            {loading
              ? "Saving & Generating..."
              : isProfileSaved
              ? "Update & Regenerate Questions"
              : "Generate Interview Questions"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PrepForm;