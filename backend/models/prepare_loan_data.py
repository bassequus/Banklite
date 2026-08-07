import os
import pandas as pd

RAW_PATH = "models/raw_data/loan_approval_train.csv"
OUTPUT_DIR = "models/processed_data"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "loan_approval_cleaned.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)

df = pd.read_csv(RAW_PATH)

print("Original shape:", df.shape)
print("Original columns:", df.columns.tolist())
print("\nMissing values before cleaning:\n", df.isnull().sum())

# Standardize column names
df.columns = [col.strip().lower() for col in df.columns]

# Fill missing categorical values with mode
categorical_cols = [
    "gender",
    "married",
    "dependents",
    "self_employed",
    "loan_amount_term",
    "credit_history"
]

for col in categorical_cols:
    if col in df.columns:
        mode_value = df[col].mode()[0]
        df[col] = df[col].fillna(mode_value)

# Fill missing numerical values with median
numerical_cols = [
    "applicantincome",
    "coapplicantincome",
    "loanamount"
]

for col in numerical_cols:
    if col in df.columns:
        median_value = df[col].median()
        df[col] = df[col].fillna(median_value)

# Clean dependents column (replace 3+ with 3)
if "dependents" in df.columns:
    df["dependents"] = df["dependents"].replace("3+", "3")
    df["dependents"] = df["dependents"].astype(int)

# Convert credit_history to int if present
if "credit_history" in df.columns:
    df["credit_history"] = df["credit_history"].astype(int)

# Create useful engineered features
if "applicantincome" in df.columns and "coapplicantincome" in df.columns:
    df["total_income"] = df["applicantincome"] + df["coapplicantincome"]
else:
    df["total_income"] = 0

if "loanamount" in df.columns and "total_income" in df.columns:
    df["loan_income_ratio"] = df["loanamount"] / (df["total_income"] + 1)

# Convert target column Loan_Status to numeric
if "loan_status" in df.columns:
    df["loan_status"] = df["loan_status"].map({"Y": 1, "N": 0})

# Drop Loan_ID because it is just an identifier
if "loan_id" in df.columns:
    df = df.drop(columns=["loan_id"])

print("\nMissing values after cleaning:\n", df.isnull().sum())
print("\nCleaned shape:", df.shape)
print("\nCleaned columns:", df.columns.tolist())
print("\nPreview:\n", df.head())

df.to_csv(OUTPUT_PATH, index=False)

print(f"\nCleaned dataset saved successfully at: {OUTPUT_PATH}")