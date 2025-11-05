# Configuração de Afiliados do Mercado Livre

Este documento explica como configurar a geração automática de links de afiliados do Mercado Livre usando a API interna.

## 🎯 Visão Geral

O sistema possui **dois métodos** para gerar links de afiliados do Mercado Livre:

1. **Método API (Recomendado)**: Usa cookies e CSRF token para gerar links encurtados via API interna do ML
2. **Método Tradicional (Fallback)**: Adiciona o parâmetro `mshops` na URL do produto

## 📋 Passo a Passo para Obter Cookies e CSRF Token

### 1. Acesse o Painel de Afiliados

Abra seu navegador e acesse:
```
https://www.mercadolivre.com.br/affiliate-program/dashboard
```

Faça login com sua conta de afiliado do Mercado Livre.

### 2. Abra as Ferramentas de Desenvolvedor

- **Chrome/Edge**: Pressione `F12` ou `Ctrl+Shift+I`
- **Firefox**: Pressione `F12` ou `Ctrl+Shift+K`

### 3. Vá para a Aba Network/Rede

1. Clique na aba **Network** (ou **Rede** em português)
2. Marque a opção **Preserve log** (Preservar log)
3. Filtre por **XHR** ou **Fetch/XHR**

### 4. Faça uma Ação no Painel

No painel de afiliados, faça qualquer ação que gere uma requisição POST, como:
- Tentar criar um link de afiliado manualmente
- Clicar em "Gerar Link"
- Ou qualquer botão que faça uma chamada à API

### 5. Encontre a Requisição POST

Procure por uma requisição POST para o endpoint:
```
https://www.mercadolivre.com.br/affiliate-program/api/v2/stripe/user/links
```

Ou qualquer outro endpoint que comece com `/affiliate-program/api/`

### 6. Copie os Cookies

1. Clique na requisição POST que você encontrou
2. Vá para a aba **Headers** (Cabeçalhos)
3. Role até encontrar a seção **Request Headers**
4. Procure pelo campo **Cookie:**

Os cookies importantes são:
- `_csrf`
- `orgnickp`
- `orguseridp`
- `_mldataSessionId`
- `c_ctid`
- `c_ids`
- `_d2id`

### 7. Copie o CSRF Token

Na mesma seção de **Request Headers**, procure por:
```
X-CSRF-Token: M9chz54XfDcH4d7qYfSXdQx-
```

Copie o valor do token.

## 🔧 Configuração no Arquivo .env

Abra seu arquivo `.env` e adicione/edite as seguintes variáveis:

### Opção 1: Cookies Individuais (Recomendado)

```env
# ID de afiliado (seu nickname no ML)
MERCADOLIVRE_AFFILIATE_ID=gabrielvilelaluiz

# Cookies individuais
ML_COOKIE__CSRF=valor-do-csrf-cookie
ML_COOKIE_ORGNICKP=GABRIELVILELALUIZ
ML_COOKIE_ORGUSERIDP=seu-userid-aqui
ML_COOKIE__MLDATASESSIONID=seu-session-id-aqui
ML_COOKIE_C_CTID=seu-ctid-aqui
ML_COOKIE_C_IDS=seu-ids-aqui
ML_COOKIE__D2ID=seu-d2id-aqui

# CSRF Token
ML_CSRF_TOKEN=M9chz54XfDcH4d7qYfSXdQx-
```

### Opção 2: String Completa de Cookies (Alternativa)

```env
# ID de afiliado
MERCADOLIVRE_AFFILIATE_ID=gabrielvilelaluiz

# String completa de cookies (copie tudo do campo Cookie)
ML_COOKIES=_csrf=valor; orgnickp=GABRIELVILELALUIZ; orguseridp=valor; _mldataSessionId=valor; ...

# CSRF Token
ML_CSRF_TOKEN=M9chz54XfDcH4d7qYfSXdQx-
```

## 🧪 Testando a Configuração

Após configurar as variáveis de ambiente, teste a geração de links:

### Teste via Python

