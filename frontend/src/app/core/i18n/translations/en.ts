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
  }
};
