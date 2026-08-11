import React, {
  createContext, useContext, useEffect, useState, useCallback, useMemo,
} from 'react';
import {
  getAppMode, setAppMode as persistAppMode, isOnlineAvailable,
  subscribe, saveItem, saveMany, removeItem, uploadAvatar, deleteAvatar,
  exportAllLocalData, importAllData, replaceAll, getAll,
} from '../services/storage';
import {
  generateId, shuffleArray, todayISO, getWeekKey,
} from '../utils/helpers';

const AppDataContext = createContext(null);

export const COLLECTIONS = [
  'students', 'attendance', 'emulation', 'duty', 'quizzes', 'quizResults', 'evaluations',
];

const DEFAULT_SETTINGS = {
  className: 'Lớp 3A',
  teacherName: 'Cô Linh',
  schoolYear: '2026 - 2027',
  subjects: [
    'Toán', 'Tiếng Việt', 'Đạo đức', 'Tự nhiên và Xã hội',
    'Mĩ thuật', 'Âm nhạc', 'Thể dục', 'Tin học', 'Tiếng Anh',
  ],
};

export function AppDataProvider({ children }) {
  const [mode, setModeState] = useState(getAppMode());
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [emulation, setEmulation] = useState([]);
  const [dutyDocs, setDutyDocs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [settings, setSettings] = useState(() => {
    const raw = localStorage.getItem('lophoc_settings');
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('lophoc_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    setLoading(true);
    const unsubs = [
      subscribe('students', setStudents),
      subscribe('attendance', setAttendance),
      subscribe('emulation', setEmulation),
      subscribe('duty', setDutyDocs),
      subscribe('quizzes', setQuizzes),
      subscribe('quizResults', setQuizResults),
      subscribe('evaluations', setEvaluations),
    ];
    setLoading(false);
    return () => unsubs.forEach((unsub) => unsub && unsub());
  }, [mode]);

  const changeMode = useCallback((newMode) => {
    persistAppMode(newMode);
    setModeState(newMode);
  }, []);

  const addStudent = useCallback(async (studentData) => {
    const id = generateId('hs');
    await saveItem('students', id, {
      name: studentData.name,
      group: studentData.group || 'Tổ 1',
      gender: studentData.gender || 'Nam',
      avatar: studentData.avatar || '',
      joinedAt: new Date().toISOString(),
    });
    return id;
  }, []);

  const addStudentsBulk = useCallback(async (names, startGroupIndex = 0) => {
    const groupNames = ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'];
    const items = names.map((name, index) => ({
      id: generateId('hs'),
      name,
      group: groupNames[(startGroupIndex + index) % groupNames.length],
      gender: 'Nam',
      avatar: '',
      joinedAt: new Date().toISOString(),
    }));
    await saveMany('students', items);
    return items;
  }, []);

  const updateStudent = useCallback(async (id, data) => {
    await saveItem('students', id, data);
  }, []);

  const deleteStudent = useCallback(async (id) => {
    await removeItem('students', id);
    await deleteAvatar(id);
  }, []);

  const setStudentAvatar = useCallback(async (id, base64DataUrl) => {
    const url = await uploadAvatar(id, base64DataUrl);
    await saveItem('students', id, { avatar: url });
    return url;
  }, []);

  const getAttendanceForDate = useCallback((date) => {
    return attendance.find((a) => a.id === date) || { id: date, records: {} };
  }, [attendance]);

  const setAttendanceRecord = useCallback(async (date, studentId, present, note) => {
    const existing = attendance.find((a) => a.id === date) || { id: date, records: {} };
    const newRecords = {
      ...existing.records,
      [studentId]: {
        present,
        note: note !== undefined ? note : (existing.records[studentId]?.note || ''),
      },
    };
    await saveItem('attendance', date, { records: newRecords });
  }, [attendance]);

  const setBulkNote = useCallback(async (date, studentIds, note) => {
    const existing = attendance.find((a) => a.id === date) || { id: date, records: {} };
    const newRecords = { ...existing.records };
    studentIds.forEach((sid) => {
      newRecords[sid] = {
        present: newRecords[sid]?.present ?? true,
        note,
      };
    });
    await saveItem('attendance', date, { records: newRecords });
  }, [attendance]);

  const markAllPresent = useCallback(async (date, studentIds) => {
    const existing = attendance.find((a) => a.id === date) || { id: date, records: {} };
    const newRecords = { ...existing.records };
    studentIds.forEach((sid) => {
      newRecords[sid] = { present: true, note: newRecords[sid]?.note || '' };
    });
    await saveItem('attendance', date, { records: newRecords });
  }, [attendance]);

  const addEmulationPoint = useCallback(async (studentId, points, reason, type) => {
    const id = generateId('em');
    const now = new Date();
    await saveItem('emulation', id, {
      studentId,
      points,
      reason,
      type,
      date: todayISO(),
      week: getWeekKey(now),
      createdAt: now.toISOString(),
    });
  }, []);

  const deleteEmulationPoint = useCallback(async (id) => {
    await removeItem('emulation', id);
  }, []);

  const getWeeklyRanking = useCallback((weekKey) => {
    const totals = {};
    emulation
      .filter((e) => e.week === weekKey)
      .forEach((e) => {
        totals[e.studentId] = (totals[e.studentId] || 0) + e.points;
      });
    return students
      .map((s) => ({ student: s, total: totals[s.id] || 0 }))
      .sort((a, b) => b.total - a.total);
  }, [emulation, students]);

  const getGroupRanking = useCallback((weekKey) => {
    const totals = { 'Tổ 1': 0, 'Tổ 2': 0, 'Tổ 3': 0, 'Tổ 4': 0 };
    const relevant = weekKey ? emulation.filter((e) => e.week === weekKey) : emulation;
    relevant.forEach((e) => {
      const student = students.find((s) => s.id === e.studentId);
      if (student && totals[student.group] !== undefined) {
        totals[student.group] += e.points;
      }
    });
    return Object.entries(totals)
      .map(([group, total]) => ({ group, total }))
      .sort((a, b) => b.total - a.total);
  }, [emulation, students]);

  const dutyState = dutyDocs.find((d) => d.id === 'main') || { history: {}, queue: [], cycleNumber: 0 };

  const assignDutyForDate = useCallback(async (date) => {
    if (dutyState.history && dutyState.history[date]) {
      return dutyState.history[date];
    }
    let queue = [...(dutyState.queue || [])];
    let cycleNumber = dutyState.cycleNumber || 0;
    if (queue.length < 4 && students.length > 0) {
      queue = shuffleArray(students.map((s) => s.id));
      cycleNumber += 1;
    }
    const groupSize = Math.min(4, students.length);
    const assigned = queue.slice(0, groupSize);
    const remaining = queue.slice(groupSize);
    const newHistory = { ...(dutyState.history || {}), [date]: assigned };
    await saveItem('duty', 'main', { history: newHistory, queue: remaining, cycleNumber });
    return assigned;
  }, [dutyState, students]);

  const rerollDutyForDate = useCallback(async (date) => {
    const currentAssigned = (dutyState.history && dutyState.history[date]) || [];
    const queue = [...currentAssigned, ...(dutyState.queue || [])];
    const newHistory = { ...(dutyState.history || {}) };
    delete newHistory[date];
    await saveItem('duty', 'main', { history: newHistory, queue, cycleNumber: dutyState.cycleNumber || 0 });
  }, [dutyState]);

  const addQuiz = useCallback(async (quizData) => {
    const id = generateId('quiz');
    await saveItem('quizzes', id, {
      title: quizData.title,
      questions: quizData.questions,
      createdAt: new Date().toISOString(),
    });
    return id;
  }, []);

  const updateQuiz = useCallback(async (id, data) => {
    await saveItem('quizzes', id, data);
  }, []);

  const deleteQuiz = useCallback(async (id) => {
    await removeItem('quizzes', id);
  }, []);

  const submitQuizResult = useCallback(async (quizId, studentName, score, total, answers) => {
    const id = generateId('qr');
    await saveItem('quizResults', id, {
      quizId,
      studentName,
      score,
      total,
      answers,
      date: new Date().toISOString(),
    });
    return id;
  }, []);

  const addEvaluation = useCallback(async (studentId, subject, rating, note) => {
    const id = generateId('ev');
    await saveItem('evaluations', id, {
      studentId,
      subject,
      rating,
      note: note || '',
      date: todayISO(),
      createdAt: new Date().toISOString(),
    });
  }, []);

  const deleteEvaluation = useCallback(async (id) => {
    await removeItem('evaluations', id);
  }, []);

  const backupAllData = useCallback(async () => {
    const result = {};
    if (mode === 'online') {
      for (const name of COLLECTIONS) {
        result[name] = await getAll(name);
      }
    } else {
      Object.assign(result, exportAllLocalData(COLLECTIONS));
    }
    result.settings = settings;
    return result;
  }, [mode, settings]);

  const restoreAllData = useCallback(async (dataObject) => {
    await importAllData(COLLECTIONS, dataObject);
    if (dataObject.settings) {
      setSettings({ ...DEFAULT_SETTINGS, ...dataObject.settings });
    }
  }, []);

  const clearAllData = useCallback(async () => {
    for (const name of COLLECTIONS) {
      await replaceAll(name, []);
    }
  }, []);

  const value = useMemo(() => ({
    mode, changeMode, isOnlineAvailable: isOnlineAvailable(),
    loading,
    students, addStudent, addStudentsBulk, updateStudent, deleteStudent, setStudentAvatar,
    attendance, getAttendanceForDate, setAttendanceRecord, setBulkNote, markAllPresent,
    emulation, addEmulationPoint, deleteEmulationPoint, getWeeklyRanking, getGroupRanking,
    dutyState, assignDutyForDate, rerollDutyForDate,
    quizzes, addQuiz, updateQuiz, deleteQuiz,
    quizResults, submitQuizResult,
    evaluations, addEvaluation, deleteEvaluation,
    settings, setSettings,
    backupAllData, restoreAllData, clearAllData,
  }), [
    mode, changeMode, loading, students, addStudent, addStudentsBulk, updateStudent, deleteStudent, setStudentAvatar,
    attendance, getAttendanceForDate, setAttendanceRecord, setBulkNote, markAllPresent,
    emulation, addEmulationPoint, deleteEmulationPoint, getWeeklyRanking, getGroupRanking,
    dutyState, assignDutyForDate, rerollDutyForDate,
    quizzes, addQuiz, updateQuiz, deleteQuiz,
    quizResults, submitQuizResult,
    evaluations, addEvaluation, deleteEvaluation,
    settings, backupAllData, restoreAllData, clearAllData,
  ]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData phải được dùng bên trong AppDataProvider');
  }
  return ctx;
}