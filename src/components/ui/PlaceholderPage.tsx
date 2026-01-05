import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
    title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="bg-slate-100 p-6 rounded-full">
                <Construction size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900">{title} Module</h2>
            <p className="text-slate-500 max-w-md">
                This feature is part of the planned roadmap. Implementation coming soon in the next phase.
            </p>
        </div>
    );
}