Crie um arquivo `test_ml_affiliate.py`:

```python
import os
from dotenv import load_dotenv
from app.ml_affiliate import gerar_link_afiliado_ml

# Carregar variáveis de ambiente
load_dotenv()

# URL de teste
url_teste = "https://produto.mercadolivre.com.br/MLB-5382381308-monitor-gamer-lg-ultragear-24-24gs60f-b-ips-full-hd-180hz-_JM"

print(f"🔍 Testando geração de link de afiliado para:")
print(f"   {url_teste}\n")

# Tentar gerar link
link_afiliado = gerar_link_afiliado_ml(url_teste)

if link_afiliado:
    print(f"✅ Sucesso! Link de afiliado gerado:")
    print(f"   {link_afiliado}")
else:
    print("❌ Falha ao gerar link de afiliado")
    print("⚠️  Verifique as variáveis de ambiente e os logs")
```

Execute:
```bash
python test_ml_affiliate.py
```

### Teste via Interface Web

1. Inicie o servidor Flask
2. Acesse a interface de scraping
3. Cole um link de produto do Mercado Livre
4. O sistema automaticamente tentará gerar o link de afiliado via API
5. Verifique os logs do servidor para ver se funcionou

## 📝 Logs e Debugging

O sistema registra todas as tentativas nos logs. Procure por:

```
✅ Link de afiliado ML gerado via API: ...
```

Se ver esta mensagem, significa que funcionou!

Se ver:
```
⚠️ Cookies ou CSRF token do ML não configurados. Usando método tradicional (mshops).
```

Significa que as credenciais não estão configuradas corretamente.

## 🔄 Quando Atualizar os Cookies

Os cookies e CSRF tokens **expiram** após algum tempo. Você precisará atualizá-los quando:

- Ver erro `401 Unauthorized` nos logs
- Ver erro `403 Forbidden` nos logs
- Os links pararem de ser gerados via API

Neste caso, repita o processo de captura dos cookies.

## 🔒 Segurança

- **NUNCA** compartilhe seu arquivo `.env` publicamente
- **NUNCA** faça commit do arquivo `.env` no Git
- Os cookies dão acesso à sua conta de afiliado, proteja-os
- Use o arquivo `.env.example` como template (sem valores reais)

## ⚡ Funcionamento Automático

Uma vez configurado, o sistema funciona automaticamente:

1. Quando você cola um link do ML, o sistema **primeiro tenta** gerar via API
2. Se a API falhar ou não estiver configurada, usa o método tradicional (parâmetro `mshops`)
3. Você não precisa fazer nada manualmente, tudo é transparente

## 🎯 Estrutura da Resposta Esperada

A API do Mercado Livre pode retornar diferentes formatos. O sistema tenta extrair o link de:

```json
{
  "link": "https://meli.la/abc123"
}
```

Ou:

```json
{
  "data": {
    "link": "https://meli.la/abc123"
  }
}
```

Ou:

```json
{
  "shortUrl": "https://meli.la/abc123"
}
```

## ❓ Troubleshooting

### Erro: "Cookies ou CSRF token não configurados"
- Verifique se as variáveis estão no arquivo `.env`
- Certifique-se de que não há espaços extras nos valores
- Reinicie o servidor Flask após alterar o `.env`

### Erro: "401 Unauthorized"
- Os cookies expiraram, atualize-os
- Certifique-se de que está usando cookies da conta correta

### Erro: "403 Forbidden"
- Sua conta pode não ter permissões de afiliado
- Verifique se sua conta está ativa no programa de afiliados

### Erro: "Link não encontrado na resposta"
- A estrutura da resposta da API mudou
- Verifique os logs para ver o formato retornado
- Abra uma issue no GitHub com a resposta completa

## 📞 Suporte

Se precisar de ajuda, verifique:
1. Os logs do servidor (`scraping.log`)
2. A documentação oficial do Mercado Livre (se disponível)
3. Este arquivo de configuração

---

**Última atualização**: 2025-11-03
