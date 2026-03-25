import cv2
import numpy as np
import json
import sys
import os

def process_sprite(input_path, output_image_path, output_json_path):
    # Load image
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"Failed to load {input_path}")
        return

    # Assuming 3-channel (BGR) or 4-channel (BGRA)
    if img.shape[2] == 4:
        img_bgr = img[:, :, :3]
    else:
        img_bgr = img
        
    # Convert to HSV to find bright green
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    
    # Define range for green chroma key
    # Green in HSV is around H=60. Let's use 40 to 80.
    # High saturation and value
    lower_green = np.array([35, 100, 100])
    upper_green = np.array([85, 255, 255])
    
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # Create the transparent image
    b, g, r = cv2.split(img_bgr)
    alpha = np.where(mask == 255, 0, 255).astype(np.uint8)
    
    # Optional: erode/dilate the alpha a bit to remove green fringes
    # But usually just creating alpha is fine for now
    out_img = cv2.merge((b, g, r, alpha))
    
    # Save the transparent PNG
    cv2.imwrite(output_image_path, out_img)
    
    # Find bounding boxes of content
    # Use inverted mask (content = 255)
    content_mask = cv2.bitwise_not(mask)
    
    # Morphological close to merge slightly disconnected parts (like fire effects)
    kernel = np.ones((15, 15), np.uint8)
    content_mask = cv2.morphologyEx(content_mask, cv2.MORPH_CLOSE, kernel)
    
    contours, _ = cv2.findContours(content_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    boxes = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        # Filter small noise or text
        if w > 20 and h > 30 and w < 200 and h < 250:
            boxes.append({'x': x, 'y': y, 'w': w, 'h': h})
            
    # Group boxes by row (y-coordinate proximity)
    boxes = sorted(boxes, key=lambda b: b['y'])
    
    rows = []
    for box in boxes:
        placed = False
        for row in rows:
            # If y overlaps significantly with the row's average y
            row_avg_y = sum(b['y'] for b in row) / len(row)
            if abs(box['y'] - row_avg_y) < 40: # 40 px tolerance
                row.append(box)
                placed = True
                break
        if not placed:
            rows.append([box])
            
    # Sort each row left-to-right
    for row in rows:
        row.sort(key=lambda b: b['x'])
        
    # Sort rows top-to-bottom
    rows.sort(key=lambda row: sum(b['y'] for b in row) / len(row))
    
    # Create JSON Atlas format for Phaser 3
    frames = []
    
    anim_names = ['idle', 'walk', 'attack', 'hit', 'fall', 'extra1', 'extra2']
    
    for row_idx, row in enumerate(rows):
        anim_name = anim_names[row_idx] if row_idx < len(anim_names) else f'anim{row_idx}'
        for col_idx, box in enumerate(row):
            frame_name = f"{anim_name}_{col_idx}"
            frames.append({
                "filename": frame_name,
                "frame": {"x": box['x'], "y": box['y'], "w": box['w'], "h": box['h']},
                "sourceSize": {"w": box['w'], "h": box['h']}
            })
            
    atlas = {
        "frames": frames,
        "meta": {
            "image": os.path.basename(output_image_path)
        }
    }
    
    with open(output_json_path, 'w') as f:
        json.dump(atlas, f, indent=2)
        
    print(f"Processed {input_path} -> found {len(rows)} rows, {len(frames)} total frames.")

process_sprite('/Users/zhangjinhui/Desktop/eee/public/assets/sprites/ignis_raw.png', 
               '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/ignis.png', 
               '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/ignis.json')

process_sprite('/Users/zhangjinhui/Desktop/eee/public/assets/sprites/lingshuang_raw.png', 
               '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/lingshuang.png', 
               '/Users/zhangjinhui/Desktop/eee/public/assets/sprites/lingshuang.json')
