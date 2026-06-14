/* =========================================================
   CONFIGURAÇÕES GERAIS E CONSTANTES
   ========================================================= */

const STORAGE_KEY = "rotina_cards_tarefas_com_data";
const THEME_KEY = "rotina_cards_tema";

const MIN_DATE = new Date(1970, 0, 1);
const MAX_DATE = new Date(2050, 11, 31);

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

const iconesTipos = {
  leitura: "menu_book",
  programacao: "code",
  saxofone: "music_note",
  reuniao: "groups",
  almoco: "restaurant",
  pausa: "coffee",
  descanso: "bedtime",
  outro: "more_horiz"
};

const nomesStatus = {
  pendente: "Pendente",
  "em-andamento": "Em andamento",
  pausada: "Pausada",
  finalizada: "Finalizada"
};

const iconesStatus = {
  pendente: "pending",
  "em-andamento": "play_circle",
  pausada: "pause_circle",
  finalizada: "check_circle"
};

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

/* =========================================================
   FUNÇÕES DE DATA
   ========================================================= */

function formatarISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function hojeISO() {
  return formatarISO(new Date());
}

function criarDataPorISO(iso) {
  if (!iso) return null;

  const partes = String(iso).split("-");
  if (partes.length !== 3) return null;

  const ano = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const dia = Number(partes[2]);

  return new Date(ano, mes, dia);
}

function formatarDataBRPorISO(iso) {
  const data = criarDataPorISO(iso);

  if (!data || Number.isNaN(data.getTime())) return "";

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

function converterBRParaISO(valor) {
  const partes = String(valor).split("/");

  if (partes.length !== 3) return "";

  const dia = partes[0].padStart(2, "0");
  const mes = partes[1].padStart(2, "0");
  const ano = partes[2];

  return `${ano}-${mes}-${dia}`;
}

function dataDentroDoIntervalo(data) {
  return data >= MIN_DATE && data <= MAX_DATE;
}

/* =========================================================
   TAREFAS PADRÃO
   ========================================================= */

const tarefasPadrao = [
  {
    id: 1,
    dataISO: hojeISO(),
    horaInicial: "09:00",
    horaFinal: "10:00",
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
    dataISO: hojeISO(),
    horaInicial: "10:15",
    horaFinal: "11:15",
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
    dataISO: hojeISO(),
    horaInicial: "14:15",
    horaFinal: "15:15",
    atividade: "Estudo de saxofone",
    tipo: "saxofone",
    descricao: "Treino de escalas, sonoridade e repertório.",
    status: "pendente",
    tempoDecorrido: 0,
    inicioTemporizador: null,
    temporizadorVisivel: false
  }
];

/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */

let tarefas = carregarTarefas();

let calendarioEstado = {
  input: null,
  ano: new Date().getFullYear(),
  mes: new Date().getMonth(),
  dataSelecionadaISO: "",
  aoSelecionar: null
};

/* =========================================================
   SELETORES DO DOM
   ========================================================= */

const formTarefa = document.getElementById("formTarefa");
const tituloFormulario = document.getElementById("tituloFormulario");
const tarefaId = document.getElementById("tarefaId");
const dataTarefa = document.getElementById("dataTarefa");
const horaInicialTarefa = document.getElementById("horaInicialTarefa");
const horaFinalTarefa = document.getElementById("horaFinalTarefa");
const atividadeTarefa = document.getElementById("atividadeTarefa");
const tipoTarefa = document.getElementById("tipoTarefa");
const descricaoTarefa = document.getElementById("descricaoTarefa");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");

const campoBusca = document.getElementById("campoBusca");
const filtroData = document.getElementById("filtroData");
const filtroAtividade = document.getElementById("filtroAtividade");
const filtroTipo = document.getElementById("filtroTipo");
const btnBuscar = document.getElementById("btnBuscar");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");
const resultadoBusca = document.getElementById("resultadoBusca");
const cardsContainer = document.getElementById("cardsContainer");

const calendarioPopup = document.getElementById("calendarioPopup");

const btnTema = document.getElementById("btnTema");
const iconeTema = document.getElementById("iconeTema");

/* =========================================================
   LOCALSTORAGE E NORMALIZAÇÃO
   ========================================================= */

function extrairHorarioAntigo(horario) {
  const encontrados = String(horario || "").match(/\d{2}:\d{2}/g) || [];

  return {
    horaInicial: encontrados[0] || "09:00",
    horaFinal: encontrados[1] || "10:00"
  };
}

function carregarTarefas() {
  const dados = localStorage.getItem(STORAGE_KEY);

  if (!dados) return normalizarTarefas(tarefasPadrao);

  try {
    const lista = JSON.parse(dados);
    return Array.isArray(lista) ? normalizarTarefas(lista) : normalizarTarefas(tarefasPadrao);
  } catch {
    return normalizarTarefas(tarefasPadrao);
  }
}

function normalizarTarefas(lista) {
  return lista.map((tarefa) => {
    const horarios = extrairHorarioAntigo(tarefa.horario);

    let dataISO = tarefa.dataISO || "";

    if (!dataISO && tarefa.data) {
      dataISO = String(tarefa.data).includes("/")
        ? converterBRParaISO(tarefa.data)
        : tarefa.data;
    }

    if (!dataISO) dataISO = hojeISO();

    return {
      ...tarefa,
      dataISO,
      horaInicial: tarefa.horaInicial || horarios.horaInicial,
      horaFinal: tarefa.horaFinal || horarios.horaFinal,
      status: tarefa.status || "pendente",
      tempoDecorrido: Number(tarefa.tempoDecorrido) || 0,
      inicioTemporizador: tarefa.inicioTemporizador || null,
      temporizadorVisivel: Boolean(tarefa.temporizadorVisivel)
    };
  });
}

function salvarNoLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
}

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

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
    if (a.dataISO !== b.dataISO) {
      return String(a.dataISO).localeCompare(String(b.dataISO));
    }

    return String(a.horaInicial).localeCompare(String(b.horaInicial));
  });
}

