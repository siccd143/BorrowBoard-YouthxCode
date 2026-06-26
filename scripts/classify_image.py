import json
import os
import sys
from contextlib import redirect_stdout
from pathlib import Path

def main() -> int:
    if len(sys.argv) < 3:
        print(json.dumps({"ok": False, "error": "Usage: classify_image.py <model_path> <image_path>"}))
        return 1

    model_path = Path(sys.argv[1])
    image_path = Path(sys.argv[2])

    if not model_path.exists():
        print(json.dumps({"ok": False, "error": f"Model not found: {model_path}"}))
        return 1

    if not image_path.exists():
        print(json.dumps({"ok": False, "error": f"Image not found: {image_path}"}))
        return 1

    repo_cache = Path(__file__).resolve().parents[1] / ".model-cache" / "ultralytics"
    repo_cache.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("YOLO_CONFIG_DIR", str(repo_cache))

    try:
        with redirect_stdout(sys.stderr):
            from ultralytics import YOLO
    except Exception as exc:
        print(json.dumps({
            "ok": False,
            "error": "Python package 'ultralytics' is not installed. Run: pip install ultralytics",
            "details": str(exc),
        }))
        return 1

    try:
        with redirect_stdout(sys.stderr):
            model = YOLO(str(model_path))
            results = model.predict(source=str(image_path), imgsz=640, conf=0.2, verbose=False)
        detections = []

        for result in results:
            names = result.names or {}
            boxes = getattr(result, "boxes", None)

            if boxes is None:
                continue

            for box in boxes:
                raw_class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                max_idx = max(0, len(names) - 1)
                class_id = max(0, min(raw_class_id, max_idx))

                detections.append({
                    "label": str(names.get(class_id, class_id)),
                    "confidence": confidence,
                })

        detections.sort(key=lambda item: item["confidence"], reverse=True)
        top = detections[0] if detections else None
        print(json.dumps({"ok": True, "top": top, "detections": detections[:5]}))
        return 0
    except Exception as exc:
        print(json.dumps({"ok": False, "error": "Model inference failed.", "details": str(exc)}))
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
