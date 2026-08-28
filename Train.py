
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report
# from imblearn.over_sampling import SMOTE
import joblib
import warnings
warnings.filterwarnings('ignore')

# Load dataset
print("Loading dataset...")
df = pd.read_csv('/content/drive/MyDrive/dataset/recipes_with_suitability.csv')

print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"\nFirst few rows:")
print(df.head())

# Define disease and preference mappings
DISEASE_MAPPING = {
    'Diabetes': 'Suitable_Diabetes',
    'Heart Disease': 'Suitable_Heart_Disease',
    'Kidney Disease': 'Suitable_Kidney_Disease',
    'Obesity': 'Suitable_Obesity',
    'Hypertension': 'Suitable_Hypertension',
    'Cholesterol': 'Suitable_Cholesterol',
    'Liver Disease': 'Suitable_Liver_Disease',
    'Anemia': 'Suitable_Anemia',
    'Asthma': 'Suitable_Asthma',
    'Thyroid': 'Suitable_Thyroid',
    'Gallstones': 'Suitable_Gallstones'
}

PREFERENCE_MAPPING = {
    'Weight Loss': 'Weight Loss',
    'Weight Gain': 'Weight Gain',
    'Muscle Building': 'Muscle Building',
    'Maintain Current Health': 'Maintain Current Health'
}

disease_cols = list(DISEASE_MAPPING.values())
preference_cols = list(PREFERENCE_MAPPING.values())

print("\n" + "="*50)
print("VALID USER INPUTS")
print("="*50)
print("\nDiseases (0 or more):")
for disease in DISEASE_MAPPING.keys():
    print(f"  - {disease}")
print("  - none of these")

print("\nPreferences (exactly 1 required):")
for preference in PREFERENCE_MAPPING.keys():
    print(f"  - {preference}")

# Feature engineering
print("\n" + "="*50)
print("Feature Engineering")
print("="*50)

# Select nutritional features
feature_cols = [
    'Calories', 'FatContent', 'SaturatedFatContent', 'CholesterolContent',
    'SodiumContent', 'CarbohydrateContent', 'FiberContent', 'SugarContent',
    'ProteinContent'
]

# Handle missing values
df[feature_cols] = df[feature_cols].fillna(df[feature_cols].median())

# Create derived features for better prediction
df['CaloriePerGramFat'] = df['Calories'] / (df['FatContent'] + 1)
df['ProteinToCarb'] = df['ProteinContent'] / (df['CarbohydrateContent'] + 1)
df['FiberToCalorie'] = df['FiberContent'] / (df['Calories'] + 1)
df['SugarToCarb'] = df['SugarContent'] / (df['CarbohydrateContent'] + 1)
df['HealthyFatRatio'] = (df['FatContent'] - df['SaturatedFatContent']) / (df['FatContent'] + 1)
df['ProteinDensity'] = df['ProteinContent'] / (df['Calories'] + 1)

# Add derived features to feature list
feature_cols.extend([
    'CaloriePerGramFat', 'ProteinToCarb', 'FiberToCalorie', 
    'SugarToCarb', 'HealthyFatRatio', 'ProteinDensity'
])

# Prepare features
X = df[feature_cols].values

# Handle any remaining NaN or inf values
X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print(f"Feature matrix shape: {X_scaled.shape}")
print(f"Total features: {len(feature_cols)}")

# ============================================
# Train individual disease models
# ============================================
disease_models = {}
disease_accuracies = {}

print("\n" + "="*50)
print("Training Disease-Specific Models")
print("="*50)

