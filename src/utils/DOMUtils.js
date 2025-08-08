/**
 * Utilitários para manipulação do DOM
 */
class DOMUtils {
    /**
     * Avalia XPath e retorna resultados
     * @param {string} xpath - Expressão XPath
     * @param {Document} doc - Documento (padrão: document)
     * @param {number} resultType - Tipo do resultado XPath
     * @returns {XPathResult}
     */
    static evaluateXPath(xpath, doc = document, resultType = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {
        return doc.evaluate(xpath, doc, null, resultType, null);
    }

    /**
     * Encontra um elemento usando XPath
     * @param {string} xpath - Expressão XPath
     * @param {Document} doc - Documento (padrão: document)
     * @returns {Element|null}
     */
    static findElementByXPath(xpath, doc = document) {
        const result = this.evaluateXPath(xpath, doc, XPathResult.FIRST_ORDERED_NODE_TYPE);
        return result.singleNodeValue;
    }

    /**
     * Remove elementos de erro da página
     * @param {string[]} errorTexts - Textos que indicam erro
     */
    static hideErrorElements(errorTexts = [
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
    }

    /**
     * Cria e insere um elemento no DOM
     * @param {string} tag - Tag do elemento
     * @param {Object} attributes - Atributos do elemento
     * @param {Element} parent - Elemento pai
     * @param {Element} reference - Elemento de referência para inserção
     * @returns {Element}
     */
    static createElement(tag, attributes = {}, parent = null, reference = null) {
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
    }

    /**
     * Limpa conteúdo específico de um container
     * @param {string} containerId - ID do container
     * @param {string} excludeId - ID do elemento a preservar
     */
    static clearContainer(containerId, excludeId = null) {
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

    /**
     * Aguarda elemento aparecer no DOM
     * @param {string} selector - Seletor CSS
     * @param {number} timeout - Timeout em ms
     * @returns {Promise<Element>}
     */
    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Elemento ${selector} não encontrado`));
            }, timeout);
        });
    }
}

export default DOMUtils;
