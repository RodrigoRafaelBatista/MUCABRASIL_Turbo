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
            <table class="tabela cor auto" style="margin-bottom: 10px; width: auto;">
                <tbody>
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
                </tbody>
            </table>
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
