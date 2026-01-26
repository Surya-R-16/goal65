
import React, { useState } from 'react';
import { UserSettings, Gender, ActivityLevel, WeightGoal } from '../types';
import { ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (settings: UserSettings) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserSettings>>({
    name: '',
    age: 30,
    gender: 'male',
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    goal: 'maintain',
    dietaryPreference: 'South Indian'
  });

  const calculateCalories = () => {
    // Mifflin-St Jeor Equation
    let bmr = 0;
    const w = formData.weight || 70;
    const h = formData.height || 170;
    const a = formData.age || 30;

    if (formData.gender === 'male') {
        bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
        bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }

    // Activity Multipliers
    const multipliers: Record<string, number> = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725
    };
    
    const activity = multipliers[formData.activityLevel || 'moderate'];
    let tdee = bmr * activity;

    // Goal Adjustment
    if (formData.goal === 'lose') tdee -= 500;
    if (formData.goal === 'gain') tdee += 500;

    return Math.round(tdee);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      const finalSettings: UserSettings = {
        ...formData as UserSettings,
        isOnboardingComplete: true,
        dailyCalorieTarget: calculateCalories()
      };
      onComplete(finalSettings);
    }
  };

  const update = (key: keyof UserSettings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-onSurface">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🥗</div>
          <h1 className="text-3xl font-normal mb-2">Welcome</h1>
          <p className="text-onSurface-variant">Let's personalize your plan.</p>
        </div>

        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium mb-1">What's your name?</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => update('name', e.target.value)}
                className="w-full bg-surface-container rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none"
                placeholder="Name"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <div className="flex gap-2">
                {['male', 'female', 'other'].map(g => (
                  <button
                    key={g}
                    onClick={() => update('gender', g)}
                    className={`flex-1 p-3 rounded-xl capitalize ${formData.gender === g ? 'bg-primary text-white' : 'bg-surface-container'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
               <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input type="number" value={formData.age} onChange={e => update('age', Number(e.target.value))} className="w-full bg-surface-container rounded-xl p-4 outline-none" />
               </div>
            </div>
          </div>
        )}

        {/* Step 2: Body Stats */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
             <div>
                <label className="block text-sm font-medium mb-1">Height (cm)</label>
                <input type="number" value={formData.height} onChange={e => update('height', Number(e.target.value))} className="w-full bg-surface-container rounded-xl p-4 outline-none" />
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input type="number" value={formData.weight} onChange={e => update('weight', Number(e.target.value))} className="w-full bg-surface-container rounded-xl p-4 outline-none" />
             </div>
          </div>
        )}

        {/* Step 3: Lifestyle */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium mb-2">Activity Level</label>
              <div className="space-y-2">
                {[
                  { id: 'sedentary', label: 'Sedentary (Office job)' },
                  { id: 'light', label: 'Lightly Active (1-2 days/wk)' },
                  { id: 'moderate', label: 'Moderate (3-5 days/wk)' },
                  { id: 'active', label: 'Very Active (6+ days/wk)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => update('activityLevel', opt.id)}
                    className={`w-full p-4 rounded-xl text-left ${formData.activityLevel === opt.id ? 'bg-primary-container border-2 border-primary' : 'bg-surface-container border-2 border-transparent'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Goal */}
        {step === 4 && (
           <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium mb-3">What is your goal?</label>
                <div className="space-y-3">
                  {[
                    { id: 'lose', label: 'Lose Weight', icon: '📉' },
                    { id: 'maintain', label: 'Maintain Weight', icon: '⚖️' },
                    { id: 'gain', label: 'Gain Muscle', icon: '💪' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => update('goal', opt.id)}
                      className={`w-full p-4 rounded-xl flex items-center gap-3 ${formData.goal === opt.id ? 'bg-tertiary-container text-tertiary-onContainer' : 'bg-surface-container'}`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-surface-variant p-4 rounded-2xl">
                 <p className="text-sm text-center mb-1">Recommended Daily Target</p>
                 <p className="text-4xl font-medium text-center text-primary">{calculateCalories()} <span className="text-base text-onSurface-variant">kcal</span></p>
              </div>
           </div>
        )}

        <button 
          onClick={handleNext}
          className="mt-8 w-full bg-primary text-white p-4 rounded-full font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95"
        >
          {step === 4 ? 'Get Started' : 'Next'}
          {step === 4 ? <Check size={20}/> : <ChevronRight size={20}/>}
        </button>
        
        {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="w-full text-center mt-4 text-onSurface-variant text-sm">Back</button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
