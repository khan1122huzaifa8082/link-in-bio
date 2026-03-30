import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setResponse("");

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `You are the AI Co-Pilot for a 'Link-in-Bio' website dashboard. 
        CRITICAL RULES:
        1. Keep your answers EXTREMELY short and punchy. Maximum 2 to 3 sentences unless listing specific ideas.
        2. If they ask how to use the site, tell them they can update their profile picture URL, username, and bio, and add/reorder links.
        3. Never write long, generic essays.`,
      });

      const result = await model.generateContent(prompt);
      setResponse(result.response.text());
    } catch (error) {
      setResponse(
        "Oops! The AI is taking a nap. Check your console for errors.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all duration-300 z-50 animate-bounce"
        title="Ask AI for help!"
      >
        <span className="text-2xl">✨</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-2">
          <span>✨</span> AI Co-Pilot
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white font-bold text-xl"
        >
          ×
        </button>
      </div>

      <div className="p-5 max-h-[400px] overflow-y-auto bg-gray-50">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm shadow-inner"
          rows="3"
          placeholder="Need bio ideas? Ask me!"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        ></textarea>

        <button
          onClick={handleAskAI}
          disabled={isLoading || !prompt}
          className="w-full bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors shadow-md"
        >
          {isLoading ? "Thinking..." : "Ask AI"}
        </button>

        {response && (
          <div className="mt-4 animate-fade-in-up">
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-3 text-sm text-gray-700 leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p className="mb-2 last:mb-0" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-gray-900" {...props} />
                  ),
                }}
              >
                {response}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
