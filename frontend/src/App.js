import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const providerIcons = {
  groq: "https://raw.githubusercontent.com/RMNCLDYO/groq-ai-toolkit/main/.github/groq-logo.png",
  openai: "https://i.pinimg.com/736x/ad/01/1d/ad011d0a7d6387263473af7f7fd21c3e.jpg",
  google: "https://static.vecteezy.com/system/resources/previews/046/861/646/non_2x/gemini-icon-on-a-transparent-background-free-png.png",
  anthropic: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/1/anthropic-icon-wii9u8ifrjrd99btrqfgi.png/anthropic-icon-tdvkiqisswbrmtkiygb0ia.png?_a=DAJFJtWIZAAC"
};

const providerLabels = {
  groq: "Groq AI",
  openai: "OpenAI",
  google: "Google AI",
  anthropic: "Anthropic"
};

const languageOptions = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'vi', name: 'Vietnamese' }
];

const ProgressBar = ({ progress, message, onCancel }) => (
  <div className="relative w-full">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-6 bg-white/30 backdrop-blur-lg rounded-xl shadow-xl"
    >
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative"
        >
          <div className="absolute inset-0 bg-white/20 shimmer-effect"></div>
        </motion.div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-bold mix-blend-difference">
          {progress}%
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4">
            <svg className="text-purple-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">{message}</span>
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2 hover:scale-105 transform"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Cancel</span>
        </motion.button>
      </div>
    </motion.div>
  </div>
);

