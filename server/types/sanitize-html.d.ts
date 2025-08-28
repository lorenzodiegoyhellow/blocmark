declare module 'sanitize-html' {
  interface SanitizeOptions {
    allowedTags?: string[];
    disallowedTagsMode?: 'discard' | 'escape' | 'recursiveEscape';
    allowedAttributes?: { [index: string]: string[] } | boolean;
    allowedStyles?: { [index: string]: { [index: string]: RegExp[] } };
    selfClosing?: string[];
    allowedSchemes?: string[];
    allowedSchemesByTag?: { [index: string]: string[] };
    allowedSchemesAppliedToAttributes?: string[];
    allowProtocolRelative?: boolean;
    allowedIframeDomains?: string[];
    allowedIframeHostnames?: string[];
    parser?: {
      lowerCaseTags?: boolean;
      lowerCaseAttributeNames?: boolean;
      decodeEntities?: boolean;
    };
    transformTags?: { [tag: string]: string | ((tagName: string, attribs: string) => { tagName: string; attribs: any }) };
    exclusiveFilter?: (frame: { tag: string; attribs: { [index: string]: string }; text: string }) => boolean;
    textFilter?: (text: string) => string;
  }

  interface SanitizeDefaults {
    allowedTags: string[];
    allowedAttributes: { [index: string]: string[] };
  }

  interface SanitizeHtml {
    (dirty: string, options?: SanitizeOptions): string;
    defaults: SanitizeDefaults;
  }

  const sanitizeHtml: SanitizeHtml;
  export = sanitizeHtml;
}