# 物理/碰撞系统 (Physics & Collision System)

> **状态**: 已设计
> **最后更新**: 2026-03-25
> **服务支柱**: 上手即爽

## 概述

管理重力、地面检测、角色推挤和舞台边界。提供命中判定框（Hitbox/Hurtbox）供战斗系统使用。格斗游戏的物理与开放世界不同——极其简单，但对帧精度要求极高。

## 详细设计

### 重力

```
每帧更新:
  velocity.y += GRAVITY        // 每帧加速
  velocity.y = min(velocity.y, MAX_FALL_SPEED)  // 限制最大下落速度
  position.y += velocity.y
```

### 地面检测

```
if (position.y >= GROUND_Y) {
  position.y = GROUND_Y
  velocity.y = 0
  isGrounded = true
} else {
  isGrounded = false
}
```

### 角色推挤（Push Box）

每个角色有一个**推挤碰撞箱**（Push Box），防止两个角色重叠：

```
如果 P1.pushBox 与 P2.pushBox 重叠:
  重叠量 = (P1.pushBox.right - P2.pushBox.left) / 2
  P1.position.x -= 重叠量
  P2.position.x += 重叠量
```

### 舞台边界

```
舞台宽度: 1280px
边界钳制: position.x = clamp(position.x, STAGE_LEFT, STAGE_RIGHT)
角落判定: 如果角色贴墙且被推挤，推挤完全由对方承受
```

### 碰撞箱类型

| 类型 | 颜色（调试） | 用途 |
|------|-------------|------|
| Push Box | 🟢 绿色 | 角色物理碰撞，防止重叠 |
| Hurt Box | 🔵 蓝色 | 可被攻击的区域（身体） |
| Hit Box | 🔴 红色 | 攻击判定区域（出招时出现） |

### 命中检测

```
每帧检测:
  for each P1.activeHitBox:
    for each P2.hurtBox:
      if (overlap(hitBox, hurtBox)):
        触发命中事件 → 传递给战斗系统
        标记此 hitBox 已命中（同一招不重复判定）
```

### 与其他系统交互

| 系统 | 数据流向 | 说明 |
|------|----------|------|
| 角色状态 → 本系统 | 输入 | 获取位置、速度进行物理更新 |
| 本系统 → 角色状态 | 输出 | 更新位置、isGrounded |
| 本系统 → 战斗系统 | 输出 | 命中检测结果 |
| 动画系统 → 本系统 | 输入 | 当前帧的碰撞箱数据 |

## 调优参数

| 参数 | 默认值 | 范围 | 说明 |
|------|--------|------|------|
| `GRAVITY` | 0.8 | 0.4-1.5 | 重力加速度（像素/帧²） |
| `MAX_FALL_SPEED` | 15 | 10-20 | 最大下落速度 |
| `GROUND_Y` | 600 | - | 地面 Y 坐标 |
| `STAGE_LEFT` | 50 | - | 舞台左边界 |
| `STAGE_RIGHT` | 1230 | - | 舞台右边界 |

## 验收标准

- [ ] 角色不会穿过地面
- [ ] 两角色不会重叠（推挤正常）
- [ ] 角色不会超出舞台边界
- [ ] 命中检测准确（hitBox 与 hurtBox 重叠即判定）
- [ ] 同一攻击不会重复命中
- [ ] 调试模式可显示所有碰撞箱
