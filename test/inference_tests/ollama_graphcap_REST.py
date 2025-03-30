"""
curl -X 'POST' \
  'http://localhost:32100//v1/perspectives/caption-from-path' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "perspective": "graph_caption",
  "image_path": "/workspace/datasets/os_img/big-buddha-5587706_1280.jpg",
  "provider": "ollama",
  "max_tokens": 4096,
  "temperature": 0.8,
  "top_p": 0.9,
  "repetition_penalty": 1.15,
  "context": [
    "string"
  ],
  "global_context": "You are a structured captioning model."
}'
"""
