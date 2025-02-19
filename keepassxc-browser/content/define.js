'use strict';

var kpxcDefine = {};

kpxcDefine.selection = {
    username: null,
    password: null,
    totp: null,
    fields: []
};

kpxcDefine.buttons = {
    again: undefined,
    confirm: undefined,
    discard: undefined,
    dismiss: undefined,
    more: undefined,
    skip: undefined
};

kpxcDefine.backdrop = undefined;
kpxcDefine.chooser = undefined;
kpxcDefine.dialog = undefined;
kpxcDefine.diffX = 0;
kpxcDefine.diffY = 0;
kpxcDefine.discardSection = undefined;
kpxcDefine.eventFieldClick = undefined;
kpxcDefine.headline = undefined;
kpxcDefine.help = undefined;
kpxcDefine.inputQueryPattern = 'input[type=email], input[type=number], input[type=password], input[type=tel], input[type=text], input[type=username], input:not([type])';
kpxcDefine.keyboardSelectorPattern = 'div.kpxcDefine-fixed-field:not(.kpxcDefine-fixed-username-field):not(.kpxcDefine-fixed-password-field):not(.kpxcDefine-fixed-totp-field)';
kpxcDefine.moreInputQueryPattern = 'input:not([type=button]):not([type=checkbox]):not([type=color]):not([type=date]):not([type=datetime-local]):not([type=file]):not([type=hidden]):not([type=image]):not([type=month]):not([type=range]):not([type=reset]):not([type=submit]):not([type=time]):not([type=week]), select, textarea';
kpxcDefine.markedFields = [];
kpxcDefine.keyDown = undefined;
kpxcDefine.startPosX = 0;
kpxcDefine.startPosY = 0;

kpxcDefine.init = async function() {
    kpxcDefine.backdrop = kpxcUI.createElement('div', 'kpxcDefine-modal-backdrop', { 'id': 'kpxcDefine-backdrop' });
    kpxcDefine.chooser = kpxcUI.createElement('div', '', { 'id': 'kpxcDefine-fields' });
    kpxcDefine.dialog = kpxcUI.createElement('div', '', { 'id': 'kpxcDefine-description' });
    kpxcDefine.backdrop.append(kpxcDefine.dialog);

    const styleSheet = createStylesheet('css/define.css');
    const buttonStyleSheet = createStylesheet('css/button.css');
    const wrapper = document.createElement('div');

    this.shadowRoot = wrapper.attachShadow({ mode: 'closed' });
    this.shadowRoot.append(styleSheet);
    this.shadowRoot.append(buttonStyleSheet);
    this.shadowRoot.append(kpxcDefine.backdrop);
    this.shadowRoot.append(kpxcDefine.chooser);
    document.body.append(wrapper);

    kpxcDefine.initDescription();
    kpxcDefine.resetSelection();
    kpxcDefine.prepareStep1();
    kpxcDefine.markAllUsernameFields();

    kpxcDefine.dialog.onmousedown = function(e) {
        kpxcDefine.mouseDown(e);
    };

    document.addEventListener('keydown', kpxcDefine.keyDown);
};

kpxcDefine.close = function() {
    kpxcDefine.backdrop.remove();
    kpxcDefine.chooser.remove();
    document.removeEventListener('keydown', kpxcDefine.keyDown);
};

kpxcDefine.mouseDown = function(e) {
    kpxcDefine.selected = kpxcDefine.dialog;
    kpxcDefine.startPosX = e.clientX;
    kpxcDefine.startPosY = e.clientY;
    kpxcDefine.diffX = kpxcDefine.startPosX - kpxcDefine.dialog.offsetLeft;
    kpxcDefine.diffY = kpxcDefine.startPosY - kpxcDefine.dialog.offsetTop;
    return false;
};

