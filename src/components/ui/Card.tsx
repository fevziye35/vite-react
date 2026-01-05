import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, children, noPadding = false, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "bg-surface rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300",
                !noPadding && "p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';

export { Card };
