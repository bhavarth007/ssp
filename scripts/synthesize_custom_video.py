import cv2
import numpy as np
import math
import imageio_ffmpeg
import subprocess
import os
import sys

def synthesize_catwalk_video(input_path, output_mp4, duration_sec=6.0, fps=30):
    """
    Synthesizes smooth, luxurious runway catwalk video for uploaded saree images:
    - Zero horizontal wobble, distortion, or 'dancing' image artifacts
    - Forward steadicam tracking dolly (1.0x to 1.14x)
    - Realistic footfall vertical cadence
    - Moving runway stage spotlight sweep with luxury zari luster
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input image not found: {input_path}")
        
    img = cv2.imread(input_path)
    if img is None:
        raise ValueError(f"Failed to read image at {input_path}")
        
    h, w, _ = img.shape
    out_w, out_h = 720, 960
    base_scale = max(out_w / w, out_h / h) * 1.08
    new_w, new_h = int(w * base_scale), int(h * base_scale)
    source_img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    
    total_frames = int(duration_sec * fps)
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    os.makedirs(os.path.dirname(os.path.abspath(output_mp4)), exist_ok=True)
    
    cmd_mp4 = [
        ffmpeg_exe, '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{out_w}x{out_h}',
        '-pix_fmt', 'bgr24',
        '-r', str(fps),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'slow',
        '-crf', '18',
        '-movflags', '+faststart',
        output_mp4
    ]
    
    proc = subprocess.Popen(cmd_mp4, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    
    cx, cy = new_w // 2, int(new_h * 0.42)
    crop_x_base = (new_w - out_w) // 2
    crop_y_base = (new_h - out_h) // 2
    
    spot_y, spot_x = np.ogrid[:out_h, :out_w]
    
    for i in range(total_frames):
        t = i / fps
        progress = i / float(total_frames)
        
        # Smooth forward runway camera dolly
        dolly_factor = 1.0 + 0.10 * math.sin(math.pi * progress)
        
        # Natural footstep cadence (pure vertical ground reaction force, zero lateral displacement)
        cadence_phase = 2.0 * math.pi * 1.15 * t
        subtle_step_dy = 2.0 * math.cos(cadence_phase)
        
        M = cv2.getRotationMatrix2D((cx, cy), 0.0, dolly_factor)
        M[1, 2] += subtle_step_dy
        
        frame = cv2.warpAffine(
            source_img, 
            M, 
            (new_w, new_h), 
            flags=cv2.INTER_LANCZOS4, 
            borderMode=cv2.BORDER_REFLECT_101
        )
        
        cropped = frame[crop_y_base:crop_y_base + out_h, crop_x_base:crop_x_base + out_w]
        if cropped.shape[0] != out_h or cropped.shape[1] != out_w:
            cropped = cv2.resize(cropped, (out_w, out_h), interpolation=cv2.INTER_LANCZOS4)
            
        # Runway Stage Lighting Sweep
        beam_center_x = int(out_w * (0.2 + 0.6 * math.sin(math.pi * progress)))
        beam_center_y = int(out_h * 0.55)
        
        dist_sq = ((spot_x - beam_center_x) ** 2) / (280.0 ** 2) + ((spot_y - beam_center_y) ** 2) / (450.0 ** 2)
        spot_mask = np.exp(-dist_sq) * 0.12
        
        illuminated = cropped.astype(np.float32)
        illuminated[:, :, 0] += spot_mask * 10.0
        illuminated[:, :, 1] += spot_mask * 22.0
        illuminated[:, :, 2] += spot_mask * 30.0
        
        specular = (spot_mask[:, :, None] * 0.25 * (illuminated / 255.0) ** 2) * 255.0
        final_frame = np.clip(illuminated + specular, 0, 255).astype(np.uint8)
        
        proc.stdin.write(final_frame.tobytes())
        
    proc.stdin.close()
    proc.wait()
    
    # Sync to dist/assets/videos/ as well
    dist_videos = os.path.join("dist", "assets", "videos")
    os.makedirs(dist_videos, exist_ok=True)
    dist_mp4 = os.path.join(dist_videos, os.path.basename(output_mp4))
    with open(output_mp4, 'rb') as f_in, open(dist_mp4, 'wb') as f_out:
        f_out.write(f_in.read())
        
    print(f"SUCCESS: {output_mp4} ({os.path.getsize(output_mp4)} bytes)", flush=True)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python synthesize_custom_video.py <input_img> <output_mp4>")
        sys.exit(1)
    synthesize_catwalk_video(sys.argv[1], sys.argv[2])
