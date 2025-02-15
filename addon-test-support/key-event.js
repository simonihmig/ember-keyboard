import { getMouseCode } from 'ember-keyboard';
import validModifiers from 'ember-keyboard/fixtures/modifiers-array';
import validMouseButtons from 'ember-keyboard/fixtures/mouse-buttons-array';
import getCmdKey from 'ember-keyboard/utils/get-cmd-key';
import { triggerEvent } from '@ember/test-helpers';

export function keyEvent(keyCombo, type, element = document) {
  let keyComboParts = (keyCombo || '').split('+');

  let eventProps = keyComboParts.reduce((eventProps, keyComboPart) => {
    let isValidModifier = validModifiers.indexOf(keyComboPart) > -1;

    if (isValidModifier) {
      keyComboPart = keyComboPart === 'cmd' ? getCmdKey() : keyComboPart;
      eventProps[`${keyComboPart}Key`] = true;
    }

    if (type.startsWith('key') && !isValidModifier) {
      eventProps.code = keyComboPart;
    }

    if (
      type.startsWith('mouse') &&
      !isValidModifier &&
      validMouseButtons.indexOf(keyComboPart) > -1
    ) {
      eventProps.button = getMouseCode(keyComboPart);
    }

    return eventProps;
  }, {});

  return triggerEvent(element, type, eventProps);
}
