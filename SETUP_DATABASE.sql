-- ============================================
-- Script de Configuração do Banco de Dados
-- Aplicativo Cliente - Vinci Barbearia
-- ============================================

-- 1. Adicionar colunas necessárias na tabela clientes
-- -------------------------------------------------

-- Coluna de senha (hash bcrypt)
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS senha TEXT;

-- Coluna de último acesso
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMPTZ;

-- Colunas de preferências adicionais
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS estilo_preferido TEXT,
ADD COLUMN IF NOT EXISTS bebida_preferida TEXT;

-- Comentários nas colunas
COMMENT ON COLUMN clientes.senha IS 'Senha hasheada com bcrypt para login no app';
COMMENT ON COLUMN clientes.ultimo_acesso IS 'Data e hora do último acesso ao app';
COMMENT ON COLUMN clientes.estilo_preferido IS 'Estilo de corte preferido do cliente';
COMMENT ON COLUMN clientes.bebida_preferida IS 'Bebida preferida durante o atendimento';

-- 2. Criar índices para otimização
-- -------------------------------------------------

-- Índice para busca por telefone (usado no login)
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);

-- Índice para busca por email (usado na recuperação de senha)
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);

-- Índice para busca de agendamentos por cliente
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_id ON agendamentos(cliente_id);

-- Índice composto para buscar agendamentos futuros
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_data
ON agendamentos(cliente_id, data_agendamento, status);

-- 3. Políticas RLS (Row Level Security) - IMPORTANTE
-- -------------------------------------------------

-- Permitir que clientes visualizem apenas seus próprios dados
-- ATENÇÃO: Adapte conforme sua configuração de RLS existente

-- Exemplo de política para leitura (comentado, adapte conforme necessário):
-- CREATE POLICY "Clientes podem ver seus próprios dados"
--   ON clientes FOR SELECT
--   USING (auth.uid() = id::text OR auth.role() = 'service_role');

-- Exemplo de política para update (comentado, adapte conforme necessário):
-- CREATE POLICY "Clientes podem atualizar seus próprios dados"
--   ON clientes FOR UPDATE
--   USING (auth.uid() = id::text OR auth.role() = 'service_role');

-- 4. Verificações e validações
-- -------------------------------------------------

-- Verificar se as colunas foram criadas com sucesso
DO $$
BEGIN
    RAISE NOTICE '=== Verificando estrutura da tabela clientes ===';

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clientes' AND column_name = 'senha'
    ) THEN
        RAISE NOTICE '✓ Coluna senha criada com sucesso';
    ELSE
        RAISE WARNING '✗ Coluna senha não foi criada';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clientes' AND column_name = 'ultimo_acesso'
    ) THEN
        RAISE NOTICE '✓ Coluna ultimo_acesso criada com sucesso';
    ELSE
        RAISE WARNING '✗ Coluna ultimo_acesso não foi criada';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clientes' AND column_name = 'estilo_preferido'
    ) THEN
        RAISE NOTICE '✓ Coluna estilo_preferido criada com sucesso';
    ELSE
        RAISE WARNING '✗ Coluna estilo_preferido não foi criada';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clientes' AND column_name = 'bebida_preferida'
    ) THEN
        RAISE NOTICE '✓ Coluna bebida_preferida criada com sucesso';
    ELSE
        RAISE WARNING '✗ Coluna bebida_preferida não foi criada';
    END IF;

    RAISE NOTICE '=== Verificação concluída ===';
END $$;

-- 5. Dados de exemplo (OPCIONAL - apenas para testes)
-- -------------------------------------------------

-- Descomente as linhas abaixo para criar um cliente de teste
-- IMPORTANTE: A senha será '123456' (hasheada com bcrypt)

/*
INSERT INTO clientes (
    nome_completo,
    telefone,
    email,
    senha,
    data_cadastro,
    is_vip,
    gosta_conversar
) VALUES (
    'Cliente Teste',
    '11999999999',
    'teste@vincibarbearia.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- senha: 123456
    NOW(),
    false,
    true
) ON CONFLICT (telefone) DO NOTHING;
*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- INSTRUÇÕES DE USO:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script completo
-- 4. Execute clicando em "Run"
-- 5. Verifique as mensagens de sucesso
-- 6. O banco de dados estará pronto para o app cliente!
