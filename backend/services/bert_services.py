from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification
)

import torch
import os


# Reduce OpenBLAS / PyTorch memory usage
torch.set_num_threads(1)


# ==========================================
# PROJECT ROOT
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


# ==========================================
# LOCAL BERT MODEL
# ==========================================

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "bert_ai_news"
)


print("BERT MODEL PATH:")
print(MODEL_PATH)


# ==========================================
# GLOBAL MODEL OBJECTS
# ==========================================

tokenizer = None
model = None

model_failed = False



# ==========================================
# LOAD MODEL ONLY ONCE
# ==========================================

def load_model():

    global tokenizer
    global model
    global model_failed


    # already loaded
    if model is not None:
        return


    # prevent repeated loading attempts
    if model_failed:
        raise RuntimeError(
            "BERT model failed previously. Restart backend after fixing memory issue."
        )


    try:

        print("Loading BERT model...")


        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_PATH,
            local_files_only=True
        )


        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_PATH,
            local_files_only=True,
            torch_dtype=torch.float32
        )


        model.eval()


        print("BERT loaded successfully")


    except Exception as e:

        print("\nBERT LOAD FAILED")
        print(e)


        tokenizer = None
        model = None
        model_failed = True


        raise e



"""# ==========================================
# SINGLE ARTICLE CLASSIFICATION
# ==========================================

def classify_news(article):


    load_model()


    text = (
        article.get("title", "")
        + " "
        + article.get("description", "")
    )


    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=256
    )


    with torch.inference_mode():

        outputs = model(
            **inputs
        )


    prediction = torch.argmax(
        outputs.logits,
        dim=1
    ).item()


    return prediction

"""

# ==========================================
# BATCH CLASSIFICATION
# ==========================================

def classify_news_batch(articles):


    load_model()


    texts = []


    for article in articles:

        title = article.get("title", "")
        description = article.get("description", "")
        content = article.get("full_content", "")
        words = content.split()
        first = " ".join(words[:200])
        last = " ".join(words[-80:]) if len(words) > 200 else ""
        text = f"""
        Title:
        {title}

        Description:
        {description}

        Beginning: 
        {first}

        Ending:
        {last}
        """

        texts.append(text)



    inputs = tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=256,
        return_tensors="pt"
    )


    with torch.inference_mode():

        outputs = model(
            **inputs
        )


    predictions = torch.argmax(
        outputs.logits,
        dim=1
    )


    return predictions.tolist()