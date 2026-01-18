# 🚀 Guia de Deploy no EasyPanel

Este guia detalha o passo a passo completo para fazer deploy da aplicação **API de Agendamento v2** no EasyPanel.

## ✅ Checklist Rápido

- [ ] EasyPanel instalado e acessível
- [ ] Repositório no GitHub (`https://github.com/creeai/api_agendamento`)
- [ ] Projeto Supabase criado e migrations executadas
- [ ] Credenciais do Supabase disponíveis (URL, Anon Key, Service Role Key)
- [ ] Domínio configurado (opcional)

## 📋 Pré-requisitos

1. **Servidor com EasyPanel instalado**
   - EasyPanel instalado e configurado
   - Acesso SSH ao servidor (se necessário)
   - Domínio configurado (opcional, mas recomendado)

2. **Conta no GitHub**
   - Repositório: `https://github.com/creeai/api_agendamento`
   - Acesso de leitura ao repositório

3. **Conta no Supabase**
   - Projeto criado
   - Migrations executadas
   - Credenciais disponíveis (URL, Anon Key, Service Role Key)

## 🔧 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que o código está no GitHub na branch `main`:

```bash
git push origin main
```

### 2. Acessar o EasyPanel

1. Acesse o painel do EasyPanel (geralmente em `http://seu-servidor:3000` ou domínio configurado)
2. Faça login com suas credenciais

### 3. Criar Novo Projeto

1. Clique em **"New Project"** ou **"Novo Projeto"**
2. Escolha **"App"** ou **"Aplicação"**
3. Selecione o template **"Node.js"** ou **"Next.js"**

### 4. Configurar o Repositório

Na seção **"Source"** ou **"Fonte"**:

- **Repository URL**: `https://github.com/creeai/api_agendamento`
- **Branch**: `main`
- **Build Pack**: `Node.js` ou `Next.js` (se disponível)

### 5. Configurar Build Settings

Na seção **"Construção"** ou **"Build"**:

#### ⚠️ IMPORTANTE: Escolha o Método de Build

**Opção 1: Nixpacks (Recomendado para EasyPanel)**

Se estiver usando **Nixpacks** (como na imagem):

- **Versão**: `1.34.1` (ou a mais recente disponível)
- **Comando de Instalação**: ⚠️ **DEIXE VAZIO** - O arquivo `nixpacks.toml` já configura isso automaticamente
- **Comando de Build**: ⚠️ **DEIXE VAZIO** - O arquivo `nixpacks.toml` já configura isso automaticamente
- **Comando de Início**: ⚠️ **DEIXE VAZIO** - O arquivo `nixpacks.toml` já configura isso automaticamente
- **Pacotes Nix**: (deixe vazio)
- **Pacotes APT**: (deixe vazio)

**✅ IMPORTANTE:** O arquivo `nixpacks.toml` na raiz do projeto já configura tudo automaticamente:
- Força Node.js 20
- Usa `npm ci --include=dev` para instalar todas as dependências (incluindo devDependencies)
- Configura o build e start corretamente

**⚠️ Se você configurar comandos manualmente no EasyPanel, eles podem sobrescrever o `nixpacks.toml`!**

**⚠️ PROBLEMA COMUM:** Se você receber erros sobre `autoprefixer` ou módulos não encontrados:

1. **Remova os comandos manuais** do EasyPanel (deixe vazios)
2. O arquivo `nixpacks.toml` já está configurado corretamente
3. Se ainda não funcionar, use a **Opção 2: Dockerfile** abaixo

**Opção 2: Dockerfile**

Se preferir usar Dockerfile:

1. Selecione **"Dockerfile"** como método de build
2. O EasyPanel usará automaticamente o `Dockerfile` na raiz do projeto
3. Não é necessário configurar comandos manualmente

**Opção 3: Buildpacks**

Se usar Buildpacks, selecione os buildpacks apropriados para Node.js/Next.js.

#### Configurações Adicionais (se disponíveis):

- **Node Version**: `20`
- **Build Directory**: `.next` (se aplicável)
- **Port**: `3000`

### 6. Configurar Variáveis de Ambiente

Na seção **"Environment Variables"** ou **"Variáveis de Ambiente"**, adicione:

#### Variáveis do Supabase (OBRIGATÓRIAS):

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

#### Variáveis da Aplicação:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://api.creeai.com.br
PORT=3000
```

#### Variáveis Opcionais:

```env
FRONTEND_ORIGIN=https://editor.weweb.io,https://seu-frontend.com
```

**⚠️ IMPORTANTE:**
- Substitua os valores pelos seus dados reais do Supabase
- A `SUPABASE_SERVICE_ROLE_KEY` é sensível - nunca exponha no frontend
- A `NEXT_PUBLIC_APP_URL` deve ser a URL final onde a API estará disponível

### 7. Configurar Porta e Healthcheck

Na seção **"Settings"** ou **"Configurações"**:

- **Port**: `3000`
- **Healthcheck Path**: `/api/v1/health`
- **Healthcheck Interval**: `30` (segundos)

### 8. Configurar Domínio (Opcional)

Se você tem um domínio:

1. Vá em **"Domains"** ou **"Domínios"**
2. Adicione seu domínio: `api.creeai.com.br`
3. Configure o DNS apontando para o IP do servidor EasyPanel
4. EasyPanel geralmente gerencia SSL automaticamente via Let's Encrypt

### 9. Configurar Recursos

Na seção **"Resources"** ou **"Recursos"**:

- **CPU**: Mínimo `0.5` cores (recomendado `1` core)
- **Memory**: Mínimo `512MB` (recomendado `1GB`)
- **Storage**: `1GB` (suficiente para a aplicação)

### 10. Deploy

1. Clique em **"Deploy"** ou **"Fazer Deploy"**
2. Aguarde o build completar (pode levar alguns minutos)
3. Monitore os logs para verificar se há erros

### 11. Verificar o Deploy

Após o deploy, teste os endpoints:

```bash
# Healthcheck
curl https://api.creeai.com.br/api/v1/health

