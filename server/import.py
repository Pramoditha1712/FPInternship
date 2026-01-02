import pandas as pd
from pymongo import MongoClient
import bcrypt
import re
import uuid
from dateutil import parser
import difflib

# =========================
# 🔧 Load Excel
# =========================

file_path = r"/Users/pramodithakathari/Desktop/2025-26 Internship Candidates Details form (Responses).xlsx"
df = pd.read_excel(file_path)

# Normalize headers
df.columns = (
    df.columns.astype(str)
    .str.strip()
    .str.replace("\n", " ", regex=True)
    .str.replace(r"\s+", " ", regex=True)
    .str.replace('"', "", regex=False)
)

# =========================
# 🧠 Column Resolver
# =========================
def resolve_column(name, df_columns):
    matches = difflib.get_close_matches(name, df_columns, n=1, cutoff=0.3)
    return matches[0] if matches else None

COLS = {
    "roll": resolve_column("Roll No.", df.columns),
    "name": resolve_column("Name of the Student", df.columns),
    "email": resolve_column("Email-id of student", df.columns),
    "semester": resolve_column("Semester", df.columns),
    "section": resolve_column("Section", df.columns),
    "branch": resolve_column("Branch", df.columns),
    "start": resolve_column("Starting Date", df.columns),
    "end": resolve_column("Ending Date", df.columns),
    "role": resolve_column("Role of student in Company", df.columns),
    "org": resolve_column("Name of the Organization for Internship", df.columns),
    "hr_name": resolve_column("HR-Name or Name of the Point of Contact", df.columns),
    "hr_email": resolve_column("email-id of point of contact in the organization of internship", df.columns),
    "hr_phone": resolve_column("Mobile Number of point of contact in the organization of internship", df.columns),
    "duration": resolve_column("Duration of Internship - Ex: 1 Month, 2 Months, 1.5 Months, 2.5 Months", df.columns),
    "package": resolve_column("Pay Package per month Eg: 15000, 20000 etc.", df.columns),
    "offer": resolve_column("Internship Offer Letter - RollNo_ol.pdf Example - 22071A0508_ol.pdf", df.columns),
    "app_letter": resolve_column("Application to HoD by student Letter - RollNo_iapp.pdf Example - 22071A0508_iapp.pdf", df.columns),
    "noc": resolve_column("NOC by HoD to student - RollNo_inoc.pdf Example - 22071A0508_inoc.pdf", df.columns),
}

# Debug print to verify columns
print("Resolved Columns:")
for k, v in COLS.items():
    print(f"{k:10} → {v}")

# =========================
# ⚙️ MongoDB Setup
# =========================
client = MongoClient("mongodb://localhost:27017")
db = client["internship"]
users_collection = db["users"]
internships_collection = db["internships"]

# =========================
# 🧰 Helper Functions
# =========================
def get_safe_value(row, key, default=None):
    col = COLS.get(key)
    if not col or col not in row:
        return default
    val = row.get(col, default)
    if pd.isna(val):
        return default
    if isinstance(val, str):
        return val.strip()
    return val

def extract_numeric(value):
    if not value:
        return 0.0
    match = re.search(r"\d+(?:\.\d+)?", str(value))
    return float(match.group()) if match else 0.0

def parse_date(value):
    if pd.isna(value):
        return None
    try:
        dt = pd.to_datetime(value, errors='coerce')
        return dt.to_pydatetime() if dt is not pd.NaT else None
    except:
        try:
            return parser.parse(str(value))
        except:
            return None

# =========================
# 🧹 Clean Users
# =========================
required_cols = [COLS["roll"], COLS["name"], COLS["email"]]
required_cols = [c for c in required_cols if c]

if not required_cols:
    print("❌ No valid columns found for roll, name, or email. Please check your Excel headers.")
    print("Columns in Excel:", df.columns.tolist())
    exit()

df_cleaned = df.dropna(subset=required_cols)
df_cleaned = df_cleaned[df_cleaned[COLS["roll"]].astype(str).str.strip() != ""]
df_users = df_cleaned.drop_duplicates(subset=COLS["roll"])

# =========================
# 🔐 User Password Setup
# =========================
default_password = "vnrvjiet"
hashed_password = bcrypt.hashpw(default_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# =========================
# 👤 Prepare Users
# =========================
users_all = []
for _, row in df_users.iterrows():
    roll = get_safe_value(row, "roll")
    if not roll:
        continue
    users_all.append({
        "rollNo": roll,
        "name": get_safe_value(row, "name"),
        "semester": get_safe_value(row, "semester"),
        "section": get_safe_value(row, "section"),
        "email": get_safe_value(row, "email"),
        "branch": get_safe_value(row, "branch"),
        "password": hashed_password,
        "role": "student"
    })

# =========================
# 🧾 Insert Users (avoid duplicates)
# =========================
existing_rolls = set(x.get("rollNo") for x in users_collection.find({}, {"rollNo": 1}))
existing_emails = set(x.get("email") for x in users_collection.find({}, {"email": 1}))
users_to_insert = [u for u in users_all if u["rollNo"] not in existing_rolls and u["email"] not in existing_emails]

if users_to_insert:
    users_collection.insert_many(users_to_insert)
    print(f"✅ Inserted {len(users_to_insert)} new users.")
else:
    print("ℹ️ No new users to insert.")

# =========================
# 🏢 Prepare Internships
# =========================
internships_all = []
for _, row in df_cleaned.iterrows():
    roll = get_safe_value(row, "roll")
    if not roll:
        continue

    start = parse_date(get_safe_value(row, "start"))
    end = parse_date(get_safe_value(row, "end"))

    # Overlap check
    existing_interns = internships_collection.find({"rollNo": roll})
    for intern in existing_interns:
        ex_start = intern.get("startingDate")
        ex_end = intern.get("endingDate")
        if ex_start and ex_end and start and end:
            overlap = max(start, ex_start) <= min(end, ex_end)
            if overlap:
                print(f"⚠️ Overlapping internship detected for {roll}: {get_safe_value(row, 'org')} overlaps with {intern.get('organizationName')}")

    internships_all.append({
        "internshipID": str(uuid.uuid4()),
        "rollNo": roll,
        "startingDate": start,
        "endingDate": end,
        "offerLetter": get_safe_value(row, "offer"),
        "applicationLetter": get_safe_value(row, "app_letter"),
        "noc": get_safe_value(row, "noc"),
        "role": get_safe_value(row, "role"),
        "organizationName": get_safe_value(row, "org"),
        "hrName": get_safe_value(row, "hr_name"),
        "hrEmail": get_safe_value(row, "hr_email"),
        "hrPhone": get_safe_value(row, "hr_phone"),
        "duration": extract_numeric(get_safe_value(row, "duration")),
        "package": extract_numeric(get_safe_value(row, "package")),
        "semester": get_safe_value(row, "semester"),
        "branch": get_safe_value(row, "branch"),
        "section": get_safe_value(row, "section"),
        "status": "Pending"
    })

# =========================
# 📤 Insert Internships
# =========================
if internships_all:
    internships_collection.insert_many(internships_all)
    print(f"✅ Inserted {len(internships_all)} internships.")
else:
    print("ℹ️ No internships to insert.")