kpxcDefine.initDescription = function() {
    const description = kpxcDefine.dialog;
    kpxcDefine.headline = kpxcUI.createElement('div', '', { 'id': 'kpxcDefine-chooser-headline' });
    kpxcDefine.help = kpxcUI.createElement('div', 'kpxcDefine-chooser-help', { 'id': 'kpxcDefine-help' });

    // Show keyboard shortcuts help text
    const keyboardHelp = kpxcUI.createElement('div', 'kpxcDefine-keyboardHelp', {}, `${tr('optionsKeyboardShortcutsHeader')}:`);
    keyboardHelp.style.marginBottom = '5px';
    keyboardHelp.appendMultiple(document.createElement('br'), kpxcUI.createElement('kbd', '', {}, 'Escape'), ' ' + tr('defineDismiss'));
    keyboardHelp.appendMultiple(document.createElement('br'), kpxcUI.createElement('kbd', '', {}, 'S'), ' ' + tr('defineSkip'));
    keyboardHelp.appendMultiple(document.createElement('br'), kpxcUI.createElement('kbd', '', {}, 'A'), ' ' + tr('defineAgain'));
    keyboardHelp.appendMultiple(document.createElement('br'), kpxcUI.createElement('kbd', '', {}, 'C'), ' ' + tr('defineConfirm'));
    keyboardHelp.appendMultiple(document.createElement('br'), kpxcUI.createElement('kbd', '', {}, 'M'), ' ' + tr('defineMore'));
    keyboardHelp.appendMultiple(document.createElement('br'), kpxcUI.createElement('kbd', '', {}, 'D'), ' ' + tr('defineDiscard'));

    description.appendMultiple(kpxcDefine.headline, kpxcDefine.help, keyboardHelp);

    const buttonDismiss = kpxcUI.createElement('button', 'kpxc-button kpxc-red-button', { 'id': 'kpxcDefine-btn-dismiss' }, tr('defineDismiss'));
    buttonDismiss.addEventListener('click', kpxcDefine.close);

    const buttonSkip = kpxcUI.createElement('button', 'kpxc-button kpxc-orange-button', { 'id': 'kpxcDefine-btn-skip' }, tr('defineSkip'));
    buttonSkip.style.marginRight = '5px';
    buttonSkip.addEventListener('click', kpxcDefine.skip);

    const buttonMore = kpxcUI.createElement('button', 'kpxc-button kpxc-orange-button', { 'id': 'kpxcDefine-btn-more' }, tr('defineMore'));
    buttonMore.style.marginRight = '5px';
    buttonMore.style.marginLeft = '5px';
    buttonMore.addEventListener('click', kpxcDefine.more);

    const buttonAgain = kpxcUI.createElement('button', 'kpxc-button kpxc-blue-button', { 'id': 'kpxcDefine-btn-again' }, tr('defineAgain'));
    buttonAgain.style.marginRight = '5px';
    buttonAgain.addEventListener('click', kpxcDefine.again);

    const buttonConfirm = kpxcUI.createElement('button', 'kpxc-button kpxc-green-button', { 'id': 'kpxcDefine-btn-confirm' }, tr('defineConfirm'));
    buttonConfirm.style.marginRight = '15px';
    buttonConfirm.style.display = 'none';
    buttonConfirm.addEventListener('click', kpxcDefine.confirm);

    kpxcDefine.buttons.again = buttonAgain;
    kpxcDefine.buttons.confirm = buttonConfirm;
    kpxcDefine.buttons.dismiss = buttonDismiss;
    kpxcDefine.buttons.more = buttonMore;
    kpxcDefine.buttons.skip = buttonSkip;
    description.appendMultiple(buttonConfirm, buttonSkip, buttonMore, buttonAgain, buttonDismiss);

    const location = kpxc.getDocumentLocation();
    if (kpxc.settings['defined-custom-fields'] && kpxc.settings['defined-custom-fields'][location]) {
        const div = kpxcUI.createElement('div', 'alreadySelected', {});
        const defineDiscard = kpxcUI.createElement('p', '', {}, tr('defineAlreadySelected'));
        const buttonDiscard = kpxcUI.createElement('button', 'kpxc-button kpxc-red-button', { 'id': 'kpxcDefine-btn-discard' }, tr('defineDiscard'));
        buttonDiscard.style.marginTop = '5px';
        buttonDiscard.addEventListener('click', kpxcDefine.discard);
        kpxcDefine.buttons.discard = buttonSkip;
        kpxcDefine.discardSection = div;

        div.appendMultiple(defineDiscard, buttonDiscard);
        description.append(div);
    }
};

