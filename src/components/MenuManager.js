import Config from '../core/Config.js';
import DOMUtils from '../utils/DOMUtils.js';

/**
 * Gerenciador de menu - adiciona novos itens ao menu do site
 */
class MenuManager {
    constructor() {
        this.rankings = new Map();
        this.initialized = false;
    }

    /**
     * Registra um novo ranking no menu
     * @param {IRanking} ranking - Instância do ranking
     */
    registerRanking(ranking) {
        const name = ranking.getName();
        this.rankings.set(name, ranking);
        console.log(`Ranking registrado: ${name}`);
    }

    /**
     * Inicializa o gerenciador de menu
     */
    init() {
        if (this.initialized) return;
        
        this.checkAndAddMenuItems();
        this.initialized = true;
    }

    /**
     * Adiciona todos os itens de menu registrados
     */
    checkAndAddMenuItems() {
        const intervalId = setInterval(() => {
            let allAdded = true;
            
            this.rankings.forEach((ranking, name) => {
                if (!this.addMenuItem(ranking)) {
                    allAdded = false;
                }
            });

            if (allAdded && this.rankings.size > 0) {
                clearInterval(intervalId);
                console.log('Todos os itens de menu foram adicionados');
            }
        }, Config.TIMING.MENU_CHECK_INTERVAL);
    }

    /**
     * Adiciona um item de menu específico
     * @param {IRanking} ranking - Ranking a ser adicionado
     * @returns {boolean} - Se foi adicionado com sucesso
     */
    addMenuItem(ranking) {
        const menuUl = document.querySelector(Config.MENU.SELECTOR);
        const menuHref = ranking.getMenuHref();
        
        if (menuUl && !menuUl.querySelector(`a[href="${menuHref}"]`)) {
            const castleSiegeItem = menuUl.querySelector(Config.MENU.CASTLE_SIEGE_SELECTOR);
            
            if (castleSiegeItem) {
                const menuItem = DOMUtils.createElement('li', {
                    innerHTML: `<a href="${menuHref}"><span>»&nbsp;</span>${ranking.getName()}</a>`
                });
                
                const nextSibling = castleSiegeItem.parentNode.nextSibling;
                if (nextSibling) {
                    menuUl.insertBefore(menuItem, nextSibling);
                } else {
                    menuUl.appendChild(menuItem);
                }
                
                console.log(`Item '${ranking.getName()}' adicionado ao menu!`);
                return true;
            }
        }
        return false;
    }

    /**
     * Remove um item de menu
     * @param {string} rankingName - Nome do ranking
     */
    removeMenuItem(rankingName) {
        const ranking = this.rankings.get(rankingName);
        if (!ranking) return;

        const menuHref = ranking.getMenuHref();
        const menuItem = document.querySelector(`a[href="${menuHref}"]`);
        
        if (menuItem && menuItem.parentNode) {
            menuItem.parentNode.remove();
            console.log(`Item '${rankingName}' removido do menu`);
        }
    }

    /**
     * Obtém ranking por nome
     * @param {string} name - Nome do ranking
     * @returns {IRanking|null}
     */
    getRanking(name) {
        return this.rankings.get(name) || null;
    }

    /**
     * Lista todos os rankings registrados
     * @returns {Array<string>}
     */
    listRankings() {
        return Array.from(this.rankings.keys());
    }
}

// Singleton
const menuManager = new MenuManager();
export default menuManager;
