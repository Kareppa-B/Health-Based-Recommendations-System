import pandas as pd

# --- Configuration ---
# The name of the file you want to modify.
filename = 'food_with_full_restaurants.csv'
# --------------------

try:
    print(f"Reading the file: '{filename}'...")
    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv(filename)
    
    print("Updating prices from 'for 2 people' to 'for 1 person'...")
    
    # A flag to check if any price columns were found and updated
    updated_columns = []

    # Loop through the 5 sets of restaurant columns
    for i in range(1, 6):
        # Construct the exact name of the price column for each restaurant
        price_col_name = f'Restaurant_{i}_Price_for_2'

        # Check if this price column actually exists in the file
        if price_col_name in df.columns:
            # Convert column to numbers, forcing any non-numeric values into NaN
            df[price_col_name] = pd.to_numeric(df[price_col_name], errors='coerce')
            
            # Divide the price by 2 and round to the nearest whole number
            # .fillna(0) handles any cells that might have been empty
            df[price_col_name] = (df[price_col_name] / 2).fillna(0).round(0).astype(int)
            
            updated_columns.append(price_col_name)

    if updated_columns:
        # Save the modified DataFrame back to the SAME file
        df.to_csv(filename, index=False)
        print("\n✅ Success! The following price columns have been updated:")
        for col in updated_columns:
            print(f" - {col}")
    else:
        print("\n❌ Warning: No price columns matching the pattern 'Restaurant_*_Price_for_2' were found.")
        print("No changes were made to the file.")
        print(f"Available columns are: {df.columns.tolist()}")

except FileNotFoundError:
    print(f"❌ Error: The file '{filename}' was not found. Please make sure it's in the same directory as this script.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")