"""
精灵图切片脚本 v4 — 统一 4x6 网格，纯净无文字版
"""
import cv2
import numpy as np
import json
import os

def process_sprite_grid(input_path, output_image_path, output_json_path, name_prefix, rows, cols, anim_names):
    """按等分网格切割并生成 Phaser Atlas"""
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
    
    # 轻微腐蚀以移除绿色边缘
    kernel = np.ones((2, 2), np.uint8)
    alpha = cv2.erode(alpha, kernel, iterations=1)
    
    out_img = cv2.merge((b, g, r, alpha))
    cv2.imwrite(output_image_path, out_img)

    # 使用整格切割 — 帧尺寸完全一致，不会抖动
    frames = []
    for row_idx in range(rows):
        anim_name = anim_names[row_idx] if row_idx < len(anim_names) else f'anim{row_idx}'
        for col_idx in range(cols):
            x = col_idx * cell_w
            y = row_idx * cell_h
            
            # 检查格子是否有内容
            cell_alpha = alpha[y:y+cell_h, x:x+cell_w]
            if np.sum(cell_alpha > 0) < 50:
                continue
            
            frame_name = f"{name_prefix}_{anim_name}_{col_idx}"
            frames.append({
                "filename": frame_name,
                "frame": {"x": x, "y": y, "w": cell_w, "h": cell_h},
                "rotated": False,
                "trimmed": False,
                "spriteSourceSize": {"x": 0, "y": 0, "w": cell_w, "h": cell_h},
                "sourceSize": {"w": cell_w, "h": cell_h}
            })
    
    atlas = {
        "frames": frames,
        "meta": {
            "image": os.path.basename(output_image_path),
            "size": {"w": w, "h": h},
            "scale": 1
        }
    }
    
    with open(output_json_path, 'w') as f:
        json.dump(atlas, f, indent=2)
    
    print(f"[{name_prefix}] 生成了 {len(frames)} 帧, 统一尺寸: {cell_w}x{cell_h}")

# === 两个角色均为 4行x6列 ===
process_sprite_grid(
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/ignis_raw.png',
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/ignis.png',
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/ignis.json',
    'ignis',
    rows=4, cols=6,
    anim_names=['idle', 'walk', 'attack', 'hit']
)

process_sprite_grid(
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/lingshuang_raw.png',
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/lingshuang.png',
    '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/lingshuang.json',
    'lingshuang',
    rows=4, cols=6,
    anim_names=['idle', 'walk', 'attack', 'hit']
)
