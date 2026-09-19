import React from 'react';
import { Check } from 'lucide-react';
import { Course } from '../types';

interface CourseSelectorProps {
  courses: Course[];
  selectedIds: number[];
  onToggle: (courseId: number) => void;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({ courses, selectedIds, onToggle }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-slate-800">درس‌های انتخابی شما</h2>
        <span className="text-xs text-slate-500 font-medium">{selectedIds.length} درس انتخاب شده</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {courses.map((course) => {
          const active = selectedIds.includes(course.id);
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => onToggle(course.id)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {active && <Check className="w-3.5 h-3.5" />}
              {course.name}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        با روشن و خاموش کردن هر درس، ترکیب‌های بدون تداخل (کلاس و امتحان) دوباره محاسبه می‌شود.
      </p>
    </section>
  );
};
