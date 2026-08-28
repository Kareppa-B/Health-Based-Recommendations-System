from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import warnings
import os
import random

# Suppress warnings
warnings.filterwarnings('ignore')

# --- 1. Initialize the Flask Application ---
app = Flask(__name__)
CORS(app)

# ====================================================================
# ---       LOAD MODELS AND DATA (Done once on server start)       ---
# ====================================================================
try:
    print("Loading models and data...")
    # Load the trained models and scaler
    disease_models = joblib.load('disease_models.pkl')
    preference_models = joblib.load('preference_models.pkl')
    scaler = joblib.load('scaler.pkl')
    recipe_info_df = joblib.load('recipe_info.pkl') # Used for feature matrix
    metadata = joblib.load('metadata.pkl')
    
    # --- SIMPLIFIED AND ROBUST DATA LOADING ---
    print("Loading recipe details...")
    base_recipes_df = pd.read_csv("recipes_with_suitability_cleaned.csv")
    print("Loading restaurant data...")
    restaurant_df = pd.read_csv("food_with_full_restaurants.csv")
    
    # 3. Merge them into a single, master dataframe using 'RecipeId' as the key.
    print("Merging recipe and restaurant data...")
    food_details_df = pd.merge(base_recipes_df, restaurant_df, on='RecipeId', how='left', suffixes=('', '_dup'))
    
    if 'Name_dup' in food_details_df.columns:
        food_details_df.drop(columns=['Name_dup'], inplace=True)
        
    food_details_df.set_index('RecipeId', inplace=True)
    
    print(f"[OK] Data merged successfully. Total records: {len(food_details_df)}")
    print("[OK] Models and data loaded successfully.")

except FileNotFoundError as e:
    print(f"FATAL ERROR: Could not load required file. Make sure all .pkl and .csv files are in the directory.")
    print(f"Details: {e}")
    exit()
except KeyError as e:
    print(f"FATAL ERROR: A required column (likely 'RecipeId') was not found in one of the CSV files.")
    print(f"Please run the 'check_columns.py' script to verify your column names. Details: {e}")
    exit()


# Extract metadata (unchanged)
FEATURE_COLS = metadata.get('feature_cols', [])
DISEASE_MAPPING = metadata.get('disease_mapping', {})
PREFERENCE_MAPPING = metadata.get('preference_mapping', {})

# Prepare the feature matrix (unchanged)
print("Preparing feature matrix...")
X_features = recipe_info_df[FEATURE_COLS].values
X_features = np.nan_to_num(X_features, nan=0.0, posinf=0.0, neginf=0.0)
X_scaled_features = scaler.transform(X_features)
print("[OK] Feature matrix ready.")


# ====================================================================
# ---           RECOMMENDATION ENGINE (UPDATED FOR PAGINATION)     ---
# ====================================================================
def recommend_recipes(user_diseases, user_preference, limit=20, offset=0):
    """
    Generates recommendations, applies scores, and returns a paged list of recipe IDs.
    
    Args:
        user_diseases (list): Active health conditions.
        user_preference (str): User's fitness goal.
        limit (int): Maximum number of recommendations to return (the page size).
        offset (int): Starting index for the recommendations (for pagination).
    """
    print(f"Generating recommendations for diseases: {user_diseases}, preference: {user_preference}")
    
    # Calculate Scores (unchanged)
    if user_diseases:
        disease_score_list = [disease_models[d].predict_proba(X_scaled_features)[:, 1] for d in user_diseases if d in disease_models]
        disease_scores = np.min(disease_score_list, axis=0) if disease_score_list else np.ones(len(recipe_info_df))
    else:
        disease_scores = np.ones(len(recipe_info_df))
        
    preference_scores = preference_models[user_preference].predict_proba(X_scaled_features)[:, 1] if user_preference in preference_models else np.zeros(len(recipe_info_df))
    final_scores = 0.5 * disease_scores + 0.5 * preference_scores if user_diseases else preference_scores
    
    # Add noise for randomization
    noise = np.random.normal(0, 0.02, len(final_scores))
    randomized_scores = np.clip(final_scores + noise, 0, 1)
    
    # Get all indices sorted by score
    top_indices_full = np.argsort(randomized_scores)[::-1]
    
    # Apply Pagination (Slicing)
    top_indices_paged = top_indices_full[offset : offset + limit]
    
    # Convert sliced indices to RecipeId and Score
    recommendations = [
        {'RecipeId': int(recipe_info_df.iloc[idx]['RecipeId']), 'Score': float(randomized_scores[idx])} 
        for idx in top_indices_paged
    ]
    
    print(f"Returning {len(recommendations)} recommendations (Offset: {offset}, Limit: {limit}).")
    return recommendations

