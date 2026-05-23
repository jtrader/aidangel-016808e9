import { useCallback, useEffect, useRef, useState } from "react";

// Web Audio API based metronome — sample-accurate timing.
// Returns controls + live state for compression counting & breath cues.

export interface MetronomeState {
  isRunning: boolean;
  bpm: number;
  count: number; // total compressions since start
  cyclePos: number; // 0..29 within current cycle of 30
  cycle: number; // completed 30-compression cycles
  elapsedSec: number;
  inBreathPhase: boolean;
  breathCountdown: number;
}

interface UseMetronomeOptions {
  bpm?: number;
  cycleLength?: number; // compressions per cycle (30 for adult)
  breathPauseSec?: number; // seconds to pause for rescue breaths
  onBreath?: () => void; // fired when a 30-cycle completes
  onTick?: (count: number) => void;
}

export function useMetronome({
  bpm = 110,
  cycleLength = 30,
  breathPauseSec = 4,
  onBreath,
  onTick,
}: UseMetronomeOptions = {}) {
  const [isRunning, setIsRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(bpm);
  const [inBreathPhase, setInBreathPhase] = useState(false);
  const [breathCountdown, setBreathCountdown] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const countRef = useRef(1);
  const startedAtRef = useRef(0);
  const bpmRef = useRef(bpm);
  const onBreathRef = useRef(onBreath);
  const onTickRef = useRef(onTick);
  const breathPauseSecRef = useRef(breathPauseSec);
  const totalBreathPauseMsRef = useRef(0);
  const breathCountdownTimerRef = useRef<number | null>(null);
  const inBreathPhaseRef = useRef(false);

  useEffect(() => { bpmRef.current = currentBpm; }, [currentBpm]);
  useEffect(() => { onBreathRef.current = onBreath; }, [onBreath]);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  useEffect(() => { breathPauseSecRef.current = breathPauseSec; }, [breathPauseSec]);

  const scheduleClick = useCallback((time: number, isAccent: boolean) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = isAccent ? 1400 : 900;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(isAccent ? 0.5 : 0.32, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.07);
  }, []);

  const clearBreathPhase = useCallback(() => {
    if (breathCountdownTimerRef.current) {
      window.clearInterval(breathCountdownTimerRef.current);
      breathCountdownTimerRef.current = null;
    }
    inBreathPhaseRef.current = false;
    setInBreathPhase(false);
    setBreathCountdown(0);
  }, []);

  const enterBreathPhase = useCallback(() => {
    if (inBreathPhaseRef.current) return;
    inBreathPhaseRef.current = true;
    setInBreathPhase(true);

    const breathStartMs = Date.now();
    let remaining = breathPauseSecRef.current;
    setBreathCountdown(remaining);

    onBreathRef.current?.();

    breathCountdownTimerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - breathStartMs) / 1000;
      remaining = Math.max(1, Math.ceil(breathPauseSecRef.current - elapsed));
      setBreathCountdown(remaining);

      if (remaining <= 1) {
        if (breathCountdownTimerRef.current) {
          window.clearInterval(breathCountdownTimerRef.current);
          breathCountdownTimerRef.current = null;
        }
        totalBreathPauseMsRef.current += Date.now() - breathStartMs;
        inBreathPhaseRef.current = false;
        const ctx = ctxRef.current;
        if (ctx) {
          nextNoteTimeRef.current = ctx.currentTime + 0.05;
        }
      }
    }, 100);
  }, []);

  const scheduler = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (inBreathPhaseRef.current) return;

    const lookAhead = 0.1; // seconds
    while (nextNoteTimeRef.current < ctx.currentTime + lookAhead) {
      const next = countRef.current + 1;
      const cyclePos = (next - 1) % cycleLength;
      const isAccent = cyclePos === 0; // first beat of cycle
      scheduleClick(nextNoteTimeRef.current, isAccent);

      // Update React state slightly ahead to feel responsive
      const tickDelayMs = Math.max(0, (nextNoteTimeRef.current - ctx.currentTime) * 1000);
      window.setTimeout(() => {
        countRef.current = next;
        setCount(next);
        onTickRef.current?.(next);

        // After completing a cycle (30 compressions), enter breath pause
        if (next % cycleLength === 0 && next > 1) {
          enterBreathPhase();
        }
      }, tickDelayMs);

      const interval = 60 / bpmRef.current;
      nextNoteTimeRef.current += interval;
    }
  }, [cycleLength, scheduleClick, enterBreathPhase]);

  const start = useCallback(async () => {
    if (isRunning) return;
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    const ctx = ctxRef.current!;
    if (ctx.state === "suspended") await ctx.resume();

    countRef.current = 0;
    setCount(0);
    setElapsedSec(0);
    startedAtRef.current = Date.now();
    totalBreathPauseMsRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    setIsRunning(true);
    clearBreathPhase();

    timerRef.current = window.setInterval(scheduler, 25);
  }, [isRunning, scheduler, clearBreathPhase]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    clearBreathPhase();
    setIsRunning(false);
  }, [clearBreathPhase]);

  // Elapsed-time tick
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAtRef.current - totalBreathPauseMsRef.current) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [isRunning]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    clearBreathPhase();
    ctxRef.current?.close().catch(() => undefined);
  }, [clearBreathPhase]);

  const setBpm = useCallback((v: number) => setCurrentBpm(Math.min(140, Math.max(80, Math.round(v)))), []);

  const cyclePos = count === 0 ? 0 : ((count - 1) % cycleLength);
  const cycle = Math.floor((count - 1) / cycleLength) + 1;

  return { isRunning, bpm: currentBpm, setBpm, count, cyclePos, cycle, elapsedSec, inBreathPhase, breathCountdown, start, stop };
}
