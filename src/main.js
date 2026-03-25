import Phaser from 'phaser';

// 游戏配置
const config = {
  type: Phaser.AUTO, // 自动选择 WebGL 或 Canvas
  parent: 'game-container',
  // 游戏画布尺寸（16:9 格斗游戏标准比例）
  width: 1280,
  height: 720,
  // 缩放模式：适配屏幕大小
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // 物理引擎（用于碰撞检测和命中判定）
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false, // 开发时可设为 true 查看碰撞箱
    },
  },
  // 渲染配置
  render: {
    pixelArt: false, // 动漫风格不需要像素缩放
    antialias: true,
  },
  // 输入配置
  input: {
    touch: true,
    keyboard: true,
  },
  // 场景列表（后续添加）
  scene: [],
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 控制台输出确认信息
console.log('🥊 全女格斗 · 异时空格斗女神');
console.log(`📦 Phaser v${Phaser.VERSION}`);
console.log('🎮 游戏引擎初始化完成！');
