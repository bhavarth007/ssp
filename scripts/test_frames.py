import imageio_ffmpeg
import subprocess
import os

ffmpeg_bin = imageio_ffmpeg.get_ffmpeg_exe()
url = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/Arrey_Enow_Fashion_Show_Berlin_September_2021%2C_part_1_of_4.webm/Arrey_Enow_Fashion_Show_Berlin_September_2021%2C_part_1_of_4.webm.480p.vp9.webm'

timestamps = ['00:01:00', '00:01:30', '00:02:00', '00:02:30', '00:03:00']
for ts in timestamps:
    name = ts.replace(':', '_')
    out = f'frame_{name}.jpg'
    cmd = [
        ffmpeg_bin, '-y',
        '-user_agent', 'Mozilla/5.0',
        '-ss', ts,
        '-i', url,
        '-vframes', '1',
        '-q:v', '2',
        out
    ]
    subprocess.run(cmd, capture_output=True)
    if os.path.exists(out):
        print(out, 'size:', os.path.getsize(out))
