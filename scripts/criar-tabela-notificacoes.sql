-- ==========================================
-- TABELA: notificacoes_clientes
-- ==========================================
-- Armazena quais notificações foram visualizadas pelos clientes
-- ==========================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS notificacoes_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  notificacao_id TEXT NOT NULL, -- ID da notificação (ex: "24h-uuid-do-agendamento")
  lida_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Impedir duplicatas
  UNIQUE(cliente_id, notificacao_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_clientes_cliente_id ON notificacoes_clientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_clientes_notificacao_id ON notificacoes_clientes(notificacao_id);

-- Habilitar RLS
ALTER TABLE notificacoes_clientes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Clientes podem ver suas notificações" ON notificacoes_clientes;
CREATE POLICY "Clientes podem ver suas notificações"
  ON notificacoes_clientes
  FOR SELECT
  USING (cliente_id IN (
    SELECT id FROM clientes WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Clientes podem marcar notificações como lidas" ON notificacoes_clientes;
CREATE POLICY "Clientes podem marcar notificações como lidas"
  ON notificacoes_clientes
  FOR INSERT
  WITH CHECK (cliente_id IN (
    SELECT id FROM clientes WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Serviço pode gerenciar notificações" ON notificacoes_clientes;
CREATE POLICY "Serviço pode gerenciar notificações"
  ON notificacoes_clientes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comentários
COMMENT ON TABLE notificacoes_clientes IS 'Armazena notificações visualizadas pelos clientes';
COMMENT ON COLUMN notificacoes_clientes.cliente_id IS 'ID do cliente';
COMMENT ON COLUMN notificacoes_clientes.notificacao_id IS 'ID da notificação (formato: tipo-agendamento_id)';
COMMENT ON COLUMN notificacoes_clientes.lida_em IS 'Quando a notificação foi marcada como lida';
