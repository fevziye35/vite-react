import os

with open('translations.js', 'r', encoding='utf-8') as f:
    js = f.read()

additions = {
    "'tr': {": """        'satis.new_customer': 'Yeni Cari Ekle',
        'satis.choose_customer': 'Satış Yapılacak Cari Seçimi',
        'satis.select_customer': 'Cari Seç',
        'word.islem': 'İşlem',
        'word.unvan': 'Ünvan',
        'word.yetkili': 'Yetkili',
        'word.sil': 'Sil',
""",
    "'en': {": """        'satis.new_customer': 'Add New Customer',
        'satis.choose_customer': 'Select Customer for Sale',
        'satis.select_customer': 'Select',
        'word.islem': 'Action',
        'word.unvan': 'Title',
        'word.yetkili': 'Contact',
        'word.sil': 'Delete',
""",
    "'de': {": """        'satis.new_customer': 'Neuen Kunden hinzufügen',
        'satis.choose_customer': 'Kunden für Verkauf auswählen',
        'satis.select_customer': 'Auswählen',
        'word.islem': 'Aktion',
        'word.unvan': 'Titel',
        'word.yetkili': 'Kontakt',
        'word.sil': 'Löschen',
""",
    "'ru': {": """        'satis.new_customer': 'Добавить нового клиента',
        'satis.choose_customer': 'Выберите клиента для продажи',
        'satis.select_customer': 'Выбрать',
        'word.islem': 'Действие',
        'word.unvan': 'Название',
        'word.yetkili': 'Контакт',
        'word.sil': 'Удалить',
""",
    "'zh': {": """        'satis.new_customer': '添加新客户',
        'satis.choose_customer': '选择销售客户',
        'satis.select_customer': '选择',
        'word.islem': '操作',
        'word.unvan': '标题',
        'word.yetkili': '联系人',
        'word.sil': '删除',
"""
}

if "'satis.new_customer'" not in js:
    for target, extra in additions.items():
        js = js.replace(target, target + "\n" + extra)
    
    with open('translations.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Injected into translations.js")
else:
    print("Already in translations.js")

# And re-bump global cache
with open('satis_yap.html', 'r', encoding='utf-8') as f:
    html = f.read()
import re
html = re.sub(r'translations\.js\?v=\d+', 'translations.js?v=600', html)
with open('satis_yap.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Bumped satis_yap.html cache version to v=600")
