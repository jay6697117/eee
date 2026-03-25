import cv2
import numpy as np
import json
import os

def alpha_blend_on_green(img_bgra):
    # Convert transparent BGRA to BGR with pure green background [0, 255, 0]
    green_bg = np.zeros((img_bgra.shape[0], img_bgra.shape[1], 3), dtype=np.uint8)
    green_bg[:] = (0, 255, 0)
    
    alpha = img_bgra[:, :, 3] / 255.0
    for c in range(3):
        green_bg[:, :, c] = (img_bgra[:, :, c] * alpha + green_bg[:, :, c] * (1 - alpha)).astype(np.uint8)
    return green_bg

def append_to_raw(orig_raw_path, ai_img_path, crouch_box, jump_box):
    print(f"Processing {orig_raw_path}...")
    orig_img = cv2.imread(orig_raw_path)
    if orig_img.shape[2] == 4:
        orig_img = alpha_blend_on_green(orig_img)

    new_img = cv2.imread(ai_img_path)

    # Convert new_img green slightly to pure green [0,255,0] if not exact? The AI image might have compression artifacts.
    # Actually, process_sprites handles a range [35,100,100] to [85,255,255]. So slightly off green is fine.
    
    crouch_crop = new_img[crouch_box[1]:crouch_box[1]+crouch_box[3], crouch_box[0]:crouch_box[0]+crouch_box[2]]
    jump_crop = new_img[jump_box[1]:jump_box[1]+jump_box[3], jump_box[0]:jump_box[0]+jump_box[2]]

    # Ensure background is pure green
    bg_color = (0, 255, 0)

    # Calculate new sizes
    new_h = orig_img.shape[0] + max(crouch_crop.shape[0], jump_crop.shape[0]) + 20
    new_w = max(orig_img.shape[1], crouch_crop.shape[1] + jump_crop.shape[1] + 40)

    canvas = np.zeros((new_h, new_w, 3), dtype=np.uint8)
    canvas[:] = bg_color

    # Paste original
    canvas[0:orig_img.shape[0], 0:orig_img.shape[1]] = orig_img

    # Paste crouch
    cy = orig_img.shape[0] + 10
    cx = 10
    canvas[cy:cy+crouch_crop.shape[0], cx:cx+crouch_crop.shape[1]] = crouch_crop

    # Paste jump
    jx = cx + crouch_crop.shape[1] + 20
    jy = cy
    canvas[jy:jy+jump_crop.shape[0], jx:jx+jump_crop.shape[1]] = jump_crop

    # Overwrite raw image
    cv2.imwrite(orig_raw_path, canvas)
    print(f"Saved {orig_raw_path}")

def main():
    def get_cropper(c_row, c_col, j_row, j_col, cols=6, rows=4):
        def _crop(w, h):
            cell_w = w // cols
            cell_h = h // rows
            return (
                (c_col * cell_w, c_row * cell_h, cell_w, cell_h),
                (j_col * cell_w, j_row * cell_h, cell_w, cell_h)
            )
        return _crop

    # 1. Ignis
    append_to_raw(
        'public/assets/sprites/ignis_raw.png',
        '/Users/zhangjinhui/.gemini/antigravity/brain/89f7f30f-a815-469e-8f8c-25f0dcf213fd/ignis_jump_crouch_green_1774447076682.png',
        *get_cropper(3, 1, 3, 4, 6, 4)(640, 640)
    )

    # 2. LingShuang
    append_to_raw(
        'public/assets/sprites/lingshuang_raw.png',
        '/Users/zhangjinhui/.gemini/antigravity/brain/89f7f30f-a815-469e-8f8c-25f0dcf213fd/lingshuang_jump_crouch_1774446994599.png',
        *get_cropper(2, 5, 3, 3, 6, 4)(640, 640)
    )

    # 3. Neo
    neo_png = cv2.imread('public/assets/sprites/neo.png', cv2.IMREAD_UNCHANGED)
    neo_raw = alpha_blend_on_green(neo_png)
    cv2.imwrite('public/assets/sprites/neo_raw.png', neo_raw)

    # Neo AI generated image is 4 columns by 6 rows.
    # From thumbnail: Crouch is row 5, col 2 => index (5, 2)
    # Jump is row 5, col 1 => index (5, 1)? Wait, let's use row 5 col 0 and row 5 col 1 based on bottom row.
    # Actually let's just grab row 5 col 1 (jump) and row 5 col 2 (crouch) from a 4x6 grid.
    append_to_raw(
        'public/assets/sprites/neo_raw.png',
        '/Users/zhangjinhui/.gemini/antigravity/brain/89f7f30f-a815-469e-8f8c-25f0dcf213fd/neo_jump_crouch_1774447030917.png',
        *get_cropper(5, 2, 5, 1, 4, 6)(640, 640)
    )

if __name__ == '__main__':
    main()
