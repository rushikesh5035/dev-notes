## Configuring logging

import logging
from pathlib import Path

log_file = Path(__file__).with_name("app.log")

logging.basicConfig(
    filename=log_file,
    filemode='w',
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
