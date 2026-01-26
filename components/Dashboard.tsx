
import React, { useMemo } from 'react';
import { FoodLog, UserSettings, HealthTip, MealType } from '../types';
import { Flame, Target, Clock, ArrowRight, Utensils } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface DashboardProps {
  logs: FoodLog[];
  settings: UserSettings;
  healthTip: HealthTip | null;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, settings, healthTip }) => {
  // Aggregate data for today
  const todayLogs = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return logs.filter(l => l.timestamp >= startOfDay.getTime()).sort((a,b) => a.timestamp - b.timestamp);
  }, [logs]);

  const totalCalories = todayLogs.reduce((sum, log) => sum + log.totalCalories, 0);
  const progress = Math.min((totalCalories / settings.dailyCalorieTarget) * 100, 100);

  // Group by Meal Type
  const logsByMeal = useMemo(() => {
    const groups: Record<string, FoodLog[]> = {
      [MealType.Breakfast]: [],
      [MealType.Lunch]: [],
      [MealType.Snack]: [],
      [MealType.Dinner]: [],
    };
    
    todayLogs.forEach(log => {
      // Default to Snack if for some reason meal type is undefined
      const type = log.meal || MealType.Snack;
      if (!groups[type]) groups[type] = [];
      groups[type].push(log);
    });
    return groups;
  }, [todayLogs]);

  // Macros
  const macros = useMemo(() => {
    return todayLogs.reduce((acc, log) => {
      log.items.forEach(item => {
        acc.protein += item.protein_g || 0;
        acc.carbs += item.carbs_g || 0;
        acc.fat += item.fat_g || 0;
      });
      return acc;
    }, { protein: 0, carbs: 0, fat: 0 });
  }, [todayLogs]);

  const mealOrder = [MealType.Breakfast, MealType.Lunch, MealType.Snack, MealType.Dinner];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Daily Summary Card - High Contrast */}
      <div className="bg-surface-container rounded-3xl p-6 shadow-sm border border-outline/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-onSurface-variant text-sm font-bold tracking-wide uppercase">Calories Today</h2>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-semibold text-onSurface">{Math.round(totalCalories)}</span>
              <span className="text-lg text-onSurface-variant font-medium">/ {settings.dailyCalorieTarget}</span>
            </div>
          </div>
          <div className="p-3 bg-tertiary-container text-tertiary-onContainer rounded-xl shadow-sm">
            <Flame className="w-6 h-6" />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-4 bg-surface-variant rounded-full overflow-hidden mb-6 border border-outline/5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
              progress > 100 ? 'bg-error' : 'bg-primary'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Macros - Detailed Cards with high contrast text */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-outline/10">
            <div className="text-xl font-bold text-onSurface">{Math.round(macros.carbs)}g</div>
            <div className="text-xs text-onSurface-variant font-semibold mt-1 uppercase tracking-wide">Carbs</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-primary-container text-primary-onContainer rounded-2xl shadow-sm border border-primary/10">
            <div className="text-xl font-bold">{Math.round(macros.protein)}g</div>
            <div className="text-xs opacity-80 font-semibold mt-1 uppercase tracking-wide">Protein</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-outline/10">
            <div className="text-xl font-bold text-onSurface">{Math.round(macros.fat)}g</div>
            <div className="text-xs text-onSurface-variant font-semibold mt-1 uppercase tracking-wide">Fat</div>
          </div>
        </div>
      </div>

      {/* Health Tip */}
      {healthTip && (
        <div className="bg-secondary-container text-secondary-onContainer rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-secondary-onContainer/10 p-1 rounded-md">
                 <Target size={16} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-90">Daily Insight</span>
            </div>
            <p className="font-medium text-lg leading-relaxed">"{healthTip.tip}"</p>
          </div>
        </div>
      )}

      {/* Meals grouped by Section */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-4 px-1">
             <h3 className="text-xl font-normal text-onSurface">Today's Meals</h3>
             <Link to="/history" className="text-primary font-bold text-sm flex items-center gap-1 bg-surface-variant/30 px-3 py-1 rounded-full">
                History <ArrowRight size={14}/>
             </Link>
        </div>
        
        {todayLogs.length === 0 ? (
            <div className="text-center py-12 text-onSurface-variant bg-surface-bright rounded-3xl border border-dashed border-outline/30 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-3xl">🍽️</div>
                <p className="font-medium">No meals recorded yet.</p>
                <p className="text-xs">Tap the mic above to start tracking!</p>
            </div>
        ) : (
            <div className="space-y-6">
                {mealOrder.map(mealType => {
                   const meals = logsByMeal[mealType];
                   if (meals.length === 0) return null;
                   
                   const mealTotalCals = meals.reduce((sum, log) => sum + log.totalCalories, 0);

                   return (
                     <div key={mealType} className="animate-slideUp">
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-3 px-2">
                           <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-onSurface">{mealType}</span>
                              <div className="h-px w-8 bg-outline/20"></div>
                           </div>
                           <span className="text-sm font-semibold text-primary">{Math.round(mealTotalCals)} kcal</span>
                        </div>

                        {/* Cards for entries */}
                        <div className="space-y-3">
                            {meals.map(log => (
                                <div key={log.id} className="bg-white p-4 rounded-2xl border border-outline/10 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start border-b border-outline/5 pb-2">
                                        <div className="flex items-center gap-2 text-onSurface-variant">
                                            <Clock size={14}/>
                                            <span className="text-xs font-medium">{format(new Date(log.timestamp), 'h:mm a')}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="divide-y divide-outline/5">
                                        {log.items.map((item, idx) => (
                                            <div key={idx} className="py-2 first:pt-0 last:pb-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="text-base font-medium text-onSurface">{item.name}</span>
                                                    <span className="text-sm font-bold text-onSurface">{Math.round(item.calories)} <span className="text-xs font-normal text-onSurface-variant">kcal</span></span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                   <span className="text-sm text-onSurface-variant font-medium">{item.quantity} {item.unit}</span>
                                                   <div className="flex gap-2 text-xs font-semibold">
                                                       <span className="text-primary bg-primary/5 px-1.5 py-0.5 rounded">{Math.round(item.protein_g)}p</span>
                                                       <span className="text-secondary bg-secondary/5 px-1.5 py-0.5 rounded">{Math.round(item.carbs_g)}c</span>
                                                       <span className="text-tertiary bg-tertiary/5 px-1.5 py-0.5 rounded">{Math.round(item.fat_g)}f</span>
                                                   </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                   );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
