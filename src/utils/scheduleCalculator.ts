import { COURSES } from '../data/coursesData';
import { ClassSession, Course, CourseGroup, ExamSlot, ScheduleCombination } from '../types';

/**
 * Checks if two sessions conflict based on the university rules:
 * - Must be on the same day
 * - Must overlap in time (intervals strictly intersect, back-to-back classes do not conflict)
 * - Conflict rules by recurrence:
 *   - ثابت + ثابت -> تداخل
 *   - ثابت + فرد -> تداخل
 *   - ثابت + زوج -> تداخل
 *   - فرد + فرد -> تداخل
 *   - زوج + زوج -> تداخل
 *   - فرد + زوج -> بدون تداخل (برگزار در هفته‌های مجزا)
 */
export function doSessionsConflict(s1: ClassSession, s2: ClassSession): boolean {
  if (s1.day !== s2.day) {
    return false;
  }

  const isTimeOverlap = Math.max(s1.startHour, s2.startHour) < Math.min(s1.endHour, s2.endHour);
  if (!isTimeOverlap) {
    return false;
  }

  // فرد + زوج هرگز تداخل ندارند (هفته‌های جداگانه)
  if (
    (s1.recurrence === 'فرد' && s2.recurrence === 'زوج') ||
    (s1.recurrence === 'زوج' && s2.recurrence === 'فرد')
  ) {
    return false;
  }

  return true;
}

export function getConflictDescription(s1: ClassSession, s2: ClassSession): string {
  const timeStr = `${s1.startHour.toString().padStart(2, '0')}:00 تا ${s1.endHour.toString().padStart(2, '0')}:00`;
  return `تداخل روز ${s1.day} ساعت ${timeStr} بین «${s1.courseName} (${s1.recurrence})» و «${s2.courseName} (${s2.recurrence})»`;
}

/** ساعت پایان امتحان (عدد اعشاری، مثلاً 11 + 180 دقیقه = 14) */
export function getExamEndHour(exam: ExamSlot): number {
  return exam.startHour + exam.durationMinutes / 60;
}

export function formatHour(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
}

export function formatExamTime(exam: ExamSlot): string {
  return `روز ${exam.day} امتحانات، ${formatHour(exam.startHour)} تا ${formatHour(getExamEndHour(exam))}`;
}

/**
 * دو امتحان تداخل دارند اگر در یک روز باشند و بازه زمانی‌شان هم‌پوشانی داشته باشد.
 * امتحان‌های پشت‌سرهم (مثلاً ۱۱–۱۴ و ۱۴–۱۷) تداخل حساب نمی‌شوند.
 */
export function doExamsConflict(e1: ExamSlot, e2: ExamSlot): boolean {
  if (e1.day !== e2.day) return false;
  return Math.max(e1.startHour, e2.startHour) < Math.min(getExamEndHour(e1), getExamEndHour(e2));
}

export function getExamConflictDescription(c1: Course, c2: Course): string {
  return `تداخل امتحان: «${c1.name}» (${formatExamTime(c1.exam!)}) با «${c2.name}» (${formatExamTime(c2.exam!)})`;
}

/**
 * Evaluates every possible combination of groups (one group per course) and
 * partitions them into valid and invalid.
 * A combination is invalid if any class sessions overlap OR any exams overlap.
 *
 * @param courseIds اگر داده شود فقط همین درس‌ها بررسی می‌شوند (پیش‌فرض: همه درس‌ها)
 */
export function calculateAllCombinations(courseIds?: number[]): {
  allCombinations: ScheduleCombination[];
  validCombinations: ScheduleCombination[];
  invalidCombinations: ScheduleCombination[];
} {
  const courses = courseIds ? COURSES.filter((c) => courseIds.includes(c.id)) : COURSES;

  // حاصل‌ضرب دکارتی گروه‌های همه درس‌ها
  let product: CourseGroup[][] = [[]];
  for (const course of courses) {
    const next: CourseGroup[][] = [];
    for (const partial of product) {
      for (const g of course.groups) {
        next.push([...partial, g]);
      }
    }
    product = next;
  }

  // تداخل امتحان‌ها فقط به درس‌ها بستگی دارد (نه گروه‌ها)، پس یک‌بار محاسبه می‌شود
  const examConflictDetails: string[] = [];
  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const a = courses[i];
      const b = courses[j];
      if (a.exam && b.exam && doExamsConflict(a.exam, b.exam)) {
        examConflictDetails.push(getExamConflictDescription(a, b));
      }
    }
  }

  const exams = courses
    .filter((c) => c.exam)
    .map((c) => ({ courseId: c.id, courseName: c.name, exam: c.exam! }));

  const allCombinations: ScheduleCombination[] = product.map((groups, idx) => {
    const selectedGroups = groups.map((g, i) => ({
      courseId: courses[i].id,
      courseName: courses[i].name,
      groupId: g.groupId,
      instructor: g.instructor,
    }));

    const sessions: ClassSession[] = groups.flatMap((g) => g.sessions);

    const classConflictDetails: string[] = [];
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        if (doSessionsConflict(sessions[i], sessions[j])) {
          classConflictDetails.push(getConflictDescription(sessions[i], sessions[j]));
        }
      }
    }

    const conflictDetails = [...classConflictDetails, ...examConflictDetails];

    return {
      id: idx + 1,
      combinationIndex: idx + 1,
      selectedGroups,
      sessions,
      hasConflict: conflictDetails.length > 0,
      conflictDetails,
      classConflictDetails,
      examConflictDetails,
      exams,
    };
  });

  return {
    allCombinations,
    validCombinations: allCombinations.filter((c) => !c.hasConflict),
    invalidCombinations: allCombinations.filter((c) => c.hasConflict),
  };
}

/** تعداد کل ترکیب‌ها به‌صورت رشته‌ی ضرب، مثلاً «۲ × ۲ × ۱ = ۴» */
export function getCombinationFormula(courseIds?: number[]): string {
  const courses = courseIds ? COURSES.filter((c) => courseIds.includes(c.id)) : COURSES;
  const counts = courses.map((c) => c.groups.length);
  const total = counts.reduce((a, b) => a * b, 1);
  return `${counts.join(' × ')} = ${total}`;
}
