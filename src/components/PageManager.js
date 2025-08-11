import Config from '../core/Config.js';
import DOMUtils from '../utils/DOMUtils.js';
import FilterComponent from '../components/FilterComponent.js';
import CacheService from '../services/CacheService.js';

/**
 * Gerenciador de páginas de ranking
 */
class PageManager {
    constructor() {
        this.rankings = new Map();
        this.activeRanking = null;
        this.preloadedData = new Map();
    }

    /**
     * Registra um ranking
     * @param {IRanking} ranking - Instância do ranking
     */
    registerRanking(ranking) {
        const name = ranking.getName();
        this.rankings.set(ranking.getMenuHref(), ranking);
        console.log(`Ranking registrado no PageManager: ${name}`);
    }

    /**
     * Inicia o pré-carregamento de dados
     */
    startPreloading() {
        setTimeout(() => {
            if (window.location.hostname === Config.SITE.HOSTNAME) {
                console.log('Iniciando pré-carregamento dos dados...');
                this.preloadAllRankings();
            }
        }, Config.TIMING.PRELOAD_DELAY);
    }


    /**
     * Pré-carrega dados de todos os rankings
     */
    async preloadAllRankings() {
        const preloadPromises = [];
        
        this.rankings.forEach((ranking, href) => {
            const cacheKey = CacheService.generateKey(ranking.getName());
            
            if (!CacheService.has(cacheKey)) {
                preloadPromises.push(
                    ranking.collectData()
                        .then(data => {
                            this.preloadedData.set(href, data);
                            CacheService.set(cacheKey, data);
                            console.log(`Dados pré-carregados: ${ranking.getName()}`);
                        })
                        .catch(error => {
                            console.error(`Erro no pré-carregamento de ${ranking.getName()}:`, error);
                        })
                );
            }
        });

        await Promise.allSettled(preloadPromises);
        console.log('Pré-carregamento concluído');
    }

    /**
     * Verifica e substitui conteúdo da página
     */
    checkAndReplaceContent() {
        // Executa imediatamente
        this.replaceContent();
        
        // Executa rapidamente no início para interceptar erros
        const fastInterval = setInterval(() => {
            this.replaceContent();
        }, Config.TIMING.FAST_REPLACE_INTERVAL);
        
        setTimeout(() => {
            clearInterval(fastInterval);
        }, Config.TIMING.FAST_REPLACE_DURATION);
        
        // Continua com verificação normal
        setInterval(() => {
            this.replaceContent();
        }, Config.TIMING.NORMAL_REPLACE_INTERVAL);
    }

    /**
     * Substitui conteúdo da página se necessário
     */
    replaceContent() {
        const currentUrl = window.location.href;
        const ranking = this.findRankingByUrl(currentUrl);
        
        if (ranking) {
            this.renderRankingPage(ranking);
        }
    }

    /**
     * Encontra ranking pela URL atual
     * @param {string} url - URL atual
     * @returns {IRanking|null}
     */
    findRankingByUrl(url) {
        for (const [href, ranking] of this.rankings) {
            if (url.includes(href)) {
                return ranking;
            }
        }
        return null;
    }

    /**
     * Renderiza página de ranking
     * @param {IRanking} ranking - Ranking a ser renderizado
     */
    async renderRankingPage(ranking) {
        // Esconde elementos de erro
        DOMUtils.hideErrorElements();
        
        // Corrige título da página
        this.updatePageTitle(ranking);
        
        // Verifica se já foi renderizado
        if (document.getElementById('rankingContainer')) {
            return;
        }

        // Cria container principal
        const container = this.createRankingContainer();
        if (!container) return;

        // Verifica dados pré-carregados
        const href = ranking.getMenuHref();
        let data = this.preloadedData.get(href);
        
        if (!data) {
            // Verifica cache
            const cacheKey = CacheService.generateKey(ranking.getName());
            data = CacheService.get(cacheKey);
        }

        if (data) {
            console.log('Usando dados em cache/pré-carregados');
            this.renderRankingData(ranking, data, container);
        } else {
            container.innerHTML = '<p>Carregando dados históricos...</p>';
            try {
                data = await ranking.collectData();
                CacheService.set(CacheService.generateKey(ranking.getName()), data);
                this.renderRankingData(ranking, data, container);
            } catch (error) {
                container.innerHTML = '<p style="color: red;">Erro ao carregar dados</p>';
                console.error('Erro ao carregar dados:', error);
            }
        }
    }

    /**
     * Atualiza título da página
     * @param {IRanking} ranking - Ranking atual
     */
    updatePageTitle(ranking) {
        const titleElement = DOMUtils.findElementByXPath(Config.SELECTORS.CONTENT_TITLE);
        if (titleElement) {
            titleElement.textContent = ranking.getName();
            titleElement.style.display = 'block';
        }
    }

    /**
     * Cria container principal do ranking
     * @returns {Element|null}
     */
    createRankingContainer() {
        let contentElement = DOMUtils.findElementByXPath(Config.SELECTORS.CONTENT_PARAGRAPH);
        
        if (!contentElement) {
            contentElement = document.querySelector('#conteudo p, #conteudo div');
        }

        if (contentElement) {
            const container = DOMUtils.createElement('div', {
                id: 'rankingContainer'
            });

            const conteudoDiv = document.getElementById('conteudo');
            if (conteudoDiv) {
                DOMUtils.clearContainer('conteudo', 'rankingContainer');
                conteudoDiv.appendChild(container);
            } else {
                contentElement.parentNode.replaceChild(container, contentElement);
            }

            return container;
        }

        return null;
    }

    /**
     * Renderiza dados do ranking
     * @param {IRanking} ranking - Ranking
     * @param {Object} data - Dados coletados
     * @param {Element} container - Container para renderização
     */
    renderRankingData(ranking, data, container) {
        const { guildVictories, dataByYear } = data;
        
        // Cria filtro se suportado
        let filterComponent = null;
        if (ranking.supportsYearFilter() && dataByYear) {
            filterComponent = new FilterComponent(ranking, dataByYear, guildVictories);
        }

        // Renderiza conteúdo
        this.updateRankingDisplay(ranking, guildVictories, filterComponent, container);

        // Adiciona event listeners do filtro
        if (filterComponent) {
            filterComponent.bindEvents((newData, allYearData, selectedYear) => {
                filterComponent.setSelectedYear(selectedYear);
                this.updateRankingDisplay(ranking, newData, filterComponent, container);
            });
        }
    }

    /**
     * Atualiza display do ranking
     * @param {IRanking} ranking - Ranking
     * @param {Object} data - Dados a exibir
     * @param {FilterComponent} filterComponent - Componente de filtro
     * @param {Element} container - Container
     */
    updateRankingDisplay(ranking, data, filterComponent, container) {
        let html = '';
        
        // Adiciona filtro se disponível
        if (filterComponent) {
            html += filterComponent.createHTML();
        }
        
        // Adiciona tabela
        html += ranking.createTable(data);
        
        container.innerHTML = html;
        
        // Re-bind eventos do filtro se necessário
        if (filterComponent) {
            filterComponent.bindEvents((newData, allYearData, selectedYear) => {
                filterComponent.setSelectedYear(selectedYear);
                this.updateRankingDisplay(ranking, newData, filterComponent, container);
            });
        }
    }
}

// Singleton
const pageManager = new PageManager();
export default pageManager;
