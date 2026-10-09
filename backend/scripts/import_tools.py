import sys
import os

parent_dir = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.append(parent_dir)
print(parent_dir)
from database import tools_collection
from datetime import datetime
import pandas as pd


# ==========================================
# Clear Existing Data
# ==========================================

print("Deleting old tools...")
tools_collection.delete_many({})

tools_dict = {}


# ==========================================
# Helper Function
# ==========================================

def get_tool(tool_name):

    if pd.isna(tool_name):
        return None

    tool_name = str(tool_name).strip()

    if not tool_name:
        return None

    key = tool_name.lower()

    if key not in tools_dict:

        tools_dict[key] = {

            "tool_name": tool_name,

            "company": "",

            "category": "",

            "description": "",

            "website": "",

            "logo": "",

            "keywords": [],

            "primary_task": "",

            "country": "",

            "industry": "",

            "year_founded": None,

            "release_year": None,

            "open_source": False,

            "api_available": False,

            "stars": 0,

            "featured": False
        }

    return tools_dict[key]


# ==========================================
# DATASET 1
# ==========================================

print("Reading Dataset 1...")

df1 = pd.read_csv(
    "data/Generative AI Tools - Platforms 2025.csv"
)

for _, row in df1.iterrows():

    tool = get_tool(row["tool_name"])

    if tool is None:
        continue

    if pd.notna(row.get("company")):
        tool["company"] = str(
            row["company"]
        ).strip()

    if pd.notna(row.get("category_canonical")):
        tool["category"] = str(
            row["category_canonical"]
        ).strip()

    if pd.notna(row.get("website")):
        tool["website"] = str(
            row["website"]
        ).strip()

    if pd.notna(row.get("release_year")):
        tool["release_year"] = row[
            "release_year"
        ]

    if pd.notna(row.get("open_source")):
        tool["open_source"] = bool(
            row["open_source"]
        )

    if pd.notna(row.get("api_available")):
        tool["api_available"] = bool(
            row["api_available"]
        )


# ==========================================
# DATASET 2
# ==========================================

print("Reading Dataset 2...")

df2 = pd.read_csv(
    "data/aitoolsdata.csv"
)

for _, row in df2.iterrows():

    tool = get_tool(row["Title"])

    if tool is None:
        continue

    if pd.notna(row.get("Logo")):
        tool["logo"] = str(
            row["Logo"]
        ).strip()

    if pd.notna(row.get("Website")):
        tool["website"] = str(
            row["Website"]
        ).strip()

    if pd.notna(row.get("Description")):
        tool["description"] = str(
            row["Description"]
        ).strip()

    try:
        if pd.notna(row.get("Stars")):
            tool["stars"] = float(
                row["Stars"]
            )
    except:
        pass


# ==========================================
# DATASET 3
# ==========================================

print("Reading Dataset 3...")

df3 = pd.read_csv(
    "data/aitoolsdataprimary.csv"
)

for _, row in df3.iterrows():

    tool = get_tool(row["Name"])

    if tool is None:
        continue

    if pd.notna(row.get("Category")):
        tool["category"] = str(
            row["Category"]
        ).strip()

    if pd.notna(row.get("Primary Task")):
        tool["primary_task"] = str(
            row["Primary Task"]
        ).strip()

    if pd.notna(row.get("Short Description")):
        tool["description"] = str(
            row["Short Description"]
        ).strip()

    if pd.notna(row.get("Country")):
        tool["country"] = str(
            row["Country"]
        ).strip()

    if pd.notna(row.get("industry")):
        tool["industry"] = str(
            row["industry"]
        ).strip()

    if pd.notna(row.get("Website")):
        tool["website"] = str(
            row["Website"]
        ).strip()

    if pd.notna(row.get("Logo")):
        tool["logo"] = str(
            row["Logo"]
        ).strip()

    if pd.notna(row.get("Year Founded")):
        tool["year_founded"] = row[
            "Year Founded"
        ]

    keywords = str(
        row.get("Keywords", "")
    )

    tool["keywords"] = [
        keyword.strip()
        for keyword in keywords.split(",")
        if keyword.strip()
    ]


# ==========================================
# FILTER LOW QUALITY RECORDS
# ==========================================

print("Filtering records...")

filtered_tools = []

for tool in tools_dict.values():

    tool_name = tool["tool_name"].strip()

    description = tool["description"].strip()

    website = tool["website"].strip()

    # Must have name
    if not tool_name:
        continue

    # Must have either description or website
    if not description and not website:
        continue

    filtered_tools.append(tool)

for tool in filtered_tools:

    if "created_at" not in tool or not tool["created_at"]:
        tool["created_at"] = datetime.utcnow()

    tool["updated_at"] = datetime.utcnow()

# ==========================================
# INSERT INTO MONGODB
# ==========================================

print(
    f"\nPreparing to insert {len(filtered_tools)} tools..."
)

if filtered_tools:

    result = tools_collection.insert_many(
        filtered_tools
    )

    print(
        f"✓ Successfully inserted "
        f"{len(result.inserted_ids)} tools!"
    )

    count = tools_collection.count_documents(
        {}
    )

    print(
        f"✓ Tools now in database: {count}"
    )

else:

    print(
        "⚠ No valid tools found to insert!"
    )


# ==========================================
# INDEXES
# ==========================================

print("Creating indexes...")

tools_collection.create_index(
    "tool_name"
)

tools_collection.create_index(
    "category"
)

tools_collection.create_index(
    "primary_task"
)

print("✓ Indexes created")

print(
    f"\nFinal Tool Count: "
    f"{tools_collection.count_documents({})}"
)