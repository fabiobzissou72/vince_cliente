# Vinci Barbearia - Aplicativo Cliente (PWA)

Aplicativo Progressive Web App (PWA) para clientes da Vinci Barbearia realizarem agendamentos.

## 🚀 Funcionalidades

- ✅ Login com telefone e senha
- ✅ Cadastro completo de clientes
- ✅ Visualização de barbeiros e serviços
- ✅ Agendamento de horários
- ✅ Histórico de agendamentos
- ✅ Edição de perfil
- ✅ Recuperação de senha por email
- ✅ Tema escuro e claro
- ✅ Notificações push
- ✅ Instalável como aplicativo (PWA)
- ✅ Sincronização automática com Dashboard e WhatsApp

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase configurada
- Variáveis de ambiente configuradas

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/fabiobzissou72/vince_cliente.git
cd vince_cliente
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase.

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

5. Acesse em: `http://localhost:3001`

## 🏗️ Build para Produção

```bash
npm run build
npm start
```

## 📱 Instalação como PWA

### Android (Chrome)
1. Acesse o site pelo Chrome
2. Toque no menu (três pontos)
3. Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"
4. Confirme a instalação

### iOS (Safari)
1. Acesse o site pelo Safari
2. Toque no ícone de compartilhamento (quadrado com seta)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Toque em "Adicionar"

## 🎨 Temas

O aplicativo suporta tema escuro e claro automaticamente, seguindo a preferência do sistema ou permitindo alteração manual.

Cores da Vinci:
- **Azul Escuro**: #1e3a8a
- **Azul Médio**: #3b82f6
- **Azul Claro**: #60a5fa

## 🔐 Segurança

- Senhas armazenadas com bcrypt (hash)
- Variáveis de ambiente protegidas
- Comunicação HTTPS obrigatória
- Tokens de autenticação seguros

## 📦 Deploy no Vercel

1. Faça push para o GitHub
2. Importe o projeto no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 🗄️ Banco de Dados

### Adicionar campo de senha na tabela clientes

Execute no Supabase SQL Editor:

```sql
-- Adiciona coluna de senha e último acesso
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS senha TEXT,
ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMPTZ;

-- Adiciona campos adicionais de preferências
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS estilo_preferido TEXT,
ADD COLUMN IF NOT EXISTS bebida_preferida TEXT;
```

## 📞 Suporte

Para dúvidas e suporte, entre em contato com a Vinci Barbearia.

## 📄 Licença

© 2024 Vinci Barbearia. Todos os direitos reservados.