kpxcDefine.resetSelection = function() {
    kpxcDefine.selection = {
        username: null,
        password: null,
        totp: null,
        fields: []
    };

    kpxcDefine.markedFields = [];

    if (kpxcDefine.chooser) {
        kpxcDefine.chooser.textContent = '';
    }
};

kpxcDefine.isFieldSelected = function(field) {
    if (kpxcDefine.markedFields.some(f => f === field)) {
        return (
            (kpxcDefine.selection.username && kpxcDefine.selection.username.originalElement === field)
            || (kpxcDefine.selection.password && kpxcDefine.selection.password.originalElement === field)
            || (kpxcDefine.selection.totp && kpxcDefine.selection.totp.originalElement === field)
            || kpxcDefine.selection.fields.includes(field)
        );
    }

    return false;
};

kpxcDefine.markAllUsernameFields = function() {
    kpxcDefine.eventFieldClick = function(e, elem) {
        if (!e.isTrusted) {
            return;
        }

        const field = elem || e.currentTarget;
        field.classList.add('kpxcDefine-fixed-username-field');
        field.textContent = tr('username');
        field.onclick = null;
        kpxcDefine.selection.username = field;
        kpxcDefine.markedFields.push(field.originalElement);

        kpxcDefine.prepareStep2();
        kpxcDefine.markAllPasswordFields();
    };

    kpxcDefine.markFields(kpxcDefine.inputQueryPattern);
};

kpxcDefine.markAllPasswordFields = function() {
    kpxcDefine.eventFieldClick = function(e, elem) {
        if (!e.isTrusted) {
            return;
        }

        const field = elem || e.currentTarget;
        field.classList.add('kpxcDefine-fixed-password-field');
        field.textContent = tr('password');
        field.onclick = null;
        kpxcDefine.selection.password = field;
        kpxcDefine.markedFields.push(field.originalElement);

        kpxcDefine.prepareStep3();
        kpxcDefine.markAllTOTPFields();
    };

    kpxcDefine.markFields('input[type=\'password\']');
};

kpxcDefine.markAllStringFields = function() {
    kpxcDefine.eventFieldClick = function(e, elem) {
        if (!e.isTrusted) {
            return;
        }

        const field = elem || e.currentTarget;
        if (kpxcDefine.isFieldSelected(field.originalElement)) {
            return;
        }

        kpxcDefine.selection.fields.push(field.originalElement);
        kpxcDefine.markedFields.push(field.originalElement);

        field.classList.add('kpxcDefine-fixed-string-field');
        field.textContent = tr('defineStringField') + String(kpxcDefine.selection.fields.length);
        field.onclick = null;
    };

    kpxcDefine.markFields(kpxcDefine.inputQueryPattern + ', select');
};

kpxcDefine.markAllTOTPFields = function() {
    kpxcDefine.eventFieldClick = function(e, elem) {
        if (!e.isTrusted) {
            return;
        }

        const field = elem || e.currentTarget;
        field.classList.add('kpxcDefine-fixed-totp-field');
        field.textContent = 'TOTP';
        field.onclick = null;
        kpxcDefine.selection.totp = field;
        kpxcDefine.markedFields.push(field.originalElement);

        kpxcDefine.prepareStep4();
        kpxcDefine.markAllStringFields();
    };

    kpxcDefine.markFields(kpxcDefine.inputQueryPattern);
};

