"""
Discover all unique color names in the master_manifest.json
"""
import json
from pathlib import Path

# Navigate to manifest
script_dir = Path(__file__).parent
repo_root = script_dir.parent.parent.parent
manifest_path = repo_root / 'tensor-flow' / 'dataset' / 'master_manifest.json'

print(f"Loading: {manifest_path}")
with open(manifest_path, 'r') as f:
    data = json.load(f)

colors_set = set()
for img in data['images']:
    for tube in img['tubes']:
        for segment in tube['segments']:
            colors_set.add(segment['color'])

colors_list = sorted(colors_set)

print(f"\nFound {len(colors_list)} unique colors:\n")
for i, color in enumerate(colors_list):
    print(f"  {i:2d}: {color}")

print(f"\n\nClass map for Python:")
print("CLASS_MAP = {")
for i, color in enumerate(colors_list):
    print(f'    "{color}": {i},')
print("}")
