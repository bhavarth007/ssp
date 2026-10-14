import cv2
import numpy as np
import math
import imageio_ffmpeg
import subprocess
import os

def create_catwalk_walk(input_image_path, output_video_path, duration_sec=6.0, fps=24):
    img = cv2.imread(input_image_path)
    if img is None:
        raise ValueError(f"Could not load image: {input_image_path}")
    
    h, w, c = img.shape
    # Desired video dimensions (vertical/portrait for model catwalk 720x960)
    out_w, out_h = 720, 960
    
    # Resize image to fit nicely with margin for sway & stride
    base_scale = max(out_w / w, out_h / h) * 1.15
    new_w, new_h = int(w * base_scale), int(h * base_scale)
    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    
    total_frames = int(duration_sec * fps)
    
    # We will write frames to an imageio-ffmpeg pipe for high-quality H.264
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    cmd = [
        ffmpeg_exe, '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{out_w}x{out_h}',
        '-pix_fmt', 'bgr24',
        '-r', str(fps),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'medium',
        '-crf', '20',
        '-movflags', '+faststart',
        output_video_path
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Model walk kinematics parameters
    step_freq = 1.6 # ~1.6 strides per second (natural haute-couture catwalk speed)
    lateral_sway_amp = 18.0 # pixels lateral hip/torso sway
    vertical_bounce_amp = 9.0 # pixels vertical stride bounce
    tilt_amp = 1.2 # degrees torso counter-balance tilt
    fabric_wave_amp = 12.0 # pixels pleat swish
    
    # Base center
    cx, cy = new_w // 2, new_h // 2
    
    for i in range(total_frames):
        t = i / fps
        phase = 2.0 * math.pi * step_freq * t
        
        # 1. Lateral hip/body sway (left foot strike vs right foot strike)
        dx = lateral_sway_amp * math.sin(phase)
        
        # 2. Vertical stride bounce (double frequency: goes up and down twice per full stride cycle)
        dy = -vertical_bounce_amp * abs(math.sin(phase))
        
        # 3. Subtle torso counter-tilt
        angle = tilt_amp * math.cos(phase)
        
        # 4. Forward progression down runway (slight forward advancement loop)
        walk_progress = (t / duration_sec)
        forward_scale = 1.0 + 0.06 * math.sin(math.pi * walk_progress) # smooth cyclical forward stride
        
        # 5. Affine transformation matrix for body stride
        M = cv2.getRotationMatrix2D((cx, cy), angle, forward_scale)
        M[0, 2] += dx
        M[1, 2] += dy
        
        # Warp image with stride
        frame = cv2.warpAffine(resized, M, (new_w, new_h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        
        # 6. Saree pleat undulation & fabric wave (simulate flowing silk drape)
        # Apply non-rigid mesh wave to lower half (pleats and drape)
        y_indices = np.arange(new_h)
        # Weight increases towards bottom of the saree (y > 0.45 of height)
        waist_y = int(new_h * 0.45)
        
        # Compute horizontal mesh displacement map
        flow_weight = np.clip((y_indices - waist_y) / float(new_h - waist_y), 0, 1) ** 1.8
        flow_offsets = (fabric_wave_amp * np.sin(phase - flow_weight * math.pi * 0.8) * flow_weight).astype(np.float32)
        
        # Remap lower region with flowing wave
        map_x, map_y = np.meshgrid(np.arange(new_w, dtype=np.float32), np.arange(new_h, dtype=np.float32))
        map_x += flow_offsets[:, None]
        
        warped_fabric = cv2.remap(frame, map_x, map_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        
        # 7. Runway spotlight sweep passing across the model
        spotlight_x = int((cx + dx) + 200 * math.sin(phase * 0.5))
        spotlight_y = int(cy + dy)
        
        # Crop center to viewport (out_w x out_h)
        crop_x = (new_w - out_w) // 2
        crop_y = (new_h - out_h) // 2
        
        cropped = warped_fabric[crop_y:crop_y + out_h, crop_x:crop_x + out_w]
        
        # Ensure exact dimensions
        if cropped.shape[0] != out_h or cropped.shape[1] != out_w:
            cropped = cv2.resize(cropped, (out_w, out_h))
            
        # Write to ffmpeg pipe
        proc.stdin.write(cropped.tobytes())
        
    proc.stdin.close()
    proc.wait()
    print(f"Successfully generated: {output_video_path} (size: {os.path.getsize(output_video_path)} bytes)")

if __name__ == '__main__':
    src = "public/assets/products/model-crimson-runway.jpg"
    out = "test_catwalk_walk.mp4"
    create_catwalk_walk(src, out)
