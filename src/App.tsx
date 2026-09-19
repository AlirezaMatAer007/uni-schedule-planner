import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { calculateAllCombinations } from './utils/scheduleCalculator';
import { Header } from './components/Header';
import { Legend } from './components/Legend';
import { NavigationControls } from './components/NavigationControls';
import { Timetable } from './components/Timetable';
import { SelectedGroupsDetails } from './components/SelectedGroupsDetails';
import { ConflictAuditModal } from './components/ConflictAuditModal';

export default function App() {
  // Pre-calculate all combinations (all 16 combinations, partitioned into valid and invalid)
  const { allCombinations, validCombinations, invalidCombinations } = useMemo(() => {
    return calculateAllCombinations();
  }, []);

  // Active state index (0-based)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const totalValid = validCombinations.length;
  const currentCombination = validCombinations[currentIndex] || validCombinations[0];

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
        {/* Color Legend */}
        <Legend />

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

        {/* Details for current selected course groups */}
        {currentCombination && (
          <SelectedGroupsDetails combination={currentCombination} />
        )}
      </main>

      {/* Conflict Audit Modal for transparency on all 16 states */}
      <ConflictAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        allCombinations={allCombinations}
        validCombinations={validCombinations}
        invalidCombinations={invalidCombinations}
      />
    </div>
  );
}
