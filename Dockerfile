FROM node:10

ADD . /nodoka
WORKDIR /nodoka
RUN npm i
RUN npm run build

WORKDIR /nodoka/dist
CMD [ "node", "main" ]
