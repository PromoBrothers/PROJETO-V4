# -*- coding: utf-8 -*-
from app.anti_bot import AntiBotManager
from bs4 import BeautifulSoup

anti_bot = AntiBotManager()
url = "https://lista.mercadolivre.com.br/notebook"

response = anti_bot.make_request(url)
print(f"Status: {response.status_code}")
print(f"Content-Encoding: {response.headers.get('content-encoding', 'none')}")
print(f"Tamanho response.content: {len(response.content)} bytes")
print(f"Tamanho response.text: {len(response.text)} chars")

soup1 = BeautifulSoup(response.content, 'html.parser')
soup2 = BeautifulSoup(response.text, 'html.parser')

items1 = soup1.select('li.ui-search-layout__item')
items2 = soup2.select('li.ui-search-layout__item')

print(f"\ncom response.content: {len(items1)} itens")
print(f"com response.text: {len(items2)} itens")

# Verificar se response.text está correto
if len(items2) > 0:
    print("\n✓ response.text funciona!")
    item = items2[0]
    title = item.select_one('a.poly-component__title')
    if title:
        print(f"Titulo: {title.get_text(strip=True)[:60]}")
else:
    print("\nPrimeiros 200 chars de response.text:")
    print(response.text[:200])
