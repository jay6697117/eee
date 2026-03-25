import Phaser from 'phaser';
import { STATES, STAGE, PHYSICS, JUICE, COMBAT, COMBO_SCALING, COLORS } from '../config/constants.js';
import { ELEMENT_CHART } from '../config/characters.js';

// 角色基类 — 所有格斗角色的核心逻辑
export default class FighterBase {
  constructor(scene, x, y, charData, playerIndex) {
    this.scene = scene;
    this.data = charData;
    this.playerIndex = playerIndex;

    // 核心属性
    this.hp = charData.stats.hp;
    this.maxHp = charData.stats.hp;
    this.rage = 0;
    this.maxRage = 100;
    this.facing = playerIndex === 0 ? 1 : -1;

    // 物理属性
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = true;

    // 状态机
    this.state = STATES.IDLE;
    this.stateTimer = 0;
    this.attackFrame = 0;
    this.currentMove = null;
    this.canCancel = false;
    this.invincible = false;

    // 连击
    this.comboCount = 0;
    this.comboTimer = 0;
    this.hitThisAttack = false;

    // 觉醒
    this.isAwakened = false;
    this.awakenTimer = 0;

    // 打击感
    this.hitStopFrames = 0;
    this.flashTimer = 0;

    // 创建占位图形
    this.createVisuals();
  }

  // 创建角色视觉表现（使用真正的精灵图集）
  createVisuals() {
    // 差异化缩放：ignis 帧高 160px，lingshuang 帧高 128px
    // 目标角色显示高度约 180px，各自计算所需缩放
    const targetHeight = 180; // 场景高 720，角色约占 1/4
    const spriteScale = this.data.spriteScale || 1.4;

    // 创建主精灵
    const offsetY = this.data.spriteOffsetY || 0;
    this.sprite = this.scene.add.sprite(this.x, this.y + offsetY, this.data.id);
    this.sprite.setOrigin(0.5, 1); // 底部中心对齐
    this.sprite.setScale(spriteScale);
    this.sprite.setDepth(5); // 确保角色在背景之上
    this.spriteOffsetY = offsetY;

    // 如果是 P2，初始朝向左边我们需要水平翻转
    if (this.facing === -1) {
      this.sprite.setFlipX(true);
    }

    // 名字标签和元素图标已移至顶部 HUD，战斗中不再显示
    this.nameText = null;
    this.elementIcon = null;

    // 播放待机动画
    this.sprite.play(`${this.data.id}_idle`);
  }

  getElementEmoji() {
    const map = { fire: '🔥', ice: '❄️', thunder: '⚡', water: '🌊', wind: '🌪️', earth: '🪨', light: '✨', dark: '🌑' };
    return map[this.data.element] || '⭐';
  }

