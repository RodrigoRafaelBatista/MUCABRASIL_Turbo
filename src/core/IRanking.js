/**
 * Interface base para todos os rankings
 * Define o contrato que todos os rankings devem implementar
 */
class IRanking {
    constructor() {
        if (this.constructor === IRanking) {
            throw new Error("Interface não pode ser instanciada diretamente");
        }
    }

    /**
     * Retorna o nome do ranking
     * @returns {string}
     */
    getName() {
        throw new Error("Método getName() deve ser implementado");
    }

    /**
     * Retorna a URL base do ranking
     * @returns {string}
     */
    getBaseUrl() {
        throw new Error("Método getBaseUrl() deve ser implementado");
    }

    /**
     * Retorna o href usado no menu
     * @returns {string}
     */
    getMenuHref() {
        throw new Error("Método getMenuHref() deve ser implementado");
    }

    /**
     * Coleta dados do ranking
     * @returns {Promise<Object>}
     */
    async collectData() {
        throw new Error("Método collectData() deve ser implementado");
    }

    /**
     * Processa dados brutos e retorna estrutura padronizada
     * @param {string} html - HTML da página
     * @param {number} year - Ano dos dados
     * @returns {Object}
     */
    processData(html, year) {
        throw new Error("Método processData() deve ser implementado");
    }

    /**
     * Cria a tabela HTML do ranking
     * @param {Object} data - Dados processados
     * @param {Object} options - Opções de renderização
     * @returns {string}
     */
    createTable(data, options = {}) {
        throw new Error("Método createTable() deve ser implementado");
    }

    /**
     * Retorna se o ranking suporta filtro por ano
     * @returns {boolean}
     */
    supportsYearFilter() {
        return true; // Por padrão, suporta filtro por ano
    }

    /**
     * Retorna o ano inicial para coleta de dados
     * @returns {number}
     */
    getStartYear() {
        return 2014; // Ano padrão
    }
}

export default IRanking;
