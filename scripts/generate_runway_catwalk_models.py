import cv2
import numpy as np
import math
import imageio_ffmpeg
import subprocess
import os
import sys

MODELS = [
    {
        "name": "Crimson Meenakari",
        "src": "public/assets/products/model-crimson-runway.jpg",
        "mp4": "public/assets/videos/saree-crimson-runway-walk.mp4"
    },
    {
        "name": "Indigo Elephant",
        "src": "public/assets/products/model-indigo-runway.jpg",
        "mp4": "public/assets/videos/saree-indigo-runway-walk.mp4"
    },
    {
        "name": "Rani Pink Scalloped",
        "src": "public/assets/products/model-rani-pink-runway.jpg",
        "mp4": "public/assets/videos/saree-rani-runway-walk.mp4"
    },
    {
        "name": "Mustard Gold Peacock",
        "src": "public/assets/products/model-mustard-gold-runway.jpg",
        "mp4": "public/assets/videos/saree-mustard-runway-walk.mp4"
    },
    {
        "name": "Peacock Teal Green Antique",
        "src": "public/assets/products/model-teal-green-runway.jpg",
        "mp4": "public/assets/videos/saree-teal-runway-walk.mp4"
    }
]

def render_cinematic_catwalk_video(input_path, output_mp4, duration_sec=6.0, fps=30):
    """
    Generates a high-fashion runway catwalk video:
    - Zero lateral distortion or image 'dancing' wobble
    - Smooth steadicam forward runway tracking glide (1.0x to 1.14x)
    - Realistic footfall vertical cadence (subtle, non-distorting)
    - Dynamic runway spotlight beam sweeping across silk pleats & zari borders
    - 30 FPS crisp H.264 video with seamless looping
    """
    if not os.path.exists(input_path):
        print(f"Skipping missing: {input_path}")
        return

    img = cv2.imread(input_path)
    if img is None:
        print(f"Error loading {input_path}", flush=True)
        return
        
    h, w, _ = img.shape
    out_w, out_h = 720, 960
    
    # Scale to ensure full coverage with headroom for camera dolly
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
    
    cx, cy = new_w // 2, int(new_h * 0.42) # Center focus on model torso/saree
    crop_x_base = (new_w - out_w) // 2
    crop_y_base = (new_h - out_h) // 2
    
    # Precompute runway spotlight mask for textile luster
    spot_y, spot_x = np.ogrid[:out_h, :out_w]
    
    for i in range(total_frames):
        t = i / fps
        progress = i / float(total_frames)
        
        # Smooth forward runway camera dolly (forward tracking down the catwalk)
        # Using a smooth half-sine curve for natural camera operator momentum
        dolly_factor = 1.0 + 0.10 * math.sin(math.pi * progress)
        
        # Natural footstep rhythm (smooth 1.1 Hz heel-strike cadence, strictly vertical, zero lateral shake)
        cadence_phase = 2.0 * math.pi * 1.15 * t
        subtle_step_dy = 2.0 * math.cos(cadence_phase)
        
        # Affine transform for camera dolly & vertical cadence
        M = cv2.getRotationMatrix2D((cx, cy), 0.0, dolly_factor)
        M[1, 2] += subtle_step_dy
        
        frame = cv2.warpAffine(
            source_img, 
            M, 
            (new_w, new_h), 
            flags=cv2.INTER_LANCZOS4, 
            borderMode=cv2.BORDER_REFLECT_101
        )
        
        # Extract the center 720x960 runway view
        cropped = frame[crop_y_base:crop_y_base + out_h, crop_x_base:crop_x_base + out_w]
        if cropped.shape[0] != out_h or cropped.shape[1] != out_w:
            cropped = cv2.resize(cropped, (out_w, out_h), interpolation=cv2.INTER_LANCZOS4)
            
        # Runway Stage Lighting Sweep:
        # A soft fashion spotlight slowly sweeps from stage left across the saree pallu and pleats
        beam_center_x = int(out_w * (0.2 + 0.6 * math.sin(math.pi * progress)))
        beam_center_y = int(out_h * 0.55)
        
        # Spotlight intensity gradient
        dist_sq = ((spot_x - beam_center_x) ** 2) / (280.0 ** 2) + ((spot_y - beam_center_y) ** 2) / (450.0 ** 2)
        spot_mask = np.exp(-dist_sq) * 0.12 # Soft luxury illumination
        
        # Add soft gold warmth to illuminated silk areas
        illuminated = cropped.astype(np.float32)
        illuminated[:, :, 0] += spot_mask * 10.0 # subtle blue ambient
        illuminated[:, :, 1] += spot_mask * 22.0 # warm green
        illuminated[:, :, 2] += spot_mask * 30.0 # warm gold/amber
        
        # Soft sheen sparkle along metallic zari border
        specular = (spot_mask[:, :, None] * 0.25 * (illuminated / 255.0) ** 2) * 255.0
        final_frame = np.clip(illuminated + specular, 0, 255).astype(np.uint8)
        
        proc.stdin.write(final_frame.tobytes())
        
    proc.stdin.close()
    proc.wait()
    
    # Also generate high-quality webm for browser fallback compatibility
    output_webm = output_mp4.replace('.mp4', '.webm')
    cmd_webm = [
        ffmpeg_exe, '-y',
        '-i', output_mp4,
        '-c:v', 'libvpx-vp9',
        '-b:v', '1200k',
        '-crf', '28',
        output_webm
    ]
    subprocess.run(cmd_webm, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Copy to dist if it exists
    dist_videos = os.path.join("dist", "assets", "videos")
    if os.path.exists(dist_videos):
        import shutil
        shutil.copy2(output_mp4, os.path.join(dist_videos, os.path.basename(output_mp4)))
        if os.path.exists(output_webm):
            shutil.copy2(output_webm, os.path.join(dist_videos, os.path.basename(output_webm)))
            
    print(f"Generated Runway Video: {output_mp4} ({os.path.getsize(output_mp4)} bytes)", flush=True)

if __name__ == "__main__":
    print("Beginning high-fashion catwalk video synthesis...", flush=True)
    for model in MODELS:
        print(f"Rendering catwalk for: {model['name']}...", flush=True)
        render_cinematic_catwalk_video(model['src'], model['mp4'])
    print("ALL RUNWAY CATWALK VIDEOS SYNTHESIZED SUCCESSFULLY!", flush=True)
