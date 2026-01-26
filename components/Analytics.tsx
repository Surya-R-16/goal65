
import React, { useMemo, useState } from 'react';
import { FoodLog, UserSettings } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { format, eachDayOfInterval } from 'date-fns';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface AnalyticsProps {
  logs: FoodLog[];
  settings: UserSettings;
}

const Analytics: React.FC<AnalyticsProps> = ({ logs, settings }) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  // Generate Weekly Data
  const weeklyData = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6); // Last 7 days including today
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayLogs = logs.filter(l => format(new Date(l.timestamp), 'yyyy-MM-dd') === dateStr);
        const calories = dayLogs.reduce((sum, l) => sum + l.totalCalories, 0);
        return {
            name: format(day, 'EEE'),
            calories: calories,
            fullDate: dateStr
        };
    });
  }, [logs]);

  // Aggregate Macro Distribution
  const macroData = useMemo(() => {
    const totals = logs.reduce((acc, log) => {
        log.items.forEach(item => {
            acc.protein += item.protein_g;
            acc.carbs += item.carbs_g;
            acc.fat += item.fat_g;
        });
        return acc;
    }, { protein: 0, carbs: 0, fat: 0 });

    const totalGrams = totals.protein + totals.carbs + totals.fat;
    // Prevent division by zero if empty
    const safeTotal = totalGrams || 1; 

    return [
        { name: 'Carbs', value: totals.carbs, color: '#E8DEF8', raw: Math.round(totals.carbs), percent: Math.round((totals.carbs / safeTotal) * 100) },
        { name: 'Protein', value: totals.protein, color: '#6750A4', raw: Math.round(totals.protein), percent: Math.round((totals.protein / safeTotal) * 100) },
        { name: 'Fat', value: totals.fat, color: '#FFD8E4', raw: Math.round(totals.fat), percent: Math.round((totals.fat / safeTotal) * 100) }
    ];
  }, [logs]);

  const avgCalories = Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / 7);

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-normal text-onSurface">Analytics</h1>
        <div className="bg-surface-variant rounded-full p-1 flex self-start sm:self-auto">
            <button 
                onClick={() => setViewMode('weekly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'weekly' ? 'bg-white shadow-sm text-onSurface' : 'text-onSurface-variant'}`}
            >
                Weekly
            </button>
            <button 
                onClick={() => setViewMode('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'monthly' ? 'bg-white shadow-sm text-onSurface' : 'text-onSurface-variant'}`}
            >
                Monthly
            </button>
        </div>
      </header>

      {/* Calorie Trend Chart */}
      <div className="bg-white rounded-[28px] p-6 shadow-sm border border-outline/10">
        <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary-container rounded-lg text-primary-onContainer">
               <TrendingUp size={20} />
            </div>
            <h2 className="text-lg font-bold text-onSurface">Calorie Trend</h2>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#1C1B1F', fontSize: 13, fontWeight: 500}} 
                dy={10}
              />
              <Tooltip 
                cursor={{fill: '#F3EDF7'}}
                contentStyle={{borderRadius: '16px', border: 'none', background: '#313033', color: '#F4EFF4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                itemStyle={{color: '#F4EFF4'}}
              />
              <Bar dataKey="calories" radius={[8, 8, 8, 8]}>
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.calories > settings.dailyCalorieTarget ? '#B3261E' : '#6750A4'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 pt-4 border-t border-outline/10 flex justify-between items-center">
            <span className="text-sm font-medium text-onSurface-variant">Weekly Average</span>
            <span className="text-2xl font-bold text-onSurface">{avgCalories} <span className="text-sm font-normal text-onSurface-variant">kcal</span></span>
        </div>
      </div>

      {/* Macro Split - Mobile Optimized Stack */}
      <div className="bg-surface-container rounded-[28px] p-6 shadow-sm border border-outline/5">
        <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-secondary-container rounded-lg text-secondary-onContainer">
               <PieChartIcon size={20} />
            </div>
            <h2 className="text-lg font-bold text-onSurface">Macro Distribution</h2>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Pie Chart */}
            <div className="w-48 h-48 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={macroData} 
                            dataKey="value" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={45} 
                            outerRadius={70} 
                            paddingAngle={5}
                            stroke="none"
                        >
                            {macroData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-xs font-medium text-onSurface-variant">Total</span>
                   <span className="text-lg font-bold text-onSurface">100%</span>
                </div>
            </div>
            
            {/* Detailed Legend */}
            <div className="w-full grid gap-4">
                {macroData.map((m) => (
                    <div key={m.name} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-outline/5">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: m.color}}></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-onSurface">{m.name}</span>
                                <span className="text-xs text-onSurface-variant font-medium">{m.percent}% of intake</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-onSurface block">{m.raw}g</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
