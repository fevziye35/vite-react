/**
 * Plays a pleasant notification sound using the Web Audio API.
 * This avoids the need for external audio files.
 */
export const playNotificationSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const playTone = (freq: number, start: number, duration: number, volume = 0.1) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.05, start + duration); // Slight upward slide for extra "happiness"
            
            gain.gain.setValueAtTime(volume, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(start);
            osc.stop(start + duration);
        };

        const now = audioCtx.currentTime;
        // Ascending C Major Arpeggio
        playTone(523.25, now, 0.1, 0.08);       // C5
        playTone(659.25, now + 0.08, 0.1, 0.08); // E5
        playTone(783.99, now + 0.16, 0.1, 0.08); // G5
        playTone(1046.50, now + 0.24, 0.3, 0.1); // C6 (Final bright note)
    } catch (error) {
        console.warn('Audio notification failed:', error);
    }
};
