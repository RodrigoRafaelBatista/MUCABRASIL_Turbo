# MUCABRASIL Turbo v2.0

## 🎯 Arquitetura Modular e Escalável

Esta versão foi completamente refatorada seguindo princípios SOLID e design patterns para permitir fácil expansão de funcionalidades.

## 📁 Estrutura do Projeto

```
MUCABRASIL_Turbo/
├── src/
│   ├── core/                    # Classes base e interfaces
│   │   ├── IRanking.js         # Interface para rankings
│   │   └── Config.js           # Configurações globais
│   ├── components/             # Componentes reutilizáveis
│   │   ├── MenuManager.js      # Gerenciador do menu
│   │   ├── PageManager.js      # Gerenciador de páginas
│   │   └── FilterComponent.js  # Componente de filtro
│   ├── services/               # Serviços da aplicação
│   │   └── CacheService.js     # Serviço de cache
│   ├── utils/                  # Utilitários
│   │   ├── HttpUtils.js        # Utilitários HTTP
│   │   └── DOMUtils.js         # Utilitários DOM
│   ├── rankings/               # Implementações de rankings
│   │   └── CastleSiegeRanking.js
│   └── MucaBrasilTurbo.js      # Aplicação principal
├── content_new.js              # Content script principal
├── content.js                  # Versão anterior (backup)
└── manifest.json               # Configuração da extensão
```

## 🏗️ Princípios Aplicados

### SOLID

- **S**ingle Responsibility: Cada classe tem uma responsabilidade específica
- **O**pen/Closed: Fácil de estender (novos rankings) sem modificar código existente
- **L**iskov Substitution: Rankings implementam a mesma interface
- **I**nterface Segregation: Interfaces específicas e focadas
- **D**ependency Inversion: Depende de abstrações, não implementações

### Design Patterns

- **Singleton**: MenuManager, PageManager, CacheService
- **Strategy**: Diferentes implementações de ranking
- **Template Method**: IRanking define estrutura comum
- **Observer**: Event listeners para filtros
- **Factory**: Criação dinâmica de componentes

### Outros Princípios

- **DRY**: Código reutilizável em utilitários
- **KISS**: Interface simples para adicionar rankings
- **YAGNI**: Funcionalidades implementadas conforme necessidade

## 🚀 Como Adicionar Novos Rankings

### 1. Criar nova classe de ranking

```javascript
// src/rankings/BloodCastleRanking.js
import IRanking from '../core/IRanking.js';

class BloodCastleRanking extends IRanking {
    getName() {
        return 'Blood Castle (Ranking)';
    }

    getMenuHref() {
        return '?go=bloodcastleranking';
    }

    async collectData() {
        // Implementar coleta de dados
    }

    processData(html, year) {
        // Implementar processamento
    }

    createTable(data, options) {
        // Implementar criação da tabela
    }
}

export default BloodCastleRanking;
```

### 2. Registrar no arquivo principal

```javascript
// src/MucaBrasilTurbo.js
import BloodCastleRanking from './rankings/BloodCastleRanking.js';

registerRankings() {
    // Existente
    const castleSiegeRanking = new CastleSiegeRanking();
    this.addRanking(castleSiegeRanking);
    
    // Novo ranking
    const bloodCastleRanking = new BloodCastleRanking();
    this.addRanking(bloodCastleRanking);
}
```

### 3. Pronto! 🎉

O sistema automaticamente:
- ✅ Adiciona item ao menu
- ✅ Gerencia a página
- ✅ Aplica cache
- ✅ Adiciona filtros (se suportado)
- ✅ Faz pré-carregamento

## 🔧 Funcionalidades

### MenuManager
- Cria seção própria "MUCABRASIL Turbo" no menu vertical
- Adiciona automaticamente itens de ranking na nova seção
- Gerencia múltiplos rankings de forma organizada
- Remove itens quando necessário

### PageManager
- Intercepta páginas de erro
- Renderiza conteúdo dos rankings
- Gerencia pré-carregamento de dados
- Controla cache de dados

### CacheService
- Cache automático com TTL
- Melhora performance
- Reduz requisições desnecessárias

### FilterComponent
- Filtro por ano automático
- Preserva estado do filtro
- Integração transparente

## 🚀 Vantagens da Nova Arquitetura

1. **Escalabilidade**: Adicionar novos rankings é trivial
2. **Manutenibilidade**: Código organizado e bem documentado
3. **Performance**: Cache inteligente e pré-carregamento
4. **Robustez**: Tratamento de erros e fallback
5. **Testabilidade**: Classes isoladas e testáveis
6. **Extensibilidade**: Fácil adicionar novas funcionalidades

## 🔄 Migração

A extensão mantém compatibilidade com fallback automático para a versão anterior em caso de problemas, garantindo que funcione sempre.

## 📈 Próximos Rankings Planejados

- Blood Castle Ranking
- Devil Square Ranking
- Hall da Fama
- Ranking por Classes
- Ranking de Personagens
- E muito mais...

Cada novo ranking requer apenas:
1. Criar classe implementando `IRanking`
2. Adicionar ao registro
3. **Fim!** 🎯
