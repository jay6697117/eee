# Phaser — 版本参考

| 字段 | 值 |
|------|-----|
| **游戏框架** | Phaser 3.90.0 (Tsugumi) |
| **构建工具** | Vite (latest) |
| **项目锁定日期** | 2026-03-25 |
| **LLM 知识截止** | 2025 年 5 月 |
| **风险等级** | 🟡 中等 — 版本在 LLM 训练数据边缘 |

## 版本说明

Phaser v3.90.0 "Tsugumi" 于 2025 年 5 月 23 日发布，处于 LLM 训练数据的边缘。
大部分 API 在训练数据范围内，但最新的性能优化和 bug 修复可能不在覆盖范围中。

Phaser 4.0 目前处于 Release Candidate 阶段（RC6，2025-12-23），暂不采用。

## 关键 API 参考

### 常用场景生命周期
```javascript
class MyScene extends Phaser.Scene {
  preload() {}  // 加载资源
  create() {}   // 初始化对象
  update() {}   // 每帧更新（游戏循环）
}
```

### 帧动画（格斗游戏核心）
```javascript
// 创建帧动画
this.anims.create({
  key: 'idle',
  frames: this.anims.generateFrameNumbers('fighter', { start: 0, end: 5 }),
  frameRate: 10,
  repeat: -1
});

// 播放动画
sprite.anims.play('idle', true);
```

### Arcade 物理 / 碰撞检测
```javascript
// 碰撞检测（命中判定）
this.physics.add.overlap(attackHitbox, opponent, onHit);
```

### 输入处理
```javascript
// 键盘
this.input.keyboard.on('keydown-SPACE', callback);
const cursors = this.input.keyboard.createCursorKeys();

// 触屏
this.input.on('pointerdown', callback);
```

## 注意事项

- 在不确定 API 是否有变化时，优先参考 Phaser 官方文档
- 格斗游戏的帧精度很重要，使用 `scene.time.delayedCall()` 而非 `setTimeout`
- 移动端必须处理 `visibilitychange` 事件以暂停游戏
