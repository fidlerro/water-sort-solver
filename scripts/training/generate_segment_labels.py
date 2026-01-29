"""
Generate YOLO format labels for segment-level detection from master_manifest.json
Converts from tube-level to multi-class segment-level bounding boxes
"""
import json
import os
from pathlib import Path

def load_class_map(color_ref_path):
    """Load class mapping from color_reference.json"""
    with open(color_ref_path, 'r') as f:
        color_data = json.load(f)
    
    class_map = {}
    class_id = 0
    
    # Add special types first (unknown, empty)
    for special in color_data['special_types']:
        class_map[special['id']] = class_id
        class_id += 1
    
    # Add regular colors
    for color in color_data['colors']:
        class_map[color['id']] = class_id
        class_id += 1
    
    return class_map

def calculate_segment_bbox(segment, canvas_width, canvas_height, segment_height=40):
    """
    Calculate YOLO format bounding box for a segment
    YOLO format: <class_id> <x_center> <y_center> <width> <height> (all normalized 0-1)
    """
    x = segment['x']
    y = segment['y']
    # Assume segment width matches tube width (typically 37px from manifest)
    # and height is approximately 40px per segment
    w = 37
    h = segment_height
    
    # Convert to YOLO format (center coordinates, normalized)
    x_center = (x + w / 2) / canvas_width
    y_center = (y + h / 2) / canvas_height
    width = w / canvas_width
    height = h / canvas_height
    
    return x_center, y_center, width, height

def generate_labels_from_manifest(manifest_path, output_dir, class_map):
    """Generate YOLO label files from master manifest"""
    print(f"Loading manifest from {manifest_path}...")
    with open(manifest_path, 'r') as f:
        data = json.load(f)
    
    images = data['images']
    print(f"Found {len(images)} images in manifest")
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Track statistics
    stats = {color: 0 for color in class_map.keys()}
    files_generated = 0
    
    for img_data in images:
        file_name = img_data['file_name']
        label_name = file_name.replace('.png', '.txt')
        label_path = os.path.join(output_dir, label_name)
        
        canvas_width = img_data['canvas_size']['width']
        canvas_height = img_data['canvas_size']['height']
        
        labels = []
        
        # Process each tube and its segments
        for tube in img_data['tubes']:
            for segment in tube['segments']:
                color = segment['color']
                
                # Get class ID
                class_id = class_map.get(color)
                if class_id is None:
                    print(f"WARNING: Unknown color '{color}' in {file_name}, skipping segment")
                    continue
                
                # Skip empty segments (optional - comment out to include empty segments)
                # if color == "empty":
                #     continue
                
                # Calculate YOLO bbox
                x_center, y_center, width, height = calculate_segment_bbox(
                    segment, canvas_width, canvas_height
                )
                
                # Format: class_id x_center y_center width height
                labels.append(f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}")
                stats[color] += 1
        
        # Write label file
        with open(label_path, 'w') as f:
            f.write('\n'.join(labels))
        
        files_generated += 1
        if files_generated % 1000 == 0:
            print(f"  Processed {files_generated}/{len(images)} images...")
    
    print(f"\n✅ Generated {files_generated} label files")
    print("\nClass distribution:")
    for color, count in sorted(stats.items(), key=lambda x: x[1], reverse=True):
        class_id = class_map.get(color, -1)
        print(f"  [{class_id:2d}] {color:20s}: {count:6d} segments")
    
    # Generate dataset.yaml
    yaml_path = os.path.join(os.path.dirname(output_dir), 'segment_dataset.yaml')
    generate_dataset_yaml(yaml_path, output_dir, class_map)
    
    return stats

def generate_dataset_yaml(yaml_path, labels_dir, class_map):
    """Generate YAML config file for YOLOv8 training"""
    
    # Get paths relative to the yaml file
    train_images = os.path.join(os.path.dirname(labels_dir), 'images', 'train')
    train_labels = labels_dir
    
    # Build class names section from class_map
    class_names_lines = []
    for color_name, class_id in sorted(class_map.items(), key=lambda x: x[1]):
        class_names_lines.append(f"  {class_id}: {color_name}")
    class_names_str = "\n".join(class_names_lines)
    
    yaml_content = f"""# Water Sort Segment Detection Dataset
# Multi-class detection for colored segments

path: {os.path.dirname(os.path.dirname(labels_dir))}
train: images/train
val: images/train  # TODO: Create validation split

# Classes ({len(class_map)} total: 14 colors + empty + unknown)
names:
{class_names_str}
"""
    
    with open(yaml_path, 'w') as f:
        f.write(yaml_content)
    
    print(f"\n✅ Generated YAML config: {yaml_path}")

if __name__ == "__main__":
    # Paths - navigate from v1.2.0/scripts/training/ to repository root
    script_dir = Path(__file__).parent  # scripts/training
    repo_root = script_dir.parent.parent.parent  # Go up to repository root
    base_dir = repo_root / 'tensor-flow' / 'dataset'
    manifest_path = base_dir / 'master_manifest.json'
    color_ref_path = base_dir / 'classification' / 'color_reference.json'
    output_dir = base_dir / 'labels' / 'train_segments'
    
    print("=" * 60)
    print("YOLO Segment Label Generator")
    print("=" * 60)
    print(f"Color Reference: {color_ref_path}")
    print(f"Manifest:        {manifest_path}")
    print(f"Output:          {output_dir}")
    print()
    
    if not color_ref_path.exists():
        print(f"ERROR: Color reference not found at {color_ref_path}")
        exit(1)
        
    if not manifest_path.exists():
        print(f"ERROR: Manifest file not found at {manifest_path}")
        print(f"Please check the path and try again.")
        exit(1)
    
    # Load class mapping from color reference
    print("Loading class mapping...")
    class_map = load_class_map(color_ref_path)
    print(f"Loaded {len(class_map)} classes:")
    for color_name, class_id in sorted(class_map.items(), key=lambda x: x[1]):
        print(f"  [{class_id:2d}] {color_name}")
    print()
    
    # Generate labels
    stats = generate_labels_from_manifest(manifest_path, output_dir, class_map)
    
    print("\n" + "=" * 60)
    print("COMPLETE! Next steps:")
    print("1. Review generated labels in:", output_dir)
    print("2. Update training script to use: segment_dataset.yaml")
    print("3. Train with: python scripts/training/train_segments.py")
    print("=" * 60)
