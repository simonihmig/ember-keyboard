import KeyboardListener from './keyboard-listener';
import getPlatform from './platform';
import {
  SHIFT_KEY_MAP,
  MAC_ALT_KEY_MAP,
  MAC_SHIFT_ALT_KEY_MAP,
} from 'ember-keyboard/fixtures/key-maps';
import ALL_MODIFIERS from 'ember-keyboard/fixtures/modifiers-array';
import getMouseName from 'ember-keyboard/utils/get-mouse-name';

const ALL_SYMBOL = '_all';

export default function isKey(
  listenerOrListenerName,
  event,
  platform = getPlatform()
) {
  let listener;
  if (listenerOrListenerName instanceof KeyboardListener) {
    listener = listenerOrListenerName;
  } else if (typeof listenerOrListenerName === 'string') {
    listener = KeyboardListener.parse(listenerOrListenerName, platform);
  } else {
    throw new Error(
      'Expected a `string` or `KeyCombo` as `keyComboOrKeyComboString` argument to `isKey`'
    );
  }

  if (listener.type !== event.type) {
    return false;
  }

  if (isAll(listener)) {
    return true;
  }

  if (
    modifiersMatch(listener, event) &&
    (keyOrCodeMatches(listener, event) || mouseButtonMatches(listener, event))
  ) {
    return true;
  }

  return specialCaseMatches(listener, event, platform);
}

function isAll(listener) {
  return (
    listener.keyOrCode === ALL_SYMBOL &&
    listener.altKey === false &&
    listener.ctrlKey === false &&
    listener.metaKey === false &&
    listener.shiftKey === false
  );
}

function modifiersMatch(listener, keyboardEvent) {
  return (
    listener.type === keyboardEvent.type &&
    listener.altKey === keyboardEvent.altKey &&
    listener.ctrlKey === keyboardEvent.ctrlKey &&
    listener.metaKey === keyboardEvent.metaKey &&
    listener.shiftKey === keyboardEvent.shiftKey
  );
}

function keyOrCodeMatches(listener, keyboardEvent) {
  if (!(keyboardEvent instanceof KeyboardEvent)) {
    return false;
  }
  if (listener.keyOrCode === ALL_SYMBOL) {
    return true;
  }
  return (
    listener.keyOrCode === keyboardEvent.code ||
    listener.keyOrCode === keyboardEvent.key
  );
}

function mouseButtonMatches(listener, mouseEvent) {
  if (!(mouseEvent instanceof MouseEvent)) {
    return false;
  }
  if (listener.keyOrCode === ALL_SYMBOL) {
    return true;
  }
  return listener.keyOrCode === getMouseName(mouseEvent.button);
}

function specialCaseMatches(keyboardListener, keyboardEvent, platform) {
  if (
    onlyModifiers([], keyboardListener) &&
    onlyModifiers(['shift'], keyboardEvent)
  ) {
    return keyboardEvent.key === keyboardListener.keyOrCode;
  }

  if (
    onlyModifiers(['shift'], keyboardListener) &&
    onlyModifiers(['shift'], keyboardEvent)
  ) {
    return rootKeyForShiftKey(keyboardEvent.key) === keyboardListener.keyOrCode;
  }

  if (
    platform === 'Macintosh' &&
    onlyModifiers(['alt'], keyboardListener) &&
    onlyModifiers(['alt'], keyboardEvent)
  ) {
    return (
      rootKeyForMacAltKey(keyboardEvent.key) === keyboardListener.keyOrCode
    );
  }
  if (
    platform === 'Macintosh' &&
    onlyModifiers(['shift', 'alt'], keyboardListener) &&
    onlyModifiers(['shift', 'alt'], keyboardEvent)
  ) {
    return (
      rootKeyForMacShiftAltKey(keyboardEvent.key) === keyboardListener.keyOrCode
    );
  }
  return false;
}

const ALL_MODIFIERS_EXCEPT_CMD = ALL_MODIFIERS.filter((m) => m != 'cmd');
function onlyModifiers(names, obj) {
  for (let modifier of ALL_MODIFIERS_EXCEPT_CMD) {
    if (names.includes(modifier) && !obj[`${modifier}Key`]) {
      return false;
    }
    if (!names.includes(modifier) && obj[`${modifier}Key`]) {
      return false;
    }
  }
  return true;
}

function rootKeyForShiftKey(key) {
  return SHIFT_KEY_MAP[key] || key;
}

function rootKeyForMacAltKey(key) {
  return MAC_ALT_KEY_MAP[key] || key;
}

function rootKeyForMacShiftAltKey(key) {
  return MAC_SHIFT_ALT_KEY_MAP[key] || key;
}