for disease_name, disease_col in DISEASE_MAPPING.items():
    print(f"\nTraining model for: {disease_name}")
    
    # Prepare labels (1 = suitable, 0 = not suitable)
    y = df[disease_col].fillna(0).astype(int).values
    
    # Check class distribution
    unique, counts = np.unique(y, return_counts=True)
    print(f"Class distribution: {dict(zip(unique, counts))}")
    
    if len(unique) < 2:
        print(f"Warning: Only one class present for {disease_name}. Skipping...")
        continue
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Apply SMOTE if imbalanced
    if min(counts) / max(counts) < 0.3:
        print("Applying SMOTE for class balancing...")
        try:
            smote = SMOTE(random_state=42, k_neighbors=min(5, min(counts)-1))
            X_train, y_train = smote.fit_resample(X_train, y_train)
            print(f"After SMOTE: {len(y_train)} samples")
        except:
            print("SMOTE failed, continuing with original data...")
    
    # Train Gradient Boosting model
    model = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=5,
        min_samples_split=10,
        min_samples_leaf=5,
        subsample=0.8,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Not Suitable', 'Suitable']))
    
    # Store model and accuracy
    disease_models[disease_name] = model
    disease_accuracies[disease_name] = accuracy

# ============================================
# Train preference models
# ============================================
preference_models = {}
preference_accuracies = {}

print("\n" + "="*50)
print("Training Preference-Specific Models")
print("="*50)

for pref_name, pref_col in PREFERENCE_MAPPING.items():
    print(f"\nTraining model for: {pref_name}")
    
    # Prepare labels
    y = df[pref_col].fillna(0).astype(int).values
    
    # Check class distribution
    unique, counts = np.unique(y, return_counts=True)
    print(f"Class distribution: {dict(zip(unique, counts))}")
    
    if len(unique) < 2:
        print(f"Warning: Only one class present for {pref_name}. Skipping...")
        continue
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Apply SMOTE if needed
    if min(counts) / max(counts) < 0.3:
        print("Applying SMOTE for class balancing...")
        try:
            smote = SMOTE(random_state=42, k_neighbors=min(5, min(counts)-1))
            X_train, y_train = smote.fit_resample(X_train, y_train)
            print(f"After SMOTE: {len(y_train)} samples")
        except:
            print("SMOTE failed, continuing with original data...")
    
    # Train model
    model = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=5,
        min_samples_split=10,
        min_samples_leaf=5,
        subsample=0.8,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Not Suitable', 'Suitable']))
    
    # Store model and accuracy
    preference_models[pref_name] = model
    preference_accuracies[pref_name] = accuracy

# ============================================
# Display overall results
# ============================================
print("\n" + "="*50)
print("MODEL TRAINING SUMMARY")
print("="*50)

print("\nDisease Models Accuracy:")
for disease, acc in disease_accuracies.items():
    status = "✓ EXCELLENT" if acc >= 0.85 else "✓ GOOD" if acc >= 0.80 else "⚠ NEEDS IMPROVEMENT"
    print(f"  {disease:25s}: {acc:.4f} {status}")

avg_disease_acc = np.mean(list(disease_accuracies.values())) if disease_accuracies else 0
print(f"\n  Average Disease Model Accuracy: {avg_disease_acc:.4f}")

print("\nPreference Models Accuracy:")
for pref, acc in preference_accuracies.items():
    status = "✓ EXCELLENT" if acc >= 0.85 else "✓ GOOD" if acc >= 0.80 else "⚠ NEEDS IMPROVEMENT"
    print(f"  {pref:30s}: {acc:.4f} {status}")

avg_pref_acc = np.mean(list(preference_accuracies.values())) if preference_accuracies else 0
print(f"\n  Average Preference Model Accuracy: {avg_pref_acc:.4f}")

overall_avg = np.mean(list(disease_accuracies.values()) + list(preference_accuracies.values()))
print(f"\n{'='*50}")
print(f"OVERALL AVERAGE ACCURACY: {overall_avg:.4f}")
print(f"{'='*50}")

# ============================================
# Save models and necessary data
# ============================================
print("\n" + "="*50)
print("Saving Models and Data")
print("="*50)

# Create metadata
metadata = {
    'disease_mapping': DISEASE_MAPPING,
    'preference_mapping': PREFERENCE_MAPPING,
    'disease_accuracies': disease_accuracies,
    'preference_accuracies': preference_accuracies,
    'overall_accuracy': overall_avg,
    'feature_cols': feature_cols
}

