FROM --platform=linux/amd64 node:18.2.0-slim
WORKDIR /app

# RUN apk add --upgrade --no-cache vips-dev build-base --repository https://alpine.global.ssl.fastly.net/alpine/v3.10/community/

COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build
# ENV PORT=80
# EXPOSE 80
# CMD [ "npm", "start" ]

# FROM --platform=linux/amd64 node:16-alpine3.16 as run-stage
# COPY --from=build-stage /app /
ENV PORT=3000
EXPOSE 3000
CMD [ "npm", "start" ]