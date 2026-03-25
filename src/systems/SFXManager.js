/**
 * 合成音效管理器 — 使用 Web Audio API 生成格斗音效
 * 无需外部音频文件，所有音效通过波形合成实时生成
 */
export default class SFXManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
    this.initialized = false;
  }

  // 初始化音频上下文（需在用户交互后调用）
  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('音效系统初始化失败:', e);
      this.enabled = false;
    }
  }

  // 确保上下文已恢复
  ensureResumed() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 基础振荡器辅助方法
  _osc(type, freq, duration, vol = 1) {
    if (!this.ctx || !this.enabled) return;
    this.ensureResumed();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(this.volume * vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  // 噪声生成辅助方法
  _noise(duration, vol = 0.3) {
    if (!this.ctx || !this.enabled) return;
    this.ensureResumed();

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.volume * vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  }

  // ==================== 战斗音效 ====================

  // 轻攻击命中
  hitLight() {
    this._osc('square', 800, 0.08, 0.4);
    this._noise(0.05, 0.2);
  }

  // 重攻击命中
  hitHeavy() {
    this._osc('sawtooth', 200, 0.15, 0.6);
    this._osc('square', 600, 0.1, 0.3);
    this._noise(0.1, 0.4);
  }

  // 必杀技命中
  hitSpecial() {
    this._osc('sawtooth', 150, 0.3, 0.7);
    this._osc('square', 400, 0.2, 0.4);
    this._osc('sine', 800, 0.15, 0.3);
    this._noise(0.15, 0.5);
    // 延迟的低频余韵
    setTimeout(() => {
      this._osc('sine', 80, 0.3, 0.3);
    }, 100);
  }

  // 防御格挡
  block() {
    this._osc('triangle', 300, 0.1, 0.3);
    this._osc('square', 150, 0.08, 0.2);
  }

  // 出招音效（空振）
  whiff() {
    this._osc('sine', 500, 0.06, 0.15);
  }

  // ==================== UI 音效 ====================

  // 菜单选择
  menuSelect() {
    this._osc('sine', 600, 0.08, 0.3);
    setTimeout(() => this._osc('sine', 800, 0.08, 0.3), 60);
  }

  // 菜单确认
  menuConfirm() {
    this._osc('sine', 500, 0.1, 0.4);
    setTimeout(() => this._osc('sine', 700, 0.1, 0.4), 80);
    setTimeout(() => this._osc('sine', 1000, 0.15, 0.4), 160);
  }

  // 菜单取消
  menuCancel() {
    this._osc('sine', 400, 0.1, 0.3);
    setTimeout(() => this._osc('sine', 250, 0.15, 0.3), 80);
  }

  // ==================== 回合音效 ====================

  // ROUND 开始
  roundStart() {
    this._osc('sine', 300, 0.2, 0.3);
    setTimeout(() => this._osc('sine', 450, 0.2, 0.3), 200);
    setTimeout(() => this._osc('sine', 600, 0.3, 0.4), 400);
  }

  // FIGHT!
  fight() {
    this._osc('sawtooth', 200, 0.3, 0.5);
    this._osc('square', 400, 0.15, 0.3);
    this._noise(0.08, 0.3);
  }

  // KO!
  ko() {
    this._osc('sawtooth', 100, 0.5, 0.7);
    this._osc('square', 250, 0.3, 0.4);
    this._noise(0.2, 0.5);
    setTimeout(() => {
      this._osc('sine', 60, 0.4, 0.3);
    }, 200);
  }

  // 胜利
  victory() {
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      setTimeout(() => this._osc('sine', freq, 0.3, 0.4), i * 150);
    });
  }

  // ==================== 控制 ====================

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
