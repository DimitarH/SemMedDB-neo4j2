FROM node:16 

RUN mkdir -p /dxclient
WORKDIR /dxclient

COPY package.json .
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

RUN npm run build 
RUN npm install -g serve --legacy-peer-deps

CMD ["serve", "-s", "build"]