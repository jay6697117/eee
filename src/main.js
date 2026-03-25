import Phaser from 'phaser';
import MainMenuScene from './scenes/MainMenuScene.js';
import CharSelectScene from './scenes/CharSelectScene.js';
import BattleScene from './scenes/BattleScene.js';

// 游戏配置
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#0a0a0a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // 场景流程：主菜单 → 角色选择 → 战斗
  scene: [MainMenuScene, CharSelectScene, BattleScene],
  input: {
    touch: true,
    keyboard: true,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};

// 创建游戏实例
const game = new Phaser.Game(config);

console.log('🥊 全女格斗 · 异时空格斗女神');
console.log('🎮 游戏加载中...');
