import { cn } from '../../utils/cn';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'blue' | 'purple';
    className?: string;
}

const VARIANTS = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-sky-100 text-sky-700',
    neutral: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
            VARIANTS[variant],
            className
        )}>
            {children}
        </span>
    );
}
