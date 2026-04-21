import os
import re

# Master header with Multi-Branch Dropdown logic
master_header = """    <header class="header">
        <div class="header-left">
            <div class="sidebar-toggle-box">
                <i class="fa-solid fa-bars"></i>
            </div>
            <div class="logo-area">
                <span class="brand-text" data-i18n="word.company_name">MAKFA GIDA ÜRÜNLERİ SANAYİ TİCARET ANONİM ŞİRKETİ</span>
            </div>
        </div>
        <div class="header-right">
            <div class="header-item header-lang-dropdown" onclick="toggleLanguageMenu(event)">
                <i class="fa-solid fa-flag"></i> <span id="header-lang-text">Language</span>
                <div class="header-lang-menu" id="header-lang-menu">
                    <div class="header-lang-item" onclick="setLanguage('tr')"><i class="fa-solid fa-flag"></i> Türkçe</div>
                    <div class="header-lang-item" onclick="setLanguage('en')"><i class="fa-solid fa-flag-usa"></i> English</div>
                    <div class="header-lang-item" onclick="setLanguage('de')"><i class="fa-solid fa-flag"></i> Deutsch (Almanca)</div>
                    <div class="header-lang-item" onclick="setLanguage('ru')"><i class="fa-solid fa-flag"></i> Русский (Русча)</div>
                    <div class="header-lang-item" onclick="setLanguage('zh')"><i class="fa-solid fa-flag"></i> 中文 (Çince)</div>
                </div>
            </div>
            <div class="header-item" style="cursor: pointer;" onclick="window.history.back()"><i class="fa-solid fa-reply"></i> <span data-i18n="header.back">Geri Dön</span></div>
            <div class="header-item" style="cursor: pointer;" title="Ekranı Kilitle" onclick="window.location.href='kilit_ekrani.html'"><i class="fa-solid fa-lock"></i></div>
            <div class="header-item"><i class="fa-solid fa-circle-info"></i></div>
            
            <!-- Branch Switcher Dropdown -->
            <div class="header-item header-lang-dropdown" onclick="toggleBranchMenu(event)">
                <i class="fa-solid fa-building"></i> <span id="header-branch-text">Merkez</span>
                <div class="header-lang-menu" id="branch-dropdown-menu">
                    <!-- Dynamic branches from JS -->
                </div>
            </div>

            <div class="header-item" style="cursor: pointer;" onclick="window.location.href='ajanda.html'"><i class="fa-solid fa-calendar-days"></i> 2026</div>
            <div class="header-item user-item" onclick="toggleUserMenu(event)">
                <i class="fa-solid fa-user"></i> 
                <span>fevziye.mamak35@gmail.com</span>
                <div class="user-dropdown-menu" id="user-dropdown-menu">
                    <div class="user-dropdown-item" onclick="window.location.href='profil.html'"><i class="fa-solid fa-user-gear"></i> <span data-i18n="user.profile">Profilim</span></div>
                    <div class="user-dropdown-item" onclick="switchUser()"><i class="fa-solid fa-people-arrows"></i> <span data-i18n="user.switch">Kullanıcı Değiştir</span></div>
                    <hr>
                    <div class="user-dropdown-item logout" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> <span data-i18n="user.logout">Çıkış Yap</span></div>
                </div>
            </div>
        </div>
    </header>"""

def fix_files():
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html') and file != 'login.html':
                path = os.path.join(root, file)
                try:
                    with open(path, 'rb') as f:
                        content_bytes = f.read()
                    
                    try:
                        content = content_bytes.decode('utf-8-sig')
                    except:
                        try:
                            content = content_bytes.decode('utf-8')
                        except:
                            content = content_bytes.decode('latin-1')
                    
                    new_content = re.sub(r'(?s)<header class="header">.*?</header>', master_header, content)
                    
                    if content != new_content:
                        with open(path, 'w', encoding='utf-8-sig') as f:
                            f.write(new_content)
                        print(f"Updated header (Branch Menu): {file}")
                except Exception as e:
                    print(f"Error {file}: {e}")

if __name__ == "__main__":
    fix_files()
