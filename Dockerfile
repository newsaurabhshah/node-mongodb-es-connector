#Light weight alpine image. Node version ideally should be latest, but currently this is tested with 10.15.1 manually. We will upgrade to latest once we have an automated buil and testing scenario. 
FROM node:10.15.1-alpine
# Many security system will not allow Docker to run as root. Adding nonroot user and switching to it. Any downstream image are promoted to use same User!
RUN addgroup -S nonrootgroup && adduser -S nonroot -G nonrootgroup
USER adduser
# COPY all code
COPY . /
# This will add packages
RUN npm install
# Switched from ENTRYPOINT to CMD, gives more flexibility to overwrite for debugging purpose
CMD ["node","app.js"]