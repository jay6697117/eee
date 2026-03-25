/**
 * AI 对手控制器
 * 模拟 InputManager 接口，提供 getState() 和 checkSpecialInput()
 * 使用基于距离和状态的简单决策树
 */
export default class AIController {
  constructor(scene, difficulty = 'normal') {
    this.scene = scene;
    this.difficulty = difficulty;

    // 决策参数（根据难度调整）
    const configs = {
      dummy:  { reactionDelay: 999, aggressiveness: 0, blockChance: 0, specialChance: 0 },
      easy:   { reactionDelay: 30, aggressiveness: 0.2, blockChance: 0.15, specialChance: 0.05 },
      normal: { reactionDelay: 15, aggressiveness: 0.4, blockChance: 0.30, specialChance: 0.10 },
      hard:   { reactionDelay: 5,  aggressiveness: 0.6, blockChance: 0.50, specialChance: 0.20 },
    };
    const cfg = configs[difficulty] || configs.normal;
    this.reactionDelay = cfg.reactionDelay;
    this.aggressiveness = cfg.aggressiveness;
    this.blockChance = cfg.blockChance;
    this.specialChance = cfg.specialChance;

    // 当前输入状态
    this.currentState = this.emptyState();

    // 内部计时器
    this.decisionTimer = 0;
    this.decisionInterval = 20; // 每隔多少帧做一次决策
    this.actionDuration = 0;   // 当前动作剩余帧数
    this.currentAction = 'idle';

    // 触屏接口占位（保持与 InputManager 一致）
    this.touchOverride = {};
  }

  // 空输入状态
  emptyState() {
    return {
      left: false, right: false, up: false, down: false,
      light: false, heavy: false, special: false, block: false
    };
  }

  /**
   * AI 决策更新 — 每帧由 BattleScene 调用
   * @param {FighterBase} self - AI 控制的角色
   * @param {FighterBase} opponent - 对手角色
   */
  think(self, opponent) {
    this.decisionTimer++;

    // 重置单次按键（light/heavy/special 只在按下那一帧为 true）
    this.currentState.light = false;
    this.currentState.heavy = false;
    this.currentState.special = false;

    // 动作持续中 — 不做新决策
    if (this.actionDuration > 0) {
      this.actionDuration--;
      return;
    }

    // 到达决策间隔 — 做新决策
    if (this.decisionTimer >= this.decisionInterval) {
      this.decisionTimer = 0;
      this.makeDecision(self, opponent);
    }
  }

  // 核心决策逻辑
  makeDecision(self, opponent) {
    // 计算与对手的距离
    const dist = Math.abs(self.x - opponent.x);
    const facingOpponent = (opponent.x > self.x) ? 1 : -1;
    const isOpponentAttacking = opponent.isAttacking();

    // 重置输入
    this.currentState = this.emptyState();

    // === 决策树 ===

    // 1. 对手正在攻击？尝试防御
    if (isOpponentAttacking && dist < 150) {
      if (Math.random() < this.blockChance) {
        this.setAction('block', 15);
        return;
      }
    }

    // 2. 近距离（攻击范围内）
    if (dist < 100) {
      const roll = Math.random();

      if (roll < this.aggressiveness) {
        // 攻击
        const attackRoll = Math.random();
        if (attackRoll < this.specialChance) {
          this.setAction('special', 1);
        } else if (attackRoll < 0.5) {
          this.setAction('light', 1);
        } else {
          this.setAction('heavy', 1);
        }
      } else if (roll < this.aggressiveness + 0.2) {
        // 后退保持距离
        this.setAction(facingOpponent === 1 ? 'walkLeft' : 'walkRight', 15);
      } else {
        // 站桩观察
        this.setAction('idle', 10);
      }
      return;
    }

    // 3. 中距离（需要接近）
    if (dist < 300) {
      const roll = Math.random();

      if (roll < this.aggressiveness + 0.2) {
        // 向对手移动
        this.setAction(facingOpponent === 1 ? 'walkRight' : 'walkLeft', 20);
      } else if (roll < this.aggressiveness + 0.4) {
        // 短暂观察后行动
        this.setAction('idle', 10);
      } else {
        // 随机移动
        this.setAction(Math.random() > 0.5 ? 'walkRight' : 'walkLeft', 10);
      }
      return;
    }

    // 4. 远距离（需要快速接近）
    if (facingOpponent === 1) {
      this.setAction('walkRight', 30);
    } else {
      this.setAction('walkLeft', 30);
    }
  }

  // 设置当前动作
  setAction(action, duration) {
    this.currentAction = action;
    this.actionDuration = duration;
    this.currentState = this.emptyState();

    switch (action) {
      case 'walkLeft':
        this.currentState.left = true;
        break;
      case 'walkRight':
        this.currentState.right = true;
        break;
      case 'light':
        this.currentState.light = true;
        break;
      case 'heavy':
        this.currentState.heavy = true;
        break;
      case 'special':
        this.currentState.special = true;
        break;
      case 'block':
        this.currentState.block = true;
        break;
      case 'jump':
        this.currentState.up = true;
        break;
      case 'idle':
      default:
        // 什么都不做
        break;
    }
  }

  // === 以下方法模拟 InputManager 接口 ===

  // 返回当前输入状态
  getState() {
    return { ...this.currentState };
  }

  // AI 不使用必杀技指令组合（通过 special 键代替）
  checkSpecialInput(facing) {
    if (this.currentState.special) {
      return 'special1';
    }
    return null;
  }

  // 触屏相关（AI 不使用，空实现）
  setTouchInput() {}
  clearTouchActions() {}
  destroy() {}
}
