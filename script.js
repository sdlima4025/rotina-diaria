
const STORAGE_KEY = "rotina_cards_tarefas_temporizador";

const nomesDias = {
    segunda: "Segunda-feira",
    terca: "Terça-feira",
    quarta: "Quarta-feira",
    quinta: "Quinta-feira",
    sexta: "Sexta-feira",
    sabado: "Sábado",
    domingo: "Domingo"
};

const ordemDias = {
    segunda: 1,
    terca: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sabado: 6,
    domingo: 7
};

const nomesTipos = {
    leitura: "Leitura",
    programacao: "Programação",
    saxofone: "Saxofone",
    reuniao: "Reunião",
    almoco: "Almoço",
    pausa: "Pausa",
    descanso: "Descanso",
    outro: "Outro"
};

const nomesStatus = {
    pendente: "Pendente",
    "em-andamento": "Em andamento",
    pausada: "Pausada",
    finalizada: "Finalizada"
};

const tarefasPadrao = [
    {
        id: 1,
        dia: "segunda",
        horario: "09:00 - 10:00",
        atividade: "Leitura de texto diário",
        tipo: "leitura",
        descricao: "Leitura com anotações para desenvolvimento pessoal.",
        status: "pendente",
        tempoDecorrido: 0,
        inicioTemporizador: null,
        temporizadorVisivel: false
    },
    {
        id: 2,
        dia: "segunda",
        horario: "10:15 - 11:15",
        atividade: "Prática de programação",
        tipo: "programacao",
        descricao: "Exercícios de HTML, CSS, JavaScript ou SQL.",
        status: "pendente",
        tempoDecorrido: 0,
        inicioTemporizador: null,
        temporizadorVisivel: false
    },
    {
        id: 3,
        dia: "terca",
        horario: "14:15 - 15:15",
        atividade: "Estudo de saxofone",
        tipo: "saxofone",
        descricao: "Treino de escalas, sonoridade e repertório.",
        status: "pendente",
        tempoDecorrido: 0,
        inicioTemporizador: null,
        temporizadorVisivel: false
    },
    {
        id: 4,
        dia: "quarta",
        horario: "19:30 - 20:30",
        atividade: "Reunião semanal",
        tipo: "reuniao",
        descricao: "Compromisso fixo para acompanhamento de atividades.",
        status: "pendente",
        tempoDecorrido: 0,
        inicioTemporizador: null,
        temporizadorVisivel: false
    },
    {
        id: 5,
        dia: "quinta",
        horario: "11:30 - 14:00",
        atividade: "Almoço e intervalo livre",
        tipo: "almoco",
        descricao: "Pausa para alimentação e descanso.",
        status: "pendente",
        tempoDecorrido: 0,
        inicioTemporizador: null,
        temporizadorVisivel: false
    },
    {
        id: 6,
        dia: "sexta",
        horario: "10:15 - 11:15",
        atividade: "Revisão de código",
        tipo: "programacao",
        descricao: "Refatoração, testes e melhoria da lógica.",
        status: "pendente",
        tempoDecorrido: 0,
        inicioTemporizador: null,
        temporizadorVisivel: false
    }
];

let tarefas = carregarTarefas();

const formTarefa = document.getElementById("formTarefa");
const tituloFormulario = document.getElementById("tituloFormulario");
const tarefaId = document.getElementById("tarefaId");
const diaTarefa = document.getElementById("diaTarefa");
const horarioTarefa = document.getElementById("horarioTarefa");
const atividadeTarefa = document.getElementById("atividadeTarefa");
const tipoTarefa = document.getElementById("tipoTarefa");
const descricaoTarefa = document.getElementById("descricaoTarefa");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");

const campoBusca = document.getElementById("campoBusca");
const filtroDia = document.getElementById("filtroDia");
const filtroAtividade = document.getElementById("filtroAtividade");
const filtroTipo = document.getElementById("filtroTipo");
const btnBuscar = document.getElementById("btnBuscar");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");
const resultadoBusca = document.getElementById("resultadoBusca");
const cardsContainer = document.getElementById("cardsContainer");

