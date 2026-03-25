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

  // 显示中央公告
  showAnnounce(text, duration = 1500) {
    const el = this.elements.announce;
    el.setText(text);
    el.setAlpha(1);
    el.setScale(0.5);
    this.scene.tweens.add({
      targets: el, scale: 1.2, duration: 200, ease: 'Back.Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: el, scale: 1, duration: 100,
          onComplete: () => {
            this.scene.time.delayedCall(duration, () => {
              this.scene.tweens.add({ targets: el, alpha: 0, duration: 300 });
            });
          },
        });
      },
    });
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
