-- ==================================================
-- VIEW UNIFICADA PARA DASHBOARD
-- ==================================================
-- Esta view consolida dados das 3 tabelas existentes
-- em um formato único para o dashboard
-- ==================================================

-- Criar view que unifica todos os leads
CREATE OR REPLACE VIEW vw_leads_dashboard AS
SELECT
    -- Identificação
    ic.id,
    ic.conversation_id,
    ic.data_hora as created_at,

    -- Informações do Lead
    ic.nome,
    ic.telefone,
    COALESCE(ic.agent_id, 'PRAIA') as agente,
    COALESCE(ic.origem, 'Whatsapp') as origem,

    -- Informações do Imóvel
    ic.codigo_imovel,
    -- Converte valor de string para numeric
    CASE
        WHEN ic.valor_imovel ~ '^[0-9,.]+$' THEN
            CAST(
                REPLACE(
                    REPLACE(
                        REPLACE(ic.valor_imovel, 'R$', ''),
                        '.', ''
                    ),
                    ',', '.'
                ) AS NUMERIC
            )
        ELSE 0
    END as valor,
    ic.bairro,
    ic.tipo_negocio,
    ic.tipo_imovel,

    -- Status do Lead
    CASE
        WHEN va.id IS NOT NULL THEN true
        ELSE false
    END as visita_agendada,

    CASE
        WHEN va.bitrix_lead = 1 THEN true
        ELSE false
    END as bitrix,

    -- Metadados
    ic.resumo_conversa as observacoes

FROM imoveis_consultados ic
LEFT JOIN visitas_agendadas va
    ON ic.conversation_id = va.conversation_id

UNION ALL

-- Adiciona visitas que não estão em imoveis_consultados
SELECT
    va.id,
    va.conversation_id,
    va.data_hora as created_at,
    va.nome,
    va.telefone,
    COALESCE(va.agent_id, 'PRAIA') as agente,
    COALESCE(va.origem, 'Whatsapp') as origem,
    va.codigo_imovel,
    CASE
        WHEN va.valor_imovel ~ '^[0-9,.]+$' THEN
            CAST(
                REPLACE(
                    REPLACE(
                        REPLACE(va.valor_imovel, 'R$', ''),
                        '.', ''
                    ),
                    ',', '.'
                ) AS NUMERIC
            )
        ELSE 0
    END as valor,
    va.bairro,
    va.tipo_negocio,
    va.tipo_imovel,
    true as visita_agendada,
    CASE
        WHEN va.bitrix_lead = 1 THEN true
        ELSE false
    END as bitrix,
    va.resumo_conversa as observacoes
FROM visitas_agendadas va
WHERE NOT EXISTS (
    SELECT 1 FROM imoveis_consultados ic
    WHERE ic.conversation_id = va.conversation_id
);

-- Comentário explicativo
COMMENT ON VIEW vw_leads_dashboard IS 'View unificada que consolida dados de imoveis_consultados e visitas_agendadas para o dashboard';

-- Conceder permissões de leitura
GRANT SELECT ON vw_leads_dashboard TO anon;
GRANT SELECT ON vw_leads_dashboard TO authenticated;

-- ==================================================
-- QUERIES DE TESTE
-- ==================================================
-- Execute estas queries para verificar os dados:

-- 1. Ver todos os leads
-- SELECT * FROM vw_leads_dashboard ORDER BY created_at DESC LIMIT 10;

-- 2. Contar leads por origem
-- SELECT origem, COUNT(*) as total FROM vw_leads_dashboard GROUP BY origem;

-- 3. Contar visitas agendadas
-- SELECT COUNT(*) FROM vw_leads_dashboard WHERE visita_agendada = true;

-- 4. Contar leads no BITRIX
-- SELECT COUNT(*) FROM vw_leads_dashboard WHERE bitrix = true;

-- 5. Ver leads de hoje
-- SELECT * FROM vw_leads_dashboard WHERE DATE(created_at) = CURRENT_DATE;
