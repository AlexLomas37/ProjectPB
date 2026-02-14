'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { 
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
  }
>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const variants = {
    primary: 'bg-[var(--primary-color)] text-white hover:brightness-110 shadow-md border border-[var(--primary-color)]',
    secondary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-900/20 border border-emerald-500',
    outline: 'border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white',
    danger: 'bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-900/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; icon?: React.ReactNode }
>(({ className, label, error, icon, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 text-sm text-slate-100 transition-all duration-200 placeholder:text-slate-700 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]/50 disabled:opacity-50',
            icon ? 'pl-10 pr-3' : 'px-4',
            error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-500 ml-1">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm backdrop-blur-sm', className)}>
    {children}
  </div>
);

export const Selector = ({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder = "Sélectionner...",
  variant = 'default' 
}: { 
  label: string; 
  value: string; 
  options: { name: string; iconUrl?: string; imageUrl?: string }[]; 
  onChange: (val: string) => void;
  placeholder?: string;
  variant?: 'default' | 'list' | 'grid';
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.name === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl transition-all hover:border-[var(--primary-color)]/50",
          isOpen && "border-[var(--primary-color)] shadow-[0_0_15px_var(--primary-color)]/10"
        )}
      >
        <div className="flex items-center gap-3">
          {variant === 'default' && (
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 overflow-hidden">
              {selectedOption?.iconUrl ? (
                <img src={selectedOption.iconUrl} className="w-6 h-6 object-contain" />
              ) : (
                <Trophy size={14} className="text-slate-700" />
              )}
            </div>
          )}
          {variant === 'grid' && selectedOption?.imageUrl && (
            <div className="w-12 h-8 rounded bg-slate-900 border border-slate-800 overflow-hidden">
              <img src={selectedOption.imageUrl} className="w-full h-full object-cover" />
            </div>
          )}
          <span className={cn(
            "font-bold text-sm uppercase italic",
            value ? "text-white" : "text-slate-600"
          )}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown size={16} className={cn("text-slate-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[70] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar",
              variant === 'grid' && "grid grid-cols-1"
            )}
          >
            {options.map((option) => (
              <button
                key={option.name}
                onClick={() => {
                  onChange(option.name);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 transition-all border-b border-slate-800/50 last:border-0",
                  variant === 'default' ? "p-3 hover:bg-slate-800" : "relative h-16 p-0 group overflow-hidden"
                )}
              >
                {variant === 'default' ? (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
                      {option.iconUrl ? (
                        <img src={option.iconUrl} className="w-8 h-8 object-contain" />
                      ) : (
                        <Trophy size={16} className="text-slate-700" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-black uppercase italic",
                      value === option.name ? "text-[var(--primary-color)]" : "text-slate-300"
                    )}>
                      {option.name}
                    </span>
                  </>
                ) : (
                  <>
                    {option.imageUrl ? (
                      <img src={option.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                    ) : (
                      <div className="absolute inset-0 bg-slate-950 opacity-40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    <span className={cn(
                      "relative z-10 ml-4 text-xs font-black uppercase italic tracking-widest",
                      value === option.name ? "text-[var(--primary-color)]" : "text-white"
                    )}>
                      {option.name}
                    </span>
                    {value === option.name && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-color)] shadow-[0_0_15px_var(--primary-color)]" />
                    )}
                  </>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
>(({ className, label, children, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
});
Select.displayName = 'Select';