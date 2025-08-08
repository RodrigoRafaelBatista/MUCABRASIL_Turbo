/**
 * Configurações globais da extensão
 */
class Config {
    static SITE = {
        HOSTNAME: 'www.mucabrasil.com.br',
        BASE_URL: 'https://www.mucabrasil.com.br'
    };

    static MENU = {
        SELECTOR: '#menu-vertical ul:nth-child(6)',
        CASTLE_SIEGE_SELECTOR: 'a[href="?go=castlesiege"]'
    };

    static TIMING = {
        MENU_CHECK_INTERVAL: 1000,
        PRELOAD_DELAY: 3000,
        FAST_REPLACE_INTERVAL: 100,
        NORMAL_REPLACE_INTERVAL: 1000,
        FAST_REPLACE_DURATION: 2000
    };

    static DEFAULT_YEARS = {
        START: 2014,
        get CURRENT() { return new Date().getFullYear(); }
    };

    static SELECTORS = {
        CONTENT: '#conteudo',
        CONTENT_TITLE: '//*[@id="conteudo"]//h1',
        CONTENT_PARAGRAPH: '//*[@id="conteudo"]/p[1]'
    };

    static CSS_CLASSES = {
        TABLE: 'tabela cor auto',
        TABLE_HEADER: 'n'
    };
}

export default Config;
