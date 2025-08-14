const services = [
  // Profissionais
  { nome: "Marcenaria", local: "Malcolm, Barueri-SP", categoria: "profissionais", img: "https://randomuser.me/api/portraits/men/11.jpg" },
  { nome: "Limpeza", local: "Malcolm, Barueri-SP", categoria: "profissionais", img: "https://randomuser.me/api/portraits/women/12.jpg" },
  { nome: "Mamadeira", local: "Malcolm, Barueri-SP", categoria: "infantil", img: "https://randomuser.me/api/portraits/men/13.jpg" },
  { nome: "Eletricista", local: "Joana, Osasco-SP", categoria: "profissionais", img: "https://randomuser.me/api/portraits/women/14.jpg" },
  { nome: "Encanador", local: "Carlos, Santana de Parnaíba-SP", categoria: "profissionais", img: "https://randomuser.me/api/portraits/men/45.jpg" },
  { nome: "Pintura", local: "Marta, Carapicuíba-SP", categoria: "profissionais", img: "https://randomuser.me/api/portraits/women/16.jpg" },
  { nome: "Pedreiro", local: "Juliano, Jandira-SP", categoria: "profissionais", img: "https://randomuser.me/api/portraits/men/30.jpg" },
  { nome: "Costureira", local: "Beatriz, Barueri-SP", categoria: "profissionais", img: "https://randomuser.me/api/portraits/women/31.jpg" },
  { nome: "Jardineiro", local: "Sérgio, Santana de Parnaíba-SP", categoria: "profissionais", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { nome: "professor", local: "Malcolm, Barueri-SP", categoria: "profissionais", img: "https://randomuser.me/api/portraits/men/17.jpg" },


  // Infantil
  { nome: "lenço umedecido", local: "Malcolm, Barueri-SP", categoria: "infantil", img: "https://randomuser.me/api/portraits/men/17.jpg" },
  { nome: "Roupas de bebê", local: "Joana, Osasco-SP", categoria: "infantil", img: "https://randomuser.me/api/portraits/women/18.jpg" },
  { nome: "Brinquedos", local: "Carlos, SP", categoria: "infantil", img: "https://randomuser.me/api/portraits/men/19.jpg" },
  { nome: "Fraldas", local: "Maria, Barueri-SP", categoria: "infantil", img: "https://randomuser.me/api/portraits/women/20.jpg" },
  { nome: "Cadeirinha de carro", local: "Ana, Jandira-SP", categoria: "infantil", img: "https://randomuser.me/api/portraits/women/21.jpg" },
  { nome: "Banheira de bebê", local: "Larissa, Osasco-SP", categoria: "infantil", img: "https://randomuser.me/api/portraits/women/33.jpg" },
  { nome: "Carrinho de bebê", local: "Tiago, Barueri-SP", categoria: "infantil", img: "https://randomuser.me/api/portraits/men/34.jpg" },
  { nome: "babador", local: "Fernanda, Osasco-SP", categoria: "infantil", img: "https://randomuser.me/api/portraits/women/28.jpg" },


  // Alimentação
  { nome: "Pacotes de bolachas", local: "Lucas, Barueri-SP", categoria: "alimentação", img: "https://randomuser.me/api/portraits/men/22.jpg" },
  { nome: "Sacos de arroz", local: "Patrícia, Carapicuíba-SP", categoria: "alimentação", img: "https://randomuser.me/api/portraits/women/23.jpg" },
  { nome: "Pacotes de Feijão", local: "André, Osasco-SP", categoria: "alimentação", img: "https://randomuser.me/api/portraits/men/24.jpg" },
  { nome: "20 litros de Oleo", local: "Clara, Barueri-SP", categoria: "alimentação", img: "https://randomuser.me/api/portraits/women/25.jpg" },
  { nome: "Pacote de açucar", local: "Sônia, Santana de Parnaíba-SP", categoria: "alimentação", img: "https://randomuser.me/api/portraits/women/26.jpg" },
  { nome: "Leite em pó", local: "Eduardo, Barueri-SP", categoria: "alimentação", img: "https://randomuser.me/api/portraits/men/27.jpg" },
  { nome: "Macarrão", local: "Fernanda, Osasco-SP", categoria: "alimentação", img: "https://randomuser.me/api/portraits/women/28.jpg" },
  { nome: "Cestas básicas", local: "Roberto, Carapicuíba-SP", categoria: "alimentação", img: "https://randomuser.me/api/portraits/men/29.jpg" },
  { nome: "farinha de milho", local: "Malcolm, Barueri-SP", categoria: "alimentação", img: "https://randomuser.me/api/portraits/men/17.jpg" },
];

      
  
  const container = document.getElementById('service-list');
  const search = document.getElementById('search');
  const buttons = document.querySelectorAll('.filter-btn');
  
  function renderServices(filtro = "todos", busca = "") {
    container.innerHTML = "";
  
    const filtrados = services.filter(serv => {
      const matchCategoria = filtro === "todos" || serv.categoria === filtro;
      const matchBusca = serv.nome.toLowerCase().includes(busca.toLowerCase());
      return matchCategoria && matchBusca;
    });
  
    filtrados.forEach(serv => {
      const card = document.createElement("div");
      card.className = "service-card";
      card.innerHTML = `
  <img src="${serv.img}" alt="Foto de ${serv.nome}">
  <div class="service-info">
    <strong>${serv.nome}</strong><br>
    <small>${serv.local}</small><br>
    <button class="contact-btn" onclick="window.location.href='https://wa.me/55DDDNÚMERO?text=Olá,%20gostaria%20de%20mais%20informações%20sobre%20o%20serviço%20de%20${encodeURIComponent(serv.nome)}.'">
  Contato
</button>

  </div>
`;
      
      container.appendChild(card);
    });
  }
  
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector(".filter-btn.active").classList.remove("active");
      btn.classList.add("active");
      renderServices(btn.dataset.filter, search.value);
    });
  });
  
  search.addEventListener("input", () => {
    const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
    renderServices(activeFilter, search.value);
  });
  const categoriaPlaceholders = {
    todos: "Busque um serviço...",
    infantil: "Busque um serviço infantil...",
    profissionais: "Busque um profissional...",
    alimentação: "Busque algo de alimentação..."
  };
  
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Trocar classe de botão ativo
      document.querySelector(".filter-btn.active").classList.remove("active");
      btn.classList.add("active");
  
      // Atualizar placeholder da busca
      const categoriaSelecionada = btn.dataset.filter;
      search.placeholder = categoriaPlaceholders[categoriaSelecionada] || "Busque um serviço...";
  
      // Atualizar lista de serviços
      renderServices(categoriaSelecionada, search.value);
    });
  });
  
  
  renderServices();
