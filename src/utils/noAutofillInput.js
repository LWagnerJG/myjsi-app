/** Props that discourage iOS Safari / password-manager autofill bars on search fields. */
export const NO_AUTOFILL_INPUT_PROPS = Object.freeze({
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
  enterKeyHint: 'search',
  'data-lpignore': 'true',
  'data-1p-ignore': 'true',
  'data-form-type': 'other',
});

/** Unique name attr — Safari ignores autocomplete=off when name matches known patterns. */
export const getNoAutofillName = (scope = 'field') =>
  `nl-${scope}-${Math.random().toString(36).slice(2, 9)}`;