  // 播放对应状态的动画
  playStateAnimation() {
    const charId = this.data.id;
    let animKey = `${charId}_idle`;

    if (this.isAttacking()) {
      animKey = `${charId}_attack`;
    } else if (this.state === STATES.HIT || this.state === STATES.LAUNCH || this.state === STATES.JUGGLE) {
      animKey = `${charId}_hit`;
    } else if (this.state === STATES.KNOCKDOWN || this.state === STATES.GETUP) {
      animKey = `${charId}_knockdown`;
    } else if (this.state === STATES.WALK_FORWARD || this.state === STATES.WALK_BACKWARD) {
      animKey = `${charId}_walk`;
    } else if (this.state === STATES.BLOCK || this.state === STATES.BLOCK_STUN || this.state === STATES.BLOCK_LOW) {
      animKey = `${charId}_block`;
    } else if (this.state === STATES.JUMP_UP || this.state === STATES.JUMP_FALL || this.state === STATES.AIR_ATTACK) {
      animKey = `${charId}_jump`;
    } else if (this.state === STATES.CROUCH || this.state === STATES.CROUCH_ATTACK) {
      animKey = `${charId}_crouch`;
    }

    // 只有动画改变时才重新播放
    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey);
    }

    // 停顿效果处理
    if (this.hitStopFrames > 0) {
      this.sprite.anims.pause();
    } else {
      this.sprite.anims.resume();
    }

    // 受击闪白处理
    if (this.flashTimer > 0) {
      this.sprite.setTintFill(0xffffff);
    } else if (this.state === STATES.EX_SPECIAL1 || this.state === STATES.EX_SPECIAL2) {
      // EX 技能：元素色调闪烁
      const t = Date.now() % 200;
      this.sprite.setTint(t < 100 ? (this.data.color || 0xffaa00) : 0xffffff);
    } else if (this.isAwakened) {
      // 觉醒状态：持续元素色调发光
      this.sprite.setTint(this.data.color || 0xffaa00);
    } else {
      this.sprite.clearTint();
    }
  }

  // 判断是否在攻击状态
  isAttacking() {
    return [STATES.ATTACK_LIGHT, STATES.ATTACK_HEAVY, STATES.CROUCH_ATTACK,
            STATES.AIR_ATTACK, STATES.SPECIAL1, STATES.SPECIAL2,
            STATES.EX_SPECIAL1, STATES.EX_SPECIAL2, STATES.SUPER].includes(this.state);
  }

  // 判断是否可以行动
  canAct() {
    return [STATES.IDLE, STATES.WALK_FORWARD, STATES.WALK_BACKWARD, STATES.CROUCH].includes(this.state);
  }

  // 判断是否可以被攻击
  isVulnerable() {
    return !this.invincible && this.state !== STATES.KO && this.state !== STATES.GETUP;
  }

  // 更新每帧逻辑
  update(input, opponent) {
    // Hit Stop 期间暂停一切
    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      return;
    }

    // 闪白计时
    if (this.flashTimer > 0) this.flashTimer--;

    // 状态计时
    this.stateTimer++;

    // 觉醒状态计时
    if (this.isAwakened) {
      this.awakenTimer--;
      if (this.awakenTimer <= 0) {
        this.isAwakened = false;
      }
    }

    // 连击超时
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }

    // 自动面向对手
    if (this.canAct() && opponent) {
      this.facing = opponent.x > this.x ? 1 : -1;
    }

    // 状态机更新
    this.updateState(input, opponent);

    // 物理更新
    this.updatePhysics();

    // 更新精灵位置和朝向
    this.sprite.setPosition(this.x, this.y + (this.spriteOffsetY || 0));
    this.sprite.setFlipX(this.facing === -1);
    this.playStateAnimation();

    // 更新文字标签
    this.updateLabels();
  }

  // 状态机
  updateState(input, opponent) {
    const state = input.getState();

    switch (this.state) {
      case STATES.IDLE:
      case STATES.WALK_FORWARD:
      case STATES.WALK_BACKWARD:
        this.handleMovement(state, input);
        break;

      case STATES.CROUCH:
        if (!state.down) {
          this.changeState(STATES.IDLE);
        } else if (state.light) {
          this.startAttack('crouchLight', STATES.CROUCH_ATTACK);
        } else if (state.heavy) {
          this.startAttack('crouchHeavy', STATES.CROUCH_ATTACK);
        }
        if (state.block) this.changeState(STATES.BLOCK);
        break;

      case STATES.JUMP_UP:
        if (this.vy > 0) this.changeState(STATES.JUMP_FALL);
        if (state.light || state.heavy) this.startAttack('airAttack', STATES.AIR_ATTACK);
        break;

      case STATES.JUMP_FALL:
        if (this.isGrounded) this.changeState(STATES.IDLE);
        if (state.light || state.heavy) this.startAttack('airAttack', STATES.AIR_ATTACK);
        break;

      case STATES.ATTACK_LIGHT:
      case STATES.ATTACK_HEAVY:
      case STATES.CROUCH_ATTACK:
      case STATES.AIR_ATTACK:
      case STATES.SPECIAL1:
      case STATES.SPECIAL2:
      case STATES.EX_SPECIAL1:
      case STATES.EX_SPECIAL2:
        this.updateAttack(state, input);
        break;

      case STATES.BLOCK:
      case STATES.BLOCK_STUN:
        if (this.state === STATES.BLOCK && !state.block) {
          this.changeState(STATES.IDLE);
        }
        if (this.state === STATES.BLOCK_STUN && this.stateTimer >= this.blockStunDuration) {
          this.changeState(STATES.IDLE);
        }
        break;

      case STATES.HIT:
        if (this.stateTimer >= this.hitStunDuration) {
          this.changeState(STATES.IDLE);
        }
        break;

      case STATES.KNOCKDOWN:
        if (this.stateTimer >= 30) {
          this.changeState(STATES.GETUP);
        }
        break;

      case STATES.GETUP:
        this.invincible = true;
        if (this.stateTimer >= 8) {
          this.invincible = false;
          this.changeState(STATES.IDLE);
        }
        break;

      case STATES.KO:
        // 什么都不做
        break;
    }
  }

  // 处理移动输入
  handleMovement(state, input) {
    // 觉醒爆发检测：light + heavy 同时按下且怒气满
    if (state.light && state.heavy && this.rage >= COMBAT.AWAKEN_RAGE_COST && !this.isAwakened) {
      this.activateAwakening();
      return;
    }

    // 先检测必杀技指令
    const specialInput = input.checkSpecialInput(this.facing);
    if (specialInput === 'special1') {
      if (this.rage >= COMBAT.EX_RAGE_COST) {
        this.startAttack('exSpecial1', STATES.EX_SPECIAL1, true);
      } else {
        this.startAttack('special1', STATES.SPECIAL1);
      }
      return;
    }
    if (specialInput === 'special2') {
      if (this.rage >= COMBAT.EX_RAGE_COST) {
        this.startAttack('exSpecial2', STATES.EX_SPECIAL2, true);
      } else {
        this.startAttack('special2', STATES.SPECIAL2);
      }
      return;
    }

    // 攻击
    if (state.light) {
      this.startAttack('light', STATES.ATTACK_LIGHT);
      return;
    }
    if (state.heavy) {
      this.startAttack('heavy', STATES.ATTACK_HEAVY);
      return;
    }
    // 必杀技（EX 版优先）
    if (state.special) {
      if (this.rage >= COMBAT.EX_RAGE_COST) {
        this.startAttack('exSpecial1', STATES.EX_SPECIAL1, true);
      } else {
        this.startAttack('special1', STATES.SPECIAL1);
      }
      return;
    }

    // 防御
    if (state.block) {
      this.changeState(STATES.BLOCK);
      return;
    }

    // 跳跃
    if (state.up && this.isGrounded) {
      this.vy = this.data.stats.jumpForce;
      this.isGrounded = false;
      this.changeState(STATES.JUMP_UP);
      return;
    }

    // 蹲下
    if (state.down && this.isGrounded) {
      this.changeState(STATES.CROUCH);
      return;
    }

    // 移动
    if (state.right) {
      this.vx = this.data.stats.walkSpeed;
      this.changeState(this.facing === 1 ? STATES.WALK_FORWARD : STATES.WALK_BACKWARD);
    } else if (state.left) {
      this.vx = -this.data.stats.walkSpeed;
      this.changeState(this.facing === -1 ? STATES.WALK_FORWARD : STATES.WALK_BACKWARD);
    } else {
      this.vx = 0;
      if (this.state !== STATES.IDLE) this.changeState(STATES.IDLE);
    }
  }

  // 觉醒爆发
  activateAwakening() {
    this.isAwakened = true;
    this.awakenTimer = COMBAT.AWAKEN_DURATION;
    this.rage = 0;
    this.invincible = true;
    // 30 帧无敌后取消
    this.scene.time.delayedCall(500, () => {
      if (this.state !== STATES.KO) this.invincible = false;
    });
  }

  // 开始攻击
  startAttack(moveName, state, isEX = false) {
    const move = this.data.moves[moveName];
    if (!move) return;

    this.currentMove = move;
    this.changeState(state);
    this.attackFrame = 0;
    this.hitThisAttack = false;

    // EX 技能扣除怒气
    if (isEX) {
      this.rage = Math.max(0, this.rage - COMBAT.EX_RAGE_COST);
    }

    // 必杀技前进位移
    if (move.moveForward) {
      this.vx = this.facing * move.moveForward / (move.startup + move.active);
    }
  }

  // 更新攻击中状态
  updateAttack(state, input) {
    this.attackFrame++;
    const move = this.currentMove;
    if (!move) { this.changeState(STATES.IDLE); return; }

    const totalFrames = move.startup + move.active + move.recovery;

    // 取消窗口检测（命中后可以取消到更高级招式）
    if (this.hitThisAttack && this.attackFrame >= move.startup + move.active) {
      if (this.state === STATES.ATTACK_LIGHT && state.heavy) {
        this.startAttack('heavy', STATES.ATTACK_HEAVY);
        return;
      }
      const specialInput = input.checkSpecialInput(this.facing);
      if (specialInput && this.state !== STATES.SPECIAL1 && this.state !== STATES.SPECIAL2) {
        this.startAttack(specialInput, specialInput === 'special1' ? STATES.SPECIAL1 : STATES.SPECIAL2);
        return;
      }
    }

    // 攻击结束
    if (this.attackFrame >= totalFrames) {
      if (!this.isGrounded) {
        this.changeState(STATES.JUMP_FALL);
      } else {
        this.changeState(STATES.IDLE);
      }
      this.currentMove = null;
    }
  }

  // 获取当前攻击判定框(世界坐标)
  getActiveHitboxes() {
    if (!this.isAttacking() || !this.currentMove) return [];
    const move = this.currentMove;

    // 只在活跃帧期间有判定
    if (this.attackFrame < move.startup || this.attackFrame >= move.startup + move.active) return [];
    if (this.hitThisAttack) return []; // 已命中不重复判定

    return (move.hitboxes || []).map(hb => {
      // 觉醒状态下攻击力增强
      const awakenMult = this.isAwakened ? COMBAT.AWAKEN_ATK_MULT : 1;
      return {
        x: this.x + hb.x * this.facing,
        y: this.y + hb.y,
        w: hb.w,
        h: hb.h,
        damage: Math.floor(move.damage * awakenMult),
        hitstun: move.hitstun,
        blockstun: move.blockstun || 5,
        knockback: move.knockback || 3,
        isElement: move.element || false,
        type: move.type || 'mid',
      };
    });
  }

  // 获取受击判定框
  getHurtbox() {
    const isCrouching = this.state === STATES.CROUCH || this.state === STATES.CROUCH_ATTACK;
    return {
      x: this.x - 18,
      y: this.y + (isCrouching ? -50 : -80),
      w: 36,
      h: isCrouching ? 50 : 80,
    };
  }

  // 受击
  takeHit(hitData, attackerElement) {
    if (!this.isVulnerable()) return false;

    // 防御检查
    const isBlocking = this.state === STATES.BLOCK || this.state === STATES.BLOCK_STUN;
    if (isBlocking) {
      // 防御成功
      const chipDamage = Math.floor(hitData.damage * COMBAT.BLOCK_DAMAGE_RATE);
      this.hp = Math.max(0, this.hp - chipDamage);
      this.blockStunDuration = Math.floor(hitData.blockstun * 0.7);
      this.changeState(STATES.BLOCK_STUN);
      this.vx = -this.facing * hitData.knockback * 0.5;
      this.addRage(3);
      return 'blocked';
    }

    // 计算伤害
    const scaling = COMBO_SCALING[Math.min(this.comboCount, COMBO_SCALING.length - 1)];
    let damage = Math.floor(hitData.damage * scaling);

    // 觉醒状态下减伤
    if (this.isAwakened) {
      damage = Math.floor(damage * COMBAT.AWAKEN_DEF_MULT);
    }

    // 元素克制
    if (hitData.isElement && attackerElement) {
      if (ELEMENT_CHART[attackerElement]?.strongVs === this.data.element) {
        damage = Math.floor(damage * 1.2);
      }
    }

    this.hp = Math.max(0, this.hp - damage);
    this.flashTimer = 4;

    // 击退
    this.vx = -this.facing * hitData.knockback;

    // 怒气积累
    this.addRage(5);

    if (this.hp <= 0) {
      this.changeState(STATES.KO);
      return 'ko';
    }

    // 受击硬直
    this.hitStunDuration = hitData.hitstun;

    if (hitData.knockback >= 10) {
      this.changeState(STATES.KNOCKDOWN);
      this.vy = -8;
      this.isGrounded = false;
    } else {
      this.changeState(STATES.HIT);
    }

    return 'hit';
  }

  // 增加怒气
  addRage(amount) {
    this.rage = Math.min(this.maxRage, this.rage + amount);
  }

  // 物理更新
  updatePhysics() {
    // 重力
    if (!this.isGrounded) {
      this.vy += PHYSICS.GRAVITY;
      if (this.vy > PHYSICS.MAX_FALL_SPEED) this.vy = PHYSICS.MAX_FALL_SPEED;
    }

    // 应用速度
    this.x += this.vx;
    this.y += this.vy;

    // 地面碰撞
    if (this.y >= STAGE.GROUND_Y) {
      this.y = STAGE.GROUND_Y;
      this.vy = 0;
      this.isGrounded = true;
    }

    // 边界钳制
    this.x = Math.max(STAGE.LEFT_BOUNDARY, Math.min(STAGE.RIGHT_BOUNDARY, this.x));

    // 地面摩擦
    if (this.isGrounded && !this.canAct()) {
      this.vx *= PHYSICS.FRICTION;
      if (Math.abs(this.vx) < 0.5) this.vx = 0;
    }
  }

  // 切换状态
  changeState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this.stateTimer = 0;
  }

  // 更新标签位置（根据精灵实际显示高度动态定位）
  updateLabels() {
    const spriteH = this.sprite ? this.sprite.displayHeight : 120;
    if (this.nameText) {
      this.nameText.setPosition(this.x, this.y - spriteH - 5);
    }
    if (this.elementIcon) {
      this.elementIcon.setPosition(this.x, this.y - spriteH - 22);
    }
  }

  // 重置（新回合）
  reset(x) {
    this.x = x;
    this.y = STAGE.GROUND_Y;
    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHp;
    this.rage = 0;
    this.isGrounded = true;
    this.state = STATES.IDLE;
    this.stateTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.currentMove = null;
    this.hitThisAttack = false;
    this.invincible = false;
    this.isAwakened = false;
    this.hitStopFrames = 0;
    this.flashTimer = 0;
  }

  // 销毁
  destroy() {
    if (this.sprite) this.sprite.destroy();
    if (this.nameText) this.nameText.destroy();
    if (this.elementIcon) this.elementIcon.destroy();
  }
}
