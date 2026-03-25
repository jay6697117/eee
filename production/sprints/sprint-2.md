# Sprint 2 -- 2026-03-26 to 2026-04-09

## Sprint Goal
完善核心层（Layer 1），实现怒气机制深度（EX技能/觉醒）、元素异常状态（DOT/控制），并再扩展两名新角色补充阵容克制链。

## Capacity
- Total days: 14
- Buffer (20%): 3 天保留给突发 Bug 修复与平衡性调整
- Available: 11 天

## Tasks

### Must Have (Critical Path)
| ID | Task | Agent/Owner | Est. Days | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S2-01 | 怒气强化技 (EX Special) | Agent | 1.5 | 无 | 玩家可消耗 50% 怒气释放强化版必杀，附带特殊特效与增强判定 |
| S2-02 | 觉醒爆发系统 (Awakening) | Agent | 2.0 | S2-01 | 100%怒气时可触发，带全屏时停/特写，角色进入强化状态几秒 |
| S2-03 | 元素异常状态 (Status Effects) | Agent | 1.5 | 无 | 火(燃烧持续掉血)、冰(减速)、雷(短时麻痹硬直)机制生效并在 UI 显示对应图标 |
| S2-04 | 新角色加入：水属性法师 | Agent | 1.5 | 无 | 完成技能组、生成原画/精灵图、注册序列并在选人界面可选 |
| S2-05 | 新角色加入：地属性重装 | Agent | 1.5 | 无 | 完成技能组、生成原画/精灵图、注册序列并在选人界面可选 |

### Should Have
| ID | Task | Agent/Owner | Est. Days | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S2-06 | 浮空连段与伤害衰减 (Juggle & Scaling) | Agent | 1.5 | 无 | 重攻击可造成浮空，浮空后可追加连击，连击数越高单次伤害递减 |
| S2-07 | 多场景与视差视效扩展 | Agent | 1.0 | 无 | 新增 2 张对战地图（如赛博都市、寒冰圣殿），支持视差滚动 |

### Nice to Have
| ID | Task | Agent/Owner | Est. Days | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S2-08 | 高级 AI 对手 (Hard 难度) | Agent | 1.5 | 无 | AI 会根据玩家状态选择防御、反击或主动使用必杀消耗怒气 |
| S2-09 | 自定义按键绑定 UI | Agent | 1.0 | 无 | 设置菜单允许更改键盘按键并持久化保存至 localStorage |

## Carryover from Previous Sprint
| Task | Reason | New Estimate |
|------|--------|-------------|
| 触屏摇杆高分屏适配微调 | Sprint 1 发现高分辨率设备上摇杆拖动范围稍有偏移 | 0.5 天 |
| 动画缺失帧补全 (跳跃/蹲下) | Sprint 1 (S1-02) 被降级妥协，现需利用新脚本补齐 | 1.0 天 |

## Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| EX/觉醒特写特效导致 WebGL 性能骤降 | 中 | 高 | 限制同屏渲染粒子数，复杂特效使用整图动画而非实时演算 |
| 异常状态引入后带来"无限连/无限晕"破坏平衡 | 中 | 高 | 设定硬直保护阀值以及同种状态冷却时间免疫期 |
| 工作量过大（新增 2 角色+机制） | 高 | 中 | 如容量吃紧，将 S2-05 顺延至 Sprint 3 |

## Dependencies on External Factors
- 角色原画与精灵图生成工具 (AI 绘图) 可用且风格能保持一致

## Definition of Done for this Sprint
- [ ] All Must Have tasks completed
- [ ] All tasks pass acceptance criteria
- [ ] No S1 or S2 bugs in delivered features
- [ ] Design documents updated for any deviations
- [ ] Code reviewed and merged
