import { useEffect } from "react";

export default function MaintenancePage() {
  useEffect(() => {
    document.title = "Under Maintenance - Blocmark";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-3xl font-bold text-white mb-4">Under Maintenance</h1>
        <p className="text-white/90 text-lg mb-6">
          Login is currently disabled while we perform scheduled maintenance. 
        </p>
        <p className="text-white/80 mb-8">
          We'll be back online shortly. Thank you for your patience.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}