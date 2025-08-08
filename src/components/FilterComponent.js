import Config from '../core/Config.js';

/**
 * Componente de filtro por ano
 */
class FilterComponent {
    constructor(ranking, allYearData, originalData) {
        this.ranking = ranking;
        this.allYearData = allYearData;
        this.originalData = originalData;
        this.selectedYear = 'all';
    }

    /**
     * Cria o HTML do filtro
     * @returns {string}
     */
    createHTML() {
        if (!this.ranking.supportsYearFilter() || !this.allYearData) {
            return '';
        }

        const currentYear = Config.DEFAULT_YEARS.CURRENT;
        const startYear = this.ranking.getStartYear();
        
        let filterHTML = `
            <div style="margin-bottom: 15px; padding: 10px; background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 5px;">
                <label for="yearFilter" style="font-weight: bold; margin-right: 10px;">Filtrar por ano:</label>
                <select id="yearFilter" style="padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
                    <option value="all" ${this.selectedYear === 'all' ? 'selected' : ''}>
                        Todos os anos (${startYear}-${currentYear})
                    </option>
        `;
        
        for (let year = currentYear; year >= startYear; year--) {
            const isSelected = this.selectedYear == year ? 'selected' : '';
            filterHTML += `<option value="${year}" ${isSelected}>${year}</option>`;
        }
        
        filterHTML += `
                </select>
            </div>
        `;

        return filterHTML;
    }

    /**
     * Adiciona event listeners ao filtro
     * @param {Function} onFilterChange - Callback quando filtro muda
     */
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

    /**
     * Define o ano selecionado
     * @param {string|number} year - Ano selecionado
     */
    setSelectedYear(year) {
        this.selectedYear = year;
    }

    /**
     * Obtém o ano selecionado
     * @returns {string|number}
     */
    getSelectedYear() {
        return this.selectedYear;
    }
}

export default FilterComponent;
