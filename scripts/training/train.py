from ultralytics import YOLO
import os

def main():
    print("Starting Water Sort Solver Model Training...")
    
    # Ensure we are running from the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    print(f"Working Directory: {script_dir}")

    # Load a model
    # yolov8n.pt is the Nano model, smallest and fastest, good for mobile/web.
    print("Loading YOLOv8 Nano model...")
    model = YOLO("yolov8n.pt") 

    # Train the model
    print("Beginning training...")
    try:
        results = model.train(
            data="water_sort_dataset.yaml", 
            epochs=5,  # Train for 5 epochs as requested
            imgsz=640,  # Keep reduced image size for speed
            device='cpu',  # Use CPU since no GPU is available
            batch=16,
            name="water_sort_yolov8n"
        )
        print("Training completed.")
    except Exception as e:
        print(f"Error during training: {e}")
        return

    # Export the model to TFJS format
    print("Exporting to TensorFlow.js format...")
    try:
        model.export(format="tfjs")
        print("Export completed. Check the 'runs/detect/water_sort_yolov8n/weights' folder.")
    except Exception as e:
        print(f"Error during export: {e}")

if __name__ == "__main__":
    main()
