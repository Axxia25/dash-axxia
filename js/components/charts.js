/**
 * Charts Component
 * Gerencia todos os gráficos usando Chart.js
 */

const ChartsComponent = {
    // Instâncias dos gráficos
    hourlyChartInstance: null,
    originChartInstance: null,

    /**
     * Atualiza todos os gráficos
     * @param {Object} data - Dados filtrados para exibição
     */
    update(data) {
        console.log('Charts: Atualizando gráficos...');

        try {
            this.updateHourlyChart(data.byHour || []);
            this.updateOriginChart(data.byOrigin || {});
            console.log('Charts: Gráficos atualizados');
        } catch (error) {
            console.error('Charts: Erro ao atualizar gráficos:', error);
            throw error;
        }
    },

    /**
     * Atualiza o gráfico de leads por horário
     * @param {Array} byHour - Array com contagem de leads por hora (0-23)
     */
    updateHourlyChart(byHour) {
        const canvas = document.getElementById('hourlyChart');
        if (!canvas) {
            console.warn('Charts: Canvas hourlyChart não encontrado');
            return;
        }

        const ctx = canvas.getContext('2d');

        // Destruir instância anterior se existir
        if (this.hourlyChartInstance) {
            this.hourlyChartInstance.destroy();
        }

        // Garantir que temos 24 horas
        const hourData = Array(24).fill(0);
        byHour.forEach((count, index) => {
            if (index < 24) hourData[index] = count || 0;
        });

        this.hourlyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}h`),
                datasets: [{
                    label: 'Leads',
                    data: hourData,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderRadius: 4,
                    maxBarThickness: 40
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} lead${context.parsed.y !== 1 ? 's' : ''}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                if (Number.isInteger(value)) {
                                    return value;
                                }
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 10
                            },
                            maxRotation: 45,
                            minRotation: 0,
                            autoSkip: true,
                            autoSkipPadding: 10
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        console.log('Charts: Gráfico de horário atualizado');
    },

    /**
     * Atualiza o gráfico de origem dos leads
     * @param {Object} byOrigin - Objeto com contagem por origem
     */
    updateOriginChart(byOrigin) {
        const canvas = document.getElementById('originChart');
        if (!canvas) {
            console.warn('Charts: Canvas originChart não encontrado');
            return;
        }

        const ctx = canvas.getContext('2d');

        // Destruir instância anterior se existir
        if (this.originChartInstance) {
            this.originChartInstance.destroy();
        }

        const origins = Object.keys(byOrigin);
        const counts = Object.values(byOrigin);

        // Se não há dados, mostrar mensagem
        if (origins.length === 0) {
            console.warn('Charts: Sem dados de origem para exibir');
            // Criar gráfico vazio com mensagem
            this.originChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Sem dados'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['rgba(200, 200, 200, 0.3)'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
            return;
        }

        // Cores para diferentes origens
        const colors = [
            'rgba(59, 130, 246, 0.8)',   // Azul
            'rgba(16, 185, 129, 0.8)',   // Verde
            'rgba(139, 92, 246, 0.8)',   // Roxo
            'rgba(251, 191, 36, 0.8)',   // Amarelo
            'rgba(239, 68, 68, 0.8)',    // Vermelho
            'rgba(236, 72, 153, 0.8)',   // Rosa
            'rgba(14, 165, 233, 0.8)',   // Azul claro
            'rgba(234, 179, 8, 0.8)'     // Dourado
        ];

        this.originChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: origins,
                datasets: [{
                    data: counts,
                    backgroundColor: colors.slice(0, origins.length),
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });

        console.log('Charts: Gráfico de origem atualizado');
    }
};
