// 角色数据配置 — MVP 版本（2 角色）

export const CHARACTERS = {
  ignis: {
    id: 'ignis',
    name: '伊格尼斯',
    nameEn: 'Ignis',
    title: '罗马角斗士',
    element: 'fire',
    color: 0xff4422,       // 占位颜色
    accentColor: 0xff8844, // 强调色
    spriteScale: 1.2,      // 精灵缩放（帧高 160px × 1.2 = 显示 192px）

    // 基础属性
    stats: {
      hp: 1000,
      walkSpeed: 4.5,
      jumpForce: -14,
      weight: 1.1,
    },

    // 招式表
    moves: {
      light: {
        damage: 35, startup: 3, active: 2, recovery: 5,
        hitstun: 8, blockstun: 5, knockback: 3,
        hitboxes: [{ x: 40, y: -40, w: 50, h: 30 }],
      },
      heavy: {
        damage: 75, startup: 6, active: 3, recovery: 10,
        hitstun: 15, blockstun: 8, knockback: 6,
        hitboxes: [{ x: 35, y: -50, w: 60, h: 40 }],
      },
      crouchLight: {
        damage: 30, startup: 3, active: 2, recovery: 5,
        hitstun: 8, blockstun: 5, knockback: 2, type: 'low',
        hitboxes: [{ x: 30, y: -10, w: 50, h: 20 }],
      },
      crouchHeavy: {
        damage: 65, startup: 5, active: 3, recovery: 12,
        hitstun: 18, blockstun: 10, knockback: 8, type: 'low',
        hitboxes: [{ x: 25, y: -15, w: 70, h: 30 }],
      },
      airAttack: {
        damage: 45, startup: 4, active: 3, recovery: 8,
        hitstun: 10, blockstun: 6, knockback: 4,
        hitboxes: [{ x: 30, y: 10, w: 50, h: 40 }],
      },
      special1: {
        name: '烈焰角斗',
        damage: 130, startup: 8, active: 5, recovery: 15,
        hitstun: 20, blockstun: 12, knockback: 10, element: true,
        hitboxes: [{ x: 20, y: -60, w: 80, h: 60 }],
        moveForward: 120,
      },
      special2: {
        name: '火焰冲刺',
        damage: 110, startup: 6, active: 4, recovery: 12,
        hitstun: 18, blockstun: 10, knockback: 8, element: true,
        hitboxes: [{ x: 0, y: -40, w: 100, h: 40 }],
        moveForward: 200,
      },
    },
  },

  lingShuang: {
    id: 'lingShuang',
    name: '凌霜',
    nameEn: 'Ling Shuang',
    title: '中国功夫女侠',
    element: 'ice',
    color: 0x44ccff,
    accentColor: 0x88eeff,
    spriteScale: 1.2,      // 精灵缩放（帧高 160px × 1.2 = 显示 192px）

    stats: {
      hp: 950,
      walkSpeed: 3.5,
      jumpForce: -16,
      weight: 0.8,
    },

    moves: {
      light: {
        damage: 30, startup: 3, active: 2, recovery: 4,
        hitstun: 8, blockstun: 4, knockback: 2,
        hitboxes: [{ x: 35, y: -45, w: 45, h: 25 }],
      },
      heavy: {
        damage: 70, startup: 7, active: 3, recovery: 9,
        hitstun: 14, blockstun: 7, knockback: 5,
        hitboxes: [{ x: 30, y: -55, w: 55, h: 35 }],
      },
      crouchLight: {
        damage: 25, startup: 2, active: 2, recovery: 4,
        hitstun: 7, blockstun: 4, knockback: 2, type: 'low',
        hitboxes: [{ x: 30, y: -8, w: 45, h: 18 }],
      },
      crouchHeavy: {
        damage: 60, startup: 5, active: 3, recovery: 11,
        hitstun: 16, blockstun: 9, knockback: 7, type: 'low',
        hitboxes: [{ x: 25, y: -12, w: 65, h: 25 }],
      },
      airAttack: {
        damage: 40, startup: 3, active: 3, recovery: 7,
        hitstun: 10, blockstun: 5, knockback: 3,
        hitboxes: [{ x: 25, y: 5, w: 50, h: 35 }],
      },
      special1: {
        name: '寒冰掌',
        damage: 120, startup: 5, active: 6, recovery: 14,
        hitstun: 22, blockstun: 14, knockback: 8, element: true,
        hitboxes: [{ x: 30, y: -50, w: 70, h: 50 }],
        moveForward: 60,
      },
      special2: {
        name: '冰柱突刺',
        damage: 100, startup: 10, active: 4, recovery: 16,
        hitstun: 20, blockstun: 12, knockback: 12, element: true,
        hitboxes: [{ x: 0, y: -70, w: 120, h: 70 }],
        moveForward: 0,
      },
    },
  },

  neo: {
    id: 'neo',
    name: '奈欧',
    nameEn: 'Neo',
    title: '赛博忍者',
    element: 'thunder',
    color: 0xffee00,
    accentColor: 0xffff88,
    spriteScale: 1.2,

    stats: {
      hp: 880,
      walkSpeed: 5.5,
      jumpForce: -17,
      weight: 0.7,
    },

    moves: {
      light: {
        damage: 25, startup: 2, active: 2, recovery: 3,
        hitstun: 7, blockstun: 4, knockback: 2,
        hitboxes: [{ x: 40, y: -40, w: 40, h: 25 }],
      },
      heavy: {
        damage: 60, startup: 5, active: 3, recovery: 8,
        hitstun: 12, blockstun: 6, knockback: 5,
        hitboxes: [{ x: 35, y: -50, w: 55, h: 35 }],
      },
      crouchLight: {
        damage: 20, startup: 2, active: 2, recovery: 3,
        hitstun: 6, blockstun: 3, knockback: 1, type: 'low',
        hitboxes: [{ x: 35, y: -8, w: 45, h: 16 }],
      },
      crouchHeavy: {
        damage: 55, startup: 4, active: 3, recovery: 10,
        hitstun: 14, blockstun: 8, knockback: 6, type: 'low',
        hitboxes: [{ x: 25, y: -12, w: 60, h: 25 }],
      },
      airAttack: {
        damage: 35, startup: 3, active: 3, recovery: 6,
        hitstun: 9, blockstun: 5, knockback: 3,
        hitboxes: [{ x: 30, y: 8, w: 45, h: 35 }],
      },
      special1: {
        name: '雷光斩',
        damage: 100, startup: 4, active: 5, recovery: 12,
        hitstun: 18, blockstun: 10, knockback: 9, element: true,
        hitboxes: [{ x: 20, y: -55, w: 90, h: 55 }],
        moveForward: 160,
      },
      special2: {
        name: '影分身突',
        damage: 90, startup: 3, active: 6, recovery: 14,
        hitstun: 16, blockstun: 8, knockback: 6, element: true,
        hitboxes: [{ x: 0, y: -45, w: 110, h: 45 }],
        moveForward: 250,
      },
    },
  },
};

// 元素克制表
export const ELEMENT_CHART = {
  fire:    { strongVs: 'ice',     weakVs: 'water' },
  ice:     { strongVs: 'thunder', weakVs: 'fire' },
  thunder: { strongVs: 'water',   weakVs: 'ice' },
  water:   { strongVs: 'fire',    weakVs: 'thunder' },
  wind:    { strongVs: 'earth',   weakVs: null },
  earth:   { strongVs: 'thunder', weakVs: 'wind' },
  light:   { strongVs: 'dark',    weakVs: 'dark' },
  dark:    { strongVs: 'light',   weakVs: 'light' },
};
