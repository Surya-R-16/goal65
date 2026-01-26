
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { Save } from 'lucide-react';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  const calculateTarget = (data: UserSettings) => {
    let bmr = 0;
    const w = data.weight;
    const h = data.height;
    const a = data.age;

    if (data.gender === 'male') {
        bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
        bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }

    const multipliers: Record<string, number> = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725
    };
    
    const activity = multipliers[data.activityLevel] || 1.2;
    let tdee = bmr * activity;

    if (data.goal === 'lose') tdee -= 500;
    if (data.goal === 'gain') tdee += 500;

    return Math.round(tdee);
  };

  const handleSave = () => {
    const newTarget = calculateTarget(formData);
    const updated = { ...formData, dailyCalorieTarget: newTarget };
    setFormData(updated);
    onUpdate(updated);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const update = (key: keyof UserSettings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="pb-28 pt-6 px-4 max-w-md mx-auto">
       <h1 className="text-3xl font-normal mb-8 text-onSurface">Settings</h1>
       
       <div className="space-y-6">
         {/* Profile Section */}
         <div className="bg-surface-bright p-6 rounded-[28px] border border-outline/10 space-y-4">
            <h2 className="text-lg font-medium text-onSurface mb-2">My Profile</h2>
            
            <div>
               <label className="block text-xs font-medium text-onSurface-variant mb-1">Display Name</label>
               <input 
                  value={formData.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full bg-surface-container rounded-xl p-3 focus:outline-primary"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-onSurface-variant mb-1">Height (cm)</label>
                   <input type="number" value={formData.height} onChange={e => update('height', Number(e.target.value))} className="w-full bg-surface-container rounded-xl p-3 focus:outline-primary" />
                </div>
                <div>
                   <label className="block text-xs font-medium text-onSurface-variant mb-1">Weight (kg)</label>
                   <input type="number" value={formData.weight} onChange={e => update('weight', Number(e.target.value))} className="w-full bg-surface-container rounded-xl p-3 focus:outline-primary" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-onSurface-variant mb-1">Age</label>
                   <input type="number" value={formData.age} onChange={e => update('age', Number(e.target.value))} className="w-full bg-surface-container rounded-xl p-3 focus:outline-primary" />
                </div>
                <div>
                   <label className="block text-xs font-medium text-onSurface-variant mb-1">Gender</label>
                   <select 
                      value={formData.gender} 
                      onChange={e => update('gender', e.target.value)}
                      className="w-full bg-surface-container rounded-xl p-3 focus:outline-primary appearance-none"
                   >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                   </select>
                </div>
            </div>
         </div>

         {/* Goals Section */}
         <div className="bg-surface-bright p-6 rounded-[28px] border border-outline/10 space-y-4">
             <h2 className="text-lg font-medium text-onSurface mb-2">Goals</h2>
             
             <div>
               <label className="block text-xs font-medium text-onSurface-variant mb-1">Goal</label>
               <select 
                  value={formData.goal}
                  onChange={e => update('goal', e.target.value)}
                  className="w-full bg-surface-container rounded-xl p-3 focus:outline-primary appearance-none"
               >
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain</option>
                  <option value="gain">Gain Muscle</option>
               </select>
             </div>

             <div>
               <label className="block text-xs font-medium text-onSurface-variant mb-1">Activity Level</label>
               <select 
                  value={formData.activityLevel}
                  onChange={e => update('activityLevel', e.target.value)}
                  className="w-full bg-surface-container rounded-xl p-3 focus:outline-primary appearance-none"
               >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
               </select>
             </div>

             <div className="pt-2 border-t border-outline/10 mt-2">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-onSurface">Daily Calorie Target</span>
                    <span className="text-xl font-bold text-primary">{formData.dailyCalorieTarget}</span>
                 </div>
                 <p className="text-xs text-onSurface-variant mt-1">Calculated based on your stats.</p>
             </div>
         </div>

         <button 
           onClick={handleSave}
           className="w-full bg-primary text-white py-4 rounded-full font-medium shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
         >
           <Save size={20} />
           {showSuccess ? 'Saved!' : 'Save Settings'}
         </button>
       </div>
    </div>
  );
};

export default SettingsPage;
