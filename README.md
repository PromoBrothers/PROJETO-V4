# Sistema Unificado de Web Scraping para Afiliados

Sistema completo de web scraping multi-plataforma com suporte a Amazon, Mercado Livre, Shopee e outras plataformas de e-commerce, integrado com Supabase e monitoramento via WhatsApp.

## Características

- 🛒 **Multi-plataforma**: Amazon, Mercado Livre, Shopee, Magazine Luiza, etc.
- 🔄 **Scraping Inteligente**: Anti-bot, cache, retry automático
- 📊 **Banco de Dados**: Integração com Supabase
- 💬 **WhatsApp**: Monitoramento de grupos
- 🚀 **Produção**: Servidor Gunicorn otimizado
- 🐳 **Docker**: Deploy simplificado

## Pré-requisitos

- Python 3.11+
- Docker e Docker Compose (opcional)
- Conta no Supabase
- Node.js 16+ (para monitor WhatsApp)

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp config_exemplo.env .env
```

Edite o `.env` com suas credenciais:

```env
# OBRIGATÓRIO
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_supabase

# IDs de Afiliado
AMAZON_ASSOCIATES_TAG=seu-tag-20
MERCADOLIVRE_AFFILIATE_ID=seu_id

# Opcional
USE_PROXY=false
WEBHOOK_URL=https://seu-webhook.com/endpoint
```

### 2. Instalação Local

```bash
# Instalar dependências Python
pip install -r requirements.txt

# Instalar dependências do monitor WhatsApp
cd whatsapp-monitor
npm install
cd ..
```

## Executando o Projeto

### Modo Desenvolvimento

```bash
# Servidor Flask (desenvolvimento)
python run.py

# Ou usando o script
bash start-dev.sh
```

### Modo Produção (Local)

```bash
# Com Gunicorn
bash start-prod.sh

# Ou diretamente
gunicorn --config gunicorn.conf.py run:app
```

### Docker (Produção)

```bash
# Build e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

O servidor estará disponível em:
- **Local**: http://localhost:5000
- **Docker**: http://localhost:80

## Monitor WhatsApp

Para ativar o monitoramento de grupos do WhatsApp:

```bash
cd whatsapp-monitor
npm start
```

Acesse http://localhost:3001 para obter o QR Code.

## Estrutura do Projeto

```
.
├── app/
│   ├── __init__.py           # Factory do Flask
│   ├── routes.py             # Rotas da API
│   ├── scraping.py           # Lógica principal de scraping
│   ├── amazon_scraping.py    # Scraper Amazon
│   ├── shopee_scraping.py    # Scraper Shopee
│   ├── database.py           # Integração Supabase
│   ├── config.py             # Configurações
│   ├── anti_bot.py           # Anti-bot detection
│   └── cache_manager.py      # Sistema de cache
├── whatsapp-monitor/         # Monitor WhatsApp
├── run.py                    # Entry point
├── gunicorn.conf.py          # Configuração Gunicorn
├── Dockerfile                # Docker config
├── docker-compose.yml        # Compose config
└── requirements.txt          # Dependências Python
```

## API Endpoints

### Scraping
- `POST /scrape` - Fazer scraping de URL
- `POST /scrape-multiple` - Scraping em lote

### Produtos
- `GET /produtos` - Listar produtos
- `GET /produtos/<id>` - Detalhes do produto
- `DELETE /produtos/<id>` - Deletar produto
- `PUT /produtos/<id>/agendar` - Agendar publicação

### WhatsApp
- `GET /whatsapp/status` - Status da conexão
- `POST /whatsapp/message` - Processar mensagem

## Configurações do Gunicorn

Ajuste no `.env`:

```env
GUNICORN_WORKERS=4          # Número de workers
GUNICORN_THREADS=2          # Threads por worker
LOG_LEVEL=info              # Nível de log
```

**Cálculo recomendado de workers**: `(2 x núcleos_cpu) + 1`

## Troubleshooting

### Erro de conexão com Supabase
- Verifique `SUPABASE_URL` e `SUPABASE_KEY` no `.env`
- Confira as permissões da tabela `promocoes`

### Scraping falhando
- Ative o proxy se necessário: `USE_PROXY=true`
- Verifique os seletores CSS em `app/selectors.py`

### WhatsApp não conecta
- Delete a pasta `auth_info_baileys` e escaneie novamente
- Verifique se a porta 3001 está livre

## Desenvolvimento

Para contribuir:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## Licença

MIT License - veja LICENSE para detalhes

## Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.
