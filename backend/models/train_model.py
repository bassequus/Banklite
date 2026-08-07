# train_model.py

# -----------------------------
# 1. Import required libraries
# -----------------------------
import os
import pandas as pd
import joblib

# train_test_split is used to divide the dataset into training and testing parts
from sklearn.model_selection import train_test_split

# RandomForestClassifier is a good beginner-friendly model for tabular data
from sklearn.ensemble import RandomForestClassifier

# accuracy_score and classification_report help us evaluate model performance
from sklearn.metrics import accuracy_score, classification_report


# ---------------------------------------------------
# 2. Define file paths for input and saved output
# ---------------------------------------------------
INPUT_PATH = "models/processed_data/loan_approval_cleaned.csv"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "loan_model.pkl")
FEATURE_COLUMNS_PATH = os.path.join(MODEL_DIR, "feature_columns.pkl")

# Create the models folder if it does not exist
os.makedirs(MODEL_DIR, exist_ok=True)


# -----------------------------------
# 3. Load the cleaned training data
# -----------------------------------
df = pd.read_csv(INPUT_PATH)

print("Dataset loaded successfully")
print("Shape of dataset:", df.shape)
print("Columns:", df.columns.tolist())


# ------------------------------------------------------------
# 4. Separate target column from input feature columns
# ------------------------------------------------------------
# loan_status is the value we want to predict
target_column = "loan_status"

# X = all input columns except the target
X = df.drop(columns=[target_column])

# y = the target column only
y = df[target_column]


# -----------------------------------------------------------------
# 5. Convert categorical text columns into numeric dummy columns
# -----------------------------------------------------------------
# Machine learning models cannot directly understand text values
# like "Male", "Graduate", or "Urban", so we convert them to numbers
# using one-hot encoding with pandas get_dummies().
X = pd.get_dummies(X, drop_first=True)

print("\nFeatures after encoding:")
print(X.columns.tolist())


# ------------------------------------------------------------
# 6. Save the final feature column names for future prediction
# ------------------------------------------------------------
# This is very important because when the Flask API receives
# new loan data later, it must create features in the exact
# same order as the model was trained on.
joblib.dump(X.columns.tolist(), FEATURE_COLUMNS_PATH)


# ---------------------------------------------------------
# 7. Split data into training set and testing set
# ---------------------------------------------------------
# 80% of data is used for training
# 20% is used for testing
# random_state=42 keeps results consistent each time you run
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("\nTraining set shape:", X_train.shape)
print("Testing set shape:", X_test.shape)


# ---------------------------------------
# 8. Create and train the ML model
# ---------------------------------------
# RandomForestClassifier builds many decision trees and combines
# their results. It usually works well on structured datasets.
model = RandomForestClassifier(
    n_estimators=100,     # number of trees
    random_state=42
)

# Train the model using the training data
model.fit(X_train, y_train)


# ---------------------------------------
# 9. Test the trained model
# ---------------------------------------
# Make predictions on the test data
y_pred = model.predict(X_test)

# Measure model accuracy
accuracy = accuracy_score(y_test, y_pred)

print("\nModel Accuracy:", round(accuracy * 100, 2), "%")

# Print a detailed performance report
print("\nClassification Report:")
print(classification_report(y_test, y_pred))


# ---------------------------------------
# 10. Save the trained model to a file
# ---------------------------------------
joblib.dump(model, MODEL_PATH)

print(f"\nModel saved successfully at: {MODEL_PATH}")
print(f"Feature columns saved successfully at: {FEATURE_COLUMNS_PATH}")