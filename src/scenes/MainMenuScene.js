import Phaser from 'phaser';

/**
 * 主菜单场景 — 游戏入口
 * 动态粒子背景 + 标题动画 + 模式选择
 */
export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ==================== 背景 ====================
    // 渐变背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0015, 0x0a0015, 0x1a0533, 0x1a0533, 1);
    bg.fillRect(0, 0, width, height);

    // 动态粒子
    for (let i = 0; i < 40; i++) {
      const px = Phaser.Math.Between(0, width);
      const py = Phaser.Math.Between(0, height);
      const dot = this.add.circle(px, py, Phaser.Math.Between(1, 3), 0x8844ff, 0.4);
      this.tweens.add({
        targets: dot,
        y: py - Phaser.Math.Between(80, 200),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 7000),
        repeat: -1,
        onRepeat: () => {
          dot.x = Phaser.Math.Between(0, width);
          dot.y = Phaser.Math.Between(height * 0.5, height);
          dot.alpha = 0.4;
        },
      });
    }

    // 装饰线条
    const line1 = this.add.rectangle(width / 2, 200, 600, 1, 0x6644aa, 0.3);
    const line2 = this.add.rectangle(width / 2, 520, 600, 1, 0x6644aa, 0.3);

    // ==================== 标题 ====================
    // 游戏副标题
    const subtitle = this.add.text(width / 2, 250, '异时空格斗女神', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aa88dd',
      letterSpacing: 12,
    }).setOrigin(0.5).setAlpha(0);

    // 游戏主标题
    const title = this.add.text(width / 2, 310, '全 女 格 斗', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#6622aa',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);

    // 标题动画
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 800,
      ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 600,
      delay: 400,
    });

    // 标题发光效果
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.85 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ==================== 菜单选项 ====================
    const menuItems = [
      { text: '⚔️  单人 VS AI', key: 'vsAI' },
      { text: '👥  本地双人对战', key: 'vs2P' },
      { text: '🏋️  训练模式', key: 'training' },
    ];

    this.menuButtons = [];
    menuItems.forEach((item, i) => {
      const y = 410 + i * 55;

      // 按钮背景
      const btnBg = this.add.rectangle(width / 2, y, 320, 42, 0x6644aa, 0.08)
        .setStrokeStyle(1, 0x8866cc, 0.4)
        .setInteractive({ useHandCursor: true });

      // 按钮文字
      const btnText = this.add.text(width / 2, y, item.text, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ccbbee',
      }).setOrigin(0.5);

      // Hover 效果
      btnBg.on('pointerover', () => {
        btnBg.setFillStyle(0x8855cc, 0.25);
        btnBg.setStrokeStyle(2, 0xaa88ff, 0.8);
        btnText.setColor('#ffffff');
        btnText.setScale(1.05);
      });

      btnBg.on('pointerout', () => {
        btnBg.setFillStyle(0x6644aa, 0.08);
        btnBg.setStrokeStyle(1, 0x8866cc, 0.4);
        btnText.setColor('#ccbbee');
        btnText.setScale(1);
      });

      // 点击事件
      btnBg.on('pointerdown', () => {
        btnBg.setFillStyle(0xaa77ff, 0.4);
        this.time.delayedCall(150, () => {
          this.startGame(item.key);
        });
      });

      // 入场动画
      btnBg.setAlpha(0);
      btnText.setAlpha(0);
      this.tweens.add({
        targets: [btnBg, btnText],
        alpha: 1,
        x: { from: width / 2 - 50, to: width / 2 },
        duration: 400,
        delay: 600 + i * 120,
        ease: 'Cubic.easeOut',
      });

      this.menuButtons.push({ bg: btnBg, text: btnText, key: item.key });
    });

    // ==================== 底部信息 ====================
    this.add.text(width / 2, height - 40, 'v0.1.0 Sprint 1 · Phaser 3', {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#555555',
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 22, '🔥 按任意键或点击开始', {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#887799',
    }).setOrigin(0.5).setAlpha(0).setName('pressStart');

    // 延迟显示 "按任意键" 提示
    this.time.delayedCall(1200, () => {
      const ps = this.children.getByName('pressStart');
      if (ps) {
        this.tweens.add({
          targets: ps,
          alpha: { from: 0, to: 0.8 },
          duration: 800,
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }

  // 开始游戏
  startGame(mode) {
    // 传递游戏模式到角色选择或直接进战斗
    this.scene.start('CharSelectScene', { mode });
  }
}
