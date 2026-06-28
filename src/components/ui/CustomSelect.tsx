import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder, disabled, className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options?.find(opt => String(opt.value) === String(value));

  return (
    <div className={`relative ${className || ''}`} style={{ zIndex: isOpen ? 9999 : 1 }} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-background/40 border rounded-xl px-4 py-3 text-sm transition-all focus:outline-none text-left shadow-sm backdrop-blur-2xl ${
          disabled 
            ? 'opacity-50 cursor-not-allowed border-border/50' 
            : `cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] ${isOpen ? 'ring-2 ring-primary/40 border-primary/50 bg-primary/5' : ''}`
        } ${!selectedOption ? 'text-muted-foreground' : 'text-foreground font-medium'}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div
          className="absolute z-50 w-full mt-2 bg-background border border-border/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden ring-1 ring-black/5 animate-[fade-in_0.2s_ease-out]"
        >
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5">
            {!options || options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">No options available</div>
            ) : (
              options.map((option, idx) => (
                <button
                  key={option.value}
                  type="button"
                  style={{ animationDelay: `${idx * 0.02}s` }}
                  onClick={() => {
                    onChange(String(option.value));
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center justify-between transition-all duration-200 animate-[slide-in-left_0.3s_ease-out_both] ${
                    String(value) === String(option.value)
                      ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-bold shadow-inner'
                      : 'text-foreground/90 hover:bg-muted/80 hover:pl-4'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {String(value) === String(option.value) && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
