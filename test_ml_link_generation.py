#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de teste detalhado para geração de links de afiliados do Mercado Livre
Testa diferentes endpoints e formatos de payload
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Configurar logging detalhado
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Carregar variáveis de ambiente
load_dotenv()

print("=" * 80)
print("🧪 TESTE DETALHADO DE GERAÇÃO DE LINKS DE AFILIADOS DO MERCADO LIVRE")
print("=" * 80)
print()

# URL de teste
url_teste = "https://produto.mercadolivre.com.br/MLB-5382381308-monitor-gamer-lg-ultragear-24-24gs60f-b-ips-full-hd-180hz-_JM"

print(f"🔍 URL de teste:")
print(f"   {url_teste}")
print()

print("─" * 80)
print()

# Importar módulo de afiliado
from app.ml_affiliate import MercadoLivreAffiliate

# Criar instância
ml_affiliate = MercadoLivreAffiliate()

# Verificar configuração
print("📋 Verificando configuração...")
print()
print(f"✓ Affiliate ID: {ml_affiliate.affiliate_tag}")
print(f"✓ CSRF Token: {'✅ Configurado' if ml_affiliate.csrf_token else '❌ NÃO configurado'}")
print(f"✓ Cookies: {len(ml_affiliate.cookies)} cookies carregados")
print()

if ml_affiliate.cookies:
    print("  Cookies disponíveis:")
    for cookie_name in sorted(ml_affiliate.cookies.keys()):
        value_preview = ml_affiliate.cookies[cookie_name][:30] + "..." if len(ml_affiliate.cookies[cookie_name]) > 30 else ml_affiliate.cookies[cookie_name]
        print(f"    - {cookie_name}: {value_preview}")
    print()

print("─" * 80)
print()

if not ml_affiliate.is_configured():
    print("❌ ERRO: Configuração incompleta!")
    print()
    print("💡 Configure os cookies no arquivo .env primeiro")
    print("   Consulte o arquivo ADICIONAR_NO_ENV.txt")
    print()
    sys.exit(1)

print("✅ Configuração OK! Iniciando teste...")
print()
print("⏳ Testando múltiplos endpoints e formatos de payload...")
print("   (isso pode demorar alguns segundos)")
print()

print("─" * 80)
print()

# Tentar gerar link
affiliate_link = ml_affiliate.generate_affiliate_link(url_teste)

print()
print("─" * 80)
print()

if affiliate_link:
    print("🎉 SUCESSO! Link de afiliado gerado:")
    print()
    print(f"   📎 {affiliate_link}")
    print()

    # Verificar formato do link
    if "mercadolivre.com/sec/" in affiliate_link or "meli.la/" in affiliate_link:
        print("✅ Formato correto! Link encurtado de afiliado.")
    elif "mshops=" in affiliate_link:
        print("⚠️  Link com parâmetro mshops (método tradicional)")
    else:
        print("❓ Formato desconhecido do link")

    print()
    print("✅ O sistema está funcionando corretamente!")
    print()
else:
    print("❌ FALHA ao gerar link de afiliado via API")
    print()
    print("⚠️  Possíveis causas:")
    print("   1. Cookies ou CSRF token expirados")
    print("   2. Endpoint ou formato de payload incorreto")
    print("   3. Conta sem permissões de afiliado")
    print("   4. API do Mercado Livre indisponível")
    print()
    print("💡 O sistema usará o método tradicional (parâmetro mshops) como fallback")
    print()

print("─" * 80)
print()

# Testar método tradicional como fallback
print("🔄 Testando método tradicional (fallback)...")
print()

from app.routes import aplicar_afiliado_ml

link_tradicional = aplicar_afiliado_ml(url_teste)

print(f"   Link com método tradicional: {link_tradicional[:100]}...")
print()

if "mshops=" in link_tradicional:
    print("✅ Método tradicional funcionando (parâmetro mshops adicionado)")
else:
    print("⚠️  Método tradicional não aplicou parâmetro mshops")

print()
print("=" * 80)
print("✅ Teste concluído!")
print("=" * 80)
print()

# Resumo
print("📊 RESUMO:")
print()
print(f"   Método API: {'✅ Funcionando' if affiliate_link else '❌ Não funcionou'}")
print(f"   Método tradicional: {'✅ Funcionando' if 'mshops=' in link_tradicional else '❌ Não funcionou'}")
print()

if affiliate_link:
    print("🎯 RECOMENDAÇÃO: Use o sistema normalmente, a API está funcionando!")
elif 'mshops=' in link_tradicional:
    print("🎯 RECOMENDAÇÃO: Sistema usará método tradicional (fallback)")
    print("   Para usar a API, verifique se os cookies estão atualizados")
else:
    print("⚠️  ATENÇÃO: Nenhum método funcionou!")
    print("   Configure o MERCADOLIVRE_AFFILIATE_ID no .env")

print()
print("=" * 80)
