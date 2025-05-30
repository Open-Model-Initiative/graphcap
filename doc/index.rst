===============
graphcap
===============

Welcome to graphcap's documentation!

Alpha Testing
============

graphcap Project Overview for Alpha Testing
-------------------------------------------
Welcome to the alpha testing phase of **graphcap**! We are excited to have you on board as we refine and enhance this innovative captioning application. This document provides an overview of the project, its core features, and the goals for this alpha testing phase.

*What is graphcap?*
-------------------
graphcap is an open-source, distributed captioning application designed under the Open Model Initiative. Its primary purpose is to generate detailed, insightful captions and analyses of images by leveraging multiple analytical perspectives. 
The application utilizes directed acyclic graph structures to capture complex relationships within images, facilitating diverse, context-rich interpretations.

*Core Features*
-------------------
- **Multi-Perspective Captioning:** graphcap applies specialized analytical perspectives—such as formal artistic critique, emotional sentiment, storytelling, and temporal analysis—to generate comprehensive captions.
- **Distributed Processing:** Designed to operate efficiently in distributed environments, allowing for scalable, community-based computational resources.
- **Model Flexibility:** Supports integration with multiple Vision-Language Models (VLMs), enabling comparative analysis and ensuring adaptability across varied captioning tasks.
- **OMI-Compatible:** graphcap is designed to be compatible with the Open Model Initiative data repository, allowing for easy integration with our open source image dataset.

*Alpha Testing Goals*
-------------------
- Evaluate system stability and performance across diverse hardware and software environments.
- Collect feedback on caption accuracy, perspective usefulness, and overall usability.
- Identify critical bugs and areas for improvement in functionality and user experience.

*Participating in Alpha Testing*
-----------------------------------
Participants in the alpha test will:

- Test the application in their local or preferred computing environment.
- Provide structured feedback via surveys and discussions.
- Engage collaboratively in community discussions to shape future graphcap development.

Your insights and experiences during this alpha phase will directly contribute to refining graphcap's capabilities and guiding its future development within the Open Model Initiative community.



Getting Started
==============

.. toctree::
   :maxdepth: 2
   :caption: Getting Started Guide

   getting_started/index
   getting_started/configuration
   getting_started/datasets
   getting_started/docker_override

User Interface
=============

.. toctree::
   :maxdepth: 2
   :caption: UI Guide

   ui/action_drawers

Concepts
========

.. toctree::
   :maxdepth: 2
   :caption: Concepts

   concepts/perspectives

Development
===========

.. toctree::
   :maxdepth: 2
   :caption: Development Documentation

   dev/architecture
   dev/servers/data_service
   dev/servers/inference_bridge
   dev/servers/media_server
   dev/caption_pipeline

# Add the new Storybook link section here
UI Components (Storybook)
=========================

Browse interactive UI components documentation:

* `UI Component Library (Storybook) </storybook/>`_

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`