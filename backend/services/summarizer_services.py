from transformers import (
    PegasusTokenizer,
    PegasusForConditionalGeneration
)

import os


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "pegasus"
)


tokenizer = None
model = None


def load_model():

    global tokenizer, model

    if model is None:

        print("Loading PEGASUS model...")

        tokenizer = PegasusTokenizer.from_pretrained(
            MODEL_PATH,
            local_files_only=True
        )

        model = PegasusForConditionalGeneration.from_pretrained(
            MODEL_PATH,
            local_files_only=True
        )

        model.eval()

        print("PEGASUS loaded")


def generate_summary(text):

    load_model()

    inputs = tokenizer(
        text,
        truncation=True,
        padding="longest",
        max_length=1024,
        return_tensors="pt"
    )


    summary_ids = model.generate(
        **inputs,
        max_length=200,
        min_length=80,
        num_beams=4,
        early_stopping=True
    )


    return tokenizer.decode(
        summary_ids[0],
        skip_special_tokens=True
    )