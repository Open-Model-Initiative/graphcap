.. _getting_started:

Getting Started
==============

This guide will help you get up and running with Graphcap. Follow these steps in order to set up and start using the system.

.. toctree::
   :maxdepth: 2
   :caption: Setup Guide

   configuration
   docker_override
   workspaces
   hello_world

Quick Start
----------

1. Run the setup script to configure your environment:

   .. code-block:: bash

      task setup

2. Configure Docker settings if needed (see :ref:`docker_override`)

3. Start the services:

   .. code-block:: bash

      task start

4. Visit ``localhost:32300`` to access the web interface

5. Try the hello world example (see :ref:`hello_world`)

System Requirements
-----------------

- Docker and Docker Compose
- Python 3.11 or higher
- uv package manager
- task runner

For detailed instructions on each component, follow the guides in the table of contents above.
