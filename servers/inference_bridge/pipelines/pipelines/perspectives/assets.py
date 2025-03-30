# SPDX-License-Identifier: Apache-2.0
"""Assets and ops for basic text captioning."""

import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import dagster as dg
import pandas as pd
from loguru import logger
from tqdm.asyncio import tqdm_asyncio

from graphcap.perspectives import get_perspective, get_synthesizer

from ..common.logging import write_caption_results
from ..perspectives.jobs.config import PerspectivePipelineConfig
from ..providers.util import get_provider

# File constants
JOB_INFO_FILENAME = "job_info.json"
CAPTIONS_FILENAME = "captions.jsonl"

# Temporary batch processing function to replace BaseCaptionProcessor.process_batch
# This will be replaced with Kafka-based processing in the future
async def process_images_in_batch(
    processor,
    provider,
    image_paths,
    model="gemini-2.0-flash-exp",
    max_tokens=4096,
    temperature=0.8,
    top_p=0.9,
    repetition_penalty=1.15,
    max_concurrent=3,
    output_dir=None,
    global_context=None,
    contexts=None,
    name=None,
):
    """
    Temporary batch processing function to replace BaseCaptionProcessor.process_batch.
    Will be replaced with Kafka-based processing in the future.
    
    Processes multiple images by calling process_single for each in parallel.
    """
    logger.info(f"[DEPRECATED] Processing {len(image_paths)} images with {provider.name}")
    logger.info(f"Using max concurrency of {max_concurrent} requests")
    
    # Create job directory for output if requested
    job_dir = None
    if output_dir:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        job_dir = output_dir / f"batch_{name or timestamp}"
        job_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Writing results to {job_dir}")
        
        # Create captions.jsonl file and job_info.json with basic info
        with open(job_dir / JOB_INFO_FILENAME, "w") as f:
            job_info = {
                "started_at": timestamp,
                "provider": provider.name,
                "model": model,
                "config_name": getattr(processor, "config_name", name),
                "version": getattr(processor, "version", "1.0"),
                "total_images": len(image_paths),
                "global_context": global_context,
                "note": "This is a temporary implementation of batch processing until Kafka-based processing is implemented."
            }
            json.dump(job_info, f, indent=2)
    
    # Process images in parallel with limited concurrency
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def process_image(path):
        async with semaphore:
            try:
                result = await processor.process_single(
                    provider=provider,
                    image_path=path,
                    model=model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    repetition_penalty=repetition_penalty,
                    context=contexts.get(path.name) if contexts else None,
                    global_context=global_context,
                )
                
                caption_data = {
                    "filename": f"./{path.name}",
                    "config_name": getattr(processor, "config_name", name),
                    "version": getattr(processor, "version", "1.0"),
                    "model": model,
                    "provider": provider.name,
                    "parsed": result,
                }
                
                # Write to captions.jsonl if job_dir exists
                if job_dir:
                    with open(job_dir / CAPTIONS_FILENAME, "a") as f:
                        f.write(json.dumps(caption_data) + "\n")
                
                return caption_data
            except Exception as e:
                logger.error(f"Error processing {path}: {e}")
                error_data = {
                    "filename": f"./{path.name}",
                    "config_name": getattr(processor, "config_name", name),
                    "version": getattr(processor, "version", "1.0"),
                    "model": model,
                    "provider": provider.name,
                    "parsed": {"error": str(e)},
                }
                
                # Write error to captions.jsonl if job_dir exists
                if job_dir:
                    with open(job_dir / CAPTIONS_FILENAME, "a") as f:
                        f.write(json.dumps(error_data) + "\n")
                
                return error_data
    
    tasks = [process_image(path) for path in image_paths]
    results = await tqdm_asyncio.gather(*tasks, desc=f"Processing images with {provider.name}")
    
    # Update job_info.json with completion info
    if job_dir:
        with open(job_dir / JOB_INFO_FILENAME, "r") as f:
            job_info = json.load(f)
        
        job_info["completed_at"] = datetime.now().strftime("%Y%m%d_%H%M%S")
        job_info["success_count"] = sum(1 for r in results if "error" not in r["parsed"])
        job_info["failed_count"] = sum(1 for r in results if "error" in r["parsed"])
        
        with open(job_dir / JOB_INFO_FILENAME, "w") as f:
            json.dump(job_info, f, indent=2)
    
    return results


