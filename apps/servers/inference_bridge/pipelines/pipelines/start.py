import os

from dotenv import load_dotenv

load_dotenv("/home/appuser/app/.env")

DAGSTER_HOME = os.getenv("DAGSTER_HOME")
print(f"DAGSTER_HOME: {DAGSTER_HOME}")
# launch dagster dev command
# run the command "dagster dev" in the terminal"
os.system("dagster dev -h 0.0.0.0 -p 32300")
