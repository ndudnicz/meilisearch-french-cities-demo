FROM node:12.16.3-alpine3.9 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli@8.1.3
COPY . .
RUN ng build -c production

FROM nginx:1.16.0-alpine as final

# copy artifact build from the 'build environment'
COPY --from=build /app/dist/front /usr/share/nginx/html/front
COPY front.conf /etc/nginx/conf.d/default.conf

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]