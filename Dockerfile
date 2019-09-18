FROM python:alpine

WORKDIR /app
ADD requirements.txt /requirements.txt
RUN pip3 install --no-cache-dir -r /requirements.txt

ADD run.py /app

ENTRYPOINT ["python3", "run.py"]
