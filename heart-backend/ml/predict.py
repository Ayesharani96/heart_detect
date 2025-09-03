import sys
import json
import torch
import joblib
from PIL import Image
from torchvision import transforms

# 🔹 Paths
text_model_path = "D:\HDD\heart-backend\ml\model\heart_model_final.pkl"
image_model_path = "D:\HDD\heart-backend\ml\model\multimodal_fusion_final.pkl"

# 🔹 Load models
text_model = joblib.load(text_model_path)  # sklearn / xgboost type
image_model = torch.load(image_model_path, map_location="cpu")  # pytorch model
image_model.eval()

# 🔹 Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# Define the feature order (must match training order!)
FEATURE_ORDER = ["age", "cholesterol", "bp", "sugar"]  # <-- adjust based on training

def predict_text(user_text_data):
    try:
        features = [user_text_data[feat] for feat in FEATURE_ORDER]
        prediction = text_model.predict([features])
        return str(prediction[0])
    except Exception as e:
        return f"Text prediction error: {e}"

def predict_images(image_paths):
    results = []
    try:
        for img_path in image_paths:
            img = Image.open(img_path).convert("RGB")
            img_tensor = transform(img).unsqueeze(0)  # add batch
            with torch.no_grad():
                disease_out, risk_out = image_model(img_tensor)
                _, disease_pred = torch.max(disease_out, 1)
                _, risk_pred = torch.max(risk_out, 1)
            results.append({
                "disease": int(disease_pred.item()),
                "risk": int(risk_pred.item())
            })
        return results
    except Exception as e:
        return [f"Image prediction error: {e}"]

def main():
    user_text_data = json.loads(sys.argv[1])
    image_paths = json.loads(sys.argv[2])

    text_pred = predict_text(user_text_data)
    image_preds = predict_images(image_paths)

    # 🔹 Final risk decision
    risks = [img["risk"] for img in image_preds if isinstance(img, dict)]
    if 2 in risks or text_pred == "High":
        risk_level = "High"
    elif 1 in risks or text_pred == "Moderate":
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    # final response
    result = {
        "text_prediction": text_pred,
        "image_predictions": image_preds,
        "final_decision": {"risk_level": risk_level}
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
