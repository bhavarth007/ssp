import os
import sys
import subprocess
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import cv2

# Path to ffmpeg
import imageio_ffmpeg
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

PRODUCTS_DIR = r"C:\SSP\public\assets\products"
VIDEOS_DIR = r"C:\SSP\public\assets\videos"
DIST_VIDEOS_DIR = r"C:\SSP\dist\assets\videos"
DIST_PRODUCTS_DIR = r"C:\SSP\dist\assets\products"

os.makedirs(VIDEOS_DIR, exist_ok=True)
os.makedirs(DIST_VIDEOS_DIR, exist_ok=True)

models = [
    {
        "code": "SP-MEENA-01",
        "img": os.path.join(PRODUCTS_DIR, "model-crimson-runway.jpg"),
        "video_base": "saree-crimson-runway-walk",
        "zari_color": (255, 215, 0)
    },
    {
        "code": "SP-INDIGO-02",
        "img": os.path.join(PRODUCTS_DIR, "model-indigo-runway.jpg"),
        "video_base": "saree-indigo-runway-walk",
        "zari_color": (240, 210, 100)
    },
    {
        "code": "SP-RANI-03",
        "img": os.path.join(PRODUCTS_DIR, "model-rani-pink-runway.jpg"),
        "video_base": "saree-rani-runway-walk",
        "zari_color": (255, 220, 120)
    },
    {
        "code": "SP-GOLD-04",
        "img": os.path.join(PRODUCTS_DIR, "model-mustard-gold-runway.jpg"),
        "video_base": "saree-mustard-runway-walk",
        "zari_color": (255, 200, 50)
    },
    {
        "code": "SP-TEAL-05",
        "img": os.path.join(PRODUCTS_DIR, "model-teal-green-runway.jpg"),
        "video_base": "saree-teal-runway-walk",
        "zari_color": (230, 210, 160)
    }
]

