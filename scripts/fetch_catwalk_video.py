import urllib.request
import re
import json
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

urls = [
    'https://coverr.co/s/catwalk',
    'https://coverr.co/s/runway',
    'https://coverr.co/s/fashion-model-walking'
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            # Look for video URLs or video slugs
            matches = re.findall(r'/videos/([a-zA-Z0-9\-]+)', content)
            print(f'From {url}: found {len(matches)} video slugs:')
            for m in list(dict.fromkeys(matches))[:8]:
                print('  - slug:', m)
            # Check for direct mp4 links
            mp4s = re.findall(r'https://[^\s\"\']+\.mp4', content)
            if mp4s:
                print('  Direct mp4s:', mp4s[:3])
    except Exception as e:
        print(f'Error fetching {url}:', e)
