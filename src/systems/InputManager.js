import { KEYS, COMBAT } from '../config/constants.js';

// 输入管理器 — 统一处理键盘和触屏输入
export default class InputManager {
  constructor(scene, playerIndex) {
    this.scene = scene;
    this.playerIndex = playerIndex; // 0=P1, 1=P2
    const keyMap = playerIndex === 0 ? KEYS.P1 : KEYS.P2;

    // 绑定按键
    this.keys = {
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyMap.LEFT]),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyMap.RIGHT]),
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyMap.UP]),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyMap.DOWN]),
      light: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyMap.LIGHT]),
      heavy: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyMap.HEAVY]),
      special: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyMap.SPECIAL]),
      block: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyMap.BLOCK]),
    };

    // 输入缓冲队列
    this.buffer = [];
    this.bufferTimer = 0;

    // 方向队列（用于方向组合检测）
    this.dirQueue = [];
    this.dirTimer = 0;

    // 触屏输入覆盖
    this.touchOverride = { left: false, right: false, up: false, down: false, light: false, heavy: false, special: false, block: false };
  }

  // 获取当前帧的输入状态
  getState() {
    return {
      left: this.keys.left.isDown || this.touchOverride.left,
      right: this.keys.right.isDown || this.touchOverride.right,
      up: this.keys.up.isDown || this.touchOverride.up,
      down: this.keys.down.isDown || this.touchOverride.down,
      light: Phaser.Input.Keyboard.JustDown(this.keys.light) || this.touchOverride.light,
      heavy: Phaser.Input.Keyboard.JustDown(this.keys.heavy) || this.touchOverride.heavy,
      special: Phaser.Input.Keyboard.JustDown(this.keys.special) || this.touchOverride.special,
      block: this.keys.block.isDown || this.touchOverride.block,
    };
  }

  // 检测必杀技指令
  checkSpecialInput(facing) {
    const state = this.getState();
    const forward = facing === 1 ? state.right : state.left;

    // 必杀技 1: → + 轻+重同时
    if (forward && state.light && state.heavy) {
      return 'special1';
    }

    // 必杀技 2: ↓→ + 元素键（简化检测）
    if (state.special && state.down) {
      return 'special2';
    }

    return null;
  }

  // 设置触屏输入
  setTouchInput(key, value) {
    this.touchOverride[key] = value;
  }

  // 清除触屏单次输入
  clearTouchActions() {
    this.touchOverride.light = false;
    this.touchOverride.heavy = false;
    this.touchOverride.special = false;
  }

  // 销毁
  destroy() {
    Object.values(this.keys).forEach(key => key.destroy && key.destroy());
  }
}
