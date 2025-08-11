/**
 * MUCABRASIL Turbo - Content Script
 * Versão 2.0 - Arquitetura Modular e Escalável
 * Compatible com Firefox e Chrome
 */

// Função principal de inicialização
async function initMucaBrasilTurbo() {
    // Carrega diretamente a versão integrada para compatibilidade total
    console.log('Carregando MUCABRASIL Turbo versão integrada...');
    loadIntegratedVersion();
}

/**
 * Versão integrada que funciona sem ES6 modules
 */
function loadIntegratedVersion() {
    console.log('Executando MUCABRASIL Turbo versão integrada...');
    
    // Configurações
    const CONFIG = {
        SITE: {
            HOSTNAME: 'www.mucabrasil.com.br',
            BASE_URL: 'https://www.mucabrasil.com.br'
        },
        MENU: {
            CONTAINER_SELECTOR: '#menu-vertical',
            SECTION_TITLE: 'MUCABRASIL Turbo',
            SECTION_ID: 'mucabrasil-turbo-section'
        },
        TIMING: {
            MENU_CHECK_INTERVAL: 1000,
            PRELOAD_DELAY: 3000,
            FAST_REPLACE_INTERVAL: 100,
            NORMAL_REPLACE_INTERVAL: 1000,
            FAST_REPLACE_DURATION: 2000
        },
        DEFAULT_YEARS: {
            START: 2014,
            get CURRENT() { return new Date().getFullYear(); }
        }
    };

    // Utilitários HTTP
    const HttpUtils = {
        async fetchParallel(urls) {
            console.log(`Iniciando ${urls.length} requisições paralelas...`);
            
            const responses = await Promise.allSettled(
                urls.map(url => fetch(url).then(response => response.text()))
            );

            return responses;
        },

        parseHTML(html) {
            const parser = new DOMParser();
            return parser.parseFromString(html, 'text/html');
        }
    };

    // Utilitários DOM
    const DOMUtils = {
        evaluateXPath(xpath, doc = document, resultType = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {
            return doc.evaluate(xpath, doc, null, resultType, null);
        },

        findElementByXPath(xpath, doc = document) {
            const result = this.evaluateXPath(xpath, doc, XPathResult.FIRST_ORDERED_NODE_TYPE);
            return result.singleNodeValue;
        },

        hideErrorElements(errorTexts = [
            'Página não encontrada',
            'Desculpe, mas a página',
            'Em caso de dúvida'
        ]) {
            const errorElements = document.querySelectorAll('#conteudo h1, #conteudo p');
            errorElements.forEach(element => {
                if (errorTexts.some(text => element.textContent.includes(text))) {
                    element.style.display = 'none';
                }
            });
        },

        createElement(tag, attributes = {}, parent = null, reference = null) {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'innerHTML') {
                    element.innerHTML = value;
                } else {
                    element.setAttribute(key, value);
                }
            });

            if (parent) {
                if (reference) {
                    parent.insertBefore(element, reference);
                } else {
                    parent.appendChild(element);
                }
            }

            return element;
        },

        clearContainer(containerId, excludeId = null) {
            const container = document.getElementById(containerId);
            if (container) {
                const childElements = container.querySelectorAll('p, div');
                childElements.forEach(child => {
                    if (!excludeId || (!child.id || child.id !== excludeId)) {
                        child.remove();
                    }
                });
            }
        }
    };

    // Cache Service
    class CacheService {
        constructor() {
            this.cache = new Map();
            this.ttl = new Map();
            this.defaultTTL = 30 * 60 * 1000; // 30 minutos
        }

        set(key, data, ttl = this.defaultTTL) {
            this.cache.set(key, data);
            this.ttl.set(key, Date.now() + ttl);
            console.log(`Cache armazenado: ${key}`);
        }

        get(key) {
            if (!this.cache.has(key)) return null;

            const ttl = this.ttl.get(key);
            if (Date.now() > ttl) {
                this.delete(key);
                return null;
            }

            return this.cache.get(key);
        }

        delete(key) {
            this.cache.delete(key);
            this.ttl.delete(key);
        }

        has(key) {
            if (!this.cache.has(key)) return false;
            
            const ttl = this.ttl.get(key);
            if (Date.now() > ttl) {
                this.delete(key);
                return false;
            }
            return true;
        }

        static generateKey(rankingName, year = null) {
            return year ? `${rankingName}_${year}` : `${rankingName}_all`;
        }
    }

    const cacheService = new CacheService();

    // Castle Siege Ranking
    class CastleSiegeRanking {
        getName() {
            return 'Castle Siege (Ranking)';
        }

        getBaseUrl() {
            return `${CONFIG.SITE.BASE_URL}/?go=castlesiege`;
        }

        getMenuHref() {
            return '?go=castlesiegeranking';
        }

        getStartYear() {
            return CONFIG.DEFAULT_YEARS.START;
        }

        supportsYearFilter() {
            return true;
        }

        async collectData() {
            const currentYear = CONFIG.DEFAULT_YEARS.CURRENT;
            const startYear = this.getStartYear();
            const guildVictories = {};
            const dataByYear = {};
            
            try {
                const urls = [];
                for (let year = startYear; year <= currentYear; year++) {
                    urls.push(`${this.getBaseUrl()}&y=${year}`);
                }
                
                const responses = await HttpUtils.fetchParallel(urls);
                
                responses.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        const year = startYear + index;
                        const yearData = this.processData(result.value, year);
                        
                        dataByYear[year] = yearData;
                        
                        Object.entries(yearData).forEach(([guild, victories]) => {
                            guildVictories[guild] = (guildVictories[guild] || 0) + victories;
                        });
                    }
                });
                
                return { guildVictories, dataByYear };
                
            } catch (error) {
                console.error('Erro na coleta de dados Castle Siege:', error);
                throw error;
            }
        }

        processData(html, year) {
            const guildVictories = {};
            
            try {
                const doc = HttpUtils.parseHTML(html);
                
                const guildLinks = DOMUtils.evaluateXPath(
                    '//div[@id="conteudo"]//table//td[2]//a',
                    doc
                );
                
                for (let i = 0; i < guildLinks.snapshotLength; i++) {
                    const guildLink = guildLinks.snapshotItem(i);
                    const guildName = guildLink.textContent.trim();
                    
                    if (guildName) {
                        guildVictories[guildName] = (guildVictories[guildName] || 0) + 1;
                    }
                }
                
                console.log(`Ano ${year} processado. Guilds encontradas:`, guildLinks.snapshotLength);
                
            } catch (error) {
                console.error(`Erro ao processar dados do ano ${year}:`, error);
            }
            
            return guildVictories;
        }

        createTable(guildVictories) {
            const sortedGuilds = Object.entries(guildVictories)
                .sort(([,a], [,b]) => b - a)
                .map(([guild, victories], index) => ({
                    position: index + 1,
                    guild: guild,
                    victories: victories
                }));

            if (sortedGuilds.length === 0) {
                return '<p style="color: orange;">Nenhum dado encontrado</p>';
            }

            let tableHTML = `
                <table class="tabela cor auto" id="rankingTableData">
                    <tbody>
                        <tr>
                            <td class="n"><b>Posição</b></td>
                            <td><b>Guild</b></td>
                            <td><b>Vitórias</b></td>
                        </tr>
            `;
            
            sortedGuilds.forEach(({position, guild, victories}) => {
                tableHTML += `
                    <tr>
                        <td align="center"><b>${position}º</b></td>
                        <td><a href="?go=guild&n=${encodeURIComponent(guild)}">${guild}</a></td>
                        <td align="center">${victories}</td>
                    </tr>
                `;
            });
            
            tableHTML += `
                    </tbody>
                </table>
            `;

            return tableHTML;
        }
    }

    // Filter Component
    class FilterComponent {
        constructor(ranking, allYearData, originalData) {
            this.ranking = ranking;
            this.allYearData = allYearData;
            this.originalData = originalData;
            this.selectedYear = 'all';
        }

        createHTML() {
            if (!this.ranking.supportsYearFilter() || !this.allYearData) {
                return '';
            }

            const currentYear = CONFIG.DEFAULT_YEARS.CURRENT;
            const startYear = this.ranking.getStartYear();

            let filterHTML = `
                <tr>
                    <td style="width: 160px">Filtrar por ano:</td>
                    <td style="width: 200px">
                        <select id="yearFilter" name="yearFilter" class="text">
                            <option value="all" ${this.selectedYear === 'all' ? 'selected' : ''}>Todos os anos (${startYear}-${currentYear})</option>
            `;
            for (let year = currentYear; year >= startYear; year--) {
                const isSelected = this.selectedYear == year ? 'selected' : '';
                filterHTML += `<option value="${year}" ${isSelected}>${year}</option>`;
            }
            filterHTML += `
                        </select>
                    </td>
                    <td></td>
                </tr>
                <tr><td colspan="3" style="height: 12px;"></td></tr>
            `;
            return filterHTML;
        }

        bindEvents(onFilterChange) {
            const yearFilter = document.getElementById('yearFilter');
            if (yearFilter) {
                yearFilter.addEventListener('change', (event) => {
                    this.selectedYear = event.target.value;
                    
                    let dataToShow;
                    if (this.selectedYear === 'all') {
                        dataToShow = this.originalData;
                    } else {
                        dataToShow = this.allYearData[this.selectedYear] || {};
                    }

                    onFilterChange(dataToShow, this.allYearData, this.selectedYear);
                });
            }
        }

        setSelectedYear(year) {
            this.selectedYear = year;
        }
    }

    // Menu Manager
    const MenuManager = {
        rankings: new Map(),
        initialized: false,
        sectionCreated: false,

        registerRanking(ranking) {
            const name = ranking.getName();
            this.rankings.set(name, ranking);
            console.log(`Ranking registrado: ${name}`);
        },

        init() {
            if (this.initialized) return;
            this.checkAndAddMenuItems();
            this.initialized = true;
        },

        checkAndAddMenuItems() {
            const intervalId = setInterval(() => {
                if (this.createTurboSection()) {
                    let allAdded = true;
                    
                    this.rankings.forEach((ranking, name) => {
                        if (!this.addMenuItem(ranking)) {
                            allAdded = false;
                        }
                    });

                    if (allAdded && this.rankings.size > 0) {
                        clearInterval(intervalId);
                        console.log('Seção MUCABRASIL Turbo criada e todos os itens foram adicionados');
                    }
                }
            }, CONFIG.TIMING.MENU_CHECK_INTERVAL);
        },

        createTurboSection() {
            if (this.sectionCreated) return true;

            const menuContainer = document.querySelector(CONFIG.MENU.CONTAINER_SELECTOR);
            if (!menuContainer) return false;

            // Verifica se a seção já existe
            if (document.getElementById(CONFIG.MENU.SECTION_ID)) {
                this.sectionCreated = true;
                return true;
            }

            // Cria o título da seção
            const sectionTitle = DOMUtils.createElement('h2', {
                innerHTML: CONFIG.MENU.SECTION_TITLE,
                id: CONFIG.MENU.SECTION_ID + '-title'
            });

            // Cria a lista da seção
            const sectionList = DOMUtils.createElement('ul', {
                id: CONFIG.MENU.SECTION_ID
            });

            // Adiciona a nova seção ao final do menu
            menuContainer.appendChild(sectionTitle);
            menuContainer.appendChild(sectionList);

            this.sectionCreated = true;
            console.log('Seção MUCABRASIL Turbo criada no menu');
            return true;
        },

        addMenuItem(ranking) {
            const turboSection = document.getElementById(CONFIG.MENU.SECTION_ID);
            const menuHref = ranking.getMenuHref();
            
            if (turboSection && !turboSection.querySelector(`a[href="${menuHref}"]`)) {
                const menuItem = DOMUtils.createElement('li', {
                    innerHTML: `<a href="${menuHref}"><span>»&nbsp;</span>${ranking.getName()}</a>`
                });
                
                turboSection.appendChild(menuItem);
                console.log(`Item '${ranking.getName()}' adicionado à seção MUCABRASIL Turbo!`);
                return true;
            }
            return false;
        }
    };

    // Page Manager
    const PageManager = {
        rankings: new Map(),
        preloadedData: new Map(),

        registerRanking(ranking) {
            const name = ranking.getName();
            this.rankings.set(ranking.getMenuHref(), ranking);
            console.log(`Ranking registrado no PageManager: ${name}`);
        },

        startPreloading() {
            setTimeout(() => {
                if (window.location.hostname === CONFIG.SITE.HOSTNAME) {
                    console.log('Iniciando pré-carregamento dos dados...');
                    this.preloadAllRankings();
                }
            }, CONFIG.TIMING.PRELOAD_DELAY);
        },

        async preloadAllRankings() {
            const preloadPromises = [];
            
            this.rankings.forEach((ranking, href) => {
                const cacheKey = CacheService.generateKey(ranking.getName());
                
                if (!cacheService.has(cacheKey)) {
                    preloadPromises.push(
                        ranking.collectData()
                            .then(data => {
                                this.preloadedData.set(href, data);
                                cacheService.set(cacheKey, data);
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
        },

        checkAndReplaceContent() {
            this.replaceContent();
            
            const fastInterval = setInterval(() => {
                this.replaceContent();
            }, CONFIG.TIMING.FAST_REPLACE_INTERVAL);
            
            setTimeout(() => {
                clearInterval(fastInterval);
            }, CONFIG.TIMING.FAST_REPLACE_DURATION);
            
            setInterval(() => {
                this.replaceContent();
            }, CONFIG.TIMING.NORMAL_REPLACE_INTERVAL);
        },

        replaceContent() {
            const currentUrl = window.location.href;
            const ranking = this.findRankingByUrl(currentUrl);
            
            if (ranking) {
                this.renderRankingPage(ranking);
            }
        },

        findRankingByUrl(url) {
            for (const [href, ranking] of this.rankings) {
                if (url.includes(href)) {
                    return ranking;
                }
            }
            return null;
        },

        async renderRankingPage(ranking) {
            DOMUtils.hideErrorElements();
            this.updatePageTitle(ranking);
            
            if (document.getElementById('rankingContainer')) {
                return;
            }

            const container = this.createRankingContainer();
            if (!container) return;

            const href = ranking.getMenuHref();
            let data = this.preloadedData.get(href);
            
            if (!data) {
                const cacheKey = CacheService.generateKey(ranking.getName());
                data = cacheService.get(cacheKey);
            }

            if (data) {
                console.log('Usando dados em cache/pré-carregados');
                this.renderRankingData(ranking, data, container);
            } else {
                container.innerHTML = '<p>Carregando dados históricos...</p>';
                try {
                    data = await ranking.collectData();
                    cacheService.set(CacheService.generateKey(ranking.getName()), data);
                    this.renderRankingData(ranking, data, container);
                } catch (error) {
                    container.innerHTML = '<p style="color: red;">Erro ao carregar dados</p>';
                    console.error('Erro ao carregar dados:', error);
                }
            }
        },

        updatePageTitle(ranking) {
            const titleElement = DOMUtils.findElementByXPath('//*[@id="conteudo"]//h1');
            if (titleElement) {
                titleElement.textContent = ranking.getName();
                titleElement.style.display = 'block';
            }
        },

        createRankingContainer() {
            let contentElement = DOMUtils.findElementByXPath('//*[@id="conteudo"]/p[1]');
            
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
        },

        renderRankingData(ranking, data, container) {
            const { guildVictories, dataByYear } = data;
            
            let filterComponent = null;
            if (ranking.supportsYearFilter() && dataByYear) {
                filterComponent = new FilterComponent(ranking, dataByYear, guildVictories);
            }

            this.updateRankingDisplay(ranking, guildVictories, filterComponent, container);

            if (filterComponent) {
                filterComponent.bindEvents((newData, allYearData, selectedYear) => {
                    filterComponent.setSelectedYear(selectedYear);
                    this.updateRankingDisplay(ranking, newData, filterComponent, container);
                });
            }
        },

        updateRankingDisplay(ranking, data, filterComponent, container) {
            let html = '';
            
            if (filterComponent) {
                html += filterComponent.createHTML();
            }
            
            html += ranking.createTable(data);
            
            container.innerHTML = html;
            
            if (filterComponent) {
                filterComponent.bindEvents((newData, allYearData, selectedYear) => {
                    filterComponent.setSelectedYear(selectedYear);
                    this.updateRankingDisplay(ranking, newData, filterComponent, container);
                });
            }
        }
    };

    // Aplicação principal
    class MucaBrasilTurbo {
        constructor() {
            this.rankings = [];
            this.initialized = false;
        }

        init() {
            if (this.initialized) return;

            console.log('Inicializando MUCABRASIL Turbo (versão integrada)...');
            
            this.registerRankings();
            
            MenuManager.init();
            PageManager.checkAndReplaceContent();
            PageManager.startPreloading();
            
            this.initialized = true;
            console.log('MUCABRASIL Turbo inicializado com sucesso!');
        }

        registerRankings() {
            const castleSiegeRanking = new CastleSiegeRanking();
            this.addRanking(castleSiegeRanking);
            
            console.log(`${this.rankings.length} ranking(s) registrado(s)`);
        }

        addRanking(ranking) {
            this.rankings.push(ranking);
            MenuManager.registerRanking(ranking);
            PageManager.registerRanking(ranking);
            
            console.log(`Ranking adicionado: ${ranking.getName()}`);
        }

        getInfo() {
            return {
                name: 'MUCABRASIL Turbo',
                version: '2.0.0 (Integrada)',
                rankings: this.rankings.map(r => r.getName()),
                initialized: this.initialized
            };
        }
    }

    // Inicialização
    const app = new MucaBrasilTurbo();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
        app.init();
    }

    window.MucaBrasilTurbo = app;
    console.log('MUCABRASIL Turbo versão integrada carregada');
}

// Inicialização principal
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMucaBrasilTurbo);
} else {
    initMucaBrasilTurbo();
}

