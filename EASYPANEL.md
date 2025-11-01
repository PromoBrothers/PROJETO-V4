# Deploy EasyPanel

## Variáveis de Ambiente Obrigatórias

```
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_key_supabase
SUPABASE_BUCKET_NAME=imagens_melhoradas_tech
SECRET_KEY=promo-brothers-secret-key-2024-ultra-secure
LOGIN_USERNAME=promobrothers
LOGIN_PASSWORD=Bro46mo01
PORT=5000
FLASK_ENV=production
```

## Opcionais

```
WEBHOOK_URL=seu_webhook_url
SCRAPERAPI_KEY=sua_scraperapi_key
AMAZON_ASSOCIATES_TAG=promobrothers-20
FLASK_API_TOKEN=gere-um-token-seguro
```

## Configuração EasyPanel

1. Criar novo App
2. Source: GitHub/Docker
3. Porta: **5000**
4. Build: Automático (Dockerfile)
5. Adicionar variáveis acima em Environment
6. Deploy