function carregarTarefas() {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) {
        return normalizarEstruturaTarefas(tarefasPadrao);
    }

    try {
        const tarefasSalvas = JSON.parse(dados);

        if (Array.isArray(tarefasSalvas)) {
            return normalizarEstruturaTarefas(tarefasSalvas);
        }

        return normalizarEstruturaTarefas(tarefasPadrao);
    } catch {
        return normalizarEstruturaTarefas(tarefasPadrao);
    }
}

function normalizarEstruturaTarefas(lista) {
    return lista.map((tarefa) => ({
        ...tarefa,
        tempoDecorrido: Number(tarefa.tempoDecorrido) || 0,
        inicioTemporizador: tarefa.inicioTemporizador || null,
        temporizadorVisivel: Boolean(tarefa.temporizadorVisivel)
    }));
}

function salvarNoLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
}

function normalizarTexto(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function ordenarTarefas(lista) {
    return [...lista].sort((a, b) => {
        const ordemDiaA = ordemDias[a.dia] || 99;
        const ordemDiaB = ordemDias[b.dia] || 99;

        if (ordemDiaA !== ordemDiaB) {
            return ordemDiaA - ordemDiaB;
        }

        return String(a.horario).localeCompare(String(b.horario), "pt-BR");
    });
}

function formatarTempo(milissegundos) {
    const totalSegundos = Math.floor(milissegundos / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    return [horas, minutos, segundos]
        .map((valor) => String(valor).padStart(2, "0"))
        .join(":");
}

function calcularTempoAtual(tarefa) {
    const tempoBase = Number(tarefa.tempoDecorrido) || 0;

    if (tarefa.status === "em-andamento" && tarefa.inicioTemporizador) {
        return tempoBase + (Date.now() - Number(tarefa.inicioTemporizador));
    }

    return tempoBase;
}

function popularFiltroAtividades() {
    const valorAtual = filtroAtividade.value;
    const atividadesUnicas = [...new Set(tarefas.map((tarefa) => tarefa.atividade))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "pt-BR"));

    filtroAtividade.innerHTML = `<option value="todos">Todas as atividades</option>`;

    atividadesUnicas.forEach((atividade) => {
        const option = document.createElement("option");
        option.value = atividade;
        option.textContent = atividade;
        filtroAtividade.appendChild(option);
    });

    const atividadeAindaExiste = atividadesUnicas.includes(valorAtual);
    filtroAtividade.value = atividadeAindaExiste ? valorAtual : "todos";
}

function obterFiltrosAtuais() {
    return {
        busca: normalizarTexto(campoBusca.value),
        dia: filtroDia.value,
        atividade: filtroAtividade.value,
        tipo: filtroTipo.value
    };
}

function tarefaCorrespondeAosFiltros(tarefa, filtros) {
    const textoTarefa = normalizarTexto(`
        ${tarefa.dia}
        ${nomesDias[tarefa.dia]}
        ${tarefa.horario}
        ${tarefa.atividade}
        ${tarefa.tipo}
        ${nomesTipos[tarefa.tipo]}
        ${tarefa.descricao}
        ${tarefa.status}
        ${nomesStatus[tarefa.status]}
      `);

    const correspondeBusca = filtros.busca === "" || textoTarefa.includes(filtros.busca);
    const correspondeDia = filtros.dia === "todos" || tarefa.dia === filtros.dia;
    const correspondeAtividade = filtros.atividade === "todos" || tarefa.atividade === filtros.atividade;
    const correspondeTipo = filtros.tipo === "todos" || tarefa.tipo === filtros.tipo;

    return correspondeBusca && correspondeDia && correspondeAtividade && correspondeTipo;
}

function buscarTarefas() {
    const filtros = obterFiltrosAtuais();
    return tarefas.filter((tarefa) => tarefaCorrespondeAosFiltros(tarefa, filtros));
}

function criarCardTarefa(tarefa) {
    const article = document.createElement("article");
    article.className = `card-tarefa status-${tarefa.status}`;
    article.dataset.id = tarefa.id;

    const tempoAtual = calcularTempoAtual(tarefa);
    const classeTemporizador = tarefa.temporizadorVisivel ? "temporizador visivel" : "temporizador";

    article.innerHTML = `
        <div class="card-conteudo">
          <div class="card-topo">
            <span class="dia">${escaparHTML(nomesDias[tarefa.dia] || tarefa.dia)}</span>
            <span class="horario">${escaparHTML(tarefa.horario)}</span>
          </div>

          <h3 class="atividade">${escaparHTML(tarefa.atividade)}</h3>

          <p class="descricao">${escaparHTML(tarefa.descricao || "Sem descrição informada.")}</p>

          <div class="meta">
            <span class="tag tag-tipo">${escaparHTML(nomesTipos[tarefa.tipo] || tarefa.tipo)}</span>
            <span class="tag tag-status ${tarefa.status}">
              ${escaparHTML(nomesStatus[tarefa.status] || tarefa.status)}
            </span>
          </div>

          <div class="${classeTemporizador}" data-timer-box="${tarefa.id}" aria-live="polite">
            <span class="temporizador-label">Tempo da tarefa</span>
            <span class="temporizador-tempo" data-timer="${tarefa.id}">
              ${formatarTempo(tempoAtual)}
            </span>
          </div>
        </div>

        <div class="card-acoes" aria-label="Ações da tarefa">
          <button
            type="button"
            class="btn btn-acao btn-primario"
            data-action="iniciar"
            data-id="${tarefa.id}"
          >
            Iniciar
          </button>

          <button
            type="button"
            class="btn btn-acao btn-amarelo"
            data-action="parar"
            data-id="${tarefa.id}"
          >
            Parar
          </button>

          <button
            type="button"
            class="btn btn-acao btn-verde"
            data-action="finalizar"
            data-id="${tarefa.id}"
          >
            Finalizar
          </button>

          <button
            type="button"
            class="btn btn-acao btn-roxo"
            data-action="editar"
            data-id="${tarefa.id}"
          >
            Editar
          </button>

          <button
            type="button"
            class="btn btn-acao btn-vermelho"
            data-action="excluir"
            data-id="${tarefa.id}"
          >
            Excluir
          </button>
        </div>
      `;

    return article;
}

function renderizarTarefas(listaTarefas = tarefas) {
    cardsContainer.innerHTML = "";

    const listaOrdenada = ordenarTarefas(listaTarefas);

    atualizarResumo(listaOrdenada.length);

    if (listaOrdenada.length === 0) {
        cardsContainer.innerHTML = `
          <div class="sem-resultados">
            Nenhuma tarefa encontrada com os filtros selecionados.
          </div>
        `;
        return;
    }

    listaOrdenada.forEach((tarefa) => {
        cardsContainer.appendChild(criarCardTarefa(tarefa));
    });

    atualizarTemporizadoresNaTela();
}

function atualizarResumo(totalEncontrado) {
    const totalGeral = tarefas.length;

    if (totalGeral === 0) {
        resultadoBusca.textContent = "Nenhuma tarefa cadastrada.";
        return;
    }

    if (totalEncontrado === totalGeral) {
        resultadoBusca.textContent = `Exibindo todas as ${totalGeral} tarefa(s) cadastrada(s).`;
        return;
    }

    resultadoBusca.textContent = `Resultado da busca: ${totalEncontrado} tarefa(s) encontrada(s) de ${totalGeral}.`;
}

function aplicarBusca() {
    renderizarTarefas(buscarTarefas());
}

function limparFiltros() {
    campoBusca.value = "";
    filtroDia.value = "todos";
    filtroAtividade.value = "todos";
    filtroTipo.value = "todos";

    renderizarTarefas(tarefas);
}

function limparFormulario() {
    formTarefa.reset();
    tarefaId.value = "";
    tituloFormulario.textContent = "Cadastrar tarefa";
    btnSalvar.textContent = "Cadastrar Tarefa";
    atividadeTarefa.focus();
}

function obterDadosDoFormulario() {
    return {
        dia: diaTarefa.value,
        horario: horarioTarefa.value.trim(),
        atividade: atividadeTarefa.value.trim(),
        tipo: tipoTarefa.value,
        descricao: descricaoTarefa.value.trim()
    };
}

function cadastrarOuEditarTarefa(event) {
    event.preventDefault();

    const dados = obterDadosDoFormulario();

    if (!dados.dia || !dados.horario || !dados.atividade || !dados.tipo) {
        alert("Preencha os campos obrigatórios: Dia, Horário, Atividade e Tipo.");
        return;
    }

    const idAtual = tarefaId.value;

    if (idAtual) {
        tarefas = tarefas.map((tarefa) => {
            if (String(tarefa.id) === String(idAtual)) {
                return {
                    ...tarefa,
                    ...dados
                };
            }

            return tarefa;
        });
    } else {
        const novaTarefa = {
            id: Date.now(),
            ...dados,
            status: "pendente",
            tempoDecorrido: 0,
            inicioTemporizador: null,
            temporizadorVisivel: false
        };

        tarefas.push(novaTarefa);
    }

    salvarNoLocalStorage();
    popularFiltroAtividades();
    limparFormulario();
    aplicarBusca();
}

function preencherFormularioParaEdicao(id) {
    const tarefa = tarefas.find((item) => String(item.id) === String(id));

    if (!tarefa) {
        return;
    }

    tarefaId.value = tarefa.id;
    diaTarefa.value = tarefa.dia;
    horarioTarefa.value = tarefa.horario;
    atividadeTarefa.value = tarefa.atividade;
    tipoTarefa.value = tarefa.tipo;
    descricaoTarefa.value = tarefa.descricao || "";

    tituloFormulario.textContent = "Editar tarefa";
    btnSalvar.textContent = "Salvar Alterações";

    document.getElementById("tituloFormulario").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    atividadeTarefa.focus();
}

function excluirTarefa(id) {
    const tarefa = tarefas.find((item) => String(item.id) === String(id));

    if (!tarefa) {
        return;
    }

    const confirmar = confirm(`Deseja excluir a tarefa "${tarefa.atividade}"?`);

    if (!confirmar) {
        return;
    }

    tarefas = tarefas.filter((item) => String(item.id) !== String(id));

    salvarNoLocalStorage();
    popularFiltroAtividades();
    aplicarBusca();

    if (String(tarefaId.value) === String(id)) {
        limparFormulario();
    }
}

function iniciarTemporizador(id) {
    tarefas = tarefas.map((tarefa) => {
        if (String(tarefa.id) === String(id)) {
            if (tarefa.status === "em-andamento" && tarefa.inicioTemporizador) {
                return tarefa;
            }

            return {
                ...tarefa,
                status: "em-andamento",
                temporizadorVisivel: true,
                inicioTemporizador: Date.now()
            };
        }

        return tarefa;
    });

    salvarNoLocalStorage();
    aplicarBusca();
}

function pararTemporizador(id) {
    tarefas = tarefas.map((tarefa) => {
        if (String(tarefa.id) === String(id)) {
            const tempoAtualizado = calcularTempoAtual(tarefa);

            return {
                ...tarefa,
                status: "pausada",
                tempoDecorrido: tempoAtualizado,
                inicioTemporizador: null,
                temporizadorVisivel: true
            };
        }

        return tarefa;
    });

    salvarNoLocalStorage();
    aplicarBusca();
}

function finalizarTemporizador(id) {
    tarefas = tarefas.map((tarefa) => {
        if (String(tarefa.id) === String(id)) {
            return {
                ...tarefa,
                status: "finalizada",
                tempoDecorrido: 0,
                inicioTemporizador: null,
                temporizadorVisivel: false
            };
        }

        return tarefa;
    });

    salvarNoLocalStorage();
    aplicarBusca();
}

function atualizarTemporizadoresNaTela() {
    const timers = document.querySelectorAll("[data-timer]");

    timers.forEach((timer) => {
        const id = timer.dataset.timer;
        const tarefa = tarefas.find((item) => String(item.id) === String(id));

        if (!tarefa) {
            return;
        }

        timer.textContent = formatarTempo(calcularTempoAtual(tarefa));
    });
}

function salvarTemposEmAndamento() {
    let houveAlteracao = false;

    tarefas = tarefas.map((tarefa) => {
        if (tarefa.status === "em-andamento" && tarefa.inicioTemporizador) {
            houveAlteracao = true;

            return {
                ...tarefa,
                tempoDecorrido: calcularTempoAtual(tarefa),
                inicioTemporizador: Date.now()
            };
        }

        return tarefa;
    });

    if (houveAlteracao) {
        salvarNoLocalStorage();
    }
}

function manipularAcaoCard(event) {
    const botao = event.target.closest("[data-action]");

    if (!botao) {
        return;
    }

    const id = botao.dataset.id;
    const acao = botao.dataset.action;

    if (acao === "iniciar") {
        iniciarTemporizador(id);
    }

    if (acao === "parar") {
        pararTemporizador(id);
    }

    if (acao === "finalizar") {
        finalizarTemporizador(id);
    }

    if (acao === "editar") {
        preencherFormularioParaEdicao(id);
    }

    if (acao === "excluir") {
        excluirTarefa(id);
    }
}

formTarefa.addEventListener("submit", cadastrarOuEditarTarefa);

btnCancelarEdicao.addEventListener("click", limparFormulario);

btnBuscar.addEventListener("click", aplicarBusca);

btnLimparFiltros.addEventListener("click", limparFiltros);

campoBusca.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        aplicarBusca();
    }
});

