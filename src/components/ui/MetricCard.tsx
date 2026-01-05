import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

interface MetricCardProps {
    title: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    color?: string;
}

export function MetricCard({ title, value, change, trend, icon: Icon, color = "text-accent" }: MetricCardProps) {
    const isPositive = trend === 'up';
    const isNegative = trend === 'down';

    return (
        <Card className="hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-secondary">{title}</p>
                    <h3 className="text-2xl font-bold mt-2 text-primary tracking-tight">{value}</h3>
                </div>
                <div className={cn("p-3 rounded-2xl bg-gray-50", color)}>
                    <Icon size={24} />
                </div>
            </div>

            {(change || trend) && (
                <div className="mt-4 flex items-center">
                    {isPositive && <ArrowUpRight className="mr-1 h-4 w-4 text-success" />}
                    {isNegative && <ArrowDownRight className="mr-1 h-4 w-4 text-danger" />}

                    <span className={cn(
                        "text-sm font-semibold",
                        isPositive && "text-success",
                        isNegative && "text-danger",
                        !trend && "text-secondary"
                    )}>
                        {change}
                    </span>
                    <span className="text-xs text-secondary ml-2">vs last month</span>
                </div>
            )}
        </Card>
    );
}
