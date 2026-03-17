import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { proformaService } from '../services/api';

export default function ProformalarPage() {
    const [activeTab, setActiveTab] = useState('proforma');
    const [documents, setDocuments] = useState<any[]>([]);

    useEffect(() => {
        loadDocuments();
    }, [activeTab]);

    const loadDocuments = async () => {
        try {
            const data = await proformaService.getAll(activeTab as any);
            setDocuments(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Proformalar & Belgeler</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                    <Plus size={20} /> Yeni Oluştur
                </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-4 p-4 border-b border-gray-100">
                    {['proforma', 'invoice', 'fco'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="p-4">
                    {documents.map(doc => (
                        <div key={doc.id} className="flex justify-between p-4 border-b border-gray-50 last:border-0">
                            <span>{doc.document_number || 'Numarasız'}</span>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600"><Edit size={16} /></button>
                                <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}