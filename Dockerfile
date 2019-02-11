#Light weight alpine image. Node version ideally should be latest, but currently this is tested with 10.15.1 manually. We will upgrade to latest once we have an automated buil and testing scenario. 
FROM node:10.15.1-alpine
# open /opt
RUN mkdir -p /opt/node-mongodb-es-connector
RUN chmod -R 777 /opt/node-mongodb-es-connector
# Many security system will not allow Docker to run as root. Adding nonroot user and switching to it. Any downstream image are promoted to use same User!
RUN addgroup -S nonrootgroup && adduser -S nonroot -G nonrootgroup
# COPY all code
COPY --chown=nonroot . /opt/node-mongodb-es-connector
USER nonroot
WORKDIR /opt/node-mongodb-es-connector
# This will add packages
RUN npm install
# Switched from ENTRYPOINT to CMD, gives more flexibility to overwrite for debugging purpose
CMD ["node","app.js"]