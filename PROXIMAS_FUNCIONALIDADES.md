# 🚀 Próximas Funcionalidades

Funcionalidades solicitadas para desenvolvimento futuro.

## 1. 🔔 Notificações Push de Lembrete

### Objetivo
Enviar notificações sonoras no celular para lembrar o cliente do agendamento.

### Especificação
- **2.5 horas antes**: "Lembre-se: seu horário é às [HORA]. Você ainda pode cancelar."
- **30 minutos antes**: "Seu horário é daqui a 30 minutos na Vince Barbearia!"

### Requisitos Técnicos
1. **Service Worker Push API**
   - Solicitar permissão de notificações
   - Registrar token push no backend

2. **Backend (Supabase Function ou N8N)**
   - Cron job que roda a cada 5 minutos
   - Busca agendamentos que precisam de notificação
   - Envia push via Firebase Cloud Messaging (FCM) ou similar

3. **Estrutura de Dados**
   - Nova tabela: `notificacoes_push`
     - cliente_id
     - agendamento_id
     - push_token
     - notificado_2h5 (boolean)
     - notificado_30min (boolean)

### Implementação
```typescript
// 1. Solicitar permissão
Notification.requestPermission()

// 2. Registrar service worker
navigator.serviceWorker.register('/sw.js')

// 3. Receber token e salvar no backend
// 4. Backend envia notificação via FCM
```

### Estimativa
- **Complexidade**: Alta
- **Tempo**: 8-12 horas
- **Dependências**:
  - Firebase Cloud Messaging ou OneSignal
  - Supabase Edge Function ou N8N
  - Permissão do usuário

---

## 2. 🛍️ Sistema de Produtos e Pacotes

### Objetivo
Permitir compra de produtos e pacotes SEM necessidade de barbeiro ou horário.

### Especificação Atual
❌ Problema: Sistema só funciona para SERVIÇOS (requer barbeiro + horário)
✅ Solução: Separar fluxo para PRODUTOS e PACOTES

### Fluxo Proposto

#### Serviços (atual - mantém)
1. Seleciona serviço
2. Seleciona barbeiro
3. Seleciona data
4. Seleciona horário
5. Confirma agendamento

#### Produtos/Pacotes (novo)
1. Seleciona produto OU pacote
2. Quantidade (opcional)
3. Forma de retirada:
   - **Retirar na barbearia** (sem horário específico)
   - **Agendar retirada** (escolhe data/hora)
4. Pagamento (PIX/Cartão/Presencial)
5. Confirma compra

### Mudanças Necessárias

#### 1. Banco de Dados
```sql
-- Adicionar tipo em tabela produtos
ALTER TABLE produtos
ADD COLUMN tipo VARCHAR(20) DEFAULT 'produto' CHECK (tipo IN ('produto', 'pacote'));

-- Adicionar em agendamentos
ALTER TABLE agendamentos
ADD COLUMN tipo_agendamento VARCHAR(20) DEFAULT 'servico' CHECK (tipo_agendamento IN ('servico', 'compra'));
ADD COLUMN requer_horario BOOLEAN DEFAULT true;
```

#### 2. Tela de Seleção
- Detectar se é produto/pacote
- Mostrar fluxo diferente
- Barbeiro/Horário = opcional

#### 3. API
- Novo endpoint: `/api/agendamentos/criar-compra`
- Sem validação de barbeiro_id
- Sem validação de hora_inicio (se retirada livre)

### Estimativa
- **Complexidade**: Média-Alta
- **Tempo**: 6-10 horas
- **Dependências**:
  - Decisão sobre pagamento
  - Fluxo de retirada/entrega

---

## 📝 Status

| Funcionalidade | Status | Prioridade |
|----------------|--------|-----------|
| ✅ Timezone Brasília | Concluído | Alta |
| ✅ Cor de fundo dashboard | Concluído | Média |
| ✅ Popup instalação 1x | Concluído | Alta |
| ✅ Botão instalar no Perfil | Concluído | Média |
| 🟡 Notificações Push | Pendente | Alta |
| 🟡 Produtos/Pacotes sem barbeiro | Pendente | Média |

---

## 💡 Recomendações

### Para Notificações
1. Usar **OneSignal** (mais fácil que FCM)
2. Implementar primeiro no dashboard (teste)
3. Depois migrar para PWA

### Para Produtos/Pacotes
1. Começar com "Retirar na barbearia" (mais simples)
2. Depois adicionar agendamento de retirada
3. Integrar pagamento como última etapa

---

## 🔗 Links Úteis

- [Web Push Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [OneSignal Web Push](https://documentation.onesignal.com/docs/web-push-quickstart)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [N8N Scheduling](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.schedule/)
