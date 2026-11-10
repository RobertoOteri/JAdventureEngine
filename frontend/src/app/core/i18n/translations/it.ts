export const it = {
  common: {
    delete: 'Elimina',
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
    sessionExpired: 'La sessione è scaduta. Accedi di nuovo per continuare.',
    serverUnreachable: 'Impossibile contattare il server. Riprova tra poco.',
    generic: 'Si è verificato un errore. Riprova.'
  },
  sidebar: {
    navAria: 'Menu principale',
    newAdventure: 'Nuova avventura',
    library: 'Libreria',
    myStories: 'Le mie storie',
    profile: 'Profilo',
    tagline: 'Crea, gioca, condividi'
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
    kicker: 'Esplora',
    title: 'Libreria Avventure',
    subtitle: 'Scegli una storia, entra nella scena e inizia a giocare.',
    searchPlaceholder: 'Cerca per titolo, descrizione o autore',
    noMatch: "Nessun'avventura corrisponde alla ricerca.",
    resetSearch: 'Azzera ricerca',
    empty: "Nessun'avventura pubblicata nella libreria."
  },
  myAdventures: {
    kicker: 'Laboratorio',
    title: 'Le Mie Avventure',
    subtitle: 'Crea, modifica e pubblica le tue avventure.',
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
    delete: 'Elimina Avventura',
    version: 'v{version}',
    draftVersion: 'Bozza v{version}'
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
    deleteTitle: 'Conferma eliminazione',
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
    kicker: 'Account',
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
      saveError: 'Errore durante il salvataggio della partita.',
      preconditionFailed: 'Non puoi compiere questa azione in questo momento.'
    }
  },

  dialogueEditor: {
    leaveTitle: 'Modifiche non salvate',
    leaveConfirm: 'Esci senza salvare',
    back: "Torna all'editor",
    title: 'Dialoghi di {name}',
    fallbackItem: 'oggetto',
    unsaved: 'Modifiche non salvate',
    saving: 'Salvataggio...',
    save: 'Salva',
    loading: 'Caricamento dialoghi...',
    confirmLeave: 'Hai modifiche non salvate. Uscire comunque?',
    nodes: 'Nodi ({count})',
    addNode: 'Nodo',
    endsHere: 'fine dialogo',
    choiceCount: '{count} scelte',
    choiceCountOne: '1 scelta',
    deleteNode: 'Elimina nodo',
    confirmDeleteNode: 'Eliminare questo nodo? Le scelte che portavano qui chiuderanno il dialogo.',
    noNodes: 'Nessun nodo. Crea il primo con il tasto "Nodo".',
    untitledNode: 'Nodo senza testo',
    nodeText: 'Testo del nodo',
    nodeTextPlaceholder: 'Cosa dice il personaggio quando si arriva a questo nodo...',
    nodeEffects: 'Effetti del nodo',
    nodeEffectsHint: 'Si attivano quando il giocatore arriva a questo nodo.',
    nodeEffectsEmpty: 'Nessun effetto: il nodo mostra solo il testo.',
    noSelection: 'Seleziona un nodo dalla lista oppure creane uno nuovo con il tasto <strong>Nodo</strong>.',
    choices: 'Scelte ({count})',
    addChoice: 'Scelta',
    untitledChoice: 'Scelta senza testo',
    preconditionCount: '{count} precondizioni',
    preconditionCountOne: '1 precondizione',
    effectCount: '{count} effetti',
    effectCountOne: '1 effetto',
    deleteChoice: 'Elimina scelta',
    choiceText: 'Testo della scelta',
    choiceTextPlaceholder: 'Cosa risponde il giocatore',
    leadsTo: 'Porta a',
    selectTarget: '-- Seleziona destinazione --',
    endDialogue: 'Fine dialogo',
    missingTarget: 'Destinazione mancante',
    deletedNode: 'Nodo eliminato',
    thisNode: '(questo nodo)',
    preconditions: 'Precondizioni',
    preconditionsHint: 'la scelta compare solo se sono tutte vere',
    effects: 'Effetti',
    effectsHint: 'si attivano quando il giocatore sceglie questa risposta',
    noChoices: 'Nessuna scelta: il dialogo termina a questo nodo.',
    feedback: {
      loadError: 'Impossibile caricare i dialoghi.',
      saved: 'Dialoghi salvati!',
      saveError: 'Errore salvataggio dialoghi.'
    }
  },
  effectsEditor: {
    selectScene: '-- Seleziona stanza di destinazione --',
    selectItem: '-- Seleziona oggetto --',
    selectHotspotItem: '-- Seleziona elemento con hotspot --',
    selectStartNode: '-- Seleziona il nodo da cui parte il dialogo --',
    noNodes: "Nessun nodo: crealo prima nell'editor dei dialoghi",
    endDialogueHint: 'Chiude il dialogo dopo aver mostrato il testo del nodo.',
    endAdventureHint: "Termina l'avventura: il giocatore vedrà la schermata di fine.",
    flagKeyPlaceholder: 'Chiave (es. punteggio)',
    flagValuePlaceholder: 'Valore (es. 100 o true)',
    remove: 'Rimuovi effetto',
    empty: 'Nessun effetto impostato.',
    add: 'Aggiungi effetto'
  },
  preconditionsEditor: {
    flagNamePlaceholder: 'Nome flag (es. porta_aperta)',
    expectedValuePlaceholder: 'Valore atteso (es. true o 100)',
    remove: 'Rimuovi precondizione',
    empty: 'Nessuna precondizione impostata.',
    add: 'Aggiungi precondizione'
  },

  sceneEditor: {
    confirmDeleteItem: "Sei sicuro di voler eliminare l'oggetto #{code}?",
    actionSaveError: "Impossibile salvare l'azione.",
    confirmDeleteAction: 'Vuoi rimuovere questa azione?',
    textboxPlaceholder: 'Inserisci testo...',
    header: {
      back: "Torna all'elenco avventure",
      adventures: 'Avventure',
      editInfo: 'Modifica informazioni avventura',
      draftTitle: 'Stai modificando questa bozza: i giocatori vedono solo le versioni pubblicate',
      draft: 'Bozza v{version}',

      publishTitle: 'Rendi giocabile la bozza attuale come nuova versione',
      publish: 'Pubblica',
      noScene: 'Stanza non selezionata',
      confirmPublishTitle: 'Pubblicare la bozza?',
      confirmPublishMessage: 'La bozza diventerà la versione {version}, giocabile da tutti. Le versioni già pubblicate restano disponibili e continuerai a lavorare su una nuova bozza.',
      publishError: 'Pubblicazione non riuscita',
      publishSuccess: 'Avventura pubblicata. Ora stai modificando una nuova bozza.'
    },
    sidebar: {
      scenes: 'Scene ({count})',
      addScene: 'Aggiungi Nuova Stanza',
      deleteScene: 'Elimina stanza',
      noScenes: 'Nessuna stanza presente',
      objects: 'Oggetti ({count})',
      addObject: 'Aggiungi Nuovo Oggetto (di scena o globale)',
      globalInventory: 'Inventario Globale',
      tagGlobal: 'GLOBAL',
      tagInventory: 'INV',
      noObjects: 'Nessun oggetto',
      confirmDeleteScene: 'Sei sicuro di voler eliminare la stanza "{name}"?'
    },
    sceneForm: {
      cancelTitle: 'Annulla creazione',
      initialBadge: 'Scena Iniziale',
      newBadge: 'Nuova Scena',
      saving: 'Salvataggio...',
      submit: 'Conferma e Salva',
      initialTitle: 'Configura Scena Iniziale',
      newTitle: 'Crea Nuova Scena',
      initialSubtitle: 'Questa stanza sarà il punto di partenza del giocatore per la tua avventura.',
      newSubtitle: "Aggiungi una nuova stanza all'avventura e definisci il suo identificativo univoco.",
      nameLabel: 'Nome della Scena *',
      namePlaceholder: 'es. Atrio del Faro, Bosco Oscuro, Studio...',
      nameRequired: 'Il nome della stanza è obbligatorio.',
      codeLabel: 'Codice Univoco Scena (ID) *',
      codePlaceholder: 'es. atrio_faro, bosco_notte',
      initialCodeHint: 'ID di avvio predefinito del motore di gioco.',
      codeHint: 'Utilizzato negli hotspot per indirizzare transizioni verso questa stanza.',
      codeInvalid: 'Consentiti solo caratteri minuscoli, cifre e underscore (_).',
      backgroundLabel: 'Sfondo della Stanza *',
      backgroundDropTitle: 'Trascina lo sfondo della stanza qui',
      backgroundDropSubtitle: 'oppure clicca per sfogliare i file',
      backgroundHint: 'PNG, JPG o WEBP consigliati in alta definizione (16:9)',
      loadError: "Impossibile caricare i dati dell'avventura.",
      backgroundRequired: 'Lo sfondo della stanza è obbligatorio.',
      missingAdventure: "Identificativo dell'avventura non disponibile. Riprova.",
      saveError: 'Errore nel salvataggio della stanza.'
    },
    canvas: {
      loading: 'Caricamento scena...',
      spriteDraftAlt: 'Bozza Sprite',
      moveBoth: 'Sposta su entrambi gli assi',
      moveX: 'Sposta asse X',
      moveY: 'Sposta asse Y',
      scaleBoth: 'Stretch libero diagonale',
      scaleX: 'Stretch larghezza (X)',
      scaleY: 'Stretch altezza (Y)',
      dropSprite: 'Rilascia lo sprite qui',
      noSceneTitle: 'Nessuna Scena Selezionata',
      noSceneText: 'Crea o seleziona una stanza per iniziare a configurarla.',
      addScene: 'Aggiungi Scena'
    },
    gizmo: {
      vertices: '{count} vertici',
      undoVertex: 'Annulla ultimo vertice (Ctrl+Z)',
      select: 'Selezione (Cursore)',
      move: 'Sposta Sprite (Assi X/Y)',
      scale: 'Ridimensiona Sprite',
      hotspot: 'Disegna Poligono Hotspot'
    },
    feedback: {
      invalidAdventureId: 'Identificativo avventura non valido.',
      scenesLoadError: 'Impossibile caricare i dati delle scene.',
      adventureLoadError: "Impossibile caricare l'avventura richiesta.",
      detailsSaved: 'Dettagli avventura aggiornati con successo!',
      detailsSaveError: 'Errore durante il salvataggio dei dettagli.',
      itemSaved: 'Oggetto "{name}" salvato!',
      saveError: 'Errore salvataggio.',
      globalItemSaved: 'Oggetto globale "{name}" salvato con successo!',
      itemSaveError: "Errore durante il salvataggio dell'oggetto.",
      itemUpdated: 'Oggetto "{name}" aggiornato!',
      updateError: 'Errore aggiornamento.',
      publishError: 'Errore durante la pubblicazione.',
      actionAdded: 'Azione "{type}" aggiunta!',
      actionSaveError: 'Errore salvataggio azione.',
      actionUpdated: 'Azione "{type}" modificata con successo!',
      actionUpdateError: 'Errore aggiornamento azione.'
    }
  },

  enums: {
    effectType: {
      CHANGE_SCENE: 'Cambia scena',
      ADD_ITEM: "Aggiungi all'inventario",
      REMOVE_ITEM: "Rimuovi dall'inventario",
      SET_FLAG: 'Imposta flag',
      SHOW_SCENE_ITEM: 'Mostra elemento',
      HIDE_SCENE_ITEM: 'Nascondi elemento',
      END_ADVENTURE: "Termina l'avventura",
      START_DIALOGUE: 'Avvia dialogo',
      END_DIALOGUE: 'Chiudi dialogo'
    },
    preconditionType: {
      HAS_ITEM: "Ha l'oggetto",
      DOES_NOT_HAVE_ITEM: "Non ha l'oggetto",
      FLAG_EQUALS: 'Flag uguale a',
      INPUT_EQUALS: 'Testo inserito uguale a'
    },
    actionType: {
      LOOK_AT: 'Guarda',
      OPEN: 'Apri',
      PICK_UP: 'Raccogli',
      MOVE: 'Muovi',
      USE: 'Usa',
      TALK_TO: 'Parla con',
      USE_WITH: 'Usa con'
    }
  },

  inspector: {
    hotspots: 'Hotspot ({count})',
    tagInventory: 'INVENTARIO',
    tagHidden: 'NASCOSTO',
    noHotspots: 'Nessun hotspot in questa stanza',
    editItem: 'Modifica Oggetto',
    newItem: 'Nuovo Oggetto',
    noVertices: 'Senza vertici = Globale',
    nameLabel: 'Nome Oggetto *',
    namePlaceholder: 'Es. Baule Rinforzato o Chiave Dorata',
    codeLabel: 'Codice Univoco (ID) *',
    codePlaceholder: 'Es. chiave_dorata',
    description: 'Descrizione',
    descriptionPlaceholder: "Descrizione dell'oggetto...",
    spriteLabel: 'Sprite / Icona (opzionale)',
    changeImage: 'Cambia immagine...',
    chooseImage: 'Scegli immagine dal computer...',
    visibleAtStart: "Visibile all'inizio",
    hiddenAtStart: "Nascosto all'inizio",
    saveChanges: 'Salva Modifiche',
    confirmSave: 'Conferma e Salva',
    title: 'Inspector',
    editItemTitle: 'Modifica oggetto',
    deleteItemTitle: 'Elimina oggetto',
    noDescription: 'Nessuna descrizione.',
    actions: 'Azioni',
    add: 'Aggiungi',
    withTarget: 'con #{code}',
    noMessage: 'Nessun messaggio',
    editAction: 'Modifica azione',
    deleteAction: 'Elimina azione',
    noActions: 'Nessuna azione impostata.',
    dialogues: 'Dialoghi',
    dialoguesHint: 'Conversazioni a scelta multipla con questo personaggio.',
    manageDialogues: 'Gestisci dialoghi',
    empty: 'Seleziona un oggetto dalla colonna di sinistra o creane uno nuovo con il tasto <strong>+</strong>.'
  },
  actionModal: {
    targetRequired: "Seleziona l'elemento bersaglio con cui interagire.",
    editTitle: 'Modifica Azione di Gioco',
    newTitle: 'Nuova Azione di Gioco',
    subtitle: "Assegna un comportamento all'elemento",
    typeLabel: 'Tipo di Azione *',
    useWithTarget: 'Bersaglio / Oggetto con cui interagire o combinare *',
    selectTarget: '-- Seleziona elemento bersaglio --',
    successMessage: 'Messaggio di Successo (opzionale)',
    successPlaceholder: "Es. Hai sbloccato la porta con la chiave d'ottone.",
    preconditions: 'Precondizioni',
    addCondition: 'Aggiungi Condizione',
    inputSolutionPlaceholder: 'Soluzione esatta (es. 1234)',
    textBoxTitle: 'Dove appare il campo di testo',
    textBoxHint: "Trascina il box per spostarlo, l'angolo per ridimensionarlo, o disegna un nuovo rettangolo sullo sfondo.",
    noBackground: 'Seleziona una scena con uno sfondo per posizionare il box.',
    decreaseSize: 'Riduci dimensione',
    increaseSize: 'Aumenta dimensione',
    textColor: 'Colore del testo',
    preciseValues: 'Valori precisi',
    width: 'Larghezza',
    height: 'Altezza',
    failurePlaceholder: 'Messaggio specifico se non soddisfatta (opzionale)...',
    noPreconditions: "Nessuna precondizione impostata: l'azione sarà sempre eseguibile.",
    effects: 'Effetti di Gioco',
    noDialogue: 'Nessun dialogo salvato per questo oggetto. Crealo con "Gestisci dialoghi" e salvalo.',
    noEffects: "Nessun effetto impostato: l'azione mostrerà solo il messaggio.",
    saveChanges: 'Salva Modifiche',
    saveAction: 'Salva Azione',
    colors: {
      white: 'Bianco',
      black: 'Nero',
      yellow: 'Giallo',
      red: 'Rosso',
      green: 'Verde',
      blue: 'Azzurro',
      orange: 'Arancione',
      custom: 'Personalizzato'
    }
  },

  api: {
    error: {
      generic: {
        internal: 'Si è verificato un errore interno del server',
        badRequest: 'Richiesta non valida',
        conflict: "Impossibile completare l'operazione",
        duplicate: 'Esiste già un elemento con questi dati'
      },
      validation: {
        generic: 'Dati non validi'
      },
      auth: {
        invalidCredentials: 'Credenziali non valide',
        usernameTaken: "L'username '{0}' è già in uso",
        emailTaken: "L'email '{0}' è già associata a un account",
        notAuthenticated: 'Operazione non consentita: utente non autenticato',
        notOwner: 'Accesso negato: non sei il proprietario di questa risorsa',
        forbidden: 'Accesso negato'
      },
      user: {
        authenticatedNotFound: 'Utente autenticato non trovato: {0}'
      },
      adventure: {
        notFoundById: 'Avventura non trovata con ID: {0}',
        titleTaken: "Esiste già un'avventura con questo titolo",
        noStartScene: "L'avventura non ha una scena iniziale configurata",
        versionPublished: 'Questa versione è pubblicata e non può essere modificata',
        publishNoScenes: "Impossibile pubblicare: l'avventura non contiene scene",
        publishInvalidStartScene: 'Impossibile pubblicare: scena iniziale non impostata o non valida'
      },
      scene: {
        notFoundById: 'Scena non trovata con ID: {0}',
        notFoundByCode: 'Scena non trovata: {0}',
        codeTaken: "Esiste già una scena con il codice '{0}' in questa avventura"
      },
      item: {
        notFoundById: 'Oggetto non trovato con ID: {0}',
        hotspotRequired: 'Un oggetto aggiunto alla scena deve avere un hotspot con dei punti validi',
        codeTaken: "Esiste già un oggetto con il codice '{0}' in questa avventura"
      },
      action: {
        notFoundById: 'Azione non trovata con ID: {0}',
        notFoundByCode: 'Azione non trovata con codice: {0}',
        typeMismatch: 'Tipo di azione non corrispondente: atteso {0} ma ricevuto {1}',
        duplicateType: "L'oggetto ha già un'azione di tipo {0}",
        duplicateUseWith: "Esiste già un'azione USE_WITH verso l'oggetto: {0}",
        useWithTargetRequired: "Per l'azione USE_WITH è obbligatorio specificare targetItemCode",
        duringDialogue: 'Non puoi compiere azioni durante un dialogo'
      },
      game: {
        stateMissing: 'Stato di gioco mancante',
        stateOrAdventureMissing: 'Stato di gioco o avventura mancante',
        alreadyEnded: "L'avventura è già conclusa"
      },
      save: {
        notFound: 'Salvataggio non trovato: {0}',
        noneForAdventure: "Nessun salvataggio trovato per l'avventura: {0}",
        autosaveNotFound: 'Autosave non trovato per questa avventura'
      },
      dialogue: {
        nodeNotFound: 'Nodo di dialogo non trovato: {0}',
        targetNodeNotFound: 'Nodo di destinazione inesistente: {0}',
        noneActive: 'Nessun dialogo in corso',
        invalidChoice: 'Scelta non valida per il nodo corrente',
        choiceUnavailable: 'Scelta non disponibile'
      },
      upload: {
        imageRequired: "Seleziona un'immagine",
        missingExtension: "Il file caricato non ha un'estensione valida",
        unsupportedFormat: 'Formato file non supportato. Estensioni consentite: {0}'
      }
    },
    validation: {
      firstName: {
        required: 'Il nome è obbligatorio',
        size: 'Il nome può contenere al massimo 50 caratteri'
      },
      lastName: {
        required: 'Il cognome è obbligatorio',
        size: 'Il cognome può contenere al massimo 50 caratteri'
      },
      email: {
        required: "L'email è obbligatoria",
        invalid: 'Inserisci un indirizzo email valido',
        size: "L'email può contenere al massimo 255 caratteri"
      },
      username: {
        required: 'Lo username è obbligatorio',
        size: 'Lo username deve contenere dai 3 ai 50 caratteri',
        pattern: 'Lo username può contenere solo lettere, numeri e i caratteri _ . -'
      },
      login: {
        identifier: {
          required: 'Inserisci username o email'
        }
      },
      password: {
        required: 'La password è obbligatoria',
        size: 'La password deve contenere almeno 8 caratteri'
      },
      bio: {
        size: 'La biografia può contenere al massimo 500 caratteri'
      },
      description: {
        size: 'La descrizione non può superare i 1000 caratteri'
      },
      adventure: {
        id: {
          required: "L'id dell'avventura è obbligatorio"
        }
      },
      gameState: {
        required: 'Lo stato di gioco è obbligatorio'
      },
      action: {
        code: {
          required: "Il codice dell'azione è obbligatorio",
          size: 'Il codice non può superare i 255 caratteri'
        },
        type: {
          required: 'Il tipo di azione è obbligatorio'
        }
      },
      effect: {
        type: {
          required: 'Il tipo di effetto è obbligatorio'
        }
      },
      precondition: {
        type: {
          required: 'Il tipo di precondizione è obbligatorio'
        },
        key: {
          required: 'La chiave richiesta è obbligatoria'
        }
      },
      item: {
        code: {
          required: "Il codice dell'item è obbligatorio",
          size: "Il codice dell'item non può superare i 50 caratteri"
        },
        name: {
          required: "Il nome dell'item è obbligatorio",
          size: "Il nome dell'item non può superare i 100 caratteri"
        }
      },
      scene: {
        code: {
          required: 'Il codice della scena è obbligatorio',
          size: 'Il codice della scena non può superare i 50 caratteri'
        },
        name: {
          required: 'Il nome della scena è obbligatorio',
          size: 'Il nome della scena non può superare i 100 caratteri'
        }
      },
      hotspot: {
        points: {
          size: 'I punti non possono superare i 1000 caratteri'
        }
      }
    }
  },

  topbar: {
    home: 'Vai alla libreria',
    myProfile: 'Il mio profilo',
    logout: 'Esci'
  },

  footer: {
    phone: 'Telefono',
    instagram: 'Instagram',
    email: 'Email',
    rights: '© {year} Tutti i diritti riservati'
  },

};
