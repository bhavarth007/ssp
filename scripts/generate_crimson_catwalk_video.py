import cv2
import numpy as np
import math
import subprocess
import os
import imageio_ffmpeg
import shutil

def create_crimson_catwalk_video():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    img_path = r"C:\Users\admin\.gemini\antigravity\brain\822211e1-a3a4-4a8e-a478-43f9696baa69\.user_uploaded\media_1792067617463.jpg"
    audio_path = r"C:\SSP\scripts\runway_soundtrack.aac"
    
    raw_img = cv2.imread(img_path)
    if raw_img is None:
        raise FileNotFoundError(f"Cannot read {img_path}")
        
    orig_h, orig_w, _ = raw_img.shape
    out_w, out_h = 720, 1280
    fps = 24
    duration_sec = 10.0
    total_frames = int(duration_sec * fps) # 240 frames
    
    # Scale base image with margin for smooth camera dolly & walking stride
    base_scale = max(out_w / orig_w, out_h / orig_h) * 1.14
    new_w, new_h = int(orig_w * base_scale), int(orig_h * base_scale)
    base_img = cv2.resize(raw_img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    
    temp_raw_mp4 = r"C:\SSP\scripts\crimson_walk_temp.mp4"
    final_mp4 = r"C:\SSP\public\assets\videos\saree-crimson-runway-walk.mp4"
    final_webm = r"C:\SSP\public\assets\videos\saree-crimson-runway-walk.webm"
    
    # 1. First encode video stream with H.264
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
        '-preset', 'slow',
        '-crf', '18',
        temp_raw_mp4
    ]
    
    proc = subprocess.Popen(cmd_video, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    
    cx, cy = new_w // 2, int(new_h * 0.45)
    crop_x = (new_w - out_w) // 2
    crop_y = (new_h - out_h) // 2
    
    stride_freq = 1.12 # Fashion runway cadence
    spot_y, spot_x = np.ogrid[:out_h, :out_w]
    
    # Precompute coordinate grid for non-rigid fabric flow remap
    grid_y, grid_x = np.mgrid[0:out_h, 0:out_w].astype(np.float32)
    
    # Height normalized factor (0 at top, 1 at bottom of cropped frame)
    h_norm = grid_y / float(out_h)
    
    # Mask weights for different body parts:
    # Upper head/shoulders: rigid posture
    # Torso/hips: rhythmic hip sway
    # Lower pleats & hem: fluid cloth wave with delayed inertia
    hip_weight = np.clip((h_norm - 0.35) / 0.35, 0.0, 1.0)
    pleat_weight = np.clip((h_norm - 0.60) / 0.40, 0.0, 1.0)
    
    print(f"Synthesizing 240 runway walk frames from high-res image...", flush=True)
    
    for i in range(total_frames):
        t = i / fps
        progress = i / float(total_frames)
        
        # Smooth transition: 0s-7.5s active runway walk, 7.5s-10s graceful pause/stance at runway tip
        walk_factor = 1.0 - (0.5 * (1.0 + math.sin(math.pi * (min(max(t - 7.0, 0.0) / 1.5, 1.0) - 0.5))))
        
        step_phase = 2.0 * math.pi * stride_freq * t
        
        # 1. Steadicam dolly tracking forward down the catwalk
        dolly = 1.0 + 0.12 * (min(t, 8.0) / 8.0) + 0.015 * math.sin(progress * math.pi)
        
        # 2. Catwalk Walking Dynamics
        # Lateral hip sway
        sway = 6.5 * math.sin(step_phase) * walk_factor
        # Vertical heel strike cadence bounce
        bounce = -4.0 * math.cos(2.0 * step_phase) * walk_factor
        # Slight poise tilt of head & shoulders
        tilt = 0.50 * math.sin(step_phase) * walk_factor
        
        # Affine base transformation
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
        
        # Crop to target viewport (720 x 1280)
        cropped = warped_base[crop_y:crop_y + out_h, crop_x:crop_x + out_w]
        if cropped.shape[0] != out_h or cropped.shape[1] != out_w:
            cropped = cv2.resize(cropped, (out_w, out_h), interpolation=cv2.INTER_LINEAR)
            
        # 3. Non-rigid Saree Pleat & Pallu Flutter Dynamics
        # Cloth inertia has a phase lag behind hip movement
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
        
        # 4. Realistic Dynamic Runway Spotlights & Zari Specular Highlights
        # Sweeping key light across catwalk
        spot_center_x = int(out_w * (0.35 + 0.30 * math.sin(0.4 * math.pi * progress)))
        spot_center_y = int(out_h * 0.48)
        
        # Radial spotlight profile
        dist_sq = ((spot_x - spot_center_x) ** 2) / (320.0 ** 2) + ((spot_y - spot_center_y) ** 2) / (520.0 ** 2)
        spot_profile = np.exp(-dist_sq) * 0.12
        
        # Runway floor light reflection pulse
        floor_pulse = 0.05 * math.sin(step_phase) * (h_norm ** 2)
        
        frame_fl = flow_frame.astype(np.float32)
        # Apply subtle ambient light modulation
        ambient_boost = (spot_profile + floor_pulse)[:, :, None]
        frame_fl += frame_fl * ambient_boost * 0.35
        
        # Metallic Zari Sheen: Gold medallions catch light
        # Detect gold/yellowish/bright highlights on the saree
        bright_mask = np.clip((frame_fl[:, :, 2] * 0.5 + frame_fl[:, :, 1] * 0.4 - frame_fl[:, :, 0] * 0.5) / 100.0, 0, 1.0)
        specular = (spot_profile * 0.18)[:, :, None] * bright_mask[:, :, None] * 255.0
        
        final_frame = np.clip(frame_fl + specular, 0, 255).astype(np.uint8)
        proc.stdin.write(final_frame.tobytes())
        
    proc.stdin.close()
    proc.wait()
    print("Video stream rendered successfully! Now muxing audio track...", flush=True)
    
    # 2. Mux video with soundtrack and faststart
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
    
    # 3. Generate WebM companion
    cmd_webm = [
        ffmpeg_exe, '-y',
        '-i', final_mp4,
        '-c:v', 'libvpx-vp9',
        '-b:v', '1200k',
        '-deadline', 'realtime',
        '-cpu-used', '4',
        final_webm
    ]
    subprocess.run(cmd_webm, check=True)
    
    # Synchronize to dist
    dist_videos = r"C:\SSP\dist\assets\videos"
    os.makedirs(dist_videos, exist_ok=True)
    shutil.copy2(final_mp4, os.path.join(dist_videos, os.path.basename(final_mp4)))
    shutil.copy2(final_webm, os.path.join(dist_videos, os.path.basename(final_webm)))
    
    # Clean temporary raw file
    if os.path.exists(temp_raw_mp4):
        os.remove(temp_raw_mp4)
        
    print(f"Crimson Runway Catwalk Video generated: {final_mp4} ({os.path.getsize(final_mp4)} bytes)", flush=True)

if __name__ == "__main__":
    create_crimson_catwalk_video()
