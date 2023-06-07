import Parchment from 'parchment';
import Quill from 'quill';
const Keyboard = Quill.import('modules/keyboard')

export default class EnterKeyboard extends Keyboard {
  constructor(quill: any, options: any) {
    super(quill, options);
    this.bindings = {};
    Object.keys(this.options.bindings).forEach((name) => {
      if (name === 'list autofill' &&
          quill.scroll.whitelist != null &&
          !quill.scroll.whitelist['list']) {
        return;
      }
      if (this.options.bindings[name]) {
        this.addBinding(this.options.bindings[name]);
      }
    });
    this.addBinding({ key: Keyboard.keys.ENTER, shiftKey: null }, this.handleEnter);
    this.addBinding({ key: Keyboard.keys.ENTER, metaKey: null, ctrlKey: null, altKey: null }, function() {});
    if (/Firefox/i.test(navigator.userAgent)) {
      // Need to handle delete and backspace for Firefox in the general case #1171
      this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true }, this.handleBackspace);
      this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true }, this.handleDelete);
    } else {
      this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true, prefix: /^.?$/ }, this.handleBackspace);
      this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true, suffix: /^.?$/ }, this.handleDelete);
    }
    this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: false }, this.handleDeleteRange);
    this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: false }, this.handleDeleteRange);
    this.addBinding({ key: Keyboard.keys.BACKSPACE, altKey: null, ctrlKey: null, metaKey: null, shiftKey: null },
                    { collapsed: true, offset: 0 },
                    this.handleBackspace);
    this.listen();
  }

  handleEnter(range: any, context: any) {
    if (range.length > 0) {
      this.quill.scroll.deleteAt(range.index, range.length) // So we do not trigger text-change
    }
    let lineFormats = Object.keys(context.format).reduce(function (
      lineFormats,
      format
    ) {
      if (
        Parchment.query(format, Parchment.Scope.BLOCK) &&
        !Array.isArray(context.format[format])
      ) {
        lineFormats[format] = context.format[format]
      }
      return lineFormats
    },
    {})
    this.quill.insertText(range.index, '\n', lineFormats, Quill.sources.USER)
    // Earlier scroll.deleteAt might have messed up our selection,
    // so insertText's built in selection preservation is not reliable
    this.quill.setSelection(range.index + 1, Quill.sources.SILENT)
    this.quill.focus()
    Object.keys(context.format).forEach((name) => {
      if (lineFormats[name] != null) return
      if (Array.isArray(context.format[name])) return
      if (name === 'link') return
      this.quill.format(name, context.format[name], Quill.sources.USER)
    })
  }
}
