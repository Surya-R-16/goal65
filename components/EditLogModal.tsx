
import React, { useState } from 'react';
import { FoodLog, FoodItem } from '../types';
import { X, Save } from 'lucide-react';

interface EditLogModalProps {
  log: FoodLog;
  onSave: (updatedLog: FoodLog) => void;
  onClose: () => void;
}

const EditLogModal: React.FC<EditLogModalProps> = ({ log, onSave, onClose }) => {
  const [items, setItems] = useState<FoodItem[]>(log.items.map(i => ({...i})));
  
  const updateItem = (index: number, field: keyof FoodItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'quantity') {
      const oldQty = item.quantity;
      const newQty = Number(value);
      const ratio = newQty / oldQty;
      
      // Scale macros
      item.calories *= ratio;
      item.protein_g *= ratio;
      item.carbs_g *= ratio;
      item.fat_g *= ratio;
      item.quantity = newQty;
    } else if (field === 'name') {
        item.name = value as string;
    }

    setItems(newItems);
  };

  const handleSave = () => {
    const totalCals = items.reduce((sum, i) => sum + i.calories, 0);
    onSave({
      ...log,
      items,
      totalCalories: totalCals
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-[28px] w-full max-w-sm shadow-xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-outline/10 flex justify-between items-center">
          <h3 className="text-lg font-medium text-onSurface">Edit Meal</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full text-onSurface-variant">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
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
                <div className="text-xs text-right text-primary font-medium">
                    {Math.round(item.calories)} kcal
                </div>
             </div>
           ))}
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
