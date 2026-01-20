# Correção do Bug NEXT_REDIRECT em Rotas de API

## 🔍 Problema Identificado

O erro `{ "success": false, "error": "NEXT_REDIRECT" }` ocorria porque as funções de autenticação em `lib/auth/helpers.ts` usavam `redirect()` do Next.js, que não funciona em rotas de API.

### Localização do Bug

**Arquivo:** `lib/auth/helpers.ts`

- `requireAuth()` (linha 90): `redirect("/login")`
- `requireRole()` (linha 106): `redirect("/")`
- `requireAdmin()` e `requireSuperAdmin()` chamam essas funções

Quando chamadas em rotas `/api/*`, o `redirect()` lança uma exceção especial que resulta em `NEXT_REDIRECT`.

## ✅ Solução Implementada

### 1. Criado Helper Específico para API

**Arquivo:** `lib/auth/api-helpers.ts`

Criado um conjunto de helpers que:
- ✅ **NUNCA** usam `redirect()`
- ✅ Sempre retornam JSON com status codes apropriados (401/403)
- ✅ Suportam autenticação via Bearer token (`Authorization: Bearer <jwt>`)
- ✅ Mantêm compatibilidade com cookies (para browser)

**Funções criadas:**
- `getBearerToken(request)` - Extrai token do header Authorization
- `authenticateUser(request)` - Autentica via Bearer token ou cookies
- `requireAuthApi(request)` - Requer autenticação, retorna 401 se não autenticado
- `requireRoleApi(request, role)` - Requer role específico, retorna 403 se não tiver permissão
- `requireAdminApi(request)` - Requer role admin
- `requireSuperAdminApi(request)` - Requer role super_admin
- `ApiAuthError` - Classe de erro customizada que retorna JSON apropriado

### 2. Endpoints Corrigidos

Todos os endpoints que usavam `requireAdmin()`, `requireSuperAdmin()`, etc. foram atualizados:

- ✅ `app/api/v1/api-keys/route.ts` (GET, POST)
- ✅ `app/api/v1/api-keys/[id]/revoke/route.ts` (PATCH)
- ✅ `app/api/v1/companies/route.ts` (GET, POST)
- ✅ `app/api/v1/users/route.ts` (GET, POST)

### 3. Middleware Verificado

**Arquivo:** `middleware.ts`

O middleware já estava correto - ele apenas lida com CORS e não interfere com autenticação ou redirects.

## 📝 Como Usar

### Exemplo: Endpoint que requer Admin

```typescript
import {NextRequest, NextResponse} from "next/server"
import {requireAdminApi, ApiAuthError} from "@/lib/auth/api-helpers"
import type {ApiResponse} from "@/types/api"

export async function GET(request: NextRequest) {
  try {
    // Autentica e verifica se é admin
    // Retorna 401 se não autenticado
    // Retorna 403 se não for admin
    const user = await requireAdminApi(request)
    
    // Se chegou aqui, usuário é admin autenticado
    return NextResponse.json({
      success: true,
      data: { message: "Hello admin!" }
    })
  } catch (error) {
    // Tratar erros de autenticação
    if (error instanceof ApiAuthError) {
      return error.toResponse() // Retorna JSON 401 ou 403
    }
    
    // Tratar outros erros...
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}
```

### Autenticação via Bearer Token

```bash
curl -X GET http://localhost:3000/api/v1/api-keys \
  -H "Authorization: Bearer <jwt_token>"
```

**Resposta de sucesso (200):**
```json
{
  "success": true,
  "data": [...]
}
```

**Resposta se não autenticado (401):**
```json
{
  "success": false,
  "error": "UNAUTHORIZED"
}
```

**Resposta se não tiver permissão (403):**
```json
{
  "success": false,
  "error": "FORBIDDEN"
}
```

## 🔐 Segurança

- ✅ Bearer tokens são validados via Supabase Auth
- ✅ Tokens expirados retornam 401
- ✅ Tokens inválidos retornam 401
- ✅ Usuários sem permissão retornam 403
- ✅ Nenhum redirect é executado em rotas `/api/*`

## 🎯 Resultado

- ✅ Rotas `/api/*` **NUNCA** executam redirect
- ✅ Sempre retornam JSON com status codes apropriados
- ✅ Suportam autenticação via Bearer token (Postman/cURL)
- ✅ Mantêm compatibilidade com cookies (browser)
- ✅ Páginas web continuam usando redirect normalmente

## 📚 Arquivos Modificados

1. **Criado:** `lib/auth/api-helpers.ts` - Helpers específicos para API
2. **Atualizado:** `app/api/v1/api-keys/route.ts`
3. **Atualizado:** `app/api/v1/api-keys/[id]/revoke/route.ts`
4. **Atualizado:** `app/api/v1/companies/route.ts`
5. **Atualizado:** `app/api/v1/users/route.ts`

## ⚠️ Nota Importante

As funções em `lib/auth/helpers.ts` (`requireAuth()`, `requireAdmin()`, etc.) **continuam funcionando normalmente** para páginas web (Server Components, etc.). Elas foram mantidas para não quebrar o código existente.

**Regra:**
- **Páginas web** → Use `lib/auth/helpers.ts` (pode usar redirect)
- **Rotas de API** → Use `lib/auth/api-helpers.ts` (sempre retorna JSON)
