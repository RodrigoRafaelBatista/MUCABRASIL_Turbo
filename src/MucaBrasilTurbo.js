import MenuManager from './components/MenuManager.js';
import PageManager from './components/PageManager.js';
import CastleSiegeRanking from './rankings/CastleSiegeRanking.js';

/**
 * Classe principal da aplicação MUCABRASIL Turbo
 */
class MucaBrasilTurbo {
    constructor() {
        this.rankings = [];
        this.initialized = false;
    }

    /**
     * Inicializa a aplicação
     */
    init() {
        if (this.initialized) return;

        console.log('Inicializando MUCABRASIL Turbo...');
        
        // Registra rankings disponíveis
        this.registerRankings();
        
        // Inicializa componentes
        MenuManager.init();
        PageManager.checkAndReplaceContent();
        PageManager.startPreloading();
        
        this.initialized = true;
        console.log('MUCABRASIL Turbo inicializado com sucesso!');
    }

    /**
     * Registra todos os rankings disponíveis
     */
    registerRankings() {
        // Castle Siege Ranking
        const castleSiegeRanking = new CastleSiegeRanking();
        this.addRanking(castleSiegeRanking);
        
        // Futuros rankings serão adicionados aqui:
        // const bloodCastleRanking = new BloodCastleRanking();
        // this.addRanking(bloodCastleRanking);
        
        // const devilSquareRanking = new DevilSquareRanking();
        // this.addRanking(devilSquareRanking);
        
        console.log(`${this.rankings.length} ranking(s) registrado(s)`);
    }

    /**
     * Adiciona um novo ranking
     * @param {IRanking} ranking - Instância do ranking
     */
    addRanking(ranking) {
        this.rankings.push(ranking);
        MenuManager.registerRanking(ranking);
        PageManager.registerRanking(ranking);
        
        console.log(`Ranking adicionado: ${ranking.getName()}`);
    }

    /**
     * Remove um ranking
     * @param {string} rankingName - Nome do ranking
     */
    removeRanking(rankingName) {
        this.rankings = this.rankings.filter(r => r.getName() !== rankingName);
        MenuManager.removeMenuItem(rankingName);
        
        console.log(`Ranking removido: ${rankingName}`);
    }

    /**
     * Lista todos os rankings registrados
     * @returns {Array<string>}
     */
    listRankings() {
        return this.rankings.map(r => r.getName());
    }

    /**
     * Obtém informações da aplicação
     * @returns {Object}
     */
    getInfo() {
        return {
            name: 'MUCABRASIL Turbo',
            version: '2.0.0',
            rankings: this.listRankings(),
            initialized: this.initialized
        };
    }
}

// Instância global
const app = new MucaBrasilTurbo();

// Auto-inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Expõe globalmente para debug
window.MucaBrasilTurbo = app;

export default app;
