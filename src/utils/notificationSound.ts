/**
 * Plays a pleasant notification sound using the Web Audio API.
 * This avoids the need for external audio files.
 */
export const playNotificationSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create an oscillator (the sound source)
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // Type of wave: 'sine', 'square', 'sawtooth', 'triangle'
        oscillator.type = 'sine';
        
        // Frequency in Hz (880 is A5, a relatively high pleasant pitch)
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);

        // Gain (volume) control
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        // Connect the nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Start and stop
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (error) {
        console.warn('Audio notification failed:', error);
    }
};
