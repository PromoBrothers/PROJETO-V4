#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de teste para geração de links de afiliados do Mercado Livre
"""

import os
import sys
from dotenv import load_dotenv

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Carregar variáveis de ambiente
load_dotenv()

print("=" * 80)
print("🧪 TESTE DE GERAÇÃO DE LINKS DE AFILIADOS DO MERCADO LIVRE (OTIMIZADO)")
print("=" * 80)
print()
print("⚡ Sistema otimizado: 1 requisição direta, ~10x mais rápido!")
print()

# Verificar configuração
print("📋 Verificando configuração...")
print()

affiliate_id = os.getenv("MERCADOLIVRE_AFFILIATE_ID", "")
csrf_token = os.getenv("ML_CSRF_TOKEN", "")

# Verificar cookies
cookie_names = ["_csrf", "orgnickp", "orguseridp", "_mldataSessionId", "c_ctid", "c_ids", "_d2id"]
cookies_found = []
cookies_missing = []

for cookie_name in cookie_names:
    env_key = f"ML_COOKIE_{cookie_name.upper()}"
    if os.getenv(env_key):
        cookies_found.append(cookie_name)
    else:
        cookies_missing.append(cookie_name)

# Também verificar string completa
full_cookies = os.getenv("ML_COOKIES", "")

print(f"✓ MERCADOLIVRE_AFFILIATE_ID: {'✅ Configurado' if affiliate_id else '❌ Não configurado'}")
if affiliate_id:
    print(f"  Valor: {affiliate_id}")
print()

print(f"✓ ML_CSRF_TOKEN: {'✅ Configurado' if csrf_token else '❌ Não configurado'}")
if csrf_token:
    print(f"  Valor: {csrf_token[:20]}... (truncado)")
print()

print(f"✓ Cookies:")
if cookies_found:
    print(f"  ✅ Cookies individuais encontrados ({len(cookies_found)}/{len(cookie_names)}):")
    for cookie in cookies_found:
        print(f"     - {cookie}")
if cookies_missing:
    print(f"  ⚠️  Cookies faltando ({len(cookies_missing)}/{len(cookie_names)}):")
    for cookie in cookies_missing:
        print(f"     - {cookie}")
if full_cookies:
    print(f"  ✅ String completa de cookies configurada (ML_COOKIES)")
print()

# Verificar se está pronto para teste
can_test_api = bool(csrf_token and (cookies_found or full_cookies) and affiliate_id)
can_test_traditional = bool(affiliate_id)

print("─" * 80)
print()

if can_test_api:
    print("✅ Configuração completa para teste via API!")
    print()

    # Importar módulo de afiliado
    from app.ml_affiliate import MercadoLivreAffiliate

    # Criar instância
    ml_affiliate = MercadoLivreAffiliate()

    # URL de teste
    url_teste = "https://produto.mercadolivre.com.br/MLB-5382381308-monitor-gamer-lg-ultragear-24-24gs60f-b-ips-full-hd-180hz-_JM"

    print("🔍 Testando geração de link via API...")
    print(f"   URL: {url_teste}")
    print()
    print("⏳ Aguarde...")
    print()

    # Tentar gerar link
    link_afiliado = ml_affiliate.generate_affiliate_link(url_teste)

    print("─" * 80)
    print()

    if link_afiliado:
        print("🎉 SUCESSO! Link de afiliado gerado via API:")
        print()
        print(f"   📎 {link_afiliado}")
        print()
        print("✅ O sistema está funcionando corretamente!")
    else:
        print("❌ FALHA ao gerar link de afiliado via API")
        print()
        print("⚠️  Possíveis causas:")
        print("   1. Cookies ou CSRF token expirados")
        print("   2. Formato de payload incorreto")
        print("   3. Conta sem permissões de afiliado")
        print()
        print("💡 Verifique os logs acima para mais detalhes")

    print()
    print("─" * 80)
    print()

elif can_test_traditional:
    print("⚠️  Configuração incompleta para teste via API")
    print()
    print("💡 Configure os cookies e CSRF token para usar a API")
    print("   Consulte o arquivo CONFIGURAR_AFILIADO_ML.md")
    print()
    print("📋 Testando método tradicional (parâmetro mshops)...")
    print()

    # Testar método tradicional
    from app.routes import aplicar_afiliado_ml

    url_teste = "https://produto.mercadolivre.com.br/MLB-5382381308-monitor-gamer-lg-ultragear-24-24gs60f-b-ips-full-hd-180hz-_JM"

    print(f"   URL original: {url_teste}")
    print()

    link_modificado = aplicar_afiliado_ml(url_teste)

    print(f"   URL modificada: {link_modificado}")
    print()

    if "mshops=" in link_modificado or "mshopps=" in link_modificado:
        print("✅ Método tradicional funcionando (parâmetro mshops adicionado)")
    else:
        print("❌ Método tradicional falhou")

    print()
    print("─" * 80)
    print()

else:
    print("❌ Configuração incompleta!")
    print()
    print("📋 Para usar o sistema, você precisa configurar:")
    print()
    print("   1. MERCADOLIVRE_AFFILIATE_ID (seu nickname de afiliado)")
    print()
    print("   Para usar a API (recomendado), também configure:")
    print("   2. ML_CSRF_TOKEN")
    print("   3. Cookies de sessão (ML_COOKIE_* ou ML_COOKIES)")
    print()
    print("💡 Consulte o arquivo CONFIGURAR_AFILIADO_ML.md para instruções detalhadas")
    print()

print("=" * 80)
print("✅ Teste concluído!")
print("=" * 80)
