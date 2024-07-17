function addNewMenuItem() {
  const menuUl = document.evaluate('//*[@id="menu-vertical"]/ul[3]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  
  if (menuUl && !menuUl.querySelector('a[href="?go=personagem"]')) {
      const newLi = document.createElement('li');
      newLi.innerHTML = '<a href="?go=personagem"><span>»&nbsp;</span>Consultar Personagem</a>';
      menuUl.appendChild(newLi);
      console.log("Novo item de menu adicionado!");
      return true;
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

function replaceContentWithSearch() {
  if (window.location.href === 'https://www.mucabrasil.com.br/?go=personagem') {
      const contentElement = document.evaluate('//*[@id="conteudo"]/p[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      
      if (contentElement && !document.getElementById('characterSearch')) {
          const searchForm = document.createElement('div');
          searchForm.innerHTML = `
              <input type="text" class="text" id="characterSearch" maxlength="10" placeholder="Insira o nome de seu buneco">
              <button id="searchButton">Pesquisar</button>
          `;
          
          contentElement.parentNode.replaceChild(searchForm, contentElement);
          
          document.getElementById('searchButton').addEventListener('click', function() {
              const searchTerm = document.getElementById('characterSearch').value;
              console.log('Pesquisando por:', searchTerm);
          });
          
          console.log('Campo de pesquisa adicionado');
      }
  }
}

function checkAndReplaceContent() {
  setInterval(replaceContentWithSearch, 1000);  // Verifica a cada segundo indefinidamente
}

checkAndReplaceContent();

