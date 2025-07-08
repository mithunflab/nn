
import { useState, useEffect, useCallback } from 'react';

interface UseSpeechToTextOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export const useSpeechToText = (options?: UseSpeechToTextOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Mock implementation since we don't have the actual speech recognition implementation
  const startRecording = useCallback(() => {
    setIsRecording(true);
    console.log("Speech recognition started (mock)");
    
    // Simulate getting a transcription after a delay
    setTimeout(() => {
      const mockTranscript = "This is a simulated transcription.";
      setTranscript(mockTranscript);
      if (options?.onTranscription) {
        options.onTranscription(mockTranscript);
      }
    }, 2000);
  }, [options]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    console.log("Speech recognition stopped (mock)");
  }, []);

  return {
    startRecording,
    stopRecording,
    isRecording,
    transcript,
    error
  };
};
