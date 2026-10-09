import pandas as pd
import os
from pathlib import Path


script_dir = Path(__file__).parent.parent
csv_path = script_dir / "data" / "non_ai_news.csv"
df = pd.read_csv("data/train.csv")

# Keep only World, Sports, Business
df = df[
    df["Class Index"].isin([1, 2, 3])
]

non_ai_data = []

for _, row in df.iterrows():

    title = str(row["Title"]).strip()

    description = str(
        row["Description"]
    ).strip()

    text = f"{title} {description}"

    non_ai_data.append({
        "text": text,
        "label": 0
    })

non_ai_df = pd.DataFrame(
    non_ai_data
)

# Remove duplicates
non_ai_df.drop_duplicates(
    subset=["text"],
    inplace=True
)

# Remove empty rows
non_ai_df = non_ai_df[
    non_ai_df["text"].str.len() > 50
]
non_ai_df = non_ai_df.sample(
    n=1500,
    random_state=42
)

non_ai_df.to_csv(
    csv_path,
    index=False
)

print(
    f"Saved {len(non_ai_df)} Non-AI articles"
)