# 角色数据系统 (Character Data System)

> **状态**: 已设计
> **最后更新**: 2026-03-25
> **服务支柱**: 个性鲜明 / 策略深度

## 概述

角色数据系统以 JSON 配置文件的形式定义每个角色的属性数值、招式表、元素属性和帧数据。所有角色共用同一套战斗引擎，通过数据差异化实现不同的战斗风格。

## 详细设计

### 角色配置结构

```javascript
{
  id: "ignis",
  name: "伊格尼斯",
  nameEn: "Ignis",
  title: "罗马角斗士",
  element: "fire",  // 元素属性
  
  // 基础属性
  stats: {
    hp: 1000,
    walkSpeed: 4,
    dashSpeed: 8,
    jumpForce: -15,
    weight: 1.0,      // 影响被击退距离
  },
  
  // 招式表
  moves: {
    lightAttack: { damage: 35, startup: 3, active: 2, recovery: 5, hitstun: 8, blockstun: 5, knockback: 3 },
    heavyAttack: { damage: 75, startup: 6, active: 3, recovery: 10, hitstun: 15, blockstun: 8, knockback: 6 },
    crouchLight: { damage: 30, startup: 3, active: 2, recovery: 5, hitstun: 8, blockstun: 5, type: "low" },
    crouchHeavy: { damage: 65, startup: 5, active: 3, recovery: 12, hitstun: 18, blockstun: 10, type: "low" },
    airAttack:   { damage: 45, startup: 4, active: 3, recovery: 8, hitstun: 10, blockstun: 6 },
    special1:    { damage: 130, startup: 8, active: 5, recovery: 15, hitstun: 20, element: true, name: "烈焰角斗" },
    special2:    { damage: 110, startup: 6, active: 4, recovery: 12, hitstun: 18, element: true, name: "火焰冲刺" },
    super:       { damage: 260, startup: 5, active: 10, recovery: 20, hitstun: 30, element: true, name: "火山爆发" },
  },
  
  // 精灵表路径
  spriteSheet: "assets/sprites/ignis.png",
  frameWidth: 128,
  frameHeight: 128,
  
  // 专属场景
  stageId: "colosseum",
}
```

### MVP 角色数据（2 角色）

#### 🔥 伊格尼斯 (Ignis) — 近距离压制型

| 属性 | 值 | 特点 |
|------|-----|------|
| HP | 1000 | 标准 |
| 移速 | 4.5 | 偏快 |
| 跳跃 | -14 | 偏低（地面战士） |
| 体重 | 1.1 | 偏重（不易被推） |
| 轻攻伤害 | 35 | 偏高 |
| 特点 | 高伤害、近距离、轻攻启动快 | 适合新手 |

#### ❄️ 凌霜 (Ling Shuang) — 反击控制型

| 属性 | 值 | 特点 |
|------|-----|------|
| HP | 950 | 偏低 |
| 移速 | 3.5 | 偏慢 |
| 跳跃 | -16 | 偏高（灵活） |
| 体重 | 0.8 | 较轻（易被推） |
| 防御硬直 | -30% | 防御恢复快 |
| 特点 | 低血量、高反击伤害、防反流 | 适合进阶 |

### 与其他系统交互

| 系统 | 数据流向 | 说明 |
|------|----------|------|
| 本系统 → 角色状态 | 初始化 | 提供初始属性值 |
| 本系统 → 战斗系统 | 查询 | 提供招式帧数据 |
| 本系统 → 动画系统 | 查询 | 提供精灵表信息 |
| 本系统 → 元素系统 | 查询 | 提供角色元素属性 |
| 本系统 → 选人 UI | 查询 | 提供角色名称/头像 |

## 验收标准

- [ ] 角色配置从 JSON 文件加载
- [ ] 两个角色的战斗风格明显不同
- [ ] 修改 JSON 无需改代码即可调整数值
- [ ] 新增角色只需新增 JSON 文件
