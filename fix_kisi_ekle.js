const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'kisi_ekle.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Fix the JS SyntaxError
html = html.replace(/alert\("Başarılı!(\s+)Kullanıcı \(" \+ name \+ " - " \+ email \+ "\) sisteme eklendi ve giriş yetkisi tanımlandı\.(\s+)Belirlenen Şifre: " \+ pass \+ "(\s+)Sisteme giriş için kendisine kullanıcı bilgilerini iletebilirsiniz\."\);/, 
`alert("Başarılı!\\n\\nKullanıcı (" + name + " - " + email + ") sisteme eklendi ve giriş yetkisi tanımlandı.\\n\\nBelirlenen Şifre: " + pass + "\\n\\nSisteme giriş için kendisine kullanıcı bilgilerini iletebilirsiniz.");`);

// 2. Remove obsolete embedded CSS but keep grid rules and a few specifics
const newStyle = `
        <style>
            .role-admin { background: #fee2e2; color: #b91c1c; }
            .role-user { background: #e0f2fe; color: #0369a1; }
            .admin-highlight { background: #fff1f2; }
            .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
            @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
        </style>
`;

const newUI = `
        <h2 class="page-title">Sisteme Giriş ve Yetkilendirme Paneli</h2>

        <div class="mb-20" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <!-- Placeholder for potential top actions like Go Back -->
            <a href="index.html" class="btn btn-dark-blue p-20 mb-10" style="background: linear-gradient(135deg, #1f3a60 0%, #112240 100%); font-size: 15px; border: none; cursor: pointer;">
                <i class="fa-solid fa-arrow-left"></i> Giriş Ekranına Dön
            </a>
        </div>

        <div class="content-grid mb-20">
            <!-- User Table -->
            <div class="selection-section m-0">
                <div class="section-header bg-gray-header">
                    <span><i class="fa-solid fa-users"></i> Aktif Sistem Kullanıcıları</span>
                    <span style="font-size: 0.8rem; font-weight: normal; color: #64748b;">Toplam: 3 Kişi</span>
                </div>
                <div class="content-box p-0">
                    <div class="table-container">
                        <table class="customer-table w-100 m-0" style="border-radius: 0;">
                            <thead>
                                <tr class="bg-gray-header">
                                    <th class="p-15">Kullanıcı Bilgileri</th>
                                    <th>E-Posta Adresi (Giriş ID)</th>
                                    <th>Yetki Rolü</th>
                                    <th>Durum</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- ADMIN ROW -->
                                <tr class="admin-highlight">
                                    <td class="p-15">
                                        <div style="font-weight: 700; color:#1e293b;">Fevziye Mamak</div>
                                        <div style="font-size: 0.8rem; color:#ef4444;"><i class="fa-solid fa-crown"></i> Kurucu / Sahip</div>
                                    </td>
                                    <td style="font-weight: 600;">fevziye.mamak35@gmail.com</td>
                                    <td><span style="padding: 5px 12px; border-radius: 20px; font-weight: 600; font-size: 11px;" class="role-admin">PANEL YÖNETİCİSİ</span></td>
                                    <td><span style="color: #16a34a; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Aktif</span></td>
                                    <td><button onclick="resetPassword('Fevziye Mamak')" style="background: #e2e8f0; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #475569; font-weight: 600; font-size: 0.85rem;"><i class="fa-solid fa-key"></i> Şifre Değiştir</button></td>
                                </tr>
                                <!-- OTHER USERS -->
                                <tr>
                                    <td class="p-15">
                                        <div style="font-weight: 600; color:#1e293b;">Aydın Ertop</div>
                                    </td>
                                    <td>aydinertop@gmail.com</td>
                                    <td><span style="padding: 5px 12px; border-radius: 20px; font-weight: 600; font-size: 11px;" class="role-user">STANDART KULLANICI</span></td>
                                    <td><span style="color: #16a34a; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Aktif</span></td>
                                    <td><button onclick="resetPassword('Aydın Ertop')" style="background: #e2e8f0; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #475569; font-weight: 600; font-size: 0.85rem;"><i class="fa-solid fa-key"></i> Şifre Değiştir</button></td>
                                </tr>
                                <tr>
                                    <td class="p-15">
                                        <div style="font-weight: 600; color:#1e293b;">Ali Mamak</div>
                                    </td>
                                    <td>amamak1980@gmail.com</td>
                                    <td><span style="padding: 5px 12px; border-radius: 20px; font-weight: 600; font-size: 11px;" class="role-user">STANDART KULLANICI</span></td>
                                    <td><span style="color: #16a34a; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Aktif</span></td>
                                    <td><button onclick="resetPassword('Ali Mamak')" style="background: #e2e8f0; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #475569; font-weight: 600; font-size: 0.85rem;"><i class="fa-solid fa-key"></i> Şifre Değiştir</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Invite Form -->
            <div class="selection-section m-0">
                <div class="section-header bg-gray-header">
                    <i class="fa-solid fa-user-plus"></i> Yeni Kullanıcı Ekle/Davet Et
                </div>
                <div class="content-box">
                    <form onsubmit="inviteUser(event)">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-size: 0.9rem; color: #475569; margin-bottom: 5px; font-weight: 500;">Ad Soyad</label>
                            <input type="text" id="newUserName" class="form-control" placeholder="Örn: Mehmet Yılmaz" required style="width: 100%; border-radius: 6px; border: 1px solid #cbd5e1; height: 40px; padding: 8px 12px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-size: 0.9rem; color: #475569; margin-bottom: 5px; font-weight: 500;">Giriş (E-Posta) Adresi</label>
                            <input type="email" id="newUserEmail" class="form-control" placeholder="E-Posta adresi" required style="width: 100%; border-radius: 6px; border: 1px solid #cbd5e1; height: 40px; padding: 8px 12px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-size: 0.9rem; color: #475569; margin-bottom: 5px; font-weight: 500;">Yetki Rolü</label>
                            <select id="newUserRole" class="form-control" required style="width: 100%; border-radius: 6px; border: 1px solid #cbd5e1; height: 40px; padding: 8px 12px;">
                                <option value="user">Standart Kullanıcı (Sınırlı Erişim)</option>
                                <option value="admin">Panel Yöneticisi (Tam Yetki)</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-size: 0.9rem; color: #475569; margin-bottom: 5px; font-weight: 500;">Giriş Şifresi Belirle</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="newUserPassword" class="form-control" placeholder="Bir şifre girin..." required style="flex: 1; border-radius: 6px; border: 1px solid #cbd5e1; height: 40px; padding: 8px 12px;">
                                <button type="button" onclick="generatePassword()" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 15px; font-weight: 600; cursor: pointer; height: 40px;">Rastgele Üret</button>
                            </div>
                            <small style="color: #64748b; font-size:0.8rem; margin-top: 5px; display: block;">Yeni kullanıcının sisteme giriş yapacağı şifreyi belirleyin.</small>
                        </div>
                        <button type="submit" class="btn btn-dark-blue p-20" style="width: 100%; justify-content: center; margin-top: 10px; background: #10b981; border: none; font-size: 15px; cursor: pointer;">
                            <i class="fa-solid fa-paper-plane"></i> Sisteme Kaydet ve Davet Gönder
                        </button>
                    </form>
                </div>
            </div>
        </div>
`;

// Replace style
html = html.replace(/<style>[\s\S]*?<\/style>/, newStyle);

// Replace user-dashboard
html = html.replace(/<div class="user-dashboard">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newUI);


fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully modernized kisi_ekle.html and fixed SyntaxError');
