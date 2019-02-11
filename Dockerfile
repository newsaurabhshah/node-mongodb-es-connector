FROM node:10.15.1-alpine
# COPY all code
COPY . /
RUN npm install
CMD ["node","app.js"]