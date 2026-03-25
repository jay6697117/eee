import Phaser from 'phaser';

/**
 * 触屏控制 UI
 * 左侧：虚拟摇杆（方向控制）
 * 右侧：4 个动作按钮（轻攻/重攻/必杀/防御）
 * 仅在触屏设备上自动显示
 */
export default class TouchControls {
  constructor(scene, inputManager) {
    this.scene = scene;
    this.input = inputManager;
    this.enabled = false;

    // 检测是否为触屏设备
    this.isTouchDevice = this.detectTouch();

    if (!this.isTouchDevice) return;

    this.enabled = true;
    this.createJoystick();
    this.createActionButtons();
  }

  // 检测触屏设备
  detectTouch() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // 也可以通过 URL 参数强制启用 ?touch=1
      new URLSearchParams(window.location.search).has('touch')
    );
  }

  // ==================== 虚拟摇杆 ====================
  createJoystick() {
    const cx = 150;  // 摇杆中心 X
    const cy = 550;  // 摇杆中心 Y
    const baseRadius = 70;
    const knobRadius = 30;
    this.joystickDeadzone = 15;

    // 底座（半透明圆环）
    this.joystickBase = this.scene.add.circle(cx, cy, baseRadius, 0xffffff, 0.15)
      .setDepth(200)
      .setScrollFactor(0);
    // 底座边框
    this.joystickRing = this.scene.add.circle(cx, cy, baseRadius)
      .setStrokeStyle(2, 0xffffff, 0.3)
      .setDepth(200)
      .setScrollFactor(0);

    // 摇杆头
    this.joystickKnob = this.scene.add.circle(cx, cy, knobRadius, 0xffffff, 0.4)
      .setDepth(201)
      .setScrollFactor(0);

    // 方向箭头提示
    const arrowStyle = { fontSize: '16px', color: '#ffffff', fontFamily: 'Arial' };
    this.scene.add.text(cx, cy - baseRadius - 10, '▲', arrowStyle).setOrigin(0.5).setAlpha(0.3).setDepth(200);
    this.scene.add.text(cx, cy + baseRadius + 10, '▼', arrowStyle).setOrigin(0.5).setAlpha(0.3).setDepth(200);
    this.scene.add.text(cx - baseRadius - 10, cy, '◀', arrowStyle).setOrigin(0.5).setAlpha(0.3).setDepth(200);
    this.scene.add.text(cx + baseRadius + 10, cy, '▶', arrowStyle).setOrigin(0.5).setAlpha(0.3).setDepth(200);

    // 保存位置参数
    this.joystickCenter = { x: cx, y: cy };
    this.joystickMaxDist = baseRadius - knobRadius;
    this.joystickPointerId = null;

    // 触摸事件 — 摇杆区域（左半屏）
    this.scene.input.on('pointerdown', (pointer) => {
      if (pointer.x < this.scene.scale.width / 2 && this.joystickPointerId === null) {
        this.joystickPointerId = pointer.id;
        this.updateJoystickPosition(pointer);
      }
    });

    this.scene.input.on('pointermove', (pointer) => {
      if (pointer.id === this.joystickPointerId) {
        this.updateJoystickPosition(pointer);
      }
    });

    this.scene.input.on('pointerup', (pointer) => {
      if (pointer.id === this.joystickPointerId) {
        this.resetJoystick();
      }
    });
  }

  // 更新摇杆位置和输入状态
  updateJoystickPosition(pointer) {
    // 将屏幕坐标转为游戏坐标
    const gameCoords = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    
    const dx = pointer.x - this.joystickCenter.x * (this.scene.scale.width / 1280);
    const dy = pointer.y - this.joystickCenter.y * (this.scene.scale.height / 720);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const scale = this.scene.scale.width / 1280;
    const maxDist = this.joystickMaxDist * scale;

    // 限制在最大范围内
    let clampedX, clampedY;
    if (dist > maxDist) {
      const angle = Math.atan2(dy, dx);
      clampedX = Math.cos(angle) * maxDist;
      clampedY = Math.sin(angle) * maxDist;
    } else {
      clampedX = dx;
      clampedY = dy;
    }

    // 更新摇杆头位置
    this.joystickKnob.setPosition(
      this.joystickCenter.x + clampedX / scale,
      this.joystickCenter.y + clampedY / scale
    );

    // 高亮摇杆头
    this.joystickKnob.setFillStyle(0xffffff, 0.6);

    // 计算方向输入（带死区）
    const deadzone = this.joystickDeadzone * scale;
    this.input.setTouchInput('left', clampedX < -deadzone);
    this.input.setTouchInput('right', clampedX > deadzone);
    this.input.setTouchInput('up', clampedY < -deadzone);
    this.input.setTouchInput('down', clampedY > deadzone);
  }

  // 重置摇杆
  resetJoystick() {
    this.joystickPointerId = null;
    this.joystickKnob.setPosition(this.joystickCenter.x, this.joystickCenter.y);
    this.joystickKnob.setFillStyle(0xffffff, 0.4);

    // 清除所有方向输入
    this.input.setTouchInput('left', false);
    this.input.setTouchInput('right', false);
    this.input.setTouchInput('up', false);
    this.input.setTouchInput('down', false);
  }

  // ==================== 攻击按钮 ====================
  createActionButtons() {
    // 按钮布局：右下角菱形排列
    // 上方：必杀 (L)  下方：防御 (U)  左：轻攻 (J)  右：重攻 (K)
    const baseX = 1130;
    const baseY = 530;
    const spacing = 55;

    const buttons = [
      { key: 'light',   label: '轻',  color: 0x44aaff, x: baseX - spacing, y: baseY,            emoji: '👊' },
      { key: 'heavy',   label: '重',  color: 0xff4444, x: baseX + spacing, y: baseY,            emoji: '💥' },
      { key: 'special', label: '必杀', color: 0xffaa00, x: baseX,           y: baseY - spacing,  emoji: '⚡' },
      { key: 'block',   label: '防',  color: 0x44ff88, x: baseX,           y: baseY + spacing,  emoji: '🛡️' },
    ];

    this.actionButtons = [];

    buttons.forEach(btn => {
      // 按钮背景（圆形）
      const bg = this.scene.add.circle(btn.x, btn.y, 32, btn.color, 0.25)
        .setDepth(200)
        .setScrollFactor(0)
        .setInteractive()
        .setStrokeStyle(2, btn.color, 0.6);

      // 按钮文字
      const text = this.scene.add.text(btn.x, btn.y, btn.emoji, {
        fontSize: '20px',
        fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

      // 按钮标签
      const label = this.scene.add.text(btn.x, btn.y + 22, btn.label, {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#cccccc',
      }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

      // 按下事件
      bg.on('pointerdown', () => {
        bg.setFillStyle(btn.color, 0.6);
        bg.setScale(0.9);
        this.input.setTouchInput(btn.key, true);
      });

      // 松开事件
      bg.on('pointerup', () => {
        bg.setFillStyle(btn.color, 0.25);
        bg.setScale(1);
        // 方向键是持续的，攻击键是单次的（在 update 循环中清除）
        if (btn.key !== 'block') {
          // 攻击键保持 true 一帧后自动清除
        } else {
          this.input.setTouchInput(btn.key, false);
        }
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(btn.color, 0.25);
        bg.setScale(1);
        if (btn.key === 'block') {
          this.input.setTouchInput(btn.key, false);
        }
      });

      this.actionButtons.push({ bg, text, label, key: btn.key });
    });
  }

  // 每帧更新（由 BattleScene 调用）
  update() {
    if (!this.enabled) return;
    // 触屏的单次按键需要在这里清除（下一帧自动变回 false）
    this.input.clearTouchActions();
  }

  // 销毁
  destroy() {
    if (!this.enabled) return;
    this.joystickBase?.destroy();
    this.joystickRing?.destroy();
    this.joystickKnob?.destroy();
    this.actionButtons?.forEach(btn => {
      btn.bg?.destroy();
      btn.text?.destroy();
      btn.label?.destroy();
    });
  }
}
