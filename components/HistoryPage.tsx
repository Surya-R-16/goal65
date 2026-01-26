import React, { useMemo, useState } from 'react';
import { FoodLog, MealType } from '../types';
import { format, isToday, isYesterday } from 'date-fns';
import { Trash2, Edit2, Calendar } from 'lucide-react';

interface HistoryPageProps {
  logs: FoodLog[];
  deleteLog: (id: string) => void;
  editLog: (log: FoodLog) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ logs, deleteLog, editLog }) => {
  
  // Group logs by Date string -> Meal Type -> Logs[]
  const groupedLogs = useMemo(() => {
    const groups: Record<string, Record<string, FoodLog[]>> = {};

    logs.forEach(log => {
      const dateStr = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!groups[dateStr]) groups[dateStr] = {};
      
      const meal = log.meal || 'Snack';
      if (!groups[dateStr][meal]) groups[dateStr][meal] = [];
      
      groups[dateStr][meal].push(log);
    });

    return groups;
  }, [logs]);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const mealOrder = [MealType.Breakfast, MealType.Lunch, MealType.Snack, MealType.Dinner];

  const getDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, 'MMMM do, yyyy');
  };

  const getDayTotal = (dateStr: string) => {
    let total = 0;
    const dayLogs = groupedLogs[dateStr];
    if (dayLogs) {
        // Explicitly cast to handle potential 'unknown' inference from Object.values in some environments
        (Object.values(dayLogs) as FoodLog[][]).forEach((mealLogs) => {
            mealLogs.forEach((l) => total += l.totalCalories);
        });
    }
    return total;
  };

  if (logs.length === 0) {
    return (
      <div className="pb-28 pt-6 px-4 max-w-md mx-auto text-center">
        <h1 className="text-3xl font-normal text-onSurface mb-8">History</h1>
        <div className="py-12 px-6 bg-surface-container rounded-[28px] border border-dashed border-outline/20">
            <p className="text-onSurface-variant">No history available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-6 px-4 max-w-md mx-auto">
      <h1 className="text-3xl font-normal text-onSurface mb-6">History</h1>
      
      <div className="space-y-8">
        {sortedDates.map(dateStr => (
          <div key={dateStr} className="animate-slideUp">
             <div className="flex justify-between items-baseline mb-3 px-2">
                <h2 className="text-lg font-medium text-primary">{getDisplayDate(dateStr)}</h2>
                <span className="text-sm font-medium text-onSurface-variant">{Math.round(getDayTotal(dateStr))} kcal</span>
             </div>

             <div className="space-y-3">
                {mealOrder.map(mealType => {
                   // Safely access data
                   const dayData = groupedLogs[dateStr];
                   const mealLogs = dayData ? dayData[mealType] : undefined;
                   
                   if (!mealLogs) return null;

                   const mealTotal = mealLogs.reduce((sum, l) => sum + l.totalCalories, 0);

                   return (
                      <div key={mealType} className="bg-surface-bright rounded-[24px] border border-outline/5 shadow-sm overflow-hidden">
                         {/* Meal Header */}
                         <div className="bg-surface-container/50 px-4 py-2 flex justify-between items-center">
                            <span className="text-sm font-medium text-onSurface-variant uppercase tracking-wider">{mealType}</span>
                            <span className="text-xs font-bold text-onSurface opacity-60">{Math.round(mealTotal)} kcal</span>
                         </div>

                         {/* Logs for this meal */}
                         <div className="divide-y divide-outline/5">
                            {mealLogs.map(log => (
                               <div key={log.id} className="p-4 relative group">
                                  <div className="flex justify-between items-start">
                                     <div className="space-y-2 w-full">
                                         {log.items.map((item, idx) => (
                                             <div key={idx} className="flex justify-between items-baseline">
                                                <div>
                                                    <div className="text-sm text-onSurface font-medium">{item.name}</div>
                                                    <div className="text-xs text-onSurface-variant">{item.quantity} {item.unit}</div>
                                                </div>
                                                <div className="text-sm text-primary/80 font-medium">{Math.round(item.calories)}</div>
                                             </div>
                                         ))}
                                     </div>
                                  </div>
                                  
                                  <div className="flex gap-3 justify-end mt-3 border-t border-outline/5 pt-2 opacity-50 hover:opacity-100 transition-opacity">
                                      <button onClick={() => editLog(log)} className="text-xs flex items-center gap-1 text-primary hover:text-primary-container">
                                        <Edit2 size={12}/> Edit
                                      </button>
                                      <button onClick={() => deleteLog(log.id)} className="text-xs flex items-center gap-1 text-error hover:text-error/70">
                                        <Trash2 size={12}/> Delete
                                      </button>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;