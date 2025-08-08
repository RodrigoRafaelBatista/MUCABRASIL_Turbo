/**
 * Utilitários para requisições HTTP
 */
class HttpUtils {
    /**
     * Faz requisições paralelas para múltiplas URLs
     * @param {string[]} urls - Array de URLs
     * @returns {Promise<Array>}
     */
    static async fetchParallel(urls) {
        console.log(`Iniciando ${urls.length} requisições paralelas...`);
        
        const responses = await Promise.allSettled(
            urls.map(url => fetch(url).then(response => response.text()))
        );

        return responses;
    }

    /**
     * Processa respostas paralelas
     * @param {Array} responses - Respostas do Promise.allSettled
     * @param {Function} processor - Função para processar cada resposta
     * @param {number} startYear - Ano inicial
     * @returns {Object}
     */
    static processParallelResponses(responses, processor, startYear) {
        const results = {};
        
        responses.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const year = startYear + index;
                try {
                    const processed = processor(result.value, year);
                    if (processed) {
                        results[year] = processed;
                    }
                } catch (error) {
                    console.error(`Erro ao processar dados do ano ${year}:`, error);
                }
            } else {
                const year = startYear + index;
                console.error(`Erro ao carregar ano ${year}:`, result.reason);
            }
        });

        return results;
    }

    /**
     * Cria parser DOM para HTML
     * @param {string} html - String HTML
     * @returns {Document}
     */
    static parseHTML(html) {
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    }
}

export default HttpUtils;
