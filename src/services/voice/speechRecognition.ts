export interface SpeechRecognitionResultState {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechListenerOptions {
  language?: 'bn-BD' | 'en-US' | string;
  onResult: (result: SpeechRecognitionResultState) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onStart: () => void;
}


export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function createSpeechRecognizer(options: SpeechListenerOptions) {
  if (!isSpeechRecognitionSupported()) {
    options.onError('এই ব্রাউজারে ভয়েস রিকগনিশন সমর্থিত নয়। Chrome বা Edge ব্যবহার করুন।');
    return null;
  }

  const SpeechRecognitionConstructor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const recognition = new SpeechRecognitionConstructor();
  recognition.lang = options.language || 'bn-BD';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    options.onStart();
  };

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const transcript = finalTranscript || interimTranscript;
    options.onResult({
      transcript,
      isFinal: !!finalTranscript,
    });
  };

  recognition.onerror = (event: any) => {
    let msg = 'ভয়েস ইনপুট এরর হয়েছে।';
    if (event.error === 'not-allowed') {
      msg = 'মাইক্রোফোন পারমিশন দেওয়া হয়নি। ব্রাউজার সেটিংসে অনুমতি দিন।';
    } else if (event.error === 'no-speech') {
      msg = 'কোনো কথা শনাক্ত করা যায়নি। আবার চেষ্টা করুন।';
    } else if (event.error === 'network') {
      msg = 'ভয়েস শনাক্তকরণের জন্য ইন্টারনেট সংযোগ প্রয়োজন।';
    }
    options.onError(msg);
  };

  recognition.onend = () => {
    options.onEnd();
  };

  return recognition;
}