# Deve retornar:
# {"ok":true,"name":"api-agendamento-v2","time":"2026-01-18T..."}
```

## 🔍 Troubleshooting

### Erro: "Build failed" ou "Cannot find module 'autoprefixer'"

**Causa:** O Nixpacks está usando Node.js 18 ou não instalando devDependencies.

**Solução:**
1. **O arquivo `nixpacks.toml` foi criado** - ele força Node.js 20 e garante instalação correta
2. **Faça commit e push do arquivo `nixpacks.toml`** para o repositório
3. **Use `npm ci` em vez de `npm install`** no comando de instalação (mais confiável)
4. **Alternativa:** Mude para usar **Dockerfile** em vez de Nixpacks (mais confiável)
5. Verifique os logs de build no EasyPanel para erros específicos

### Erro: "Unsupported engine - requires Node.js >= 20.0.0"

**Causa:** O Nixpacks está usando Node.js 18.

**Solução:**
1. O arquivo `nixpacks.toml` deve resolver isso automaticamente (força Node.js 20)
2. Certifique-se de que o arquivo `nixpacks.toml` está commitado no repositório
3. Se não funcionar, use a opção **Dockerfile** que força Node.js 20

### Erro: "Cannot connect to Supabase"

**Solução:**
- Verifique se as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretas
- Verifique se o Supabase permite conexões do IP do servidor
- Verifique se as migrations foram executadas no Supabase

### Erro: "Port already in use"

**Solução:**
- Verifique se a porta 3000 está configurada corretamente
- Certifique-se de que não há outro serviço usando a porta 3000

### Aplicação não inicia

**Solução:**
- Verifique os logs da aplicação no EasyPanel
- Certifique-se de que o comando `npm start` está correto
- Verifique se o build foi concluído com sucesso

## 📝 Configuração Avançada

### Usando Dockerfile (Opcional)

Se o EasyPanel suportar Dockerfile, você pode usar o `Dockerfile` incluído no projeto:

1. Na configuração do projeto, selecione **"Dockerfile"** como método de build
2. O EasyPanel usará automaticamente o `Dockerfile` na raiz do projeto
3. O Dockerfile já está otimizado para produção

**Nota:** Se o EasyPanel não suportar Dockerfile, use as configurações de Build Settings mencionadas acima (Build Command e Start Command).

### Configuração de SSL/HTTPS

O EasyPanel geralmente configura SSL automaticamente via Let's Encrypt:

1. Adicione o domínio nas configurações
2. O EasyPanel solicitará automaticamente o certificado SSL
3. Aguarde alguns minutos para a validação

### Configuração de CORS

A aplicação já está configurada para CORS. Se precisar adicionar mais origens:

1. Adicione a variável de ambiente:
   ```env
   FRONTEND_ORIGIN=https://editor.weweb.io,https://outro-dominio.com
   ```

### Backup e Restore

Para fazer backup:

1. Use o recurso de backup do EasyPanel (se disponível)
2. Ou faça backup manual do banco de dados Supabase
3. Mantenha as variáveis de ambiente documentadas

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das mudanças para a branch `main` no GitHub
2. No EasyPanel, clique em **"Redeploy"** ou **"Reimplantar"**
3. Ou configure **"Auto Deploy"** para deploy automático a cada push

## 📊 Monitoramento

### Logs

- Acesse **"Logs"** no EasyPanel para ver logs em tempo real
- Os logs incluem requisições HTTP, erros e informações de debug

### Métricas

- Monitore CPU, memória e tráfego de rede
- Configure alertas se necessário

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no EasyPanel
2. Verifique a documentação do EasyPanel
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Teste localmente antes de fazer deploy

## 📚 Referências

- [Documentação do EasyPanel](https://easypanel.io/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Supabase](https://supabase.com/docs)

## 🎯 Resumo das Configurações

### Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: `20`
- **Port**: `3000`

### Variáveis de Ambiente Obrigatórias
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
NEXT_PUBLIC_APP_URL=https://api.creeai.com.br
NODE_ENV=production
```

### Recursos Recomendados
- **CPU**: 1 core
- **Memory**: 1GB
- **Storage**: 1GB

### Endpoints Importantes
- **Healthcheck**: `/api/v1/health`
- **API Base**: `/api/v1`
- **Documentação**: `/api-docs`
