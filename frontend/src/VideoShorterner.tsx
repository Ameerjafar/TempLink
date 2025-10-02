import { useState } from "react";
import {
  Link2,
  Clock,
  Video,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function VideoShortener() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [expirySeconds, setExpirySeconds] = useState(3600);
  const [shortUrl, setShortUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    if (!originalUrl) {
      setError("Please enter a video URL");
      return;
    }

    setLoading(true);
    setError("");
    setShortUrl("");

    try {
      const response = await fetch("http://localhost:5000/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            originalUrl,
            expirySeconds,
          }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to shorten URL");
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      setExpiresAt(new Date(data.expiresAt).toLocaleString());
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiryOptions = [
    { label: "1 Hour", value: 3600 },
    { label: "6 Hours", value: 21600 },
    { label: "24 Hours", value: 86400 },
    { label: "3 Days", value: 259200 },
    { label: "7 Days", value: 604800 }, 
  ];
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4">
              <Video className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              Video URL Shortener
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </h1>
            <p className="text-white text-opacity-80">
              Create secure, temporary links for your video content
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-6">
            {/* Video URL Input */}
            <div>
              <label className="block text-white font-medium mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Video URL
              </label>
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full px-4 py-3 text-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-black placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition"
              />
            </div>

            {/* Expiry Selection */}
            <div>
              <label className="block text-white font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Link Expires In
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {expiryOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setExpirySeconds(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      expirySeconds === option.value
                        ? "bg-white  text-purple-600 shadow-lg"
                        : "bg-opacity-20 text-white hover:bg-opacity-30"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-lg p-4 text-white">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleShorten}
              disabled={loading}
              className="w-full bg-white text-purple-600 font-bold py-4 rounded-xl hover:bg-opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Short Link
                </>
              )}
            </button>

            {/* Result Section */}
            {shortUrl && (
              <div className="bg-white bg-opacity-20 rounded-xl p-6 space-y-4 animate-fade-in">
                <h3 className="text-black font-bold text-lg">
                  Your Short Link
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-opacity-30 border  border-opacity-30 rounded-lg textfont-mono text-sm"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-6 py-3  text-purple-600 rounded-lg hover:bg-opacity-90 transition flex items-center gap-2 font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-white text-opacity-80 text-sm">
                  <Clock className="w-4 h-4" />
                  Expires: {expiresAt}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white text-opacity-60 text-sm">
          Secure • Encrypted • Temporary Links
        </div>
      </div>
    </div>
  );
}
