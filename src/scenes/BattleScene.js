import Phaser from 'phaser';
import { STAGE, BATTLE, JUICE, STATES } from '../config/constants.js';
import { CHARACTERS, ELEMENT_CHART } from '../config/characters.js';
import InputManager from '../systems/InputManager.js';
import AIController from '../systems/AIController.js';
import FighterBase from '../fighters/FighterBase.js';
import BattleHUD from '../ui/BattleHUD.js';
import TouchControls from '../ui/TouchControls.js';

// 战斗场景 — 游戏核心
export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    // 从角色选择场景接收配置
    this.battleConfig = data || {};
  }

  preload() {
    // 预加载角色图集
    this.load.atlas('ignis', 'assets/sprites/ignis.png', 'assets/sprites/ignis.json');
    this.load.atlas('lingshuang', 'assets/sprites/lingshuang.png', 'assets/sprites/lingshuang.json');
  }

  create() {
    // 创建全局角色动画
    this.createAnimations();

    // 场景背景
    this.createBackground();

    // 解析角色配置
    const p1Key = this.battleConfig.p1Char || 'ignis';
    const p2Key = this.battleConfig.p2Char || 'lingShuang';
    const p1Data = Object.values(CHARACTERS).find(c => c.id === p1Key) || CHARACTERS.ignis;
    const p2Data = Object.values(CHARACTERS).find(c => c.id === p2Key) || CHARACTERS.lingShuang;

    // 创建角色
    this.p1 = new FighterBase(this, STAGE.P1_START_X, STAGE.GROUND_Y, p1Data, 0);
    this.p2 = new FighterBase(this, STAGE.P2_START_X, STAGE.GROUND_Y, p2Data, 1);

    // 保存角色数据引用
    this.p1Data = p1Data;
    this.p2Data = p2Data;

    // 创建输入
    this.input1 = new InputManager(this, 0);
    // 根据模式配置决定 P2 是 AI 还是玩家
    this.useAI = this.battleConfig.useAI !== false;
    this.input2 = this.useAI ? new AIController(this, 'normal') : new InputManager(this, 1);

    // 创建 HUD
    this.hud = new BattleHUD(this);
    this.hud.setNames(p1Data, p2Data);

    // 对战状态
    this.roundNumber = 1;
    this.p1Wins = 0;
    this.p2Wins = 0;
    this.roundTimer = BATTLE.ROUND_TIME;
    this.battleState = 'intro'; // intro, fighting, roundEnd, matchEnd
    this.lastTime = 0;

    // 屏幕震动
    this.shakeIntensity = 0;
    this.originalCamX = this.cameras.main.scrollX;
    this.originalCamY = this.cameras.main.scrollY;

    // 地面线
    this.add.rectangle(640, STAGE.GROUND_Y + 10, 1280, 4, 0x444444).setDepth(1);

    // 操作提示
    this.createControlsHint();

    // 触屏控制（仅在触屏设备或 ?touch=1 时显示）
    this.touchControls = new TouchControls(this, this.input1);

    // 开始新回合
    this.startRound();

    console.log('🥊 战斗场景已加载！');
    console.log('🎮 P1 操作: WASD 移动 | J 轻攻 | K 重攻 | L 必杀 | U 防御');
    console.log('🎮 P2 操作: 方向键移动 | 小键盘1 轻攻 | 小键盘2 重攻 | 小键盘3 必杀 | 小键盘0 防御');
  }

  createAnimations() {
    // === 辅助方法：便捷生成动画序列 ===
    const createAnim = (key, atlasKey, frameNames, frameRate = 8, repeat = false) => {
      this.anims.create({
        key: key,
        frames: frameNames.map(f => ({ key: atlasKey, frame: f })),
        frameRate: frameRate,
        repeat: repeat ? -1 : 0,
        yoyo: repeat
      });
    };

    // === Ignis (伊格尼斯) 动画 — 4行x6列 ===
    createAnim('ignis_idle', 'ignis',
      ['ignis_idle_0','ignis_idle_1','ignis_idle_2','ignis_idle_3','ignis_idle_4','ignis_idle_5'], 8, true);
    createAnim('ignis_walk', 'ignis',
      ['ignis_walk_0','ignis_walk_1','ignis_walk_2','ignis_walk_3','ignis_walk_4','ignis_walk_5'], 10, true);
    createAnim('ignis_attack', 'ignis',
      ['ignis_attack_0','ignis_attack_1','ignis_attack_2','ignis_attack_3','ignis_attack_4','ignis_attack_5'], 14, false);
    createAnim('ignis_hit', 'ignis',
      ['ignis_hit_0','ignis_hit_1','ignis_hit_2'], 10, false);
    createAnim('ignis_knockdown', 'ignis',
      ['ignis_hit_3','ignis_hit_4','ignis_hit_5'], 8, false);
    createAnim('ignis_block', 'ignis',
      ['ignis_idle_0'], 10, false);

    // === Ling Shuang (凌霜) 动画 — 4行x6列（与 Ignis 一致）===
    createAnim('lingShuang_idle', 'lingshuang',
      ['lingshuang_idle_0','lingshuang_idle_1','lingshuang_idle_2','lingshuang_idle_3','lingshuang_idle_4','lingshuang_idle_5'], 8, true);
    createAnim('lingShuang_walk', 'lingshuang',
      ['lingshuang_walk_0','lingshuang_walk_1','lingshuang_walk_2','lingshuang_walk_3','lingshuang_walk_4','lingshuang_walk_5'], 10, true);
    createAnim('lingShuang_attack', 'lingshuang',
      ['lingshuang_attack_0','lingshuang_attack_1','lingshuang_attack_2','lingshuang_attack_3','lingshuang_attack_4','lingshuang_attack_5'], 14, false);
    createAnim('lingShuang_hit', 'lingshuang',
      ['lingshuang_hit_0','lingshuang_hit_1','lingshuang_hit_2'], 10, false);
    createAnim('lingShuang_knockdown', 'lingshuang',
      ['lingshuang_hit_3','lingshuang_hit_4','lingshuang_hit_5'], 8, false);
    createAnim('lingShuang_block', 'lingshuang',
      ['lingshuang_idle_0'], 10, false);
  }

  // 创建场景背景
  createBackground() {
    // 渐变背景（时空竞技场感）
    const bg = this.add.graphics();

    // 天空渐变
    for (let i = 0; i < 720; i++) {
      const t = i / 720;
      const r = Math.floor(10 + t * 20);
      const g = Math.floor(5 + t * 15);
      const b = Math.floor(30 + t * 40);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      bg.fillRect(0, i, 1280, 1);
    }
    bg.setDepth(0);

    // 柱子装饰
    for (let i = 0; i < 6; i++) {
      const x = 100 + i * 220;
      const pillar = this.add.graphics();
      pillar.fillStyle(0x332244, 0.6);
      pillar.fillRect(x, 200, 30, STAGE.GROUND_Y - 200);
      pillar.fillRect(x - 5, 195, 40, 10);
      pillar.fillRect(x - 5, STAGE.GROUND_Y - 5, 40, 10);
      pillar.setDepth(0);
    }

    // 地面
    const ground = this.add.graphics();
    ground.fillStyle(0x1a1520, 1);
    ground.fillRect(0, STAGE.GROUND_Y, 1280, 140);
    // 地面纹理线
    for (let i = 0; i < 32; i++) {
      ground.fillStyle(0x221830, 1);
      ground.fillRect(i * 40, STAGE.GROUND_Y + 2, 2, 140);
    }
    ground.setDepth(0);

    // 能量粒子效果
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, 1280),
        Phaser.Math.Between(100, STAGE.GROUND_Y - 50),
        Phaser.Math.Between(1, 3),
        0x6644aa, 0.3
      ).setDepth(0);

      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(50, 150),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        onRepeat: () => {
          particle.x = Phaser.Math.Between(0, 1280);
          particle.y = Phaser.Math.Between(300, STAGE.GROUND_Y);
          particle.alpha = 0.3;
        },
      });
    }
  }

  // 创建操作提示
  createControlsHint() {
    const style = { fontSize: '11px', fontFamily: 'Arial', color: '#888888', lineSpacing: 4 };

    this.add.text(10, 650, 'P1: WASD移动 J轻攻 K重攻 L必杀 U防御', style).setDepth(110);
    this.add.text(1270, 650, 'P2: 方向键移动 小键盘1/2/3攻击 0防御', style).setOrigin(1, 0).setDepth(110);
  }

  // 开始新回合
  startRound() {
    this.battleState = 'intro';
    this.roundTimer = BATTLE.ROUND_TIME;

    // 重置角色
    this.p1.reset(STAGE.P1_START_X);
    this.p2.reset(STAGE.P2_START_X);
    this.hud.resetGhostHP();
    this.hud.updateRounds(this.p1Wins, this.p2Wins);

    // 回合开始演出
    this.hud.showAnnounce(`ROUND ${this.roundNumber}`, 1000);
    this.time.delayedCall(1500, () => {
      this.hud.showAnnounce('FIGHT!', 500);
      this.time.delayedCall(700, () => {
        this.battleState = 'fighting';
      });
    });
  }

  // 回合结束
  endRound(winner) {
    this.battleState = 'roundEnd';

    if (winner === 1) {
      this.p1Wins++;
      this.p1.changeState(STATES.WIN);
    } else if (winner === 2) {
      this.p2Wins++;
      this.p2.changeState(STATES.WIN);
    }

    this.hud.updateRounds(this.p1Wins, this.p2Wins);
    this.hud.showAnnounce('KO!', 1500);

    this.time.delayedCall(2500, () => {
      // 检查是否有人赢得比赛
      if (this.p1Wins >= BATTLE.ROUNDS_TO_WIN) {
        this.endMatch(1);
      } else if (this.p2Wins >= BATTLE.ROUNDS_TO_WIN) {
        this.endMatch(2);
      } else {
        this.roundNumber++;
        this.startRound();
      }
    });
  }

  // 比赛结束
  endMatch(winner) {
    this.battleState = 'matchEnd';
    const winnerName = winner === 1 ? this.p1Data.name : this.p2Data.name;
    this.hud.showAnnounce(`${winnerName} WINS!`, 3000);

    // 4 秒后返回主菜单
    this.time.delayedCall(4000, () => {
      this.scene.start('MainMenuScene');
    });
  }

  update(time, delta) {
    // 战斗外禁用输入
    const isFighting = this.battleState === 'fighting';
    
    // 如果不是战斗状态，清空输入
    if (!isFighting) {
      this.input1.clearTouchActions();
      this.input2.clearTouchActions();
      // 这里可以替换为一个伪造的空 InputManager 或者直接在 FighterBase 中判断
    }

    // 只有战斗中才更新计时器
    if (this.battleState === 'fighting') {
      this.roundTimer -= delta / 1000;
      if (this.roundTimer <= 0) {
        this.roundTimer = 0;
        // 时间到 — 血量多的获胜
        const winner = this.p1.hp > this.p2.hp ? 1 : this.p2.hp > this.p1.hp ? 2 : 0;
        if (winner > 0) {
          this.endRound(winner);
        } else {
          // 平局 — 额外回合
          this.roundNumber++;
          this.startRound();
        }
      }
    }

    // 角色更新需要传入真实的输入状态，但如果不是 fighting，传入一个空输入
    const emptyInput = {
      getState: () => ({ left: false, right: false, up: false, down: false, light: false, heavy: false, special: false, block: false }),
      checkSpecialInput: () => null
    };

    const p1Input = isFighting ? this.input1 : emptyInput;
    const p2Input = isFighting ? this.input2 : emptyInput;

    // AI 决策
    if (isFighting && this.useAI && this.input2.think) {
      this.input2.think(this.p2, this.p1);
    }

    this.p1.update(p1Input, this.p2);
    this.p2.update(p2Input, this.p1);

    // 角色推挤
    this.handlePushback();

    // 命中检测
    this.checkHits();

    // 屏幕震动
    this.updateScreenShake();

    // 更新 HUD
    this.hud.updateHP(this.p1, this.p2);
    this.hud.updateRage(this.p1, this.p2);
    this.hud.updateTimer(this.roundTimer);
    this.hud.showCombo(0, this.p2.comboCount); // P1 打出的连击显示在 P1 侧
    this.hud.showCombo(1, this.p1.comboCount);

    // 清除触屏单次输入
    this.input1.clearTouchActions();
    this.input2.clearTouchActions();
  }

  // 角色推挤
  handlePushback() {
    const dist = Math.abs(this.p1.x - this.p2.x);
    if (dist < 40) {
      const overlap = (40 - dist) / 2;
      
      // 不仅推开，还要检查边界，防止一方把另一方无限推出版边
      let p1Push = 0;
      let p2Push = 0;

      if (this.p1.x < this.p2.x) {
        p1Push = -overlap;
        p2Push = overlap;
      } else {
        p1Push = overlap;
        p2Push = -overlap;
      }

      // 如果 P1 到达左边界，增加 P2 的推挤幅度
      if (this.p1.x + p1Push < STAGE.LEFT_BOUNDARY) {
        this.p2.x += Math.abs(p1Push); // 把剩下的推力全部给 p2
        this.p1.x = STAGE.LEFT_BOUNDARY;
      } 
      // 如果 P2 到达右边界，增加 P1 的推挤幅度
      else if (this.p2.x + p2Push > STAGE.RIGHT_BOUNDARY) {
        this.p1.x -= Math.abs(p2Push);
        this.p2.x = STAGE.RIGHT_BOUNDARY;
      } 
      else {
        this.p1.x += p1Push;
        this.p2.x += p2Push;
      }
    }
  }

  // 命中检测
  checkHits() {
    // P1 攻击 P2
    const p1Hitboxes = this.p1.getActiveHitboxes();
    const p2Hurtbox = this.p2.getHurtbox();
    for (const hb of p1Hitboxes) {
      if (this.rectOverlap(hb, p2Hurtbox)) {
        this.onHit(this.p1, this.p2, hb);
        break;
      }
    }

    // P2 攻击 P1
    const p2Hitboxes = this.p2.getActiveHitboxes();
    const p1Hurtbox = this.p1.getHurtbox();
    for (const hb of p2Hitboxes) {
      if (this.rectOverlap(hb, p1Hurtbox)) {
        this.onHit(this.p2, this.p1, hb);
        break;
      }
    }
  }

  // 矩形碰撞检测
  rectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // 命中处理
  onHit(attacker, defender, hitData) {
    attacker.hitThisAttack = true;
    const result = defender.takeHit(hitData, attacker.data.element);

    if (result === 'hit' || result === 'ko') {
      // 增加连击
      attacker.comboCount++;
      attacker.comboTimer = 30;

      // 攻击者获得怒气
      attacker.addRage(8);

      // 打击感效果
      const isSpecial = attacker.state === STATES.SPECIAL1 || attacker.state === STATES.SPECIAL2;
      const isHeavy = attacker.state === STATES.ATTACK_HEAVY;

      // Hit Stop
      const stopFrames = isSpecial ? JUICE.HITSTOP_SPECIAL : isHeavy ? JUICE.HITSTOP_HEAVY : JUICE.HITSTOP_LIGHT;
      attacker.hitStopFrames = stopFrames;
      defender.hitStopFrames = stopFrames;

      // 屏幕震动
      const shakeAmount = isSpecial ? JUICE.SHAKE_SPECIAL : isHeavy ? JUICE.SHAKE_HEAVY : JUICE.SHAKE_LIGHT;
      this.shakeIntensity = shakeAmount;

      // 命中特效 — 闪光 + 粒子
      const hitLevel = isSpecial ? 'special' : isHeavy ? 'heavy' : 'light';
      this.createHitEffect(defender.x, defender.y - 40, attacker.data.color, hitLevel);

      // 伤害数字弹出
      const dmg = hitData.damage || 10;
      this.showDamageNumber(defender.x, defender.y - 60, dmg, attacker.comboCount, attacker.data.color);

      if (result === 'ko') {
        this.endRound(attacker.playerIndex === 0 ? 1 : 2);
      }
    } else if (result === 'blocked') {
      // 防御特效
      this.shakeIntensity = 2;
      this.createBlockEffect(defender.x + defender.facing * 20, defender.y - 40);
    }
  }

  // 命中特效
  createHitEffect(x, y, color, level = 'light') {
    // 闪光圆
    const flash = this.add.circle(x, y, 5, 0xffffff, 1).setDepth(50);
    this.tweens.add({
      targets: flash,
      scale: level === 'special' ? 8 : level === 'heavy' ? 5 : 4,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    // 彩色冲击波
    const impact = this.add.circle(x, y, 3, color, 0.8).setDepth(50);
    this.tweens.add({
      targets: impact,
      scale: level === 'special' ? 10 : level === 'heavy' ? 7 : 6,
      alpha: 0,
      duration: 300,
      onComplete: () => impact.destroy(),
    });

    // 必杀技环形冲击波
    if (level === 'special') {
      const ring = this.add.circle(x, y, 5).setStrokeStyle(3, color, 0.8).setDepth(50);
      this.tweens.add({
        targets: ring,
        scale: 15,
        alpha: 0,
        duration: 500,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy(),
      });
    }

    // 粒子飞溅（数量随攻击等级增加）
    const count = level === 'special' ? 16 : level === 'heavy' ? 10 : 6;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Phaser.Math.FloatBetween(-0.3, 0.3);
      const speed = Phaser.Math.Between(3, level === 'special' ? 14 : 8);
      const size = Phaser.Math.Between(1, level === 'special' ? 5 : 3);
      const particle = this.add.circle(x, y, size, color, 1).setDepth(50);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed * 25,
        y: y + Math.sin(angle) * speed * 25,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(200, 400),
        onComplete: () => particle.destroy(),
      });
    }

    // 屏幕边缘闪光（必杀技时）
    if (level === 'special') {
      const vignette = this.add.rectangle(640, 360, 1280, 720, color, 0.15).setDepth(100);
      this.tweens.add({
        targets: vignette,
        alpha: 0,
        duration: 300,
        onComplete: () => vignette.destroy(),
      });
    }
  }

  // 伤害数字弹出
  showDamageNumber(x, y, damage, comboCount, color) {
    const isCombo = comboCount > 1;
    const fontSize = isCombo ? Math.min(16 + comboCount * 3, 36) : 18;
    const displayText = isCombo ? `${damage} x${comboCount}` : `${damage}`;
    
    const dmgText = this.add.text(x + Phaser.Math.Between(-20, 20), y, displayText, {
      fontSize: `${fontSize}px`,
      fontFamily: 'Arial Black, Arial',
      fontStyle: 'bold',
      color: isCombo ? '#ffdd00' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    // 弹出动画：向上浮动 + 淡出
    this.tweens.add({
      targets: dmgText,
      y: y - 60,
      alpha: 0,
      scale: isCombo ? 1.3 : 1.0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => dmgText.destroy(),
    });
  }

  // 防御特效
  createBlockEffect(x, y) {
    const shield = this.add.circle(x, y, 3, 0x88aaff, 0.6).setDepth(50);
    this.tweens.add({
      targets: shield,
      scale: 3,
      alpha: 0,
      duration: 200,
      onComplete: () => shield.destroy(),
    });
  }

  // 屏幕震动更新
  updateScreenShake() {
    if (this.shakeIntensity > 0) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.cameras.main.setScroll(offsetX, offsetY);
      this.shakeIntensity *= 0.85;
      if (this.shakeIntensity < 0.5) {
        this.shakeIntensity = 0;
        this.cameras.main.setScroll(0, 0);
      }
    }
  }
}
