import base64
import json
from openai import OpenAI
import openai
from pydantic import BaseModel
from constants import PROVIDER_CONFIG_PATH, EXAMPLE_CONFIG, StructuredCaption, IMAGE_PATH, OLLAMA_DEFAULT_MODEL
# Initialize the client using the OpenAI compatibility layer.
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

# Define the StructuredCaption schema.
class StructuredCaption(BaseModel):
    scratchpad: str
    caption: str

# Define the prompt for generating a structured caption.
prompt = (
    "Analyze the provided image and generate a structured caption. "
    "Include a brief scratchpad of your thought process and a final concise caption."
)

# Read and encode the image as base64.
with open(IMAGE_PATH, "rb") as image_file:
    b64_image = base64.b64encode(image_file.read()).decode("utf-8")

# Use Ollama's structured output feature with the OpenAI compatibility layer
try:
    completion = client.beta.chat.completions.parse(
        temperature=0,
        model=OLLAMA_DEFAULT_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"}},
                ]
            }
        ],
        response_format=StructuredCaption,
    )

    # Access the parsed response directly
    response_message = completion.choices[0].message
    if response_message.parsed:
        print("Structured Caption (JSON):")
        formatted_json = json.dumps(response_message.parsed.model_dump(), indent=2)
        print(formatted_json)
    elif response_message.refusal:
        print("Refusal:", response_message.refusal)
except openai.LengthFinishReasonError as e:
    print(f"Too many tokens: {e}")
except Exception as e:
    print(f"Error during API call: {e}")