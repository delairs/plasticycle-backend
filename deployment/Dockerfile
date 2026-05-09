FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN apk add --no-cache curl unzip

RUN curl -fsSL -o /tmp/envconsul.zip \
    https://releases.hashicorp.com/envconsul/0.13.4/envconsul_0.13.4_linux_amd64.zip \
 && unzip /tmp/envconsul.zip -d /usr/local/bin \
 && chmod +x /usr/local/bin/envconsul \
 && rm -f /tmp/envconsul.zip

RUN chmod +x /app/run.sh

EXPOSE 3000

CMD ["/app/run.sh"]