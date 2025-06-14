FROM node:23-alpine

WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
EXPOSE 3000
ENV PORT=3000
ENTRYPOINT ["./entrypoint.sh"]

