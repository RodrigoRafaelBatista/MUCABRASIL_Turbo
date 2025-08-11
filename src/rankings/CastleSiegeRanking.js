import IRanking from '../core/IRanking.js';
import Config from '../core/Config.js';
import HttpUtils from '../utils/HttpUtils.js';
import DOMUtils from '../utils/DOMUtils.js';

/**
 * Implementação do ranking Castle Siege
 */
class CastleSiegeRanking extends IRanking {
    constructor() {
        super();
    }

    getName() {
        return 'Castle Siege (Ranking)';
    }

    getBaseUrl() {
        return `${Config.SITE.BASE_URL}/?go=castlesiege`;
    }

    getMenuHref() {
        return '?go=castlesiegeranking';
    }

    getStartYear() {
        return 2014;
    }

    /**
     * Coleta dados de todos os anos
     * @returns {Promise<{guildVictories: Object, dataByYear: Object}>}
     */
    async collectData() {
        const currentYear = Config.DEFAULT_YEARS.CURRENT;
        const startYear = this.getStartYear();
        const guildVictories = {};
        const dataByYear = {};
        
        try {
            // Cria URLs para todos os anos
            const urls = [];
            for (let year = startYear; year <= currentYear; year++) {
                urls.push(`${this.getBaseUrl()}&y=${year}`);
            }
            
            // Faz requisições paralelas
            const responses = await HttpUtils.fetchParallel(urls);
            
            // Processa respostas
            responses.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const year = startYear + index;
                    const yearData = this.processData(result.value, year);
                    
                    dataByYear[year] = yearData;
                    
                    // Adiciona ao total geral
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

    /**
     * Processa dados de um ano específico
     * @param {string} html - HTML da página
     * @param {number} year - Ano dos dados
     * @returns {Object} - Dados processados
     */
    processData(html, year) {
        const guildVictories = {};
        
        try {
            const doc = HttpUtils.parseHTML(html);
            
            // Busca guilds vencedoras na tabela
            const guildLinks = DOMUtils.evaluateXPath(
                '//div[@id="conteudo"]//table//td[2]//a',
                doc
            );
            
            // Conta vitórias de cada guild
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

    /**
     * Cria tabela HTML do ranking
     * @param {Object} guildVictories - Dados das vitórias
     * @param {Object} options - Opções de renderização
     * @returns {string}
     */
    createTable(guildVictories, options = {}) {
        // Converte e ordena dados
        const sortedGuilds = Object.entries(guildVictories)
            .sort(([,a], [,b]) => b - a)
            .map(([guild, victories], index) => ({
                position: index + 1,
                guild: guild,
                victories: victories
            }));

        if (sortedGuilds.length === 0) {
            // Retorna HTML simples se não houver dados
            return '<p style="color: orange;">Nenhum dado encontrado</p>';
        }

        // Usa jQuery para criar a tabela de forma instantânea
        // Garante que o jQuery está disponível no escopo global
        const $ = window.jQuery || window.$;
        if (!$) {
            // Fallback para HTML se jQuery não estiver disponível
            let tableHTML = `
                <table class="${Config.CSS_CLASSES.TABLE}" id="rankingTableData">
                    <tbody>
                        <tr>
                            <td class="${Config.CSS_CLASSES.TABLE_HEADER}"><b>Posição</b></td>
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

        // Criação da tabela usando jQuery
        const $table = $('<table>', {
            class: Config.CSS_CLASSES.TABLE,
            id: 'rankingTableData'
        });
        const $tbody = $('<tbody>');
        const $header = $('<tr>')
            .append($('<td>', { class: Config.CSS_CLASSES.TABLE_HEADER }).html('<b>Posição</b>'))
            .append($('<td>').html('<b>Guild</b>'))
            .append($('<td>').html('<b>Vitórias</b>'));
        $tbody.append($header);

        sortedGuilds.forEach(({position, guild, victories}) => {
            const $row = $('<tr>')
                .append($('<td>', { align: 'center' }).html(`<b>${position}º</b>`))
                .append($('<td>').append(
                    $('<a>', {
                        href: `?go=guild&n=${encodeURIComponent(guild)}`,
                        text: guild
                    })
                ))
                .append($('<td>', { align: 'center' }).text(victories));
            $tbody.append($row);
        });

        $table.append($tbody);
        // Retorna o outerHTML da tabela criada instantaneamente
        return $table[0].outerHTML;
    }
}

export default CastleSiegeRanking;
