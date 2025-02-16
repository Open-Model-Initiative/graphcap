# SPDX-License-Identifier: Apache-2.0
"""Assets and ops for basic text captioning."""

from pathlib import Path
from typing import Any, Dict, List

import dagster as dg
import pandas as pd
from graphcap.perspectives.perspective_library import get_perspective, get_perspective_list, get_synthesizer

from ..common.logging import write_caption_results
from ..common.resources import ProviderConfigFile
from ..io.image import DatasetIOConfig
from ..providers.util import get_provider


@dg.asset(group_name="perspectives", compute_kind="python")
def perspective_list(context: dg.AssetExecutionContext) -> List[str]:
    """List of perspectives."""
    context.log.info("Generating perspective list")
    return get_perspective_list()


@dg.asset(
    group_name="perspectives",
    compute_kind="graphcap",
    deps=[perspective_list, "image_list", "image_dataset_config"],
)
async def perspective_caption(
    context: dg.AssetExecutionContext,
    image_list: List[str],
    perspective_list: List[str],
    provider_config_file: ProviderConfigFile,
    default_provider: str,
    image_dataset_config: DatasetIOConfig,
) -> List[Dict[str, Any]]:
    """Generate captions for selected images."""
    context.log.info("Generating captions")
    context.log.info(f"Image selection: {image_list}")
    context.log.info(f"Perspective: {perspective_list}")

    # Instantiate the client
    client = get_provider(provider_config_file, default_provider)

    all_results = []
    for perspective in perspective_list:
        processor = get_perspective(perspective)

        try:
            # Process images in batch
            image_paths = [Path(image) for image in image_list]
            caption_data_list = await processor.process_batch(
                client, image_paths, output_dir=Path(image_dataset_config.output_dir),
                global_context="ARR YER A PIRATE HARRY. CAPTION EACH IMAGE IN ALL CAPS AND AS A PIRATE."
            )

            # Aggregate results
            for image, caption_data in zip(image_list, caption_data_list):
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
        "num_images": len(image_list),
        "perspectives": str(perspective_list),
        "default_provider": default_provider,
        "caption_results_location": image_dataset_config.output_dir,
    }
    context.add_output_metadata(metadata)
    return all_results

@dg.asset(
    group_name="perspectives",
    compute_kind="python",
)
def caption_contexts(
    context: dg.AssetExecutionContext,
    perspective_caption: List[Dict[str, Any]],
    image_dataset_config: DatasetIOConfig,
    perspective_list: List[str],
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
)
async def synthesizer_caption(
    context: dg.AssetExecutionContext,
    provider_config_file: ProviderConfigFile,
    default_provider: str,
    caption_contexts: Dict[str, List[str]],
    image_dataset_config: DatasetIOConfig,
) -> List:
    """Synthesizes captions from the perspective caption data."""
    context.log.info("Synthesizing captions")

    client = get_provider(provider_config_file, default_provider)
    synthesizer = get_synthesizer()
    # paths = [Path(path) for path in caption_contexts.keys()]
    image_dir = Path(image_dataset_config.output_dir)/"images"
    paths = [image_dir / path for path in caption_contexts.keys()]
    results = await synthesizer.process_batch(client, paths,
                                              output_dir=Path(image_dataset_config.output_dir),
                                              contexts=caption_contexts)
    
    # Format the results to match the perspective_caption output
    formatted_results = []
    for path, caption_data in zip(paths, results):
        image_filename = path.name
        formatted_results.append({
            "perspective": "synthesized_caption",
            "image_filename": image_filename,
            "caption_data": caption_data,
            "context": synthesizer.to_context(caption_data),
        })
    context.log.info(f"Synthesizer caption results: {formatted_results}")
    return formatted_results

@dg.asset(
    group_name="perspectives",
    compute_kind="python",
    deps=[perspective_caption, "image_dataset_config", "perspective_list", "synthesizer_caption"],
)
def caption_output_files(
    context: dg.AssetExecutionContext,
    perspective_caption: List[Dict[str, Any]],
    synthesizer_caption: List[Dict[str, Any]],
    image_dataset_config: DatasetIOConfig,
    perspective_list: List[str],
) -> None:
    """Writes the output data to an excel document and to a parquet file."""
    output_dir = Path(image_dataset_config.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Prepare data for DataFrame
    excel_path = output_dir / "caption_results.xlsx"
    parquet_path = output_dir / "caption_results.parquet"

    # Create a dictionary to hold DataFrames for each perspective
    perspective_dataframes: Dict[str, pd.DataFrame] = {}
    total_items = len(perspective_caption)
    processed = 0

    for perspective in perspective_list:
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

