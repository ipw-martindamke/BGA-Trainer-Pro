# 🚀 Deployment-Anleitung: BGA-Trainer Pro Zertifikatsvalidierung

## 📋 Übersicht

Diese Anleitung zeigt dir, wie du die **datenschutzkonforme Zertifikatsvalidierung** für dein BGA-Trainer Pro Tool auf GitHub Pages einrichtest.

---

## ✅ Was du bekommst:

1. **Validierungsseite** (`certificate-validation.html`)
2. **Aktualisiertes BGA-Tool** mit korrekten QR-Code-Links
3. **Kostenlose Hosting-Lösung** (GitHub Pages)

---

## 🔧 Setup-Schritte

### **Schritt 1: Dateien ins Repository hochladen**

```bash
# Navigiere zu deinem lokalen Repository
cd /pfad/zu/bga_coach

# Füge die neuen Dateien hinzu
git add certificate-validation.html
git add BGA-Trainer_Pro__100_Fälle_.html

# Committe die Änderungen
git commit -m "Zertifikatsvalidierung hinzugefügt + QR-Links korrigiert"

# Push zu GitHub
git push origin main
```

---

### **Schritt 2: GitHub Pages aktivieren**

1. Gehe zu deinem Repository: `https://github.com/ipw-martindamke/bga_coach`
2. Klicke auf **Settings** (Zahnrad-Symbol oben rechts)
3. Scrolle zu **Pages** (linke Seitenleiste)
4. Unter **Source** wähle: **Branch: main** → **/ (root)** → **Save**
5. Warte 1-2 Minuten → Deine Seite ist live unter:
   ```
   https://ipw-martindamke.github.io/bga_coach/
   ```

---

### **Schritt 3: Teste die Validierung**

1. **BGA-Tool öffnen:**
   ```
   https://ipw-martindamke.github.io/bga_coach/BGA-Trainer_Pro__100_Fälle_.html
   ```

2. **Zertifikat erstellen** (Bronze/Silver/Gold erreichen)

3. **QR-Code scannen** → Sollte zur Validierungsseite führen

4. **Manueller Test:** Öffne direkt:
   ```
   https://ipw-martindamke.github.io/bga_coach/certificate-validation.html?cert=BGA-2025-BRONZE-MHU2AFQNNNXW
   ```
   → Sollte "Zertifikat ist gültig" anzeigen ✅

---

## 🛡️ Datenschutz-Features (bereits implementiert)

✅ **Keine personenbezogenen Daten:** Nur Zertifikatsnummer wird übertragen  
✅ **Keine Datenbank:** Format-Validierung erfolgt rein clientseitig  
✅ **Kein Tracking:** Keine Cookies, keine Analytics  
✅ **DSGVO-konform:** GitHub Pages (EU-Server möglich via Custom Domain)  

---

## 🔐 Wie die Validierung funktioniert

### **Zertifikatssnummer-Formate:**

**Format 1 (aktuell):**
```
BGA-2025-BRONZE-MHU2AFQNNNXW
     ↓     ↓        ↓
   Jahr  Level   Hash (8+ Zeichen)
```

**Format 2 (Legacy):**
```
BGA-20250111-A1B2C3D4
      ↓        ↓
    Datum    Hash (8+ Zeichen)
```

### **Validierungslogik:**
1. ✅ Prüft **Format-Korrektheit** (beide Formate werden akzeptiert)
2. ✅ Zeigt **Ausstellungsjahr** oder **Ausstellungsdatum**
3. ✅ Zeigt **Kompetenzstufe** (bei Format 1: BRONZE/SILVER/GOLD)
4. ✅ Bestätigt **Authentizität** (Format = offizielles System)
5. ❌ **Keine Personendaten** sichtbar

---

## 🎨 Optional: Custom Domain einrichten

Wenn du `ipw-schulungen.de` nutzen möchtest:

1. **DNS-Einstellungen** (bei deinem Domain-Provider):
   ```
   CNAME   validate   ipw-martindamke.github.io
   ```

2. **GitHub Pages Custom Domain:**
   - Settings → Pages → Custom Domain: `validate.ipw-schulungen.de`
   - HTTPS erzwingen: ✅

3. **Dann wäre die URL:**
   ```
   https://validate.ipw-schulungen.de/certificate-validation.html?cert=...
   ```

---

## 📱 QR-Code-Generierung (bereits implementiert)

Der QR-Code wird automatisch generiert mit:
```javascript
const validationURL = `https://ipw-martindamke.github.io/bga_coach/certificate-validation.html?cert=${certNumber}`;
const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(validationURL)}`;
```

---

## ✅ Checkliste vor Go-Live

- [ ] Dateien ins Repository gepusht
- [ ] GitHub Pages aktiviert
- [ ] Validierungsseite erreichbar
- [ ] QR-Code generiert und scanbar
- [ ] Testvalidierung durchgeführt (gültige + ungültige Nummer)
- [ ] Datenschutz-Hinweis auf Zertifikat sichtbar

---

## 🆘 Troubleshooting

| Problem | Lösung |
|---------|--------|
| **404 beim QR-Scan** | GitHub Pages noch nicht aktiv? Warte 2 Min. |
| **QR zeigt alte URL** | Browser-Cache leeren + Zertifikat neu generieren |
| **"Ungültig" obwohl korrekt** | Format prüfen: `BGA-YYYY-LEVEL-HASH` oder `BGA-YYYYMMDD-HASH` |

---

## 📞 Support

Bei Fragen zur Einrichtung: **info@ipw-schulungen.de**

---

**Status:** ✅ Ready für Deployment!  
**Datenschutz:** ✅ DSGVO-konform  
**Kosten:** ✅ Kostenlos (GitHub Pages)
