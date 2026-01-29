# 🔐 Variáveis de Ambiente - Vercel

## Variáveis Obrigatórias

Configure estas variáveis no painel da Vercel antes do deploy:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://nypuvicehlmllhbudghf.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cHV2aWNlaGxtbGxoYnVkZ2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzIxOTgsImV4cCI6MjA3MzQwODE5OH0.USnNrsn-NtwQA04Qd8GkV_d0AyhLVhYgqvzGk7XlTek
```

### 3. NEXT_PUBLIC_APP_NAME
```
Vinci Barbearia
```

### 4. NEXT_PUBLIC_APP_URL (opcional - será preenchida após deploy)
```
https://seu-app.vercel.app
```
*Deixe em branco inicialmente. Após o primeiro deploy, pegue a URL gerada e adicione esta variável.*

---

## 📋 Como Adicionar na Vercel

### Método 1: Durante o Import do Projeto

1. Acesse https://vercel.com
2. Clique em **Add New** → **Project**
3. Importe o repositório `vince_cliente`
4. Na seção **Environment Variables**, adicione cada variável:
   - Clique em **Add**
   - Cole o **Name** (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - Cole o **Value** (ex: `https://nypuvicehlmllhbudghf.supabase.co`)
   - Selecione **Production**, **Preview** e **Development**
   - Repita para todas as variáveis
5. Clique em **Deploy**

### Método 2: Depois do Deploy

1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Para cada variável:
   - Clique em **Add New**
   - Nome da variável
   - Valor da variável
   - Selecione os ambientes (Production, Preview, Development)
   - Clique em **Save**
4. Faça **Redeploy** do projeto

---

## 🎯 Checklist Rápido

```
☐ NEXT_PUBLIC_SUPABASE_URL
☐ NEXT_PUBLIC_SUPABASE_ANON_KEY
☐ NEXT_PUBLIC_APP_NAME
☐ NEXT_PUBLIC_APP_URL (após primeiro deploy)
```

---

## 🖼️ Screenshot de Exemplo

Suas variáveis devem ficar assim na Vercel:

```
┌─────────────────────────────────────┬────────────────────────────┐
│ Name                                │ Value                      │
├─────────────────────────────────────┼────────────────────────────┤
│ NEXT_PUBLIC_SUPABASE_URL           │ https://nypuvicehlmll...   │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY      │ eyJhbGciOiJIUzI1NiIs...   │
│ NEXT_PUBLIC_APP_NAME               │ Vinci Barbearia            │
│ NEXT_PUBLIC_APP_URL                │ https://vince-cliente...   │
└─────────────────────────────────────┴────────────────────────────┘
```

---

## ⚠️ IMPORTANTE

- **NÃO** commite o arquivo `.env.local` no git (já está no .gitignore)
- As variáveis com prefixo `NEXT_PUBLIC_` ficam expostas no cliente (navegador)
- A chave `SUPABASE_ANON_KEY` é segura para usar no cliente (tem permissões limitadas)
- **NUNCA** exponha a `SUPABASE_SERVICE_ROLE_KEY` no cliente

---

## 🔄 Atualizar Variáveis Depois do Deploy

Se precisar alterar alguma variável depois:

1. Vá em **Settings** → **Environment Variables**
2. Clique nos **...** ao lado da variável
3. Clique em **Edit**
4. Altere o valor
5. Salve
6. Vá em **Deployments** → **...** → **Redeploy**

---

## ✅ Testar se Funcionou

Após o deploy, teste:

1. Acesse a URL do app
2. Abra o console do navegador (F12)
3. Digite: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
4. Deve aparecer a URL do Supabase
5. Se aparecer `undefined`, as variáveis não foram configuradas corretamente

---

**Pronto! Com essas variáveis configuradas, o app funcionará perfeitamente! 🚀**
