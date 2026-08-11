import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Shuffle, Play, Pause, RotateCcw, Timer, Users2, User, LayoutGrid } from 'lucide-react';
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
      </div>
      {activeTool === 'random' ? <RandomPicker /> : <CountdownTimer />}
    </div>
  );
}