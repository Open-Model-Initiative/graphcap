import multiprocessing

# Gunicorn config variables
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
bind = "0.0.0.0:32100"

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '{"time":"%(t)s", "remote_ip":"%(h)s", "request":"%(r)s", "status":"%(s)s", "response_length":%(b)s'
