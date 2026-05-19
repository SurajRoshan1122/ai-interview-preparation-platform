import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const [isSubmitted, setIsSubmitted] = useState(
    localStorage.getItem("prepFormSubmitted") === "true"
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const [showLogoutBox, setShowLogoutBox] = useState(false);

  useEffect(() => {
    const updateNavbar = () => {
      setIsSubmitted(localStorage.getItem("prepFormSubmitted") === "true");
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    window.addEventListener("prepFormUpdated", updateNavbar);
    window.addEventListener("authUpdated", updateNavbar);
    window.addEventListener("storage", updateNavbar);

    return () => {
      window.removeEventListener("prepFormUpdated", updateNavbar);
      window.removeEventListener("authUpdated", updateNavbar);
      window.removeEventListener("storage", updateNavbar);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    setUser(null);
    setShowLogoutBox(false);

    window.dispatchEvent(new Event("authUpdated"));

    navigate("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-5 bg-black/40 backdrop-blur-lg border-b border-white/10">
        <Link to="/" className="text-3xl font-bold text-cyan-400">
          PrepWise AI
        </Link>

        <div className="flex gap-8 text-gray-300 font-medium items-center">
          <Link to="/" className="hover:text-cyan-400 transition">
            Home
          </Link>

          <Link to="/prep-form" className="hover:text-cyan-400 transition">
            {isSubmitted ? "Skills & Info" : "Prepare"}
          </Link>

          <Link to="/resume-analysis" className="hover:text-cyan-400 transition">
            Resume Analysis
          </Link>

          <Link to="/questions" className="hover:text-cyan-400 transition">
            Questions
          </Link>

          <Link to="/results" className="hover:text-cyan-400 transition">
            Results
          </Link>

          <Link to="/dashboard" className="hover:text-cyan-400 transition">
            Dashboard
          </Link>

          {user ? (
            <button
              onClick={() => setShowLogoutBox(true)}
              className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 px-4 py-2 rounded-xl font-semibold hover:bg-cyan-500/30 transition"
            >
              {user.name}
            </button>
          ) : (
            <Link to="/login" className="hover:text-cyan-400 transition">
              Login
            </Link>
          )}
        </div>
      </nav>

      {showLogoutBox && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-white text-center">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              Sign Out?
            </h2>

            <p className="text-gray-300 mb-8">
              Are you sure you want to sign out of your account?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutBox(false)}
                className="w-full border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition py-3 rounded-xl font-bold"
              >
                Cancel
              </button>

              <button
                onClick={handleSignOut}
                className="w-full bg-red-500 hover:bg-red-600 transition py-3 rounded-xl font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;