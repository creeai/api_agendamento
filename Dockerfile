# Dockerfile otimizado para Next.js 14
# Compatível com EasyPanel e outras plataformas de deploy

FROM node:20-alpine AS base

# Instalar dependências necessárias para build
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar TODAS as dependências (incluindo devDependencies para o build)
# Usar --include=dev para garantir que @types/* sejam instalados
RUN npm ci --include=dev && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Remover devDependencies após o build (opcional, para reduzir tamanho)
RUN npm prune --production

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando de inicialização
CMD ["npm", "start"]