def create_runway_motion_video(img_path, output_mp4, output_webm):
    print(f"Generating cinematic runway video for: {os.path.basename(img_path)}...")
    src_img = Image.open(img_path).convert("RGB")
    src_w, src_h = src_img.size
    
    # Target video resolution: 720x960 (3:4 runway aspect ratio)
    target_w, target_h = 720, 960
    
    # Generate 150 frames at 30 fps = 5.0 seconds seamless loop
    fps = 30
    total_frames = 150
    
    # Temporary raw frames output directory
    temp_dir = os.path.join(VIDEOS_DIR, "temp_frames")
    os.makedirs(temp_dir, exist_ok=True)
    
    np_src = np.array(src_img)
    
    for i in range(total_frames):
        # Progress 0.0 to 1.0
        t = i / float(total_frames)
        # Sine wave for smooth seamless back-and-forth camera glide
        phase = (1.0 - np.cos(t * 2 * np.pi)) / 2.0  # 0 -> 1 -> 0
        
        # Subtle walking stride bounce: 4 steps in 5 seconds
        step_bounce = np.sin(t * 8 * np.pi) * 3.5
        
        # Camera zoom: from 1.0 (full length) to 1.14 (mid-shot inspection of drape & pallu)
        scale = 1.0 + 0.14 * phase
        
        # Crop window based on scale
        crop_w = int(src_w / scale)
        crop_h = int(src_h / scale)
        
        # Focus centered on model torso & pallu drape (y around 45% of height)
        center_x = src_w / 2.0 + np.sin(t * 4 * np.pi) * 4.0 # subtle swaying stride
        center_y = src_h * 0.46 + step_bounce
        
        left = int(max(0, min(src_w - crop_w, center_x - crop_w / 2.0)))
        top = int(max(0, min(src_h - crop_h, center_y - crop_h / 2.0)))
        
        cropped = src_img.crop((left, top, left + crop_w, top + crop_h))
        frame = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Dynamic runway lighting sweep across the zari brocade
        np_frame = np.array(frame).astype(np.float32)
        
        # Light beam sweep horizontal position
        beam_x = target_w * (0.2 + 0.6 * np.sin(t * 2 * np.pi + np.pi/4)**2)
        
        # Light gradient mesh
        x_indices = np.arange(target_w)
        beam_intensity = np.exp(-((x_indices - beam_x) ** 2) / (2 * (160 ** 2)))
        beam_matrix = np.tile(beam_intensity, (target_h, 1))
        
        # Add soft warm shimmer to highlight zari reflections
        shimmer = (beam_matrix * 18.0)[:, :, np.newaxis]
        np_frame = np.clip(np_frame + shimmer, 0, 255).astype(np.uint8)
        
        frame_path = os.path.join(temp_dir, f"frame_{i:04d}.jpg")
        cv2.imwrite(frame_path, cv2.cvtColor(np_frame, cv2.COLOR_RGB2BGR))
        
    print("Encoding MP4 and WebM with ffmpeg...")
    
    # 1. Encode MP4 (H.264, yuv420p, high compatibility)
    mp4_cmd = [
        FFMPEG_EXE, "-y",
        "-r", str(fps),
        "-i", os.path.join(temp_dir, "frame_%04d.jpg"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-preset", "fast",
        "-movflags", "+faststart",
        output_mp4
    ]
    subprocess.run(mp4_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    # 2. Encode WebM (VP8/VP9, ultra-lightweight)
    webm_cmd = [
        FFMPEG_EXE, "-y",
        "-r", str(fps),
        "-i", os.path.join(temp_dir, "frame_%04d.jpg"),
        "-c:v", "libvpx-vp9",
        "-b:v", "1800k",
        "-crf", "22",
        output_webm
    ]
    subprocess.run(webm_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    # Clean up temp frames
    for f in os.listdir(temp_dir):
        os.remove(os.path.join(temp_dir, f))
    os.rmdir(temp_dir)
    print(f"Finished: {os.path.basename(output_mp4)} & {os.path.basename(output_webm)}")

def crop_detail_images():
    print("Generating unique high-res detail images for each saree...")
    
    # 1. SP-MEENA-01 details
    meena_raw = os.path.join(PRODUCTS_DIR, "saree-crimson-meenakari-real.jpg")
    if os.path.exists(meena_raw):
        img = Image.open(meena_raw)
        w, h = img.size
        # Scalloped border detail
        border = img.crop((0, int(h * 0.65), w, h))
        border.save(os.path.join(PRODUCTS_DIR, "crimson-border-detail.jpg"), quality=95)
        # Circular meenakari medallion closeup
        medallion = img.crop((int(w * 0.35), int(h * 0.45), int(w * 0.65), int(h * 0.75)))
        medallion.save(os.path.join(PRODUCTS_DIR, "crimson-medallion-detail.jpg"), quality=95)
        
    # 2. Stack details
    stack_raw = os.path.join(PRODUCTS_DIR, "saree-stack-5colors.jpg")
    if os.path.exists(stack_raw):
        img = Image.open(stack_raw)
        w, h = img.size
        # Indigo purple section
        indigo = img.crop((int(w * 0.33), 0, int(w * 0.52), h))
        indigo.save(os.path.join(PRODUCTS_DIR, "indigo-fabric-detail.jpg"), quality=95)
        # Rani pink section
        rani = img.crop((int(w * 0.16), 0, int(w * 0.35), h))
        rani.save(os.path.join(PRODUCTS_DIR, "rani-fabric-detail.jpg"), quality=95)
        # Mustard gold section
        mustard = img.crop((0, 0, int(w * 0.18), h))
        mustard.save(os.path.join(PRODUCTS_DIR, "mustard-fabric-detail.jpg"), quality=95)
        # Teal green section
        teal = img.crop((int(w * 0.50), 0, int(w * 0.70), h))
        teal.save(os.path.join(PRODUCTS_DIR, "teal-fabric-detail.jpg"), quality=95)

if __name__ == "__main__":
    crop_detail_images()
    for m in models:
        out_mp4 = os.path.join(VIDEOS_DIR, f"{m['video_base']}.mp4")
        out_webm = os.path.join(VIDEOS_DIR, f"{m['video_base']}.webm")
        create_runway_motion_video(m["img"], out_mp4, out_webm)
    print("ALL RUNWAY CATWALK VIDEOS GENERATED SUCCESSFULLY!")
