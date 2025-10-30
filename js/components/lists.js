/**
 * Lists Component
 * Gerencia todas as listas dinâmicas do dashboard
 */

const ListsComponent = {
    /**
     * Atualiza todas as listas
     * @param {Object} data - Dados filtrados para exibição
     */
    update(data) {
        console.log('Lists: Atualizando listas...');

        try {
            this.updateBusinessTypeList(data.byBusinessType || {}, data.totalLeads || 0);
            this.updateRecentLeadsList(data.recentLeads || []);
            this.updateTopPerformersList(data.topPerformers || []);
            console.log('Lists: Listas atualizadas');
        } catch (error) {
            console.error('Lists: Erro ao atualizar listas:', error);
            throw error;
        }
    },

    /**
     * Atualiza a lista de tipos de negócio
     */
    updateBusinessTypeList(byBusinessType, totalLeads) {
        const container = document.getElementById('businessTypeList');
        if (!container) {
            console.warn('Lists: Container businessTypeList não encontrado');
            return;
        }

        const entries = Object.entries(byBusinessType);

        if (entries.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">Nenhum dado disponível</p>';
            return;
        }

        const html = entries.map(([type, count]) => {
            const percent = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
            return `
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium">${type}</span>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded">${count}</span>
                        <div class="w-16 bg-gray-200 rounded-full h-2">
                            <div class="bg-emerald-500 h-2 rounded-full" style="width:${percent}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        console.log('Lists: Business types atualizado');
    },

    /**
     * Atualiza a lista de leads recentes
     */
    updateRecentLeadsList(recentLeads) {
        const container = document.getElementById('recentLeadsList');
        if (!container) {
            console.warn('Lists: Container recentLeadsList não encontrado');
            return;
        }

        if (!recentLeads || recentLeads.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500 text-center py-8">Nenhum lead encontrado</p>';
            return;
        }

        // Show more leads with scroll (up to 20)
        const html = recentLeads.slice(0, 20).map(lead => {
            const badges = [];

            if (lead.bitrix) {
                badges.push('<span class="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded">BITRIX</span>');
            }

            if (lead.visitaAgendada) {
                badges.push('<span class="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded">Visita Agendada</span>');
            }

            return `
                <div class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="font-semibold text-gray-900">${lead.nome || 'Sem nome'}</p>
                            <p class="text-xs text-gray-500">${lead.telefone || ''}</p>
                        </div>
                        <span class="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">${lead.origem || 'Sem origem'}</span>
                    </div>
                    <div class="text-xs text-gray-600 mb-2">
                        <p>Agente: ${lead.agente || 'Desconhecido'}</p>
                        ${lead.imovel ? `<p>Imóvel: ${lead.imovel}</p>` : ''}
                        ${lead.valor ? `<p class="font-medium text-emerald-600">${lead.valor}</p>` : ''}
                    </div>
                    ${badges.length > 0 ? `<div class="flex gap-2 flex-wrap">${badges.join('')}</div>` : ''}
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        console.log('Lists: Recent leads atualizado');
    },

    /**
     * Atualiza a lista de top performers
     */
    updateTopPerformersList(topPerformers) {
        const container = document.getElementById('topPerformersList');
        if (!container) {
            console.warn('Lists: Container topPerformersList não encontrado');
            return;
        }

        console.log('Lists: Top performers recebidos:', topPerformers);

        if (!topPerformers || topPerformers.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500 text-center py-8">Nenhum dado disponível</p>';
            return;
        }

        const colors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

        const html = topPerformers.map((agent, idx) => {
            return `
                <div class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex items-center gap-3 mb-3">
                        <svg class="w-6 h-6 ${colors[idx] || 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <div class="flex-1">
                            <p class="font-semibold text-gray-900">${agent.nome || 'Desconhecido'}</p>
                            <p class="text-xs text-gray-500">${agent.leads || 0} leads • ${agent.conversionRate || 0}% conversão</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="flex items-center gap-1">
                            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span>${agent.bitrix || 0} BITRIX</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <span>${agent.visitas || 0} Visitas</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        console.log('Lists: Top performers atualizado');
    }
};
