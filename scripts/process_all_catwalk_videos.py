import os
import shutil
import subprocess
import imageio_ffmpeg
import cv2
import numpy as np
import math

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

USER_VIDEOS = [
    {
        "code": "SP-INDIGO-02",
        "name": "Royal Indigo Purple Elephant Medallion Brocade Saree",
        "src": r"C:\Users\admin\Downloads\gemini_generated_video_b418ca39_gwr_video_mvp.mp4",
        "dest_mp4": r"C:\SSP\public\assets\videos\saree-indigo-runway-walk.mp4",
        "dest_webm": r"C:\SSP\public\assets\videos\saree-indigo-runway-walk.webm"
    },
    {
        "code": "SP-RANI-03",
        "name": "Vibrant Rani Pink Scalloped Zari Silk Saree",
        "src": r"C:\Users\admin\Downloads\gemini_generated_video_4d74de4c_gwr_video_mvp.mp4",
        "dest_mp4": r"C:\SSP\public\assets\videos\saree-rani-runway-walk.mp4",
        "dest_webm": r"C:\SSP\public\assets\videos\saree-rani-runway-walk.webm"
    },
    {
        "code": "SP-GOLD-04",
        "name": "Imperial Mustard Gold Peacock Brocade Silk Saree",
        "src": r"C:\Users\admin\Downloads\gemini_generated_video_f3f0bf2a_gwr_video_mvp.mp4",
        "dest_mp4": r"C:\SSP\public\assets\videos\saree-mustard-runway-walk.mp4",
        "dest_webm": r"C:\SSP\public\assets\videos\saree-mustard-runway-walk.webm"
    },
    {
        "code": "SP-TEAL-05",
        "name": "Deep Peacock Teal Green Antique Zari Silk Saree",
        "src": r"C:\Users\admin\Downloads\gemini_generated_video_1464f167_gwr_video_mvp.mp4",
        "dest_mp4": r"C:\SSP\public\assets\videos\saree-teal-runway-walk.mp4",
        "dest_webm": r"C:\SSP\public\assets\videos\saree-teal-runway-walk.webm"
    }
]

