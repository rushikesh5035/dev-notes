from logger import logging

def add(x, y):
    logging.debug(f"Adding {x} and {y}")
    return x + y

logging.debug("The addition function is called.")
add(5, 3)