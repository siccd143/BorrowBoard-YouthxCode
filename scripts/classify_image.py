import json
import sys
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

    try:
        from ultralytics import YOLO
    except Exception as exc:
        print(json.dumps({
            "ok": False,
            "error": "Python package 'ultralytics' is not installed. Run: pip install ultralytics",
            "details": str(exc),
        }))
        return 1

    try:
        model = YOLO(str(model_path))
        results = model.predict(source=str(image_path), imgsz=640, conf=0.2, verbose=False)
        detections = []

        for result in results:
            names = result.names or {}
            boxes = getattr(result, "boxes", None)

            if boxes is None:
                continue

            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
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
