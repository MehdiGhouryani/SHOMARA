/**
 * Web Audio API Sound Synthesizer for Primary Math App
 * 100% Non-blocking, completely decoupled from UI event loop
 */

class SoundEffectEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isSupported: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined' || !this.isSupported) return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        } else {
          this.isSupported = false;
          return null;
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      this.isSupported = false;
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playTap() {
    setTimeout(() => {
      try {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } catch { /* best-effort: failure is intentionally non-fatal */ }
    }, 0);
  }

  public playBubblePop() {
    setTimeout(() => {
      try {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } catch { /* best-effort: failure is intentionally non-fatal */ }
    }, 0);
  }

  public playSuccess() {
    setTimeout(() => {
      try {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

            gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.08);
            osc.stop(ctx.currentTime + idx * 0.08 + 0.36);
          } catch { /* best-effort: failure is intentionally non-fatal */ }
        });
      } catch { /* best-effort: failure is intentionally non-fatal */ }
    }, 0);
  }

  public playTryAgain() {
    setTimeout(() => {
      try {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const notes = [440, 392];
        notes.forEach((freq, idx) => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

            gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.1);
            osc.stop(ctx.currentTime + idx * 0.1 + 0.26);
          } catch { /* best-effort: failure is intentionally non-fatal */ }
        });
      } catch { /* best-effort: failure is intentionally non-fatal */ }
    }, 0);
  }

  public playLevelPass() {
    setTimeout(() => {
      try {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const fanfares = [
          { freq: 523.25, time: 0 },
          { freq: 659.25, time: 0.1 },
          { freq: 783.99, time: 0.2 },
          { freq: 1046.5, time: 0.32 },
          { freq: 880, time: 0.44 },
          { freq: 1046.5, time: 0.58 },
        ];
        fanfares.forEach(({ freq, time }) => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

            gain.gain.setValueAtTime(0.18, ctx.currentTime + time);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + time);
            osc.stop(ctx.currentTime + time + 0.41);
          } catch { /* best-effort: failure is intentionally non-fatal */ }
        });
      } catch { /* best-effort: failure is intentionally non-fatal */ }
    }, 0);
  }

  public playCharacterChirp(charId: string) {
    setTimeout(() => {
      try {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

        if (charId === 'aria') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, now);
          osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);
        } else if (charId === 'qbo') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.setValueAtTime(800, now + 0.05);
          osc.frequency.setValueAtTime(1000, now + 0.1);
        } else if (charId === 'jiko') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(900, now);
          osc.frequency.exponentialRampToValueAtTime(1500, now + 0.08);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.1);
        }

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch { /* best-effort: failure is intentionally non-fatal */ }
    }, 0);
  }
}

export const soundFx = new SoundEffectEngine();
