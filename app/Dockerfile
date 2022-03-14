FROM python:3.10-slim-buster

EXPOSE 8080

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
ADD requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

WORKDIR /usr/src/app/

CMD [ "gunicorn", "--timeout", "60", "--bind" , "0.0.0.0:8080", "--workers", "4", "--threads", "2", "webapp:app"]