/* =========================================================
   TEMPORIZADOR
   ========================================================= */

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

function atualizarTemporizadoresNaTela() {
  const timers = document.querySelectorAll("[data-timer]");

  timers.forEach((timer) => {
    const id = timer.dataset.timer;
    const tarefa = tarefas.find((item) => String(item.id) === String(id));

    if (!tarefa) return;

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

  if (houveAlteracao) salvarNoLocalStorage();
}

/* =========================================================
   FILTROS E BUSCA
   ========================================================= */

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

  filtroAtividade.value = atividadesUnicas.includes(valorAtual) ? valorAtual : "todos";
}

function obterFiltrosAtuais() {
  return {
    busca: normalizarTexto(campoBusca.value),
    dataISO: filtroData.dataset.iso || "",
    atividade: filtroAtividade.value,
    tipo: filtroTipo.value
  };
}

function tarefaCorrespondeAosFiltros(tarefa, filtros) {
  const dataBR = formatarDataBRPorISO(tarefa.dataISO);
  const horarioCompleto = `${tarefa.horaInicial} - ${tarefa.horaFinal}`;

  const textoTarefa = normalizarTexto(`
    ${dataBR}
    ${tarefa.dataISO}
    ${tarefa.horaInicial}
    ${tarefa.horaFinal}
    ${horarioCompleto}
    ${tarefa.atividade}
    ${tarefa.tipo}
    ${nomesTipos[tarefa.tipo]}
    ${tarefa.descricao}
    ${tarefa.status}
    ${nomesStatus[tarefa.status]}
  `);

  const correspondeBusca = filtros.busca === "" || textoTarefa.includes(filtros.busca);
  const correspondeData = filtros.dataISO === "" || tarefa.dataISO === filtros.dataISO;
  const correspondeAtividade = filtros.atividade === "todos" || tarefa.atividade === filtros.atividade;
  const correspondeTipo = filtros.tipo === "todos" || tarefa.tipo === filtros.tipo;

  return correspondeBusca && correspondeData && correspondeAtividade && correspondeTipo;
}

function buscarTarefas() {
  const filtros = obterFiltrosAtuais();
  return tarefas.filter((tarefa) => tarefaCorrespondeAosFiltros(tarefa, filtros));
}

function aplicarBusca() {
  renderizarTarefas(buscarTarefas());
}

function limparFiltros() {
  campoBusca.value = "";
  filtroData.value = "";
  filtroData.dataset.iso = "";
  filtroAtividade.value = "todos";
  filtroTipo.value = "todos";

  renderizarTarefas(tarefas);
}

/* =========================================================
   RENDERIZAÇÃO DOS CARDS
   ========================================================= */

function criarCardTarefa(tarefa) {
  const col = document.createElement("div");
  col.className = "col-12 col-md-6 col-xl-4 tarefa-col";

  const tempoAtual = calcularTempoAtual(tarefa);
  const classeTemporizador = tarefa.temporizadorVisivel ? "temporizador visivel" : "temporizador";
  const dataBR = formatarDataBRPorISO(tarefa.dataISO);
  const horarioCompleto = `${tarefa.horaInicial} - ${tarefa.horaFinal}`;

  const nomeTipo = nomesTipos[tarefa.tipo] || tarefa.tipo;
  const iconeTipo = iconesTipos[tarefa.tipo] || "category";

  const nomeStatus = nomesStatus[tarefa.status] || tarefa.status;
  const iconeStatus = iconesStatus[tarefa.status] || "info";

  col.innerHTML = `
    <article class="card card-tarefa status-${tarefa.status}" data-id="${tarefa.id}">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-3 flex-wrap">
          <span class="card-data">
            <span class="material-symbols-rounded" aria-hidden="true">calendar_month</span>
            ${escaparHTML(dataBR)}
          </span>

          <span class="card-horario">
            <span class="material-symbols-rounded" aria-hidden="true">schedule</span>
            ${escaparHTML(horarioCompleto)}
          </span>
        </div>

        <h3 class="card-title atividade h5 mb-2">
          ${escaparHTML(tarefa.atividade)}
        </h3>

        <p class="card-text descricao mb-3">
          ${escaparHTML(tarefa.descricao || "Sem descrição informada.")}
        </p>

        <div class="d-flex flex-wrap gap-2 mb-3">
          <span class="tag tag-tipo">
            <span class="material-symbols-rounded" aria-hidden="true">${iconeTipo}</span>
            ${escaparHTML(nomeTipo)}
          </span>

          <span class="tag tag-status ${tarefa.status}">
            <span class="material-symbols-rounded" aria-hidden="true">${iconeStatus}</span>
            ${escaparHTML(nomeStatus)}
          </span>
        </div>

        <div
          class="${classeTemporizador} border rounded-3 p-3 text-center bg-primary-subtle"
          data-timer-box="${tarefa.id}"
          aria-live="polite"
        >
          <span class="temporizador-label">
            <span class="material-symbols-rounded" aria-hidden="true">timer</span>
            Tempo da tarefa
          </span>

          <span class="temporizador-tempo" data-timer="${tarefa.id}">
            ${formatarTempo(tempoAtual)}
          </span>
        </div>
      </div>

      <div class="card-footer bg-transparent border-0 pt-0">
        <div class="d-flex flex-column flex-sm-row flex-wrap gap-2">
          <button type="button" class="btn btn-sm btn-primary btn-action flex-fill" data-action="iniciar" data-id="${tarefa.id}">
            <span class="material-symbols-rounded" aria-hidden="true">play_arrow</span>
            Iniciar
          </button>

          <button type="button" class="btn btn-sm btn-warning btn-action flex-fill" data-action="parar" data-id="${tarefa.id}">
            <span class="material-symbols-rounded" aria-hidden="true">pause</span>
            Parar
          </button>

          <button type="button" class="btn btn-sm btn-success btn-action flex-fill" data-action="finalizar" data-id="${tarefa.id}">
            <span class="material-symbols-rounded" aria-hidden="true">check_circle</span>
            Finalizar
          </button>

          <button type="button" class="btn btn-sm btn-outline-primary btn-action flex-fill" data-action="editar" data-id="${tarefa.id}">
            <span class="material-symbols-rounded" aria-hidden="true">edit</span>
            Editar
          </button>

          <button type="button" class="btn btn-sm btn-danger btn-action flex-fill" data-action="excluir" data-id="${tarefa.id}">
            <span class="material-symbols-rounded" aria-hidden="true">delete</span>
            Excluir
          </button>
        </div>
      </div>
    </article>
  `;

  return col;
}

function renderizarTarefas(listaTarefas = tarefas) {
  cardsContainer.innerHTML = "";

  const listaOrdenada = ordenarTarefas(listaTarefas);

  atualizarResumo(listaOrdenada.length);

  if (listaOrdenada.length === 0) {
    cardsContainer.innerHTML = `
      <div class="col-12">
        <div class="sem-resultados">
          <span class="material-symbols-rounded d-block mb-2" aria-hidden="true">search_off</span>
          Nenhuma tarefa encontrada com os filtros selecionados.
        </div>
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

/* =========================================================
   FORMULÁRIO: CADASTRAR, EDITAR E LIMPAR
   ========================================================= */

function limparFormulario() {
  formTarefa.reset();

  tarefaId.value = "";
  dataTarefa.value = "";
  dataTarefa.dataset.iso = "";

  tituloFormulario.innerHTML = `
    <span class="material-symbols-rounded" aria-hidden="true">add_task</span>
    Cadastrar tarefa
  `;

  btnSalvar.innerHTML = `
    <span class="material-symbols-rounded" aria-hidden="true">add_task</span>
    Cadastrar Tarefa
  `;

  dataTarefa.focus();
}

function obterDadosDoFormulario() {
  return {
    dataISO: dataTarefa.dataset.iso || converterBRParaISO(dataTarefa.value),
    horaInicial: horaInicialTarefa.value,
    horaFinal: horaFinalTarefa.value,
    atividade: atividadeTarefa.value.trim(),
    tipo: tipoTarefa.value,
    descricao: descricaoTarefa.value.trim()
  };
}

function cadastrarOuEditarTarefa(event) {
  event.preventDefault();

  const dados = obterDadosDoFormulario();

  if (!dados.dataISO || !dados.horaInicial || !dados.horaFinal || !dados.atividade || !dados.tipo) {
    alert("Preencha os campos obrigatórios: Data, Hora inicial, Hora final, Atividade e Tipo.");
    return;
  }

  const dataSelecionada = criarDataPorISO(dados.dataISO);

  if (!dataSelecionada || !dataDentroDoIntervalo(dataSelecionada)) {
    alert("Selecione uma data entre 01/01/1970 e 31/12/2050.");
    return;
  }

  if (dados.horaFinal <= dados.horaInicial) {
    alert("A hora final deve ser maior que a hora inicial.");
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
    tarefas.push({
      id: Date.now(),
      ...dados,
      status: "pendente",
      tempoDecorrido: 0,
      inicioTemporizador: null,
      temporizadorVisivel: false
    });
  }

  salvarNoLocalStorage();
  popularFiltroAtividades();
  limparFormulario();
  aplicarBusca();
}

function preencherFormularioParaEdicao(id) {
  const tarefa = tarefas.find((item) => String(item.id) === String(id));

  if (!tarefa) return;

  tarefaId.value = tarefa.id;
  dataTarefa.value = formatarDataBRPorISO(tarefa.dataISO);
  dataTarefa.dataset.iso = tarefa.dataISO;
  horaInicialTarefa.value = tarefa.horaInicial;
  horaFinalTarefa.value = tarefa.horaFinal;
  atividadeTarefa.value = tarefa.atividade;
  tipoTarefa.value = tarefa.tipo;
  descricaoTarefa.value = tarefa.descricao || "";

  tituloFormulario.innerHTML = `
    <span class="material-symbols-rounded" aria-hidden="true">edit</span>
    Editar tarefa
  `;

  btnSalvar.innerHTML = `
    <span class="material-symbols-rounded" aria-hidden="true">save</span>
    Salvar Alterações
  `;

  tituloFormulario.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  dataTarefa.focus();
}

/* =========================================================
   AÇÕES DO CARD
   ========================================================= */

function excluirTarefa(id) {
  const tarefa = tarefas.find((item) => String(item.id) === String(id));

  if (!tarefa) return;

  const confirmar = confirm(`Deseja excluir a tarefa "${tarefa.atividade}"?`);

  if (!confirmar) return;

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
      return {
        ...tarefa,
        status: "pausada",
        tempoDecorrido: calcularTempoAtual(tarefa),
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

function manipularAcaoCard(event) {
  const botao = event.target.closest("[data-action]");

  if (!botao) return;

  const id = botao.dataset.id;
  const acao = botao.dataset.action;

  if (acao === "iniciar") iniciarTemporizador(id);
  if (acao === "parar") pararTemporizador(id);
  if (acao === "finalizar") finalizarTemporizador(id);
  if (acao === "editar") preencherFormularioParaEdicao(id);
  if (acao === "excluir") excluirTarefa(id);
}

/* =========================================================
   CALENDÁRIO CUSTOMIZADO
   ========================================================= */

function abrirCalendario(input, aoSelecionar) {
  const isoAtual = input.dataset.iso || converterBRParaISO(input.value);
  const dataAtual = criarDataPorISO(isoAtual);
  const hoje = new Date();

  calendarioEstado.input = input;
  calendarioEstado.aoSelecionar = aoSelecionar;
  calendarioEstado.dataSelecionadaISO = isoAtual || "";

  if (dataAtual && dataDentroDoIntervalo(dataAtual)) {
    calendarioEstado.ano = dataAtual.getFullYear();
    calendarioEstado.mes = dataAtual.getMonth();
  } else {
    calendarioEstado.ano = hoje.getFullYear();
    calendarioEstado.mes = hoje.getMonth();
  }

  renderizarCalendario();

  const rect = input.getBoundingClientRect();
  const larguraPopup = Math.min(360, window.innerWidth - 28);

  let left = rect.left + window.scrollX;
  const top = rect.bottom + window.scrollY + 8;

  if (left + larguraPopup > window.innerWidth - 14) {
    left = window.innerWidth - larguraPopup - 14;
  }

  calendarioPopup.style.left = `${left}px`;
  calendarioPopup.style.top = `${top}px`;
  calendarioPopup.classList.add("aberto");
}

function fecharCalendario() {
  calendarioPopup.classList.remove("aberto");
}

function alterarMes(delta) {
  calendarioEstado.mes += delta;

  if (calendarioEstado.mes < 0) {
    calendarioEstado.mes = 11;
    calendarioEstado.ano -= 1;
  }

  if (calendarioEstado.mes > 11) {
    calendarioEstado.mes = 0;
    calendarioEstado.ano += 1;
  }

  limitarAnoMesCalendario();
  renderizarCalendario();
}

function alterarAno(delta) {
  calendarioEstado.ano += delta;
  limitarAnoMesCalendario();
  renderizarCalendario();
}

function limitarAnoMesCalendario() {
  if (calendarioEstado.ano < 1970) {
    calendarioEstado.ano = 1970;
    calendarioEstado.mes = 0;
  }

  if (calendarioEstado.ano > 2050) {
    calendarioEstado.ano = 2050;
    calendarioEstado.mes = 11;
  }
}

function renderizarCalendario() {
  const ano = calendarioEstado.ano;
  const mes = calendarioEstado.mes;
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const diaSemanaInicio = primeiroDia.getDay();
  const totalDias = ultimoDia.getDate();
  const hoje = new Date();
  const hojeIso = formatarISO(hoje);

  const opcoesMes = meses.map((nomeMes, indice) => {
    const selected = indice === mes ? "selected" : "";
    return `<option value="${indice}" ${selected}>${nomeMes}</option>`;
  }).join("");

  let opcoesAno = "";

  for (let anoOption = 1970; anoOption <= 2050; anoOption++) {
    const selected = anoOption === ano ? "selected" : "";
    opcoesAno += `<option value="${anoOption}" ${selected}>${anoOption}</option>`;
  }

  let diasHTML = "";

  for (let i = 0; i < diaSemanaInicio; i++) {
    diasHTML += `<span></span>`;
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const data = new Date(ano, mes, dia);
    const iso = formatarISO(data);
    const desabilitado = !dataDentroDoIntervalo(data) ? "disabled" : "";
    const classeHoje = iso === hojeIso ? "hoje" : "";
    const classeSelecionado = iso === calendarioEstado.dataSelecionadaISO ? "selecionado" : "";

    diasHTML += `
      <button
        type="button"
        class="calendario-dia ${classeHoje} ${classeSelecionado}"
        data-date="${iso}"
        ${desabilitado}
        aria-label="Selecionar ${formatarDataBRPorISO(iso)}"
      >
        ${dia}
      </button>
    `;
  }

  calendarioPopup.innerHTML = `
    <div class="calendario-controles">
      <button type="button" class="btn btn-sm btn-outline-primary p-1" data-cal-action="ano-anterior" aria-label="Ano anterior">
        <span class="material-symbols-rounded" aria-hidden="true">keyboard_double_arrow_left</span>
      </button>

      <button type="button" class="btn btn-sm btn-outline-primary p-1" data-cal-action="mes-anterior" aria-label="Mês anterior">
        <span class="material-symbols-rounded" aria-hidden="true">chevron_left</span>
      </button>

      <div class="calendario-selects">
        <select id="selectMesCalendario" class="form-select" aria-label="Selecionar mês">
          ${opcoesMes}
        </select>

        <select id="selectAnoCalendario" class="form-select" aria-label="Selecionar ano">
          ${opcoesAno}
        </select>
      </div>

      <button type="button" class="btn btn-sm btn-outline-primary p-1" data-cal-action="mes-proximo" aria-label="Próximo mês">
        <span class="material-symbols-rounded" aria-hidden="true">chevron_right</span>
      </button>

      <button type="button" class="btn btn-sm btn-outline-primary p-1" data-cal-action="ano-proximo" aria-label="Próximo ano">
        <span class="material-symbols-rounded" aria-hidden="true">keyboard_double_arrow_right</span>
      </button>
    </div>

    <div class="calendario-semana" aria-hidden="true">
      <span>Dom</span>
      <span>Seg</span>
      <span>Ter</span>
      <span>Qua</span>
      <span>Qui</span>
      <span>Sex</span>
      <span>Sáb</span>
    </div>

    <div class="calendario-dias">
      ${diasHTML}
    </div>

    <div class="calendario-rodape">
      <button type="button" class="btn btn-sm btn-primary flex-fill btn-action" data-cal-action="hoje">
        <span class="material-symbols-rounded" aria-hidden="true">today</span>
        Hoje
      </button>

      <button type="button" class="btn btn-sm btn-secondary flex-fill btn-action" data-cal-action="fechar">
        <span class="material-symbols-rounded" aria-hidden="true">close</span>
        Fechar
      </button>
    </div>
  `;

  document.getElementById("selectMesCalendario").addEventListener("change", function () {
    calendarioEstado.mes = Number(this.value);
    limitarAnoMesCalendario();
    renderizarCalendario();
  });

  document.getElementById("selectAnoCalendario").addEventListener("change", function () {
    calendarioEstado.ano = Number(this.value);
    limitarAnoMesCalendario();
    renderizarCalendario();
  });
}

/* =========================================================
   TEMA CLARO/ESCURO
   ========================================================= */

function aplicarTema(tema) {
  const temaEscuroAtivo = tema === "escuro";

  document.body.classList.toggle("tema-escuro", temaEscuroAtivo);

  iconeTema.textContent = temaEscuroAtivo ? "dark_mode" : "light_mode";

  btnTema.setAttribute(
    "aria-label",
    temaEscuroAtivo ? "Alternar para modo claro" : "Alternar para modo escuro"
  );

  btnTema.setAttribute("aria-pressed", String(temaEscuroAtivo));
  localStorage.setItem(THEME_KEY, tema);
}

function alternarTema() {
  const temaAtual = document.body.classList.contains("tema-escuro") ? "escuro" : "claro";
  aplicarTema(temaAtual === "escuro" ? "claro" : "escuro");
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

/* =========================================================
   EVENTOS DO CALENDÁRIO
   ========================================================= */

calendarioPopup.addEventListener("click", function (event) {
  const botaoDia = event.target.closest("[data-date]");
  const botaoAcao = event.target.closest("[data-cal-action]");

  if (botaoDia) {
    const iso = botaoDia.dataset.date;

    calendarioEstado.input.value = formatarDataBRPorISO(iso);
    calendarioEstado.input.dataset.iso = iso;
    calendarioEstado.dataSelecionadaISO = iso;

    if (typeof calendarioEstado.aoSelecionar === "function") {
      calendarioEstado.aoSelecionar(iso);
    }

    fecharCalendario();
    return;
  }

  if (!botaoAcao) return;

  const acao = botaoAcao.dataset.calAction;

  if (acao === "mes-anterior") alterarMes(-1);
  if (acao === "mes-proximo") alterarMes(1);
  if (acao === "ano-anterior") alterarAno(-1);
  if (acao === "ano-proximo") alterarAno(1);

  if (acao === "hoje") {
    const hoje = new Date();
    const isoHoje = formatarISO(hoje);

    if (dataDentroDoIntervalo(hoje)) {
      calendarioEstado.input.value = formatarDataBRPorISO(isoHoje);
      calendarioEstado.input.dataset.iso = isoHoje;

      if (typeof calendarioEstado.aoSelecionar === "function") {
        calendarioEstado.aoSelecionar(isoHoje);
      }

      fecharCalendario();
    }
  }

  if (acao === "fechar") {
    fecharCalendario();
  }
});

/* Fecha calendário ao clicar fora */
document.addEventListener("click", function (event) {
  const clicouNoCalendario = calendarioPopup.contains(event.target);
  const clicouEmInputData = event.target === dataTarefa || event.target === filtroData;

  if (!clicouNoCalendario && !clicouEmInputData) {
    fecharCalendario();
  }
});

/* Fecha calendário com ESC */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    fecharCalendario();
  }
});

/* =========================================================
   EVENTOS PRINCIPAIS
   ========================================================= */

dataTarefa.addEventListener("click", function () {
  abrirCalendario(dataTarefa);
});

dataTarefa.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    abrirCalendario(dataTarefa);
  }
});

filtroData.addEventListener("click", function () {
  abrirCalendario(filtroData, aplicarBusca);
});

filtroData.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    abrirCalendario(filtroData, aplicarBusca);
  }
});

formTarefa.addEventListener("submit", cadastrarOuEditarTarefa);
btnCancelarEdicao.addEventListener("click", limparFormulario);

btnBuscar.addEventListener("click", aplicarBusca);
btnLimparFiltros.addEventListener("click", limparFiltros);

filtroAtividade.addEventListener("change", aplicarBusca);
filtroTipo.addEventListener("change", aplicarBusca);

cardsContainer.addEventListener("click", manipularAcaoCard);

btnTema.addEventListener("click", alternarTema);

campoBusca.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    aplicarBusca();
  }
});

window.addEventListener("beforeunload", salvarTemposEmAndamento);
window.addEventListener("resize", fecharCalendario);
window.addEventListener("scroll", fecharCalendario, true);

/* =========================================================
   INTERVALOS DE ATUALIZAÇÃO
   ========================================================= */

setInterval(atualizarTemporizadoresNaTela, 1000);
setInterval(salvarTemposEmAndamento, 10000);

/* =========================================================
   INICIALIZAÇÃO DA APLICAÇÃO
   ========================================================= */

carregarTemaSalvo();
popularFiltroAtividades();
renderizarTarefas();
