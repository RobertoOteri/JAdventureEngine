export const it = {
  common: {
    invalidValue: 'Valore non valido',
    close: 'Chiudi',
    closeWindow: 'Chiudi finestra',
    cancel: 'Annulla',
    confirm: 'Conferma',
    load: 'Carica',
    graphicAdventure: 'Avventura Grafica'
  },
  language: {
    label: 'Lingua'
  },
  errors: {
    serverUnreachable: 'Impossibile contattare il server. Riprova tra poco.',
    generic: 'Si è verificato un errore. Riprova.'
  },
  sidebar: {
    library: 'Libreria',
    myStories: 'Le mie storie',
    myProfile: 'Il mio profilo',
    logout: 'Esci'
  },
  auth: {
    modeLogin: 'Accedi',
    modeRegister: 'Registrati',
    modeAriaLabel: 'Accedi o registrati',
    loginTitle: 'Bentornato',
    registerTitle: 'Crea un account',
    loginSubtitle: 'Accedi per giocare e continuare le tue avventure.',
    registerSubtitle: 'Ti servirà per creare avventure e comparire in classifica.',
    identifier: 'Username o email',
    password: 'Password',
    firstName: 'Nome',
    lastName: 'Cognome',
    username: 'Username',
    email: 'Email',
    confirmPassword: 'Conferma password',
    showPassword: 'Mostra password',
    hidePassword: 'Nascondi password',
    usernameHint: 'È il nome che vedono gli altri giocatori.',
    passwordHint: 'Almeno 8 caratteri.',
    passwordMismatch: 'Le password non coincidono.',
    submitLogin: 'Accedi',
    submitRegister: 'Crea account',
    registered: 'Account creato. Accedi con la tua password.'
  },
  formErrors: {
    required: 'Campo obbligatorio',
    email: 'Inserisci un indirizzo email valido',
    minLength: 'Almeno {n} caratteri',
    maxLength: 'Al massimo {n} caratteri',
    usernamePattern: 'Solo lettere, numeri e i caratteri _ . -'
  },
  adventureFilter: {
    sort: {
      recent: 'Più recenti',
      oldest: 'Meno recenti',
      titleAsc: 'Titolo A-Z',
      titleDesc: 'Titolo Z-A'
    },
    publication: {
      all: 'Tutte',
      never: 'Inedite',
      published: 'Pubblicate'
    }
  },

  library: {
    title: 'Libreria Avventure',
    countFiltered: '{shown} di {total} titoli',
    count: '{count} titoli registrati',
    countOne: '1 titolo registrato',
    searchPlaceholder: 'Cerca per titolo, descrizione o autore',
    noMatch: "Nessun'avventura corrisponde alla ricerca.",
    resetSearch: 'Azzera ricerca',
    empty: "Nessun'avventura pubblicata nella libreria."
  },
  myAdventures: {
    title: 'Le Mie Avventure',
    countFiltered: '{shown} di {total} progetti',
    count: '{count} progetti personali',
    countOne: '1 progetto personale',
    create: 'Crea nuova avventura',
    searchPlaceholder: 'Cerca tra le tue avventure',
    publicationAriaLabel: 'Stato di pubblicazione',
    noMatch: "Nessun'avventura corrisponde ai filtri.",
    resetFilters: 'Azzera filtri',
    empty: 'Non hai ancora creato nessuna avventura.',
    startNow: 'Comincia ora',
    loadError: 'Impossibile caricare le tue avventure.',
    confirmDelete: 'Sei sicuro di voler eliminare definitivamente "{title}"?',
    deleteError: "Errore durante l'eliminazione dell'avventura."
  },
  adventureForm: {
    newBadge: 'Nuova Avventura',
    editBadge: 'Modifica Avventura',
    saving: 'Salvataggio...',
    saveChanges: 'Salva Modifiche',
    createAndEdit: 'Crea ed entra in Editor',
    newTitle: 'Nuova Storia',
    editTitle: 'Modifica Dettagli',
    newSubtitle: "Definisci l'identità del gioco. Potrai creare le scene nell'editor subito dopo.",
    editSubtitle: 'Aggiorna titolo, sinossi o locandina del tuo gioco.',
    titleLabel: "Titolo dell'Avventura *",
    titlePlaceholder: 'es. Il Segreto del Faro Abbandonato',
    titleRequired: 'Il titolo è obbligatorio.',
    titleMaxLength: 'Il titolo non può superare i 100 caratteri.',
    startScene: 'Scena Iniziale di Partenza',
    noStartScene: '-- Nessuna scena iniziale --',
    startSceneHint: 'Questa è la prima stanza mostrata ai giocatori quando avviano una nuova partita.',
    synopsis: 'Sinossi / Ambientazione',
    synopsisPlaceholder: "Descrivi l'atmosfera, l'incipit della storia e i suoi misteri...",
    coverLabel: 'Locandina / Copertina (16:9)',
    coverDropTitle: "Trascina la copertina dell'avventura",
    saveError: "Errore durante il salvataggio dell'avventura."
  },

  authShowcase: {
    play: 'Gioca le avventure create dagli altri giocatori.',
    create: 'Crea la tua avventura: scene, oggetti e dialoghi.',
    dialogues: 'Scrivi dialoghi con scelte che cambiano la storia.',
    publish: 'Pubblica e aggiorna le tue avventure con nuove versioni.',
    leaderboard: 'Sfida gli altri giocatori in classifica.',
    record: 'Batti il tuo record di tempo.',
    save: 'Salva la partita e riprendi quando vuoi.'
  },
  adventureCard: {
    play: 'Avvia gioco',
    details: 'Dettagli e Sinossi',
    edit: 'Modifica Avventura',
    delete: 'Elimina Avventura'
  },
  adventureDetail: {
    synopsis: 'Sinossi & Dettagli',
    noDescription: 'Nessuna descrizione fornita per questa avventura grafica.',
    version: 'Versione',
    notPublished: 'Non ancora pubblicata: puoi giocarla come anteprima.',
    leaderboard: 'Classifica',
    playNow: 'Gioca Ora'
  },
  confirmation: {
    defaultTitle: 'Sei sicuro?',
    defaultMessage: 'Questa operazione non può essere annullata.'
  },
  fileDropzone: {
    label: 'Immagine',
    title: "Trascina un'immagine qui",
    subtitle: 'oppure clicca per sfogliare',
    hint: 'Formati supportati: PNG, JPG, WEBP (Max 5MB)',
    invalidFormat: 'Seleziona un formato immagine valido (PNG, JPG, WEBP).',
    tooLarge: 'Il file supera la dimensione massima consentita.',
    previewAlt: 'Anteprima file',
    remove: 'Rimuovi Immagine'
  },
  gameLaunch: {
    subtitle: 'Seleziona come iniziare a giocare',
    continueTitle: 'Continua Partita',
    continueDesc: "Riprendi dall'ultimo punto salvato",
    continueHint: "Riprendi dall'ultimo salvataggio effettuato",
    noPreviousSave: 'Nessun salvataggio precedente trovato',
    loadTitle: 'Carica Partita',
    loadDesc: 'Scegli tra gli slot salvati ({count})',
    loadHint: 'Visualizza tutti i salvataggi',
    noSaves: 'Nessun salvataggio disponibile',
    newTitle: 'Nuova Partita',
    newDesc: "Inizia l'avventura dal principio",
    confirmNewTitle: 'Avviare una Nuova Partita?',
    confirmNewMessage: 'Attenzione: avviando una nuova partita cancellerai tutti i salvataggi di questa avventura. Sei sicuro di voler continuare?',
    confirmNewOk: 'Sì, ricomincia'
  },
  gameSaves: {
    title: 'Carica Partita',
    autosave: 'Autosalvataggio',
    autosaveName: 'Salvataggio automatico',
    room: 'Stanza',
    loadAutosave: "Carica l'autosave",
    manual: 'Salvataggi Manuali',
    loadThis: 'Carica questo salvataggio',
    noManual: 'Nessun salvataggio manuale presente.',
    none: 'Nessun salvataggio trovato per questa avventura.'
  },
  searchBar: {
    clear: 'Cancella ricerca'
  },
  versionSelect: {
    latest: 'più recente'
  },

  profile: {
    title: 'Il mio profilo',
    subtitle: 'La tua foto e i tuoi dati personali',
    changePhoto: 'Cambia foto',
    uploadPhoto: 'Carica foto',
    removePhoto: 'Rimuovi',
    personalData: 'Dati personali',
    firstName: 'Nome',
    lastName: 'Cognome',
    username: 'Username',
    email: 'Email',
    usernameLocked: 'Lo username non si può cambiare',
    note: "Lo username è visibile agli altri giocatori e non può essere modificato. L'email serve solo per accedere e non viene mostrata.",
    bio: 'Biografia',
    bioPlaceholder: 'Racconta qualcosa di te e delle avventure che crei…',
    saving: 'Salvataggio…',
    save: 'Salva modifiche',
    avatarInvalidType: "Usa un'immagine JPG, PNG o WebP.",
    avatarTooLarge: "L'immagine deve pesare al massimo 2 MB."
  },
  leaderboard: {
    title: 'Classifica',
    fallbackTitle: 'Migliori tempi',
    subtitle: 'Il miglior tempo di completamento di ogni giocatore',
    loadError: 'Impossibile caricare la classifica.',
    players: '{count} giocatori in classifica',
    playersOne: '1 giocatore in classifica',
    empty: 'Ancora nessuno ha completato questa storia. Sii il primo!'
  },

  gameplay: {
    waiting: 'In attesa...',
    timer: 'Tempo di gioco',
    topbar: {
      back: "Torna all'elenco avventure",
      lobby: 'Lobby',
      openInventory: 'Apri Inventario',
      bag: 'Borsa',
      pauseMenu: 'Menu di Pausa (ESC)',
      menu: 'Menu'
    },
    viewport: {
      backgroundAlt: 'Sfondo Scena',
      loading: 'Caricamento della scena in corso...'
    },
    dialogue: {
      choicesAria: 'Risposte possibili',
      continue: 'Continua'
    },
    inventory: {
      aria: 'Inventario',
      backpack: 'Zaino',
      noDetails: "Nessun dettaglio particolare su quest'oggetto.",
      empty: 'Il borsello è completamente vuoto...',
      medallion: 'Zaino del protagonista',
      close: 'Chiudi lo zaino'
    },
    radial: {
      lookAt: 'Guarda {item}',
      pickUp: 'Raccogli {item}',
      use: 'Usa {item}',
      open: 'Apri {item}',
      talkTo: 'Parla con {item}',
      move: 'Muovi {item}',
      interact: 'Interagisci con {item}'
    },
    drag: {
      useOn: 'Usa {item} su {target}',
      useWith: 'Usa {item} con…'
    },
    pause: {
      title: 'Menu di Pausa',
      subtitle: 'Gestione della sessione di gioco',
      resumeTitle: 'Riprendi gioco',
      resume: 'Riprendi Partita',
      save: 'Salva Partita',
      load: 'Carica Partita',
      exit: "Esci all'Elenco Avventure",
      saveName: 'Nome del Salvataggio',
      saveNamePlaceholder: 'Es. Prima della porta chiusa...',
      back: 'Indietro',
      confirmSave: 'Conferma Salvataggio',
      quickSaveName: 'Salvataggio rapido'
    },
    ending: {
      aria: "Fine dell'avventura",
      kicker: 'Avventura completata',
      time: 'Tempo impiegato',
      leaderboard: 'Visualizza la classifica',
      continue: "Riprendi dall'ultimo salvataggio",
      exit: 'Torna alle avventure'
    },
    feedback: {
      startError: 'Impossibile avviare la partita.',
      noSaveToContinue: 'Nessun salvataggio trovato per continuare.',
      loadError: 'Errore nel caricamento del salvataggio.',
      invalidSession: 'Errore: sessione di gioco non valida.',
      actionDone: 'Azione eseguita.',
      nothingHappens: 'Non succede nulla.',
      actionNotAllowed: 'Non puoi fare questa azione qui.',
      dialogueError: 'Impossibile proseguire il dialogo.',
      noEffect: 'Non sembra avere alcun effetto.',
      cannotCombine: 'Non puoi combinare questi due oggetti.',
      saved: 'Partita salvata con successo!',
      saveError: 'Errore durante il salvataggio della partita.'
    }
  },
};
