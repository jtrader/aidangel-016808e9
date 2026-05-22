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
}

interface UseMetronomeOptions {
  bpm?: number;
  cycleLength?: number; // compressions per cycle (30 for adult)
  onBreath?: () => void; // fired when a 30-cycle completes
  onTick?: (count: number) => void;
}

export function useMetronome({
  bpm = 110,
  cycleLength = 30,
  onBreath,
  onTick,
}: UseMetronomeOptions = {}) {
  const [isRunning, setIsRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(bpm);

  const ctxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const countRef = useRef(0);
  const startedAtRef = useRef(0);
  const bpmRef = useRef(bpm);
  const onBreathRef = useRef(onBreath);
  const onTickRef = useRef(onTick);

  useEffect(() => { bpmRef.current = currentBpm; }, [currentBpm]);
  useEffect(() => { onBreathRef.current = onBreath; }, [onBreath]);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);

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

  const scheduler = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const lookAhead = 0.1; // seconds
    while (nextNoteTimeRef.current < ctx.currentTime + lookAhead) {
      const next = countRef.current + 1;
      const cyclePos = (next - 1) % cycleLength; // 0..(n-1)
      const isAccent = cyclePos === 0; // first beat of cycle
      scheduleClick(nextNoteTimeRef.current, isAccent);

      // Update React state slightly ahead to feel responsive
      const tickDelayMs = Math.max(0, (nextNoteTimeRef.current - ctx.currentTime) * 1000);
      window.setTimeout(() => {
        countRef.current = next;
        setCount(next);
        onTickRef.current?.(next);
        if (next % cycleLength === 0) onBreathRef.current?.();
      }, tickDelayMs);

      const interval = 60 / bpmRef.current;
      nextNoteTimeRef.current += interval;
    }
  }, [cycleLength, scheduleClick]);

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
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    setIsRunning(true);

    timerRef.current = window.setInterval(scheduler, 25);
  }, [isRunning, scheduler]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Elapsed-time tick
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [isRunning]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    ctxRef.current?.close().catch(() => undefined);
  }, []);

  const setBpm = useCallback((v: number) => setCurrentBpm(Math.min(140, Math.max(80, Math.round(v)))), []);

  const cyclePos = count === 0 ? 0 : ((count - 1) % cycleLength);
  const cycle = Math.floor(count / cycleLength);

  return { isRunning, bpm: currentBpm, setBpm, count, cyclePos, cycle, elapsedSec, start, stop };
}
