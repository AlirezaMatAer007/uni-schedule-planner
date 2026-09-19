import React from 'react';
import { X, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { ScheduleCombination } from '../types';

interface ConflictAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCombinations: ScheduleCombination[];
  validCombinations: ScheduleCombination[];
  invalidCombinations: ScheduleCombination[];
  courseCount: number; // تعداد درس‌های انتخاب‌شده
  formula: string;     // مثلاً «2 × 2 × 2 × 1 × 2 = 16»
}

export const ConflictAuditModal: React.FC<ConflictAuditModalProps> = ({
  isOpen,
  onClose,
  allCombinations,
  validCombinations,
  invalidCombinations,
  courseCount,
  formula,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-black text-slate-800">
                گزارش جامع بررسی و آزمون تداخل تمام ترکیب‌ها
              </h3>
              <p className="text-xs text-slate-500">
                ارزیابی الگوریتمی {allCombinations.length} حالت ممکن برای {courseCount} درس انتخابی
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-custom text-sm">
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-1">کل حالات ممکن گروهی:</div>
              <div className="text-2xl font-black text-slate-800">
                {allCombinations.length} <span className="text-xs font-normal text-slate-500">ترکیب</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1" dir="ltr">{formula}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs text-emerald-700 font-semibold mb-1">حالات مجاز و بدون تداخل:</div>
              <div className="text-2xl font-black text-emerald-800">
                {validCombinations.length} <span className="text-xs font-normal text-emerald-600">برنامه</span>
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">بدون تداخل کلاس و امتحان</div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <div className="text-xs text-rose-700 font-semibold mb-1">حالات دارای تداخل (حذف‌شده):</div>
              <div className="text-2xl font-black text-rose-800">
                {invalidCombinations.length} <span className="text-xs font-normal text-rose-600">ترکیب</span>
              </div>
              <div className="text-[11px] text-rose-600 mt-1">تداخل کلاس یا امتحان</div>
            </div>
          </div>

          {/* Conflict Logic Rules Recap */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>مبانی قانون تداخل دانشگاه:</span>
            </h4>
            <ul className="text-xs text-amber-950 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>
                <strong>ثابت + ثابت، ثابت + فرد، ثابت + زوج، فرد + فرد، زوج + زوج:</strong> هرگاه در روز و ساعت یکسان واقع شوند، تداخل غیرمجاز است.
              </li>
              <li>
                <strong>فرد + زوج:</strong> حتی اگر ساعت و روز کاملاً یکسان باشد، <strong>تداخل ندارد</strong>؛ چراکه در هفته‌های جداگانه (یکی هفته‌های زوج و دیگری فرد) برگزار می‌شوند.
              </li>
              <li>
                <strong>کلاس‌های پشت سر هم:</strong> مثلاً ۰۸:۰۰ تا ۱۰:۰۰ و ۱۰:۰۰ تا ۱۲:۰۰ هیچ تداخلی ندارند.
              </li>
              <li>
                <strong>امتحانات:</strong> دو امتحانی که در یک روز از بازه امتحانات و در ساعت‌های هم‌پوشان باشند تداخل دارند؛ امتحان‌های پشت سر هم (مثلاً ۱۱–۱۴ و ۱۴–۱۷) تداخل حساب نمی‌شوند.
              </li>
            </ul>
          </div>

          {/* Invalid Combinations List */}
          <div>
            <h4 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>ترکیب‌های دارای تداخل (علت دقیق حذف):</span>
            </h4>

            <div className="space-y-3">
              {invalidCombinations.map((c, index) => (
                <div
                  key={c.id}
                  className="bg-white border border-rose-200 rounded-xl p-3.5 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-800">ترکیب حذف‌شده شماره {index + 1}:</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[11px] font-bold">
                      {c.classConflictDetails && c.classConflictDetails.length > 0 && c.examConflictDetails && c.examConflictDetails.length > 0
                        ? 'تداخل کلاس و امتحان'
                        : c.examConflictDetails && c.examConflictDetails.length > 0
                        ? 'تداخل امتحان'
                        : 'تداخل زمانی کلاس'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <strong>انتخاب‌ها:</strong>{' '}
                    {c.selectedGroups.map((g) => `${g.courseName} (گروه ${g.groupId})`).join(' — ')}
                  </div>

                  {c.conflictDetails && c.conflictDetails.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 text-xs text-rose-900 font-medium space-y-1">
                      {c.conflictDetails.map((d, i) => (
                        <div key={i}>⚠️ {d}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            متوجه شدم، بازگشت به جدول
          </button>
        </div>
      </div>
    </div>
  );
};
