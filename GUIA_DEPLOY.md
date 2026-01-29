# 🚀 Guia Completo de Deploy - Vinci Cliente App

Este guia fornece instruções passo a passo para configurar e fazer deploy do aplicativo cliente da Vinci Barbearia.

## 📋 Pré-requisitos

- [ ] Conta no GitHub
- [ ] Conta no Vercel (gratuita)
- [ ] Banco de dados Supabase configurado
- [ ] Node.js 18+ instalado localmente

## 🗄️ Passo 1: Configurar Banco de Dados

### 1.1. Acessar Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login e acesse seu projeto
3. Vá em **SQL Editor**

### 1.2. Executar Script SQL

1. Copie todo o conteúdo do arquivo `SETUP_DATABASE.sql`
2. Cole no SQL Editor do Supabase
3. Clique em **Run** para executar
4. Verifique as mensagens de sucesso no console

### 1.3. Verificar Estrutura

Execute este comando para verificar se tudo está correto:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;
```

Você deve ver as colunas: `senha`, `ultimo_acesso`, `estilo_preferido`, `bebida_preferida`

## 📦 Passo 2: Preparar Repositório GitHub

### 2.1. Criar Repositório

1. Acesse [github.com/new](https://github.com/new)
2. Nome: `vinci-cliente` (ou outro de sua preferência)
3. Visibilidade: **Privado** (recomendado)
4. **NÃO** inicialize com README, .gitignore ou licença
5. Clique em **Create repository**

### 2.2. Fazer Push do Código

No terminal, dentro da pasta `aplicativo_cliente`:

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "🎉 Initial commit - Vinci Cliente App PWA"

# Conectar ao repositório remoto (substitua com seu URL)
git remote add origin https://github.com/fabiobzissou72/vinci_cliente.git

# Enviar para o GitHub
git push -u origin main
```

> **Nota:** Se aparecer erro de branch, tente: `git branch -M main` antes do push

## 🌐 Passo 3: Deploy no Vercel

### 3.1. Importar Projeto

1. Acesse [vercel.com](https://vercel.com)
2. Faça login (pode usar conta do GitHub)
3. Clique em **Add New** → **Project**
4. Importe o repositório `vinci-cliente`

### 3.2. Configurar Projeto

**Build & Development Settings:**
- Framework Preset: **Next.js**
- Root Directory: `.` (raiz)
- Build Command: `npm run build` (padrão)
- Output Directory: `.next` (padrão)

### 3.3. Configurar Variáveis de Ambiente

Clique em **Environment Variables** e adicione:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nypuvicehlmllhbudghf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sua_chave_anon_aqui` |
| `NEXT_PUBLIC_APP_URL` | `https://seu-app.vercel.app` (será preenchido depois) |
| `NEXT_PUBLIC_APP_NAME` | `Vinci Barbearia` |

### 3.4. Deploy

1. Clique em **Deploy**
2. Aguarde o build (leva 2-3 minutos)
3. Quando terminar, copie a URL gerada
4. Volte em **Settings** → **Environment Variables**
5. Edite `NEXT_PUBLIC_APP_URL` com a URL do seu app

### 3.5. Configurar Domínio Customizado (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado (ex: `app.vincibarbearia.com.br`)
3. Siga as instruções para configurar DNS

## 🔧 Passo 4: Configurações Finais

### 4.1. Atualizar manifest.json

Se usar domínio customizado, edite `public/manifest.json`:

```json
{
  "start_url": "https://seu-dominio-personalizado.com",
  "scope": "/"
}
```

Faça commit e push:

```bash
git add public/manifest.json
git commit -m "🔧 Update manifest with custom domain"
git push
```

O Vercel fará redeploy automaticamente.

### 4.2. Gerar Ícones PWA

**IMPORTANTE:** Você precisa gerar os ícones a partir do logo da Vinci.

#### Opção 1: Usar ferramenta online

1. Acesse [https://www.pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator)
2. Faça upload do arquivo `public/logo.png`
3. Baixe o zip com todos os tamanhos
4. Substitua os arquivos em `public/icons/`

#### Opção 2: Usar Photoshop/GIMP

Crie manualmente nos tamanhos:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

Salve todos em `public/icons/` com nomes `icon-{tamanho}.png`

### 4.3. Testar PWA

1. Abra o app no celular (Chrome ou Safari)
2. Siga instruções em `/instalar` para instalar
3. Teste todas as funcionalidades:
   - Login
   - Cadastro
   - Criar agendamento
   - Cancelar agendamento
   - Editar perfil
   - Alterar senha

## 🔐 Passo 5: Segurança

### 5.1. Variáveis de Ambiente

✅ **NUNCA** commite o arquivo `.env.local` no git
✅ `.gitignore` já está configurado para ignorá-lo
✅ Todas as chaves sensíveis estão em variáveis de ambiente

### 5.2. RLS (Row Level Security)

Verifique se as políticas RLS do Supabase estão ativas:

```sql
-- Verificar se RLS está ativo
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('clientes', 'agendamentos', 'barbeiros', 'servicos');
```

Se `rowsecurity = false`, ative:

```sql
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
```

## 📱 Passo 6: Notificações Push (Opcional)

Para implementar notificações push futuramente:

1. Configure Web Push no Vercel
2. Gere VAPID keys
3. Configure Service Worker
4. Implemente subscriptions

*(Documentação detalhada será fornecida separadamente)*

## ✅ Checklist Final

Antes de liberar para produção:

- [ ] Banco de dados atualizado com script SQL
- [ ] Código enviado para GitHub
- [ ] Deploy no Vercel funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Ícones PWA gerados e substituídos
- [ ] Testado login e cadastro
- [ ] Testado criação de agendamento
- [ ] Testado em iPhone (Safari)
- [ ] Testado em Android (Chrome)
- [ ] PWA instalável funcionando
- [ ] Temas claro e escuro funcionando

## 🆘 Problemas Comuns

### Erro: "Invalid phone number"

**Solução:** Certifique-se que o telefone está sem o +55 no formato: `11999999999`

### Erro: "Senha não cadastrada"

**Solução:** Execute o script SQL novamente para garantir que a coluna `senha` existe

### Erro: Build falhou no Vercel

**Solução:** Verifique os logs, geralmente é falta de dependências. Execute localmente:

```bash
npm install
npm run build
```

### PWA não aparece opção de instalar

**Solução:**
- Android: Use Chrome (não Firefox)
- iOS: Use Safari (OBRIGATÓRIO)
- Verifique se está em HTTPS

### Ícones não aparecem

**Solução:** Gere os ícones conforme Passo 4.2 e faça novo deploy

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do Vercel
2. Verifique console do navegador (F12)
3. Verifique logs do Supabase
4. Consulte a documentação do Next.js e Supabase

## 🎉 Pronto!

Seu aplicativo cliente da Vinci Barbearia está no ar!

Compartilhe a URL com seus clientes e comece a receber agendamentos pelo app.

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0.0