@dg.asset(
    group_name="perspectives",
    compute_kind="graphcap",
    deps=["perspective_image_list", "perspective_pipeline_run_config"],
)
async def perspective_caption(
    context: dg.AssetExecutionContext,
    perspective_image_list: List[str],
    perspective_pipeline_run_config: PerspectivePipelineConfig,
) -> List[Dict[str, Any]]:
    """Generate captions for selected images."""
    context.log.info("Generating captions")
    context.log.info(f"Image selection: {perspective_image_list}")

    # Extract config values from unified config
    provider_config = perspective_pipeline_run_config.provider
    io_config = perspective_pipeline_run_config.io
    perspective_config = perspective_pipeline_run_config.perspective

    # Get enabled perspectives
    enabled_perspectives = [name for name, enabled in perspective_config.enabled_perspectives.items() if enabled]
    context.log.info(f"Processing enabled perspectives: {enabled_perspectives}")

    # Instantiate the client
    client = get_provider(provider_config.provider_config_file, provider_config.default)

    all_results = []
    for perspective in enabled_perspectives:
        processor = get_perspective(perspective)

        try:
            # Process images using the temporary batch processing function
            image_paths = [Path(image) for image in perspective_image_list]
            caption_data_list = await process_images_in_batch(
                processor,
                client,
                image_paths,
                model=getattr(provider_config, "model", "gemini-2.0-flash-exp"),
                output_dir=Path(io_config.run_dir),
                global_context=perspective_config.global_context,
                name=perspective,
            )

            # Aggregate results
            for image, caption_data in zip(perspective_image_list, caption_data_list):
                # Use just the image filename in the key
                image_filename = Path(image).name
                all_results.append(
                    {
                        "perspective": perspective,
                        "image_filename": image_filename,
                        "caption_data": caption_data,
                        "context": processor.to_context(caption_data),
                    }
                )
        except Exception as e:
            context.log.error(f"Error generating captions for perspective {perspective}: {e}")

    write_caption_results(all_results)
    metadata = {
        "num_images": len(perspective_image_list),
        "perspectives": str(enabled_perspectives),
        "default_provider": provider_config.default,
        "caption_results_location": io_config.output_dir,
    }
    context.add_output_metadata(metadata)
    return all_results


@dg.asset(
    group_name="perspectives",
    compute_kind="python",
    deps=["perspective_pipeline_run_config"],
)
def caption_contexts(
    context: dg.AssetExecutionContext,
    perspective_caption: List[Dict[str, Any]],
    perspective_pipeline_run_config: PerspectivePipelineConfig,
) -> Dict[str, List[str]]:
    """Extracts contexts from the perspective caption data and adds to a dictionary of path:List[str].
    if the path exists, the context is appended to the list."""
    contexts = {}
    for item in perspective_caption:
        context.log.info(f"Processing {item['image_filename']} ({item['perspective']})")
        path = item["image_filename"]
        item_context = item["context"]
        if path in contexts:
            contexts[path].append(item_context)
        else:
            contexts[path] = [item_context]
    context.log.info(f"Found {len(contexts)} contexts")
    context.log.info(contexts)
    return contexts


