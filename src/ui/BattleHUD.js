import { COLORS } from '../config/constants.js';

// 战斗 HUD — 血条、怒气槽、计时器、连击计数、回合信息
export default class BattleHUD {
  constructor(scene) {
    this.scene = scene;
    this.elements = {};
    this.createHUD();
  }

  createHUD() {
    const { scene } = this;
    const W = 1280;

    // === P1 血条（左侧）===
    // 背景
    scene.add.rectangle(30, 30, 420, 24, 0x333333).setOrigin(0, 0).setDepth(100);
    this.elements.p1HpBg = scene.add.rectangle(32, 32, 416, 20, 0x550000).setOrigin(0, 0).setDepth(101);
    this.elements.p1HpGhost = scene.add.rectangle(32, 32, 416, 20, 0xffffff).setOrigin(0, 0).setDepth(102).setAlpha(0.5);
    this.elements.p1Hp = scene.add.rectangle(32, 32, 416, 20, COLORS.HP_HIGH).setOrigin(0, 0).setDepth(103);
    // 怒气槽
    scene.add.rectangle(30, 58, 300, 12, 0x222233).setOrigin(0, 0).setDepth(100);
    this.elements.p1Rage = scene.add.rectangle(32, 60, 0, 8, COLORS.RAGE_COLOR).setOrigin(0, 0).setDepth(101);
    // P1 名字
    this.elements.p1Name = scene.add.text(32, 10, 'P1', {
      fontSize: '16px', fontFamily: '"Noto Sans SC", Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setDepth(110);

    // === P2 血条（右侧，镜像）===
    scene.add.rectangle(W - 450, 30, 420, 24, 0x333333).setOrigin(0, 0).setDepth(100);
    this.elements.p2HpBg = scene.add.rectangle(W - 448, 32, 416, 20, 0x550000).setOrigin(0, 0).setDepth(101);
    this.elements.p2HpGhost = scene.add.rectangle(W - 448, 32, 416, 20, 0xffffff).setOrigin(0, 0).setDepth(102).setAlpha(0.5);
    this.elements.p2Hp = scene.add.rectangle(W - 448, 32, 416, 20, COLORS.HP_HIGH).setOrigin(0, 0).setDepth(103);
    // 怒气槽
    scene.add.rectangle(W - 330, 58, 300, 12, 0x222233).setOrigin(0, 0).setDepth(100);
    this.elements.p2Rage = scene.add.rectangle(W - 328, 60, 0, 8, COLORS.RAGE_COLOR).setOrigin(0, 0).setDepth(101);
    // P2 名字
    this.elements.p2Name = scene.add.text(W - 32, 10, 'P2', {
      fontSize: '16px', fontFamily: '"Noto Sans SC", Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(110);

    // === 计时器 ===
    this.elements.timer = scene.add.text(W / 2, 20, '60', {
      fontSize: '40px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0).setDepth(110);

    // === 回合标记 ===
    this.elements.p1Rounds = scene.add.text(W / 2 - 60, 20, '○○', {
      fontSize: '20px', color: '#ffcc00',
    }).setOrigin(1, 0).setDepth(110);

    this.elements.p2Rounds = scene.add.text(W / 2 + 60, 20, '○○', {
      fontSize: '20px', color: '#ffcc00',
    }).setOrigin(0, 0).setDepth(110);

    // === 连击计数 ===
    this.elements.p1Combo = scene.add.text(200, 300, '', {
      fontSize: '36px', fontFamily: 'Arial', color: '#ffaa00',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(120).setAlpha(0);

    this.elements.p2Combo = scene.add.text(W - 200, 300, '', {
      fontSize: '36px', fontFamily: 'Arial', color: '#ffaa00',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(120).setAlpha(0);

    // === 中央公告文字 ===
    this.elements.announce = scene.add.text(W / 2, 300, '', {
      fontSize: '72px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(200).setAlpha(0);
  }

  // 更新血条
  updateHP(p1, p2) {
    const maxW = 416;

    // P1
    const p1Ratio = p1.hp / p1.maxHp;
    this.elements.p1Hp.width = maxW * p1Ratio;
    this.elements.p1Hp.fillColor = p1Ratio > 0.6 ? COLORS.HP_HIGH : p1Ratio > 0.3 ? COLORS.HP_MID : COLORS.HP_LOW;

    // P1 幽灵血条（延迟掉落效果）
    const p1GhostW = this.elements.p1HpGhost.width;
    const p1TargetW = maxW * p1Ratio;
    if (p1GhostW > p1TargetW) {
      this.elements.p1HpGhost.width = Math.max(p1TargetW, p1GhostW - 2);
    }

    // P2
    const p2Ratio = p2.hp / p2.maxHp;
    this.elements.p2Hp.width = maxW * p2Ratio;
    this.elements.p2Hp.fillColor = p2Ratio > 0.6 ? COLORS.HP_HIGH : p2Ratio > 0.3 ? COLORS.HP_MID : COLORS.HP_LOW;

    const p2GhostW = this.elements.p2HpGhost.width;
    const p2TargetW = maxW * p2Ratio;
    if (p2GhostW > p2TargetW) {
      this.elements.p2HpGhost.width = Math.max(p2TargetW, p2GhostW - 2);
    }
  }

  // 更新怒气槽
  updateRage(p1, p2) {
    this.elements.p1Rage.width = (p1.rage / p1.maxRage) * 296;
    this.elements.p2Rage.width = (p2.rage / p2.maxRage) * 296;

    this.elements.p1Rage.fillColor = p1.rage >= p1.maxRage ? COLORS.RAGE_FULL : COLORS.RAGE_COLOR;
    this.elements.p2Rage.fillColor = p2.rage >= p2.maxRage ? COLORS.RAGE_FULL : COLORS.RAGE_COLOR;
  }

  // 更新计时器
  updateTimer(seconds) {
    this.elements.timer.setText(Math.ceil(seconds).toString());
    this.elements.timer.setColor(seconds <= 10 ? '#ff3333' : '#ffffff');
    if (seconds <= 10) {
      this.elements.timer.setScale(1 + Math.sin(Date.now() * 0.01) * 0.1);
    } else {
      this.elements.timer.setScale(1);
    }
  }

  // 更新回合标记
  updateRounds(p1Wins, p2Wins) {
    const p1Marks = (p1Wins >= 1 ? '●' : '○') + (p1Wins >= 2 ? '●' : '○');
    const p2Marks = (p2Wins >= 1 ? '●' : '○') + (p2Wins >= 2 ? '●' : '○');
    this.elements.p1Rounds.setText(p1Marks);
    this.elements.p2Rounds.setText(p2Marks);
  }

  // 显示连击计数
  showCombo(playerIndex, count) {
    const key = playerIndex === 0 ? 'p1Combo' : 'p2Combo';
    const el = this.elements[key];
    if (count >= 2) {
      const color = count >= 10 ? '#ff4444' : count >= 5 ? '#ffaa00' : '#ffffff';
      el.setText(`${count} HITS!`);
      el.setColor(color);
      el.setAlpha(1);
      el.setScale(1.3);
      this.scene.tweens.add({ targets: el, scale: 1, duration: 150, ease: 'Back.Out' });
    } else {
      el.setAlpha(0);
    }
  }

  // 显示中央公告（电影级转场）
  showAnnounce(text, duration = 1500) {
    const { scene } = this;
    const el = this.elements.announce;
    const W = 1280, H = 720;

    // 判断文字类型以决定特效等级
    const isKO = text === 'KO!';
    const isFight = text === 'FIGHT!';
    const isRound = text.startsWith('ROUND');
    const isWin = text.includes('WINS');

    // === 1. 黑幕遮罩 ===
    if (isRound || isKO || isWin) {
      if (!this.elements.overlay) {
        this.elements.overlay = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0)
          .setDepth(190);
      }
      const ov = this.elements.overlay;
      const overlayAlpha = isKO ? 0.5 : isWin ? 0.6 : 0.35;
      ov.setAlpha(0);
      scene.tweens.add({
        targets: ov,
        alpha: overlayAlpha,
        duration: 200,
        yoyo: true,
        hold: duration + 300,
        ease: 'Sine.easeInOut',
      });
    }

    // === 2. 闪光条纹（FIGHT / KO 专属）===
    if (isFight || isKO) {
      const flash = scene.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0.6)
        .setDepth(195);
      scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 300,
        onComplete: () => flash.destroy(),
      });

      // 水平闪光条
      const stripe1 = scene.add.rectangle(W / 2, H / 2 - 8, W, 4, 0xffaa00, 0.8).setDepth(199);
      const stripe2 = scene.add.rectangle(W / 2, H / 2 + 8, W, 2, 0xffdd44, 0.6).setDepth(199);
      scene.tweens.add({
        targets: [stripe1, stripe2],
        scaleY: 0,
        alpha: 0,
        duration: 600,
        delay: 200,
        onComplete: () => { stripe1.destroy(); stripe2.destroy(); },
      });
    }

    // === 3. 文字样式与动画 ===
    const colorMap = {
      'KO!': '#ff2222',
      'FIGHT!': '#ffcc00',
    };
    const textColor = isWin ? '#ffdd44' : (colorMap[text] || '#ffffff');
    const strokeColor = isKO ? '#880000' : isFight ? '#884400' : '#000000';

    el.setText(text);
    el.setColor(textColor);
    el.setStroke(strokeColor, isKO ? 8 : 6);
    el.setAlpha(1);
    el.setScale(isKO ? 0.3 : 0.5);
    el.setAngle(isKO ? -5 : 0);

    // 入场动画
    scene.tweens.add({
      targets: el,
      scale: isKO ? 1.5 : 1.2,
      angle: 0,
      duration: isKO ? 150 : 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 稳定动画
        scene.tweens.add({
          targets: el,
          scale: 1,
          duration: 150,
          onComplete: () => {
            // KO 专属震动
            if (isKO) {
              scene.cameras.main.shake(200, 0.015);
            }
            // 持续后消失
            scene.time.delayedCall(duration, () => {
              scene.tweens.add({
                targets: el,
                alpha: 0,
                scale: isWin ? 1.5 : 0.8,
                duration: 400,
                ease: 'Cubic.easeIn',
              });
            });
          },
        });
      },
    });

    // === 4. KO 冲击粒子 ===
    if (isKO) {
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        const spark = scene.add.circle(
          W / 2, H / 2 - 20,
          Phaser.Math.Between(3, 6),
          Phaser.Math.RGBStringToColor('#ff4400').color, 0.9
        ).setDepth(198);
        scene.tweens.add({
          targets: spark,
          x: W / 2 + Math.cos(angle) * Phaser.Math.Between(100, 250),
          y: H / 2 - 20 + Math.sin(angle) * Phaser.Math.Between(60, 150),
          alpha: 0,
          scale: 0,
          duration: Phaser.Math.Between(400, 800),
          ease: 'Cubic.easeOut',
          onComplete: () => spark.destroy(),
        });
      }
    }

    // === 5. FIGHT 火花效果 ===
    if (isFight) {
      for (let i = 0; i < 8; i++) {
        const sx = W / 2 + Phaser.Math.Between(-200, 200);
        const sy = H / 2 + Phaser.Math.Between(-30, 30);
        const sparkle = scene.add.star(sx, sy, 4, 2, 6, 0xffdd00, 0.8).setDepth(198);
        scene.tweens.add({
          targets: sparkle,
          alpha: 0,
          scale: 0,
          angle: Phaser.Math.Between(-90, 90),
          duration: Phaser.Math.Between(300, 700),
          delay: Phaser.Math.Between(0, 200),
          onComplete: () => sparkle.destroy(),
        });
      }
    }
  }

  // 设置角色名字
  setNames(p1Data, p2Data) {
    this.elements.p1Name.setText(`${p1Data.name} ${this.getEmoji(p1Data.element)}`);
    this.elements.p2Name.setText(`${this.getEmoji(p2Data.element)} ${p2Data.name}`);
  }

  getEmoji(element) {
    const map = { fire: '🔥', ice: '❄️', thunder: '⚡', water: '🌊', wind: '🌪️', earth: '🪨', light: '✨', dark: '🌑' };
    return map[element] || '';
  }

  // 重置幽灵血条
  resetGhostHP() {
    this.elements.p1HpGhost.width = 416;
    this.elements.p2HpGhost.width = 416;
  }

  destroy() {
    Object.values(this.elements).forEach(el => el.destroy && el.destroy());
  }
}
