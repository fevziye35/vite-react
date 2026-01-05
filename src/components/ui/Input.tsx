import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, icon, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-white border border-gray-200 text-primary rounded-xl px-4 py-2.5 text-sm transition-all duration-200",
                        "placeholder:text-gray-400",
                        "focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10",
                        "disabled:bg-gray-50 disabled:text-gray-500",
                        icon && "pl-10",
                        error && "border-danger focus:border-danger focus:ring-danger/10",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-danger font-medium ml-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export { Input };
