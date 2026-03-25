import cv2
import numpy as np
import json
import os

def fix_neo():
    # Load original (pristine) neo files
    orig_img_path = 'public/assets/sprites/neo.png'
    orig_json_path = 'public/assets/sprites/neo.json'
    
    orig_img = cv2.imread(orig_img_path, cv2.IMREAD_UNCHANGED)
    if orig_img.shape[2] == 3:
        orig_img = cv2.cvtColor(orig_img, cv2.COLOR_BGR2BGRA)
        
    with open(orig_json_path, 'r') as f:
        orig_atlas = json.load(f)

    # 1. First recreate neo_raw.png WITHOUT the newly appended frames
    green_bg = np.zeros((orig_img.shape[0], orig_img.shape[1], 3), dtype=np.uint8)
    green_bg[:] = (0, 255, 0)
    alpha = orig_img[:, :, 3] / 255.0
    for c in range(3):
        green_bg[:, :, c] = (orig_img[:, :, c] * alpha + green_bg[:, :, c] * (1 - alpha)).astype(np.uint8)

    # 2. Process AI image to scale down by 40%
    ai_img_path = '/Users/zhangjinhui/.gemini/antigravity/brain/89f7f30f-a815-469e-8f8c-25f0dcf213fd/neo_crouch_jump_v2_1774448813988.png'
    ai_img = cv2.imread(ai_img_path)
    if ai_img is None:
        print("AI image not found!")
        return
        
    # Scale down by 0.4
    ai_img = cv2.resize(ai_img, (0,0), fx=0.4, fy=0.4)
    h, w = ai_img.shape[:2]  # Now ~ 256x256
    cw, ch = w // 2, h // 2
    
    # Crouch: row 0, col 0
    c_raw = ai_img[0:ch, 0:cw]
    # Jump: row 1, col 1
    j_raw = ai_img[ch:h, cw:w]
    
    # 3. Append to neo_raw.png (green pure)
    raw_h = green_bg.shape[0] + max(c_raw.shape[0], j_raw.shape[0]) + 10
    raw_w = max(green_bg.shape[1], c_raw.shape[1] + j_raw.shape[1] + 20)
    raw_canvas = np.zeros((raw_h, raw_w, 3), dtype=np.uint8)
    raw_canvas[:] = (0, 255, 0)
    raw_canvas[0:green_bg.shape[0], 0:green_bg.shape[1]] = green_bg
    
    c_y = green_bg.shape[0] + 5
    c_x = 5
    raw_canvas[c_y:c_y+c_raw.shape[0], c_x:c_x+c_raw.shape[1]] = c_raw
    
    j_y = c_y
    j_x = c_x + c_raw.shape[1] + 10
    raw_canvas[j_y:j_y+j_raw.shape[0], j_x:j_x+j_raw.shape[1]] = j_raw
    
    cv2.imwrite('public/assets/sprites/neo_raw.png', raw_canvas)
    print("Exported neo_raw.png perfectly!")

    # 4. Now tight-crop for transparent neo.png
    def get_tight_crop(bgr_cell):
        # Key out green
        hsv = cv2.cvtColor(bgr_cell, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, np.array([35, 100, 100]), np.array([85, 255, 255]))
        bgra = cv2.cvtColor(bgr_cell, cv2.COLOR_BGR2BGRA)
        bgra[mask == 255, 3] = 0
        
        alpha = bgra[:, :, 3]
        _, alpha_bin = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(alpha_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return bgra
            
        x_min, y_min = bgra.shape[1], bgra.shape[0]
        x_max, y_max = 0, 0
        for cnt in contours:
            x, y, bw, bh = cv2.boundingRect(cnt)
            if bw < 5 or bh < 5: continue
            x_min = min(x_min, x)
            y_min = min(y_min, y)
            x_max = max(x_max, x+bw)
            y_max = max(y_max, y+bh)
            
        if x_min >= x_max or y_min >= y_max:
            return bgra
            
        x_min = max(0, x_min - 2)
        y_min = max(0, y_min - 2)
        x_max = min(bgra.shape[1], x_max + 2)
        y_max = min(bgra.shape[0], y_max + 2)
        
        return bgra[y_min:y_max, x_min:x_max]

    crouch_crop = get_tight_crop(c_raw)
    jump_crop = get_tight_crop(j_raw)

    # 5. Append tight crops to neo.png
    t_h = orig_img.shape[0] + max(crouch_crop.shape[0], jump_crop.shape[0]) + 10
    t_w = max(orig_img.shape[1], crouch_crop.shape[1] + jump_crop.shape[1] + 20)
    
    t_canvas = np.zeros((t_h, t_w, 4), dtype=np.uint8)
    t_canvas[0:orig_img.shape[0], 0:orig_img.shape[1]] = orig_img
    
    t_c_y = orig_img.shape[0] + 5
    t_c_x = 5
    t_canvas[t_c_y:t_c_y+crouch_crop.shape[0], t_c_x:t_c_x+crouch_crop.shape[1]] = crouch_crop
    
    t_j_y = t_c_y
    t_j_x = t_c_x + crouch_crop.shape[1] + 10
    t_canvas[t_j_y:t_j_y+jump_crop.shape[0], t_j_x:t_j_x+jump_crop.shape[1]] = jump_crop
    
    # 6. Append to neo.json
    def add_frame(name, cx, cy, crop):
        orig_atlas['frames'].append({
            "filename": name,
            "frame": {"x": cx, "y": cy, "w": crop.shape[1], "h": crop.shape[0]},
            "sourceSize": {"w": crop.shape[1], "h": crop.shape[0]}
        })

    orig_atlas['frames'] = [f for f in orig_atlas['frames'] if 'crouch' not in f['filename'] and 'jump' not in f['filename']]
    add_frame("neo_crouch_0", t_c_x, t_c_y, crouch_crop)
    add_frame("neo_jump_0", t_j_x, t_j_y, jump_crop)
    
    cv2.imwrite(orig_img_path, t_canvas)
    with open(orig_json_path, 'w') as f:
        json.dump(orig_atlas, f, indent=2)
    print("Patched neo.json and neo.png perfectly!")

if __name__ == '__main__':
    fix_neo()
