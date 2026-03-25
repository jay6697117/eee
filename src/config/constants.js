// 游戏全局常量
export const GAME = {
  WIDTH: 1280,
  HEIGHT: 720,
  FPS: 60,
};

// 舞台设置
export const STAGE = {
  GROUND_Y: 580,        // 地面 Y 坐标
  LEFT_BOUNDARY: 50,    // 左边界
  RIGHT_BOUNDARY: 1230, // 右边界
  P1_START_X: 350,      // P1 初始位置
  P2_START_X: 930,      // P2 初始位置
};

// 物理常量
export const PHYSICS = {
  GRAVITY: 0.8,          // 重力加速度
  MAX_FALL_SPEED: 15,    // 最大下落速度
  FRICTION: 0.85,        // 地面摩擦
};

// 战斗常量
export const COMBAT = {
  BLOCK_DAMAGE_RATE: 0.1,     // 防御削血比例
  MIN_DAMAGE_SCALING: 0.5,    // 连招最低伤害倍率
  COMBO_TIMEOUT: 30,          // 连击超时（帧）
  INPUT_BUFFER_FRAMES: 6,     // 输入缓冲（帧）
  SIMULTANEOUS_TOLERANCE: 3,  // 同时按键容差（帧）
};

// 连招递减表
export const COMBO_SCALING = [
  1.0, 1.0, 0.95, 0.85, 0.75, 0.65, 0.5, 0.5, 0.5, 0.5,
];

// 打击感反馈
export const JUICE = {
  HITSTOP_LIGHT: 3,     // 轻攻击 Hit Stop 帧数
  HITSTOP_HEAVY: 5,     // 重攻击
  HITSTOP_SPECIAL: 8,   // 必杀技
  HITSTOP_SUPER: 12,    // 超必杀
  SHAKE_LIGHT: 2,       // 轻攻击震屏
  SHAKE_HEAVY: 5,       // 重攻击震屏
  SHAKE_SPECIAL: 10,    // 必杀技震屏
  SHAKE_SUPER: 20,      // 超必杀震屏
  FLASH_DURATION: 50,   // 受击闪白（ms）
};

// 对战规则
export const BATTLE = {
  ROUNDS_TO_WIN: 2,     // 胜利所需回合数
  ROUND_TIME: 60,       // 回合时间（秒）
  MAX_ROUNDS: 5,        // 最大回合数
  ROUND_START_DELAY: 2000, // 回合开始延迟（ms）
  KO_DELAY: 2000,       // KO 延迟（ms）
};

// 角色状态枚举
export const STATES = {
  IDLE: 'IDLE',
  WALK_FORWARD: 'WALK_FORWARD',
  WALK_BACKWARD: 'WALK_BACKWARD',
  JUMP_UP: 'JUMP_UP',
  JUMP_FALL: 'JUMP_FALL',
  CROUCH: 'CROUCH',
  ATTACK_LIGHT: 'ATTACK_LIGHT',
  ATTACK_HEAVY: 'ATTACK_HEAVY',
  CROUCH_ATTACK: 'CROUCH_ATTACK',
  AIR_ATTACK: 'AIR_ATTACK',
  SPECIAL1: 'SPECIAL1',
  SPECIAL2: 'SPECIAL2',
  SUPER: 'SUPER',
  BLOCK: 'BLOCK',
  BLOCK_STUN: 'BLOCK_STUN',
  HIT: 'HIT',
  LAUNCH: 'LAUNCH',
  KNOCKDOWN: 'KNOCKDOWN',
  GETUP: 'GETUP',
  KO: 'KO',
  WIN: 'WIN',
};

// 按键映射
export const KEYS = {
  P1: {
    LEFT: 'A',
    RIGHT: 'D',
    UP: 'W',
    DOWN: 'S',
    LIGHT: 'J',
    HEAVY: 'K',
    SPECIAL: 'L',
    BLOCK: 'U',
  },
  P2: {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN',
    LIGHT: 'NUMPAD_ONE',
    HEAVY: 'NUMPAD_TWO',
    SPECIAL: 'NUMPAD_THREE',
    BLOCK: 'NUMPAD_ZERO',
  },
};

// 颜色主题
export const COLORS = {
  // 元素颜色
  FIRE: 0xff4422,
  ICE: 0x44ccff,
  THUNDER: 0xffee00,
  WATER: 0x2266ff,
  WIND: 0x88ffaa,
  EARTH: 0xaa7744,
  LIGHT: 0xffffcc,
  DARK: 0x6622aa,
  // UI 颜色
  HP_HIGH: 0x44ff44,
  HP_MID: 0xffcc00,
  HP_LOW: 0xff2222,
  RAGE_COLOR: 0x8844ff,
  RAGE_FULL: 0xffaa00,
  BG_DARK: 0x0a0a0a,
};
