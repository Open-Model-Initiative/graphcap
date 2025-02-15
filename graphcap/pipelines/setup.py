from setuptools import find_packages, setup

setup(
    name="pipelines",
    packages=find_packages(exclude=["pipelines_tests"]),
    install_requires=[
        "dagster",
        "dagster-cloud",
        "dagster-postgres",
    ],
    extras_require={"dev": ["dagster-webserver", "pytest"]},
)
