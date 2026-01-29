from ultralytics import YOLO
import os

def main():
    print("Exporting Water Sort YOLOv8 model to TensorFlow.js format...")
    
    # Path to the best checkpoint
    weights_path = "runs/detect/water_sort_yolov8n4/weights/best.pt"
    
    if not os.path.exists(weights_path):
        print(f"Error: Checkpoint not found at {weights_path}")
        return
    
    print(f"Loading model from: {weights_path}")
    model = YOLO(weights_path)
    
    # Export to TensorFlow.js
    print("Exporting to TensorFlow.js format...")
    try:
        export_path = model.export(format="tfjs")
        print(f"Export completed successfully!")
        print(f"Model saved to: {export_path}")
    except Exception as e:
        print(f"Error during export: {e}")
        return

if __name__ == "__main__":
    main()
