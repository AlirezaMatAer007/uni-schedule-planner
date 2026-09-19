import React from 'react';
import { CalendarClock, AlertTriangle } from 'lucide-react';
import { ScheduleCombination } from '../types';
import { formatHour, getExamEndHour, doExamsConflict } from '../utils/scheduleCalculator';

interface ExamScheduleProps {
  combination: ScheduleCombination;
}

export const ExamSchedule: React.FC<ExamScheduleProps> = ({ combination }) => {
  const exams = [...combination.exams].sort(
    (a, b) => a.exam.day - b.exam.day || a.exam.startHour - b.exam.startHour
  );

  if (exams.length === 0) return null;

  const isInConflict = (index: number) =>
    exams.some((other, j) => j !== index && doExamsConflict(exams[index].exam, other.exam));

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-indigo-600" />
        <h2 className="text-base font-extrabold text-slate-800">برنامه امتحانات پایان‌ترم</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-right">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="py-2 px-2 font-bold">روز</th>
              <th className="py-2 px-2 font-bold">ساعت</th>
              <th className="py-2 px-2 font-bold">درس</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e, i) => {
              const conflict = isInConflict(i);
              return (
                <tr
                  key={e.courseId}
                  className={`border-b border-slate-100 last:border-0 ${conflict ? 'bg-rose-50' : ''}`}
                >
                  <td className="py-2 px-2 font-bold text-slate-800 whitespace-nowrap">
                    روز {e.exam.day} امتحانات
                  </td>
                  <td className="py-2 px-2 text-slate-700 whitespace-nowrap">
                    {formatHour(e.exam.startHour)} تا {formatHour(getExamEndHour(e.exam))}
                  </td>
                  <td className="py-2 px-2 text-slate-800">
                    {e.courseName}
                    {conflict && (
                      <span className="inline-flex items-center gap-1 mr-2 text-rose-700 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        تداخل
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        امتحانات پایان‌ترم در یک بازه ۱۲ روزه برگزار می‌شود؛ «روز n» یعنی n‌امین روز آن بازه که تاریخ دقیقش بعداً اعلام می‌شود.
      </p>
    </section>
  );
};
