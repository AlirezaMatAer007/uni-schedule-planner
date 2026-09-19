import React from 'react';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  totalCombinations: number;
  validCombinationsCount: number;
  invalidCombinationsCount: number;
  onOpenAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCombinations,
  validCombinationsCount,
  invalidCombinationsCount,
  onOpenAudit,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                برنامه‌ریزی انتخاب واحد دانشگاه
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                محاسبه تمام حالت‌های بدون تداخل بر اساس تقویم هفتگی ثابت و هفته‌درمیان (زوج / فرد)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{validCombinationsCount} حالت معتبر</span>
              <span className="text-emerald-500 font-normal">از {totalCombinations} ترکیب</span>
            </div>

            <button
              onClick={onOpenAudit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
              title="مشاهده بررسی تداخل‌ها و علت حذف سایر حالت‌ها"
            >
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{invalidCombinationsCount} حالت دارای تداخل</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
