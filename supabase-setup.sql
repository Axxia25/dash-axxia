-- Tabela para leads atendidos (baseada no JSON de conversação)
CREATE TABLE leads_atendidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255),
    telefone VARCHAR(20),
    agente VARCHAR(50),
    origem VARCHAR(50),
    data_hora TIMESTAMP WITH TIME ZONE,
    resumo_conversa TEXT,
    status VARCHAR(50),
    frustration DECIMAL(3,2),
    unread_messages_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para imóveis consultados
CREATE TABLE imoveis_consultados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(255),
    agent_id VARCHAR(50),
    data_hora TIMESTAMP WITH TIME ZONE,
    nome VARCHAR(255),
    telefone VARCHAR(20),
    codigo_imovel VARCHAR(50),
    valor_imovel VARCHAR(50),
    bairro TEXT,
    tipo_negocio VARCHAR(50),
    origem VARCHAR(50),
    tipo_imovel VARCHAR(50),
    resumo_conversa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para visitas agendadas (baseada no CSV atual)
CREATE TABLE visitas_agendadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(255),
    agent_id VARCHAR(50),
    data_hora TIMESTAMP WITH TIME ZONE,
    nome VARCHAR(255),
    telefone VARCHAR(20),
    bitrix_lead INTEGER DEFAULT 0,
    codigo_imovel VARCHAR(50),
    valor_imovel VARCHAR(50),
    bairro TEXT,
    tipo_negocio VARCHAR(50),
    agendou_visita INTEGER DEFAULT 1, -- sempre 1 para esta tabela
    resumo_conversa TEXT,
    origem VARCHAR(50),
    tipo_imovel VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_leads_atendidos_conversation_id ON leads_atendidos(conversation_id);
CREATE INDEX idx_leads_atendidos_data_hora ON leads_atendidos(data_hora);
CREATE INDEX idx_leads_atendidos_agente ON leads_atendidos(agente);

CREATE INDEX idx_imoveis_consultados_conversation_id ON imoveis_consultados(conversation_id);
CREATE INDEX idx_imoveis_consultados_data_hora ON imoveis_consultados(data_hora);
CREATE INDEX idx_imoveis_consultados_agent_id ON imoveis_consultados(agent_id);

CREATE INDEX idx_visitas_agendadas_conversation_id ON visitas_agendadas(conversation_id);
CREATE INDEX idx_visitas_agendadas_data_hora ON visitas_agendadas(data_hora);
CREATE INDEX idx_visitas_agendadas_agent_id ON visitas_agendadas(agent_id);

-- RLS (Row Level Security) - permitir acesso público para leitura
ALTER TABLE leads_atendidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis_consultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas_agendadas ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura pública
CREATE POLICY "Permitir leitura pública leads_atendidos" ON leads_atendidos FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública imoveis_consultados" ON imoveis_consultados FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública visitas_agendadas" ON visitas_agendadas FOR SELECT USING (true);

-- Políticas para permitir inserção/atualização (opcional, caso queira adicionar dados via API)
CREATE POLICY "Permitir inserção leads_atendidos" ON leads_atendidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção imoveis_consultados" ON imoveis_consultados FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção visitas_agendadas" ON visitas_agendadas FOR INSERT WITH CHECK (true);