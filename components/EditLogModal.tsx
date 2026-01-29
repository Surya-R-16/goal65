
import React, { useState } from 'react';
import { FoodLog, FoodItem, MealType } from '../types';
import { X, Save, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface EditLogModalProps {
  log: FoodLog;
  onSave: (updatedLog: FoodLog) => void;
  onClose: () => void;
}

const EditLogModal: React.FC<EditLogModalProps> = ({ log, onSave, onClose }) => {
  const [items, setItems] = useState<FoodItem[]>(log.items.map(i => ({ ...i })));
  const [mealType, setMealType] = useState<MealType>(log.meal);
  const [timestamp, setTimestamp] = useState<string>(format(new Date(log.timestamp), "yyyy-MM-dd'T'HH:mm"));
  const [notes, setNotes] = useState<string>(log.notes || '');

  const updateItem = (index: number, field: keyof FoodItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'quantity') {
      const oldQty = item.quantity;
      const newQty = Number(value);
      const ratio = oldQty > 0 ? newQty / oldQty : 1; // Avoid division by zero

      // Scale macros if quantity changes
      item.calories *= ratio;
      item.protein_g *= ratio;
      item.carbs_g *= ratio;
      item.fat_g *= ratio;
      item.quantity = newQty;
    } else if (field === 'name') {
      item.name = value as string;
    } else if (['calories', 'protein_g', 'carbs_g', 'fat_g'].includes(field as string)) {
      // Direct macro edit
      (item as any)[field] = Number(value);
    }

    setItems(newItems);
  };

  const handleSave = () => {
    const totalCals = items.reduce((sum, i) => sum + i.calories, 0);
    onSave({
      ...log,
      items,
      meal: mealType,
      timestamp: new Date(timestamp).getTime(),
      notes,
      totalCalories: totalCals
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-[28px] w-full max-w-sm shadow-xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-outline/10 flex justify-between items-center">
          <h3 className="text-lg font-medium text-onSurface">Edit Log</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full text-onSurface-variant">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-6">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-onSurface-variant block mb-1">Time</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full bg-surface-container rounded-xl p-3 text-sm focus:outline-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-onSurface-variant block mb-1">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full bg-surface-container rounded-xl p-3 text-sm focus:outline-primary appearance-none"
              >
                {Object.values(MealType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-onSurface">Food Items</label>
            {items.map((item, idx) => (
              <div key={item.id} className="bg-surface-container rounded-xl p-3 space-y-3">
                <div>
                  <label className="text-xs text-onSurface-variant block mb-1">Item Name</label>
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    className="w-full bg-surface-bright rounded-lg p-2 text-sm border border-transparent focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-onSurface-variant block mb-1">Quantity</label>
                    <input
                      type="number"
                      step="0.1"
                      value={Math.round(item.quantity * 10) / 10}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="w-full bg-surface-bright rounded-lg p-2 text-sm border border-transparent focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-onSurface-variant block mb-1">Unit</label>
                    <input
                      value={item.unit}
                      disabled
                      className="w-full bg-surface-variant/50 text-onSurface-variant rounded-lg p-2 text-sm border-none"
                    />
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-outline/10">
                  <div>
                    <label className="text-[10px] text-onSurface-variant block">Kcal</label>
                    <input
                      type="number"
                      value={Math.round(item.calories)}
                      onChange={(e) => updateItem(idx, 'calories', e.target.value)}
                      className="w-full bg-surface-bright p-1 text-xs rounded text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-onSurface-variant block">Prot</label>
                    <input
                      type="number"
                      value={Math.round(item.protein_g)}
                      onChange={(e) => updateItem(idx, 'protein_g', e.target.value)}
                      className="w-full bg-surface-bright p-1 text-xs rounded text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-onSurface-variant block">Carb</label>
                    <input
                      type="number"
                      value={Math.round(item.carbs_g)}
                      onChange={(e) => updateItem(idx, 'carbs_g', e.target.value)}
                      className="w-full bg-surface-bright p-1 text-xs rounded text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-onSurface-variant block">Fat</label>
                    <input
                      type="number"
                      value={Math.round(item.fat_g)}
                      onChange={(e) => updateItem(idx, 'fat_g', e.target.value)}
                      className="w-full bg-surface-bright p-1 text-xs rounded text-center"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-onSurface block mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this meal..."
              className="w-full bg-surface-container rounded-xl p-3 text-sm focus:outline-primary min-h-[80px]"
            />
          </div>
        </div>

        <div className="p-4 border-t border-outline/10">
          <button
            onClick={handleSave}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLogModal;