kpxcDefine.markFields = function(pattern) {
    let index = 1;
    let firstInput = null;
    const inputs = document.querySelectorAll(pattern);

    for (const i of inputs) {
        if (kpxcDefine.isFieldSelected(i)) {
            continue;
        }

        if (!kpxcFields.isVisible(i)) {
            continue;
        }

        const field = kpxcUI.createElement('div', 'kpxcDefine-fixed-field');
        field.originalElement = i;

        const rect = i.getBoundingClientRect();
        field.style.top = Pixels(rect.top);
        field.style.left = Pixels(rect.left);
        field.style.width = Pixels(rect.width);
        field.style.height = Pixels(rect.height);
        field.textContent = String(index);

        field.addEventListener('click', function(e) {
            kpxcDefine.eventFieldClick(e);
        });

        field.addEventListener('mouseenter', function() {
            field.classList.add('kpxcDefine-fixed-hover-field');
        });

        field.addEventListener('mouseleave', function() {
            field.classList.remove('kpxcDefine-fixed-hover-field');
        });

        i.addEventListener('focus', function() {
            field.classList.add('kpxcDefine-fixed-hover-field');
        });

        i.addEventListener('blur', function() {
            field.classList.remove('kpxcDefine-fixed-hover-field');
        });

        if (kpxcDefine.chooser) {
            kpxcDefine.chooser.append(field);
            firstInput = field;
            ++index;
        }
    }

    if (firstInput) {
        firstInput.focus();
    }
};

kpxcDefine.prepareStep1 = function() {
    kpxcDefine.help.style.marginBottom = '10px';
    kpxcDefine.help.textContent = tr('defineKeyboardText');

    removeContent('div#kpxcDefine-fixed-field');
    kpxcDefine.headline.textContent = tr('defineChooseUsername');
    kpxcDefine.dataStep = 1;

    kpxcDefine.buttons.skip.style.display = 'inline-block';
    kpxcDefine.buttons.confirm.style.display = 'none';
    kpxcDefine.buttons.again.style.display = 'none';
    kpxcDefine.buttons.more.style.display = 'none';
};

kpxcDefine.prepareStep2 = function() {
    const help = kpxcDefine.help;
    help.style.marginBottom = '10px';
    help.textContent = tr('defineKeyboardText');

    removeContent('div.kpxcDefine-fixed-field:not(.kpxcDefine-fixed-username-field)');
    removeContent('div.kpxcDefine-fixed.field');
    kpxcDefine.headline.textContent = tr('defineChoosePassword');
    kpxcDefine.dataStep = 2;
    kpxcDefine.buttons.again.style.display = 'inline-block';
    kpxcDefine.buttons.more.style.display = 'inline-block';
};

kpxcDefine.prepareStep3 = function() {
    kpxcDefine.help.style.marginBottom = '10px';
    kpxcDefine.help.textContent = tr('defineHelpText');

    removeContent('div.kpxcDefine-fixed-field:not(.kpxcDefine-fixed-username-field):not(.kpxcDefine-fixed-password-field)');
    kpxcDefine.headline.textContent = tr('defineChooseTOTP');
    kpxcDefine.dataStep = 3;
    kpxcDefine.buttons.skip.style.display = 'inline-block';
    kpxcDefine.buttons.again.style.display = 'inline-block';
    kpxcDefine.buttons.more.style.display = 'none';
    kpxcDefine.buttons.confirm.style.display = 'none';
};

kpxcDefine.prepareStep4 = function() {
    kpxcDefine.help.style.marginBottom = '10px';
    kpxcDefine.help.textContent = tr('defineHelpText');

    removeContent('div.kpxcDefine-fixed-field:not(.kpxcDefine-fixed-username-field):not(.kpxcDefine-fixed-password-field):not(.kpxcDefine-fixed-totp-field):not(.kpxcDefine-fixed-string-field)');
    kpxcDefine.headline.textContent = tr('defineConfirmSelection');
    kpxcDefine.dataStep = 4;
    kpxcDefine.buttons.skip.style.display = 'none';
    kpxcDefine.buttons.more.style.display = 'none';
    kpxcDefine.buttons.again.style.display = 'inline-block';
    kpxcDefine.buttons.confirm.style.display = 'inline-block';
};

kpxcDefine.skip = function() {
    if (kpxcDefine.dataStep === 1) {
        kpxcDefine.selection.username = null;
        kpxcDefine.prepareStep2();
        kpxcDefine.markAllPasswordFields();
    } else if (kpxcDefine.dataStep === 2) {
        kpxcDefine.selection.password = null;
        kpxcDefine.prepareStep3();
        kpxcDefine.markAllTOTPFields();
    } else if (kpxcDefine.dataStep === 3) {
        kpxcDefine.selection.totp = null;
        kpxcDefine.prepareStep4();
        kpxcDefine.markAllStringFields();
    }
};

