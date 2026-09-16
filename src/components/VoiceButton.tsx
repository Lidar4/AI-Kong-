import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../services/voice/speechRecognition';

interface VoiceButtonProps {
  language?: 'bn-BD' | 'en-US' | string;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}


export const VoiceButton: React.FC<VoiceButtonProps> = ({ language = 'bn-BD', onTranscript, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  const toggleListening = () => {
    if (!supported) {
      setErrorMessage('ভয়েস ইনপুট এই ব্রাউজারে সমর্থিত নয়।');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setErrorMessage(null);
    const recognizer = createSpeechRecognizer({
      language,
      onStart: () => {
        setIsListening(true);
      },
      onResult: (result) => {
        if (result.transcript) {
          onTranscript(result.transcript);
        }
      },
      onError: (err) => {
        setErrorMessage(err);
        setIsListening(false);
        setTimeout(() => setErrorMessage(null), 4000);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
      } catch (e) {
        console.error('Recognizer start failed', e);
        setIsListening(false);
      }
    }
  };

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        aria-label="ভয়েস ইনপুট সমর্থিত নয়"
        title="ভয়েস ইনপুট সমর্থিত নয়"
        className="relative p-2 rounded-xl text-slate-600 cursor-not-allowed opacity-50"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        id="voice-input-btn"
        onClick={toggleListening}
        disabled={disabled}
        aria-label={isListening ? 'রেকর্ডিং বন্ধ করুন' : 'কথা বলুন (ভয়েস ইনপুট)'}
        title={isListening ? 'শুনছি... (ক্লিক করে থামান)' : 'কথা বলে লিখুন'}
        className={`relative p-2 rounded-xl transition-all active:scale-95 ${
          isListening
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-lg shadow-rose-500/20 animate-pulse'
            : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
        }`}
      >
        {isListening ? <Mic className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
      </button>

      {isListening && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow">
          শুনছি...
        </span>
      )}

      {errorMessage && (
        <div className="absolute bottom-full mb-2 left-0 z-50 flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-rose-400 border border-rose-900 shadow-xl">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
