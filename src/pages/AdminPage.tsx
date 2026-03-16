import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Shield, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

const MODULES = [
    { id: 'deals', label: 'İŞLER' },
    { id: 'customers', label: 'Müşteriler' },
    { id: 'offers', label: 'Proformalar' },
    { id: 'messages', label: 'Mesajlar' },
];

export default function AdminPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'Viewer',
        permissions: {
            deals: true,
            customers: true,
            offers: true,
            messages: true
        } as Record<string, boolean>
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Kullanıcılar yüklenemedi');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Yönetim Paneli</h1>
            {/* Buraya geri kalan tablo ve modal kodlarını ekleyebilirsin */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="text-left p-4">Kullanıcı</th>
                            <th className="text-left p-4">Rol</th>
                            <th className="text-left p-4">İzinler</th>
                            <th className="text-right p-4">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-b border-slate-50">
                                <td className="p-4">{u.fullName}</td>
                                <td className="p-4">{u.role}</td>
                                <td className="p-4 flex gap-1">
                                    {MODULES.map(m => (
                                        <span key={m.id} className={`text-[10px] px-2 py-1 rounded ${u.permissions?.[m.id] ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {m.label}
                                        </span>
                                    ))}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => { setEditingUser(u); setIsEditModalOpen(true); }} className="p-2 hover:bg-slate-100 rounded-lg">
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}