/**
 * Serviço de cache para dados dos rankings
 */
class CacheService {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map(); // Time to live
        this.defaultTTL = 30 * 60 * 1000; // 30 minutos
    }

    /**
     * Armazena dados no cache
     * @param {string} key - Chave do cache
     * @param {*} data - Dados a serem armazenados
     * @param {number} ttl - Time to live em ms
     */
    set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, data);
        this.ttl.set(key, Date.now() + ttl);
        
        console.log(`Cache armazenado: ${key}`);
    }

    /**
     * Recupera dados do cache
     * @param {string} key - Chave do cache
     * @returns {*|null}
     */
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        const ttl = this.ttl.get(key);
        if (Date.now() > ttl) {
            this.delete(key);
            console.log(`Cache expirado removido: ${key}`);
            return null;
        }

        console.log(`Cache recuperado: ${key}`);
        return this.cache.get(key);
    }

    /**
     * Remove dados do cache
     * @param {string} key - Chave do cache
     */
    delete(key) {
        this.cache.delete(key);
        this.ttl.delete(key);
    }

    /**
     * Limpa todo o cache
     */
    clear() {
        this.cache.clear();
        this.ttl.clear();
        console.log('Cache limpo');
    }

    /**
     * Verifica se existe dados no cache
     * @param {string} key - Chave do cache
     * @returns {boolean}
     */
    has(key) {
        if (!this.cache.has(key)) {
            return false;
        }

        const ttl = this.ttl.get(key);
        if (Date.now() > ttl) {
            this.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Gera chave de cache para ranking
     * @param {string} rankingName - Nome do ranking
     * @param {number} year - Ano (opcional)
     * @returns {string}
     */
    static generateKey(rankingName, year = null) {
        return year ? `${rankingName}_${year}` : `${rankingName}_all`;
    }
}

// Singleton
const cacheService = new CacheService();
export default cacheService;
