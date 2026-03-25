import cv2
import numpy as np

img = cv2.imread('public/assets/sprites/neo.png')

img = cv2.imread('public/assets/sprites/neo.png')

# Identify checkerboard grayish pixels
# The checkerboard is varying shades of gray between say 110 and 170.
# A pixel is "gray" if the max difference between its B, G, R components is small.
b, g, r = img[:, :, 0], img[:, :, 1], img[:, :, 2]
max_c = np.maximum(np.maximum(b, g), r)
min_c = np.minimum(np.minimum(b, g), r)
diff = max_c - min_c

# Checkerboard mask:
# 1. Colors are close to gray (diff < 15)
# 2. Values are between 100 and 180
# 3. But wait, Neo's light blue might have some parts. Let's be careful.
# Let's say: diff < 20 and all channels between 100 and 180
mask = (diff < 20) & (b >= 100) & (b <= 180) & (g >= 100) & (g <= 180) & (r >= 100) & (r <= 180)

# For transparency
img_trans = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
img_trans[mask, 3] = 0
cv2.imwrite('public/assets/sprites/neo.png', img_trans)

print("Created transparent neo.png by masking gray checkerboards!")
