.. _getting_started:

Getting Started
==============

This guide will help you get up and running with Graphcap. Follow these steps in order to set up and start using the system.

.. toctree::
   :maxdepth: 2
   :caption: Setup Guide

   configuration
   docker_override


Quick Start
----------

1. Run the setup script to configure your environment:

   .. code-block:: bash

      task setup

2. Change the values for the following environment variables to ensure that your installation is secure:

- POSTGRES_USER
- POSTGRES_PASSWORD
- ENCRYPTION_KEY

3. Configure Docker settings if needed (see :ref:`docker_override`)

4. Start the services:

   .. code-block:: bash

      task start

5. Visit ``localhost:32200`` to access the web interface

System Requirements
-----------------

- Docker and Docker Compose
- Python 3.11 or higher
- uv package manager (https://docs.astral.sh/uv/)
- Task runner (https://taskfile.dev/)

For detailed instructions on each component, follow the guides in the table of contents above.
