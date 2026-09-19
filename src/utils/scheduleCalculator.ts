import { COURSES } from '../data/coursesData';
import { ClassSession, ScheduleCombination } from '../types';

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

  // Check time overlap: intervals [s1.startHour, s1.endHour] and [s2.startHour, s2.endHour]
  const isTimeOverlap = Math.max(s1.startHour, s2.startHour) < Math.min(s1.endHour, s2.endHour);
  if (!isTimeOverlap) {
    return false;
  }

  // If one is 'فرد' and the other is 'زوج', they NEVER conflict because they occur in alternating weeks!
  if (
    (s1.recurrence === 'فرد' && s2.recurrence === 'زوج') ||
    (s1.recurrence === 'زوج' && s2.recurrence === 'فرد')
  ) {
    return false;
  }

  // Any other combination (ثابت+ثابت, ثابت+فرد, ثابت+زوج, فرد+فرد, زوج+زوج) is a conflict!
  return true;
}

export function getConflictDescription(s1: ClassSession, s2: ClassSession): string {
  const timeStr = `${s1.startHour.toString().padStart(2, '0')}:00 تا ${s1.endHour.toString().padStart(2, '0')}:00`;
  return `تداخل روز ${s1.day} ساعت ${timeStr} بین «${s1.courseName} (${s1.recurrence})» و «${s2.courseName} (${s2.recurrence})»`;
}

/**
 * Evaluates all 16 possible combinations and partitions them into valid and invalid.
 */
export function calculateAllCombinations(): {
  allCombinations: ScheduleCombination[];
  validCombinations: ScheduleCombination[];
  invalidCombinations: ScheduleCombination[];
} {
  const allCombinations: ScheduleCombination[] = [];

  const c1 = COURSES.find((c) => c.id === 1)!;
  const c2 = COURSES.find((c) => c.id === 2)!;
  const c3 = COURSES.find((c) => c.id === 3)!;
  const c4 = COURSES.find((c) => c.id === 4)!;
  const c5 = COURSES.find((c) => c.id === 5)!;

  let combinationCount = 0;

  for (const g1 of c1.groups) {
    for (const g2 of c2.groups) {
      for (const g3 of c3.groups) {
        for (const g4 of c4.groups) {
          for (const g5 of c5.groups) {
            combinationCount++;

            const selectedGroups = [
              { courseId: c1.id, courseName: c1.name, groupId: g1.groupId, instructor: g1.instructor },
              { courseId: c2.id, courseName: c2.name, groupId: g2.groupId, instructor: g2.instructor },
              { courseId: c3.id, courseName: c3.name, groupId: g3.groupId, instructor: g3.instructor },
              { courseId: c4.id, courseName: c4.name, groupId: g4.groupId, instructor: g4.instructor },
              { courseId: c5.id, courseName: c5.name, groupId: g5.groupId, instructor: g5.instructor },
            ];

            const sessions: ClassSession[] = [
              ...g1.sessions,
              ...g2.sessions,
              ...g3.sessions,
              ...g4.sessions,
              ...g5.sessions,
            ];

            const conflictDetails: string[] = [];

            for (let i = 0; i < sessions.length; i++) {
              for (let j = i + 1; j < sessions.length; j++) {
                if (doSessionsConflict(sessions[i], sessions[j])) {
                  conflictDetails.push(getConflictDescription(sessions[i], sessions[j]));
                }
              }
            }

            const hasConflict = conflictDetails.length > 0;

            allCombinations.push({
              id: combinationCount,
              combinationIndex: combinationCount,
              selectedGroups,
              sessions,
              hasConflict,
              conflictDetails,
            });
          }
        }
      }
    }
  }

  const validCombinations = allCombinations.filter((c) => !c.hasConflict);
  const invalidCombinations = allCombinations.filter((c) => c.hasConflict);

  return {
    allCombinations,
    validCombinations,
    invalidCombinations,
  };
}
