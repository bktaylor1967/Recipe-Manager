import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types/recipe';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sun,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
} from 'lucide-react';
import { playTimerChime } from '../utils/audioChime';

interface CookModeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookModeModal: React.FC<CookModeModalProps> = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const steps = recipe.instructions;
  const currentStep = steps[currentStepIndex];

  // Screen Wake Lock to prevent screen sleep while cooking
  useEffect(() => {
    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setIsWakeLockActive(true);
        } catch (err) {
          console.warn('Wake Lock request denied or unsupported:', err);
        }
      }
    }
    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Update timer whenever step changes
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsTimerRunning(false);

    if (currentStep?.timerMinutes && currentStep.timerMinutes > 0) {
      setTimerSeconds(currentStep.timerMinutes * 60);
    } else {
      setTimerSeconds(null);
    }
  }, [currentStepIndex, currentStep]);

  // Timer countdown loop
  useEffect(() => {
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            playTimerChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerSeconds]);

  const toggleTimer = () => {
    if (timerSeconds === 0 && currentStep?.timerMinutes) {
      setTimerSeconds(currentStep.timerMinutes * 60);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (currentStep?.timerMinutes) {
      setTimerSeconds(currentStep.timerMinutes * 60);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Text-to-Speech: Read step aloud
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `Step ${currentStep.step}: ${currentStep.instruction}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const goToNext = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col justify-between overflow-hidden">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-stone-800 bg-stone-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-stone-400">
              Cook Mode
            </h2>
            <p className="text-base font-medium text-stone-200 line-clamp-1 max-w-sm sm:max-w-md">
              {recipe.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* TTS Audio toggle */}
          <button
            onClick={toggleSpeech}
            className={`p-2.5 rounded-xl border transition-colors ${
              isSpeaking
                ? 'bg-orange-600 border-orange-500 text-white animate-pulse'
                : 'border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
            title="Read step aloud"
          >
            {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Wake Lock indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border ${
              isWakeLockActive
                ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300'
                : 'border-stone-800 text-stone-500'
            }`}
            title="Keeps screen awake while cooking"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Screen Awake</span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Focus Area: Step Card */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col justify-center overflow-y-auto">
        {/* Step Counter Indicator */}
        <div className="flex items-center justify-between text-stone-400 text-sm mb-4">
          <span className="font-semibold tracking-wider text-orange-500 uppercase">
            Step {currentStep.step} of {steps.length}
          </span>
          <div className="w-32 bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Giant Instruction Text */}
        <div className="my-auto">
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-relaxed sm:leading-snug text-stone-100">
            {currentStep.instruction}
          </p>

          {/* Ingredients Needed in this specific Step */}
          {currentStep.ingredientsUsed && currentStep.ingredientsUsed.length > 0 && (
            <div className="mt-8 p-4 rounded-2xl bg-stone-900/90 border border-stone-800">
              <span className="text-xs font-semibold tracking-wider uppercase text-stone-400 block mb-2">
                Ingredients For This Step
              </span>
              <div className="flex flex-wrap gap-2">
                {currentStep.ingredientsUsed.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-200 text-sm font-medium"
                  >
                    <span>✓</span>
                    <span>{ing}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Built-in Step Timer if present */}
          {timerSeconds !== null && (
            <div className="mt-8 p-6 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-950/60 border border-orange-900/60 flex items-center justify-center text-orange-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block">
                    Step Timer
                  </span>
                  <div
                    className={`text-4xl font-bold font-mono tabular-nums ${
                      timerSeconds === 0
                        ? 'text-red-500 animate-bounce'
                        : isTimerRunning
                        ? 'text-orange-400'
                        : 'text-stone-100'
                    }`}
                  >
                    {formatTimer(timerSeconds)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTimer}
                  className={`px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-transform active:scale-95 ${
                    isTimerRunning
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{timerSeconds === 0 ? 'Restart' : 'Start Timer'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={resetTimer}
                  className="p-3 rounded-xl border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Large Controls */}
      <footer className="px-6 py-5 border-t border-stone-800 bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={goToPrev}
            disabled={currentStepIndex === 0}
            className={`min-h-[52px] px-6 rounded-2xl font-semibold text-sm flex items-center gap-2 transition-all ${
              currentStepIndex === 0
                ? 'opacity-30 cursor-not-allowed text-stone-600 bg-stone-900'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous Step</span>
          </button>

          {isLastStep ? (
            <button
              onClick={onClose}
              className="min-h-[52px] px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base flex items-center gap-2 shadow-lg shadow-emerald-900/40 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Finished Cooking!</span>
            </button>
          ) : (
            <button
              onClick={goToNext}
              className="min-h-[52px] px-8 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-base flex items-center gap-2 shadow-lg shadow-orange-900/40 active:scale-95 transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
