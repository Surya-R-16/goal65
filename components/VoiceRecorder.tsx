import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { analyzeAudioLog } from '../services/geminiService';
import { FoodLog, FoodItem, MealType } from '../types';

interface VoiceRecorderProps {
  onLogAdded: (log: FoodLog) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onLogAdded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mimeTypeRef = useRef<string>('');

  // Visualization logic
  const visualize = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 35; // Matches new FAB size

      // Draw pulsing circles
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      const average = sum / bufferLength;

      canvasCtx.beginPath();
      canvasCtx.arc(centerX, centerY, radius + (average / 2), 0, 2 * Math.PI);
      canvasCtx.fillStyle = '#EADDFF'; // Primary container color
      canvasCtx.fill();

      canvasCtx.beginPath();
      canvasCtx.arc(centerX, centerY, radius + (average / 4), 0, 2 * Math.PI);
      canvasCtx.fillStyle = '#D0BCFF';
      canvasCtx.fill();
    };
    draw();
  };

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac'
    ];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);

      // Setup audio context for visualization
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        throw new Error("No supported audio mime type found");
      }
      mimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        await processAudio(audioBlob);

        // Cleanup visualization
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      visualize();
    } catch (err) {
      console.error(err);
      setError("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];

        try {
          const result = await analyzeAudioLog(base64String, mimeTypeRef.current);

          const totalCals = result.items.reduce((acc, item) => acc + (item.calories || 0), 0);

          const newLog: FoodLog = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            meal: result.meal,
            items: result.items,
            totalCalories: totalCals,
            transcript: result.transcript,
            method: 'voice'
          };

          onLogAdded(newLog);
        } catch (apiError: any) {
          console.error("Full API Error:", apiError);
          setError(`Failed: ${apiError.message || "Unknown error"}`);
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (e) {
      console.error("Processing Error:", e);
      setError("Error processing audio file.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface-bright rounded-3xl shadow-sm border border-outline/10">
      <div className="relative mb-4 h-32 w-full flex items-center justify-center">
        <canvas ref={canvasRef} width="300" height="200" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 ${isRecording
            ? 'bg-red-400 text-white'
            : 'bg-primary-container text-primary-onContainer hover:shadow-lg'
            } ${isProcessing ? 'opacity-80 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      <div className="text-center h-8">
        {isProcessing && (
          <p className="text-primary font-medium text-sm animate-pulse">Consulting Nutritionist...</p>
        )}
        {isRecording && (
          <p className="text-red-500 text-sm font-medium">Listening to your meal...</p>
        )}
        {!isRecording && !isProcessing && !error && (
          <p className="text-onSurface-variant text-sm">Tap to speak (e.g., "I had 3 idlis")</p>
        )}
        {error && (
          <div className="flex items-center text-red-500 text-sm gap-1 justify-center">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;