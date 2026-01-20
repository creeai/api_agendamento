# Como Obter o JWT do Supabase

Este documento explica como obter o token JWT (access token) do Supabase no projeto.

## 📍 Locais no Código

### 1. **No Servidor (Server Components / API Routes)**

O JWT é obtido automaticamente através dos cookies quando você usa `createClient()` do `@supabase/ssr`.

```typescript
// lib/supabase/server.ts
import {createClient} from "@/lib/supabase/server"

// O cliente já lê o JWT dos cookies automaticamente
const supabase = await createClient()

// Para obter o usuário (que contém o JWT internamente)
const {data: {user}, error} = await supabase.auth.getUser()

// Para obter a sessão completa (inclui access_token)
const {data: {session}, error} = await supabase.auth.getSession()
```

**Exemplo prático:**

```typescript
// app/api/exemplo/route.ts
import {createClient} from "@/lib/supabase/server"
import {NextResponse} from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  // Obter sessão (contém o JWT)
  const {data: {session}, error} = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({error: "Não autenticado"}, {status: 401})
  }
  
  // O JWT está em session.access_token
  const jwtToken = session.access_token
  
  return NextResponse.json({
    token: jwtToken,
    userId: session.user.id,
    expiresAt: session.expires_at
  })
}
```

### 2. **No Cliente (Client Components)**

No navegador, você pode obter o JWT através do cliente do Supabase:

```typescript
// Componente React
"use client"
import {createClient} from "@/lib/supabase/client"
import {useEffect, useState} from "react"

export default function MeuComponente() {
  const [token, setToken] = useState<string | null>(null)
  
  useEffect(() => {
    const supabase = createClient()
    
    // Obter sessão atual
    supabase.auth.getSession().then(({data: {session}}) => {
      if (session) {
        setToken(session.access_token)
      }
    })
    
    // Ou escutar mudanças na sessão
    const {data: {subscription}} = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setToken(session.access_token)
      } else {
        setToken(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return <div>Token: {token ? token.substring(0, 20) + "..." : "Não autenticado"}</div>
}
```

### 3. **Usando a Função Helper Existente**

O projeto já tem uma função helper que obtém o usuário autenticado:

```typescript
// lib/auth/helpers.ts
import {getCurrentUser} from "@/lib/auth/helpers"

// Esta função já usa o JWT internamente via supabase.auth.getUser()
const user = await getCurrentUser()

if (!user) {
  // Usuário não autenticado
}
```

## 🔑 Estrutura do JWT do Supabase

O JWT do Supabase contém:

```json
{
  "aud": "authenticated",
  "exp": 1234567890,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "iat": 1234567890
}
```

## 📝 Exemplos de Uso

### Exemplo 1: Obter JWT em uma API Route

```typescript
// app/api/v1/me/route.ts
import {createClient} from "@/lib/supabase/server"
import {NextResponse} from "next/server"

export async function GET() {
  const supabase = await createClient()
  const {data: {session}} = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401})
  }
  
  return NextResponse.json({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
    user: session.user
  })
}
```

### Exemplo 2: Usar JWT para Fazer Requisições Autenticadas

```typescript
// app/api/v1/protected/route.ts
import {createClient} from "@/lib/supabase/server"
import {NextResponse} from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  // O cliente já usa o JWT automaticamente nas requisições
  const {data, error} = await supabase
    .from("users")
    .select("*")
  
  if (error) {
    return NextResponse.json({error: error.message}, {status: 401})
  }
  
  return NextResponse.json({data})
}
```

### Exemplo 3: Obter JWT no Cliente para Enviar em Headers

```typescript
"use client"
import {createClient} from "@/lib/supabase/client"

async function fazerRequisicaoAutenticada() {
  const supabase = createClient()
  const {data: {session}} = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error("Não autenticado")
  }
  
  // Usar o JWT em uma requisição externa
  const response = await fetch("https://api.externa.com/dados", {
    headers: {
      "Authorization": `Bearer ${session.access_token}`
    }
  })
  
  return response.json()
}
```

## 🔐 Segurança

⚠️ **IMPORTANTE:**

1. **Nunca exponha o JWT no frontend** de forma insegura
2. **Use HTTPS** sempre em produção
3. **O JWT expira** - use `refresh_token` para renovar
4. **No servidor**, o JWT é lido automaticamente dos cookies (seguro)
5. **No cliente**, o JWT fica armazenado no localStorage (gerenciado pelo Supabase)

## 🔄 Renovação Automática

O Supabase renova o JWT automaticamente quando você usa `createClient()`:

- **Servidor**: Renovação via cookies (gerenciado pelo `@supabase/ssr`)
- **Cliente**: Renovação automática via `refresh_token`

## 📚 Referências

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [JWT.io](https://jwt.io/) - Para decodificar e inspecionar JWTs
