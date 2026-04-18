import json
import sys
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
import logging
import traceback

# Setup logging
logging.basicConfig(level=logging.ERROR, format='%(asctime)s - [%(levelname)s] - %(message)s')
logger = logging.getLogger(__name__)

# Global In-Memory Model Cache
# Structure: { 'dataset_id': { 'model': obj, 'scaler': obj, 'imputer': obj } }
LOADED_MODELS = {}

def process_prediction(req_id, prediction_data, dataset_id):
    try:
        if not prediction_data:
            return {"success": False, "reqId": req_id, "error": "No data provided"}

        if not dataset_id:
            return {"success": False, "reqId": req_id, "error": "No dataset_id provided"}

        # 1. Access Model from RAM Cache or Load from Disk
        if dataset_id not in LOADED_MODELS:
            model_dir = Path(f'./storage/models/{dataset_id}')
            if not model_dir.exists():
                return {"success": False, "reqId": req_id, "error": f"No trained model found for {dataset_id}. Please train first."}
            
            # Enforce single-model memory retention to prevent OOM
            if len(LOADED_MODELS) >= 2:
                # Keep memory strictly lean by evicting older models
                keys = list(LOADED_MODELS.keys())
                for k in keys:
                    del LOADED_MODELS[k]
                    
            try:
                # Load strictly once per dataset_id
                model = joblib.load(model_dir / 'xgboost_clv.pkl')
                scaler = joblib.load(model_dir / 'scaler.pkl')
                imputer = joblib.load(model_dir / 'imputer.pkl')
                
                LOADED_MODELS[dataset_id] = {
                    'model': model,
                    'scaler': scaler,
                    'imputer': imputer
                }
            except Exception as e:
                 return {"success": False, "reqId": req_id, "error": f"Corrupt model artifacts: {str(e)}"}

        artifacts = LOADED_MODELS[dataset_id]
        model = artifacts['model']
        scaler = artifacts['scaler']
        imputer = artifacts['imputer']

        # 2. Extract Data & Feature Engineering
        df = pd.DataFrame(prediction_data)
        X = df[['recency', 'frequency', 'monetary_value', 'tenure']].copy()
        
        X['rfm_score'] = (X['frequency'] * X['monetary_value']) / (X['recency'].replace(0, 1) + 1)
        X['avg_order_value'] = X['monetary_value'] / (X['frequency'].replace(0, 1))
        X['engagement_velocity'] = (X['frequency'] / (X['tenure'].replace(0, 1) + 1)) * 30.0
        
        # 3. Transform
        X_imputed = pd.DataFrame(imputer.transform(X), columns=X.columns)
        X_scaled = pd.DataFrame(scaler.transform(X_imputed), columns=X.columns)

        # 4. Predict & Scorch
        predictions = model.predict(X_scaled)
        
        results = []
        for i, pred in enumerate(predictions):
            feature_vector = X_scaled.iloc[i].values
            distance_from_mean = np.linalg.norm(feature_vector)
            # Return confidence as 0.0–1.0 fraction (UI multiplies by 100 for display)
            confidence = max(0.20, min(0.999, (100 - (distance_from_mean * 5)) / 100))
            final_clv = max(0.0, float(pred))
            
            if final_clv > 5000:
                segment = 'Champions'
            elif final_clv > 2000:
                segment = 'VIP'
            elif final_clv > 800:
                segment = 'Loyal'
            elif final_clv > 300:
                segment = 'Medium Value'
            elif final_clv > 100:
                segment = 'Low Value'
            else:
                segment = 'At Risk'

            results.append({
                'clv': final_clv,
                'confidence': round(float(confidence), 4),  # 0.0–1.0 fraction
                'segment': segment,
                'customer_id': str(df.iloc[i].get('customer_id', f'cust_pred_{i}'))
            })

        summary = {
            'total_predictions': len(results),
            'avg_clv': float(np.mean([r['clv'] for r in results])),
            'max_clv': float(max([r['clv'] for r in results])),
            'min_clv': float(min([r['clv'] for r in results]))
        }
        
        return {
            'success': True,
            'reqId': req_id,
            'predictions': results,
            'summary': summary
        }

    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        return {"success": False, "reqId": req_id, "error": f"Prediction Engine Error: {str(e)}"}


def daemon_loop():
    # Signal readiness to the Node parent process
    print(json.dumps({"system": "ready"}), flush=True)

    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break # EOF, parent closed connection
            
            line = line.strip()
            if not line:
                continue

            payload = json.loads(line)
            req_id = payload.get('reqId', 'unknown')
            data = payload.get('data', [])
            dataset_id = payload.get('dataset_id')

            # Process request
            response = process_prediction(req_id, data, dataset_id)

            # Output exactly one line of JSON per request to stdout
            print(json.dumps(response), flush=True)

        except json.JSONDecodeError as e:
            # Safely trap bad JSON so the daemon doesn't crash
            sys.stderr.write(f"JSON Parsing Error: {str(e)}\n")
            print(json.dumps({"success": False, "reqId": "unknown", "error": "Invalid JSON input"}), flush=True)
        except KeyboardInterrupt:
            break
        except Exception as e:
            sys.stderr.write(f"Daemon Critical Error: {str(e)}\n")
            traceback.print_exc(file=sys.stderr)
            # Sleep briefly to avoid hyper-spin if something goes fatally wrong
            print(json.dumps({"success": False, "reqId": "unknown", "error": f"Daemon Error: {str(e)}"}), flush=True)

if __name__ == '__main__':
    daemon_loop()
