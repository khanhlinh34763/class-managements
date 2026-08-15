import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Shuffle, Play, Pause, RotateCcw, Timer, Users2, User, LayoutGrid, Volume2, Mic, MicOff,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { playTickSound, playBellSound, playDrumrollSound } from '../../utils/sound';
import { fireBigConfetti } from '../../utils/confetti';
import { GROUP_COLORS } from '../../utils/helpers';

const GROUPS = Object.keys(GROUP_COLORS);

function RandomPicker() {
  const { students } = useAppData();
  const [mode, setMode] = useState('name');
  const [picked, setPicked] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [excludeUsed, setExcludeUsed] = useState(true);
  const [usedIds, setUsedIds] = useState([]);
  const intervalRef = useRef(null);

  const items = mode === 'group'
    ? GROUPS.map((g) => ({ id: g, name: g }))
    : students;
  const pool = excludeUsed ? items.filter((i) => !usedIds.includes(i.id)) : items;

  const handleSwitchMode = (nextMode) => {
    if (nextMode === mode || spinning) return;
    setMode(nextMode);
    setUsedIds([]);
    setPicked(null);
    setDisplayName('');
  };

  const handleSpin = () => {
    if (pool.length === 0 || spinning) return;
    setSpinning(true);
    setPicked(null);
    playDrumrollSound(1500);
    let ticks = 0;
    const maxTicks = 20;
    intervalRef.current = setInterval(() => {
      const random = pool[Math.floor(Math.random() * pool.length)];
      setDisplayName(random.name);
      ticks += 1;
      if (ticks >= maxTicks) {
        clearInterval(intervalRef.current);
        const winner = pool[Math.floor(Math.random() * pool.length)];
        setDisplayName(winner.name);
        setPicked(winner);
        setUsedIds((prev) => [...prev, winner.id]);
        setSpinning(false);
        fireBigConfetti();
        playBellSound();
      }
    }, 80);
  };

  useEffect(() => () => intervalRef.current && clearInterval(intervalRef.current), []);

  const handleReset = () => {
    setUsedIds([]);
    setPicked(null);
    setDisplayName('');
  };

  const pickedGroupMembers = mode === 'group' && picked
    ? students.filter((s) => s.group === picked.name)
    : [];

  return (
    <Card className="flex flex-col items-center gap-5 py-10">
      <div className="flex items-center gap-2 text-gray-700 font-bold text-lg">
        <Users2 size={22} className="text-happy-pink" /> Gọi ngẫu nhiên
      </div>

      <div className="flex gap-2 bg-pink-50 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => handleSwitchMode('name')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${mode === 'name' ? 'bg-happy-pink text-white shadow' : 'text-gray-500'}`}
        >
          <User size={16} /> Theo học sinh
        </button>
        <button
          type="button"
          onClick={() => handleSwitchMode('group')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${mode === 'group' ? 'bg-happy-pink text-white shadow' : 'text-gray-500'}`}
        >
          <LayoutGrid size={16} /> Theo tổ
        </button>
      </div>

      <div className="w-full max-w-sm h-40 rounded-3xl bg-gradient-to-br from-happy-pink to-pink-400 flex flex-col items-center justify-center shadow-xl">
        {picked && mode === 'name' ? (
          <Avatar name={picked.name} src={picked.avatar} size="xl" className="mb-2 border-4 border-white" />
        ) : null}
        <p className="text-white text-2xl font-extrabold px-4 text-center">
          {displayName || 'Bấm nút để bắt đầu'}
        </p>
      </div>

      {pickedGroupMembers.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 max-w-sm">
          {pickedGroupMembers.map((s) => (
            <span key={s.id} className="flex items-center gap-1.5 bg-pink-50 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Avatar name={s.name} src={s.avatar} size="sm" /> {s.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-500">
          <input
            type="checkbox"
            checked={excludeUsed}
            onChange={(e) => setExcludeUsed(e.target.checked)}
            className="w-4 h-4 accent-happy-pink"
          />
          {mode === 'group' ? 'Không gọi lại tổ đã gọi' : 'Không gọi lại bạn đã gọi'}
        </label>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSpin}
          disabled={spinning || pool.length === 0}
          className="flex items-center gap-2 bg-happy-pink text-white px-6 py-3 rounded-2xl font-bold hover:bg-pink-600 disabled:opacity-40"
        >
          <Shuffle size={18} /> {spinning ? 'Đang quay...' : 'Quay ngay'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 bg-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200"
        >
          <RotateCcw size={18} /> Reset
        </button>
      </div>
      {excludeUsed && (
        <p className="text-xs text-gray-400">
          Còn lại {pool.length}/{items.length} {mode === 'group' ? 'tổ' : 'bạn'} chưa được gọi
        </p>
      )}
    </Card>
  );
}

function CountdownTimer() {
  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  const totalInputSeconds = inputMinutes * 60 + inputSeconds;

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setFinished(true);
        playBellSound();
        fireBigConfetti();
        return 0;
      }
      if (prev <= 11) {
        playTickSound();
      }
      return prev - 1;
    });
  }, []);

  const handleStart = () => {
    if (running) return;
    setFinished(false);
    const startValue = remaining > 0 ? remaining : totalInputSeconds;
    if (startValue <= 0) return;
    setRemaining(startValue);
    setRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  };

  const handlePause = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(false);
    setRemaining(0);
  };

  useEffect(() => () => intervalRef.current && clearInterval(intervalRef.current), []);

  const displaySeconds = running || remaining > 0 ? remaining : totalInputSeconds;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const progressPercent = totalInputSeconds > 0 ? (displaySeconds / totalInputSeconds) * 100 : 0;

  return (
    <Card className="flex flex-col items-center gap-5 py-10">
      <div className="flex items-center gap-2 text-gray-700 font-bold text-lg">
        <Timer size={22} className="text-happy-blue" /> Đồng hồ đếm ngược
      </div>

      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#EFF6FF" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={finished ? '#6BCB77' : '#4D96FF'}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl font-extrabold ${finished ? 'text-happy-green animate-bounce-slow' : 'text-gray-700'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {!running && remaining === 0 && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="59"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(Math.max(0, parseInt(e.target.value || '0', 10)))}
            className="w-16 px-3 py-2 text-center rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none font-bold"
          />
          <span className="text-gray-400 font-bold">phút</span>
          <input
            type="number"
            min="0"
            max="59"
            value={inputSeconds}
            onChange={(e) => setInputSeconds(Math.min(59, Math.max(0, parseInt(e.target.value || '0', 10))))}
            className="w-16 px-3 py-2 text-center rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none font-bold"
          />
          <span className="text-gray-400 font-bold">giây</span>
        </div>
      )}

      <div className="flex gap-3">
        {!running ? (
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-2 bg-happy-blue text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-600"
          >
            <Play size={18} /> {remaining > 0 ? 'Tiếp tục' : 'Bắt đầu'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            className="flex items-center gap-2 bg-happy-orange text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600"
          >
            <Pause size={18} /> Tạm dừng
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 bg-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200"
        >
          <RotateCcw size={18} /> Đặt lại
        </button>
      </div>
      {finished && (
        <p className="text-happy-green font-bold animate-pulse">🎉 Hết giờ rồi! 🎉</p>
      )}
    </Card>
  );
}

function noiseZone(level, threshold) {
  if (level >= threshold) {
    return {
      key: 'loud', color: '#FF6B6B', ring: '#FF6B6B', face: '🤫',
      label: 'Ồn quá rồi! Cả lớp trật tự nào!', text: 'text-red-500',
    };
  }
  if (level >= threshold * 0.6) {
    return {
      key: 'medium', color: '#FFB03A', ring: '#FFB03A', face: '🙂',
      label: 'Hơi ồn một chút nhé!', text: 'text-happy-orange',
    };
  }
  return {
    key: 'quiet', color: '#6BCB77', ring: '#6BCB77', face: '😌',
    label: 'Lớp mình rất trật tự! Giỏi lắm!', text: 'text-happy-green',
  };
}

function NoiseMeter() {
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [threshold, setThreshold] = useState(65);
  const [error, setError] = useState('');

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const smoothRef = useRef(0);
  const thresholdRef = useRef(threshold);

  useEffect(() => { thresholdRef.current = threshold; }, [threshold]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    smoothRef.current = 0;
    setListening(false);
    setLevel(0);
  }, []);

  const start = useCallback(async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Trình duyệt không hỗ trợ truy cập micro.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.fftSize);
      setListening(true);
      setPeak(0);

      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let sumSquares = 0;
        for (let i = 0; i < data.length; i += 1) {
          const val = (data[i] - 128) / 128;
          sumSquares += val * val;
        }
        const rms = Math.sqrt(sumSquares / data.length);
        // Chuyển RMS sang thang 0-100 cho dễ đọc trong lớp học
        const raw = Math.min(100, Math.round(rms * 300));
        smoothRef.current = smoothRef.current * 0.8 + raw * 0.2;
        const smooth = Math.round(smoothRef.current);
        setLevel(smooth);
        setPeak((p) => (smooth > p ? smooth : p));
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (err) {
      if (err && err.name === 'NotAllowedError') {
        setError('Bạn cần cho phép truy cập micro để đo tiếng ồn.');
      } else {
        setError('Không thể truy cập micro. Vui lòng kiểm tra thiết bị.');
      }
      stop();
    }
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  const zone = noiseZone(level, threshold);
  const circumference = 2 * Math.PI * 45;

  return (
    <Card className="flex flex-col items-center gap-5 py-10">
      <div className="flex items-center gap-2 text-gray-700 font-bold text-lg">
        <Volume2 size={22} className="text-happy-green" /> Bộ đo tiếng ồn
      </div>

      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#F3F4F6" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={zone.ring}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - level / 100)}
            strokeLinecap="round"
            className="transition-all duration-150 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl ${zone.key === 'loud' ? 'animate-bounce-slow' : ''}`}>{zone.face}</span>
          <span className="text-3xl font-extrabold text-gray-700 mt-1">{level}</span>
        </div>
      </div>

      <p className={`font-bold text-center min-h-[1.5rem] ${listening ? zone.text : 'text-gray-400'}`}>
        {listening ? zone.label : 'Bấm "Bắt đầu đo" để lắng nghe lớp học'}
      </p>

      {listening && (
        <p className="text-xs text-gray-400 font-semibold">Mức ồn cao nhất: {peak}</p>
      )}

      <div className="w-full max-w-xs flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-500 shrink-0">Ngưỡng ồn</span>
        <input
          type="range"
          min="20"
          max="100"
          value={threshold}
          onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
          className="flex-1 accent-happy-green"
        />
        <span className="text-sm font-bold text-gray-600 w-8 text-right">{threshold}</span>
      </div>

      {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

      <div className="flex gap-3">
        {!listening ? (
          <button
            type="button"
            onClick={start}
            className="flex items-center gap-2 bg-happy-green text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-600"
          >
            <Mic size={18} /> Bắt đầu đo
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="flex items-center gap-2 bg-red-400 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-500"
          >
            <MicOff size={18} /> Dừng lại
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center max-w-xs">
        Âm thanh chỉ được xử lý ngay trên máy để hiển thị mức ồn, không ghi âm hay gửi đi bất kỳ đâu.
      </p>
    </Card>
  );
}

export default function ClassroomToolsTab() {
  const [activeTool, setActiveTool] = useState('random');

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTool('random')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm ${activeTool === 'random' ? 'bg-happy-pink text-white' : 'bg-white text-gray-500'}`}
        >
          Gọi tên ngẫu nhiên
        </button>
        <button
          type="button"
          onClick={() => setActiveTool('timer')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm ${activeTool === 'timer' ? 'bg-happy-blue text-white' : 'bg-white text-gray-500'}`}
        >
          Đồng hồ đếm ngược
        </button>
        <button
          type="button"
          onClick={() => setActiveTool('noise')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm ${activeTool === 'noise' ? 'bg-happy-green text-white' : 'bg-white text-gray-500'}`}
        >
          Đo tiếng ồn
        </button>
      </div>
      {activeTool === 'random' && <RandomPicker />}
      {activeTool === 'timer' && <CountdownTimer />}
      {activeTool === 'noise' && <NoiseMeter />}
    </div>
  );
}