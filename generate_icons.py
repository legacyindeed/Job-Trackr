import struct, zlib, math, os

def make(size, path):
    width, height = size, size
    bg = (46, 204, 113, 255) # Green
    fg = (255, 255, 255, 255) # White
    if not os.path.exists(os.path.dirname(path)): os.makedirs(os.path.dirname(path), exist_ok=True)
    
    data = bytearray()
    scale = size / 128.0
    
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            px, py = x/scale, y/scale
            # Checkmark: (30,65)->(55,90)->(95,40)
            def dist_seg(px, py, x1, y1, x2, y2):
                dx, dy = x2-x1, y2-y1
                if dx==0 and dy==0: return math.hypot(px-x1, py-y1)
                t = ((px-x1)*dx + (py-y1)*dy) / (dx*dx + dy*dy)
                t = max(0, min(1, t))
                return math.hypot(px-(x1+t*dx), py-(y1+t*dy))
            
            d = min(dist_seg(px, py, 30, 65, 55, 90), dist_seg(px, py, 55, 90, 95, 40))
            if d < 8: row.extend(fg)
            else: row.extend(bg)
        data.extend(row)
        
    compressed = zlib.compress(data)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(struct.pack('>I4sIIBBBBB', 13, b'IHDR', width, height, 8, 6, 0, 0, 0))
        f.write(struct.pack('>I', zlib.crc32(struct.pack('>4sIIBBBBB', b'IHDR', width, height, 8, 6, 0, 0, 0)) & 0xffffffff))
        f.write(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff))
        f.write(struct.pack('>I4sI', 0, b'IEND', zlib.crc32(b'IEND') & 0xffffffff))

make(16, 'icons/icon16.png')
make(48, 'icons/icon48.png')
make(128, 'icons/icon128.png')
