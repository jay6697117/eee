# 技术偏好配置

## 引擎和语言

| 项目 | 值 |
|------|-----|
| **框架** | Phaser 3.90.0 |
| **语言** | JavaScript (ES Modules) |
| **构建工具** | Vite |
| **物理引擎** | Arcade Physics（Phaser 内置）|
| **目标平台** | 网页 / PC / 手机（响应式）|

## 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 文件名 | camelCase | `playerController.js` |
| 类名 | PascalCase | `FighterBase` |
| 函数名 | camelCase | `handleAttack()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_HEALTH` |
| CSS 类名 | kebab-case | `health-bar` |
| 场景类 | PascalCase + Scene 后缀 | `BattleScene` |
| 组件目录 | 功能分组 | `src/fighters/`, `src/scenes/` |

## 项目结构

```
eee/
├── index.html              # 入口 HTML
├── package.json            # 依赖管理
├── vite.config.js          # Vite 配置
├── src/
│   ├── main.js             # 游戏入口
│   ├── scenes/             # Phaser 场景
│   │   ├── BootScene.js    # 启动/加载场景
│   │   ├── MenuScene.js    # 主菜单
│   │   ├── SelectScene.js  # 角色选择
│   │   ├── BattleScene.js  # 战斗场景
│   │   └── TrainScene.js   # 训练模式
│   ├── fighters/           # 角色类
│   │   ├── FighterBase.js  # 角色基类
│   │   ├── Ignis.js        # 🔥 伊格尼斯
│   │   ├── LingShuang.js   # ❄️ 凌霜
│   │   ├── Neo.js          # ⚡ 奈欧
│   │   ├── Marine.js       # 🌊 玛琳
│   │   ├── Sakura.js       # 🌪️ 樱
│   │   ├── Gaia.js         # 🪨 盖亚
│   │   ├── Selene.js       # ✨ 赛勒涅
│   │   └── Lilith.js       # 🌑 莉莉丝
│   ├── systems/            # 游戏系统
│   │   ├── CombatSystem.js # 战斗/连招系统
│   │   ├── ElementSystem.js# 元素克制/互动
│   │   ├── RageSystem.js   # 怒气/觉醒系统
│   │   └── InputManager.js # 输入管理（键盘+触屏）
│   ├── ui/                 # UI 组件
│   │   ├── HealthBar.js    # 血条
│   │   ├── RageGauge.js    # 怒气槽
│   │   └── TouchControls.js# 触屏虚拟按键
│   └── utils/              # 工具函数
│       ├── constants.js    # 全局常量
│       └── helpers.js      # 辅助函数
├── public/
│   └── assets/             # 静态资源
│       ├── sprites/        # 角色精灵帧
│       ├── backgrounds/    # 场景背景
│       ├── audio/          # 音效和 BGM
│       └── ui/             # UI 元素
└── design/
    └── gdd/
        └── game-concept.md # 游戏概念文档
```

## 性能预算

| 指标 | 目标值 |
|------|--------|
| 帧率 | 60fps（16.6ms/帧）|
| 首屏加载 | < 3 秒 |
| 打击停顿 (Hit Stop) | 3-5 帧 |
| 输入延迟 | < 50ms |
| 包体大小 | < 20MB（不含美术资源）|

## 禁止的模式

- ❌ 不使用 jQuery 或其他 DOM 操作库
- ❌ 不在游戏循环中创建新对象（用对象池）
- ❌ 不使用 `setInterval` / `setTimeout` 做游戏逻辑（用 Phaser 的计时器）
- ❌ 不硬编码角色数值（全部提取到配置文件）
