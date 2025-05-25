// language-config.js

interface LanguageConfig {
  name: string;
  aliases?: string[]; // e.g. "js" also "javascript"
  indent: string; // indent unit, e.g. "  " or "\t"
  blockStart?: RegExp; // if start of block(used when typing enter)
  blockEnd?: RegExp; // if end of block(optional)
  autoClose?: {
    braces?: boolean; // if auto close {}
    tags?: boolean; // if auto close HTML tags
  };
  comment?: {
    line: string; // single line annotation symbol
    block?: [string, string]; // block annotation symbol(e.g. /* */)
  };
  keywords?: string[]; // auto completion
  specialRules?: {
    continueCommentOnEnter?: boolean; // if continue commenting when typing enter(e.g. `//` auto completion)
    indentAfterColon?: boolean; // Python auto indent after `:`
  };
}
export const languageConfigs: { [key: string]: LanguageConfig } = {
  javascript: {
    name: 'javascript',
    aliases: ['js'],
    indent: '  ',
    blockStart: /{\s*$/,
    blockEnd: /^\s*}/,
    comment: {
      line: '//',
    },
  },
  python: {
    name: 'python',
    indent: '    ',
    blockStart: /:\s*$/,
    comment: {
      line: '#',
    },
  },
  html: {
    name: 'html',
    indent: '  ',
    blockStart: /<[^/!][^>]*?>$/,
    comment: {
      line: '<!--',
    },
  },
};
