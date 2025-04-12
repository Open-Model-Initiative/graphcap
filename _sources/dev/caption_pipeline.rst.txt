.. _caption_pipeline:

Caption Pipeline
================

This guide will help you run the pipeline to caption your dataset.

Create the Configuration
------------------------

A custom ``pipeline_run_config.toml`` file needs to be created in order for the pipeline to target the dataset you want to caption. Follow these stesp to create the configuration.

1. In the ``./workspace/config/default_configs`` directory, you will find a ``pipeline_run_config.toml`` file. Copy this file into a different location in the ``./workspace/config`` folder. We recommend using `.local/` as a folder.

2. Rename your copy of the ``pipeline_run_config.toml`` file, then open it.

3. In the ``[pipeline]`` section, change the name to distinguish your pipeline from others.

4. In the ``[io]`` section, change the dataset name to the same name as the dataset you wish to caption.

5. Change the last subfolder of the input and output directories to match your dataset.

6. In the ``[providers.default]`` section, change the name of the provider to one that exists in your ``provider.config.toml`` file, if necessary.

7. In the ``[perspective.enabled]`` section, set perspectives to ``true`` or ``false``, depending on which perspective you wish to use in the pipeline.

8. Save your `toml` file, and remember the filename and filepath of your file.

Prepare the Pipeline
--------------------

In this section, we'll take the `toml` file that was created earlier, and modify the default captioning pipeline to use it.

1. In the Graphcap Studio UI, at the top right, click on the ``Pipelines`` link. This will open a new tab in your browser to Dagster, which runs the pipelines. You should see the Overview screen.

2. At the top of the Dagster UI, click on the ``Jobs`` link. This will show the standard jobs that are pre-configured in your Dagster installation. 

3. In the list of jobs, click on the ``basic_perspective_pipeline`` job. This reveals the captioning pipeline that will use all of the perspectives that were set to ``true`` in the earlier section.

4. Click on the dropdown arrow next to the ``Materialize all`` button, and click on the ``Open launchpad`` option. The Launchpad displays the default configuration of the pipeline.

5. Replace the ``/workspace/config/default_configs/pipeline_run_config.toml`` in the configuration with the `toml` file from the earlier section. 

6. Click on the ``Materialize`` button at the bottom of the screen. The pipeline will start captioning your dataset.
