FROM node:20-slim

# Instala las dependencias necesarias
RUN apt-get update && apt-get install -y \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libcups2 \
  libxss1 \
  libxshmfence1 \
  libgbm1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto
COPY . .

# Instala las dependencias de npm
RUN npm install --omit=dev

# Expone el puerto si es necesario
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
