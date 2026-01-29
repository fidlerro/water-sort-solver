"""
Train YOLOv8 model for Water Sort segment detection with color classification
This script trains a multi-class model to detect individual colored segments
"""
from ultralytics import YOLO
import os
from pathlib import Path

def train_segment_model():
    """Train YOLOv8 on segment-level dataset"""
    
    # Navigate to dataset config
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent.parent.parent
    dataset_yaml = repo_root / 'tensor-flow' / 'dataset' / 'labels' / 'segment_dataset.yaml'
    
    print("=" * 60)
    print("YOLOv8 Segment Detection Training")
    print("=" * 60)
    print(f"Dataset Config: {dataset_yaml}")
    print()
    
    if not dataset_yaml.exists():
        print(f"ERROR: Dataset YAML not found at {dataset_yaml}")
        print("Please run generate_segment_labels.py first")
        exit(1)
    
    # Load a pretrained YOLOv8 nano model
    print("Loading YOLOv8n model...")
    model = YOLO('yolov8n.pt')
    
    # Training parameters
    print("\nTraining Configuration:")
    print("  Model: YOLOv8n")
    print("  Classes: 16 (14 colors + empty + unknown)")
    print("  Epochs: 20")
    print("  Image Size: 1280")
    print("  Batch Size: 16")
    print("  Device: CPU (set to 0 for GPU if available)")
    print()
    
    # Train the model
    print("Starting training...")
    print("-" * 60)
    
    results = model.train(
        data=str(dataset_yaml),
        epochs=20,
        imgsz=1280,
        batch=16,
        device='cpu',  # Change to 0 for GPU
        project='scripts/training/runs/detect',
        name='water_sort_segments',
        patience=5,  # Early stopping patience
        save=True,
        save_period=5,  # Save checkpoint every 5 epochs
        plots=True,
        verbose=True,
    )
    
    print("-" * 60)
    print("Training complete!")
    print()
    
    # Export to ONNX
    print("Exporting model to ONNX format...")
    best_model_path = Path(results.save_dir) / 'weights' / 'best.pt'
    
    if best_model_path.exists():
        export_model = YOLO(str(best_model_path))
        export_path = export_model.export(format='onnx', imgsz=1280)
        print(f"✅ ONNX model exported to: {export_path}")
        
        # Print instructions for copying to public directory
        print()
        print("=" * 60)
        print("Next Steps:")
        print("=" * 60)
        print(f"1. Copy the ONNX model to the public directory:")
        print(f"   FROM: {export_path}")
        print(f"   TO:   v1.2.0/public/models/best_segments.onnx")
        print()
        print("2. Update inference.ts to:")
        print("   - Load the new segment model")
        print("   - Handle 16 classes instead of 1")
        print("   - Map class IDs to color names")
        print()
        print("3. Test the integrated solution!")
        print("=" * 60)
    else:
        print(f"WARNING: Best model not found at {best_model_path}")

if __name__ == "__main__":
    train_segment_model()
