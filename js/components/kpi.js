/**
 * KPI Component
 * Gerencia a atualização dos cards de KPI (Key Performance Indicators)
 */

const KPIComponent = {
    /**
     * Atualiza todos os KPI cards do dashboard
     * @param {Object} data - Dados filtrados para exibição
     */
    update(data) {
        console.log('KPI: Atualizando cards...', {
            leads: data.totalLeads,
            bitrix: data.bitrixRegistered,
            visitas: data.visitsScheduled,
            valorMedio: data.avgPropertyValue
        });

        try {
            this.updateTotalLeads(data.totalLeads || 0);
            this.updateBitrix(data.bitrixRegistered || 0, data.totalLeads || 0);
            this.updateVisits(data.visitsScheduled || 0, data.totalLeads || 0);
            this.updateAvgValue(data.avgPropertyValue || 0);

            console.log('KPI: Cards atualizados com sucesso');
        } catch (error) {
            console.error('KPI: Erro ao atualizar cards:', error);
            throw error;
        }
    },

    /**
     * Atualiza o card de Total de Leads
     */
    updateTotalLeads(count) {
        const element = document.getElementById('total-leads');
        if (element) {
            element.textContent = count;
        }
    },

    /**
     * Atualiza o card de BITRIX
     */
    updateBitrix(count, total) {
        const countElement = document.getElementById('bitrix-count');
        const percentElement = document.getElementById('bitrix-percent');

        if (countElement) {
            countElement.textContent = count;
        }

        if (percentElement) {
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            percentElement.textContent = percent;
        }
    },

    /**
     * Atualiza o card de Visitas Agendadas
     */
    updateVisits(count, total) {
        const countElement = document.getElementById('visits-count');
        const percentElement = document.getElementById('visits-percent');

        if (countElement) {
            countElement.textContent = count;
        }

        if (percentElement) {
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            percentElement.textContent = percent;
        }
    },

    /**
     * Atualiza o card de Valor Médio
     */
    updateAvgValue(value) {
        const element = document.getElementById('avg-value');
        if (element) {
            const formatted = 'R$ ' + value.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            element.textContent = formatted;
        }
    }
};
