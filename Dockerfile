FROM node:18 AS build

WORKDIR /app

# Add build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build:prod

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]