# JAdventureEngine

Web app per **creare e giocare avventure grafiche punta-e-clicca** direttamente dal browser.

🌐 **Sito online:** [jadventureengine.it](https://jadventureengine.it)

Progetto di tesi di laurea in Ingegneria Informatica – Università Roma Tre.

---

## Funzionalità

### Gioco
- Scene con sfondo e oggetti interattivi, con hotspot poligonali
- Menu radiale delle azioni: **guarda, apri, prendi, muovi, usa, parla, usa con**
- Inventario, con trascinamento degli oggetti per combinarli tra loro o con la scena
- Dialoghi a scelta multipla con i personaggi
- Enigmi con inserimento di testo e tastierini numerici cliccabili
- Salvataggi manuali e salvataggio automatico, con ripresa della partita
- Timer di gioco, finali multipli e classifica per tempo di completamento
- Stato della partita gestito interamente dal server: il client invia solo le azioni del giocatore

### Editor
- Creazione di avventure, scene e oggetti con caricamento delle immagini
- Disegno degli hotspot direttamente sulla scena
- Configurazione delle azioni con **precondizioni** (possesso di oggetti, flag, testo inserito) ed **effetti** (cambio scena, oggetti aggiunti/rimossi o mostrati/nascosti, flag, dialoghi, fine avventura, tastierino)
- Editor dei dialoghi ad albero, con scelte condizionate
- **Pubblicazione e versioning**: i giocatori vedono solo le versioni pubblicate, mentre l'autore continua a lavorare su una bozza

### Community
- Libreria delle avventure con ricerca, filtri e ordinamenti
- Preferiti, recensioni con valutazione a stelle, profili pubblici degli autori
- Interfaccia in **italiano e inglese**

---

## Tecnologie

| | |
|---|---|
| **Backend** | Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA / Hibernate, Flyway, MapStruct, Lombok |
| **Database** | PostgreSQL |
| **Frontend** | Angular 22, NgRx Signals, TypeScript, Bootstrap Icons |
| **Deploy** | AWS EC2 (Ubuntu), nginx come reverse proxy, HTTPS con Let's Encrypt |

---

## Architettura

```
Browser ──HTTPS──▶ nginx ──┬── /           → frontend Angular (file statici)
                           ├── /uploads/   → immagini (servite in WebP quando supportato)
                           └── /api/       → backend Spring Boot ──▶ PostgreSQL
```

Il backend espone un'API REST stateless autenticata con JWT. Il frontend è una single page application che comunica con il backend tramite `/api`.

---

## Struttura del repository

```
backend/    Spring Boot (controller, service, repository, model, DTO, mapper)
            └── src/main/resources/db/migration   migrazioni Flyway del database
frontend/   Angular (features: adventures, gameplay, scene-editor, dialogue-editor, profile, ...)
```

---

## Avvio in locale

### Requisiti
- Java 21
- Node.js e npm
- PostgreSQL

### Database
Crea un database vuoto chiamato `adventure_db`. Le tabelle vengono create automaticamente da Flyway al primo avvio del backend.

### Backend
La configurazione di sviluppo si trova in `backend/src/main/resources/application-dev.properties`: indirizzo, utente e password del database, chiave JWT e origine CORS. Il profilo `dev` è attivo di default.

```bash
cd backend
./mvnw spring-boot:run
```

Il backend parte su `http://localhost:8080`.

### Frontend
```bash
cd frontend
npm install
npm start
```

Apri `http://localhost:4200`. In sviluppo le chiamate a `/api` e `/uploads` vengono inoltrate al backend tramite il proxy di Angular.

---

## Produzione

In produzione il backend usa il profilo `prod` e legge la configurazione da variabili d'ambiente:

| Variabile | Descrizione |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | URL JDBC del database |
| `DB_USERNAME` / `DB_PASSWORD` | credenziali del database |
| `JWT_SECRET` | chiave di firma dei token |
| `CORS_ALLOWED_ORIGINS` | origini consentite, separate da virgola |

Build:
```bash
mvn clean package -DskipTests      # backend → backend/target/backend-1.0.0-SNAPSHOT.jar
cd frontend && npm run build        # frontend → frontend/dist/frontend/browser
```

---

## Autore

**Roberto Oteri** – [GitHub](https://github.com/RobertoOteri)