===================================
Running Models with vLLM Provider
===================================

This guide explains how to run pre-configured Large Language Models (LLMs) using the vLLM engine via Docker containers managed by Taskfile.

Prerequisites
=============

- Docker installed and running.
- NVIDIA drivers supporting CUDA installed.
- NVIDIA Container Toolkit installed.
- Task (Go Task runner) installed (see https://taskfile.dev/installation/).
- A Hugging Face Hub token set in your environment variable ``HUGGING_FACE_HUB_TOKEN``.

Available Models and Configurations
===================================

The models are managed via the ``servers/model_runners/Task.models.yml`` file. Each task corresponds to a specific model and hardware configuration.

Key Configuration Parameters
----------------------------

The Taskfile sets environment variables that configure the vLLM server within the Docker container:

- ``MODEL_ID``: The Hugging Face identifier for the model (e.g., ``Qwen/Qwen2.5-VL-32B-Instruct-AWQ``).
- ``QUANTIZATION``: The quantization method used (e.g., ``awq_marlin``). Determines the ``dtype`` used (``float16`` for AWQ/Marlin, ``bfloat16`` otherwise).
- ``VRAM_TARGET``: The target VRAM per GPU in GB (e.g., ``48``, ``24``). Used to select appropriate memory settings.
- ``TENSOR_PARALLEL``: The number of GPUs to use for tensor parallelism (e.g., ``1``, ``2``).
- ``GPU_MEM_UTIL``: Target GPU memory utilization fraction (e.g., ``0.90``).
- ``MAX_SEQS``: Maximum number of sequences the engine can handle concurrently.
- ``MAX_MODEL_LEN``: Maximum sequence length the model can process. This limits KV cache size.
- ``HOST_PORT``: The port on the host machine the server will be exposed on (default ``12434``).
- ``SERVED_MODEL_NAME``: The name the model is served under via the OpenAI API endpoint (default ``vision-worker``).

Running a Model
===============

To run a specific model configuration, use the ``task`` command followed by the task name or its alias. The tasks are defined in ``servers/model_runners/Task.models.yml``.

Example Commands:
-----------------

Run Qwen2.5-VL-32B-AWQ on a single 48GB GPU:

.. code-block:: bash

   task models:r32:48

Run Qwen2.5-VL-7B-AWQ on a single 16GB GPU:

.. code-block:: bash

   task models:r7:16

Run Qwen2.5-VL-32B-AWQ on two 24GB GPUs (TP=2):

.. code-block:: bash

   task models:r32:2x24

How it Works:
-------------

When you run a task:

1.  The Taskfile sets the appropriate environment variables for the selected model and VRAM target.
2.  It checks for and stops any existing container using the target ``HOST_PORT``.
3.  It executes the ``servers/model_runners/_run_vllm_model.sh`` script.
4.  The script pulls the latest ``vllm/vllm-openai:latest`` Docker image.
5.  The script starts a Docker container using the environment variables to configure the ``vllm`` server arguments (like ``--model``, ``--quantization``, ``--tensor-parallel-size``, ``--max-model-len``, etc.).
6.  The vLLM server starts inside the container, listening on the specified port (forwarded to ``HOST_PORT``).

Utility Tasks
=============

Stopping Containers
-------------------

To stop running vLLM server containers:

- Stop all containers started by this Taskfile:

  .. code-block:: bash

     task models:stop

- Stop a specific container by its name (e.g., the one started by ``r32:48``):

  .. code-block:: bash

     task models:stop -- --name vllm-qwen25vl32b-48gb-tp1

Following Logs
--------------

To follow the logs of a specific running container:

.. code-block:: bash

   task models:logs -- --name vllm-qwen25vl32b-48gb-tp1

You must specify the container name using the ``--name`` flag.
