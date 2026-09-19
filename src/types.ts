export type DayOfWeek = 'شنبه' | 'یکشنبه' | 'دوشنبه' | 'سهشنبه' | 'چهارشنبه';

export type SessionRecurrence = 'ثابت' | 'فرد' | 'زوج';

export interface ClassSession {
  id: string;
  courseId: number;
  courseName: string;
  groupId: number;
  instructor: string;
  room: string;
  day: DayOfWeek;
  startHour: number; // e.g. 8, 10, 12, 14, 16, 18
  endHour: number;   // e.g. 10, 12, 14, 16, 18, 20
  durationMinutes: number; // 120
  recurrence: SessionRecurrence; // 'ثابت' (هر هفته), 'فرد' (هفته فرد), 'زوج' (هفته زوج)
  sessionTitle: string; // جلسه اول / جلسه دوم
}

export interface CourseGroup {
  groupId: number;
  instructor: string;
  sessions: ClassSession[];
}

// امتحان پایان‌ترم: روز در بازه ۱۲ روزه امتحانات (۱ تا ۱۲)
export interface ExamSlot {
  day: number;             // شماره روز در بازه امتحانات، از ۱ تا ۱۲
  startHour: number;       // ساعت شروع، مثلاً 8, 11, 14
  durationMinutes: number; // مثلاً 180
}

export interface Course {
  id: number;
  name: string;
  exam?: ExamSlot;
  groups: CourseGroup[];
}

export interface ScheduleCombination {
  id: number;
  combinationIndex: number;
  selectedGroups: {
    courseId: number;
    courseName: string;
    groupId: number;
    instructor: string;
  }[];
  sessions: ClassSession[];
  hasConflict: boolean;          // تداخل کلاس یا امتحان
  conflictDetails?: string[];    // همه تداخل‌ها
  classConflictDetails?: string[];
  examConflictDetails?: string[];
  exams: { courseId: number; courseName: string; exam: ExamSlot }[];
}
