# 🔍 Diagnóstico de Problemas com QR Code WhatsApp

## 📋 Checklist de Verificação

### 1. ✅ Servidor WhatsApp Monitor Está Rodando?

**Verificar**:
```bash
# No terminal, navegue até a pasta whatsapp-monitor
cd whatsapp-monitor

# Execute o servidor
node server.js
```

**Logs esperados**:
```
🚀 Servidor WhatsApp Monitor rodando na porta 3001
📡 Flask API: http://localhost:5000
🔄 Iniciando conexão com WhatsApp...
✅ Estado de autenticação carregado
✅ Versão do Baileys: x.x.x
✅ Socket criado com sucesso
📱 QR Code gerado! Aguardando escaneamento...
```

---

### 2. 🔍 Testar Conexão Direta com o Monitor

**Teste 1**: Verificar se o servidor responde
```bash
# Em outro terminal
curl http://localhost:3001/status
```

**Resposta esperada**:
```json
{
  "connected": false,
  "state": "qr",
  "monitoredGroups": 0
}
```

**Teste 2**: Verificar QR Code
```bash
curl http://localhost:3001/qr
```

**Resposta esperada**:
```json
{
  "qr": "data:image/png;base64,iVBORw0KG...",
  "state": "qr"
}
```

---

### 3. 🐛 Problemas Comuns e Soluções

#### Problema 1: "WhatsApp Monitor não está rodando"

**Sintomas**:
- Erro 503 no navegador
- Mensagem: "WhatsApp Monitor não está rodando"

**Solução**:
```bash
# 1. Verificar se a porta 3001 está ocupada
netstat -ano | findstr :3001

# 2. Se estiver ocupada, matar o processo
taskkill /PID [número_do_pid] /F

# 3. Iniciar o servidor novamente
cd whatsapp-monitor
node server.js
```

#### Problema 2: "QR Code não disponível ainda"

**Sintomas**:
- Mensagem: "QR Code não disponível. Aguardando conexão..."
- State: "connecting" ou "disconnected"

**Solução**:
```
✅ Aguarde 5-10 segundos
✅ Recarregue a página
✅ Verifique os logs do terminal do WhatsApp Monitor
```

#### Problema 3: Erro de crypto/autenticação

**Sintomas**:
- Logs mostram: "Erro de conexão detectado"
- Mensagem de crypto no erro

**Solução**:
```bash
# 1. Parar o servidor (Ctrl+C)

# 2. Remover autenticação antiga
cd whatsapp-monitor
rmdir /s /q auth_info_baileys

# 3. Reiniciar servidor
node server.js
```

#### Problema 4: QR Code expira muito rápido

**Sintomas**:
- QR Code some antes de escanear
- Precisa recarregar várias vezes

**Solução**:
- ✅ QR Code do WhatsApp expira em ~60 segundos (normal)
- ✅ Recarregue a página para gerar novo QR
- ✅ Escaneie assim que aparecer

---

### 4. 🧪 Teste de Diagnóstico

Criamos um script de teste. Execute:

```bash
cd whatsapp-monitor
node test_qr.js
```

**Saída esperada**:
```
🧪 Teste de Geração de QR Code

1️⃣ Testando geração de QR Code...
✅ QR Code gerado com sucesso!
   Tamanho: 5678 caracteres
   Tipo: data:image/png;base64,iVB...

2️⃣ Testando QR Code simulado do WhatsApp...
✅ QR Code simulado gerado com sucesso!
   Tamanho: 7890 caracteres

3️⃣ Testando NodeCache...
✅ NodeCache funcionando corretamente

✅ Todos os testes concluídos!
```

---

### 5. 📱 Verificar Integração com Flask

**Teste via Flask**:
1. Acesse: `http://localhost:5000/whatsapp-monitor`
2. Verifique se a página carrega
3. Veja se o QR Code aparece

**Se aparecer erro no navegador**:
- Abra DevTools (F12)
- Vá em "Console"
- Veja qual erro aparece
- Copie e me envie

---

### 6. 🔧 Variáveis de Ambiente

Verifique o arquivo `.env` do projeto principal:

```env
# Deve ter:
WHATSAPP_MONITOR_URL=http://localhost:3001
```

**OU** no Docker/Docker Compose:
```env
WHATSAPP_MONITOR_URL=http://qrcode:3001
```

---

### 7. 📊 Estados Possíveis do Sistema

| Estado | Significado | O que fazer |
|--------|-------------|-------------|
| `disconnected` | Não conectado ainda | Aguardar gerar QR |
| `connecting` | Conectando... | Aguardar |
| `qr` | QR Code disponível | Escanear com WhatsApp |
| `connected` | ✅ Conectado | Tudo OK! |
| `error` | ❌ Erro de conexão | Ver logs, reiniciar |

---

### 8. 🔄 Processo Completo de Reset

Se nada funcionar, faça reset completo:

```bash
# 1. Parar TODOS os servidores
# - Flask (Ctrl+C)
# - WhatsApp Monitor (Ctrl+C)

# 2. Limpar autenticação
cd whatsapp-monitor
rmdir /s /q auth_info_baileys

# 3. Reiniciar WhatsApp Monitor
node server.js

# 4. Aguardar QR Code aparecer nos logs
# (deve aparecer em 5-10 segundos)

# 5. Em outro terminal, reiniciar Flask
cd ..
python run.py

# 6. Abrir navegador
# http://localhost:5000/whatsapp-monitor

# 7. Escanear QR Code
```

---

### 9. 🆘 Logs Úteis para Diagnóstico

**Logs do WhatsApp Monitor** (terminal onde roda `node server.js`):
```
📡 Connection update: { connection: 'close', hasQR: false }
❌ Conexão fechada.
   Status Code: undefined
   Erro: [mensagem do erro]
```

**Copie e me envie**:
1. Toda a saída do terminal do WhatsApp Monitor
2. Erros do Console do navegador (F12)
3. Qual estado mostra em `/status`

---

### 10. ✅ Funcionamento Normal

Quando tudo estiver funcionando, você verá:

**Logs do Monitor**:
```
🚀 Servidor WhatsApp Monitor rodando na porta 3001
📡 Flask API: http://localhost:5000
🔄 Iniciando conexão com WhatsApp...
✅ Estado de autenticação carregado
✅ Socket criado com sucesso
📡 Connection update: { connection: null, hasQR: true, qrLength: 250 }
📱 QR Code gerado! Aguardando escaneamento...
✅ QR Code convertido para imagem e armazenado no cache
   Tamanho da imagem: 7542 caracteres
```

**No navegador**:
- ✅ Página carrega
- ✅ QR Code aparece como imagem
- ✅ Pode escanear com WhatsApp
- ✅ Após escanear: "Conectado ao WhatsApp!"

---

## 🚀 Próximos Passos

Após conectar com sucesso:
1. ✅ Vá em "Gerenciar Grupos"
2. ✅ Selecione grupos para monitorar
3. ✅ Mensagens desses grupos serão capturadas
4. ✅ Pode aprovar/rejeitar mensagens

---

**Me envie**:
1. Qual erro específico você está vendo?
2. O que aparece nos logs do terminal?
3. Qual é o estado em `/status`?

Com essas informações, posso ajudar mais especificamente! 🔧
