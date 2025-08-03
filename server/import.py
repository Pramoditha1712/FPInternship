import pandas as pd
from pymongo import MongoClient
import bcrypt
import re
import uuid
from dateutil import parser

# ✅ Load Excel
df = pd.read_excel(r"/Users/pramodithakathari/Desktop/2/2025-26 Internship Candidates Details form (Responses).xlsx")
df.columns = df.columns.str.strip().str.replace("\n", " ").str.replace("  ", " ", regex=False)

# ✅ Connect to MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["internship"]
users_collection = db["users"]
internships_collection = db["internships"]

# ✅ Safe value getter
def get_safe_value(row, column, default=None):
    value = row.get(column, default)
    if pd.isna(value):
        return default
    if isinstance(value, str):
        return value.strip()
    return value

# ✅ Extract numeric value (for duration/package)
def extract_numeric(value):
    if not value:
        return 0.0
    match = re.search(r"\b\d+(?:\.\d+)?\b", str(value))
    if match:
        try:
            return float(match.group())
        except:
            return 0.0
    return 0.0

# ✅ Robust date parser (assumes MM/DD/YYYY, with fallback)
def parse_excel_date(date_str):
    if pd.isna(date_str):
        return None
    try:
        # If format is strictly MM/DD/YYYY
        return pd.to_datetime(date_str, format='%m/%d/%Y', errors='coerce')
    except:
        try:
            # Fallback to flexible parser
            return parser.parse(str(date_str))
        except:
            return None

# ✅ Clean and deduplicate users
df_cleaned = df.dropna(subset=["Roll No.", "Name of the Student", "Email-id of student"], how="any")
df_cleaned = df_cleaned[df_cleaned["Roll No."].astype(str).str.strip() != ""]
df_cleaned.drop_duplicates(subset="Roll No.", inplace=True)

# ✅ Hashed password
default_password = "vnrvjiet"
hashed_password = bcrypt.hashpw(default_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# ✅ Prepare user documents
def map_user(row):
    return {
        "rollNo": get_safe_value(row, "Roll No."),
        "name": get_safe_value(row, "Name of the Student"),
        "semester": get_safe_value(row, "Semester"),
        "section": get_safe_value(row, "Section"),
        "email": get_safe_value(row, "Email-id of student"),
        "branch": get_safe_value(row, "Branch"),
        "password": hashed_password,
        "role": "student"
    }

users_all = df_cleaned.apply(map_user, axis=1).tolist()

# ✅ Filter only new users
existing_rolls = set(x.get("rollNo") for x in users_collection.find({}, {"rollNo": 1}) if x.get("rollNo"))
existing_emails = set(x.get("email") for x in users_collection.find({}, {"email": 1}) if x.get("email"))
users_to_insert = [u for u in users_all if u["rollNo"] not in existing_rolls and u["email"] not in existing_emails]

# ✅ Insert users
if users_to_insert:
    users_collection.insert_many(users_to_insert, ordered=False)
    print(f"✅ Inserted {len(users_to_insert)} users.")
else:
    print("ℹ️ No new users to insert.")

def map_internship(row):
    roll_no = get_safe_value(row, "Roll No.")
    start = pd.to_datetime(get_safe_value(row, "Starting Date"), errors='coerce')
    end = pd.to_datetime(get_safe_value(row, "Ending Date"), errors='coerce')

    return {
        "internshipID": str(uuid.uuid4()),
        "rollNo": roll_no,
        "startingDate": start,
        "endingDate": end,
        "offerLetter": get_safe_value(row, "Internship Offer Letter - RollNo_ol.pdf Example - 22071A0508_ol.pdf"),
        "applicationLetter": get_safe_value(row, "Application to HoD by student Letter - RollNo_iapp.pdf Example - 22071A0508_iapp.pdf"),
        "noc": get_safe_value(row, "NOC by HoD to student - RollNo_inoc.pdf Example - 22071A0508_inoc.pdf"),
        "role": get_safe_value(row, "Role of student in Company"),
        "organizationName": get_safe_value(row, "Name of the Organization for Internship"),
        "hrName": get_safe_value(row, "HR-Name or Name of the Point of Contact"),
        "hrEmail": get_safe_value(row, "email-id of point of contact in the organization of internship"),
        "hrPhone": get_safe_value(row, "Mobile Number of point of contact in the organization of internship"),
        "duration": extract_numeric(get_safe_value(row, "Duration of Internship - Ex: 1 Month, 2 Months, 1.5 Months, 2.5 Months")),
        "package": extract_numeric(get_safe_value(row, "Pay Package per month Eg: 15000, 20000 etc.")),
        "semester": get_safe_value(row, "Semester"),
        "branch": get_safe_value(row, "Branch"),
        "section": get_safe_value(row, "Section"),
        "status": "Pending"
    }


# ✅ Create internships list
internships_all = df_cleaned.apply(map_internship, axis=1).tolist()

# ✅ Insert internships (no filter for duplicates here; adjust if needed)
if internships_all:
    internships_collection.insert_many(internships_all, ordered=False)
    print(f"✅ Inserted {len(internships_all)} internships.")
else:
    print("ℹ️ No internships to insert.")
