import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PublicProfile() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const fetchPublicData = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username.toLowerCase())
        .single();

      if (profileError || !profileData) {
        setError(true);
        setIsLoading(false);
        return;
      }
      setProfile(profileData);

      const { data: linksData } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", profileData.id)
        .order("sort_order", { ascending: true });

      if (linksData) setLinks(linksData);
      setIsLoading(false);
    };

    fetchPublicData();
  }, [username]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );

  if (error || !profile)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-6xl font-black mb-4">404</h1>
        <Link
          to="/"
          className="bg-white/10 px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-colors"
        >
          Claim this username
        </Link>
      </div>
    );

  // Theme Configurations
  const isDark = theme === "dark";
  const bgImage = isDark
    ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" // Dark Waves
    : "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2564&auto=format&fit=crop"; // Vibrant Colorful Pastel Gradient

  // BULLETPROOF FALLBACK: Display Name -> Username -> "?"
  const initialLetter = (profile.display_name || profile.username || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div
        className={`min-h-screen relative flex justify-center md:py-16 lg:py-24 px-4 md:px-8 font-sans bg-cover bg-center bg-fixed transition-colors duration-700 ${isDark ? "selection:bg-white selection:text-black" : "selection:bg-black selection:text-white"}`}
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div
          className={`absolute inset-0 z-0 transition-colors duration-700 ${isDark ? "bg-black/40" : "bg-white/30"}`}
        ></div>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`absolute top-6 right-6 z-50 p-3 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 hover:scale-110 ${isDark ? "bg-black/50 border-white/20 text-white hover:bg-white/10" : "bg-white/50 border-black/20 text-black hover:bg-black/10"}`}
          title="Toggle Theme"
        >
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>

        <div
          className={`relative z-10 w-full max-w-sm md:max-w-2xl lg:max-w-5xl backdrop-blur-2xl md:shadow-2xl rounded-3xl flex flex-col lg:flex-row overflow-hidden border transition-all duration-700 animate-fade-in-up ${isDark ? "bg-black/50 border-white/10 hover:shadow-[0_0_60px_rgba(0,0,0,0.6)]" : "bg-white/60 border-black/5 hover:shadow-[0_0_60px_rgba(255,255,255,0.8)]"}`}
        >
          <div
            className={`lg:w-2/5 p-10 md:p-14 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r transition-colors duration-700 ${isDark ? "text-white border-white/10" : "text-gray-900 border-black/10"}`}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className={`w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full mb-6 object-cover border-4 shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer ${isDark ? "border-white/20 hover:border-white/60" : "border-white hover:border-blue-400"}`}
              />
            ) : (
              <div
                className={`w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 backdrop-blur-md rounded-full mb-6 shadow-2xl flex items-center justify-center text-5xl lg:text-7xl font-light border-4 hover:scale-105 transition-all duration-500 cursor-pointer ${isDark ? "bg-black/40 text-white border-white/20 hover:border-white/60" : "bg-white/80 text-gray-800 border-white hover:border-blue-400"}`}
              >
                {initialLetter}
              </div>
            )}

            <h1 className="font-extrabold text-3xl md:text-4xl text-center mb-2 tracking-tight drop-shadow-md">
              {profile.display_name || `@${profile.username}`}
            </h1>
            <p
              className={`text-sm md:text-base font-medium mb-6 px-4 py-1.5 rounded-full border shadow-inner transition-colors duration-700 ${isDark ? "bg-black/40 text-gray-300 border-white/10" : "bg-white/60 text-blue-700 border-black/5"}`}
            >
              @{profile.username}
            </p>
            {profile.bio && (
              <p
                className={`text-base md:text-lg text-center leading-relaxed whitespace-pre-wrap font-medium drop-shadow-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}
              >
                {profile.bio}
              </p>
            )}
          </div>

          <div className="lg:w-3/5 p-8 md:p-14 flex flex-col justify-center">
            <h2
              className={`hidden lg:block text-xs font-bold uppercase tracking-widest mb-8 text-center transition-colors duration-700 ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              Explore My Content
            </h2>

            <div className="w-full space-y-4 md:space-y-5">
              {links.length === 0 ? (
                <p
                  className={`text-center italic py-8 rounded-2xl border ${isDark ? "text-gray-400 bg-black/20 border-white/5" : "text-gray-500 bg-white/40 border-black/5"}`}
                >
                  No links added yet.
                </p>
              ) : (
                links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-4 md:py-5 px-6 backdrop-blur-xl rounded-2xl border flex items-center justify-center font-bold text-base md:text-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out 
                    ${
                      isDark
                        ? "bg-white/5 border-white/10 text-gray-200 hover:bg-white hover:text-black hover:shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                        : "bg-black/[0.03] border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-gray-800 hover:bg-white/60 hover:text-black hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                    }`}
                  >
                    {link.title}
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
