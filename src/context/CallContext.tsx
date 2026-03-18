import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export type CallType = 'audio' | 'video';

interface CallContextType {
    startCall: (targetUserId: string, targetUserName: string, callType: CallType) => void;
    startGroupCall: (callType: CallType) => void;
    endCall: () => void;
    answerCall: () => void;
    rejectCall: () => void;
    isInCall: boolean;
    isRinging: boolean;
    isCalling: boolean;
    remoteUser: { id: string; name: string } | null;
    callType: CallType;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
    const ctx = useContext(CallContext);
    if (!ctx) throw new Error('useCall must be used within CallProvider');
    return ctx;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket, onlineUsers } = useSocket();
    const { user } = useAuth();
    
    const [isInCall, setIsInCall] = useState(false);
    const [isRinging, setIsRinging] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [isCheckingMic, setIsCheckingMic] = useState(false);
    const [remoteUser, setRemoteUser] = useState<{ id: string; name: string } | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    // Group Call States
    const [jitsiRoom, setJitsiRoom] = useState<string | null>(null);
    const [incomingGroupRoom, setIncomingGroupRoom] = useState<string | null>(null);
    const [pendingGroupRoom, setPendingGroupRoom] = useState<string | null>(null);
    
    const [callType, setCallType] = useState<CallType>('audio');

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteMediaRef = useRef<HTMLVideoElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
    
    // Sesli arama süresi loglama için
    const [isCaller, setIsCaller] = useState(false);
    const callStartedAt = useRef<number | null>(null);
    
    // Ses Üretici (Zil Sesi)
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscRef = useRef<OscillatorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);

    const startRingtone = (isIncoming: boolean) => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = isIncoming ? 'sine' : 'sine';
            osc.frequency.value = isIncoming ? 550 : 440; // Gelen çağrı daha ince sesli
            
            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;
            for (let i = 0; i < 30; i++) { // Maksimum 30 çaldırma (yaklaşık 90-120 saniye)
                const start = now + i * (isIncoming ? 2 : 3);
                const dur = isIncoming ? 0.8 : 1.2;
                
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.1, start + 0.05); // volume
                gain.gain.setValueAtTime(0.1, start + dur);
                gain.gain.linearRampToValueAtTime(0, start + dur + 0.05);
            }

            osc.start();
            oscRef.current = osc;
            gainRef.current = gain;
        } catch (e) {
            console.error("Zil sesi çalınamadı", e);
        }
    };

    const stopRingtone = () => {
        if (oscRef.current) {
            try {
                oscRef.current.stop();
                oscRef.current.disconnect();
            } catch(e) {}
            oscRef.current = null;
        }
        if (gainRef.current) {
            gainRef.current.disconnect();
            gainRef.current = null;
        }
    };

    useEffect(() => {
        // Aranıyorsa (Arayan kişi) veya Çalıyorsa (Aranan kişi) sesi başlat
        if ((isCalling && !isInCall) || isRinging) {
            startRingtone(isRinging);
        } else {
            stopRingtone();
        }
        
        if (isInCall && !callStartedAt.current) {
            callStartedAt.current = Date.now();
        }

        return () => stopRingtone();
    }, [isCalling, isInCall, isRinging]);

    const cleanupCall = () => {
        stopRingtone();

        // Sesli Arama Loglama
        if (isCaller && remoteUser && remoteUser.id !== 'team') {
            const senderName = user?.fullName || user?.email?.split('@')[0];
            
            if (callStartedAt.current) {
                const durationSecs = Math.floor((Date.now() - callStartedAt.current) / 1000);
                const durationStr = durationSecs < 60 ? `${durationSecs} sn` : `${Math.floor(durationSecs / 60)} dk ${durationSecs % 60} sn`;
                const content = `@@PM:${remoteUser.name}@@${callType === 'video' ? '📹 Görüntülü Görüşme' : '📞 Sesli Görüşme'} (${durationStr})`;

                supabase.from('messages').insert([{ content, sender_name: senderName }])
                    .then(({ error }) => { if (error) console.error('Arama kaydı hatası', error); });
            } else if (isCalling) {
                const content = `@@PM:${remoteUser.name}@@${callType === 'video' ? '📹 Cevapsız Görüntülü Arama' : '📞 Cevapsız Arama'}`;

                supabase.from('messages').insert([{ content, sender_name: senderName }])
                    .then(({ error }) => { if (error) console.error('Cevapsız arama kaydı hatası', error); });
            }
        }

        callStartedAt.current = null;
        setIsCaller(false);

        setIsInCall(false);
        setIsRinging(false);
        setIsCalling(false);
        setRemoteUser(null);
        setIsMuted(false);
        pendingCandidates.current = [];

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        if (remoteMediaRef.current) {
            remoteMediaRef.current.srcObject = null;
        }
    };

    const setupPeerConnection = () => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && remoteUser) {
                socket?.emit('ice-candidate', {
                    targetUserId: remoteUser.id,
                    candidate: event.candidate
                });
            }
        };

        pc.ontrack = (event) => {
            if (remoteMediaRef.current && event.streams[0]) {
                remoteMediaRef.current.srcObject = event.streams[0];
                remoteMediaRef.current.play().catch((err: any) => console.error('Media play error:', err));
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        peerConnection.current = pc;
        return pc;
    };

    const getLocalMedia = async (type: CallType) => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('Tarayıcınız mikrofon/kamera erişimini engelliyor. Canlı sunucuda (Live) sesli ve görüntülü arama yapabilmek için bağlantınızın güvenli (HTTPS) olması veya ayarlardan izin vermeniz zorunludur.');
                return null;
            }

            const constraints = type === 'video' 
                ? { audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } } 
                : { audio: true, video: false };
                
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStreamRef.current = stream;
            
            if (type === 'video' && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            
            return stream;
        } catch (err: any) {
            console.error('Microphone/Camera error:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                alert('Kamera veya Mikrofona erişilemedi. Lütfen tarayıcınızın adres çubuğundaki kilit simgesine tıklayarak izin verin.');
            } else {
                alert('Kamera veya Mikrofona erişilemedi. Cihazınızın bağlı olduğundan emin olun.');
            }
            return null;
        }
    };

    const endGroupCall = () => {
        setJitsiRoom(null);
        if (isCaller && callStartedAt.current) {
            const durationSecs = Math.floor((Date.now() - callStartedAt.current) / 1000);
            const durationStr = durationSecs < 60 ? `${durationSecs} sn` : `${Math.floor(durationSecs / 60)} dk ${durationSecs % 60} sn`;
            const content = durationSecs < 15 
                ? (callType === 'video' ? '📹 Cevapsız Ekip Görüntülü Araması' : '📞 Cevapsız Ekip Araması') 
                : (callType === 'video' ? `📹 Toplu Ekip Görüntülü Araması (${durationStr})` : `📞 Toplu Ekip Araması (${durationStr})`);
            const senderName = user?.fullName || user?.email?.split('@')[0];

            supabase.from('messages').insert([{ content, sender_name: senderName }])
                .then(({ error }) => { if (error) console.error('Grup kayıt hatası', error); });
        }
        setIsCaller(false);
        callStartedAt.current = null;
        setRemoteUser(null);
    };

    const startGroupCall = (type: CallType = 'audio') => {
        setCallType(type);
        const roomId = 'alikmk-team-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        setPendingGroupRoom(roomId);
        setRemoteUser({ id: 'team', name: 'Toplu Ekip Araması' });
        setIsCalling(true);
        setIsCaller(true);
        callStartedAt.current = Date.now();
        
        socket?.emit('group-call-offer', {
            roomId,
            callerName: user?.fullName || user?.email?.split('@')[0],
            callType: type
        });
    };

    const startCall = async (targetUserId: string, targetUserName: string, type: CallType = 'audio') => {
        setCallType(type);
        setRemoteUser({ id: targetUserId, name: targetUserName });
        setIsCheckingMic(true);
        setIsCalling(true);
        setIsCaller(true);
        
        const stream = await getLocalMedia(type);
        setIsCheckingMic(false);
        if (!stream) {
            setIsCalling(false);
            setRemoteUser(null);
            return;
        }

        const pc = setupPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket?.emit('call-offer', {
            targetUserId: targetUserId,
            offer: offer,
            callerName: user?.fullName || user?.email || 'Bilinmeyen Kullanıcı',
            callType: type
        });
    };

    const answerCall = async () => {
        if (incomingGroupRoom) {
            socket?.emit('group-call-answered', { roomId: incomingGroupRoom });
            setIsRinging(false);
            setJitsiRoom(incomingGroupRoom);
            setIncomingGroupRoom(null);
            setRemoteUser(null);
            stopRingtone();
            return;
        }

        if (!remoteUser) return;
        
        setIsCheckingMic(true);
        const stream = await getLocalMedia(callType);
        setIsCheckingMic(false);
        if (!stream) {
            rejectCall();
            return;
        }

        setIsRinging(false);
        setIsInCall(true);

        const pc = setupPeerConnection();
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket?.emit('call-answer', {
            targetUserId: remoteUser.id,
            answer
        });
    };

    const rejectCall = () => {
        if (incomingGroupRoom) {
            setIncomingGroupRoom(null);
            setIsRinging(false);
            setRemoteUser(null);
            stopRingtone();
            return;
        }

        if (remoteUser && remoteUser.id !== 'team') {
            socket?.emit('end-call', { targetUserId: remoteUser.id });
        }
        cleanupCall();
    };

    const endCall = () => {
        if (incomingGroupRoom) {
            setIncomingGroupRoom(null);
            setIsRinging(false);
            setRemoteUser(null);
            stopRingtone();
            return;
        }
        
        if (pendingGroupRoom) {
            const senderName = user?.fullName || user?.email?.split('@')[0];
            const content = callType === 'video' ? '📹 Cevapsız Ekip Görüntülü Araması' : '📞 Cevapsız Ekip Araması';
            supabase.from('messages').insert([{ content, sender_name: senderName }])
                .then(({ error }) => { if (error) console.error(error); });
                
            setPendingGroupRoom(null);
            setIsCalling(false);
            setIsCaller(false);
            setRemoteUser(null);
            stopRingtone();
            callStartedAt.current = null;
            return;
        }
        
        if (remoteUser && remoteUser.id !== 'team') {
            socket?.emit('end-call', { targetUserId: remoteUser.id });
        }
        cleanupCall();
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleOffer = async ({ offer, callerId, callerName, callType: incomingType }: any) => {
            // If already in a call, ignore or send busy
            if (isInCall || isCalling || isRinging) {
                socket.emit('end-call', { targetUserId: callerId });
                return;
            }

            setCallType(incomingType || 'audio');
            setRemoteUser({ id: callerId, name: callerName });
            setIsRinging(true);
            
            const pc = setupPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            // Process any candidates that arrived early
            while (pendingCandidates.current.length > 0) {
                const c = pendingCandidates.current.shift();
                if (c) {
                    await pc.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.error('Delayed ICE Error:', e));
                }
            }
        };

        const handleAnswer = async ({ answer }: any) => {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
                setIsCalling(false);
                setIsInCall(true);

                // Process pending candidates
                while (pendingCandidates.current.length > 0) {
                    const c = pendingCandidates.current.shift();
                    if (c) {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.error('Delayed ICE Answer Error:', e));
                    }
                }
            }
        };

        const handleCandidate = async ({ candidate }: any) => {
            if (peerConnection.current && peerConnection.current.remoteDescription) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error('Error adding ICE candidate', e);
                }
            } else {
                pendingCandidates.current.push(candidate);
            }
        };

        const handleGroupOffer = ({ roomId, callerName, callType: incomingType }: any) => {
            if (isInCall || isCalling || isRinging || jitsiRoom) return;
            setCallType(incomingType || 'audio');
            setRemoteUser({ id: 'team', name: callerName + ' (Ekip Görüşmesi)' });
            setIncomingGroupRoom(roomId);
            setIsRinging(true);
        };

        const handleGroupAnswered = ({ roomId }: { roomId: string }) => {
            if (pendingGroupRoom === roomId) {
                setIsCalling(false);
                setJitsiRoom(roomId);
                setPendingGroupRoom(null);
                setRemoteUser(null);
                stopRingtone();
            }
        };

        const handleEndCall = () => {
            cleanupCall();
        };

        socket.on('call-offer', handleOffer);
        socket.on('group-call-offer', handleGroupOffer);
        socket.on('group-call-answered', handleGroupAnswered);
        socket.on('call-answer', handleAnswer);
        socket.on('ice-candidate', handleCandidate);
        socket.on('end-call', handleEndCall);

        return () => {
            socket.off('call-offer', handleOffer);
            socket.off('group-call-offer', handleGroupOffer);
            socket.off('group-call-answered', handleGroupAnswered);
            socket.off('call-answer', handleAnswer);
            socket.off('ice-candidate', handleCandidate);
            socket.off('end-call', handleEndCall);
        };
    }, [socket, isInCall, isCalling, isRinging, remoteUser, jitsiRoom, incomingGroupRoom, pendingGroupRoom]);

    return (
        <CallContext.Provider value={{ startCall, startGroupCall, endCall, answerCall, rejectCall, isInCall, isRinging, isCalling, remoteUser, callType }}>
            {children}
            
            {/* WEBRTC MEDIA ELEMENTS AND VIDEO UI */}
            <div className={callType === 'video' && (isCalling || isInCall) && !isRinging && !jitsiRoom && !incomingGroupRoom ? 'fixed inset-4 md:inset-10 z-[10000] bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center justify-center animate-in zoom-in-95 border border-gray-700' : 'hidden'}>
                <video 
                    ref={remoteMediaRef} 
                    autoPlay 
                    playsInline 
                    className={callType === 'video' ? 'w-full h-full object-cover' : 'hidden'} 
                />
                
                {callType === 'video' && (
                    <div className="absolute top-6 right-6 w-32 md:w-48 aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 z-20">
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                        <div className="absolute bottom-2 left-2 right-2 text-center text-xs text-white bg-black/50 rounded-md backdrop-blur-sm">Siz</div>
                    </div>
                )}

                {callType === 'video' && isCalling && !isInCall && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 transition-opacity">
                        <div className="w-24 h-24 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse mb-4 border-4 border-white">
                            <span className="text-4xl font-bold text-white">{remoteUser?.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{remoteUser?.name}</h3>
                        <p className="text-emerald-400 font-medium animate-pulse">{isCheckingMic ? 'Kamera izni bekleniyor...' : 'Görüntülü aranıyor...'}</p>
                        
                        <button onClick={endCall} className="mt-8 w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-xl">
                            <PhoneOff size={28} />
                        </button>
                    </div>
                )}

                {callType === 'video' && isInCall && (
                    <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20 bg-gray-900/80 p-4 rounded-3xl backdrop-blur-md border border-gray-700">
                        <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-sm ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`} title={isMuted ? "Sesi Aç" : "Sesi Kapat"}>
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                        <button onClick={endCall} className="w-14 h-14 bg-red-500 text-white hover:bg-red-600 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-xl" title="İptal Et">
                            <PhoneOff size={24} />
                        </button>
                    </div>
                )}
            </div>
            
            {/* INCOMING CALL MODAL */}
            {isRinging && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-6 w-[320px] transform scale-100 animate-in zoom-in-95 duration-300 border border-gray-100">
                        <div className={`w-24 h-24 ${callType === 'video' ? 'bg-gradient-to-tr from-blue-500 to-indigo-600' : 'bg-gradient-to-tr from-[#6366f1] to-[#a855f7]'} rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse`}>
                            <span className="text-4xl font-bold text-white">{remoteUser?.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">{remoteUser?.name}</h3>
                            <p className="text-gray-500 font-medium">{callType === 'video' ? 'Gelen Görüntülü Arama...' : 'Gelen Sesli Arama...'}</p>
                        </div>
                        <div className="flex gap-8 mt-2 w-full justify-center">
                            <button 
                                onClick={rejectCall}
                                className="w-16 h-16 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
                            >
                                <PhoneOff size={28} />
                            </button>
                            <button 
                                onClick={answerCall}
                                className="w-16 h-16 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm animate-bounce"
                            >
                                <Phone size={28} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CALLING / IN CALL WIDGET (AUDIO ONLY) */}
            {callType === 'audio' && (isCalling || isInCall) && !isRinging && !jitsiRoom && (
                <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[9999] bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center gap-4 w-[280px] animate-in slide-in-from-bottom-8 border border-gray-100">
                    <div className={`relative w-20 h-20 ${isInCall ? 'bg-gradient-to-tr from-emerald-400 to-emerald-600' : 'bg-gradient-to-tr from-blue-400 to-blue-600'} rounded-full flex items-center justify-center shadow-lg`}>
                        {isCalling && !isInCall && (
                            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75"></div>
                        )}
                        <span className="text-3xl font-bold text-white">{remoteUser?.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-lg font-bold text-gray-900">{remoteUser?.name}</h3>
                        <p className={`text-sm font-medium ${isCheckingMic ? 'text-amber-500' : (isInCall ? 'text-emerald-500' : 'text-blue-500')}`}>
                            {isCheckingMic 
                                ? 'Mikrofon İzni Bekleniyor...' 
                                : (isInCall 
                                    ? 'Sesli Görüşme Devam Ediyor' 
                                    : (remoteUser && remoteUser.id === 'team' ? 'Ekip Aranıyor...' : (remoteUser && onlineUsers.includes(remoteUser.id) ? 'Bağlanıyor...' : 'Aranıyor...')))}
                        </p>
                    </div>
                    <div className="flex gap-4 mt-2 overflow-visible">
                        {isInCall && (
                            <button 
                                onClick={toggleMute}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm ${isMuted ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}
                                title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                        )}
                        <button 
                            onClick={endCall}
                            className="w-14 h-14 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm"
                            title="İptal Et"
                        >
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </div>
            )}

            {/* JITSI GROUP CALL IFRAME */}
            {jitsiRoom && (
                <div className="fixed inset-4 md:inset-10 z-[10000] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in zoom-in-95">
                    <div className="bg-gray-100 p-4 flex justify-between items-center border-b border-gray-200 z-10">
                        <div className="font-bold text-gray-700 flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                            {callType === 'video' ? 'Toplu Görüntülü Görüşme' : 'Toplu Sesli Görüşme'}
                        </div>
                        <button 
                            onClick={endGroupCall} 
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-medium hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                        >
                            Aramadan Ayrıl
                        </button>
                    </div>
                    <iframe 
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        src={`https://meet.jit.si/${jitsiRoom}#config.startWithVideoMuted=${callType === 'audio'}`}
                        className="w-full h-full border-none"
                    />
                </div>
            )}
        </CallContext.Provider>
    );
};
