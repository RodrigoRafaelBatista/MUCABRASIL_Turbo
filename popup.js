function addNewMenuItem() {
  const menuUl = document.evaluate('//*[@id="menu-vertical"]/ul[3]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  
  if (menuUl) {
      const newLi = document.createElement('li');
      newLi.innerHTML = '<a href="?go=personagem"><span>»&nbsp;</span>Consultar Personagem</a>';
      menuUl.appendChild(newLi);
  }
}

// Execute a função quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', addNewMenuItem);

// Também podemos executar quando receber uma mensagem do popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "activate_turbo") {
      addNewMenuItem();
      console.log("MUCABRASIL_Turbo activated and new menu item added!");
  }
});