@dg.asset(
    group_name="perspectives",
    compute_kind="python",
    deps=["perspective_pipeline_run_config"],
)
async def synthesizer_caption(
    context: dg.AssetExecutionContext,
    perspective_pipeline_run_config: PerspectivePipelineConfig,
    caption_contexts: Dict[str, List[str]],
) -> List:
    """Synthesizes captions from the perspective caption data."""
    context.log.info("Synthesizing captions")

    provider_config = perspective_pipeline_run_config.provider
    io_config = perspective_pipeline_run_config.io

    client = get_provider(provider_config.provider_config_file, provider_config.default)
    synthesizer = get_synthesizer()

    image_dir = Path(io_config.output_dir) / "images"
    paths = [image_dir / path for path in caption_contexts.keys()]
    
    # Use the temporary batch processing function
    results = await process_images_in_batch(
        synthesizer,
        client,
        paths,
        output_dir=Path(io_config.run_dir),
        contexts=caption_contexts,
        name="synthesized_caption"
    )

    # Format the results to match the perspective_caption output
    formatted_results = []
    for path, caption_data in zip(paths, results):
        image_filename = path.name
        formatted_results.append(
            {
                "perspective": "synthesized_caption",
                "image_filename": image_filename,
                "caption_data": caption_data,
                "context": synthesizer.to_context(caption_data),
            }
        )
    context.log.info(f"Synthesizer caption results: {formatted_results}")
    return formatted_results


@dg.asset(
    group_name="perspectives",
    compute_kind="python",
    deps=[perspective_caption, "perspective_pipeline_run_config", "synthesizer_caption"],
)
def caption_output_files(
    context: dg.AssetExecutionContext,
    perspective_caption: List[Dict[str, Any]],
    synthesizer_caption: List[Dict[str, Any]],
    perspective_pipeline_run_config: PerspectivePipelineConfig,
) -> None:
    """Writes the output data to an excel document and to a parquet file."""
    io_config = perspective_pipeline_run_config.io
    output_dir = Path(io_config.output_dir)
    run_dir = Path(io_config.run_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    run_dir.mkdir(parents=True, exist_ok=True)
    # Get enabled perspectives
    enabled_perspectives = [
        name for name, enabled in perspective_pipeline_run_config.perspective.enabled_perspectives.items() if enabled
    ]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Prepare data for DataFrame
    excel_path = run_dir / f"caption_results_{timestamp}.xlsx"
    parquet_path = run_dir / f"caption_results_{timestamp}.parquet"

    # Create a dictionary to hold DataFrames for each perspective
    perspective_dataframes: Dict[str, pd.DataFrame] = {}
    total_items = len(perspective_caption)
    processed = 0

    for perspective in enabled_perspectives:
        context.log.info(f"Processing {perspective} perspective...")
        perspective_data = [item for item in perspective_caption if item["perspective"] == perspective]
        table_data = []

        processor = get_perspective(perspective)

        for item in perspective_data:
            image_filename = item["image_filename"]
            caption_data = item["caption_data"]
            processed += 1
            context.log.debug(f"Processing {image_filename} ({processed}/{total_items})")

            # Convert to table format
            table_row = processor.to_table(caption_data)
            table_row["image_filename"] = image_filename
            table_data.append(table_row)

        # Create DataFrame for the current perspective
        if table_data:  # Only create DataFrame if we have data
            df = pd.DataFrame(table_data)
            perspective_dataframes[perspective] = df
            context.log.info(f"Completed {perspective} perspective with {len(table_data)} entries")

    # Write to Excel (each perspective to a separate sheet)
    with pd.ExcelWriter(excel_path) as writer:
        for perspective, df in perspective_dataframes.items():
            df.to_excel(writer, sheet_name=perspective, index=False)

        # Add synthesizer data to a separate sheet
        synthesizer_table_data = []
        processor = get_synthesizer()
        for item in synthesizer_caption:
            image_filename = item["image_filename"]
            caption_data = item["caption_data"]
            table_row = processor.to_table(caption_data)
            table_row["image_filename"] = image_filename
            synthesizer_table_data.append(table_row)

        synthesizer_df = pd.DataFrame(synthesizer_table_data)
        synthesizer_df.to_excel(writer, sheet_name="synthesizer", index=False)

    context.log.info(f"Wrote caption results to Excel: {excel_path}")

    # Write to Parquet (all perspectives in a single file)
    all_data = pd.concat(perspective_dataframes.values(), ignore_index=True)
    all_data.to_parquet(parquet_path, index=False)
    context.log.info(f"Wrote caption results to Parquet: {parquet_path}")

    context.add_output_metadata(
        {
            "excel_output_path": str(excel_path),
            "parquet_output_path": str(parquet_path),
        }
    )
