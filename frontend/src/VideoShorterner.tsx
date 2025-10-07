import { useState } from "react";
import {
  Link2,
  Clock,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Globe,
  Video,
  FileText,
} from "lucide-react";

export default function UniversalUrlShortener() {
  const [apiUrl, setApiUrl] = useState("http://localhost:5000/api/shorten");
  const [originalUrl, setOriginalUrl] = useState("");
  const [expirySeconds, setExpirySeconds] = useState(3600);
  const [shortUrl, setShortUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);

  const handleShorten = async () => {
    if (!originalUrl) {
      setError("Please enter a URL");
      return;
    }

    try {
      new URL(originalUrl);
    } catch {
      setError("Please enter a valid URL (must include http:// or https://)");
      return;
    }

    setLoading(true);
    setError("");
    setShortUrl("");

    try {
      const response = await fetch(apiUrl, {
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
      setError(
        err.message ||
          "An error occurred. Make sure your proxy server is running!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useSampleUrl = (url: string) => {
    setOriginalUrl(url);
    setError("");
  };

  const expiryOptions = [
    { label: "5 Min", value: 300 },
    { label: "1 Hour", value: 3600 },
    { label: "6 Hours", value: 21600 },
    { label: "1 Day", value: 86400 },
    { label: "3 Days", value: 259200 },
    { label: "7 Days", value: 604800 },
  ];

  const sampleUrls = [
    {
      name: "HTML Page Example",
      url: "https://example.com",
      icon: <Globe className="w-4 h-4 text-cyan-500" />,
      type: "Website",
    },
    {
      name: "Video File (MP4)",
      url: "https://file-examples.com/wp-content/storage/2017/04/file_example_MP4_640_3MG.mp4",
      icon: <Video className="w-4 h-4 text-emerald-500" />,
      type: "Video",
    },
    {
      name: "Big Buck Bunny Video",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      icon: <Video className="w-4 h-4 text-emerald-500" />,
      type: "Video",
    },
    {
      name: "Wikipedia Article",
      url: "https://en.wikipedia.org/wiki/Internet",
      icon: <FileText className="w-4 h-4 text-sky-400" />,
      type: "Article",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white border-opacity-20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-opacity-20 rounded-full mb-4 backdrop-blur-sm">
              <Globe className="w-10 h-10 text-cyan-200" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              Universal URL Shortener
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </h1>
            <p className="text-white text-opacity-90 text-lg">
              Create secure, temporary links for <strong>any</strong> web
              content
            </p>
            <p className="text-white text-opacity-70 text-sm mt-2">
              HTML Pages • Videos • Images • Documents • Anything!
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-white bg-opacity-15 backdrop-blur-sm border border-white border-opacity-20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <AlertCircle className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">How it works:</h3>
                <ul className="text-opacity-90 text-sm space-y-1">
                  <li>
                    • Enter ANY URL (websites, videos, images, PDFs, etc.)
                  </li>
                  <li>• Your temporary URL shows in the address bar</li>
                  <li>• Original content loads inside seamlessly</li>
                  <li>• Link expires automatically after chosen time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="mb-6">
            <button
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="text-white text-sm underline hover:text-opacity-80 transition flex items-center gap-2"
            >
              {showApiSettings ? "− Hide" : "+ Show"} API Settings
            </button>

            {showApiSettings && (
              <div className="mt-3 bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <label className="block text-white font-medium mb-2 text-sm">
                  API Endpoint URL
                </label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:5000/api/shorten"
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 transition text-sm"
                />
              </div>
            )}
          </div>

          {/* Main Form */}
          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2 text-lg">
                <Link2 className="w-5 h-5 text-cyan-300" />
                Enter Any URL
              </label>
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleShorten()}
                placeholder="https://example.com or https://example.com/video.mp4"
                className="w-full px-5 py-4 bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-60 focus:border-emerald-400 transition text-lg"
              />
            </div>

            {/* Sample URLs */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm">
                Try with sample URLs:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleUrls.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => useSampleUrl(sample.url)}
                    className="text-left px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20 rounded-xl transition backdrop-blur-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-opacity-20 rounded-lg p-2 text-white group-hover:scale-110 transition">
                        {sample.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {sample.name}
                        </div>
                        <div className="text-opacity-60 text-xs">
                          {sample.type}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry Selection */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-300" />
                Link Expires In
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {expiryOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setExpirySeconds(option.value)}
                    className={`px-4 py-3 rounded-xl font-semibold transition ${
                      expirySeconds === option.value
                        ? "bg-emerald-500 text-white shadow-lg scale-105"
                        : "bg-opacity-20 text-white hover:bg-opacity-30 border border-white border-opacity-20"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500 bg-opacity-20 border-2 border-red-400 border-opacity-50 rounded-xl p-4 text-white backdrop-blur-sm">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleShorten}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-5 rounded-xl hover:from-emerald-600 hover:to-teal-600 hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating temporary link...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                  Generate Temporary Link
                </>
              )}
            </button>

            {/* Result Section */}
            {shortUrl && (
              <div className="bg-opacity-15 backdrop-blur-lg rounded-2xl p-6 space-y-4 border-2 border-white border-opacity-30 shadow-xl animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-green-500 bg-opacity-20 rounded-full p-2">
                    <Check className="w-5 h-5 text-green-300" />
                  </div>
                  <h3 className="text-white font-bold text-xl">
                    Your Temporary Link is Ready!
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shortUrl}
                      readOnly
                      className="flex-1 px-4 py-3 bg-opacity-25 border border-white border-opacity-30 rounded-xl text-white font-mono text-sm backdrop-blur-sm"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-6 py-3 bg-white text-teal-600 rounded-xl hover:bg-opacity-90 transition-all flex items-center gap-2 font-semibold shadow-lg hover:scale-105"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className=" bg-opacity-10 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Clock className="w-4 h-4 text-yellow-300" />
                      <span className="font-semibold">Expires:</span>
                      <span className="text-white text-opacity-90">
                        {expiresAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => window.open(shortUrl, "_blank")}
                      className="flex-1 px-4 py-3 bg-cyan-500 bg-opacity-30 hover:bg-opacity-50 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold border border-white border-opacity-20"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open Link
                    </button>
                    <button
                      onClick={() => {
                        setOriginalUrl("");
                        setShortUrl("");
                        setError("");
                      }}
                      className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl transition-all font-semibold border border-white border-opacity-20"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <div className="text-white text-opacity-80 text-sm font-medium">
            🔒 Secure • 🔐 Encrypted • ⏰ Temporary Links
          </div>
          <div className="text-white text-opacity-60 text-xs">
            Works with any URL: HTML pages, videos, images, PDFs, and more
          </div>
        </div>
      </div>
    </div>
  );
}
