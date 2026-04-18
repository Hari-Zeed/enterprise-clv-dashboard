import json
import sys
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, KFold, RandomizedSearchCV
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor
import joblib
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [%(levelname)s] - %(message)s')
logger = logging.getLogger(__name__)

def main():
    try:
        # Load input data from stdin
        logger.info("Initializing ML training sequence...")
        input_data = json.load(sys.stdin)
        data = input_data.get('data', [])
        dataset_id = input_data.get('dataset_id', 'latest')
        
        if not data:
            logger.error("No data provided in input payload")
            sys.exit(1)

        df = pd.DataFrame(data)
        logger.info(f"Loaded DataFrame: {df.shape[0]} rows, {df.shape[1]} columns")
        
        # 1. Feature Engineering - RFM & Advanced Metrics
        X = df[['recency', 'frequency', 'monetary_value', 'tenure']].copy()
        
        # Derived: RFM Score & LTV indicators
        # Assume recency is days since last purchase. Lower is better.
        # Ensure we don't divide by zero
        X['rfm_score'] = (X['frequency'] * X['monetary_value']) / (X['recency'].replace(0, 1) + 1)
        X['avg_order_value'] = X['monetary_value'] / (X['frequency'].replace(0, 1))
        X['engagement_velocity'] = (X['frequency'] / (X['tenure'].replace(0, 1) + 1)) * 30.0 # Purchases per month
        
        # Handle Missing Values robustly
        imputer = SimpleImputer(strategy='median')
        X_imputed = imputer.fit_transform(X)
        X = pd.DataFrame(X_imputed, columns=X.columns)

        # 2. Target Variable formulation: Approximate CLV
        # In a real environment, this would come from a historical label column.
        # Here we approximate CLV realistically (3 year projection)
        y = X['monetary_value'] * (1 + X['engagement_velocity'] * 36) * (1 - np.exp(-X['tenure']/12))
        
        # 3. Preprocessing (Scaling)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        X_scaled = pd.DataFrame(X_scaled, columns=X.columns)

        # Split: 80% train, 20% test
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        logger.info(f"Train/Test split completed: Train={X_train.shape[0]} Test={X_test.shape[0]}")

        # 4. XGBoost with Hyperparameter Tuning (RandomizedSearchCV for speed/performance combo)
        param_dist = {
            'max_depth': [3, 4, 5, 6, 7],
            'learning_rate': [0.01, 0.05, 0.1, 0.2],
            'n_estimators': [100, 200, 300, 500],
            'subsample': [0.7, 0.8, 0.9, 1.0],
            'colsample_bytree': [0.7, 0.8, 0.9, 1.0],
            'min_child_weight': [1, 3, 5],
            'gamma': [0, 0.1, 0.5]
        }

        xgb = XGBRegressor(random_state=42, objective='reg:squarederror')
        n_splits = min(5, len(X_train)) if len(X_train) > 1 else 2
        kfold = KFold(n_splits=n_splits, shuffle=True, random_state=42)
        
        logger.info("Starting Hyperparameter Tuning...")
        random_search = RandomizedSearchCV(
            xgb, param_distributions=param_dist, n_iter=20, cv=kfold, 
            scoring='r2', n_jobs=-1, random_state=42, verbose=0
        )
        random_search.fit(X_train, y_train)
        
        best_model = random_search.best_estimator_
        
        # 5. Evaluation
        y_train_pred = best_model.predict(X_train)
        y_test_pred = best_model.predict(X_test)
        
        train_r2 = r2_score(y_train, y_train_pred)
        test_r2 = r2_score(y_test, y_test_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
        mae = mean_absolute_error(y_test, y_test_pred)
        
        logger.info(f"Model Optimized. Test R2: {test_r2:.4f}, RMSE: {rmse:.2f}")

        # 6. Save Model Artifacts
        # Store in local storage/models specific to this dataset/run
        model_dir = Path(f'./storage/models/{dataset_id}')
        model_dir.mkdir(parents=True, exist_ok=True)
        
        model_path = model_dir / 'xgboost_clv.pkl'
        scaler_path = model_dir / 'scaler.pkl'
        imputer_path = model_dir / 'imputer.pkl'
        
        joblib.dump(best_model, model_path)
        joblib.dump(scaler, scaler_path)
        joblib.dump(imputer, imputer_path)

        output = {
            'success': True,
            'metrics': {
                'train_r2': float(train_r2),
                'test_r2': float(test_r2),
                'rmse': float(rmse),
                'mae': float(mae),
                'cv_score': float(random_search.best_score_),
                'best_params': random_search.best_params_
            },
            'model_info': {
                'model_path': str(model_path),
                'scaler_path': str(scaler_path),
                'imputer_path': str(imputer_path),
                'features_used': list(X.columns)
            },
            'data_shape': list(df.shape)
        }
        print(json.dumps(output))

    except Exception as e:
        logger.error(f"Critical ML Pipeline Error: {str(e)}")
        output = {
            'success': False,
            'error': str(e),
        }
        print(json.dumps(output))
        sys.exit(1)

if __name__ == '__main__':
    main()
