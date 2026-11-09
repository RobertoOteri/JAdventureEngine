import { Translations } from '../i18n.types';

export const en: Translations = {
  common: {
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
    serverUnreachable: 'Unable to reach the server. Please try again shortly.',
    generic: 'Something went wrong. Please try again.'
  },
  sidebar: {
    library: 'Library',
    myStories: 'My stories',
    myProfile: 'My profile',
    logout: 'Log out'
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
    title: 'Adventure Library',
    countFiltered: '{shown} of {total} titles',
    count: '{count} titles available',
    countOne: '1 title available',
    searchPlaceholder: 'Search by title, description or author',
    noMatch: 'No adventures match your search.',
    resetSearch: 'Clear search',
    empty: 'No adventures published in the library yet.'
  },
  myAdventures: {
    title: 'My Adventures',
    countFiltered: '{shown} of {total} projects',
    count: '{count} personal projects',
    countOne: '1 personal project',
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
    delete: 'Delete adventure'
  },
  adventureDetail: {
    synopsis: 'Synopsis & Details',
    noDescription: 'No description provided for this graphic adventure.',
    version: 'Version',
    notPublished: 'Not published yet: you can play it as a preview.',
    leaderboard: 'Leaderboard',
    playNow: 'Play now'
  },
  confirmation: {
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
    latest: 'latest'
  },

  profile: {
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
    note: 'Your username is visible to other players and cannot be changed. Your email is only used to log in and is never shown.',
    bio: 'Bio',
    bioPlaceholder: 'Tell us something about yourself and the adventures you create…',
    saving: 'Saving…',
    save: 'Save changes',
    avatarInvalidType: 'Please use a JPG, PNG or WebP image.',
    avatarTooLarge: 'The image must be 2 MB or smaller.'
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
      continue: 'Resume from last save',
      exit: 'Back to adventures'
    },
    feedback: {
      startError: 'Unable to start the game.',
      noSaveToContinue: 'No save found to continue from.',
      loadError: 'Error while loading the save.',
      invalidSession: 'Error: invalid game session.',
      actionDone: 'Done.',
      nothingHappens: 'Nothing happens.',
      actionNotAllowed: "You can't do that here.",
      dialogueError: 'Unable to continue the dialogue.',
      noEffect: "It doesn't seem to have any effect.",
      cannotCombine: "You can't combine these two items.",
      saved: 'Game saved successfully!',
      saveError: 'Error while saving the game.'
    }
  },

  dialogueEditor: {
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
    noSelection: 'Select a node from the list or create a new one with the <strong>Node</strong> button.',
    choices: 'Choices ({count})',
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
      END_DIALOGUE: 'End dialogue'
    },
    preconditionType: {
      HAS_ITEM: 'Has item',
      DOES_NOT_HAVE_ITEM: "Doesn't have item",
      FLAG_EQUALS: 'Flag equals',
      INPUT_EQUALS: 'Input equals'
    }
  },
};
