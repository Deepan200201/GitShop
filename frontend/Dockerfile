FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js app
RUN npm run build

EXPOSE 3000
# Copy static assets for standalone mode
# Copy static assets for standalone mode
RUN cp -r .next/static .next/standalone/.next/static && \
    cp -r public .next/standalone/public

ENV HOSTNAME="0.0.0.0"
CMD ["node", ".next/standalone/server.js"]
