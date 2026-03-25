import cv2
import numpy as np
import json
import os

def process_sprite_grid(input_path, output_image_path, output_json_path, name_prefix, rows, cols, anim_names):
    """按等分网格切割精灵图"""
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"无法加载 {input_path}")
        return

    h, w = img.shape[:2]
    cell_w = w // cols
    cell_h = h // rows
    
    print(f"[{name_prefix}] 图片尺寸: {w}x{h}, 网格: {cols}列x{rows}行, 每格: {cell_w}x{cell_h}")

    # 去绿幕
    img_bgr = img[:, :, :3]
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    lower_green = np.array([30, 40, 40])
    upper_green = np.array([90, 255, 255])
    bg_mask = cv2.inRange(hsv, lower_green, upper_green)
    
    b, g, r = cv2.split(img_bgr)
    alpha = np.where(bg_mask == 255, 0, 255).astype(np.uint8)
    
    # 腐蚀 alpha 一点点去掉绿色边缘
    kernel = np.ones((2, 2), np.uint8)
    alpha = cv2.erode(alpha, kernel, iterations=1)
    
    out_img = cv2.merge((b, g, r, alpha))
    cv2.imwrite(output_image_path, out_img)

    # 生成帧数据
    frames = []
    for row_idx in range(rows):
        anim_name = anim_names[row_idx] if row_idx < len(anim_names) else f'anim{row_idx}'
        for col_idx in range(cols):
            x = col_idx * cell_w
            y = row_idx * cell_h
            
            # 检查这个格子正不正（如果全透明就跳过）
            cell_alpha = alpha[y:y+cell_h, x:x+cell_w]
            if np.sum(cell_alpha > 0) < 50:
                continue
            
            # 在格子内找真实的包围盒（去掉多余的透明边缘）
            y_idx, x_idx = np.nonzero(cell_alpha > 0)
            if len(y_idx) == 0:
                continue
                
            # 真实包围盒（相对于完整图的坐标）
            real_x = x + int(np.min(x_idx))
            real_y = y + int(np.min(y_idx))
            real_w = int(np.max(x_idx) - np.min(x_idx)) + 1
            real_h = int(np.max(y_idx) - np.min(y_idx)) + 1
            
            frame_name = f"{name_prefix}_{anim_name}_{col_idx}"
            frames.append({
                "filename": frame_name,
                "frame": {"x": real_x, "y": real_y, "w": real_w, "h": real_h},
                "sourceSize": {"w": real_w, "h": real_h}
            })
    
    atlas = {
        "frames": frames,
        "meta": {
            "image": os.path.basename(output_image_path)
        }
    }
    
    with open(output_json_path, 'w') as f:
        json.dump(atlas, f, indent=2)
    
    print(f"[{name_prefix}] 生成了 {len(frames)} 帧")
    for f_data in frames:
        fn = f_data['filename']
        fw = f_data['frame']['w']
        fh = f_data['frame']['h']
        print(f"  {fn}: {fw}x{fh}")

# === 伊格尼斯 (Ignis) ===
# AI 生成图：4行（idle/walk/attack/hit），每行约 6 个角色
process_sprite_grid(
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/ignis_raw.png',
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/ignis.png',
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/ignis.json',
    'ignis',
    rows=4, cols=6,
    anim_names=['idle', 'walk', 'attack', 'hit']
)

# === 凌霜 (Ling Shuang) ===
# AI 生成图：5行带文字标签，每行不一定都满
# 第1行 idle (8帧)  第2行 walk (8帧)  第3-4行 attack (12帧分两行)  第5行 hit (8帧)
# 但实际上看图片结构：5行，看起来是左右两大列各4帧
# 凌霜图片有编号标记，结构应该是：
# Row 1: idle (8 frames)
# Row 2: walk (8 frames)  
# Row 3+4: attack (12 frames across 2 rows, 6 per row? or 8+4?)
# Row 5: hit/fall (8 frames)
# 实际上从之前的切割结果来看是 5 行 x 2 列 → 实际是 5 行 8 列
process_sprite_grid(
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/lingshuang_raw.png',
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/lingshuang.png',
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/lingshuang.json',
    'lingshuang',
    rows=5, cols=8,
    anim_names=['idle', 'walk', 'attack', 'hit', 'fall']
)
