# 🔗 Sistema de Links de Afiliado - Mercado Livre

## Como Funciona

O sistema foi otimizado para trabalhar **diretamente com links de afiliado** do Mercado Livre, extraindo automaticamente as informações do produto enquanto preserva seu link de afiliado para compartilhamento.

---

## 🎯 Fluxo de Processamento

### 1. **Detecção Automática**
O sistema detecta automaticamente se o link fornecido é um link de afiliado baseado em padrões:
- `mercadolivre.com/sec/...`
- `mercadolivre.com.br/sec/...`
- `/s/c/...`

### 2. **Extração Inteligente**
Quando um link de afiliado é detectado:

```
Link de Afiliado Fornecido
         ↓
   Seguir Redirects
         ↓
   Capturar URL Final
         ↓
   Extrair ID do Produto (MLB...)
         ↓
   Construir URL Limpa para Scraping
         ↓
   Fazer Scraping dos Dados
         ↓
   Retornar com Link de Afiliado Original
```

### 3. **Múltiplas Estratégias**

#### Estratégia 1: Redirect Direto
- Segue o redirect do link de afiliado
- Captura a URL final do produto
- Extrai o ID MLB do produto

#### Estratégia 2: Página Social
Se o redirect levar para uma página social (`/social/`):
- Extrai o produto do parâmetro `ref` na URL
- Busca no histórico de redirects intermediários
- Identifica o ID MLB em URLs anteriores

#### Estratégia 3: Histórico de Redirects
- Analisa todos os redirects intermediários
- Encontra a URL que contém o ID do produto
- Usa essa informação para construir a URL limpa

---

## 📝 Exemplos de Uso

### Exemplo 1: Link de Afiliado Completo

**Entrada:**
```
https://mercadolivre.com.br/sec/1AbCdEf2GhI3jKlMnOpQrStUvWx4YzA5BcDeFgHiJkLmNo
```

**Processamento:**
```
🔗 Link de afiliado detectado, extraindo informações...
📍 URL final após redirects: https://produto.mercadolivre.com.br/MLB123456789
✅ Produto encontrado: MLB123456789
📦 Fazendo scraping de: https://produto.mercadolivre.com.br/MLB123456789
🔗 Link de afiliado a ser usado: https://mercadolivre.com.br/sec/1AbC...
```

**Resultado:**
- ✅ Dados do produto extraídos corretamente
- ✅ Link de afiliado original preservado para compartilhamento
- ✅ Mensagens enviadas com SEU link de afiliado

### Exemplo 2: Link Normal de Produto

**Entrada:**
```
https://produto.mercadolivre.com.br/MLB-3456789012-smartphone-exemplo
```

**Processamento:**
```
📦 Fazendo scraping de: https://produto.mercadolivre.com.br/MLB-3456789012-smartphone-exemplo
🔗 Link de afiliado a ser usado: https://produto.mercadolivre.com.br/MLB-3456789012-smartphone-exemplo
```

**Resultado:**
- ✅ Scraping direto do produto
- ⚠️ Sem link de afiliado (use o campo "Link de Afiliado" separado se quiser adicionar)

---

## 🛠️ Como Usar na Prática

### Uso Simplificado (Um Único Campo!)

1. Copie seu link de afiliado OU link do produto do Mercado Livre
2. Cole no campo **"Link do Produto ou Link de Afiliado"**
3. Clique em "Analisar Link" ou "Adicionar Produto"

✅ O sistema vai automaticamente:
- Detectar se é um link de afiliado
- Extrair os dados do produto
- Usar seu link de afiliado nas mensagens (se fornecido)
- Ou usar o link do produto (se não for afiliado)

**Não há mais campo separado!** Tudo em um único lugar! 🎯

---

## 🔍 Logs e Debugging

O sistema fornece logs detalhados para acompanhar o processo:

```
🔗 Link de afiliado detectado, extraindo informações...
📍 URL final após redirects: https://produto.mercadolivre.com.br/...
✅ Produto encontrado: MLB123456789
📦 Fazendo scraping de: https://produto.mercadolivre.com.br/MLB123456789
🔗 Link de afiliado a ser usado: https://mercadolivre.com.br/sec/...
💰 Preço extraído: R$ 1.299,99
📸 Imagem capturada
✅ Produto processado com sucesso
```

---

## ⚠️ Tratamento de Casos Especiais

### Página Social do ML
Quando o redirect cai em uma página social:
```
🔍 Detectada página social, buscando URL do produto...
✅ Produto extraído do ref: MLB123456789
```

### Histórico de Redirects
Quando não encontra diretamente, analisa o histórico:
```
✅ Produto encontrado no histórico: MLB123456789
```

### Fallback
Se não conseguir extrair automaticamente:
```
⚠️ Não foi possível extrair ID do produto, usando URL final
```
- Ainda assim faz scraping da URL final
- Preserva o link de afiliado original

---

## 📊 Vantagens do Sistema

✅ **Automático**: Detecta links de afiliado automaticamente
✅ **Inteligente**: Múltiplas estratégias de extração
✅ **Preserva Comissão**: Seu link de afiliado é sempre mantido
✅ **Robusto**: Fallbacks para casos especiais
✅ **Transparente**: Logs detalhados do processo
✅ **Simples**: Basta colar o link de afiliado

---

## 🚀 Fluxo Completo na Aplicação

```
1. Usuário cola link de afiliado
         ↓
2. Sistema detecta automaticamente
         ↓
3. Extrai URL do produto (para scraping)
         ↓
4. Faz scraping dos dados (preço, título, imagem)
         ↓
5. Salva produto no banco com link de afiliado original
         ↓
6. Mensagens enviadas usam o link de afiliado
         ↓
7. Você ganha comissão nas vendas! 💰
```

---

## 📌 Notas Importantes

1. **Não precisa separar os links**: Cole direto o link de afiliado
2. **Sistema preserva comissão**: Seu link nunca é perdido
3. **Funciona com qualquer formato**: Links curtos, longos, com parâmetros
4. **Scraping limpo**: Usa URL limpa do produto para dados precisos
5. **Link original preservado**: Para compartilhamento e comissões

---

## 🆘 Resolução de Problemas

### Problema: "Não conseguiu extrair produto"
**Solução**: Verifique se o link de afiliado é válido e está ativo no Mercado Livre

### Problema: "Dados incompletos"
**Solução**: O sistema tenta automaticamente via ScraperAPI como fallback

### Problema: "Redirect para página social"
**Solução**: Sistema extrai automaticamente, não requer ação

---

## 🔧 Arquivos Modificados

- `app/scraper_factory.py`: Lógica principal de extração
  - `_extract_real_affiliate_link()`: Extração inteligente
  - `_follow_redirect_if_needed()`: Processamento de redirects
  - `scrape_product()`: Fluxo principal com detecção automática

---

## 📈 Resultado Final

**Antes:**
- ❌ Links de afiliado perdiam comissão
- ❌ Necessário separar produto e afiliado
- ❌ Scraping falhava em links curtos

**Agora:**
- ✅ Link de afiliado preservado automaticamente
- ✅ Cole apenas o link de afiliado
- ✅ Extração inteligente do produto
- ✅ Múltiplos fallbacks para robustez
- ✅ 100% de comissão garantida

---

**Desenvolvido para maximizar suas comissões! 💰**
