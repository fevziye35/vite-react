import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    disabled,
    ...props
}, ref) => {

    const variants = {
        primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm active:bg-accent-700',
        secondary: 'bg-surface text-primary border border-gray-200 hover:bg-gray-50 active:bg-gray-100 shadow-sm',
        outline: 'bg-transparent border border-gray-300 text-primary hover:bg-gray-50 active:bg-gray-100',
        ghost: 'bg-transparent text-primary hover:bg-gray-100/50 active:bg-gray-100',
        danger: 'bg-danger text-white hover:bg-danger-hover shadow-sm active:opacity-90',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-4 text-sm rounded-xl',
        lg: 'h-12 px-6 text-base rounded-2xl',
        icon: 'h-10 w-10 p-2 rounded-full flex items-center justify-center',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center font-medium transition-all duration-200 outline-none',
                'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
                'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };
