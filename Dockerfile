# Stage 1: Build the Angular app
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build --configuration=production

# Stage 2: Serve with http-server
FROM node:22-alpine AS serve

WORKDIR /app

COPY --from=build /app/dist/sdo-approval/browser ./
# Install http-server globally
RUN yarn global add http-server

# Expose port for http-server
EXPOSE 8083
# Start http-server
CMD ["http-server", "./",  "-p", "8083"]