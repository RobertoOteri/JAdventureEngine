import { Translations } from '../i18n.types';

export const en: Translations = {
  common: {
    delete: 'Delete',
    invalidValue: 'Invalid value',
    close: 'Close',
    closeWindow: 'Close window',
    cancel: 'Cancel',
    confirm: 'Confirm',
    load: 'Load',
    graphicAdventure: 'Graphic Adventure'
  },
  language: {
    label: 'Language'
  },
  errors: {
    sessionExpired: 'Your session has expired. Please sign in again to continue.',
    serverUnreachable: 'Unable to reach the server. Please try again shortly.',
    generic: 'Something went wrong. Please try again.'
  },
  sidebar: {
    navAria: 'Main menu',
    newAdventure: 'New adventure',
    library: 'Library',
    myStories: 'My stories',
    favorites: 'Favorites',
    profile: 'Profile',
    tagline: 'Create, play, share'
  },
  auth: {
    modeLogin: 'Log in',
    modeRegister: 'Sign up',
    modeAriaLabel: 'Log in or sign up',
    loginTitle: 'Welcome back',
    registerTitle: 'Create an account',
    loginSubtitle: 'Log in to play and continue your adventures.',
    registerSubtitle: "You'll need it to create adventures and appear on the leaderboard.",
    identifier: 'Username or email',
    password: 'Password',
    firstName: 'First name',
    lastName: 'Last name',
    username: 'Username',
    email: 'Email',
    confirmPassword: 'Confirm password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    usernameHint: 'This is the name other players will see.',
    passwordHint: 'At least 8 characters.',
    passwordMismatch: "Passwords don't match.",
    submitLogin: 'Log in',
    submitRegister: 'Create account',
    registered: 'Account created. Log in with your password.'
  },
  formErrors: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'At least {n} characters',
    maxLength: 'At most {n} characters',
    usernamePattern: 'Only letters, numbers and the characters _ . -'
  },
  adventureFilter: {
    sort: {
      recent: 'Newest',
      oldest: 'Oldest',
      titleAsc: 'Title A-Z',
      titleDesc: 'Title Z-A'
    },
    publication: {
      all: 'All',
      never: 'Unpublished',
      published: 'Published'
    }
  },

  library: {
    kicker: 'Explore',
    title: 'Adventure Library',
    subtitle: 'Pick a story, step into the scene and start playing.',
    searchPlaceholder: 'Search by title, description or author',
    noMatch: 'No adventures match your search.',
    resetSearch: 'Clear search',
    empty: 'No adventures published in the library yet.'
  },
  favorites: {
    kicker: 'Collection',
    title: 'Favorite Adventures',
    subtitle: 'The stories you starred, always in their latest version.',
    searchPlaceholder: 'Search your favorites',
    noMatch: 'No favorites match your search.',
    resetSearch: 'Clear search',
    empty: 'You have no favorites yet: tap the star on an adventure in the library.',
    goToLibrary: 'Go to library',
    loadError: 'Could not load your favorites',
    toggleError: 'Could not update your favorites'
  },
  myAdventures: {
    kicker: 'Workshop',
    title: 'My Adventures',
    subtitle: 'Create, edit and publish your adventures.',
    create: 'Create new adventure',
    searchPlaceholder: 'Search your adventures',
    publicationAriaLabel: 'Publication status',
    noMatch: 'No adventures match the filters.',
    resetFilters: 'Clear filters',
    empty: "You haven't created any adventures yet.",
    startNow: 'Get started',
    loadError: 'Unable to load your adventures.',
    confirmDelete: 'Are you sure you want to permanently delete "{title}"?',
    deleteError: 'Error while deleting the adventure.'
  },
  adventureForm: {
    newBadge: 'New Adventure',
    editBadge: 'Edit Adventure',
    saving: 'Saving...',
    saveChanges: 'Save changes',
    createAndEdit: 'Create and open Editor',
    newTitle: 'New Story',
    editTitle: 'Edit Details',
    newSubtitle: "Define your game's identity. You'll be able to create scenes in the editor right after.",
    editSubtitle: "Update your game's title, synopsis or poster.",
    titleLabel: 'Adventure title *',
    titlePlaceholder: 'e.g. The Secret of the Abandoned Lighthouse',
    titleRequired: 'Title is required.',
    titleMaxLength: 'Title cannot exceed 100 characters.',
    startScene: 'Starting scene',
    noStartScene: '-- No starting scene --',
    startSceneHint: 'This is the first room players see when they start a new game.',
    synopsis: 'Synopsis / Setting',
    synopsisPlaceholder: 'Describe the atmosphere, the opening of the story and its mysteries...',
    coverLabel: 'Poster / Cover (16:9)',
    coverDropTitle: 'Drag the adventure cover here',
    saveError: 'Error while saving the adventure.'
  },

  authShowcase: {
    play: 'Play adventures created by other players.',
    create: 'Create your own adventure: scenes, items and dialogues.',
    dialogues: 'Write dialogues with choices that change the story.',
    publish: 'Publish your adventures and update them with new versions.',
    leaderboard: 'Challenge other players on the leaderboard.',
    record: 'Beat your best time.',
    save: 'Save your game and pick it up whenever you like.'
  },
  adventureCard: {
    play: 'Start game',
    details: 'Details and synopsis',
    edit: 'Edit adventure',
    delete: 'Delete adventure',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites'
  },
  adventureDetail: {
    synopsis: 'Synopsis & Details',
    noDescription: 'No description provided for this graphic adventure.',
    notPublished: 'Not published yet: you can play it as a preview.',
    leaderboard: 'Leaderboard',
    playNow: 'Play now',
    version: 'Version',
    by: 'by',
    author: 'Author',
    publishedAt: 'Published on',
    createdAt: 'Created on',
    code: 'Code'
  },
  confirmation: {
    deleteTitle: 'Confirm deletion',
    defaultTitle: 'Are you sure?',
    defaultMessage: 'This action cannot be undone.'
  },
  fileDropzone: {
    label: 'Image',
    title: 'Drag an image here',
    subtitle: 'or click to browse',
    hint: 'Supported formats: PNG, JPG, WEBP (Max 5MB)',
    invalidFormat: 'Please select a valid image format (PNG, JPG, WEBP).',
    tooLarge: 'The file exceeds the maximum allowed size.',
    previewAlt: 'File preview',
    remove: 'Remove image'
  },
  gameLaunch: {
    subtitle: 'Choose how to start playing',
    version: 'Version',
    continueTitle: 'Continue',
    continueDesc: 'Resume from your last save point',
    continueHint: 'Resume from your most recent save',
    noPreviousSave: 'No previous save found',
    loadTitle: 'Load game',
    loadDesc: 'Choose from your save slots ({count})',
    loadHint: 'View all saves',
    noSaves: 'No saves available',
    newTitle: 'New game',
    newDesc: 'Start the adventure from the beginning',
    confirmNewTitle: 'Start a new game?',
    confirmNewMessage: 'Warning: starting a new game will delete all saves for this adventure. Do you want to continue?',
    confirmNewOk: 'Yes, start over'
  },
  gameSaves: {
    title: 'Load game',
    autosave: 'Autosave',
    autosaveName: 'Autosave',
    room: 'Room',
    loadAutosave: 'Load the autosave',
    manual: 'Manual saves',
    loadThis: 'Load this save',
    noManual: 'No manual saves yet.',
    none: 'No saves found for this adventure.'
  },
  searchBar: {
    clear: 'Clear search'
  },
  versionSelect: {
    latest: 'latest',
    draft: 'draft'
  },

  profile: {
    kicker: 'Account',
    title: 'My profile',
    subtitle: 'Your photo and personal details',
    changePhoto: 'Change photo',
    uploadPhoto: 'Upload photo',
    removePhoto: 'Remove',
    personalData: 'Personal details',
    firstName: 'First name',
    lastName: 'Last name',
    username: 'Username',
    email: 'Email',
    usernameLocked: "The username can't be changed",
    note: 'Your username cannot be changed. Your name, email and bio are visible to other players on your public profile.',
    bio: 'Bio',
    bioPlaceholder: 'Tell us something about yourself and the adventures you create…',
    saving: 'Saving…',
    save: 'Save changes',
    avatarInvalidType: 'Please use a JPG, PNG or WebP image.',
    avatarTooLarge: 'The image must be 2 MB or smaller.'
  },
  userProfile: {
    kicker: 'Player profile',
    edit: 'Edit profile',
    published: 'Published adventures',
    completed: 'Completed adventures',
    reviews: 'Reviews written',
    bio: 'Bio',
    noBio: 'No bio yet.',
    adventures: 'Published adventures',
    noAdventures: 'Has not published any adventures yet.'
  },
  leaderboard: {
    title: 'Leaderboard',
    fallbackTitle: 'Best times',
    subtitle: "Each player's best completion time",
    loadError: 'Unable to load the leaderboard.',
    players: '{count} players on the leaderboard',
    playersOne: '1 player on the leaderboard',
    empty: 'Nobody has completed this story yet. Be the first!'
  },

  gameplay: {
    waiting: 'Waiting...',
    timer: 'Play time',
    topbar: {
      back: 'Back to the adventure list',
      lobby: 'Lobby',
      openInventory: 'Open inventory',
      bag: 'Bag',
      pauseMenu: 'Pause menu (ESC)',
      menu: 'Menu'
    },
    viewport: {
      backgroundAlt: 'Scene background',
      loading: 'Loading scene...'
    },
    dialogue: {
      choicesAria: 'Possible answers',
      continue: 'Continue'
    },
    inventory: {
      aria: 'Inventory',
      backpack: 'Backpack',
      noDetails: 'Nothing special about this item.',
      empty: 'Your pouch is completely empty...',
      medallion: "Hero's backpack",
      close: 'Close backpack'
    },
    radial: {
      lookAt: 'Look at {item}',
      pickUp: 'Pick up {item}',
      use: 'Use {item}',
      open: 'Open {item}',
      talkTo: 'Talk to {item}',
      move: 'Move {item}',
      interact: 'Interact with {item}'
    },
    drag: {
      useOn: 'Use {item} on {target}',
      useWith: 'Use {item} with…'
    },
    pause: {
      title: 'Pause Menu',
      subtitle: 'Manage your game session',
      resumeTitle: 'Resume game',
      resume: 'Resume game',
      save: 'Save game',
      load: 'Load game',
      exit: 'Exit to adventure list',
      saveName: 'Save name',
      saveNamePlaceholder: 'e.g. Before the locked door...',
      back: 'Back',
      confirmSave: 'Confirm save',
      quickSaveName: 'Quick save'
    },
    ending: {
      aria: 'End of the adventure',
      kicker: 'Adventure completed',
      time: 'Time taken',
      leaderboard: 'View leaderboard',
      exit: 'Back to adventures',
      rateTitle: 'How was the adventure?',
      sendReview: 'Send review',
      reviewThanks: 'Thanks for your review!',
      seeReviews: 'See the reviews'
    },
    feedback: {
      startError: 'Unable to start the game.',
      noSaveToContinue: 'No save found to continue from.',
      loadError: 'Error while loading the save.',
      invalidSession: 'Error: invalid game session.',
      nothingHappens: 'Nothing happens.',
      actionNotAllowed: "You can't do that here.",
      dialogueError: 'Unable to continue the dialogue.',
      noEffect: "It doesn't seem to have any effect.",
      cannotCombine: "You can't combine these two items.",
      saved: 'Game saved successfully!',
      saveError: 'Error while saving the game.',
      preconditionFailed: "You can't do that right now."
    }
  },

  dialogueEditor: {
    leaveTitle: 'Unsaved changes',
    leaveConfirm: 'Leave without saving',
    back: 'Back to editor',
    title: 'Dialogues of {name}',
    fallbackItem: 'item',
    unsaved: 'Unsaved changes',
    saving: 'Saving...',
    save: 'Save',
    loading: 'Loading dialogues...',
    confirmLeave: 'You have unsaved changes. Leave anyway?',
    nodes: 'Nodes ({count})',
    addNode: 'Node',
    endsHere: 'end of dialogue',
    choiceCount: '{count} choices',
    choiceCountOne: '1 choice',
    deleteNode: 'Delete node',
    confirmDeleteNode: 'Delete this node? Choices leading here will end the dialogue.',
    noNodes: 'No nodes yet. Create the first one with the "Node" button.',
    untitledNode: 'Untitled node',
    nodeText: 'Node text',
    nodeTextPlaceholder: 'What the character says when this node is reached...',
    nodeEffects: 'Node effects',
    nodeEffectsHint: 'Triggered when the player reaches this node.',
    nodeEffectsEmpty: 'No effects: the node only shows its text.',
    noSelection: 'Pick a node from the list or create a new one with the <strong>Node</strong> button.',    choices: 'Choices ({count})',
    addChoice: 'Choice',
    untitledChoice: 'Untitled choice',
    preconditionCount: '{count} preconditions',
    preconditionCountOne: '1 precondition',
    effectCount: '{count} effects',
    effectCountOne: '1 effect',
    deleteChoice: 'Delete choice',
    choiceText: 'Choice text',
    choiceTextPlaceholder: 'What the player answers',
    leadsTo: 'Leads to',
    selectTarget: '-- Select destination --',
    endDialogue: 'End of dialogue',
    missingTarget: 'Missing destination',
    deletedNode: 'Deleted node',
    thisNode: '(this node)',
    preconditions: 'Preconditions',
    preconditionsHint: 'the choice appears only if all are true',
    effects: 'Effects',
    effectsHint: 'triggered when the player picks this answer',
    noChoices: 'No choices: the dialogue ends at this node.',
    feedback: {
      loadError: 'Unable to load dialogues.',
      saved: 'Dialogues saved!',
      saveError: 'Error while saving dialogues.'
    }
  },
  effectsEditor: {
    selectScene: '-- Select destination room --',
    selectItem: '-- Select item --',
    selectHotspotItem: '-- Select item with hotspot --',
    selectStartNode: '-- Select the node the dialogue starts from --',
    noNodes: 'No nodes: create one first in the dialogue editor',
    endDialogueHint: "Closes the dialogue after showing the node's text.",
    endAdventureHint: 'Ends the adventure: the player will see the ending screen.',
    flagKeyPlaceholder: 'Key (e.g. score)',
    flagValuePlaceholder: 'Value (e.g. 100 or true)',
    selectInputTarget: 'Select the Enter key (item with «Input equals»)',
    appendValuePlaceholder: 'Character (e.g. 7)',
    noInputTargets: 'No item with «Input equals»: create the Enter key with that condition first.',
    remove: 'Remove effect',
    empty: 'No effects set.',
    add: 'Add effect'
  },
  preconditionsEditor: {
    flagNamePlaceholder: 'Flag name (e.g. door_open)',
    expectedValuePlaceholder: 'Expected value (e.g. true or 100)',
    remove: 'Remove precondition',
    empty: 'No preconditions set.',
    add: 'Add precondition'
  },

  sceneEditor: {
    confirmDeleteItem: 'Are you sure you want to delete item #{code}?',
    actionSaveError: 'Unable to save the action.',
    confirmDeleteAction: 'Do you want to remove this action?',
    textboxPlaceholder: 'Enter text...',
    header: {
      back: 'Back to the adventure list',
      adventures: 'Adventures',
      editInfo: 'Edit adventure details',
      draftTitle: 'You are editing this draft: players only see published versions',
      draft: 'Draft v{version}',

      publishTitle: 'Make the current draft playable as a new version',
      publish: 'Publish',
      noScene: 'No room selected',
      confirmPublishTitle: 'Publish the draft?',
      confirmPublishMessage: 'The draft will become version {version}, playable by everyone. Published versions remain available and you will keep working on a new draft.',
      publishError: 'Publishing failed',
      publishSuccess: 'Adventure published. You are now editing a new draft.'
    },
    sidebar: {
      scenes: 'Scenes ({count})',
      addScene: 'Add new room',
      deleteScene: 'Delete room',
      noScenes: 'No rooms yet',
      objects: 'Items ({count})',
      addObject: 'Add new item (scene or global)',
      globalInventory: 'Global Inventory',
      tagGlobal: 'GLOBAL',
      tagInventory: 'INV',
      noObjects: 'No items',
      confirmDeleteScene: 'Are you sure you want to delete the room "{name}"?'
    },
    sceneForm: {
      cancelTitle: 'Cancel creation',
      initialBadge: 'Starting Scene',
      newBadge: 'New Scene',
      saving: 'Saving...',
      submit: 'Confirm and save',
      initialTitle: 'Set Up Starting Scene',
      newTitle: 'Create New Scene',
      initialSubtitle: "This room will be the player's starting point in your adventure.",
      newSubtitle: 'Add a new room to the adventure and define its unique identifier.',
      nameLabel: 'Scene name *',
      namePlaceholder: 'e.g. Lighthouse Hall, Dark Forest, Study...',
      nameRequired: 'Room name is required.',
      codeLabel: 'Unique scene code (ID) *',
      codePlaceholder: 'e.g. lighthouse_hall, night_forest',
      initialCodeHint: "The game engine's default starting ID.",
      codeHint: 'Used by hotspots to point transitions to this room.',
      codeInvalid: 'Only lowercase letters, digits and underscores (_) are allowed.',
      backgroundLabel: 'Room background *',
      backgroundDropTitle: 'Drag the room background here',
      backgroundDropSubtitle: 'or click to browse files',
      backgroundHint: 'High-resolution PNG, JPG or WEBP recommended (16:9)',
      loadError: 'Unable to load adventure data.',
      backgroundRequired: 'The room background is required.',
      missingAdventure: 'Adventure identifier not available. Please try again.',
      saveError: 'Error while saving the room.'
    },
    canvas: {
      loading: 'Loading scene...',
      spriteDraftAlt: 'Sprite draft',
      moveBoth: 'Move on both axes',
      moveX: 'Move X axis',
      moveY: 'Move Y axis',
      scaleBoth: 'Free diagonal stretch',
      scaleX: 'Stretch width (X)',
      scaleY: 'Stretch height (Y)',
      dropSprite: 'Drop the sprite here',
      noSceneTitle: 'No Scene Selected',
      noSceneText: 'Create or select a room to start setting it up.',
      addScene: 'Add Scene'
    },
    gizmo: {
      vertices: '{count} vertices',
      undoVertex: 'Undo last vertex (Ctrl+Z)',
      clearVertices: 'Remove all vertices',
      hideToolbar: 'Hide toolbar',
      showToolbar: 'Show toolbar',
      select: 'Select (Cursor)',
      move: 'Move sprite (X/Y axes)',
      scale: 'Resize sprite',
      hotspot: 'Draw hotspot polygon'
    },
    feedback: {
      invalidAdventureId: 'Invalid adventure identifier.',
      scenesLoadError: 'Unable to load scene data.',
      adventureLoadError: 'Unable to load the requested adventure.',
      detailsSaved: 'Adventure details updated successfully!',
      detailsSaveError: 'Error while saving details.',
      itemSaved: 'Item "{name}" saved!',
      saveError: 'Save error.',
      globalItemSaved: 'Global item "{name}" saved successfully!',
      itemSaveError: 'Error while saving the item.',
      itemUpdated: 'Item "{name}" updated!',
      updateError: 'Update error.',
      publishError: 'Error while publishing.',
      actionAdded: 'Action "{type}" added!',
      actionSaveError: 'Error while saving the action.',
      actionUpdated: 'Action "{type}" updated successfully!',
      actionUpdateError: 'Error while updating the action.'
    }
  },

  enums: {
    effectType: {
      CHANGE_SCENE: 'Change scene',
      ADD_ITEM: 'Add to inventory',
      REMOVE_ITEM: 'Remove from inventory',
      SET_FLAG: 'Set flag',
      SHOW_SCENE_ITEM: 'Show scene item',
      HIDE_SCENE_ITEM: 'Hide scene item',
      END_ADVENTURE: 'End adventure',
      START_DIALOGUE: 'Start dialogue',
      END_DIALOGUE: 'End dialogue',
      APPEND_INPUT: 'Append to code',
      CLEAR_INPUT: 'Clear code'
    },
    preconditionType: {
      HAS_ITEM: 'Has item',
      DOES_NOT_HAVE_ITEM: "Doesn't have item",
      FLAG_EQUALS: 'Flag equals',
      INPUT_EQUALS: 'Input equals'
    },
    actionType: {
      LOOK_AT: 'Look at',
      OPEN: 'Open',
      PICK_UP: 'Pick up',
      MOVE: 'Move',
      USE: 'Use',
      TALK_TO: 'Talk to',
      USE_WITH: 'Use with'
    }
  },

  inspector: {
    hotspots: 'Hotspots ({count})',
    tagInventory: 'INVENTORY',
    tagHidden: 'HIDDEN',
    noHotspots: 'No hotspots in this room',
    editItem: 'Edit Item',
    newItem: 'New Item',
    noVertices: 'No vertices = Global',
    nameLabel: 'Item name *',
    namePlaceholder: 'e.g. Reinforced Chest or Golden Key',
    codeLabel: 'Unique code (ID) *',
    codePlaceholder: 'e.g. golden_key',
    description: 'Description',
    descriptionPlaceholder: 'Item description...',
    spriteLabel: 'Sprite / Icon (optional)',
    changeImage: 'Change image...',
    chooseImage: 'Choose an image from your computer...',
    visibleAtStart: 'Visible at start',
    hiddenAtStart: 'Hidden at start',
    saveChanges: 'Save changes',
    confirmSave: 'Confirm and save',
    title: 'Inspector',
    editItemTitle: 'Edit item',
    deleteItemTitle: 'Delete item',
    noDescription: 'No description.',
    actions: 'Actions',
    add: 'Add',
    withTarget: 'with #{code}',
    noMessage: 'No message',
    editAction: 'Edit action',
    deleteAction: 'Delete action',
    noActions: 'No actions set.',
    dialogues: 'Dialogues',
    dialoguesHint: 'Multiple-choice conversations with this character.',
    manageDialogues: 'Manage dialogues',
    empty: 'Pick an item from the left column or create a new one with the <strong>+</strong> button.'
  },

  actionModal: {
    targetRequired: 'Select the target item to interact with.',
    editTitle: 'Edit Game Action',
    newTitle: 'New Game Action',
    subtitle: 'Assign a behavior to element',
    typeLabel: 'Action type *',
    useWithTarget: 'Target / Item to interact or combine with *',
    selectTarget: '-- Select target element --',
    successMessage: 'Success message (optional)',
    successPlaceholder: 'e.g. You unlocked the door with the brass key.',
    preconditions: 'Preconditions',
    addCondition: 'Add condition',
    inputSolutionPlaceholder: 'Exact solution (e.g. 1234)',
    textBoxTitle: 'Where the text field appears',
    textBoxHint: 'Drag the box to move it, the corner to resize it, or draw a new rectangle on the background.',
    noBackground: 'Select a scene with a background to place the box.',
    decreaseSize: 'Decrease size',
    increaseSize: 'Increase size',
    textColor: 'Text color',
    preciseValues: 'Precise values',
    width: 'Width',
    height: 'Height',
    failurePlaceholder: 'Specific message if not met (optional)...',
    noPreconditions: 'No preconditions set: the action can always be performed.',
    effects: 'Game Effects',
    noDialogue: 'No saved dialogue for this item. Create one with "Manage dialogues" and save it.',
    noEffects: 'No effects set: the action will only show the message.',
    saveChanges: 'Save changes',
    saveAction: 'Save action',
    colors: {
      white: 'White',
      black: 'Black',
      yellow: 'Yellow',
      red: 'Red',
      green: 'Green',
      blue: 'Light blue',
      orange: 'Orange',
      custom: 'Custom'
    }
  },
  api: {
    error: {
      generic: {
        internal: 'An internal server error occurred',
        badRequest: 'Invalid request',
        conflict: 'Unable to complete the operation',
        duplicate: 'An element with this data already exists'
      },
      validation: {
        generic: 'Invalid data'
      },
      auth: {
        invalidCredentials: 'Invalid credentials',
        usernameTaken: "The username '{0}' is already taken",
        emailTaken: "The email '{0}' is already linked to an account",
        notAuthenticated: 'Operation not allowed: user not authenticated',
        notOwner: 'Access denied: you are not the owner of this resource',
        forbidden: 'Access denied'
      },
      user: {
        authenticatedNotFound: 'Authenticated user not found: {0}',
        notFound: 'User not found: {0}'
      },
      adventure: {
        notFoundById: 'Adventure not found with ID: {0}',
        notFoundByCode: 'Adventure not found with code: {0}',
        titleTaken: 'An adventure with this title already exists',
        noStartScene: 'The adventure has no starting scene configured',
        versionPublished: 'This version is published and cannot be modified',
        publishNoScenes: 'Cannot publish: the adventure has no scenes',
        publishInvalidStartScene: 'Cannot publish: starting scene missing or invalid'
      },
      scene: {
        notFoundById: 'Scene not found with ID: {0}',
        notFoundByCode: 'Scene not found: {0}',
        codeTaken: "A scene with code '{0}' already exists in this adventure"
      },
      item: {
        notFoundById: 'Item not found with ID: {0}',
        hotspotRequired: 'An item added to the scene must have a hotspot with valid points',
        codeTaken: "An item with code '{0}' already exists in this adventure"
      },
      action: {
        notFoundById: 'Action not found with ID: {0}',
        notFoundByCode: 'Action not found with code: {0}',
        typeMismatch: 'Action type mismatch: expected {0} but received {1}',
        duplicateType: 'The item already has an action of type {0}',
        duplicateUseWith: 'A USE_WITH action targeting this item already exists: {0}',
        useWithTargetRequired: 'A USE_WITH action requires targetItemCode',
        duringDialogue: "You can't perform actions during a dialogue",
        appendInputValueRequired: 'For «Append to code» enter the character to append',
        appendInputTargetInvalid: 'Item {0} has no action with «Input equals»',
        itemNotReachable: 'Item {0} is not reachable',
        notFoundForItem: 'No {0} action for item {1}',
        useWithNotFound: 'These items cannot be used together'
      },
      game: {
        stateMissing: 'Game state missing',
        stateOrAdventureMissing: 'Game state or adventure missing',
        alreadyEnded: 'The adventure has already ended'
      },
      save: {
        notFound: 'Save not found: {0}',
        noneForAdventure: 'No save found for adventure: {0}',
        autosaveNotFound: 'No autosave found for this adventure',
        invalidName: 'Invalid save name'
      },
      dialogue: {
        nodeNotFound: 'Dialogue node not found: {0}',
        targetNodeNotFound: 'Target node does not exist: {0}',
        noneActive: 'No dialogue in progress',
        invalidChoice: 'Invalid choice for the current node',
        choiceUnavailable: 'Choice not available'
      },
      upload: {
        imageRequired: 'Please select an image',
        missingExtension: 'The uploaded file has no valid extension',
        unsupportedFormat: 'Unsupported file format. Allowed extensions: {0}'
      },
      review: {
        ownAdventure: 'You cannot review your own adventure',
        notPublished: 'You can only review published adventures',
        notPlayed: 'You must have played this adventure to review it',
        notFound: 'Review not found'
      }
    },
    validation: {
      firstName: {
        required: 'First name is required',
        size: 'First name can be at most 50 characters'
      },
      lastName: {
        required: 'Last name is required',
        size: 'Last name can be at most 50 characters'
      },
      email: {
        required: 'Email is required',
        invalid: 'Please enter a valid email address',
        size: 'Email can be at most 255 characters'
      },
      username: {
        required: 'Username is required',
        size: 'Username must be between 3 and 50 characters',
        pattern: 'Username can only contain letters, numbers and the characters _ . -'
      },
      login: {
        identifier: {
          required: 'Enter your username or email'
        }
      },
      password: {
        required: 'Password is required',
        size: 'Password must be at least 8 characters'
      },
      bio: {
        size: 'Bio can be at most 500 characters'
      },
      description: {
        size: 'Description cannot exceed 1000 characters'
      },
      adventure: {
        id: {
          required: 'Adventure id is required'
        }
      },
      gameState: {
        required: 'Game state is required'
      },
      action: {
        code: {
          required: 'Action code is required',
          size: 'Code cannot exceed 255 characters'
        },
        type: {
          required: 'Action type is required'
        }
      },
      effect: {
        type: {
          required: 'Effect type is required'
        }
      },
      precondition: {
        type: {
          required: 'Precondition type is required'
        },
        key: {
          required: 'Required key is mandatory'
        }
      },
      item: {
        code: {
          required: 'Item code is required',
          size: 'Item code cannot exceed 50 characters'
        },
        name: {
          required: 'Item name is required',
          size: 'Item name cannot exceed 100 characters'
        }
      },
      scene: {
        code: {
          required: 'Scene code is required',
          size: 'Scene code cannot exceed 50 characters'
        },
        name: {
          required: 'Scene name is required',
          size: 'Scene name cannot exceed 100 characters'
        }
      },
      hotspot: {
        points: {
          size: 'Points cannot exceed 1000 characters'
        }
      },
      review: {
        rating: {
          required: 'The rating is required',
          range: 'The rating must be between 1 and 5'
        },
        comment: {
          tooLong: 'The comment can be at most 2000 characters long'
        }
      }
    }
  },

  topbar: {
    home: 'Go to library',
    myProfile: 'My profile',
    logout: 'Log out'
  },

  footer: {
    phone: 'Phone',
    instagram: 'Instagram',
    email: 'Email',
    rights: '© {year} All rights reserved'
  },
  reviews: {
    stars: {
      aria: 'Rating: {value} out of 5',
      groupAria: 'Rating',
      rate: 'Rate {value} out of 5'
    },
    title: 'Reviews',
    noReviews: 'No reviews yet',
    countOne: '1 review',
    countMany: '{count} reviews',
    loadError: 'Could not load the reviews.',
    saveError: 'Could not save the review.',
    deleteError: 'Could not delete the review.',
    writeTitle: 'Write a review',
    editTitle: 'Edit your review',
    writeHint: 'Tell other players what you think of this adventure.',
    pickRating: 'Pick a rating',
    commentPlaceholder: 'Write a comment (optional)',
    publish: 'Publish',
    update: 'Update',
    published: 'Review published.',
    updated: 'Review updated.',
    deleted: 'Review deleted.',
    yourReview: 'Your review',
    edit: 'Edit',
    onVersion: 'On version {number}',
    deleteTitle: 'Delete the review?',
    deleteMessage: 'Your review will be permanently removed.',
    playToReview: 'Play this adventure to be able to review it.',
    playersTitle: 'Player reviews',
    badgeCompleted: 'Completed',
    loadMore: 'Load more',
    ratingLabels: {
      r1: 'Terrible',
      r2: 'Poor',
      r3: 'Fair',
      r4: 'Good',
      r5: 'Excellent'
    }
  },
};
