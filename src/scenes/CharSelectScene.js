import Phaser from 'phaser';
import { CHARACTERS } from '../config/characters.js';
import SFXManager from '../systems/SFXManager.js';

/**
 * 角色选择场景
 * 显示可选角色卡片，选定后进入战斗
 */
export default class CharSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharSelectScene' });
  }

  init(data) {
    this.gameMode = data?.mode || 'vsAI';
  }

  preload() {
    // 预加载角色图集（如果尚未加载）
    if (!this.textures.exists('ignis')) {
      this.load.atlas('ignis', 'assets/sprites/ignis.png', 'assets/sprites/ignis.json');
    }
    if (!this.textures.exists('lingshuang')) {
      this.load.atlas('lingshuang', 'assets/sprites/lingshuang.png', 'assets/sprites/lingshuang.json');
    }
    if (!this.textures.exists('neo')) {
      this.load.atlas('neo', 'assets/sprites/neo.png', 'assets/sprites/neo.json');
    }
  }

  create() {
    const { width, height } = this.scale;

    // ==================== 背景 ====================
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0015, 0x0a0015, 0x150828, 0x150828, 1);
    bg.fillRect(0, 0, width, height);

    // 音效
    if (!window.__sfx) window.__sfx = new SFXManager();
    this.sfx = window.__sfx;

    // 网格线装饰
    const gridGfx = this.add.graphics();
    gridGfx.lineStyle(1, 0x332255, 0.15);
    for (let x = 0; x < width; x += 60) {
      gridGfx.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 60) {
      gridGfx.lineBetween(0, y, width, y);
    }

    // ==================== 标题 ====================
    const modeLabels = {
      vsAI: '⚔️ 单人 VS AI',
      vs2P: '👥 本地双人对战',
      training: '🏋️ 训练模式',
    };

    this.add.text(width / 2, 40, '选 择 角 色', {
      fontSize: '36px',
      fontFamily: 'Arial Black, Arial',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#6622aa',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, 80, modeLabels[this.gameMode] || '对战模式', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aa88dd',
    }).setOrigin(0.5);

    // ==================== 角色卡片 ====================
    const charList = Object.values(CHARACTERS);
    const cardWidth = 240;
    const cardHeight = 380;
    const totalWidth = charList.length * cardWidth + (charList.length - 1) * 40;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;

    this.selectedP1 = null;
    this.cards = [];

    charList.forEach((char, i) => {
      const cx = startX + i * (cardWidth + 40);
      const cy = height / 2 + 20;

      // 卡片背景
      const card = this.add.rectangle(cx, cy, cardWidth, cardHeight, 0x221144, 0.4)
        .setStrokeStyle(2, 0x6644aa, 0.6)
        .setInteractive({ useHandCursor: true });

      // 元素标识
      const elemColors = { fire: 0xff4422, ice: 0x44ccff, thunder: 0xffee00, water: 0x2266ff };
      const elemEmoji = { fire: '🔥', ice: '❄️', thunder: '⚡', water: '🌊' };

      // 角色精灵预览
      const atlasKey = char.id === 'lingShuang' ? 'lingshuang' : char.id;
      let preview = null;
      if (this.textures.exists(atlasKey)) {
        const firstFrame = this.textures.get(atlasKey).getFrameNames()[0];
        if (firstFrame) {
          preview = this.add.sprite(cx, cy - 20, atlasKey, firstFrame)
            .setScale(1.8)
            .setOrigin(0.5);
        }
      }

      // 没有精灵时用占位符
      if (!preview) {
        preview = this.add.rectangle(cx, cy - 20, 100, 140, elemColors[char.element] || 0x888888, 0.3);
      }

      // 角色名
      this.add.text(cx, cy + cardHeight / 2 - 80, `${elemEmoji[char.element] || '⭐'} ${char.name}`, {
        fontSize: '22px',
        fontFamily: 'Arial Black, Arial',
        color: '#ffffff',
      }).setOrigin(0.5);

      // 称号
      this.add.text(cx, cy + cardHeight / 2 - 55, char.title, {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#aa88dd',
      }).setOrigin(0.5);

      // 属性条
      const statsY = cy + cardHeight / 2 - 30;
      const stats = [
        { label: 'HP', value: char.stats.hp / 10, color: 0x44ff44 },
        { label: 'SPD', value: char.stats.walkSpeed * 20, color: 0x44aaff },
        { label: 'ATK', value: (char.moves.heavy.damage / 80) * 100, color: 0xff4444 },
      ];

      stats.forEach((s, si) => {
        const sx = cx - 80;
        const sy = statsY + si * 16;
        this.add.text(sx, sy, s.label, {
          fontSize: '10px', fontFamily: 'Arial', color: '#888888'
        });
        // 属性条背景
        this.add.rectangle(sx + 35 + 50, sy + 5, 100, 6, 0x222222).setOrigin(0, 0.5);
        // 属性条填充
        const barWidth = Math.min(s.value, 100);
        this.add.rectangle(sx + 35, sy + 5, barWidth, 6, s.color, 0.7).setOrigin(0, 0.5);
      });

      // 选中高亮框
      const highlight = this.add.rectangle(cx, cy, cardWidth + 6, cardHeight + 6)
        .setStrokeStyle(3, elemColors[char.element] || 0xffffff, 0)
        .setFillStyle(0x000000, 0);

      // Hover 效果
      card.on('pointerover', () => {
        card.setFillStyle(0x332266, 0.6);
        card.setStrokeStyle(2, 0xaa88ff, 0.9);
        if (preview.setScale) preview.setScale(preview.scaleX > 1 ? 1.95 : 1);
      });

      card.on('pointerout', () => {
        if (this.selectedP1 !== char.id) {
          card.setFillStyle(0x221144, 0.4);
          card.setStrokeStyle(2, 0x6644aa, 0.6);
          highlight.setStrokeStyle(3, elemColors[char.element] || 0xffffff, 0);
        }
        if (preview.setScale) preview.setScale(preview.scaleX > 1.5 ? 1.8 : 1);
      });

      // 点击选择
      card.on('pointerdown', () => {
        this.selectCharacter(char, card, highlight, elemColors[char.element] || 0xffffff);
        this.sfx.menuSelect();
      });

      this.cards.push({ card, highlight, char, preview });
    });

    // ==================== 底部按钮 ====================
    // 返回按钮
    const backBtn = this.add.text(80, height - 40, '← 返回', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#887799',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#887799'));
    backBtn.on('pointerdown', () => {
      this.sfx.menuCancel();
      this.scene.start('MainMenuScene');
    });

    // 开始按钮（初始隐藏）
    this.startBtn = this.add.rectangle(width / 2, height - 40, 200, 40, 0x44aa44, 0.3)
      .setStrokeStyle(2, 0x66cc66, 0.6)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.startText = this.add.text(width / 2, height - 40, '▶ 开始战斗', {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: '#88ff88',
    }).setOrigin(0.5).setVisible(false);

    this.startBtn.on('pointerover', () => {
      this.startBtn.setFillStyle(0x55cc55, 0.5);
      this.startText.setColor('#ffffff');
    });
    this.startBtn.on('pointerout', () => {
      this.startBtn.setFillStyle(0x44aa44, 0.3);
      this.startText.setColor('#88ff88');
    });
    this.startBtn.on('pointerdown', () => {
      this.sfx.menuConfirm();
      this.launchBattle();
    });
  }

  // 选择角色
  selectCharacter(char, card, highlight, color) {
    // 清除所有选中状态
    this.cards.forEach(c => {
      c.card.setFillStyle(0x221144, 0.4);
      c.card.setStrokeStyle(2, 0x6644aa, 0.6);
      c.highlight.setStrokeStyle(3, 0xffffff, 0);
    });

    // 选中当前角色
    this.selectedP1 = char.id;
    card.setFillStyle(0x332266, 0.8);
    highlight.setStrokeStyle(3, color, 0.9);

    // 显示闪烁确认效果
    this.tweens.add({
      targets: highlight,
      alpha: { from: 1, to: 0.5 },
      duration: 500,
      yoyo: true,
      repeat: 2,
    });

    // 显示开始按钮
    this.startBtn.setVisible(true);
    this.startText.setVisible(true);
  }

  // 进入战斗
  launchBattle() {
    if (!this.selectedP1) return;

    // 根据模式配置战斗参数
    const config = {
      mode: this.gameMode,
      p1Char: this.selectedP1,
      // AI 模式下，P2 随机选一个不同的角色
      p2Char: this.gameMode === 'vsAI'
        ? Object.keys(CHARACTERS).find(k => CHARACTERS[k].id !== this.selectedP1) || 'lingShuang'
        : null, // 双人模式下 P2 也需要选，暂时默认另一个
      useAI: this.gameMode === 'vsAI' || this.gameMode === 'training',
    };

    // 如果 P2 未选，默认选另一个角色
    if (!config.p2Char) {
      config.p2Char = Object.keys(CHARACTERS).find(k => CHARACTERS[k].id !== this.selectedP1) || 'lingShuang';
    }

    this.scene.start('BattleScene', config);
  }
}
