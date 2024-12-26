# Usa una imagen base de Node.js
FROM node:20-slim

# Instala las dependencias necesarias para Puppeteer
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
    libgtk-3-0 \
    libatk-bridge2.0-0 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos de tu proyecto al contenedor
COPY . .

# Instala las dependencias de npm, omitiendo las dependencias de desarrollo
RUN npm install --omit=dev

# Expón el puerto en el que tu aplicación escuchará (si es necesario)
EXPOSE 3000

# Comando para iniciar tu aplicación
CMD ["node", "index.js"]
