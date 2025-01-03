import React from 'react';
import { Check } from 'lucide-react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  required?: boolean;
 }

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ 
  checked, 
  onChange, 
  label,
  required = false 
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
        />
        <div className={`
          w-4 h-4 border rounded
          transition-colors duration-200
          ${checked ? 
            'bg-indigo-600 border-indigo-600' : 
            'bg-slate-800/50 border-slate-700 hover:border-slate-600'
          }
        `}>
          {checked && (
            <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>
      {label && (
        <span className="ml-2 text-sm text-slate-400">{label}</span>
      )}
    </label>
  );
};

export default CustomCheckbox;