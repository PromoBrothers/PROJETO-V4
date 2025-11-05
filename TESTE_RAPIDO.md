# 🧪 Teste Rápido do Sistema de Afiliados ML

## ⚠️ IMPORTANTE: Reinicie o Servidor Flask!

Para as mudanças terem efeito, você DEVE reiniciar o servidor:

```bash
# 1. Parar o servidor (Ctrl + C no terminal onde está rodando)

# 2. Iniciar novamente
python run.py
```

---

## 📋 Checklist de Verificação

### 1. ✅ Configuração do .env

Verifique se estas variáveis estão no seu `.env`:

```env
MERCADOLIVRE_AFFILIATE_ID=gabrielvilelaluiz
ML_CSRF_TOKEN=M9chz54XfDcH4d7qYfSXdQx-

# Cookies (todos os 13)
ML_COOKIE__CSRF=...
ML_COOKIE_ORGNICKP=...
# ... etc
```

### 2. 🔍 Verificar Logs no Terminal

Após reiniciar o servidor, quando você processar um produto do ML, deve ver:

**Se API funcionar**:
```
🔗 Gerando link de afiliado ML via API para: https://produto.mercadolivre.com.br/MLB-...
✅ Link gerado (cache): https://mercadolivre.com/sec/XXXXX
✅ Link de afiliado ML gerado via API: https://mercadolivre.com/sec/XXXXX
```

**Se API falhar (fallback)**:
```
🔗 Gerando link de afiliado ML via API para: https://produto.mercadolivre.com.br/MLB-...
⚠️ API não disponível. Usando método tradicional (mshops).
ℹ️ API não disponível, usando método tradicional (mshops)...
✅ Link de afiliado ML gerado via método tradicional (mshops)
```

### 3. 📱 Verificar a Mensagem Gerada

A mensagem final deve ter um destes formatos de link:

**Formato 1 (API com sucesso)**:
```
🛒 https://mercadolivre.com/sec/abc123
```

**Formato 2 (Fallback tradicional)**:
```
🛒 https://produto.mercadolivre.com.br/MLB-...?mshops=gabrielvilelaluiz
```

---

## 🐛 Se NÃO aparecer logs:

### Problema 1: Servidor não foi reiniciado
**Solução**: Pare (Ctrl+C) e inicie novamente: `python run.py`

### Problema 2: Logging não configurado
**Verifique** se o arquivo de log está sendo criado:
- Procure por `scraping.log` no diretório do projeto
- Se não existir, pode estar com problema de permissão

### Problema 3: .env não carregado
**Teste no terminal Python**:
```python
import os
from dotenv import load_dotenv

load_dotenv()
print("ID:", os.getenv("MERCADOLIVRE_AFFILIATE_ID"))
print("CSRF:", os.getenv("ML_CSRF_TOKEN")[:20] if os.getenv("ML_CSRF_TOKEN") else "Não encontrado")
```

---

## 🧪 Teste Manual Rápido

1. **Abra o navegador** e acesse: `http://localhost:5000`

2. **Cole um link do ML** para processar, exemplo:
   ```
   https://produto.mercadolivre.com.br/MLB-5382381308-monitor-gamer-lg
   ```

3. **Verifique o TERMINAL** onde o Flask está rodando

4. **Verifique a MENSAGEM GERADA** no frontend

---

## ⏱️ Performance Esperada

| Execução | Tempo Esperado | O que vai acontecer |
|----------|----------------|---------------------|
| **1ª vez** | 5-10 segundos | Sistema descobre qual endpoint funciona |
| **2ª vez** | **~1 segundo** | Sistema usa cache da combinação que funcionou |
| **3ª+ vez** | **~1 segundo** | Sistema continua usando cache |

---

## 🆘 Troubleshooting

### Se demorar 40 segundos ainda:
- ❌ Servidor NÃO foi reiniciado
- ❌ Mudanças no código não foram salvas
- ❌ Está rodando código antigo cacheado

### Se não aparecer link curto (mercadolivre.com/sec/...):
- ⚠️ Cookies podem estar expirados
- ⚠️ CSRF token pode estar inválido
- ✅ Sistema vai usar fallback automaticamente (mshops)

### Se aparecer erro 401/403 nos logs:
- 🔄 Atualize os cookies no `.env`
- 🔄 Pegue novo CSRF token do navegador
- ✅ Sistema vai usar fallback automaticamente

---

## ✅ Funcionamento Normal

**Logs que você DEVE ver**:

```
Starting Mercado Livre Scraper...
Flask app created successfully!
Starting server on 0.0.0.0:5000, debug=False
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000

[Quando processar produto ML]
🔗 Gerando link de afiliado ML via API para: https://produto...
✅ Link gerado (cache): https://mercadolivre.com/sec/XXXXX
✅ Link de afiliado ML gerado via API: https://mercadolivre.com/sec/XXXXX
```

---

## 📊 Status do Sistema

Arquivos modificados e prontos:
- ✅ `app/ml_affiliate.py` - Sistema com cache inteligente
- ✅ `app/routes.py` - Integração completa
- ✅ Documentação criada

**Sistema está 100% pronto!** Só falta reiniciar o servidor Flask. 🚀

---

**Data**: 2025-11-03
**Versão**: v3.0 (Cache Inteligente)
