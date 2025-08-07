function addNewMenuItem() {
  // Busca especificamente o ul da seção "Ranking"
  const menuUl = document.querySelector('#menu-vertical ul:nth-child(6)'); // O terceiro ul (Ranking)
  
  if (menuUl && !menuUl.querySelector('a[href="?go=castlesiegeranking"]')) {
      // Encontra o item "Castle Siege" existente
      const castleSiegeItem = menuUl.querySelector('a[href="?go=castlesiege"]');
      
      if (castleSiegeItem) {
          // Cria o novo item
          const castleRankingLi = document.createElement('li');
          castleRankingLi.innerHTML = '<a href="?go=castlesiegeranking"><span>»&nbsp;</span>Castle Siege (Ranking)</a>';
          
          // Insere logo após o Castle Siege normal
          const nextSibling = castleSiegeItem.parentNode.nextSibling;
          if (nextSibling) {
              menuUl.insertBefore(castleRankingLi, nextSibling);
          } else {
              menuUl.appendChild(castleRankingLi);
          }
          
          console.log("Item 'Castle Siege (Ranking)' adicionado!");
          return true;
      }
  }
  return false;
}

function checkAndAddMenuItem() {
  const intervalId = setInterval(() => {
      if (addNewMenuItem()) {
          clearInterval(intervalId);
      }
  }, 1000);  // Verifica a cada segundo
}

checkAndAddMenuItem();

// Variáveis globais para armazenar os dados do ranking
let castleSiegeDataPreloaded = null;

// Inicia o pré-carregamento dos dados assim que o site abre
setTimeout(() => {
    if (window.location.hostname === 'www.mucabrasil.com.br') {
        console.log('Iniciando pré-carregamento dos dados do Castle Siege...');
        preloadCastleSiegeData();
    }
}, 3000); // Aguarda 3 segundos para o site terminar de carregar

async function preloadCastleSiegeData() {
    const currentYear = new Date().getFullYear();
    const startYear = 2014;
    const guildVictories = {};
    
    try {
        // Cria um array com todas as URLs para fazer requisições paralelas
        const urls = [];
        for (let year = startYear; year <= currentYear; year++) {
            urls.push(`https://www.mucabrasil.com.br/?go=castlesiege&y=${year}`);
        }
        
        console.log(`Pré-carregando dados: ${urls.length} requisições paralelas...`);
        
        // Faz todas as requisições em paralelo
        const responses = await Promise.allSettled(
            urls.map(url => fetch(url).then(response => response.text()))
        );
        
        // Processa todas as respostas
        responses.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const html = result.value;
                const year = startYear + index;
                
                try {
                    // Cria um documento temporário para fazer parsing do HTML
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Busca todas as guilds vencedoras na tabela
                    const guildLinks = doc.evaluate(
                        '//div[@id="conteudo"]//table//td[2]//a',
                        doc,
                        null,
                        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                        null
                    );
                    
                    // Conta as vitórias de cada guild
                    for (let i = 0; i < guildLinks.snapshotLength; i++) {
                        const guildLink = guildLinks.snapshotItem(i);
                        const guildName = guildLink.textContent.trim();
                        
                        if (guildName) {
                            guildVictories[guildName] = (guildVictories[guildName] || 0) + 1;
                        }
                    }
                    
                } catch (error) {
                    console.error(`Erro ao processar dados do ano ${year}:`, error);
                }
            }
        });
        
        // Armazena os dados pré-carregados
        castleSiegeDataPreloaded = guildVictories;
        console.log('Dados do Castle Siege pré-carregados com sucesso!', Object.keys(guildVictories).length, 'guilds encontradas');
        
    } catch (error) {
        console.error('Erro no pré-carregamento:', error);
    }
}

