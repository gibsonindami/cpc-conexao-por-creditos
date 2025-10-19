
// Script universal de busca/filtro para páginas de serviços
// Espera-se que cada página defina um array 'services' com os dados corretos

document.addEventListener('DOMContentLoaded', function() {
	const container = document.querySelector('.service-list');
	const search = document.getElementById('txtBusca');
	const buttons = document.querySelectorAll('.filter-btn');

	if (!container || !search || !buttons.length || typeof services === 'undefined') return;

	function renderServices(filtro = "todos", busca = "") {
		container.innerHTML = "";
		let filtrados = services.filter(serv => {
			return filtro === "todos" || serv.categoria === filtro;
		});
		if (busca && busca.trim() !== "") {
			const termo = busca.toLowerCase();
			filtrados = filtrados.slice().sort((a, b) => {
				const aMatch = a.nome.toLowerCase().includes(termo) ? 0 : 1;
				const bMatch = b.nome.toLowerCase().includes(termo) ? 0 : 1;
				if (aMatch !== bMatch) return aMatch - bMatch;
				return 0;
			});
		}
		filtrados.forEach(serv => {
			const card = document.createElement("div");
			card.className = "service-card";
			card.innerHTML = `
				<img src="${serv.img}" alt="Foto de ${serv.nome}" class="avatar">
				<div class="service-info">
					<h3>${serv.nome}</h3>
					<p>${serv.local}</p>
					<a href="/contato"><button class="btn-contato">Contato</button></a>
				</div>
			`;
			container.appendChild(card);
			container.appendChild(document.createElement('br'));
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

	renderServices();
});
