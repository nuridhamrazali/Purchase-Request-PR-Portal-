import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  textarea?: boolean;
}

export const FormInput: React.FC<InputProps> = ({ label, className, textarea, ...props }) => (
  <div className={`flex flex-col group ${className}`}>
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-blue-600">{label}</label>
    {textarea ? (
      <textarea
        className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder-gray-400 min-h-[80px]"
        {...(props as any)}
      />
    ) : (
      <input
        className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
        {...(props as any)}
      />
    )}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export const FormSelect: React.FC<SelectProps> = ({ label, className, options, ...props }) => (
  <div className={`flex flex-col group ${className}`}>
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-blue-600">{label}</label>
    <select
      className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer"
      {...props}
    >
      <option value="" disabled>Select an option</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export const CheckboxGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
    <span className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">{label}</span>
    <div className="pl-1">
      {children}
    </div>
  </div>
);

export const SectionTitle: React.FC<{ title: string; color?: string; borderColor?: string }> = ({ 
  title, 
  color = "text-gray-800", 
  borderColor = "border-blue-500" 
}) => (
  <div className="flex items-center gap-3 mb-6 mt-2">
    <h3 className={`text-lg font-bold ${color}`}>{title}</h3>
    <div className={`flex-1 h-px bg-gradient-to-r from-${borderColor.replace('border-', '')} to-transparent opacity-50`}></div>
  </div>
);