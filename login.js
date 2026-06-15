/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

/*
  Substitua pelo Client ID criado no Google Cloud Console.

  Exemplo:
  const GOOGLE_CLIENT_ID = "1234567890-abcxyz.apps.googleusercontent.com";
*/

const GOOGLE_CLIENT_ID = "880622662988-vrft9suiga7th2n26o10ojkkgr2n7dsu.apps.googleusercontent.com";

/*
  Página principal da aplicação após login bem-sucedido.
*/
const APP_REDIRECT_URL = "index.html";

/*
  Chaves usadas no armazenamento local.
*/
const AUTH_STORAGE_KEY = "rotina_cards_google_auth";
const USER_STORAGE_KEY = "rotina_cards_google_user";

/* =========================================================
   SELETORES
   ========================================================= */

const loginMessage = document.getElementById("loginMessage");

/* =========================================================
   MENSAGENS NA INTERFACE
   ========================================================= */

function exibirMensagem(texto, tipo = "") {
  loginMessage.textContent = texto;
  loginMessage.className = `login-message ${tipo}`;
}

/* =========================================================
   DECODIFICAÇÃO DO ID TOKEN JWT
   ========================================================= */

/*
  IMPORTANTE:
  Esta função apenas decodifica o token no navegador para obter dados básicos
  do usuário, como nome, e-mail e foto.

  Em produção, a validação real do token deve ser feita no backend usando
  bibliotecas oficiais do Google.
*/

function decodificarJwt(token) {
  try {
    const partes = token.split(".");

    if (partes.length !== 3) {
      throw new Error("Token JWT inválido.");
    }

    const payloadBase64 = partes[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payloadJson = decodeURIComponent(
      atob(payloadBase64)
        .split("")
        .map((caractere) => {
          return `%${`00${caractere.charCodeAt(0).toString(16)}`.slice(-2)}`;
        })
        .join("")
    );

    return JSON.parse(payloadJson);
  } catch (erro) {
    console.error("Erro ao decodificar JWT:", erro);
    return null;
  }
}

/* =========================================================
   TRATAMENTO DA RESPOSTA DO GOOGLE
   ========================================================= */

/*
  Esta função é chamada automaticamente pelo SDK do Google
  quando o usuário conclui o login.
*/

async function tratarRespostaGoogle(response) {
  try {
    exibirMensagem("Validando autenticação com Google...", "");

    const idToken = response.credential;

    if (!idToken) {
      throw new Error("Token de autenticação não recebido.");
    }

    /*
      Fluxo recomendado em produção:

      1. Enviar o ID Token para o backend.
      2. O backend valida o token com o Google.
      3. O backend cria uma sessão segura própria.
      4. O frontend recebe confirmação e redireciona.

      Exemplo:

      const respostaBackend = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ idToken })
      });

      if (!respostaBackend.ok) {
        throw new Error("Falha ao validar token no servidor.");
      }

      const dadosSessao = await respostaBackend.json();
    */

    /*
      Fluxo simplificado para projeto frontend/local:

      Este método decodifica o token no navegador e armazena dados básicos.
      Ele é útil para estudo, protótipos ou aplicações locais.

      Atenção:
      Não use apenas esta validação client-side para proteger dados sensíveis.
    */

    const usuario = decodificarJwt(idToken);

    if (!usuario) {
      throw new Error("Não foi possível ler os dados do usuário.");
    }

    const dadosUsuario = {
      id: usuario.sub,
      nome: usuario.name,
      email: usuario.email,
      foto: usuario.picture,
      emailVerificado: usuario.email_verified
    };

    /*
      Armazenamento simples da sessão no navegador.

      Para produção, prefira sessão HTTP-only via backend,
      pois tokens em localStorage/sessionStorage podem ser expostos
      em caso de XSS.
    */

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      autenticado: true,
      provider: "google",
      loginEm: new Date().toISOString()
    }));

    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(dadosUsuario));

    exibirMensagem("Login realizado com sucesso. Redirecionando...", "success");

    setTimeout(() => {
      window.location.href = APP_REDIRECT_URL;
    }, 800);
  } catch (erro) {
    console.error("Erro no login com Google:", erro);
    exibirMensagem(
      "Não foi possível concluir o login. Tente novamente.",
      "error"
    );
  }
}

/* =========================================================
   INICIALIZAÇÃO DO GOOGLE IDENTITY SERVICES
   ========================================================= */

function inicializarGoogleLogin() {
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    exibirMensagem(
      "SDK do Google ainda não foi carregado. Atualize a página.",
      "error"
    );
    return;
  }

  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "SEU_CLIENT_ID_AQUI") {
    exibirMensagem(
      "Configure o Client ID do Google no arquivo login.js.",
      "error"
    );
    return;
  }

  /*
    Inicializa o serviço de autenticação do Google.
  */

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: tratarRespostaGoogle,
    auto_select: false,
    cancel_on_tap_outside: true
  });

  /*
    Renderiza o botão oficial do Google.

    O botão oficial já segue as diretrizes visuais do Google,
    incluindo logotipo, espaçamento e acessibilidade.
  */

  google.accounts.id.renderButton(
    document.getElementById("googleLoginButton"),
    {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill",
      logo_alignment: "left",
      width: 300
    }
  );

  /*
    Opcional:
    Exibe One Tap Login se o navegador/conta permitir.
  */

  google.accounts.id.prompt();
}

/* =========================================================
   EVENTO DE CARREGAMENTO
   ========================================================= */

window.addEventListener("load", inicializarGoogleLogin);


const GOOGLE_CLIENT_ID = "880622662988-vrft9suiga7th2n26o10ojkkgr2n7dsu.apps.googleusercontent.com";

const tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: GOOGLE_CLIENT_ID,
  scope: "https://www.googleapis.com/auth/calendar.readonly",
  callback: (tokenResponse) => {
    console.log("Access Token:", tokenResponse.access_token);
  }
});

tokenClient.requestAccessToken();