# Save models
joblib.dump(disease_models, '/content/drive/MyDrive/dataset/disease_models.pkl')
joblib.dump(preference_models, '/content/drive/MyDrive/dataset/preference_models.pkl')
joblib.dump(scaler, '/content/drive/MyDrive/dataset/scaler.pkl')
joblib.dump(metadata, '/content/drive/MyDrive/dataset/metadata.pkl')

# Save recipe data for recommendation
recipe_info = df[['RecipeId', 'Name'] + feature_cols].copy()
joblib.dump(recipe_info, '/content/drive/MyDrive/dataset/recipe_info.pkl')

print("\nAll models and data saved successfully!")
print("Files saved in /content/drive/MyDrive/dataset/:")
print("  ✓ disease_models.pkl")
print("  ✓ preference_models.pkl")
print("  ✓ scaler.pkl")
print("  ✓ recipe_info.pkl")
print("  ✓ metadata.pkl")

# ============================================
# Create prediction function
# ============================================
def recommend_recipes(user_diseases, user_preference, top_n=10):
    """
    Recommend recipes based on user diseases and preference
    
    Parameters:
    - user_diseases: list of disease names or ['none of these']
      Examples: 
        ['Diabetes']
        ['Diabetes', 'Hypertension']
        ['none of these']
        []
    - user_preference: single preference (REQUIRED)
      Options: 'Weight Loss', 'Weight Gain', 'Muscle Building', 'Maintain Current Health'
    - top_n: number of recommendations to return
    
    Returns:
    - List of recommended recipes with scores
    """
    
    # Validate inputs
    if not user_preference or user_preference not in PREFERENCE_MAPPING:
        raise ValueError(f"Invalid preference. Must be one of: {list(PREFERENCE_MAPPING.keys())}")
    
    # Handle empty or 'none of these' diseases
    if not user_diseases or user_diseases == ['none of these'] or 'none of these' in user_diseases:
        user_diseases = []
    
    # Validate disease names
    for disease in user_diseases:
        if disease not in DISEASE_MAPPING:
            raise ValueError(f"Invalid disease: {disease}. Must be one of: {list(DISEASE_MAPPING.keys())}")
    
    # Load models and data
    disease_models = joblib.load('/content/drive/MyDrive/dataset/disease_models.pkl')
    preference_models = joblib.load('/content/drive/MyDrive/dataset/preference_models.pkl')
    scaler = joblib.load('/content/drive/MyDrive/dataset/scaler.pkl')
    recipe_info = joblib.load('/content/drive/MyDrive/dataset/recipe_info.pkl')
    metadata = joblib.load('/content/drive/MyDrive/dataset/metadata.pkl')
    
    feature_cols = metadata['feature_cols']
    
    # Prepare features
    X = recipe_info[feature_cols].values
    X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
    X_scaled = scaler.transform(X)
    
    # Initialize scores
    disease_scores = np.ones(len(recipe_info))  # Start with neutral score
    
    # Calculate disease suitability scores
    if user_diseases:
        disease_score_list = []
        
        for disease in user_diseases:
            if disease in disease_models:
                # Get probability of being suitable for this disease
                proba = disease_models[disease].predict_proba(X_scaled)[:, 1]
                disease_score_list.append(proba)
        
        if disease_score_list:
            # Take the MINIMUM score across all diseases
            # A recipe must be suitable for ALL diseases
            disease_scores = np.min(disease_score_list, axis=0)
    else:
        # No diseases: all recipes equally suitable (score = 1.0)
        disease_scores = np.ones(len(recipe_info))
    
    # Calculate preference scores
    preference_scores = np.zeros(len(recipe_info))
    if user_preference in preference_models:
        preference_scores = preference_models[user_preference].predict_proba(X_scaled)[:, 1]
    
    # Combine scores
    # If diseases present: 50% disease suitability + 50% preference match
    # If no diseases: 100% preference match
    if user_diseases:
        final_scores = 0.5 * disease_scores + 0.5 * preference_scores
    else:
        final_scores = preference_scores
    
    # Get top recommendations
    top_indices = np.argsort(final_scores)[::-1][:top_n]
    
    recommendations = []
    for rank, idx in enumerate(top_indices, 1):
        recommendations.append({
            'Rank': rank,
            'Recipe': recipe_info.iloc[idx]['Name'],
            'RecipeId': int(recipe_info.iloc[idx]['RecipeId']),
            'Suitability_Score': f"{final_scores[idx]:.4f}",
            'Disease_Score': f"{disease_scores[idx]:.4f}",
            'Preference_Score': f"{preference_scores[idx]:.4f}"
        })
    
    return recommendations