kpxcDefine.again = function() {
    kpxcDefine.resetSelection();
    kpxcDefine.prepareStep1();
    kpxcDefine.markAllUsernameFields();
};

kpxcDefine.more = function() {
    if (kpxcDefine.dataStep === 1) {
        kpxcDefine.prepareStep1();

        // Reset previous marked fields when no usernames have been selected
        if (kpxcDefine.markedFields.length === 0) {
            kpxcDefine.resetSelection();
        }
    } else if (kpxcDefine.dataStep === 2) {
        kpxcDefine.prepareStep2();
    } else if (kpxcDefine.dataStep === 3) {
        kpxcDefine.prepareStep3();
    } else if (kpxcDefine.dataStep === 4) {
        kpxcDefine.prepareStep4();
    }

    kpxcDefine.markFields(kpxcDefine.moreInputQueryPattern);
};

kpxcDefine.confirm = async function() {
    if (kpxcDefine.dataStep !== 4) {
        return;
    }

    if (!kpxc.settings['defined-custom-fields']) {
        kpxc.settings['defined-custom-fields'] = {};
    }

    if (kpxcDefine.selection.username) {
        kpxcDefine.selection.username = kpxcFields.setId(kpxcDefine.selection.username.originalElement);
    }

    if (kpxcDefine.selection.password) {
        kpxcDefine.selection.password = kpxcFields.setId(kpxcDefine.selection.password.originalElement);
    }

    if (kpxcDefine.selection.totp) {
        kpxcDefine.selection.totp = kpxcFields.setId(kpxcDefine.selection.totp.originalElement);
    }

    const fieldIds = [];
    for (const i of kpxcDefine.selection.fields) {
        fieldIds.push(kpxcFields.setId(i));
    }

    const location = kpxc.getDocumentLocation();
    kpxc.settings['defined-custom-fields'][location] = {
        username: kpxcDefine.selection.username,
        password: kpxcDefine.selection.password,
        totp: kpxcDefine.selection.totp,
        fields: fieldIds
    };

    await sendMessage('save_settings', kpxc.settings);
    kpxcDefine.close();
};

kpxcDefine.discard = async function() {
    if (!kpxcDefine.buttons.discard) {
        return;
    }

    const location = kpxc.getDocumentLocation();
    delete kpxc.settings['defined-custom-fields'][location];

    await sendMessage('save_settings', kpxc.settings);
    await sendMessage('load_settings');

    kpxcDefine.discardSection.remove();
};

// Handle keyboard events
kpxcDefine.keyDown = function(e) {
    if (!e.isTrusted) {
        return;
    }

    if (e.key === 'Escape') {
        kpxcDefine.close();
    } else if (e.key === 'Enter') {
        e.preventDefault();
    } else if (e.keyCode >= 49 && e.keyCode <= 57) {
        // Select input field by number
        e.preventDefault();
        const index = e.keyCode - 48;
        const inputFields = document.querySelectorAll(kpxcDefine.keyboardSelectorPattern);

        if (inputFields.length >= index) {
            kpxcDefine.eventFieldClick(e, inputFields[index - 1]);
        }
    } else if (e.key === 's') {
        e.preventDefault();
        kpxcDefine.skip();
    } else if (e.key === 'a') {
        e.preventDefault();
        kpxcDefine.again();
    } else if (e.key === 'c') {
        e.preventDefault();
        kpxcDefine.confirm();
    } else if (e.key === 'm') {
        e.preventDefault();
        kpxcDefine.more();
    } else if (e.key === 'd') {
        e.preventDefault();
        kpxcDefine.discard();
    }
};

const removeContent = function(pattern) {
    const elems = kpxcDefine.chooser.querySelectorAll(pattern);
    for (const e of elems) {
        e.remove();
    }
};