# ====================================================================
# ---               API ENDPOINT LOGIC (UPDATED)                   ---
# ====================================================================
@app.route('/predict', methods=['POST'])
def predict():
    LIMIT = 20 # Fixed size for health recommendations per page
    try:
        data = request.get_json()
        print(f"\n--- ML Model API: Received Request ---")

        # Get the requested page number, default to 1
        requested_page = data.get('page', 1) 
        offset = (requested_page - 1) * LIMIT
        
        # --- ENRICHMENT HELPER FUNCTION (MOVED OUTSIDE IF BLOCK - FIX) ---
        # Defining this here ensures it is available for every request (page 1 and page > 1)
        def enrich_recommendations(raw_list):
            detailed_list = []
            # Note: We must adjust the Rank here based on the page offset for consistency
            for rank_index, rec in enumerate(raw_list):
                recipe_id = rec['RecipeId']
                try:
                    details = food_details_df.loc[recipe_id]
                    
                    restaurants_list = []
                    if pd.notna(details.get('Restaurant_1_Name')):
                        for i in range(1, 6):
                            restaurants_list.append({
                                'Name': details.get(f'Restaurant_{i}_Name'),
                                'Rating': details.get(f'Restaurant_{i}_Rating'),
                                'Price_for_2': int(details.get(f'Restaurant_{i}_Price_for_2', 0))
                            })
                    
                    detailed_rec = {
                        'Rank': rank_index + 1 + offset, 
                        'Name': details['Name'],
                        'Suitability_Score': f"{rec['Score']:.4f}",
                        'Category': details.get('RecipeCategory', 'N/A'),
                        'Keywords': details.get('Keywords', 'N/A'),
                        'Description': details.get('Description', 'No description available.'),
                        'ImageURL': details.get('Images', None),
                        'Nutrition': {
                            'Calories': f"{details.get('Calories', 0):.0f} kcal",
                            'Fat': f"{details.get('FatContent', 0):.1f}g",
                            'Cholesterol': f"{details.get('CholesterolContent', 0):.0f}mg",
                            'Sodium': f"{details.get('SodiumContent', 0):.0f}mg",
                            'Carbohydrates': f"{details.get('CarbohydrateContent', 0):.1f}g",
                            'Fiber': f"{details.get('FiberContent', 0):.1f}g",
                            'Sugar': f"{details.get('SugarContent', 0):.1f}g",
                            'Protein': f"{details.get('ProteinContent', 0):.1f}g"
                        },
                        'Ingredients': details.get('RecipeIngredientParts', 'Not available'),
                        'Instructions': details.get('RecipeInstructions', 'Not available'),
                        'Restaurants': restaurants_list 
                    }
                    detailed_list.append(detailed_rec)
                except KeyError:
                    print(f"Warning: Could not find details for recommended Recipe ID: {recipe_id}")
            return detailed_list
        # --- END ENRICHMENT HELPER FUNCTION ---


        # --- Translate frontend inputs (Unchanged) ---
        frontend_conditions = [c for c in data.get('conditions', []) if c != 'none']
        model_diseases_input = []
        for condition in frontend_conditions:
            for key, val in DISEASE_MAPPING.items():
                if condition.replace('-', '_').lower() == val.replace('Suitable_', '').lower():
                    model_diseases_input.append(key)
                    break
        frontend_goal = data.get('goals', ["maintain-health"])[0]
        model_preference_input = "Maintain Current Health"
        for key, val in PREFERENCE_MAPPING.items():
            if frontend_goal.replace('-', ' ').lower() == val.lower():
                model_preference_input = key
                break
        
        # --- 1. Get Health-Aware Recommendations (Paged) ---
        health_recommendations_raw = recommend_recipes(
            user_diseases=model_diseases_input,
            user_preference=model_preference_input,
            limit=LIMIT,
            offset=offset
        )
        
        # --- 2. Get General Recommendations (Only on Page 1) ---
        detailed_general_recommendations = []
        if requested_page == 1:
            # Fetch a larger list for frontend pagination (30 items)
            general_recommendations_raw = recommend_recipes(
                user_diseases=[], # Ignore health conditions
                user_preference=model_preference_input,
                limit=30,  # <--- Increased to 30
                offset=0
            )
            detailed_general_recommendations = enrich_recommendations(general_recommendations_raw)


        # --- Enrich Health Recommendations ---
        detailed_health_recommendations = enrich_recommendations(health_recommendations_raw)

        print(f"[OK] Successfully generated and enriched {len(detailed_health_recommendations)} health recommendations for page {requested_page}.")
        
        # --- RETURN BOTH LISTS (page 1) or JUST HEALTH (page > 1) ---
        return jsonify({
            'healthRecommendations': detailed_health_recommendations,
            'generalRecommendations': detailed_general_recommendations
        })

    except Exception as e:
        print(f"!!! An error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'An error occurred on the model server.'}), 500

# ====================================================================
# ---               RUN THE FLASK SERVER                           ---
# ====================================================================
if __name__ == '__main__':
    print("\nStarting Flask server for ML Model...")
    app.run(port=5001, debug=True)