# 角色状态系统 (Character State System)

> **状态**: 已设计
> **最后更新**: 2026-03-25
> **服务支柱**: 上手即爽 / 视觉轰炸

## 概述

角色状态系统是整个游戏的根基，负责管理每个格斗角色的核心属性（生命值、位置、朝向）和行为状态机（站立、移动、跳跃、攻击、受伤、倒地等）。所有上层系统（战斗、连招、觉醒）都依赖此系统提供的状态信息来决策。

## 玩家体验

玩家不会直接"感知"角色状态系统，但会通过**流畅的动作切换**和**精准的操控响应**间接体验到它。角色对输入的即时反馈、打击时的状态冻结、被击中后的硬直感，这些都是状态系统在幕后工作的成果。

## 详细设计

### 核心属性

```javascript
// 角色核心属性
{
  hp: 1000,           // 生命值
  maxHp: 1000,        // 最大生命值
  position: { x, y }, // 位置坐标
  velocity: { x, y }, // 速度向量
  facing: 1,          // 朝向（1=右，-1=左）
  isGrounded: true,   // 是否在地面
  state: 'IDLE',      // 当前状态
  stateTimer: 0,      // 状态持续时间（帧）
  stunTimer: 0,       // 硬直剩余时间（帧）
  invincible: false,  // 无敌状态
}
```

### 状态机

| 状态 | 说明 | 可转换到 | 优先级 |
|------|------|----------|--------|
| `IDLE` | 站立待机 | WALK, JUMP_UP, CROUCH, ATTACK_*, BLOCK, HIT, KO | 1（最低）|
| `WALK` | 地面行走 | IDLE, JUMP_UP, CROUCH, ATTACK_*, BLOCK, HIT, KO | 2 |
| `JUMP_UP` | 上升中 | JUMP_FALL, AIR_ATTACK, HIT, KO | 3 |
| `JUMP_FALL` | 下落中 | LAND, AIR_ATTACK, HIT, KO | 3 |
| `LAND` | 着地恢复（4帧） | IDLE | 4 |
| `CROUCH` | 蹲下 | IDLE, CROUCH_ATTACK, BLOCK_LOW, HIT, KO | 2 |
| `ATTACK_LIGHT` | 轻攻击 | IDLE, ATTACK_HEAVY, SPECIAL（取消窗口） | 5 |
| `ATTACK_HEAVY` | 重攻击 | IDLE, SPECIAL（取消窗口） | 5 |
| `AIR_ATTACK` | 空中攻击 | JUMP_FALL | 5 |
| `CROUCH_ATTACK` | 蹲攻击 | CROUCH | 5 |
| `SPECIAL` | 必杀技 | IDLE（动画结束后） | 6 |
| `SUPER` | 超必杀技 | IDLE（动画结束后） | 7 |
| `BLOCK` | 站立防御 | IDLE, BLOCK_STUN | 4 |
| `BLOCK_LOW` | 蹲防 | CROUCH, BLOCK_STUN | 4 |
| `BLOCK_STUN` | 防御硬直 | IDLE, CROUCH | 5 |
| `HIT` | 受击硬直 | IDLE, HIT, KO | 8 |
| `LAUNCH` | 被挑空 | JUGGLE | 8 |
| `JUGGLE` | 空中被连击 | KNOCKDOWN | 8 |
| `KNOCKDOWN` | 倒地 | GETUP | 9 |
| `GETUP` | 起身（无敌） | IDLE | 9 |
| `KO` | 击败 | 无（回合结束） | 10（最高）|

### 状态转换规则

```
1. 优先级高的状态可以打断优先级低的状态
2. HIT/KO 可以打断任何非 KO 状态（受击优先）
3. ATTACK 状态有"取消窗口"——命中特定帧可以取消为更高级招式
4. BLOCK 只在非攻击状态且按住防御键时进入
5. GETUP 状态有 8 帧无敌时间
6. KNOCKDOWN 倒地有最低 20 帧持续时间
```

### 与其他系统交互

| 系统 | 数据流向 | 说明 |
|------|----------|------|
| 输入系统 → 本系统 | 输入 | 接收按键事件，驱动状态转换 |
| 本系统 → 战斗系统 | 输出 | 提供当前状态，决定是否可攻击/可受击 |
| 本系统 → 动画系统 | 输出 | 状态变化触发动画切换 |
| 战斗系统 → 本系统 | 输入 | 命中/伤害事件修改 hp 和状态 |
| 怒气系统 → 本系统 | 输入 | 觉醒模式修改属性倍率 |
| 本系统 → 战斗 UI | 输出 | hp 变化驱动血条更新 |

## 公式

```
伤害应用: hp = max(0, hp - finalDamage)
硬直时间: stunFrames = baseDamage * 0.3 + hitType.stunBonus
击退距离: knockback = baseDamage * 0.2 * facing * -1
```

## 边界情况

| 情况 | 处理 |
|------|------|
| hp 降到 0 | 立即进入 KO 状态，无视当前任何状态 |
| 两人同时 KO | 判为平局，进入额外回合 |
| 攻击和受击同帧 | 先判定攻击方命中，再判定防御方反应 |
| 空中被连击超过 5 次 | 自动进入 KNOCKDOWN 防止无限浮空连 |
| 被推到场景边界 | 位置钳制在边界内，不穿墙 |

## 调优参数

| 参数 | 默认值 | 范围 | 说明 |
|------|--------|------|------|
| `BASE_HP` | 1000 | 500-2000 | 基础生命值 |
| `GETUP_INVINCIBLE_FRAMES` | 8 | 4-12 | 起身无敌帧数 |
| `KNOCKDOWN_MIN_FRAMES` | 20 | 10-30 | 最低倒地时间 |
| `MAX_JUGGLE_HITS` | 5 | 3-8 | 最大浮空连击数 |
| `LAND_RECOVERY_FRAMES` | 4 | 2-6 | 着地恢复帧数 |
| `WALK_SPEED` | 4 | 2-8 | 地面移动速度 |
| `JUMP_FORCE` | -15 | -10 ~ -20 | 跳跃初速度 |

## 验收标准

- [ ] 角色在所有状态间平滑切换，无卡顿
- [ ] 受击硬直和倒地时间符合配置
- [ ] 浮空连击有上限保护
- [ ] 起身有无敌帧
- [ ] hp 归零立即 KO
- [ ] 两人同时 KO 判平局
- [ ] 场景边界碰撞正常