filtroDia.addEventListener("change", aplicarBusca);
filtroAtividade.addEventListener("change", aplicarBusca);
filtroTipo.addEventListener("change", aplicarBusca);

cardsContainer.addEventListener("click", manipularAcaoCard);

window.addEventListener("beforeunload", salvarTemposEmAndamento);

setInterval(atualizarTemporizadoresNaTela, 1000);
setInterval(salvarTemposEmAndamento, 10000);

const THEME_KEY = "rotina_cards_tema";

const btnTema = document.getElementById("btnTema");
const iconeTema = document.getElementById("iconeTema");

function aplicarTema(tema) {
    const temaEscuroAtivo = tema === "escuro";

    document.body.classList.toggle("tema-escuro", temaEscuroAtivo);

    iconeTema.textContent = temaEscuroAtivo ? "🌙" : "☀️";

    btnTema.setAttribute(
        "aria-label",
        temaEscuroAtivo ? "Alternar para modo claro" : "Alternar para modo escuro"
    );

    btnTema.setAttribute("aria-pressed", String(temaEscuroAtivo));

    localStorage.setItem(THEME_KEY, tema);
}

function alternarTema() {
    const temaAtual = document.body.classList.contains("tema-escuro")
        ? "escuro"
        : "claro";

    const novoTema = temaAtual === "escuro" ? "claro" : "escuro";

    aplicarTema(novoTema);
}

function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem(THEME_KEY);

    if (temaSalvo === "escuro" || temaSalvo === "claro") {
        aplicarTema(temaSalvo);
        return;
    }

    const prefereTemaEscuro = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    aplicarTema(prefereTemaEscuro ? "escuro" : "claro");
}

btnTema.addEventListener("click", alternarTema);

carregarTemaSalvo();


popularFiltroAtividades();
renderizarTarefas();