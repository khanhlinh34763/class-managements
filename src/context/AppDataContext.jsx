import React, {
  createContext, useContext, useEffect, useState, useCallback, useMemo,
} from 'react';
import {
  subscribe, saveItem, saveMany, removeItem, uploadAvatar, deleteAvatar,
  importAllData, replaceAll, getAll,
} from '../services/storage';
import {
  generateId, shuffleArray, todayISO, getWeekKey,
} from '../utils/helpers';

const AppDataContext = createContext(null);

export const COLLECTIONS = [
  'students', 'attendance', 'emulation', 'duty', 'quizzes', 'quizResults', 'evaluations', 'settings', 'posts',
];

const DEFAULT_SETTINGS = {
  className: 'Lớp 5/2',
  teacherName: 'Cô Linh',
  schoolYear: '2026 - 2027',
  subjects: [
    'Toán', 'Tiếng Việt', 'Đạo đức', 'Tự nhiên và Xã hội',
    'Mĩ thuật', 'Âm nhạc', 'Thể dục', 'Tin học', 'Tiếng Anh',
  ],
};

export function AppDataProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [emulation, setEmulation] = useState([]);
  const [dutyDocs, setDutyDocs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [settingsDoc, setSettingsDoc] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const unsubs = [
      subscribe('students', setStudents),
      subscribe('attendance', setAttendance),
      subscribe('emulation', setEmulation),
      subscribe('duty', setDutyDocs),
      subscribe('quizzes', setQuizzes),
      subscribe('quizResults', setQuizResults),
      subscribe('evaluations', setEvaluations),
      subscribe('posts', setPosts),
      subscribe('settings', (docsArr) => {
        setSettingsDoc(docsArr.find((d) => d.id === 'main') || null);
        setSettingsLoaded(true);
      }),
    ];
    return () => unsubs.forEach((unsub) => unsub && unsub());
  }, []);

  useEffect(() => {
    if (settingsLoaded && !settingsDoc) {
      saveItem('settings', 'main', DEFAULT_SETTINGS);
    }
  }, [settingsLoaded, settingsDoc]);

  const settings = settingsDoc ? { ...DEFAULT_SETTINGS, ...settingsDoc } : DEFAULT_SETTINGS;

  const updateSettings = useCallback(async (newSettings) => {
    await saveItem('settings', 'main', newSettings);
  }, []);

  const addStudent = useCallback(async (studentData) => {
    const id = generateId('hs');
    const data = {
      name: studentData.name,
      group: studentData.group || 'Tổ 1',
      gender: studentData.gender || 'Nam',
      avatar: studentData.avatar || '',
      joinedAt: new Date().toISOString(),
    };
    if (studentData.username) data.username = studentData.username;
    if (studentData.passwordHash) data.passwordHash = studentData.passwordHash;
    await saveItem('students', id, data);
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
    const cached = dutyState.history && dutyState.history[date];
    if (cached && cached.length > 0) {
      return cached;
    }
    if (students.length === 0) {
      return [];
    }
    let queue = [...(dutyState.queue || [])];
    let cycleNumber = dutyState.cycleNumber || 0;
    const groupSize = Math.min(4, students.length);
    if (queue.length < groupSize && students.length > 0) {
      const freshShuffle = shuffleArray(
        students.map((s) => s.id).filter((id) => !queue.includes(id)),
      );
      queue = [...queue, ...freshShuffle];
      cycleNumber += 1;
    }
    const assigned = queue.slice(0, groupSize);
    const remaining = queue.slice(groupSize);
    const newHistory = { ...(dutyState.history || {}), [date]: assigned };
    await saveItem('duty', 'main', { history: newHistory, queue: remaining, cycleNumber });
    return assigned;
  }, [dutyState, students]);

  const rerollDutyForDate = useCallback(async (date) => {
    const currentAssigned = (dutyState.history && dutyState.history[date]) || [];
    const pool = [...currentAssigned, ...(dutyState.queue || [])];
    const groupSize = Math.min(4, pool.length);
    const sameGroup = (a, b) => a.length === b.length && a.every((id) => b.includes(id));

    let assigned = shuffleArray(pool);
    for (let attempt = 0; attempt < 5 && pool.length > groupSize
      && sameGroup(assigned.slice(0, groupSize), currentAssigned); attempt += 1) {
      assigned = shuffleArray(pool);
    }

    const newAssigned = assigned.slice(0, groupSize);
    const remaining = assigned.slice(groupSize);
    const newHistory = { ...(dutyState.history || {}), [date]: newAssigned };
    await saveItem('duty', 'main', {
      history: newHistory, queue: remaining, cycleNumber: dutyState.cycleNumber || 0,
    });
    return newAssigned;
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

  const addPost = useCallback(async (postData) => {
    const id = generateId('post');
    await saveItem('posts', id, {
      title: postData.title || '',
      content: postData.content,
      authorName: postData.authorName || '',
      createdAt: new Date().toISOString(),
    });
    return id;
  }, []);

  const deletePost = useCallback(async (id) => {
    await removeItem('posts', id);
  }, []);

  const backupAllData = useCallback(async () => {
    const result = {};
    for (const name of COLLECTIONS) {
      result[name] = await getAll(name);
    }
    return result;
  }, []);

  const restoreAllData = useCallback(async (dataObject) => {
    await importAllData(COLLECTIONS, dataObject);
  }, []);

  const clearAllData = useCallback(async () => {
    for (const name of COLLECTIONS) {
      await replaceAll(name, []);
    }
  }, []);

  const value = useMemo(() => ({
    loading: !settingsLoaded,
    students, addStudent, addStudentsBulk, updateStudent, deleteStudent, setStudentAvatar,
    attendance, getAttendanceForDate, setAttendanceRecord, setBulkNote, markAllPresent,
    emulation, addEmulationPoint, deleteEmulationPoint, getWeeklyRanking, getGroupRanking,
    dutyState, assignDutyForDate, rerollDutyForDate,
    quizzes, addQuiz, updateQuiz, deleteQuiz,
    quizResults, submitQuizResult,
    evaluations, addEvaluation, deleteEvaluation,
    posts, addPost, deletePost,
    settings, updateSettings,
    backupAllData, restoreAllData, clearAllData,
  }), [
    settingsLoaded, students, addStudent, addStudentsBulk, updateStudent, deleteStudent, setStudentAvatar,
    attendance, getAttendanceForDate, setAttendanceRecord, setBulkNote, markAllPresent,
    emulation, addEmulationPoint, deleteEmulationPoint, getWeeklyRanking, getGroupRanking,
    dutyState, assignDutyForDate, rerollDutyForDate,
    quizzes, addQuiz, updateQuiz, deleteQuiz,
    quizResults, submitQuizResult,
    evaluations, addEvaluation, deleteEvaluation,
    posts, addPost, deletePost,
    settings, updateSettings, backupAllData, restoreAllData, clearAllData,
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