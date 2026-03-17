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
                "bg-white rounded border border-[#eef2f4] shadow-card transition-all duration-300",
                !noPadding && "p-4",
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
