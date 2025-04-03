#!/bin/bash

# --- Configuration (Read from Environment Variables) ---
MODEL_ID="${MODEL_ID?Error: MODEL_ID environment variable not set.}"
MODEL_NAME_SUFFIX="${MODEL_NAME_SUFFIX?Error: MODEL_NAME_SUFFIX environment variable not set.}"
QUANTIZATION="${QUANTIZATION}" # Read from env, no default here
IMAGE_NAME="${IMAGE_NAME:-vllm/vllm-openai:latest}" # Default image
SERVED_MODEL_NAME="${SERVED_MODEL_NAME?Error: SERVED_MODEL_NAME environment variable not set.}"

# --- Runtime Settings (Read from Environment Variables) ---
VRAM_TARGET="${VRAM_TARGET?Error: VRAM_TARGET environment variable not set.}"
TENSOR_PARALLEL="${TENSOR_PARALLEL?Error: TENSOR_PARALLEL environment variable not set.}"
HOST_PORT="${HOST_PORT:-8000}" # Default host port
CONTAINER_PORT=8000
GPU_MEM_UTIL="${GPU_MEM_UTIL?Error: GPU_MEM_UTIL environment variable not set.}"
MAX_SEQS="${MAX_SEQS?Error: MAX_SEQS environment variable not set.}"
MAX_MODEL_LEN="${MAX_MODEL_LEN:-16384}"

# Check for Hugging Face Token
if [ -z "$HUGGING_FACE_HUB_TOKEN" ]; then
  echo "Error: HUGGING_FACE_HUB_TOKEN environment variable is not set."
  exit 1
fi

# --- Determine Dtype based on Quantization ---
if [[ "$QUANTIZATION" == "awq"* ]]; then # Check if starts with awq (covers awq and awq_marlin)
  DTYPE="float16"
  echo "Using AWQ-based quantization '${QUANTIZATION}', setting dtype to '${DTYPE}'"
elif [ -z "$QUANTIZATION" ] || [ "$QUANTIZATION" = "no" ] || [ "$QUANTIZATION" = "none" ]; then
  echo "No quantization specified or detected, setting dtype to '${DTYPE}' (default bfloat16)"
else
  # Keep bfloat16 for other potential quantization methods
  echo "Using quantization '${QUANTIZATION}', setting dtype to '${DTYPE}' (default bfloat16)"
fi
# --- End Determine Dtype ---

# --- Stop Existing Container on Port (if any) ---
echo "Checking for existing container on port ${HOST_PORT}..."
EXISTING_CONTAINER=$(docker ps -q --filter "publish=${HOST_PORT}")
if [ -n "$EXISTING_CONTAINER" ]; then
  CONTAINER_NAME_EXISTING=$(docker inspect --format='{{.Name}}' $EXISTING_CONTAINER | sed 's/\/\///') # Get name without leading slash
  echo "Found existing container ${CONTAINER_NAME_EXISTING} (${EXISTING_CONTAINER}) using port ${HOST_PORT}. Stopping it..."
  docker stop $EXISTING_CONTAINER
  echo "Existing container stopped."
else
  echo "No existing container found on port ${HOST_PORT}."
fi
# --- End Stop Existing Container ---

echo "Starting model ${MODEL_ID} (${MODEL_NAME_SUFFIX})"
echo "Target VRAM per GPU: ${VRAM_TARGET}GB"
echo "Tensor Parallelism: ${TENSOR_PARALLEL}"
echo "GPU Memory Utilization: ${GPU_MEM_UTIL}"
echo "Max Sequences: ${MAX_SEQS}"
echo "Host Port: ${HOST_PORT}"
echo "Served Model Name: ${SERVED_MODEL_NAME}"
echo "Max Model Length: ${MAX_MODEL_LEN}"
echo "Selected Dtype: ${DTYPE}" # Added log

# --- Container Naming ---
CONTAINER_NAME="vllm-${MODEL_NAME_SUFFIX}-${VRAM_TARGET}gb-tp${TENSOR_PARALLEL}"
echo "Container name will be: ${CONTAINER_NAME}"

# --- Construct Docker Command ---
DOCKER_CMD="docker run --rm \
    --gpus all \
    --runtime nvidia \
    --ipc=host \
    -v ~/.cache/huggingface:/root/.cache/huggingface \
    -p ${HOST_PORT}:${CONTAINER_PORT} \
    --env HUGGING_FACE_HUB_TOKEN \
    --name ${CONTAINER_NAME} \
    --label vllm-server=true \
    --label model=${MODEL_NAME_SUFFIX} \
    ${IMAGE_NAME}"

# --- Construct vLLM Command ---
VLLM_CMD_BASE="--model ${MODEL_ID} \
    --trust-remote-code \
    --port ${CONTAINER_PORT} \
    --served-model-name ${SERVED_MODEL_NAME} \
    --gpu-memory-utilization ${GPU_MEM_UTIL} \
    --max-num-seqs ${MAX_SEQS} \
    --max-model-len ${MAX_MODEL_LEN} \
    --tensor-parallel-size ${TENSOR_PARALLEL} \
    --dtype ${DTYPE}"

# Conditionally add quantization argument
VLLM_CMD="${VLLM_CMD_BASE}"
if [ -n "$QUANTIZATION" ] && [ "$QUANTIZATION" != "no" ] && [ "$QUANTIZATION" != "none" ]; then
  echo "Adding quantization argument: --quantization ${QUANTIZATION}"
  VLLM_CMD="${VLLM_CMD} --quantization ${QUANTIZATION}"
fi

# Append any extra arguments passed to this script
EXTRA_ARGS="$@"
if [ -n "$EXTRA_ARGS" ]; then
  echo "Adding extra vLLM args: $EXTRA_ARGS"
  VLLM_CMD="$VLLM_CMD $EXTRA_ARGS"
fi

# --- Execute ---
echo "Pulling latest image: ${IMAGE_NAME}..."
docker pull ${IMAGE_NAME}

COMMAND_TO_RUN="${DOCKER_CMD} ${VLLM_CMD}"
echo "Using image: ${IMAGE_NAME}. vLLM version will be shown in the container startup logs."
echo "Executing..."
# echo "${COMMAND_TO_RUN}" # Uncomment for debugging the full command
eval "${COMMAND_TO_RUN}" # Use eval to handle args with spaces correctly 