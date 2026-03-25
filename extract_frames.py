import cv2
import numpy as np
import json
import os

def extract_and_append(orig_img_path, orig_json_path, new_green_img_path, cropper_func, char_prefix):
    # 1. Load original image and json
    orig_img = cv2.imread(orig_img_path, cv2.IMREAD_UNCHANGED)
    if orig_img.shape[2] == 3:
        orig_img = cv2.cvtColor(orig_img, cv2.COLOR_BGR2BGRA)
    with open(orig_json_path, 'r') as f:
        orig_atlas = json.load(f)

    # 2. Load new green screen image
    new_img = cv2.imread(new_green_img_path, cv2.IMREAD_UNCHANGED)
    if new_img.shape[2] == 3:
        new_img = cv2.cvtColor(new_img, cv2.COLOR_BGR2BGRA)

    crouch_box, jump_box = cropper_func(new_img.shape[1], new_img.shape[0])

    # 3. Chroma key green background to transparent
    hsv = cv2.cvtColor(new_img[:, :, :3], cv2.COLOR_BGR2HSV)
    lower_green = np.array([35, 100, 100])
    upper_green = np.array([85, 255, 255])
    mask = cv2.inRange(hsv, lower_green, upper_green)
    new_img[mask == 255, 3] = 0 # Set alpha to 0 where green

    # 4. Extract the crops
    crouch_crop = new_img[crouch_box[1]:crouch_box[1]+crouch_box[3], crouch_box[0]:crouch_box[0]+crouch_box[2]]
    jump_crop = new_img[jump_box[1]:jump_box[1]+jump_box[3], jump_box[0]:jump_box[0]+jump_box[2]]

    # 5. Calculate new canvas size
    # We will append the two frames side by side at the bottom of the original image
    max_w = max(crouch_crop.shape[1], jump_crop.shape[1])
    max_h = max(crouch_crop.shape[0], jump_crop.shape[0])

    new_canvas_h = orig_img.shape[0] + max_h + 10
    new_canvas_w = max(orig_img.shape[1], crouch_crop.shape[1] + jump_crop.shape[1] + 20)

    # Create new blank canvas
    canvas = np.zeros((new_canvas_h, new_canvas_w, 4), dtype=np.uint8)
    
    # Paste original
    canvas[0:orig_img.shape[0], 0:orig_img.shape[1]] = orig_img

    # Paste crouch at bottom left
    c_y = orig_img.shape[0] + 5
    c_x = 5
    canvas[c_y:c_y+crouch_crop.shape[0], c_x:c_x+crouch_crop.shape[1]] = crouch_crop

    # Paste jump at bottom right of crouch
    j_y = orig_img.shape[0] + 5
    j_x = c_x + crouch_crop.shape[1] + 10
    canvas[j_y:j_y+jump_crop.shape[0], j_x:j_x+jump_crop.shape[1]] = jump_crop

    # 6. Update JSON atlas
    # Remove any existing jump/crouch frames to avoid duplicates if re-run
    orig_atlas['frames'] = [f for f in orig_atlas['frames'] if 'crouch' not in f['filename'] and 'jump' not in f['filename']]

    orig_atlas['frames'].append({
        "filename": f"{char_prefix}_crouch_0",
        "frame": {"x": c_x, "y": c_y, "w": crouch_crop.shape[1], "h": crouch_crop.shape[0]},
        "sourceSize": {"w": crouch_crop.shape[1], "h": crouch_crop.shape[0]}
    })

    orig_atlas['frames'].append({
        "filename": f"{char_prefix}_jump_0",
        "frame": {"x": j_x, "y": j_y, "w": jump_crop.shape[1], "h": jump_crop.shape[0]},
        "sourceSize": {"w": jump_crop.shape[1], "h": jump_crop.shape[0]}
    })

    # 7. Save
    cv2.imwrite(orig_img_path, canvas)
    with open(orig_json_path, 'w') as f:
        json.dump(orig_atlas, f, indent=2)

    print(f"Successfully processed and appended frames for {char_prefix}")


def main():
    def get_cropper(c_row, c_col, j_row, j_col):
        def _crop(w, h):
            cell_w = w // 6
            cell_h = h // 4
            return (
                (c_col * cell_w, c_row * cell_h, cell_w, cell_h),
                (j_col * cell_w, j_row * cell_h, cell_w, cell_h)
            )
        return _crop

    extract_and_append(
        'public/assets/sprites/ignis.png',
        'public/assets/sprites/ignis.json',
        '/Users/zhangjinhui/.gemini/antigravity/brain/89f7f30f-a815-469e-8f8c-25f0dcf213fd/ignis_jump_crouch_green_1774447076682.png',
        get_cropper(3, 1, 3, 4),
        'ignis'
    )

    extract_and_append(
        'public/assets/sprites/lingshuang.png',
        'public/assets/sprites/lingshuang.json',
        '/Users/zhangjinhui/.gemini/antigravity/brain/89f7f30f-a815-469e-8f8c-25f0dcf213fd/lingshuang_jump_crouch_1774446994599.png',
        get_cropper(2, 5, 3, 3),
        'lingshuang'
    )

    extract_and_append(
        'public/assets/sprites/neo.png',
        'public/assets/sprites/neo.json',
        '/Users/zhangjinhui/.gemini/antigravity/brain/89f7f30f-a815-469e-8f8c-25f0dcf213fd/neo_jump_crouch_1774447030917.png',
        get_cropper(3, 1, 3, 4),
        'neo'
    )

if __name__ == '__main__':
    main()
