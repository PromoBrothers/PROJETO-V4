// /mercado_livre_scraper/app/static/script.js

let supabaseClient = null;
let supabaseInitialized = false;

// Função para mostrar alertas visuais
function showAlert(message, type = 'info') {
  // Remove alertas anteriores
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  // Cria o elemento do alerta
  const alert = document.createElement('div');
  alert.className = `custom-alert custom-alert-${type}`;
  
  // Define cores baseadas no tipo
  const colors = {
    'success': { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
    'error': { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
    'warning': { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
    'info': { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
  };
  
  const color = colors[type] || colors.info;
  
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: ${color.bg};
    border: 1px solid ${color.border};
    color: ${color.text};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 400px;
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    line-height: 1.4;
    transition: all 0.3s ease;
    cursor: pointer;
  `;
  
  alert.textContent = message;
  document.body.appendChild(alert);
  
  // Remove o alerta ao clicar ou após 5 segundos
  alert.addEventListener('click', () => alert.remove());
  setTimeout(() => {
    if (alert.parentNode) {
      alert.style.opacity = '0';
      alert.style.transform = 'translateX(100%)';
      setTimeout(() => alert.remove(), 300);
    }
  }, 5000);
  
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function initializeSupabase() {
  try {
    const supabaseUrl = localStorage.getItem('supabase_url') || 'https://cfacybymuscwcpgmbjkz.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYWN5YnltdXNjd2NwZ21iamt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1MzY4MSwiZXhwIjoyMDcxNTI5NjgxfQ.6IWnYtV1u0PpUVp72HPbKzel2VTuoLzVEz6IJuuThvs';
    
    if (typeof supabase !== 'undefined') {
      supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
      supabaseInitialized = true;
      console.log('✅ Supabase Client inicializado com sucesso');
    } else {
      console.warn('⚠️ Supabase JS não foi carregado');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Supabase Client:', error);
  }
}

async function downloadImageDirect(filePath, bucketName = null) {
  if (!supabaseInitialized || !supabaseClient) {
    console.log('📡 Fallback: usando API tradicional para imagem');
    return null;
  }

  try {
    const bucket = bucketName || bucketAtual;
    console.log(`🔄 Baixando imagem via Supabase JS: ${filePath} do bucket ${bucket}`);
    
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .download(filePath);
    
    if (error) {
      console.error('❌ Erro no download direto:', error.message);
      return null;
    }

    const url = URL.createObjectURL(data);
    console.log('✅ Imagem baixada via Supabase JS:', filePath);
    return url;
    
  } catch (error) {
    console.error('❌ Erro ao baixar imagem diretamente:', error.message);
    return null;
  }
}

async function listImagesDirect(bucketName = null, path = '', limit = 20, offset = 0) {
  if (!supabaseInitialized || !supabaseClient) {
    return null;
  }

  try {
    const bucket = bucketName || bucketAtual;
    console.log(`🔍 Listando imagens via Supabase JS do bucket: ${bucket}`);
    
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .list(path, {
        limit: limit,
        offset: offset,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) {
      console.error('❌ Erro ao listar imagens:', error.message);
      return null;
    }

    const imagens = data
      .filter(file => file.name && !file.name.endsWith('/'))
      .map(file => {
        const publicUrl = supabaseClient.storage
          .from(bucket)
          .getPublicUrl(path + file.name);
        
        return {
          nome: file.name,
          url: publicUrl.data.publicUrl,
          tamanho: file.metadata?.size || 0,
          caminho: path + file.name
        };
      });

    console.log(`✅ ${imagens.length} imagens listadas via Supabase JS`);
    return imagens;
    
  } catch (error) {
    console.error('❌ Erro ao listar imagens via Supabase JS:', error.message);
    return null;
  }
}

window.openAgendamentoForm = function (produtoId) {
  document.getElementById("agendarProdutoId").value = produtoId;
  document.getElementById("agendamentoModal").style.display = "block";
};

window.closeModal = function () {
  document.getElementById("agendamentoModal").style.display = "none";
};

window.openEditarForm = function (produtoId) {
  document.getElementById("editarProdutoId").value = produtoId;

  document.getElementById("editarImagemUrl").value = "";
  document.getElementById("editarMensagem").value = "";
  
  if (document.getElementById("cupomTexto")) {
    document.getElementById("cupomTexto").value = "";
    document.getElementById("cupomValor").value = "";
    document.getElementById("cupomLinkAfiliado").value = "";
    document.getElementById("cupomPreview").style.display = "none";
    document.getElementById("cupomTipo").value = "porcentagem";
    alterarTipoCupom();
  }

  updateImagePreview();

  fetch(`/produtos/${produtoId}`, { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const produto = data.produto;
        
        produtoAtualData = produto;
        
        document.getElementById("editarImagemUrl").value =
          produto.imagem_url || "";
        document.getElementById("editarMensagem").value =
          produto.final_message || "";

        updateImagePreview();
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar dados do produto:", error);
      produtoAtualData = null;
    });

  document.getElementById("editarModal").style.display = "block";
};

window.closeEditModal = function () {
  document.getElementById("editarModal").style.display = "none";
  produtoAtualData = null;
};

window.enviarProdutoAgendado = async function (produtoId) {
  if (
    !confirm(
      "Deseja enviar este produto para o webhook? Isso irá usar os dados editados (imagem e mensagem personalizadas)."
    )
  ) {
    return;
  }

  const loading = document.getElementById("loading");
  loading.style.display = "block";
  loading.querySelector("p").textContent = "Enviando produto para webhook...";

  try {
    const afiliadoLink = prompt("Cole o link de afiliado (opcional):");

    const response = await fetch(`/enviar_produto_agendado/${produtoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        afiliado_link: afiliadoLink || "",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert("Produto enviado com sucesso! ✅", "success");

      if (data.final_message) {
        displayWebhookResponse(data.final_message, 'success', data.image_url);
      }
    } else {
      showAlert(`Erro ao enviar: ${data.error}`, "error");
    }
  } catch (error) {
    console.error("Erro ao enviar produto:", error);
    showAlert("Erro de conexão ao enviar produto.", "error");
  } finally {
    loading.style.display = "none";
  }
};

function displayWebhookResponse(message, status, imageUrl, append = false) {
    const webhookMessageSection = document.getElementById("webhookMessageSection");
    const webhookMessageContent = document.getElementById("webhookMessageContent");
    if (!webhookMessageSection || !webhookMessageContent) return;

    let imageHtml = "";
    if (imageUrl && imageUrl.trim()) {
        imageHtml = `<div class="webhook-image"><img src="${imageUrl}" alt="Imagem do Produto"></div>`;
    }

    const isSuccess = status === 'success';
    const containerClass = isSuccess ? 'success' : 'error';
    const headerText = isSuccess ? '✅ Produto Processado com Sucesso' : '❌ Erro ao Processar';
    const statusText = isSuccess ? 'SUCCESS' : 'ERROR';

    const messageHtml = `
        <div class="webhook-message-container ${containerClass}" style="margin-bottom: 20px;">
            <div class="webhook-message-header">
                <h3>${headerText}</h3>
                <span class="status ${containerClass}">${statusText}</span>
            </div>
            ${imageHtml}
            <pre>${message}</pre>
        </div>
    `;

    if (append) {
        webhookMessageContent.insertAdjacentHTML('beforeend', messageHtml);
    } else {
        webhookMessageContent.innerHTML = messageHtml;
    }
    
    webhookMessageSection.style.display = "block";
    webhookMessageSection.scrollIntoView({ behavior: "smooth" });
}


window.updateImagePreview = function () {
  const imageUrl = document.getElementById("editarImagemUrl").value.trim();
  const imagePreview = document.getElementById("imagePreview");
  const placeholder = document.getElementById("imagePreviewPlaceholder");

  if (!imagePreview || !placeholder) return;

  if (imageUrl && isValidImageUrl(imageUrl)) {
    imagePreview.src = imageUrl;
    imagePreview.style.display = "block";
    placeholder.style.display = "none";

    imagePreview.onload = function () {
      imagePreview.style.display = "block";
      placeholder.style.display = "none";
    };

    imagePreview.onerror = function () {
      imagePreview.style.display = "none";
      placeholder.style.display = "block";
      placeholder.innerHTML = "❌ Erro ao carregar imagem";
    };
  } else {
    imagePreview.style.display = "none";
    placeholder.style.display = "block";
    if (imageUrl && !isValidImageUrl(imageUrl)) {
      placeholder.innerHTML = "⚠️ URL de imagem inválida";
    } else {
      placeholder.innerHTML = "📷 Nenhuma imagem para mostrar";
    }
  }
};

let produtoAtualData = null;

window.alterarTipoCupom = function () {
  const cupomTipo = document.getElementById("cupomTipo").value;
  const cupomValorLabel = document.getElementById("cupomValorLabel");
  const cupomValorInput = document.getElementById("cupomValor");

  if (cupomTipo === "porcentagem") {
    cupomValorLabel.textContent = "Desconto (%)";
    cupomValorInput.placeholder = "10";
    cupomValorInput.max = "99";
    cupomValorInput.step = "1";
  } else {
    cupomValorLabel.textContent = "Desconto (R$)";
    cupomValorInput.placeholder = "60.00";
    cupomValorInput.removeAttribute("max");
    cupomValorInput.step = "0.01";
  }
  
  cupomValorInput.value = "";
};

window.calcularDesconto = function () {
  const cupomTexto = document.getElementById("cupomTexto").value.trim();
  const cupomTipo = document.getElementById("cupomTipo").value;
  const cupomValor = parseFloat(document.getElementById("cupomValor").value);
  const cupomPreview = document.getElementById("cupomPreview");
  const cupomInfo = document.getElementById("cupomInfo");

  if (!cupomTexto || !cupomValor || cupomValor <= 0) {
    cupomPreview.style.display = "none";
    return;
  }

  if (cupomTipo === "porcentagem" && (cupomValor < 1 || cupomValor > 99)) {
    cupomPreview.style.display = "none";
    return;
  }

  if (produtoAtualData && produtoAtualData.preco_atual) {
    const precoOriginal = extrairValorNumerico(produtoAtualData.preco_atual);
    if (precoOriginal > 0) {
      let desconto, novoPreco, cupomDescricao;
      
      if (cupomTipo === "porcentagem") {
        desconto = (precoOriginal * cupomValor) / 100;
        cupomDescricao = `${cupomTexto} (-${cupomValor}%)`;
      } else {
        desconto = cupomValor;
        const valorFmt = cupomValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        cupomDescricao = `${cupomTexto} (-R$ ${valorFmt})`;
      }
      
      novoPreco = Math.max(0, precoOriginal - desconto);
      
      const precoOriginalFmt = precoOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const descontoFmt = desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const novoPrecoFmt = novoPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      cupomInfo.innerHTML = `
        <div style="display: grid; grid-template-columns: auto auto; gap: 12px; align-items: center;">
          <span>💰 Preço Original:</span>
          <span style="font-weight: 500;">R$ ${precoOriginalFmt}</span>
          <span>🎟️ Cupom:</span>
          <span style="font-weight: 500; color: #ff6b6b;">${cupomDescricao}</span>
          <span>💸 Desconto:</span>
          <span style="font-weight: 500; color: #28a745;">-R$ ${descontoFmt}</span>
          <span>🏷️ <strong>Preço Final:</strong></span>
          <span style="font-weight: 700; color: #007bff; font-size: 16px;">R$ ${novoPrecoFmt}</span>
        </div>
      `;
      cupomPreview.style.display = "block";
    } else {
      cupomPreview.style.display = "none";
    }
  } else {
    cupomInfo.innerHTML = `
      <div style="color: #666; font-style: italic;">
        ℹ️ Preview será calculado com base no preço do produto
      </div>
    `;
    cupomPreview.style.display = "block";
  }
};

window.aplicarCupom = function () {
  const cupomTexto = document.getElementById("cupomTexto").value.trim();
  const cupomTipo = document.getElementById("cupomTipo").value;
  const cupomValor = parseFloat(document.getElementById("cupomValor").value);
  const cupomLinkAfiliado = document.getElementById("cupomLinkAfiliado").value.trim();
  const mensagemTextarea = document.getElementById("editarMensagem");

  if (!cupomTexto || !cupomValor || cupomValor <= 0) {
    showAlert("Por favor, preencha o texto do cupom e um valor válido", "error");
    return;
  }

  if (cupomTipo === "porcentagem" && (cupomValor < 1 || cupomValor > 99)) {
    showAlert("Porcentagem deve estar entre 1% e 99%", "error");
    return;
  }

  if (!produtoAtualData) {
    showAlert("Erro: dados do produto não encontrados", "error");
    return;
  }

  const precoOriginal = extrairValorNumerico(produtoAtualData.preco_atual);
  if (precoOriginal <= 0) {
    showAlert("Erro: não foi possível extrair o preço do produto", "error");
    return;
  }

  let desconto, novoPreco;
  if (cupomTipo === "porcentagem") {
    desconto = (precoOriginal * cupomValor) / 100;
  } else {
    desconto = cupomValor;
  }
  
  novoPreco = Math.max(0, precoOriginal - desconto);
  const novoPrecoFormatado = `R$ ${novoPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const mensagemComCupom = construirMensagemComCupom(produtoAtualData, cupomTexto, cupomTipo, cupomValor, precoOriginal, novoPreco, desconto, cupomLinkAfiliado);
  
  mensagemTextarea.value = mensagemComCupom;
  
  produtoAtualData.cupom_aplicado = {
    texto: cupomTexto,
    tipo: cupomTipo,
    valor: cupomValor,
    preco_original: produtoAtualData.preco_atual,
    preco_novo: novoPrecoFormatado,
    desconto: desconto,
    link_afiliado: cupomLinkAfiliado
  };
  
  document.getElementById("cupomTexto").value = "";
  document.getElementById("cupomValor").value = "";
  document.getElementById("cupomLinkAfiliado").value = "";
  document.getElementById("cupomPreview").style.display = "none";
  document.getElementById("cupomTipo").value = "porcentagem";
  alterarTipoCupom();

  const tipoDescricao = cupomTipo === "porcentagem" ? `${cupomValor}%` : `R$ ${cupomValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  showAlert(`🎉 Cupom ${cupomTexto} (${tipoDescricao}) aplicado! Preço atualizado para ${novoPrecoFormatado}. Salve as alterações para confirmar.`, "success");
};

function extrairValorNumerico(precoTexto) {
  if (!precoTexto) return 0;
  
  const numeroLimpo = precoTexto.toString()
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/[^\d,.]/g, '');
  
  if (numeroLimpo.includes('.') && numeroLimpo.includes(',')) {
    const valor = parseFloat(numeroLimpo.replace(/\./g, '').replace(',', '.'));
    return isNaN(valor) ? 0 : valor;
  }
  
  if (numeroLimpo.includes(',') && !numeroLimpo.includes('.')) {
    const valor = parseFloat(numeroLimpo.replace(',', '.'));
    return isNaN(valor) ? 0 : valor;
  }
  
  if (numeroLimpo.includes('.')) {
    const partes = numeroLimpo.split('.');
    if (partes.length === 2 && partes[1].length <= 2) {
      const valor = parseFloat(numeroLimpo);
      return isNaN(valor) ? 0 : valor;
    } else {
      const valor = parseFloat(numeroLimpo.replace(/\./g, ''));
      return isNaN(valor) ? 0 : valor;
    }
  }
  
  const valor = parseFloat(numeroLimpo);
  return isNaN(valor) ? 0 : valor;
}

function construirMensagemComCupom(produto, cupomTexto, cupomTipo, cupomValor, precoOriginal, novoPreco, desconto, linkAfiliado) {
  const linkProduto = linkAfiliado || produto.afiliado_link || produto.link_produto || produto.link || 'Link não disponível';
  
  let descontoDescricao;
  if (cupomTipo === "porcentagem") {
    descontoDescricao = `🔥 *${cupomValor}% DE DESCONTO*`;
  } else {
    const valorFmt = cupomValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    descontoDescricao = `🔥 *R$ ${valorFmt} DE DESCONTO*`;
  }

  const precoOriginalFmt = precoOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const novoPrecoFmt = novoPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const descontoFmt = desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  return `🛒 *${produto.titulo}*

🔥 POR: *R$${novoPrecoFmt}*

🎟️ *CUPOM: ${cupomTexto}*
🛒 Link: ${linkProduto}

⚡ *Oferta por tempo limitado!*

👾 *Grupo de ofertas:* https://linktr.ee/promobrothers.shop `;

}

function isValidImageUrl(url) {
  try {
    new URL(url);
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
    const knownImageDomains = /(mlstatic\.com|imgur\.com|cloudinary\.com)/i;
    return (
      imageExtensions.test(url) ||
      knownImageDomains.test(url) ||
      url.includes("http")
    );
  } catch {
    return false;
  }
}

window.deletarAgendamento = async function (produtoId, buttonElement) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) {
    return;
  }

  const cardParaRemover = buttonElement.closest(".product-card");

  if (cardParaRemover) {
    cardParaRemover.style.transition = "opacity 0.3s ease-out";
    cardParaRemover.style.opacity = "0";
    setTimeout(() => cardParaRemover.remove(), 300);
  }

  try {
    const response = await fetch(`/produtos/${produtoId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      showAlert(data.message, "success");
    } else {
      showAlert(data.error || "Erro ao excluir o produto.", "error");
      loadAgendamentos();
    }
  } catch (error) {
    showAlert("Erro de conexão ao tentar excluir o produto.", "error");
    loadAgendamentos();
  }
};

function createAgendamentoCard(produto) {
    const card = document.createElement("div");
    card.className = "product-card";

    let dataInfo = produto.agendamento ? `Agendado para: <b>${produto.agendamento}</b>` : `Criado em: <b>${produto.created_at || "N/A"}</b>`;
    const imagemParaUsar = produto.imagem_url || produto.processed_image_url || "";
    const imagemComCache = imagemParaUsar ? `${imagemParaUsar}?t=${Date.now()}` : "";

    let platformBadge = '';
    if (produto.fonte) {
        platformBadge = `<div class="platform-badge" data-platform="${produto.fonte}">${produto.fonte}</div>`;
    }

    let precoFormatado = produto.preco_atual || '';
    if (precoFormatado && !precoFormatado.toString().includes('R$')) {
        precoFormatado = `R$ ${precoFormatado}`;
    }

    card.innerHTML = `
        <div class="product-header">
          <img src="${imagemComCache}" alt="${produto.titulo}" class="product-image">
          ${platformBadge}
          <div class="product-info">
            <div class="product-title">${produto.titulo}</div>
            <div class="product-price-atual">${precoFormatado}</div>
          </div>
        </div>
        <p>${dataInfo}</p>
        <div class="product-actions">
            <button class="btn btn-reagendar" onclick="openAgendamentoForm('${produto.id}')">${produto.agendamento ? 'Reagendar' : 'Agendar'}</button>
            <button class="btn btn-editar" onclick="openEditarForm('${produto.id}')">Editar</button>
            <button class="btn btn-excluir" onclick="deletarAgendamento('${produto.id}', this)">Excluir</button>
        </div>
      `;
    return card;
}

// Cache para otimização de carregamento
let lastLoadTime = 0;
let lastLoadedData = null;
const CACHE_DURATION = 5000; // 5 segundos de cache

async function loadAgendamentos(forceRefresh = false) {
  const agendamentoList = document.getElementById("agendamento-list");
  if (!agendamentoList) return;

  const status = document.getElementById("filtroStatus").value;
  const ordem = document.getElementById("filtroOrdem").value;

  // 🔥 OTIMIZAÇÃO: Usar cache se não forçar refresh e cache ainda válido
  const now = Date.now();
  if (!forceRefresh && lastLoadedData && (now - lastLoadTime) < CACHE_DURATION) {
    console.log('✅ Usando cache de produtos (mais rápido)');
    renderProducts(lastLoadedData.produtos);
    return;
  }

  // Mostrar indicador de carregamento suave
  if (!agendamentoList.querySelector('.loading-indicator')) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.innerHTML = '<p style="color: #667eea; text-align: center;">⏳ Carregando produtos...</p>';
    agendamentoList.innerHTML = '';
    agendamentoList.appendChild(loadingDiv);
  }

  try {
    const startTime = performance.now();
    const response = await fetch(`/produtos?status=${status}&ordem=${ordem}`);
    const data = await response.json();
    const loadTime = (performance.now() - startTime).toFixed(0);

    console.log(`📊 Produtos carregados em ${loadTime}ms`);

    if (data.success) {
      // Atualizar cache
      lastLoadedData = data;
      lastLoadTime = Date.now();

      renderProducts(data.produtos);
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error("Erro ao carregar agendamentos:", error);
    agendamentoList.innerHTML = `<p style="color: #e74c3c;">Erro ao carregar produtos: ${error.message}</p>`;
  }
}

// Função auxiliar para renderizar produtos
function renderProducts(produtos) {
  const agendamentoList = document.getElementById("agendamento-list");
  if (!agendamentoList) return;

  if (produtos.length > 0) {
    agendamentoList.innerHTML = "";
    // Usar DocumentFragment para performance
    const fragment = document.createDocumentFragment();
    produtos.forEach((produto) => {
      const card = createAgendamentoCard(produto);
      fragment.appendChild(card);
    });
    agendamentoList.appendChild(fragment);
  } else {
    agendamentoList.innerHTML = "<p>Nenhum produto encontrado com os filtros selecionados.</p>";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initializeSupabase();
  
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme") || "light";
  
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }
  
  themeToggle.addEventListener("click", function() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    
    themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
    
    showAlert(
      `Modo ${newTheme === "dark" ? "escuro" : "claro"} ativado!`,
      "info"
    );
  });

  const searchForm = document.getElementById("searchForm");
  const linkForm = document.getElementById("linkForm");
  const webhookForm = document.getElementById("webhookForm");
  const loading = document.getElementById("loading");
  const resultsSection = document.getElementById("resultsSection");
  const produtoSection = document.getElementById("produtoSection");
  const productsGrid = document.getElementById("productsGrid");
  const produtoDetalhado = document.getElementById("produtoDetalhado");
  const resultsCount = document.getElementById("resultsCount");
  const clearBtn = document.getElementById("clearBtn");
  const clearProdutoBtn = document.getElementById("clearProdutoBtn");
  const webhookMessageSection = document.getElementById(
    "webhookMessageSection"
  );
  const webhookMessageContent = document.getElementById(
    "webhookMessageContent"
  );
  const clearWebhookBtn = document.getElementById("clearWebhookBtn");
  const searchBtn = document.getElementById("searchBtn");
  const linkBtn = document.getElementById("linkBtn");
  const webhookBtn = document.getElementById("webhookBtn");
  const editarForm = document.getElementById("editarForm");

  let productQueue = [];
  
  const inputMethods = document.querySelectorAll('.input-method');
  const inputContents = document.querySelectorAll('.input-content');
  const addProductBtn = document.getElementById('addProductBtn');
  const productUrlInput = document.getElementById('productUrl');
  const queueList = document.getElementById('queueList');
  const queueCount = document.querySelector('.queue-count');
  const processCount = document.getElementById('processCount');
  const clearQueueBtn = document.getElementById('clearQueueBtn');
  const importFromBulkBtn = document.getElementById('importFromBulkBtn');

  const clearWebhookTextareaBtn = document.getElementById(
    "clearWebhookTextareaBtn"
  );
  const webhookUrlsTextarea = document.getElementById("webhookUrls");

  if(clearWebhookTextareaBtn) {
    clearWebhookTextareaBtn.addEventListener("click", function () {
        webhookUrlsTextarea.value = "";
        webhookUrlsTextarea.focus();
    });
  }

  if(inputMethods.length > 0) {
    inputMethods.forEach(method => {
        method.addEventListener('click', () => {
        const methodType = method.dataset.method;
        
        inputMethods.forEach(m => m.classList.remove('active'));
        inputContents.forEach(c => c.classList.remove('active'));
        
        method.classList.add('active');
        document.querySelector(`.${methodType}-mode`).classList.add('active');
        });
    });
  }

  if(addProductBtn) {
    addProductBtn.addEventListener('click', () => {
        const productUrl = productUrlInput.value.trim();

        if (!productUrl) {
        showAlert('Por favor, insira um link de produto ou link de afiliado', 'error');
        return;
        }

        if (!productUrl.includes('mercadolivre.com') && !productUrl.includes('mercadolibre.com')) {
        showAlert('Por favor, use um link válido do Mercado Livre', 'error');
        return;
        }

        const exists = productQueue.some(item => item.productUrl === productUrl);
        if (exists) {
        showAlert('Este produto já está na fila', 'warning');
        return;
        }

        productQueue.push({
        id: Date.now(),
        productUrl: productUrl,
        addedAt: new Date().toLocaleTimeString()
        });

        updateQueueDisplay();

        productUrlInput.value = '';
        productUrlInput.focus();

        showAlert('Produto adicionado à fila!', 'success');
    });
  }

  if(importFromBulkBtn) {
    importFromBulkBtn.addEventListener('click', () => {
        const urlsText = webhookUrlsTextarea.value.trim();
        const lines = urlsText.split('\n').filter(line => line.trim() !== '');

        if (lines.length === 0) {
        showAlert('Nenhum link encontrado para importar', 'error');
        return;
        }

        let imported = 0;
        lines.forEach(line => {
        const productUrl = line.trim();

        if (productUrl && (productUrl.includes('mercadolivre.com') || productUrl.includes('mercadolibre.com'))) {
            const exists = productQueue.some(item => item.productUrl === productUrl);
            if (!exists) {
            productQueue.push({
                id: Date.now() + imported,
                productUrl: productUrl,
                addedAt: new Date().toLocaleTimeString()
            });
            imported++;
            }
        }
        });

        updateQueueDisplay();

        if (imported > 0) {
        showAlert(`${imported} produtos importados para a fila!`, 'success');
        document.querySelector('[data-method="visual"]').click();
        } else {
        showAlert('Nenhum produto válido foi importado', 'warning');
        }
    });
  }
  
  if(clearQueueBtn) {
    clearQueueBtn.addEventListener('click', () => {
        if (productQueue.length === 0) return;
        
        if (confirm('Deseja limpar toda a fila de produtos?')) {
        productQueue = [];
        updateQueueDisplay();
        showAlert('Fila limpa!', 'info');
        }
    });
  }

  function updateQueueDisplay() {
    if(!queueList) return;
    queueCount.textContent = `(${productQueue.length})`;
    processCount.textContent = productQueue.length;

    if (productQueue.length === 0) {
      queueList.innerHTML = `
        <div class="queue-empty">
          <span class="empty-icon">📦</span>
          <p>Nenhum produto na fila</p>
          <small>Adicione produtos usando o formulário acima</small>
        </div>
      `;
      return;
    }

    queueList.innerHTML = productQueue.map(item => `
      <div class="queue-item" data-id="${item.id}">
        <div class="queue-item-icon">🛒</div>
        <div class="queue-item-content">
          <div class="queue-item-title">
            ${item.productUrl.length > 60 ? item.productUrl.substring(0, 60) + '...' : item.productUrl}
          </div>
          <div class="queue-item-subtitle">
            Adicionado às ${item.addedAt}
          </div>
        </div>
        <div class="queue-item-actions">
          <button class="remove-item-btn" onclick="removeFromQueue(${item.id})">
            🗑️ Remover
          </button>
        </div>
      </div>
    `).join('');
  }

  window.removeFromQueue = function(id) {
    productQueue = productQueue.filter(item => item.id !== id);
    updateQueueDisplay();
    showAlert('Produto removido da fila', 'info');
  };

  if(queueList) {
    updateQueueDisplay();
  }

  const filtroAgendamentoForm = document.getElementById(
    "filtroAgendamentoForm"
  );
  const aplicarFiltroBtn = document.getElementById("aplicarFiltroBtn");

  window.showTab = function (tabName, element) {
    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.remove("active");
    });
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    document.getElementById("tab-" + tabName).classList.add("active");
    element.classList.add("active");

    if (resultsSection) resultsSection.style.display = "none";
    if (produtoSection) produtoSection.style.display = "none";
    if (webhookMessageSection) webhookMessageSection.style.display = "none";
    if (loading) loading.style.display = "none";

    if (tabName === "agendamento") {
      loadAgendamentos();
    }
  };

  if(searchForm) {
    searchForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const produto = document.getElementById("produto").value.trim();
        const maxPages = parseInt(document.getElementById("maxPages").value);

        if (!produto) {
        showAlert("Por favor, digite um produto para buscar", "error");
        return;
        }

        loading.style.display = "block";
        loading.querySelector("p").textContent =
        "Buscando produtos no Mercado Livre...";
        resultsSection.style.display = "none";
        produtoSection.style.display = "none";
        webhookMessageSection.style.display = "none";
        searchBtn.disabled = true;

        try {
        const response = await fetch("/buscar", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            produto: produto,
            max_pages: maxPages,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.success) {
            displayResults(data.resultados, data.total);
        } else {
            showAlert(data.error || "Erro desconhecido", "error");
        }
        } catch (error) {
        console.error("Erro detalhado:", error);
        showAlert("Erro de conexão: " + error.message, "error");
        } finally {
        loading.style.display = "none";
        searchBtn.disabled = false;
        }
    });
  }

  if(linkForm) {
    linkForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const url = document.getElementById("produtoUrl").value.trim();

        if (!url) {
        showAlert("Por favor, cole o link do produto", "error");
        return;
        }

        if (
        !url.includes("mercadolivre.com") &&
        !url.includes("mercadolibre.com")
        ) {
        showAlert("Por favor, use um link válido do Mercado Livre", "error");
        return;
        }

        loading.style.display = "block";
        loading.querySelector("p").textContent = "Analisando o produto...";
        resultsSection.style.display = "none";
        produtoSection.style.display = "none";
        webhookMessageSection.style.display = "none";
        linkBtn.disabled = true;

        try {
        const response = await fetch("/produto", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            url: url,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.success) {
            displayProdutoDetalhado(data.produto);
        } else {
            showAlert(data.error || "Erro desconhecido", "error");
        }
        } catch (error) {
        console.error("Erro detalhado:", error);
        showAlert("Erro de conexão: " + error.message, "error");
        } finally {
        loading.style.display = "none";
        linkBtn.disabled = false;
        }
    });
  }

  if(webhookForm) {
    webhookForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        let itemsToProcess = [];

        if (productQueue.length > 0) {
        itemsToProcess = productQueue.map(item => ({
            productUrl: item.productUrl,
            affiliateLink: ''
        }));
        } else {
        const urlsText = document.getElementById("webhookUrls").value.trim();
        const lines = urlsText.split("\n").filter((line) => line.trim() !== "");

        if (lines.length === 0) {
            showAlert("Por favor, adicione produtos à fila ou cole links no modo massa", "error");
            return;
        }

        itemsToProcess = lines.map(line => {
            return {
            productUrl: line.trim(),
            affiliateLink: ''
            };
        });
        }

        loading.style.display = "block";
        webhookMessageSection.style.display = "none";
        webhookBtn.disabled = true;

        webhookMessageContent.innerHTML = "";
        webhookMessageSection.style.display = "block";

        for (let i = 0; i < itemsToProcess.length; i++) {
        const { productUrl, affiliateLink } = itemsToProcess[i];

        loading.querySelector("p").textContent = `Processando ${i + 1} de ${
            itemsToProcess.length
        }: ${productUrl.substring(0, 50)}...`;

        if (
            !productUrl.includes("mercadolivre.com") &&
            !productUrl.includes("mercadolibre.com")
        ) {
            displayWebhookResponse(
            `Item ${i + 1}: Link de produto inválido.`,
            "error",
            null,
            true
            );
            continue;
        }

        try {
            const produtoResponse = await fetch("/produto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: productUrl }),
            });

            if (!produtoResponse.ok)
            throw new Error(`Falha ao buscar dados do produto`);

            const produtoData = await produtoResponse.json();
            const produto = produtoData.produto;

            if (!produto) throw new Error(`Não foi possível extrair dados`);

            const payload = {
            type: "produto",
            produto: produto,
            afiliado_link: affiliateLink,
            };

            const finalResponse = await fetch("/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            });

            const finalResult = await finalResponse.json();

            if (finalResponse.ok) {
            // --- CORREÇÃO APLICADA AQUI ---
            displayWebhookResponse(
                finalResult.final_message || "Sucesso!",
                "success",
                finalResult.image_url || produto.imagem,
                true
            );
            } else {
            // --- CORREÇÃO APLICADA AQUI ---
            displayWebhookResponse(
                finalResult.error || "Erro no webhook",
                "error",
                finalResult.image_url || produto.imagem,
                true
            );
            }
        } catch (error) {
            console.error("Erro no processo do webhook:", error);
            // --- CORREÇÃO APLICADA AQUI ---
            displayWebhookResponse(
            `Erro ao processar ${productUrl}: ${error.message}`,
            "error",
            null,
            true
            );
        }
        }

        if (productQueue.length > 0) {
        const processedCount = productQueue.length;
        productQueue = [];
        updateQueueDisplay();
        showAlert(`✅ ${processedCount} produto${processedCount > 1 ? 's processados' : ' processado'} com sucesso!`, "success");
        }

        loading.querySelector("p").textContent = "Processamento finalizado!";
        webhookBtn.disabled = false;
        
        setTimeout(() => {
        loading.style.display = "none";
        }, 2000);
    });
  }
    
    if (document.getElementById('amazonSearchForm')) {
        let amazonProductQueue = [];

        const amazonAddProductBtn = document.getElementById('amazonAddProductBtn');
        const amazonClearQueueBtn = document.getElementById('amazonClearQueueBtn');
        const amazonWebhookForm = document.getElementById('amazonWebhookForm');

        function adicionarProdutoFilaAmazon() {
            const productUrlInput = document.getElementById('amazonProductUrlQueue');
            const affiliateUrlInput = document.getElementById('amazonAffiliateUrlQueue');
            if (!productUrlInput || !affiliateUrlInput) return;

            const productUrl = productUrlInput.value.trim();
            const affiliateUrl = affiliateUrlInput.value.trim();

            if (!productUrl) {
                showAlert('Por favor, adicione o link do produto da Amazon', 'error');
                return;
            }
            if (!productUrl.includes('amazon.com') && !productUrl.includes('amzn.to')) {
                showAlert('Por favor, adicione um link válido da Amazon', 'error');
                return;
            }
            if (amazonProductQueue.some(p => p.productUrl === productUrl)) {
                showAlert('Este produto já está na fila', 'warning');
                return;
            }

            amazonProductQueue.push({
                id: Date.now(),
                productUrl: productUrl,
                affiliateUrl: affiliateUrl,
                addedAt: new Date().toLocaleTimeString()
            });
            
            atualizarFilaVisualAmazon();
            productUrlInput.value = '';
            affiliateUrlInput.value = '';
            productUrlInput.focus();
            showAlert('Produto da Amazon adicionado à fila!', 'success');
        }

        function atualizarFilaVisualAmazon() {
            const queueList = document.getElementById('amazonQueueList');
            const queueCount = document.getElementById('amazonQueueCount');
            const processCount = document.getElementById('amazonProcessCount');
            if (!queueList || !queueCount || !processCount) return;
            
            queueCount.textContent = `(${amazonProductQueue.length})`;
            processCount.textContent = amazonProductQueue.length;

            if (amazonProductQueue.length === 0) {
                queueList.innerHTML = `<div class="queue-empty"><span class="empty-icon">📦</span><p>Nenhum produto na fila</p><small>Adicione produtos da Amazon acima</small></div>`;
            } else {
                queueList.innerHTML = amazonProductQueue.map(item => `
                <div class="queue-item" data-id="${item.id}">
                    <div class="queue-item-icon">📦</div>
                    <div class="queue-item-content">
                    <div class="queue-item-title">${item.productUrl.length > 60 ? item.productUrl.substring(0, 60) + '...' : item.productUrl}</div>
                    <div class="queue-item-subtitle">${item.affiliateUrl ? `Afiliado: ${item.affiliateUrl.length > 40 ? item.affiliateUrl.substring(0, 40) + '...' : item.affiliateUrl}` : 'Sem link de afiliado'} • ${item.addedAt}</div>
                    </div>
                    <div class="queue-item-actions">
                    <button class="remove-item-btn" onclick="removerProdutoFilaAmazon(${item.id})">🗑️ Remover</button>
                    </div>
                </div>
                `).join('');
            }
        }

        window.removerProdutoFilaAmazon = function(id) {
            amazonProductQueue = amazonProductQueue.filter(item => item.id !== id);
            atualizarFilaVisualAmazon();
            showAlert('Produto removido da fila', 'info');
        };

        function limparFilaAmazon() {
            if (amazonProductQueue.length > 0 && confirm('Deseja limpar toda a fila de produtos da Amazon?')) {
                amazonProductQueue = [];
                atualizarFilaVisualAmazon();
                showAlert('Fila da Amazon limpa!', 'info');
            }
        }

        async function processarFilaAmazon() {
            if (amazonProductQueue.length === 0) {
                showAlert("Adicione produtos da Amazon à fila antes de processar.", "error");
                return;
            }

            const webhookBtn = document.getElementById('amazonWebhookBtn');
            const loading = document.getElementById('loading');
            const webhookMessageSection = document.getElementById('webhookMessageSection');
            const webhookMessageContent = document.getElementById('webhookMessageContent');

            webhookBtn.disabled = true;
            loading.style.display = "block";
            webhookMessageContent.innerHTML = "";
            webhookMessageSection.style.display = "block";

            for (let i = 0; i < amazonProductQueue.length; i++) {
                const produto = amazonProductQueue[i];
                loading.querySelector("p").textContent = `Processando Amazon ${i + 1} de ${amazonProductQueue.length}...`;

                try {
                    const response = await fetch('/webhook/processar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            url_produto: produto.productUrl,
                            afiliado_link: produto.affiliateUrl
                        })
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Erro desconhecido no servidor.');

                    displayWebhookResponse(data.final_message, 'success', data.image_url, true);

                } catch (error) {
                    console.error("Erro ao processar produto da Amazon:", error);
                    displayWebhookResponse(`Erro ao processar ${produto.productUrl}: ${error.message}`, 'error', null, true);
                }
            }

            amazonProductQueue = [];
            atualizarFilaVisualAmazon();
            loading.style.display = "none";
            webhookBtn.disabled = false;
            showAlert('Processamento da fila da Amazon concluído!', 'success');
        }
        
        if (amazonAddProductBtn) amazonAddProductBtn.addEventListener('click', adicionarProdutoFilaAmazon);
        if (amazonClearQueueBtn) amazonClearQueueBtn.addEventListener('click', limparFilaAmazon);
        if (amazonWebhookForm) amazonWebhookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processarFilaAmazon();
        });

        atualizarFilaVisualAmazon();
    }
  
  const filtroStatus = document.getElementById("filtroStatus");
  const filtroOrdem = document.getElementById("filtroOrdem");

  if (filtroStatus && filtroOrdem) {
    // Forçar refresh ao mudar filtros (invalidar cache)
    filtroStatus.addEventListener("change", () => {
      lastLoadTime = 0; // Invalidar cache
      loadAgendamentos(true);
    });
    filtroOrdem.addEventListener("change", () => {
      lastLoadTime = 0; // Invalidar cache
      loadAgendamentos(true);
    });
  }

  if (editarForm) {
      editarForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const produtoId = document.getElementById('editarProdutoId').value;
        const imagemUrl = document.getElementById('editarImagemUrl').value.trim();
        const mensagem = document.getElementById('editarMensagem').value.trim();

        // Validação básica
        if (!produtoId) {
            showAlert('Erro: ID do produto não encontrado.', 'error');
            return;
        }

        const dadosParaAtualizar = {};
        
        // Só adiciona campos que não estão vazios
        if (imagemUrl) {
            dadosParaAtualizar.imagem_url = imagemUrl;
        }
        if (mensagem) {
            dadosParaAtualizar.final_message = mensagem;
        }

        // Verifica se há pelo menos um campo para atualizar
        if (Object.keys(dadosParaAtualizar).length === 0) {
            showAlert('Por favor, preencha pelo menos um campo para atualizar.', 'error');
            return;
        }

        try {
            console.log('Enviando dados para atualização:', dadosParaAtualizar);
            
            const response = await fetch(`/produtos/${produtoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaAtualizar)
            });

            const data = await response.json();
            console.log('Resposta do servidor:', data);

            if (response.ok) {
                showAlert('Produto atualizado com sucesso!', 'success');
                closeEditModal();
                loadAgendamentos(); 
            } else {
                throw new Error(data.error || 'Erro ao atualizar produto.');
            }
        } catch (error) {
            console.error('Erro ao editar produto:', error);
            showAlert(`Erro ao salvar alterações: ${error.message}`, 'error');
        }
    });
  }
  
  const agendamentoForm = document.getElementById('agendamentoForm');
  if (agendamentoForm) {
      agendamentoForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const produtoId = document.getElementById('agendarProdutoId').value;
          const data = document.getElementById('agendarData').value;
          const hora = document.getElementById('agendarHora').value;

          if (!data || !hora) {
              showAlert('Por favor, preencha a data e a hora.', 'error');
              return;
          }

          const agendamentoISO = `${data}T${hora}`;

          try {
              const response = await fetch(`/agendar_produto/${produtoId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ agendamento: agendamentoISO })
              });

              const result = await response.json();

              if (response.ok) {
                  showAlert('Produto agendado com sucesso!', 'success');
                  closeModal();
                  loadAgendamentos(); 
              } else {
                  throw new Error(result.error || 'Erro ao agendar produto.');
              }
          } catch (error) {
              showAlert(error.message, 'error');
          }
      });
  }
  
  // Adiciona funções que estavam faltando
  window.displayResults = function(resultados, total) {
    const resultsSection = document.getElementById("resultsSection");
    const productsGrid = document.getElementById("productsGrid");
    const resultsCount = document.getElementById("resultsCount");
    
    if (!resultsSection || !productsGrid || !resultsCount) {
      console.error('Elementos necessários não encontrados para displayResults');
      return;
    }
    
    resultsCount.textContent = `${total} produto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;
    
    productsGrid.innerHTML = '';
    
    if (resultados && resultados.length > 0) {
      resultados.forEach(produto => {
        const card = createProductCard(produto);
        productsGrid.appendChild(card);
      });
    } else {
      productsGrid.innerHTML = '<p>Nenhum produto encontrado.</p>';
    }
    
    resultsSection.style.display = "block";
    resultsSection.scrollIntoView({ behavior: "smooth" });
  };
  
  window.displayProdutoDetalhado = function(produto) {
    const produtoSection = document.getElementById("produtoSection");
    const produtoDetalhado = document.getElementById("produtoDetalhado");
    
    if (!produtoSection || !produtoDetalhado) {
      console.error('Elementos necessários não encontrados para displayProdutoDetalhado');
      return;
    }
    
    produtoDetalhado.innerHTML = '';
    const card = createProductCard(produto, true);
    produtoDetalhado.appendChild(card);
    
    produtoSection.style.display = "block";
    produtoSection.scrollIntoView({ behavior: "smooth" });
  };
  
  function createProductCard(produto, isDetailed = false) {
    const card = document.createElement("div");
    card.className = "product-card";
    
    const imageUrl = produto.imagem || produto.imagem_url || '';
    const title = produto.titulo || 'Título não disponível';
    const currentPrice = produto.preco_atual || 'Preço não disponível';
    const originalPrice = produto.preco_original || '';
    const discount = produto.desconto || '';
    const link = produto.link || produto.link_produto || '#';
    
    let priceHtml = `<div class="product-price-atual">${currentPrice}</div>`;
    
    if (originalPrice && originalPrice !== currentPrice) {
      priceHtml = `
        <div class="product-price-original">${originalPrice}</div>
        <div class="product-price-atual">${currentPrice}</div>
      `;
    }
    
    if (discount) {
      priceHtml += `<div class="product-discount">${discount}% OFF</div>`;
    }
    
    card.innerHTML = `
      <div class="product-header">
        ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="product-image" onerror="this.style.display='none'">` : ''}
        <div class="product-info">
          <div class="product-title">${title}</div>
          ${priceHtml}
        </div>
      </div>
      <div class="product-actions">
        <a href="${link}" target="_blank" class="btn-link">Ver Produto</a>
        ${isDetailed ? '' : `<button class="btn" onclick="enviarParaWebhook('${JSON.stringify(produto).replace(/'/g, "\\'")}')">Enviar Webhook</button>`}
      </div>
    `;
    
    return card;
  }
  
  window.enviarParaWebhook = function(produtoJson) {
    try {
      const produto = JSON.parse(produtoJson);
      console.log('Enviando produto para webhook:', produto);
      // Implementar lógica de envio para webhook aqui
      showAlert('Funcionalidade de webhook será implementada em breve', 'info');
    } catch (error) {
      console.error('Erro ao processar produto para webhook:', error);
      showAlert('Erro ao processar produto', 'error');
    }
  };
  
  // Funções de configuração
  window.trocarBucketConfig = function() {
    const bucketSelector = document.getElementById('bucketSelector');
    const bucketAtualInfo = document.getElementById('bucketAtualInfo');
    
    if (bucketSelector && bucketAtualInfo) {
      const selectedBucket = bucketSelector.value;
      bucketAtualInfo.textContent = selectedBucket;
      localStorage.setItem('selected_bucket', selectedBucket);
      showAlert(`Bucket selecionado: ${selectedBucket}`, 'info');
    }
  };
  
  window.salvarConfiguracoes = function() {
    const supabaseUrl = document.getElementById('supabaseUrl');
    const bucketSelector = document.getElementById('bucketSelector');
    
    if (supabaseUrl && bucketSelector) {
      const url = supabaseUrl.value.trim();
      const bucket = bucketSelector.value;
      
      if (url) {
        localStorage.setItem('supabase_url', url);
      }
      localStorage.setItem('selected_bucket', bucket);
      
      showAlert('Configurações salvas com sucesso!', 'success');
      
      // Reinicializa o Supabase client se a URL mudou
      if (url) {
        initializeSupabase();
      }
    } else {
      showAlert('Erro ao salvar configurações', 'error');
    }
  };
  
  window.testarConexao = function() {
    const configStatus = document.getElementById('configStatus');
    
    if (!configStatus) return;
    
    configStatus.style.display = 'block';
    configStatus.style.backgroundColor = '#fff3cd';
    configStatus.style.borderColor = '#ffeaa7';
    configStatus.style.color = '#856404';
    configStatus.textContent = 'Testando conexão...';
    
    // Simula teste de conexão
    setTimeout(() => {
      if (supabaseInitialized) {
        configStatus.style.backgroundColor = '#d4edda';
        configStatus.style.borderColor = '#c3e6cb';
        configStatus.style.color = '#155724';
        configStatus.textContent = '✅ Conexão com Supabase bem-sucedida!';
        showAlert('Conexão testada com sucesso!', 'success');
      } else {
        configStatus.style.backgroundColor = '#f8d7da';
        configStatus.style.borderColor = '#f5c6cb';
        configStatus.style.color = '#721c24';
        configStatus.textContent = '❌ Erro na conexão com Supabase';
        showAlert('Erro na conexão. Verifique as configurações.', 'error');
      }
    }, 2000);
  };
  
  // Bucket atual
  let bucketAtual = localStorage.getItem('selected_bucket') || 'imagens_melhoradas_tech';
  
  // Funções do seletor de imagens
  window.abrirSeletorImagens = function() {
    const modal = document.getElementById('seletorImagensModal');
    if (modal) {
      modal.style.display = 'block';
      const bucketAtivo = document.getElementById('modalBucketAtivo');
      if (bucketAtivo) {
        bucketAtivo.textContent = bucketAtual;
      }
    }
  };
  
  window.fecharSeletorImagens = function() {
    const modal = document.getElementById('seletorImagensModal');
    if (modal) {
      modal.style.display = 'none';
    }
  };
  
  window.carregarImagens = function() {
    const loadingImagens = document.getElementById('loadingImagens');
    const imagensGrid = document.getElementById('imagensGrid');
    
    if (!loadingImagens || !imagensGrid) {
      showAlert('Elementos do modal não encontrados', 'error');
      return;
    }
    
    loadingImagens.style.display = 'block';
    imagensGrid.innerHTML = '';
    
    // Simula carregamento de imagens
    setTimeout(() => {
      loadingImagens.style.display = 'none';
      imagensGrid.innerHTML = `
        <p style="text-align: center; color: #666; margin: 40px;">
          🔧 Funcionalidade de carregamento de imagens será implementada em breve.<br>
          Por enquanto, cole o link da imagem diretamente no campo acima.
        </p>
      `;
      showAlert('Funcionalidade em desenvolvimento', 'info');
    }, 1000);
  };
  
  window.trocarBucket = function() {
    const bucketSelect = document.getElementById('bucketSelect');
    if (bucketSelect) {
      bucketAtual = bucketSelect.value;
      localStorage.setItem('selected_bucket', bucketAtual);
      showAlert(`Bucket alterado para: ${bucketAtual}`, 'info');
      carregarImagens();
    }
  };
  
  window.buscarImagens = function() {
    const searchImagens = document.getElementById('searchImagens');
    if (searchImagens) {
      const termo = searchImagens.value.trim();
      showAlert(termo ? `Buscando por: ${termo}` : 'Carregando todas as imagens', 'info');
      carregarImagens();
    }
  };
  
  window.paginaAnterior = function() {
    showAlert('Página anterior - funcionalidade em desenvolvimento', 'info');
  };
  
  window.proximaPagina = function() {
    showAlert('Próxima página - funcionalidade em desenvolvimento', 'info');
  };

  // 🔥 LISTENER PARA ATUALIZAÇÃO AUTOMÁTICA QUANDO PRODUTO FOR APROVADO
  window.addEventListener('message', (event) => {
    // Verificar se é uma mensagem de aprovação de produto
    if (event.data && event.data.type === 'PRODUTO_APROVADO') {
      console.log('✅ Produto aprovado detectado! Atualizando lista...', event.data);

      // Se estiver na aba de agendamento, atualizar imediatamente
      const agendamentoTab = document.getElementById('agendamento');
      if (agendamentoTab && agendamentoTab.style.display !== 'none') {
        console.log('🔄 Atualizando lista de agendamentos...');
        loadAgendamentos(true); // Forçar refresh do servidor
        showAlert('✅ Novo produto aprovado adicionado à lista!', 'success');
      } else {
        console.log('ℹ️ Aguardando usuário abrir aba de agendamento');
        // Marcar que há atualização pendente
        window.pendingProductUpdate = true;
      }
    }
  });

  // 🔥 AUTO-REFRESH QUANDO ABRIR A ABA DE AGENDAMENTO
  const originalOpenTab = window.openTab;
  window.openTab = function(evt, tabName) {
    originalOpenTab(evt, tabName);

    // Se abriu a aba de agendamento e há atualização pendente
    if (tabName === 'agendamento') {
      if (window.pendingProductUpdate) {
        console.log('🔄 Atualizando lista com produtos pendentes...');
        loadAgendamentos(true); // Forçar refresh do servidor
        showAlert('✅ Lista atualizada com novos produtos!', 'success');
        window.pendingProductUpdate = false;
      }
    }
  };

  // 🔥 AUTO-REFRESH PERIÓDICO NA ABA DE AGENDAMENTO (A CADA 15 SEGUNDOS)
  setInterval(() => {
    const agendamentoTab = document.getElementById('agendamento');
    if (agendamentoTab && agendamentoTab.style.display !== 'none') {
      console.log('🔄 Auto-refresh: Atualizando lista de agendamentos...');
      loadAgendamentos(true); // Forçar refresh do servidor
    }
  }, 15000); // 15 segundos (mais frequente)

  // 🔥 CONFIGURAR ÁREA DE PASTE DE IMAGEM
  setupImagePasteArea();
});

// ==================== FUNÇÕES PARA COPIAR E COLAR IMAGENS ====================

let currentPastedImage = null; // Armazena a imagem colada

function setupImagePasteArea() {
  const pasteZone = document.getElementById('imagePasteZone');
  if (!pasteZone) return;

  // Listener para paste em qualquer lugar do modal quando aberto
  document.addEventListener('paste', handlePasteEvent);

  // Efeito visual ao passar mouse
  pasteZone.addEventListener('mouseenter', function() {
    this.style.borderColor = '#764ba2';
    this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    this.style.transform = 'scale(1.02)';
    const texts = this.querySelectorAll('div');
    texts.forEach(t => t.style.color = 'white');
  });

  pasteZone.addEventListener('mouseleave', function() {
    this.style.borderColor = '#667eea';
    this.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    this.style.transform = 'scale(1)';
    const texts = this.querySelectorAll('div');
    texts[1].style.color = '#667eea';
    texts[2].style.color = '#666';
  });
}

function focusOnPasteArea() {
  showAlert('✨ Área ativa! Use Ctrl+V para colar uma imagem', 'info');
}

async function handlePasteEvent(e) {
  // Verificar se o modal de edição está aberto
  const modal = document.getElementById('editarModal');
  if (!modal || modal.style.display !== 'block') return;

  const items = e.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Verificar se é uma imagem
    if (item.type.indexOf('image') !== -1) {
      e.preventDefault();

      const file = item.getAsFile();
      console.log('📋 Imagem colada:', file.name, file.type, file.size);

      showAlert('📸 Imagem detectada! Processando...', 'info');

      await processImageFile(file);
      break;
    }
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showAlert('❌ Por favor, selecione um arquivo de imagem', 'error');
    return;
  }

  console.log('📁 Arquivo selecionado:', file.name, file.type, file.size);
  showAlert('📸 Imagem selecionada! Processando...', 'info');

  processImageFile(file);
}

async function processImageFile(file) {
  try {
    // Mostrar preview imediato
    const reader = new FileReader();

    reader.onload = async function(e) {
      const base64Image = e.target.result;
      currentPastedImage = base64Image;

      // Atualizar preview
      const preview = document.getElementById('imagePreview');
      const placeholder = document.getElementById('imagePreviewPlaceholder');

      if (preview && placeholder) {
        preview.src = base64Image;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
      }

      // Atualizar visual da paste zone
      updatePasteZoneWithImage(file.name);

      // Fazer upload para Supabase automaticamente
      showAlert('⬆️ Fazendo upload da imagem...', 'info');

      const uploadedUrl = await uploadImageToSupabase(base64Image, file.name);

      if (uploadedUrl) {
        // Atualizar campo de URL
        const urlInput = document.getElementById('editarImagemUrl');
        if (urlInput) {
          urlInput.value = uploadedUrl;
        }

        showAlert('✅ Imagem enviada com sucesso para o Supabase!', 'success');
        console.log('✅ URL da imagem:', uploadedUrl);
      } else {
        showAlert('⚠️ Imagem carregada mas não foi enviada ao Supabase', 'warning');
      }
    };

    reader.onerror = function(error) {
      console.error('Erro ao ler arquivo:', error);
      showAlert('❌ Erro ao processar imagem', 'error');
    };

    reader.readAsDataURL(file);

  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    showAlert('❌ Erro ao processar imagem: ' + error.message, 'error');
  }
}

function updatePasteZoneWithImage(fileName) {
  const pasteZone = document.getElementById('imagePasteZone');
  if (!pasteZone) return;

  pasteZone.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
    <div style="font-weight: 600; color: #10b981; font-size: 16px; margin-bottom: 5px;">
      Imagem carregada!
    </div>
    <div style="color: #666; font-size: 13px; margin-bottom: 10px;">
      ${fileName}
    </div>
    <button
      type="button"
      onclick="resetPasteZone()"
      style="
        padding: 8px 16px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
      "
    >
      🗑️ Remover
    </button>
  `;

  pasteZone.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
  pasteZone.style.borderColor = '#10b981';
}

function resetPasteZone() {
  const pasteZone = document.getElementById('imagePasteZone');
  if (!pasteZone) return;

  pasteZone.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 10px;">📋</div>
    <div style="font-weight: 600; color: #667eea; font-size: 16px; margin-bottom: 5px;">
      Cole uma imagem aqui
    </div>
    <div style="color: #666; font-size: 13px;">
      Copie uma imagem (Ctrl+C) e clique aqui para colar (Ctrl+V)
    </div>
    <input
      type="file"
      id="imageFileInput"
      accept="image/*"
      style="display: none;"
      onchange="handleFileSelect(event)"
    />
    <button
      type="button"
      onclick="event.stopPropagation(); document.getElementById('imageFileInput').click();"
      style="
        margin-top: 15px;
        padding: 8px 16px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
      "
    >
      📁 Ou escolher arquivo
    </button>
  `;

  pasteZone.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
  pasteZone.style.borderColor = '#667eea';
  pasteZone.onclick = focusOnPasteArea;

  currentPastedImage = null;

  // Limpar preview
  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('imagePreviewPlaceholder');
  if (preview && placeholder) {
    preview.style.display = 'none';
    placeholder.style.display = 'block';
  }

  // Limpar campo de URL
  const urlInput = document.getElementById('editarImagemUrl');
  if (urlInput) {
    urlInput.value = '';
  }

  showAlert('🗑️ Imagem removida', 'info');
}

async function uploadImageToSupabase(base64Image, fileName) {
  try {
    // Fazer upload via endpoint do Flask
    const response = await fetch('/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Image,
        filename: fileName || 'pasted-image.png'
      })
    });

    const result = await response.json();

    if (result.success && result.url) {
      console.log('✅ Upload para Supabase concluído:', result.url);
      return result.url;
    } else {
      console.error('❌ Erro no upload:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error);
    return null;
  }
}