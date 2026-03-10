import React from 'react';
import { ChatWindow } from '../components/chat/ChatWindow';

const MessagesPage = () => {
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Mesajlar ve Ekip Sohbeti</h1>

            <div className="grid grid-cols-16">
                {/* Sol tarafta bilgi veya kişiler olabilir */}
                <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="font-semibold border-b pb-2 mb-4">Sohbet Odaları</h2>
                    <p className="text-sm text-blue-600 font-medium"># Genel Sohbet (Aktif)</p>
                </div>

                {/* Sağ tarafta senin yaptığın o canlı ChatWindow */}
                <div className="md:col-span-2">
                    <ChatWindow />
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;