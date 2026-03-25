import cv2
import numpy as np
import json
import subprocess
import os
import tempfile

# 步骤 1：从 Git 恢复最纯净的 neo.png
subprocess.run(['git', 'checkout', 'public/assets/sprites/neo.png', 'public/assets/sprites/neo.json'], cwd='/Users/zhangjinhui/Desktop/eee')

# 步骤 2：读取原版 neo.png（它是 RGB 3通道，带有棋盘格背景）
img = cv2.imread('/Users/zhangjinhui/Desktop/eee/public/assets/sprites/neo.png')
print(f"原版 neo.png: {img.shape}")

# 步骤 3：精确识别棋盘格
# 棋盘格特征：交替的灰色方块，且方块大小固定（通常为8x8或16x16像素）
# 我们可以通过检测局部区域的方差来识别——角色区域有丰富色彩，棋盘格区域只有两种灰色交替
# 
# 更简单的方法：原版棋盘格的两种颜色大约是 (151,154,152) 和 (123,126,124)
# 它们的共同特点是：R≈G≈B（非常接近灰色），且亮度在 120-160 之间
# Neo 的衣服是深蓝/青色，B通道会明显高于R通道

b, g, r = img[:,:,0].astype(int), img[:,:,1].astype(int), img[:,:,2].astype(int)

# 棋盘格条件：
# 1. 三通道非常接近（差值 < 10）—— 这是"灰色"的定义
# 2. 亮度在 110-170 之间
# 3. 不在角色区域内（角色的蓝色衣服 B 通道通常远高于 R）
channel_diff = np.maximum(np.maximum(np.abs(b-g), np.abs(g-r)), np.abs(b-r))
avg_brightness = (b + g + r) // 3

# 用更严格的条件：通道差 < 8 且亮度在 115-165
mask = (channel_diff < 8) & (avg_brightness >= 115) & (avg_brightness <= 165)

removed = np.count_nonzero(mask)
total = mask.size
print(f"棋盘格像素: {removed}/{total} ({removed/total*100:.1f}%)")

# 步骤 4：生成透明版 neo.png
img_trans = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
img_trans[mask, 3] = 0

# 保存
cv2.imwrite('/Users/zhangjinhui/Desktop/eee/public/assets/sprites/neo.png', img_trans)

# 步骤 5：生成纯绿幕 neo_raw.png
img_raw = img.copy()
img_raw[mask] = [0, 255, 0]  # BGR
cv2.imwrite('/Users/zhangjinhui/Desktop/eee/public/assets/sprites/neo_raw.png', img_raw)

print("✅ neo.png 透明版和 neo_raw.png 绿幕版均已生成！")

# 步骤 6：验证——检查角色身体区域是否被误删
# 检查 neo_idle_0 帧区域 (x:0, y:0, w:160, h:106)
frame_region = img_trans[0:106, 0:160]
opaque_in_frame = np.count_nonzero(frame_region[:,:,3] > 0)
total_in_frame = 106 * 160
print(f"idle_0 帧中不透明像素: {opaque_in_frame}/{total_in_frame} ({opaque_in_frame/total_in_frame*100:.1f}%)")
