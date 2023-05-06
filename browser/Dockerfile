FROM python:3.6
ENV PYTHONUNBUFFERED 1

RUN mkdir /browser/
COPY ./semMedGuide.html /browser/
COPY ./server.py /browser/
WORKDIR /browser

CMD ["python","server.py"]