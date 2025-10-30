/**
 * Data Service
 * Gerencia o carregamento e transformação de dados do Supabase
 */

const DataService = {
    /**
     * Carrega dados do Supabase
     * @returns {Object|null} Dados transformados ou null se falhar
     */
    async loadFromSupabase() {
        try {
            console.log('DataService: Tentando carregar dados do Supabase...');

            // Check if Supabase client is available
            if (typeof supabase === 'undefined' || !supabase) {
                console.warn('DataService: Cliente Supabase não disponível');
                return null;
            }

            console.log('DataService: Cliente Supabase encontrado, buscando leads...');

            // Fetch leads from dash_limoveis table
            const { data: leads, error } = await supabase
                .from('dash_limoveis')
                .select('*')
                .order('data_hora', { ascending: false });

            if (error) {
                console.error('DataService: Erro ao buscar dados:', error);
                console.error('DataService: Detalhes do erro:', JSON.stringify(error, null, 2));
                return null;
            }

            console.log(`DataService: ${leads?.length || 0} leads encontrados`);

            if (!leads || leads.length === 0) {
                console.warn('DataService: Nenhum lead encontrado');
                return null;
            }

            // Transform Supabase data
            const transformed = this.transformSupabaseData(leads);
            console.log('DataService: Dados transformados com sucesso');
            return transformed;
        } catch (error) {
            console.error('DataService: Erro ao conectar com Supabase:', error);
            console.error('DataService: Stack trace:', error.stack);
            return null;
        }
    },

    /**
     * Carrega dados do arquivo JSON local
     * @returns {Object} Dados do arquivo JSON
     */
    async loadFromJSON() {
        console.log('DataService: Carregando dados do arquivo JSON local...');
        const response = await fetch('./data/data.json');
        const data = await response.json();
        console.log('DataService: Dados JSON carregados');
        return data;
    },

    /**
     * Transforma dados do Supabase para o formato do dashboard
     * @param {Array} leads - Array de leads do Supabase
     * @returns {Object} Dados transformados
     */
    transformSupabaseData(leads) {
        const transformed = {
            timestamp: new Date().toISOString(),
            lastUpdate: new Date().toLocaleString('pt-BR'),
            totalRecords: leads.length,
            totalLeads: leads.length,
            bitrixRegistered: 0,
            visitsScheduled: 0,
            totalPropertyValue: 0,
            avgPropertyValue: 0,
            byAgent: {},
            byDate: {},
            byHour: Array(24).fill(0),
            byDayOfWeek: {
                'Domingo': 0,
                'Segunda': 0,
                'Terça': 0,
                'Quarta': 0,
                'Quinta': 0,
                'Sexta': 0,
                'Sábado': 0
            },
            byOrigin: {},
            byBusinessType: {},
            byNeighborhood: {},
            byPropertyType: {},
            recentLeads: [],
            topPerformers: [],
            conversionRate: {
                bitrix: '0',
                visits: '0'
            },
            byDateArray: []
        };

        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        // Process each lead
        leads.forEach(lead => {
            // Parse date (using data_hora instead of created_at)
            const createdAt = new Date(lead.data_hora);
            const dateStr = createdAt.toLocaleDateString('pt-BR');
            const timeStr = createdAt.toLocaleTimeString('pt-BR');
            const dataHora = `${dateStr}, ${timeStr}`;

            // Count by hour
            const hour = createdAt.getHours();
            transformed.byHour[hour]++;

            // Count by day of week
            const dayName = dayNames[createdAt.getDay()];
            transformed.byDayOfWeek[dayName]++;

            // Count by date
            const dateKey = createdAt.toISOString().split('T')[0];
            transformed.byDate[dateKey] = (transformed.byDate[dateKey] || 0) + 1;

            // Normalize and count by origin
            if (lead.origem) {
                let normalizedOrigin = lead.origem;
                // Normalize SITE/Website/website to "Site"
                if (normalizedOrigin.toLowerCase() === 'site' || normalizedOrigin.toLowerCase() === 'website') {
                    normalizedOrigin = 'Site';
                }
                // Normalize Whatsapp/zapi/ZAPI to "Whatsapp"
                if (normalizedOrigin.toLowerCase() === 'whatsapp' || normalizedOrigin.toLowerCase() === 'zapi') {
                    normalizedOrigin = 'Whatsapp';
                }
                transformed.byOrigin[normalizedOrigin] = (transformed.byOrigin[normalizedOrigin] || 0) + 1;
            }

            // Count by business type
            if (lead.tipo_negocio) {
                transformed.byBusinessType[lead.tipo_negocio] = (transformed.byBusinessType[lead.tipo_negocio] || 0) + 1;
            }

            // Count by neighborhood
            if (lead.bairro) {
                transformed.byNeighborhood[lead.bairro] = (transformed.byNeighborhood[lead.bairro] || 0) + 1;
            }

            // Count by property type
            if (lead.tipo_imovel) {
                transformed.byPropertyType[lead.tipo_imovel] = (transformed.byPropertyType[lead.tipo_imovel] || 0) + 1;
            }

            // Count BITRIX registrations (bitrix_lead is INTEGER: 0 or 1)
            if (lead.bitrix_lead === 1) {
                transformed.bitrixRegistered++;
            }

            // Count scheduled visits (agendou_visita is INTEGER: 0 or 1)
            if (lead.agendou_visita === 1) {
                transformed.visitsScheduled++;
            }

            // Parse property value from string format "R$ 290.000"
            let propertyValue = 0;
            if (lead.valor_imovel) {
                const cleanValue = lead.valor_imovel
                    .replace('R$', '')
                    .replace(/\./g, '')
                    .replace(',', '.')
                    .trim();
                propertyValue = parseFloat(cleanValue) || 0;
            }
            transformed.totalPropertyValue += propertyValue;

            // Normalize agent name (uppercase)
            const agentName = (lead.agente || 'Desconhecido').toUpperCase();
            if (!transformed.byAgent[agentName]) {
                transformed.byAgent[agentName] = {
                    nome: agentName,
                    leads: 0,
                    bitrix: 0,
                    visitas: 0,
                    valorTotal: 0
                };
            }
            transformed.byAgent[agentName].leads++;
            if (lead.bitrix_lead === 1) transformed.byAgent[agentName].bitrix++;
            if (lead.agendou_visita === 1) transformed.byAgent[agentName].visitas++;
            transformed.byAgent[agentName].valorTotal += propertyValue;

            // Add to recent leads (with normalized origin)
            let normalizedOriginDisplay = lead.origem || '';
            if (normalizedOriginDisplay.toLowerCase() === 'site' || normalizedOriginDisplay.toLowerCase() === 'website') {
                normalizedOriginDisplay = 'Site';
            }
            if (normalizedOriginDisplay.toLowerCase() === 'whatsapp' || normalizedOriginDisplay.toLowerCase() === 'zapi') {
                normalizedOriginDisplay = 'Whatsapp';
            }

            transformed.recentLeads.push({
                nome: lead.nome || '',
                telefone: lead.telefone || '',
                agente: agentName,
                origem: normalizedOriginDisplay,
                dataHora: dataHora,
                imovel: lead.codigo_imovel || '',
                valor: propertyValue > 0 ? `R$ ${propertyValue.toLocaleString('pt-BR')}` : '',
                bairro: lead.bairro || '',
                tipoNegocio: lead.tipo_negocio || '',
                bitrix: lead.bitrix_lead === 1,
                visitaAgendada: lead.agendou_visita === 1
            });
        });

        // Calculate average property value
        transformed.avgPropertyValue = transformed.totalLeads > 0
            ? transformed.totalPropertyValue / transformed.totalLeads
            : 0;

        // Calculate conversion rates
        transformed.conversionRate.bitrix = transformed.totalLeads > 0
            ? ((transformed.bitrixRegistered / transformed.totalLeads) * 100).toFixed(1)
            : '0';
        transformed.conversionRate.visits = transformed.totalLeads > 0
            ? ((transformed.visitsScheduled / transformed.totalLeads) * 100).toFixed(1)
            : '0';

        // Build top performers
        transformed.topPerformers = Object.values(transformed.byAgent).map(agent => ({
            nome: agent.nome,
            leads: agent.leads,
            bitrix: agent.bitrix,
            visitas: agent.visitas,
            valorTotal: agent.valorTotal,
            conversionRate: agent.leads > 0
                ? ((agent.bitrix / agent.leads) * 100).toFixed(1)
                : '0'
        })).sort((a, b) => b.leads - a.leads);

        // Build date array
        transformed.byDateArray = Object.entries(transformed.byDate).map(([date, count]) => ({
            date: date,
            count: count,
            dateFormatted: new Date(date).toLocaleDateString('pt-BR')
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        return transformed;
    }
};