def process_user_videos():
    print("=== 1. PROCESSING 4 USER ORIGINAL VIDEOS (ZERO COLOR MODIFICATION) ===", flush=True)
    dist_videos = r"C:\SSP\dist\assets\videos"
    os.makedirs(dist_videos, exist_ok=True)
    
    for v in USER_VIDEOS:
        print(f"Processing: {v['name']} ({v['code']})", flush=True)
        if not os.path.exists(v['src']):
            print(f"Warning: Source not found: {v['src']}", flush=True)
            continue
            
        # Copy bitstream directly with -c copy and +faststart.
        # This guarantees 100% untouched pixels, untouched color palette, and untouched audio.
        cmd_copy = [
            ffmpeg_exe, '-y',
            '-i', v['src'],
            '-c', 'copy',
            '-movflags', '+faststart',
            v['dest_mp4']
        ]
        subprocess.run(cmd_copy, check=True)
        
        # Also copy directly to dist/assets/videos
        shutil.copy2(v['dest_mp4'], os.path.join(dist_videos, os.path.basename(v['dest_mp4'])))
        
        # WebM companion fallback
        cmd_webm = [
            ffmpeg_exe, '-y',
            '-i', v['src'],
            '-c:v', 'libvpx-vp9',
            '-b:v', '1200k',
            '-deadline', 'realtime',
            '-cpu-used', '4',
            v['dest_webm']
        ]
        subprocess.run(cmd_webm, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(v['dest_webm']):
            shutil.copy2(v['dest_webm'], os.path.join(dist_videos, os.path.basename(v['dest_webm'])))
            
        print(f"  -> Successfully installed {os.path.basename(v['dest_mp4'])} ({os.path.getsize(v['dest_mp4'])} bytes)", flush=True)

def generate_crimson_video():
    print("\n=== 2. GENERATING RUNWAY CATWALK VIDEO FOR CRIMSON MEENAKARI (5TH PRODUCT) ===", flush=True)
    img_path = r"C:\Users\admin\.gemini\antigravity\brain\822211e1-a3a4-4a8e-a478-43f9696baa69\.user_uploaded\media_1792067617463.jpg"
    audio_path = r"C:\SSP\scripts\runway_soundtrack.aac"
    
    # Save the uploaded high-res photo as the official model hero image
    shutil.copy2(img_path, r"C:\SSP\public\assets\products\model-crimson-runway.jpg")
    if os.path.exists(r"C:\SSP\dist\assets\products"):
        shutil.copy2(img_path, r"C:\SSP\dist\assets\products\model-crimson-runway.jpg")
        
    raw_img = cv2.imread(img_path)
    if raw_img is None:
        raise FileNotFoundError(f"Cannot read {img_path}")
        
    orig_h, orig_w, _ = raw_img.shape
    out_w, out_h = 720, 1280
    fps = 24
    duration_sec = 10.0
    total_frames = int(duration_sec * fps)
    
    base_scale = max(out_w / orig_w, out_h / orig_h) * 1.14
    new_w, new_h = int(orig_w * base_scale), int(orig_h * base_scale)
    base_img = cv2.resize(raw_img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    
    temp_raw_mp4 = r"C:\SSP\scripts\crimson_walk_temp.mp4"
    final_mp4 = r"C:\SSP\public\assets\videos\saree-crimson-runway-walk.mp4"
    final_webm = r"C:\SSP\public\assets\videos\saree-crimson-runway-walk.webm"
    
    cmd_video = [
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
        '-crf', '18',
        temp_raw_mp4
    ]
    
    proc = subprocess.Popen(cmd_video, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    
    cx, cy = new_w // 2, int(new_h * 0.45)
    crop_x = (new_w - out_w) // 2
    crop_y = (new_h - out_h) // 2
    
    stride_freq = 1.12
    spot_y, spot_x = np.ogrid[:out_h, :out_w]
    grid_y, grid_x = np.mgrid[0:out_h, 0:out_w].astype(np.float32)
    h_norm = grid_y / float(out_h)
    pleat_weight = np.clip((h_norm - 0.55) / 0.45, 0.0, 1.0)
    
    for i in range(total_frames):
        t = i / fps
        progress = i / float(total_frames)
        
        walk_factor = 1.0 - (0.5 * (1.0 + math.sin(math.pi * (min(max(t - 7.0, 0.0) / 1.5, 1.0) - 0.5))))
        step_phase = 2.0 * math.pi * stride_freq * t
        
        # Dolly advance
        dolly = 1.0 + 0.12 * (min(t, 8.0) / 8.0) + 0.015 * math.sin(progress * math.pi)
        
        # Model stride
        sway = 6.5 * math.sin(step_phase) * walk_factor
        bounce = -4.0 * math.cos(2.0 * step_phase) * walk_factor
        tilt = 0.50 * math.sin(step_phase) * walk_factor
        
        M = cv2.getRotationMatrix2D((cx, cy), tilt, dolly)
        M[0, 2] += sway
        M[1, 2] += bounce
        
        warped_base = cv2.warpAffine(
            base_img, 
            M, 
            (new_w, new_h), 
            flags=cv2.INTER_LANCZOS4, 
            borderMode=cv2.BORDER_REFLECT_101
        )
        
        cropped = warped_base[crop_y:crop_y + out_h, crop_x:crop_x + out_w]
        if cropped.shape[0] != out_h or cropped.shape[1] != out_w:
            cropped = cv2.resize(cropped, (out_w, out_h), interpolation=cv2.INTER_LINEAR)
            
        # Silk pleat flow
        cloth_lag_phase = step_phase - 0.45 * math.pi
        cloth_flutter = 3.5 * math.sin(cloth_lag_phase) * pleat_weight * walk_factor
        cloth_vert = 2.0 * math.cos(2.0 * cloth_lag_phase) * pleat_weight * walk_factor
        
        map_x = (grid_x - cloth_flutter).astype(np.float32)
        map_y = (grid_y - cloth_vert).astype(np.float32)
        
        flow_frame = cv2.remap(
            cropped, 
            map_x, 
            map_y, 
            interpolation=cv2.INTER_LINEAR, 
            borderMode=cv2.BORDER_REFLECT_101
        )
        
        # Stage lighting sweep & specular zari luster
        spot_center_x = int(out_w * (0.35 + 0.30 * math.sin(0.4 * math.pi * progress)))
        spot_center_y = int(out_h * 0.48)
        dist_sq = ((spot_x - spot_center_x) ** 2) / (320.0 ** 2) + ((spot_y - spot_center_y) ** 2) / (520.0 ** 2)
        spot_profile = np.exp(-dist_sq) * 0.12
        floor_pulse = 0.05 * math.sin(step_phase) * (h_norm ** 2)
        
        frame_fl = flow_frame.astype(np.float32)
        ambient_boost = (spot_profile + floor_pulse)[:, :, None]
        frame_fl += frame_fl * ambient_boost * 0.30
        
        bright_mask = np.clip((frame_fl[:, :, 2] * 0.5 + frame_fl[:, :, 1] * 0.4 - frame_fl[:, :, 0] * 0.5) / 100.0, 0, 1.0)
        specular = (spot_profile * 0.16)[:, :, None] * bright_mask[:, :, None] * 255.0
        
        final_frame = np.clip(frame_fl + specular, 0, 255).astype(np.uint8)
        proc.stdin.write(final_frame.tobytes())
        
    proc.stdin.close()
    proc.wait()
    
    # Mux audio and faststart
    cmd_mux = [
        ffmpeg_exe, '-y',
        '-i', temp_raw_mp4,
        '-i', audio_path,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-shortest',
        final_mp4
    ]
    subprocess.run(cmd_mux, check=True)
    
    # WebM companion
    cmd_webm = [
        ffmpeg_exe, '-y',
        '-i', final_mp4,
        '-c:v', 'libvpx-vp9',
        '-b:v', '1200k',
        '-deadline', 'realtime',
        '-cpu-used', '4',
        final_webm
    ]
    subprocess.run(cmd_webm, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    dist_videos = r"C:\SSP\dist\assets\videos"
    shutil.copy2(final_mp4, os.path.join(dist_videos, os.path.basename(final_mp4)))
    if os.path.exists(final_webm):
        shutil.copy2(final_webm, os.path.join(dist_videos, os.path.basename(final_webm)))
        
    if os.path.exists(temp_raw_mp4):
        os.remove(temp_raw_mp4)
        
    print(f"Crimson Runway Video: {final_mp4} ({os.path.getsize(final_mp4)} bytes)", flush=True)

if __name__ == "__main__":
    process_user_videos()
    generate_crimson_video()
    print("\nALL 5 RUNWAY CATWALK VIDEOS ARE FULLY SYNCHRONIZED AND READY!", flush=True)
