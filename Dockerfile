# Docker in docker base
FROM docker:dind

# Copies content
COPY . .

# Adds necesarry packages
RUN apk add git openssh-client docker openrc nodejs npm

RUN dockerd --host=unix:///var/run/docker.sock &

CMD npm start
