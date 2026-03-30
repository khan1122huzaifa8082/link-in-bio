import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="max-w-3xl text-center space-y-8 animate-fade-in-up">
        {/* Upgraded Typography */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">
          The Ultimate{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Link-in-Bio
          </span>{" "}
          Tool
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          One link to rule them all. Build your stunning custom profile in
          seconds, powered by AI, and share it with the world.
        </p>

        <div className="flex justify-center pt-4">
          <SignedOut>
            {/* FIXED: The styling is now applied to an actual <button> inside the Clerk component */}
            <SignInButton mode="modal">
              <button className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl">
                Get Started for Free
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col items-center gap-6">
              {/* Made the User Avatar slightly bigger for the landing page */}
              <UserButton
                appearance={{ elements: { userButtonAvatarBox: "w-12 h-12" } }}
              />

              <Link
                to="/dashboard"
                className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                Go to Dashboard
              </Link>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
