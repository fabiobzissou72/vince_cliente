# 🔔 Sistema de Notificações - Vince Cliente

## O que foi implementado:

### 1. **API de Notificações** (`/api/notificacoes`)
- **GET**: Busca todas as notificações do cliente logado
- **POST**: Marca notificação como lida

### 2. **Tipos de Notificações**

#### 📅 Lembrete 24h
- **Quando**: Agendamento é amanhã
- **Mensagem**: "Amanhã é seu corte!"
- **Dados**: Data, hora, barbeiro

#### ⏰ Lembrete 2h
- **Quando**: Falta exatamente 2 horas (janela de 120-130 min)
- **Mensagem**: "Falta 2 horas!"
- **Dados**: Data, hora, barbeiro

#### ⭐ Follow-up 3 dias
- **Quando**: 3 dias após atendimento concluído
- **Mensagem**: "Como foi seu atendimento?"
- **Dados**: Data do atendimento, barbeiro

#### 🔄 Follow-up 21 dias
- **Quando**: 21 dias após atendimento concluído
- **Mensagem**: "Hora de reagendar!"
- **Dados**: Data do atendimento, barbeiro

---

## 🚀 Como usar:

### **Passo 1: Criar tabela no Supabase**

Execute o SQL:
```bash
# Arquivo: aplicativo_cliente/scripts/criar-tabela-notificacoes.sql
```

Copie o conteúdo e cole no **SQL Editor** do Supabase.

### **Passo 2: Testar API**

Como cliente logado, acesse:
```
https://seu-app-cliente.vercel.app/api/notificacoes?cliente_id=UUID_DO_CLIENTE
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "nao_lidas": 2,
    "notificacoes": [
      {
        "id": "24h-uuid-do-agendamento",
        "tipo": "lembrete_24h",
        "titulo": "📅 Amanhã é seu corte!",
        "mensagem": "Você tem um agendamento amanhã às 09:00 com Alex",
        "data": "27/01/2026",
        "hora": "09:00",
        "barbeiro": "Alex",
        "agendamento_id": "uuid-do-agendamento",
        "lida": false
      }
    ]
  }
}
```

### **Passo 3: Usar no App**

#### **Badge no Header**
- Mostra número de notificações não lidas
- Atualiza automaticamente a cada 30 segundos
- Clica para ir para página de notificações

#### **Badge na BottomNav**
- Ícone de sino com badge vermelho
- Mostra contagem de notificações não lidas
- Atualiza automaticamente

#### **Página de Notificações** (`/notificacoes`)
- Lista todas as notificações
- Não lidas aparecem primeiro com borda azul
- Clica para marcar como lida
- Botão "Marcar todas como lidas"

---

## 📱 Páginas Atualizadas:

### ✅ **Header**
- Adicionado `NotificationBadge` ao lado do botão de tema

### ✅ **BottomNav**
- Adicionado botão "Notificações" no meio da navegação
- Badge vermelho com contagem
- 5 botões: Início, Agendar, **Notificações**, Horários, Perfil

### ✅ **Página `/notificacoes`**
- Lista completa de notificações
- Ícones coloridos por tipo
- Marcar como lida individualmente
- Marcar todas como lidas

---

## 🎨 Cores dos Ícones:

| Tipo | Cor | Ícone |
|------|-----|-------|
| Lembrete 24h | Azul | 📅 Calendar |
| Lembrete 2h | Laranja | ⏰ Clock |
| Follow-up 3d | Verde | ⭐ CheckCircle |
| Follow-up 21d | Roxo | 🔄 Scissors |

---

## ⚙️ Configurações Automáticas:

### **Atualização automática:**
- Header: a cada 30 segundos
- BottomNav: a cada 30 segundos
- Página de notificações: ao abrir

### **Performance:**
- Usuário não lido aparece primeiro
- Lidos ficam transparentes
- Clique para marcar como lida

---

## 🧪 Como Testar:

### **Teste 1: Criar agendamento para amanhã**
1. Agende um corte para amanhã
2. Espere o cron rodar (ou execute manualmente)
3. Vá em `/notificacoes`
4. Deve aparecer lembrete 24h

### **Teste 2: Criar agendamento para daqui a 2h**
1. Agende um corte para daqui a 2h10min
2. Execute `/api/cron/lembretes` quando faltar 2h
3. Deve aparecer lembrete 2h

### **Teste 3: Follow-up 3 dias**
1. Conclua um agendamento (status: concluído, compareceu: true)
2. Espere 3 dias
3. Execute `/api/cron/lembretes`
4. Deve aparecer follow-up 3d

### **Teste 4: Follow-up 21 dias**
1. Conclua um agendamento
2. Espere 21 dias
3. Execute `/api/cron/lembretes`
4. Deve aparecer follow-up 21d

---

## 📊 Exemplo de Uso:

```typescript
// Buscar notificações não lidas
const response = await fetch(`/api/notificacoes?cliente_id=${cliente.id}`)
const { data } = await response.json()

console.log('Total:', data.total)
console.log('Não lidas:', data.nao_lidas)
console.log('Notificações:', data.notificacoes)

// Marcar como lida
await fetch('/api/notificacoes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cliente_id: cliente.id,
    notificacao_id: '24h-uuid-do-agendamento'
  })
})
```

---

## 🎯 Benefícios:

✅ **Clientes sempre informados** - Lembretes automáticos
✅ **Follow-ups automáticos** - Peça feedback e reagendamento
✅ **Não precisa app nativo** - Funciona no PWA
✅ **Atualização em tempo real** - A cada 30 segundos
✅ **Marcação de lidas** - Não repete notificações

---

## 🔧 Próximas Melhorias:

- [ ] Notificações Push (PWA)
- [ ] Som de notificação
- [ ] Vibration API
- [ ] Preferências do cliente (quais receber)
- [ ] Histórico de notificações

---

## 📝 Notas:

- As notificações são geradas automaticamente pelo **cron job**
- O cliente **JÁ RECEBE** WhatsApp com as mesmas informações
- Este sistema é um **complemento visual** para o app
- Não interfere com os webhooks do N8N

Pronto para usar! 🚀
