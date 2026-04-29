"use client";
import { useEffect, useRef, useState } from "react";

export default function PomodoroTimer() {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [seconds, setSeconds] = useState(WORK_TIME);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const notificationPermissionRequestedRef = useRef(false);
  const transitionLockRef = useRef(false);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;

    return `${String(mins).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const sendNotification = (title, body) => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      return;
    }

    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // Ignore permission errors and continue without notifications.
      }
    }
  };

  useEffect(() => {
    let timer;

    if (running) {
      timer = setInterval(() => {
        setSeconds((prev) => {
          if (prev > 1) {
            transitionLockRef.current = false;
            return prev - 1;
          }

          if (transitionLockRef.current) {
            return prev;
          }

          transitionLockRef.current = true;

          if (!isBreak) {
            setSessions((currentSessions) => currentSessions + 1);
            setIsBreak(true);
            sendNotification("Focus session complete", "Break time started. Take 5 minutes to reset.");
            return BREAK_TIME;
          }

          setIsBreak(false);
          sendNotification("Break finished", "Focus time started. Back to work.");
          return WORK_TIME;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running, isBreak]);

  const handleStart = async () => {
    if (!notificationPermissionRequestedRef.current) {
      notificationPermissionRequestedRef.current = true;
      await requestNotificationPermission();
    }
    setRunning(true);
  };

  const resetTimer = () => {
    setRunning(false);
    setIsBreak(false);
    setSeconds(WORK_TIME);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-8 w-full max-w-xl border border-neutral-200 flex flex-col gap-6">
        <div className="flex flex-col gap-1 items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-1">Pomodoro Timer</h1>
          <p className="text-neutral-500 text-base">Stay focused with work and break cycles</p>
        </div>

        <div className="w-full p-6 border border-neutral-200 rounded-xl bg-neutral-50 text-center">
          <p className="mb-2 text-base font-medium text-neutral-600">
            {isBreak ? "Break Time" : "Focus Time"}
          </p>
          <div className="text-5xl sm:text-6xl font-bold text-neutral-900 tabular-nums">
            {formatTime(seconds)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleStart}
            className="border border-neutral-300 rounded-lg py-2 px-2 text-neutral-700 hover:bg-neutral-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            Start
          </button>

          <button
            onClick={() => setRunning(false)}
            className="border border-neutral-300 rounded-lg py-2 px-2 text-neutral-700 hover:bg-neutral-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            Pause
          </button>

          <button
            onClick={resetTimer}
            className="border border-neutral-300 rounded-lg py-2 px-2 text-neutral-700 hover:bg-neutral-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            Reset
          </button>
        </div>

        <p className="text-center text-xs sm:text-sm text-neutral-500">
          Start dabane par notification permission prompt aayega, phir focus aur break khatam hote hi alert milega.
        </p>

        <div className="w-full p-4 border border-neutral-200 rounded-xl bg-neutral-50 text-center">
          <p className="text-sm text-neutral-500">Completed Sessions</p>
          <p className="text-2xl font-semibold text-neutral-900">{sessions}</p>
        </div>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}