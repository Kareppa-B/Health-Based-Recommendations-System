import joblib
import numpy as np
import random
import pandas as pd
import os

# ---------------------- LOAD MODELS AND DATA ---------------------- #
BASE_PATH = os.path.dirname(os.path.abspath(__file__)) # Current dataset directory
CLEANED_DATA_PATH = os.path.join(BASE_PATH, "recipes_with_suitability_cleaned.csv")

try:
    disease_models = joblib.load(os.path.join(BASE_PATH, 'disease_models.pkl'))
    preference_models = joblib.load(os.path.join(BASE_PATH, 'preference_models.pkl'))
    scaler = joblib.load(os.path.join(BASE_PATH, 'scaler.pkl'))
    recipe_info = joblib.load(os.path.join(BASE_PATH, 'recipe_info.pkl'))
    metadata = joblib.load(os.path.join(BASE_PATH, 'metadata.pkl'))
    
    # Load the detailed, corrected recipe data
    food_details_df = pd.read_csv(CLEANED_DATA_PATH)
    food_details_df.set_index('RecipeId', inplace=True)

except FileNotFoundError as e:
    print(f"❌ Error loading a required file: {e}")
    print("Please make sure all model files and the 'recipes_fully_corrected.csv' are in the correct paths.")
    exit()

feature_cols = metadata['feature_cols']
DISEASE_MAPPING = metadata['disease_mapping']
PREFERENCE_MAPPING = metadata['preference_mapping']

# ---------------------- RECOMMENDATION FUNCTION ---------------------- #
def recommend_recipes(user_diseases, user_preference, top_n=10):
    if not user_diseases or 'none of these' in user_diseases:
        user_diseases = []

    X = recipe_info[feature_cols].values
    X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
    X_scaled = scaler.transform(X)
    
    disease_scores = np.ones(len(recipe_info))
    if user_diseases:
        disease_score_list = []
        for disease in user_diseases:
            if disease in disease_models:
                proba = disease_models[disease].predict_proba(X_scaled)[:, 1]
                disease_score_list.append(proba)
        if disease_score_list:
            disease_scores = np.min(disease_score_list, axis=0)
    
    preference_scores = np.zeros(len(recipe_info))
    if user_preference in preference_models:
        preference_scores = preference_models[user_preference].predict_proba(X_scaled)[:, 1]
    
    if user_diseases:
        final_scores = 0.5 * disease_scores + 0.5 * preference_scores
    else:
        final_scores = preference_scores
    
    noise = np.random.normal(0, 0.02, len(final_scores))
    randomized_scores = np.clip(final_scores + noise, 0, 1)
    
    top_indices = np.argsort(randomized_scores)[::-1][:30]
    random.shuffle(list(top_indices))
    top_indices = top_indices[:top_n]
    
    recommendations = []
    for rank, idx in enumerate(top_indices, 1):
        recommendations.append({
            'Rank': rank,
            'RecipeId': int(recipe_info.iloc[idx]['RecipeId']),
            'Suitability_Score': f"{randomized_scores[idx]:.4f}",
        })
    return recommendations

# ---------------------- USER INTERFACE ---------------------- #
print("Welcome to the Smart Food Recommendation System!\n")

print("Select your diseases (type numbers separated by commas, or 0 for 'none of these'):")
disease_list = list(DISEASE_MAPPING.keys())
for idx, disease in enumerate(disease_list, 1):
    print(f"{idx}. {disease}")
print("0. None of these")

while True:
    disease_input = input("\nYour choice: ").strip()
    if disease_input == "0":
        user_diseases = ['none of these']
        break
    try:
        selected_indices = [int(i) for i in disease_input.replace(" ", ",").split(",") if i]
        valid_indices = [i for i in selected_indices if 1 <= i <= len(DISEASE_MAPPING)]
        if not valid_indices:
            print("No valid disease selected. Try again.")
            continue
        user_diseases = [disease_list[i - 1] for i in valid_indices]
        break
    except ValueError:
        print("Invalid input. Please enter numbers separated by commas (e.g., 1,3,5) or 0 for 'none of these'.")

print("\nSelect your health goal/preference (choose exactly 1):")
preference_list = list(PREFERENCE_MAPPING.keys())
for idx, pref in enumerate(preference_list, 1):
    print(f"{idx}. {pref}")

while True:
    pref_input = input("\nYour choice: ").strip()
    try:
        pref_index = int(pref_input)
        if 1 <= pref_index <= len(PREFERENCE_MAPPING):
            user_preference = preference_list[pref_index - 1]
            break
        else:
            print("Invalid number. Please choose a number from the list.")
    except ValueError:
        print("Invalid input. Please enter a single number.")

# ---------------------- GENERATE AND DISPLAY DETAILED RECOMMENDATIONS ---------------------- #
print("\nGenerating top food recommendations...\n")
recommendations = recommend_recipes(user_diseases, user_preference, top_n=5)

print("Here are your personalized recommendations:")
print("=" * 80)

for rec in recommendations:
    recipe_id = rec['RecipeId']
    
    try:
        details = food_details_df.loc[recipe_id]
        print(f"⭐ Rank #{rec['Rank']}: {details['Name']}")
        # print(f"   (Suitability Score: {rec['Suitability_Score']})")
        print("-" * 50)
        print(f"**Category:** {details['RecipeCategory']}")
        print(f"**Keywords:** {details['Keywords']}\n")
        print(f"**Description:** {details['Description']}\n")
        print(f"**Image URL:** {details['Images']}\n")
        print("**Nutrition Facts:**")
        print(f"  - Calories:         {details['Calories']:.0f} kcal")
        print(f"  - Protein:          {details['ProteinContent']:.1f}g")
        print(f"  - Fat:              {details['FatContent']:.1f}g")
        print(f"  - Carbohydrates:    {details['CarbohydrateContent']:.1f}g")
        print(f"  - Sugar:            {details['SugarContent']:.1f}g\n")
        print("**Ingredients:** {details['RecipeIngredientParts']}\n")
        print("**Instructions:**\n{details['RecipeInstructions']}")
        print("\n" + "=" * 80 + "\n")

    except KeyError:
        print(f"\nCould not find details for recommended Recipe ID: {recipe_id}")
        print("=" * 80)