import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';


export interface ColumnDef {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'currency';
    key: string; // Key path in data object. For custom fields use 'customFields.fieldName'
    width?: number;
    options?: string[]; // For select type
}

interface DynamicTableProps<T> {
    data: T[];
    columns: ColumnDef[];
    onDataChange: (id: string, key: string, value: any) => void;
    onColumnAdd: (newCol: ColumnDef) => void;
    onColumnDelete?: (colId: string) => void;
    onColumnEdit?: (col: ColumnDef) => void;
    onRowDelete?: (itemId: string) => void;
}

export function DynamicTable<T extends { id: string }>({
    data,
    columns,
    onDataChange,
    onColumnAdd,
    onRowDelete
}: DynamicTableProps<T>) {
    const [editingCell, setEditingCell] = useState<{ id: string, key: string } | null>(null);
    const [isAddColModalOpen, setIsAddColModalOpen] = useState(false);
    const [newColName, setNewColName] = useState('');

    const handleCellClick = (id: string, key: string) => {
        setEditingCell({ id, key });
    };

    const handleBlur = () => {
        setEditingCell(null);
    };

    const handleAddColumn = () => {
        if (!newColName) return;
        const key = `customFields.${newColName.toLowerCase().replace(/\s+/g, '_')}`;
        onColumnAdd({
            id: crypto.randomUUID(),
            label: newColName,
            key: key,
            type: 'text',
            width: 150
        });
        setNewColName('');
        setIsAddColModalOpen(false);
    };

    // Helper to get value from path (e.g. 'customFields.note')
    const getValue = (item: any, path: string) => {
        const keys = path.split('.');
        let val = item;
        for (const k of keys) {
            val = val?.[k];
        }
        return val;
    };

    return (
        <div className="border border-gray-200 rounded-2xl overflow-x-auto bg-white shadow-sm">
            <div className="min-w-max">
                {/* Header */}
                <div className="flex bg-gray-50 border-b border-gray-100">
                    <div className="w-12 p-3 font-bold text-secondary text-center flex-shrink-0 text-xs uppercase tracking-wider">No</div>
                    {columns.map(col => (
                        <div
                            key={col.id}
                            className="p-3 font-bold text-secondary text-xs uppercase tracking-wider border-r border-gray-100 flex items-center justify-between group"
                            style={{ width: col.width || 150, minWidth: 100 }}
                        >
                            <span className="truncate">{col.label}</span>
                        </div>
                    ))}
                    <div className="w-32 p-2 flex items-center justify-center border-l border-gray-100 bg-gray-50/50">
                        <Button size="sm" variant="ghost" className="text-accent hover:bg-accent/10" onClick={() => setIsAddColModalOpen(true)}>
                            <Plus size={16} className="mr-1" /> Add Col
                        </Button>
                    </div>
                </div>

                {/* Rows */}
                {data.map((item, idx) => (
                    <div key={item.id} className="flex border-b border-gray-100 hover:bg-gray-50/50 transition last:border-0 group">
                        <div className="w-12 p-3 text-secondary text-center flex-shrink-0 bg-gray-50/30 flex items-center justify-center font-medium text-sm">
                            {idx + 1}
                        </div>
                        {columns.map(col => {
                            const isEditing = editingCell?.id === item.id && editingCell?.key === col.key;
                            const value = getValue(item, col.key);

                            return (
                                <div
                                    key={col.id}
                                    className="border-r border-gray-100 relative"
                                    style={{ width: col.width || 150, minWidth: 100 }}
                                    onClick={() => handleCellClick(item.id, col.key)}
                                >
                                    {isEditing ? (
                                        col.type === 'select' && col.options ? (
                                            <select
                                                autoFocus
                                                className="w-full h-full p-2 outline-none bg-white text-primary focus:ring-2 focus:ring-accent inset-0 absolute text-sm"
                                                value={value || ''}
                                                onChange={(e) => onDataChange(item.id, col.key, e.target.value)}
                                                onBlur={handleBlur}
                                            >
                                                {col.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                autoFocus
                                                type={col.type === 'number' || col.type === 'currency' ? 'number' : 'text'}
                                                className="w-full h-full p-2 outline-none bg-white text-primary focus:ring-2 focus:ring-accent inset-0 absolute text-sm"
                                                value={value || ''}
                                                onChange={(e) => onDataChange(item.id, col.key, e.target.value)}
                                                onBlur={handleBlur}
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full p-3 truncate text-sm text-primary cursor-text min-h-[44px]">
                                            {col.type === 'currency' && value ? `$${Number(value).toLocaleString()}` : value}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div className="w-32 flex items-center justify-center opacity-0 group-hover:opacity-100 transition border-l border-gray-100 bg-gray-50/30">
                            {onRowDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRowDelete(item.id); }}
                                    className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition"
                                    title="Delete Row"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Column Modal - Mini inline for speed */}
            {isAddColModalOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setIsAddColModalOpen(false)}>
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-80 border border-gray-100" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-primary mb-4 text-lg">Add New Column</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-secondary uppercase tracking-wider">Column Name</label>
                                <input
                                    autoFocus
                                    className="w-full border border-gray-200 bg-white text-primary rounded-xl p-2.5 mt-2 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-sm text-sm"
                                    value={newColName}
                                    onChange={e => setNewColName(e.target.value)}
                                    placeholder="e.g. Driver Name"
                                    onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button size="sm" variant="ghost" onClick={() => setIsAddColModalOpen(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleAddColumn}>Add Column</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
