# 🚀 Como Configurar os Cookies do Mercado Livre

## 🎯 Resultado Esperado

Quando configurado corretamente, o sistema gera links encurtados como:

**`https://mercadolivre.com/sec/2NK8DXK`**

Este é o formato oficial de links de afiliados do Mercado Livre!

## ✅ Você já exportou os cookies corretamente!

Agora é só seguir estes passos simples:

---

## 📋 Passo 1: Abrir o arquivo .env

1. Na raiz do projeto, localize o arquivo **`.env`**
2. Abra ele com qualquer editor de texto (VS Code, Notepad++, Bloco de Notas, etc.)

---

## 📄 Passo 2: Copiar a configuração

1. Abra o arquivo **`ADICIONAR_NO_ENV.txt`** que está na raiz do projeto
2. **Copie TODO o conteúdo** (do `MERCADOLIVRE_AFFILIATE_ID` até o último cookie)

---

## 📝 Passo 3: Colar no .env

1. Vá até o **final** do seu arquivo `.env`
2. **Cole** todo o conteúdo que você copiou
3. **Salve** o arquivo `.env`

### Exemplo de como deve ficar:

```env
# ... outras configurações existentes ...

# ID de afiliado (seu nickname no ML)
MERCADOLIVRE_AFFILIATE_ID=gabrielvilelaluiz

# CSRF Token (essencial para requisições POST)
ML_CSRF_TOKEN=M9chz54XfDcH4d7qYfSXdQx-

# Cookies de sessão extraídos do seu navegador
ML_COOKIE__CSRF=M9chz54XfDcH4d7qYfSXdQx-
ML_COOKIE_ORGNICKP=GABRIELVILELALUIZ
ML_COOKIE_ORGUSERIDP=404150719
# ... e todos os outros cookies
```

---

## 🔄 Passo 4: Reiniciar o servidor

Se o servidor Flask estiver rodando:

1. Pressione **Ctrl + C** para parar o servidor
2. Execute novamente:
   ```bash
   python run.py
   ```

---

## 🧪 Passo 5: Testar

Execute o script de teste:

```bash
python test_ml_affiliate.py
```

### ✅ Se deu certo, você verá:

```
✅ Configuração completa para teste via API!

🔍 Testando geração de link via API...
   URL: https://produto.mercadolivre.com.br/MLB-...

⏳ Aguarde...

🎉 SUCESSO! Link de afiliado gerado via API:

   📎 https://meli.la/abc123

✅ O sistema está funcionando corretamente!
```

### ❌ Se der erro:

Verifique:
1. Se copiou TODAS as linhas do arquivo `ADICIONAR_NO_ENV.txt`
2. Se não tem espaços ou quebras de linha extras
3. Se salvou o arquivo `.env` corretamente
4. Se reiniciou o servidor Flask

---

## 🔍 Como Saber se Está Funcionando

Quando você usar o sistema normalmente (scraping de produtos do ML), nos **logs do servidor** você verá:

```
✅ Link de afiliado ML gerado via API: https://meli.la/abc123...
```

Se ver isso, está funcionando perfeitamente! 🎉

---

## ⚠️ Quando Atualizar os Cookies

Os cookies **expiram** com o tempo. Você saberá que precisa atualizá-los quando:

1. Ver nos logs: `❌ Erro 401: Cookies ou CSRF token inválidos/expirados`
2. Os links pararem de ser gerados via API (voltará a usar método tradicional com `mshops`)

Neste caso, simplesmente:
1. Exporte os cookies novamente do navegador (como você fez)
2. Execute o script `convert_cookies_to_env.py` novamente
3. Atualize o arquivo `.env`

---

## 🎯 Resumo Rápido

1. ✅ Abra `.env`
2. ✅ Copie tudo de `ADICIONAR_NO_ENV.txt`
3. ✅ Cole no final do `.env`
4. ✅ Salve o arquivo
5. ✅ Reinicie o servidor
6. ✅ Execute `python test_ml_affiliate.py`
7. ✅ Pronto! 🚀

---

## 📞 Problemas?

Se algo não funcionar:

1. Verifique os **logs do servidor** para ver mensagens de erro
2. Execute o teste: `python test_ml_affiliate.py`
3. Confira se todas as variáveis estão no `.env` corretamente
4. Certifique-se de que reiniciou o servidor após alterar o `.env`

---

**Última atualização**: 2025-11-03
