# MUCABRASIL Turbo v2.0

## 🎮 Extensão Avançada para MUCABRASIL

Extensão de navegador que adiciona recursos avançados ao site MUCABRASIL, incluindo rankings personalizados e funcionalidades aprimoradas.

### ✨ Funcionalidades

- **Seção Própria no Menu**: Cria seção "MUCABRASIL Turbo" no menu vertical
- **Castle Siege Ranking**: Visualiza ranking histórico de vitórias no Castle Siege
- **Filtro por Ano**: Filtra dados específicos por ano (2014-atual)
- **Cache Inteligente**: Sistema de cache para melhor performance
- **Pré-carregamento**: Carrega dados em background para experiência fluida
- **Arquitetura Escalável**: Preparado para novos rankings e funcionalidades

### 🚀 Instalação

#### Firefox
1. Abra `about:debugging` no Firefox
2. Clique em "Este Firefox"
3. Clique em "Carregar extensão temporária..."
4. Selecione o arquivo `manifest.json`

#### Chrome
1. Abra `chrome://extensions/`
2. Ative o "Modo de desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta da extensão

### 🔧 Compatibilidade

- ✅ **Firefox**: Totalmente suportado (versão integrada)
- ✅ **Chrome**: Totalmente suportado
- ✅ **Edge**: Compatível com versão Chromium

### 📁 Estrutura do Projeto

```
MUCABRASIL_Turbo/
├── src/                    # Arquitetura modular (referência)
├── content.js              # Content script principal
├── popup.html              # Interface do popup
├── popup.js                # Script do popup
├── manifest.json           # Configuração da extensão
├── icon.png                # Ícone da extensão
└── README.md               # Este arquivo
```

### 🏗️ Arquitetura

A extensão segue a estrutura padrão de WebExtensions:

- **Arquivos na Raiz**: Content scripts, popup e manifest (exigência do WebExtensions)
- **src/**: Arquitetura modular de referência para consulta e expansões
- **Princípios SOLID**: Design patterns aplicados na versão integrada
- **Compatibilidade**: Uma única versão que funciona em todos os navegadores

### 🎯 Rankings Disponíveis

#### Castle Siege (Ranking)
- Coleta dados de 2014 até o ano atual
- Ranking por número de vitórias
- Filtro por ano específico
- Links diretos para perfis das guilds

### 🔮 Próximos Rankings

A arquitetura permite facilmente adicionar:
- Blood Castle Ranking
- Devil Square Ranking
- Hall da Fama
- Ranking por Classes
- Ranking de Personagens

### 🐛 Solução de Problemas

#### Erro "type: module" no Firefox
**Solucionado!** A versão atual usa uma implementação integrada compatível com todos os navegadores.

#### Cache não funciona
A extensão usa cache local que persiste durante a sessão do navegador.

#### Filtro desaparece
Problema corrigido na v2.0 - o filtro agora persiste sempre.

### 📝 Changelog

#### v2.0.0
- 🏗️ Arquitetura completamente refatorada
- 🔧 Compatibilidade total com Firefox
- 📊 Sistema de filtros aprimorado
- 💾 Sistema de cache implementado
- ⚡ Pré-carregamento de dados
- 🛡️ Sistema de fallback robusto

#### v1.0.0
- ✨ Primeira versão
- 🏰 Castle Siege Ranking básico

### 🤝 Contribuição

Para adicionar novos rankings ou funcionalidades, consulte `ARCHITECTURE.md` para detalhes da estrutura modular.

### 📄 Licença

Este projeto é de código aberto para a comunidade MUCABRASIL.

---

**Desenvolvido com ❤️ para a comunidade MUCABRASIL** 🏆
