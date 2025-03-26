# SPDX-License-Identifier: Apache-2.0
"""Assets and ops for basic text captioning."""

from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import dagster as dg
import pandas as pd
from graphcap.perspectives import get_perspective, get_synthesizer

from ..common.logging import write_caption_results
from ..perspectives.jobs.config import PerspectivePipelineConfig
from ..providers.util import get_provider


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
            # Process images in batch
            image_paths = [Path(image) for image in perspective_image_list]
            caption_data_list = await processor.process_batch(
                client,
                image_paths,
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
    results = await synthesizer.process_batch(
        client, paths, output_dir=Path(io_config.run_dir), contexts=caption_contexts, name="synthesized_caption"
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
