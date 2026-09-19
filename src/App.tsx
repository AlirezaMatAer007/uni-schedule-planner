import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { calculateAllCombinations, getCombinationFormula } from './utils/scheduleCalculator';
import { COURSES } from './data/coursesData';
import { Header } from './components/Header';
import { Legend } from './components/Legend';
import { NavigationControls } from './components/NavigationControls';
import { Timetable } from './components/Timetable';
import { SelectedGroupsDetails } from './components/SelectedGroupsDetails';
import { ConflictAuditModal } from './components/ConflictAuditModal';
import { CourseSelector } from './components/CourseSelector';
import { ExamSchedule } from './components/ExamSchedule';

// درس‌هایی که در ابتدا انتخاب هستند (پنج درس اصلی ترم)
const DEFAULT_SELECTED_IDS = [1, 2, 3, 4, 5];

export default function App() {
  const [selectedIds, setSelectedIds] = useState<number[]>(DEFAULT_SELECTED_IDS);

  // ترتیب ثابت بر اساس ترتیب درس‌ها در COURSES
  const orderedSelectedIds = useMemo(
    () => COURSES.filter((c) => selectedIds.includes(c.id)).map((c) => c.id),
    [selectedIds]
  );

  // محاسبه همه ترکیب‌ها برای درس‌های انتخاب‌شده
  const { allCombinations, validCombinations, invalidCombinations } = useMemo(() => {
    return calculateAllCombinations(orderedSelectedIds);
  }, [orderedSelectedIds]);

  const formula = useMemo(() => getCombinationFormula(orderedSelectedIds), [orderedSelectedIds]);

  // Active state index (0-based)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const totalValid = validCombinations.length;
  const currentCombination = validCombinations[currentIndex] || validCombinations[0];

  // با عوض شدن درس‌ها، به حالت اول برگرد
  useEffect(() => {
    setCurrentIndex(0);
  }, [orderedSelectedIds]);

  const handleToggleCourse = useCallback((courseId: number) => {
    setSelectedIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  }, []);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalValid - 1 ? prev + 1 : prev));
  }, [totalValid]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleSelectIndex = useCallback((index: number) => {
    if (index >= 0 && index < totalValid) {
      setCurrentIndex(index);
    }
  }, [totalValid]);

  // Keyboard navigation support: ArrowRight and ArrowLeft
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if inside an input or modal
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // وقتی هیچ ترکیب سالمی نیست، دلیل‌های رایج را نشان بده
  const noValidReasons = useMemo(() => {
    if (totalValid > 0 || invalidCombinations.length === 0) return [];
    const counts = new Map<string, number>();
    for (const c of invalidCombinations) {
      for (const d of c.conflictDetails ?? []) {
        counts.set(d, (counts.get(d) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [totalValid, invalidCombinations]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-16">
      {/* Header */}
      <Header
        totalCombinations={allCombinations.length}
        validCombinationsCount={validCombinations.length}
        invalidCombinationsCount={invalidCombinations.length}
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5 flex-1">
        {/* Course picker */}
        <CourseSelector courses={COURSES} selectedIds={selectedIds} onToggle={handleToggleCourse} />

        {/* Color Legend */}
        <Legend />

        {selectedIds.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-sm text-slate-600">
            حداقل یک درس را انتخاب کنید.
          </div>
        )}

        {selectedIds.length > 0 && totalValid === 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-2">
            <h2 className="text-sm font-extrabold text-rose-900">
              با این درس‌ها هیچ ترکیب بدون تداخلی وجود ندارد
            </h2>
            <p className="text-xs text-rose-800 leading-relaxed">
              یکی از درس‌های درگیر را از انتخاب‌ها حذف کنید. رایج‌ترین دلایل تداخل:
            </p>
            <ul className="list-disc list-inside text-xs text-rose-900 space-y-1 leading-relaxed">
              {noValidReasons.map(([text, n]) => (
                <li key={text}>
                  {text} <span className="text-rose-600">(در {n} از {allCombinations.length} ترکیب)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* State Controls (حالت 1 / N and Prev/Next buttons) */}
        {currentCombination && (
          <NavigationControls
            currentIndex={currentIndex}
            totalCount={totalValid}
            currentCombination={currentCombination}
            onNext={handleNext}
            onPrev={handlePrev}
            onSelectIndex={handleSelectIndex}
          />
        )}

        {/* Timetable Table (Weekly Schedule) */}
        {currentCombination && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-extrabold text-slate-800">
                جدول هفتگی — برنامه شماره {currentIndex + 1}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                (در نمایشگرهای کوچک یا موبایل می‌توانید جدول را افقی اسکرول کنید؛ ستون ساعت ثابت می‌ماند)
              </span>
            </div>
            <Timetable combination={currentCombination} />
          </div>
        )}

        {/* Exam dates for the selected courses */}
        {currentCombination && <ExamSchedule combination={currentCombination} />}

        {/* Details for current selected course groups */}
        {currentCombination && (
          <SelectedGroupsDetails combination={currentCombination} />
        )}
      </main>

      {/* Conflict Audit Modal for transparency on all states */}
      <ConflictAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        allCombinations={allCombinations}
        validCombinations={validCombinations}
        invalidCombinations={invalidCombinations}
        courseCount={orderedSelectedIds.length}
        formula={formula}
      />
    </div>
  );
}
