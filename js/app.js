let rawData = {};
let filteredData = {};

// Initialize the application
async function initApp() {
    try {
        // Try to load data from Supabase first
        const supabaseData = await DataService.loadFromSupabase();

        if (supabaseData) {
            rawData = supabaseData;
            console.log('App: Dados carregados do Supabase');
        } else {
            // Fallback to local JSON if Supabase fails
            console.log('App: Carregando dados locais como fallback...');
            rawData = await DataService.loadFromJSON();
        }

        filteredData = {...rawData};

        // Set current date
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR');

        // Apply default filter - use "30days" to show all data
        filterData('30days');
    } catch (error) {
        console.error('App: Erro ao carregar dados:', error);
        alert('Erro ao carregar os dados do dashboard. Por favor, recarregue a página.');
    }
}

// Note: Data loading functions moved to DataService component

// Filter data by time period
function filterData(period) {
    // Update button states
    ['today', 'week', '30days'].forEach(p => {
        const btn = document.getElementById(`btn-${p}`);
        btn.className = p === period
            ? 'px-4 py-2 rounded-lg font-medium transition-all bg-emerald-500 text-white'
            : 'px-4 py-2 rounded-lg font-medium transition-all border border-gray-300 text-gray-700 hover:bg-gray-50';
    });

    // Calculate start date based on period
    const now = new Date();
    let startDate;

    switch(period) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
            break;
        case '30days':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            break;
    }

    // Filter recent leads based on date
    filteredData.recentLeads = rawData.recentLeads.filter(lead => {
        try {
            // Handle both date formats: "DD/MM/YYYY, HH:MM:SS" and "DD/MM/YYYY HH:MM:SS"
            const dateTimeStr = lead.dataHora.replace(',', '').trim();
            const [datePart] = dateTimeStr.split(' ');

            if (!datePart) return false;

            const parts = datePart.split('/');
            if (parts.length !== 3) return false;

            const [day, month, year] = parts;
            const leadDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);

            // Check if date is valid
            if (isNaN(leadDate.getTime())) {
                console.warn('Data inválida para lead:', lead.nome, lead.dataHora);
                return false;
            }

            return leadDate >= startDate;
        } catch (error) {
            console.error('Erro ao filtrar lead por data:', lead, error);
            return false;
        }
    });

    console.log(`Filtragem por período "${period}":`, {
        totalRaw: rawData.recentLeads?.length || 0,
        filtrados: filteredData.recentLeads.length,
        startDate: startDate.toLocaleDateString('pt-BR')
    });

    // Recalculate metrics
    filteredData.totalLeads = filteredData.recentLeads.length;
    filteredData.bitrixRegistered = filteredData.recentLeads.filter(l => l.bitrix).length;
    filteredData.visitsScheduled = filteredData.recentLeads.filter(l => l.visitaAgendada).length;

    // Calculate average property value
    const totalValue = filteredData.recentLeads.reduce((sum, lead) => {
        const value = parseFloat(lead.valor.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
        return sum + value;
    }, 0);
    filteredData.avgPropertyValue = filteredData.totalLeads > 0 ? totalValue / filteredData.totalLeads : 0;

    // Recalculate hourly distribution
    filteredData.byHour = Array(24).fill(0);
    filteredData.recentLeads.forEach(lead => {
        const [, timePart] = lead.dataHora.split(' ');
        if (timePart) {
            const hour = parseInt(timePart.split(':')[0]);
            filteredData.byHour[hour]++;
        }
    });

    // Recalculate origin distribution
    filteredData.byOrigin = {};
    filteredData.recentLeads.forEach(lead => {
        filteredData.byOrigin[lead.origem] = (filteredData.byOrigin[lead.origem] || 0) + 1;
    });

    // Recalculate business type distribution
    filteredData.byBusinessType = {};
    filteredData.recentLeads.forEach(lead => {
        if (lead.tipoNegocio) {
            filteredData.byBusinessType[lead.tipoNegocio] = (filteredData.byBusinessType[lead.tipoNegocio] || 0) + 1;
        }
    });

    // Recalculate agent statistics
    filteredData.byAgent = {};
    filteredData.recentLeads.forEach(lead => {
        const agentName = lead.agente || 'Desconhecido';
        if (!filteredData.byAgent[agentName]) {
            filteredData.byAgent[agentName] = {
                nome: agentName,
                leads: 0,
                bitrix: 0,
                visitas: 0,
                valorTotal: 0
            };
        }
        filteredData.byAgent[agentName].leads++;
        if (lead.bitrix) filteredData.byAgent[agentName].bitrix++;
        if (lead.visitaAgendada) filteredData.byAgent[agentName].visitas++;

        // Parse valor from string format "R$ 1.234.567"
        const value = parseFloat(lead.valor.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
        filteredData.byAgent[agentName].valorTotal += value;
    });

    // Recalculate top performers
    filteredData.topPerformers = Object.values(filteredData.byAgent).map(agent => ({
        nome: agent.nome,
        leads: agent.leads,
        bitrix: agent.bitrix,
        visitas: agent.visitas,
        valorTotal: agent.valorTotal,
        conversionRate: agent.leads > 0
            ? ((agent.bitrix / agent.leads) * 100).toFixed(1)
            : '0'
    })).sort((a, b) => b.leads - a.leads);

    // Update dashboard
    updateDashboard();
}

// Update all dashboard elements
function updateDashboard() {
    console.log('=== Atualizando Dashboard ===');
    console.log('Dados filtrados:', filteredData);
    try {
        // Use components to update dashboard
        KPIComponent.update(filteredData);
        ChartsComponent.update(filteredData);
        ListsComponent.update(filteredData);
        console.log('=== Dashboard atualizado com sucesso ===');
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

// Note: Update functions moved to respective components (KPI, Charts, Lists)

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