function replaceContentWithCastleSiege() {
  if (window.location.href === 'https://www.mucabrasil.com.br/?go=castlesiegeranking') {
      // Intercepta e esconde imediatamente a mensagem de erro
      const errorElements = document.querySelectorAll('#conteudo h1, #conteudo p');
      errorElements.forEach(element => {
          if (element.textContent.includes('Página não encontrada') || 
              element.textContent.includes('Desculpe, mas a página') ||
              element.textContent.includes('Em caso de dúvida')) {
              element.style.display = 'none';
          }
      });
      
      // Corrige o título da página
      const titleElement = document.evaluate('//*[@id="conteudo"]//h1', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (titleElement) {
          titleElement.textContent = 'Castle Siege - Ranking';
          titleElement.style.display = 'block'; // Garante que o novo título seja visível
      }
      
      // Encontra qualquer elemento de conteúdo para substituir
      let contentElement = document.evaluate('//*[@id="conteudo"]/p[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      
      // Se não encontrar o primeiro p, procura outros elementos de conteúdo
      if (!contentElement) {
          contentElement = document.querySelector('#conteudo p, #conteudo div');
      }
      
      if (contentElement && !document.getElementById('castleSiegeRanking')) {
          const rankingDiv = document.createElement('div');
          rankingDiv.id = 'castleSiegeRanking';
          
          // Verifica se os dados já foram pré-carregados
          if (castleSiegeDataPreloaded) {
              console.log('Usando dados pré-carregados! Exibindo imediatamente...');
              rankingDiv.innerHTML = '<p>Exibindo ranking (dados pré-carregados)...</p>';
          } else {
              rankingDiv.innerHTML = `
                  <p>Carregando dados históricos...</p>
                  <div id="rankingTable" style="display: none;"></div>
              `;
          }
          
          // Remove todo o conteúdo de erro e adiciona nosso conteúdo
          const conteudoDiv = document.getElementById('conteudo');
          if (conteudoDiv) {
              // Limpa todo o conteúdo de erro
              const childElements = conteudoDiv.querySelectorAll('p, div:not(#castleSiegeRanking)');
              childElements.forEach(child => {
                  if (!child.id || child.id !== 'castleSiegeRanking') {
                      child.remove();
                  }
              });
              
              // Adiciona nosso conteúdo
              conteudoDiv.appendChild(rankingDiv);
          } else {
              contentElement.parentNode.replaceChild(rankingDiv, contentElement);
          }
          
          console.log('Conteúdo Castle Siege adicionado');
          
          // Se temos dados pré-carregados, usa eles. Senão, carrega normalmente
          if (castleSiegeDataPreloaded) {
              createRankingTable(castleSiegeDataPreloaded);
          } else {
              // Inicia o processo de coleta de dados
              collectCastleSiegeData();
          }
      }
  }
}

async function collectCastleSiegeData() {
    const currentYear = new Date().getFullYear();
    const startYear = 2014;
    const guildVictories = {};
    
    try {
        // Cria um array com todas as URLs para fazer requisições paralelas
        const urls = [];
        for (let year = startYear; year <= currentYear; year++) {
            urls.push(`https://www.mucabrasil.com.br/?go=castlesiege&y=${year}`);
        }
        
        console.log(`Iniciando ${urls.length} requisições paralelas...`);
        
        // Faz todas as requisições em paralelo
        const responses = await Promise.allSettled(
            urls.map(url => fetch(url).then(response => response.text()))
        );
        
        // Processa todas as respostas
        responses.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const html = result.value;
                const year = startYear + index;
                
                try {
                    // Cria um documento temporário para fazer parsing do HTML
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Busca todas as guilds vencedoras na tabela
                    const guildLinks = doc.evaluate(
                        '//div[@id="conteudo"]//table//td[2]//a',
                        doc,
                        null,
                        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                        null
                    );
                    
                    // Conta as vitórias de cada guild
                    for (let i = 0; i < guildLinks.snapshotLength; i++) {
                        const guildLink = guildLinks.snapshotItem(i);
                        const guildName = guildLink.textContent.trim();
                        
                        if (guildName) {
                            guildVictories[guildName] = (guildVictories[guildName] || 0) + 1;
                        }
                    }
                    
                    console.log(`Ano ${year} processado. Guilds encontradas:`, guildLinks.snapshotLength);
                    
                } catch (error) {
                    console.error(`Erro ao processar dados do ano ${year}:`, error);
                }
            } else {
                const year = startYear + index;
                console.error(`Erro ao carregar ano ${year}:`, result.reason);
            }
        });
        
        console.log('Todas as requisições processadas!');
        
        // Cria a tabela de ranking
        createRankingTable(guildVictories);
        
    } catch (error) {
        console.error('Erro geral na coleta de dados:', error);
        const rankingDiv = document.getElementById('castleSiegeRanking');
        if (rankingDiv) {
            rankingDiv.innerHTML = '<p style="color: red;">Erro ao carregar dados históricos</p>';
        }
    }
}

function createRankingTable(guildVictories) {
    const rankingDiv = document.getElementById('castleSiegeRanking');
    const tableDiv = document.getElementById('rankingTable');
    
    // Converte o objeto em array e ordena por número de vitórias
    const sortedGuilds = Object.entries(guildVictories)
        .sort(([,a], [,b]) => b - a)
        .map(([guild, victories], index) => ({
            position: index + 1,
            guild: guild,
            victories: victories
        }));
    
    if (sortedGuilds.length === 0) {
        rankingDiv.innerHTML = '<p style="color: orange;">Nenhum dado encontrado</p>';
        return;
    }
    
    // Cria a tabela HTML no estilo do site
    let tableHTML = `
        <table class="tabela cor auto">
            <tbody>
                <tr>
                    <td class="n"><b>Posição</b></td>
                    <td><b>Guild</b></td>
                    <td><b>Vitórias</b></td>
                </tr>
    `;
    
    sortedGuilds.forEach(({position, guild, victories}) => {
        tableHTML += `
            <tr>
                <td align="center"><b>${position}º</b></td>
                <td><a href="?go=guild&n=${encodeURIComponent(guild)}">${guild}</a></td>
                <td align="center">${victories}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    // Substitui o conteúdo de loading pela tabela
    rankingDiv.innerHTML = tableHTML;
    
    console.log('Ranking criado com sucesso:', sortedGuilds);
}

function checkAndReplaceContent() {
  // Executa imediatamente quando a página carrega
  replaceContentWithCastleSiege();
  
  // Executa rapidamente no início para interceptar a página de erro
  const fastInterval = setInterval(() => {
      replaceContentWithCastleSiege();
  }, 100); // Verifica a cada 100ms por um tempo
  
  // Para o intervalo rápido após 2 segundos
  setTimeout(() => {
      clearInterval(fastInterval);
  }, 2000);
  
  // Continua com verificação normal mais espaçada
  setInterval(() => {
      replaceContentWithCastleSiege();
  }, 1000);  // Verifica a cada segundo indefinidamente
}

checkAndReplaceContent();