# ============================================
# Test the recommendation system
# ============================================
print("\n" + "="*50)
print("TESTING RECOMMENDATION SYSTEM")
print("="*50)

# Test case 1: Single disease + preference
print("\n" + "-"*50)
print("Test Case 1: Single Disease")
print("-"*50)
print("Input: Diabetes + Weight Loss")
try:
    recommendations = recommend_recipes(['Diabetes'], 'Weight Loss', top_n=5)
    for rec in recommendations:
        print(f"{rec['Rank']}. {rec['Recipe']}")
        print(f"   Overall: {rec['Suitability_Score']} | Disease: {rec['Disease_Score']} | Preference: {rec['Preference_Score']}")
except Exception as e:
    print(f"Error: {e}")

# Test case 2: Multiple diseases + preference
print("\n" + "-"*50)
print("Test Case 2: Multiple Diseases")
print("-"*50)
print("Input: Heart Disease + Hypertension + Cholesterol + Maintain Current Health")
try:
    recommendations = recommend_recipes(
        ['Heart Disease', 'Hypertension', 'Cholesterol'], 
        'Maintain Current Health', 
        top_n=5
    )
    for rec in recommendations:
        print(f"{rec['Rank']}. {rec['Recipe']}")
        print(f"   Overall: {rec['Suitability_Score']} | Disease: {rec['Disease_Score']} | Preference: {rec['Preference_Score']}")
except Exception as e:
    print(f"Error: {e}")

# Test case 3: No diseases + preference
print("\n" + "-"*50)
print("Test Case 3: No Diseases")
print("-"*50)
print("Input: none of these + Muscle Building")
try:
    recommendations = recommend_recipes(['none of these'], 'Muscle Building', top_n=5)
    for rec in recommendations:
        print(f"{rec['Rank']}. {rec['Recipe']}")
        print(f"   Overall: {rec['Suitability_Score']} | Preference: {rec['Preference_Score']}")
except Exception as e:
    print(f"Error: {e}")

# Test case 4: Empty diseases list + preference
print("\n" + "-"*50)
print("Test Case 4: Empty Disease List")
print("-"*50)
print("Input: [] + Weight Gain")
try:
    recommendations = recommend_recipes([], 'Weight Gain', top_n=5)
    for rec in recommendations:
        print(f"{rec['Rank']}. {rec['Recipe']}")
        print(f"   Overall: {rec['Suitability_Score']} | Preference: {rec['Preference_Score']}")
except Exception as e:
    print(f"Error: {e}")

# Test case 5: Complex combination
print("\n" + "-"*50)
print("Test Case 5: Complex Combination")
print("-"*50)
print("Input: Diabetes + Obesity + Kidney Disease + Weight Loss")
try:
    recommendations = recommend_recipes(
        ['Diabetes', 'Obesity', 'Kidney Disease'], 
        'Weight Loss', 
        top_n=5
    )
    for rec in recommendations:
        print(f"{rec['Rank']}. {rec['Recipe']}")
        print(f"   Overall: {rec['Suitability_Score']} | Disease: {rec['Disease_Score']} | Preference: {rec['Preference_Score']}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50)
print("✓ Training and Testing Complete!")
print("="*50)
print("\nTo use in your application:")
print("recommendations = recommend_recipes(")
print("    user_diseases=['Diabetes', 'Hypertension'],  # 0 or more diseases")
print("    user_preference='Weight Loss',                # Exactly 1 preference")
print("    top_n=10")
print(")")