const FileUploadZone = ({ onFileSelect, isDragging, setIsDragging }) => {
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
        isDragging
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-300 hover:border-purple-400'
      }`}
    >
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="space-y-4">
        <div className="flex justify-center">
          <svg
            className={`w-12 h-12 ${
              isDragging ? 'text-purple-500' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <div>
          <p className="text-gray-600">
            Drag and drop your Excel file here, or{' '}
            <span className="text-purple-600 font-medium">browse</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">Supports .xlsx and .xls files</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [providers, setProviders] = useState([]);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationComplete, setTranslationComplete] = useState(false);
  const [translatedFile, setTranslatedFile] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/providers', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (response.data && response.data.providers) {
        setProviders(response.data.providers);
        if (response.data.providers.length > 0) {
          setProvider(response.data.providers[0].name);
          if (response.data.providers[0].models && response.data.providers[0].models.length > 0) {
            setModel(response.data.providers[0].models[0]);
          }
        }
      }
    } catch (error) {
      setError('Failed to fetch providers. Please check if the backend server is running.');
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      // Reset all translation-related states
      setFile(selectedFile);
      setError(null);
      setProgress(0);
      setMessage('');
      setTranslationComplete(false);
      setTranslatedFile(null);
      setIsTranslating(false);
      
      // Close any existing EventSource connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Show notification for file selection
      toast.success('New file selected', {
        icon: '📄',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  const handleCancel = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsTranslating(false);
    setProgress(0);
    setMessage('');
    toast.success('Translation cancelled', {
      icon: '🚫',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const handleTranslate = async () => {
    if (!file || !provider) {
      toast.error('Please select a file and provider', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    setIsTranslating(true);
    setError(null);
    setProgress(0);
    setMessage('Starting translation...');
    setTranslationComplete(false);
    setTranslatedFile(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_language', targetLanguage);
    formData.append('provider', provider);
    formData.append('model', model);

    try {
      const response = await axios.post('http://localhost:5000/translate', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
          setMessage('Uploading file...');
        },
      });

      if (response.data.translation_id) {
        setMessage('Processing translation...');
        eventSourceRef.current = new EventSource(
          `http://localhost:5000/translation-progress?id=${response.data.translation_id}`
        );

        eventSourceRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.progress !== undefined) {
            setProgress(data.progress);
          }
          if (data.message) {
            setMessage(data.message);
          }
          if (data.complete) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setTranslationComplete(true);
            setTranslatedFile(data.translated_file);
            setIsTranslating(false);
            setMessage('Translation completed!');
            toast.success('Translation completed! 🎉', {
              duration: 4000,
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            });
          }
          if (data.error) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setError(data.error);
            setIsTranslating(false);
            toast.error('Translation failed', {
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            });
          }
        };
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Translation failed');
      setIsTranslating(false);
      toast.error('Translation failed', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  const handleDownload = async (filename) => {
    if (!filename) {
      setError('No file available for download');
      return;
    }

    try {
      setError(null);
      const response = await fetch(`http://localhost:5000/download/${encodeURIComponent(filename)}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download file');
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('spreadsheetml')) {
        throw new Error('Invalid file format received');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Download error:', error);
      setError(error.message || 'Failed to download translated file');
    }
  };

  const handleProviderChange = (e) => {
    const selectedProvider = e.target.value;
    setProvider(selectedProvider);
    // Reset model when provider changes
    const providerModels = providers.find(p => p.name === selectedProvider)?.models || [];
    setModel(providerModels[0] || '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <Toaster position="top-right" />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.015]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Enhanced title section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          <div className="relative inline-block">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-4 filter drop-shadow-lg">
              Excel Translation Studio
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-2xl -z-10 rounded-full"></div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Transform your Excel documents into any language with AI-powered precision
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>Powered by</span>
            <div className="flex items-center space-x-2">
              {Object.keys(providerIcons).map((provider) => (
                <img
                  key={provider}
                  src={providerIcons[provider]}
                  alt={provider}
                  className="w-5 h-5 object-contain opacity-50 hover:opacity-100 transition-opacity"
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Rest of your components */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden p-8 relative"
        >
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 pointer-events-none"></div>

          {/* Content */}
          <div className="relative space-y-8">
            {/* Provider Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {providers.map((p) => (
                  <motion.button
                    key={p.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setProvider(p.name);
                      setModel(p.models[0]);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      provider === p.name
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto mb-2">
                        <img 
                          src={providerIcons[p.name]} 
                          alt={`${p.name} icon`}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    <div className="text-sm font-medium">{providerLabels[p.name]}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Model Selection */}
            {provider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-gray-50 p-4"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                >
                  {providers
                    .find((p) => p.name === provider)
                    ?.models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                </select>
              </motion.div>
            )}

            {/* Language Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              >
                {languageOptions.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <FileUploadZone
                onFileSelect={handleFileSelect}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
              />
              {file && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-gray-600"
                >
                  Selected file: {file.name}
                </motion.p>
              )}
            </motion.div>

            {/* Translation Progress */}
            <AnimatePresence>
              {isTranslating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6"
                >
                  <ProgressBar 
                    progress={progress} 
                    message={message} 
                    onCancel={handleCancel}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 rounded-lg bg-red-50 text-red-700"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Translate Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={handleTranslate}
                disabled={!file || !provider || isTranslating}
                className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all ${
                  !file || !provider || isTranslating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
                }`}
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
            </motion.div>

            {/* Download Button */}
            <AnimatePresence mode="wait">
              {translationComplete && translatedFile && !isTranslating && (
                <motion.div
                  key="download-button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-6"
                >
                  <button
                    onClick={() => {
                      handleDownload(translatedFile);
                      toast.success('Download started! 📥', {
                        style: {
                          borderRadius: '10px',
                          background: '#333',
                          color: '#fff',
                        },
                      });
                    }}
                    className="w-full py-3 px-6 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Translated File
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Beautiful footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-center relative"
      >
        <div className="relative inline-block">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span>Made with</span>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <span role="img" aria-label="heart" className="text-red-500 text-xl">❤️</span>
            </motion.div>
            <span>by</span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Yate Asske
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur group-hover:opacity-100 opacity-0 transition-opacity rounded-lg"></div>
            </motion.div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} | All rights reserved
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
