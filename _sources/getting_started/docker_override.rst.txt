.. _docker_override:

Docker Override
===============

How to Use the Docker Compose Override File
--------------------------------------------

In Docker Compose, an override file is a powerful feature that allows you to modify the default configuration provided by the main ``docker-compose.yml`` without the need to directly edit or duplicate the whole file. The primary use of the override file is for local development customizations, and Docker Compose merges the configurations of the ``docker-compose.yml`` and the ``docker-compose.override.yml`` files when you run ``docker compose up``.

Here’s a quick guide on how to use the ``docker-compose.override.yml``:

.. note:: Please consult the ``docker-compose.override.yml.example`` for more examples.

See the official Docker documentation for more information:

- `Understanding multiple Compose files <https://docs.docker.com/compose/extends/#understanding-multiple-compose-files>`_
- `Merge Compose files <https://docs.docker.com/compose/extends/#merge-compose-files>`_
- `Specifying multiple Compose files <https://docs.docker.com/compose/extends/#specifying-multiple-compose-files>`_

Step 1: Create a ``docker-compose.override.yml`` file
-------------------------------------------------------

If you don’t already have a ``docker-compose.override.yml`` file, you can create one by copying the example override content:

.. code-block:: bash

   cp docker-compose.override.yml.example docker-compose.override.yml

This file will be picked up by Docker Compose automatically when you run ``docker-compose`` commands.

Step 2: Edit the override file
------------------------------

Open your ``docker-compose.override.yml`` file with VS Code or any text editor.

Make your desired changes by uncommenting the relevant sections and customizing them as needed.

.. warning:: You can only specify every service name once (``api``, ``mongodb``, ``meilisearch``, …). If you want to override multiple settings in one service, you will have to edit accordingly.
