import pandas as pd
import sys
import json

try:
    # --- Make sure this CSV file is in the same folder as this script ---
    CSV_FILE_PATH = 'recipes_with_suitability_cleaned.csv'
    
    # Load the dataset
    df = pd.read_csv(CSV_FILE_PATH)

    # Check if the dataframe is empty
    if df.empty:
        raise ValueError("The CSV file is empty or could not be read properly.")

    # Select 50 random food items. random_state ensures you get the same "random" list each time for consistency.
    sample_df = df.sample(n=50, random_state=42)

    # Convert the sample to a JSON string and print it to standard output
    # This is the data that Node.js will receive on success.
    print(sample_df.to_json(orient='records'))

except FileNotFoundError:
    # This error is sent to standard error if the CSV file is missing.
    print(f"Error: The file '{CSV_FILE_PATH}' was not found.", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    # All other errors are sent to standard error.
    print(f"An error occurred in get_all_foods.py: {e}", file=sys.stderr)
    sys.exit(1)