# 🔄 Como Limpar o Cache do PWA

## Problema
As atualizações do PWA demoram a aparecer por causa do Service Worker que cacheia tudo.

## Soluções Implementadas

### 1. Versionamento Automático ✅
- Adicionado `version: "1.1.0"` no manifest.json
- Adicionado parâmetro `?v=1.1.0` na start_url
- **Incrementar a versão a cada deploy** força o PWA a atualizar

### 2. Configurações do Service Worker ✅
- `skipWaiting: true` - SW novo ativa imediatamente
- `cacheOnFrontEndNav: true` - Cache em navegação
- `reloadOnOnline: true` - Recarrega quando volta online

## Como Limpar Cache Manualmente

### No Celular (Android/iOS):

#### Opção 1: Desinstalar e Reinstalar
1. Pressione e segure o ícone do app
2. Selecione "Desinstalar" ou "Remover do início"
3. Abra o navegador
4. Vá em https://vincecliente.vercel.app
5. Clique em "Instalar" novamente

#### Opção 2: Limpar Cache do Navegador
**Chrome/Edge Android:**
1. Abra o Chrome
2. Menu (⋮) → Histórico → Limpar dados de navegação
3. Selecione "Imagens e arquivos em cache"
4. Clique em "Limpar dados"
5. Reabra o app

**Safari iOS:**
1. Configurações → Safari
2. "Limpar Histórico e Dados de Sites"
3. Reabra o app

### No Desktop (para testar):

**Chrome/Edge:**
1. F12 (DevTools)
2. Aba "Application"
3. Service Workers → Unregister
4. Clear Storage → Clear site data
5. Ctrl+Shift+R (hard refresh)

**Firefox:**
1. F12 (DevTools)
2. Aba "Storage"
3. Service Workers → Unregister
4. Ctrl+Shift+Delete → Limpar cache
5. Ctrl+Shift+R

## Checklist de Deploy

Antes de fazer deploy de mudanças visuais/funcionais:

- [ ] Incrementar versão no `manifest.json`
- [ ] Atualizar `start_url` com a nova versão
- [ ] Fazer build e testar localmente
- [ ] Fazer push para GitHub
- [ ] Aguardar deploy da Vercel
- [ ] Testar limpando cache (desinstalar/reinstalar app)

## Versões

- **1.0.0** - Versão inicial
- **1.1.0** - Logo atualizado, nome "Vince", correções de UI (23/12/2024)
