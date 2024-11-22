import { _wcl } from './common-lib.js';
import { _wccss } from './common-css.js';
import Mustache from './mustache.js';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';
import 'https://unpkg.com/dompurify/dist/purify.min.js';
import 'https://unpkg.com/msc-circle-progress/mjs/wc-msc-circle-progress.js';

/*
 reference:
 - Built-in AI: https://developer.chrome.com/docs/ai/built-in
 - Built-in AI Early Preview Program: https://docs.google.com/document/d/18otm-D9xhn_XyObbQrc1v7SI-7lBX3ynZkjEpiS1V04/edit?tab=t.0
 - Summarization API: https://docs.google.com/document/d/1Bvd6cU9VIEb7kHTAOCtmmHNAYlIZdeNmV7Oy-2CtimA/edit?tab=t.0
 - Summarization API: https://developer.chrome.com/docs/ai/summarizer-api
 - MDN ::part(): https://developer.mozilla.org/en-US/docs/Web/CSS/::part
 */

const legals = {
  type: ['key-points', 'tl;dr', 'teaser', 'headline'],
  length: ['short', 'medium', 'long'],
  format: ['markdown', 'plain-text']
};

const defaults = {
  config: {
    type: legals.type[0],
    length: legals.length[0],
    format: legals.format[0],
    sharedContext: ''
  },
  disabled: false,
  l10n: {
    subject: 'Gemini',
    introduction: 'Here comes a summary.',
    summarize: 'Summarize',
    showlongersummary: 'Show me a longer summary',
    showshortersummary: 'Show me a shorter summary'
  }
};

const booleanAttrs = ['disabled']; // booleanAttrs default should be false
const objectAttrs = ['config', 'l10n'];
const custumEvents = {
  error: 'msc-ai-summarization-error',
  process: 'msc-ai-summarization-process',
  processEnd: 'msc-ai-summarization-process-end'
};
const NS = 'summarizer';

const template = document.createElement('template');
template.innerHTML = `
<style>
${_wccss}

:host {
  --block-size: auto;

  position: relative;
  display: block;
}

:host(.align-container-size) {
  --block-size: 100%;

  block-size: 100%;
}

:host([disabled]) {
  .btn-prompt--main {
    --btn-scale: var(--btn-scale-hide);
    --btn-pointer-events: none;
  }
}

.main {
  position: relative;
  block-size: var(--block-size);
  outline: 0 none;

  .main__slot {
    position: relative;
    inline-size: 100%;
    block-size: var(--block-size);
    display: block;

    &::slotted(*) {
      max-inline-size: 100%;
    }
  }
}

.btn-prompt {
  --btn-scale-show: 1;
  --btn-scale-hide: .001;
  --btn-scale: var(--btn-scale-show);
  --btn-pointer-events: auto;

  --block-size: 36px;
  --icon: path('M20 10.0196C14.6358 10.3431 10.3431 14.6358 10.0196 20H9.98042C9.65687 14.6358 5.36425 10.3431 0 10.0196V9.98043C5.36425 9.65688 9.65687 5.36424 9.98042 0H10.0196C10.3431 5.36424 14.6358 9.65688 20 9.98043V10.0196Z');
  
  --button-background: rgba(234 238 245);
  --button-background-size: auto auto;
  --button-animation-duration: 0ms;

  --sparkle-color: rgba(31 31 31);
  --sparkle-animation-duration: 0ms;

  &.btn-prompt--advance {
    --block-size: 30px;
    margin-block-end: 0;
  }

  position: relative;
  font-size: 16px;
  line-height: var(--block-size);
  font-family: system-ui,'Helvetica Neue',Helvetica,Arial,sans-serif;
  color: rgba(31 31 31);
  box-sizing: border-box;
  inline-size: fit-content;
  padding-inline: 10px 16px;
  margin-block-end: 12px;

  appearance: none;
  border: 0 none;
  outline: 0 none;
  box-shadow: none;

  background: var(--button-background);
  background-size: var(--button-background-size);
  border-radius: var(--block-size);
  animation: smart-draft-gradient var(--button-animation-duration) infinite linear;

  pointer-events: var(--btn-pointer-events);
  transition: scale 200ms ease;
  will-change: scale;
  scale: var(--btn-scale);

  display: flex;
  gap: 4px;
  align-items: center;

  &:active {
    scale: .9;
  }

  &::before {
    content: '';
    inline-size: 20px;
    aspect-ratio: 1/1;
    display: block;
    scale: .87;

    clip-path: var(--icon);
    background-color: var(--sparkle-color);
    animation: rolling-sparkle var(--sparkle-animation-duration) linear infinite;
  }

  &[inert] {
    --button-background: linear-gradient(135deg,#d3e3fd,#d0f8ff,#a8c7fa,#99f0ff,#d3e3fd,#d3e3fd,#d0f8ff,#a8c7fa,#99f0ff,#d3e3fd);
    --button-background-size: 800% 800%;
    --button-animation-duration: 2.1s;

    --sparkle-color: rgba(62 121 245);
    --sparkle-animation-duration: 2.5s;
  }

  &:focus-visible {
    --button-background: linear-gradient(135deg,#d3e3fd,#d0f8ff,#a8c7fa,#99f0ff,#d3e3fd,#d3e3fd,#d0f8ff,#a8c7fa,#99f0ff,#d3e3fd);
    --button-background-size: 800% 800%;
    --button-animation-duration: 2.1s;
  }

  @media (hover: hover) {
    &:hover {
      --button-background: linear-gradient(135deg,#d3e3fd,#d0f8ff,#a8c7fa,#99f0ff,#d3e3fd,#d3e3fd,#d0f8ff,#a8c7fa,#99f0ff,#d3e3fd);
      --button-background-size: 800% 800%;
      --button-animation-duration: 2.1s;
    }
  }
}

@keyframes smart-draft-gradient {
  0% { background-position: bottom right; }
  to { background-position: top 37.5% left 37.5%; }
}

@keyframes rolling-sparkle {
  0% { rotate: 0deg; }
  to { rotate: 360deg; }
}

/* dialog */
.fuji-alerts {
  --background: var(--msc-ai-summarization-dialog-background-color, rgba(255 255 255));
  --backdrop-color: var(--msc-ai-summarization-dialog-backdrop-color, rgba(35 42 49/.6));
  --head-text-color: var(--msc-ai-summarization-dialog-head-text-color, rgba(35 42 49));
  --line-color: var(--msc-ai-summarization-dialog-line-color, rgba(199 205 210));
  --close-icon-color: var(--msc-ai-summarization-dialog-close-icon-color, rgba(95 99 104));
  --close-hover-background-color: var(--msc-ai-summarization-dialog-close-hover-background-color, rgba(245 248 250));
  --apply-background-color: var(--msc-ai-summarization-dialog-apply-background-color, rgba(0 99 235));
  --introduction-color: var(--msc-ai-summarization-dialog-introduction-color, rgba(35 42 49));
  --result-color: var(--msc-ai-summarization-dialog-result-color, rgba(44 54 63));
  --result-background-color: var(--msc-ai-summarization-dialog-result-background-color, rgba(245 248 250));

  --padding-inline: 20px;
  --padding-block-start: 6px;
  --padding-block-end: var(--padding-inline);
  --margin: 24px;

  --content-inline-size: 600px;
  --content-max-inline-size: calc(100dvi - var(--padding-inline) * 2 - var(--margin) * 2);
  --content-max-block-size: calc(100dvb - var(--padding-block-start) - var(--padding-block-end) - var(--margin) * 2);

  --close-size: 40;
  --close-size-with-unit: calc(var(--close-size) * 1px);
  --close-mask: path('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
  --close-icon-scale: calc((var(--close-size) * .6) / 24);

  --main-max-block-size: calc(80dvb - var(--padding-block-start) - var(--padding-block-end) - (var(--close-size) * 1px + 4px + 1px)); /* fuji-alerts__form__head's padding-bottom + border size */

  background-color: var(--background);
  border-radius: 0.5em;
  border: 0 none;
  padding: var(--padding-block-start) var(--padding-inline) var(--padding-block-end);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.05);
  outline: 0 none;

  &::backdrop {
    background-color: var(--backdrop-color);
  }

  &[open],
  &[open]::backdrop {
    animation: fuji-alerts-open 400ms cubic-bezier(0.4, 0, 0.2, 1) normal;
  }

  &[close],
  &[close]::backdrop {
    animation: fuji-alerts-close 400ms cubic-bezier(0, 0, 0.2, 1) normal;
  }

  .fuji-alerts__form {
    --head-font-size: 1.125em;

    inline-size: var(--content-inline-size);
    block-size: fit-content;
    max-inline-size: var(--content-max-inline-size);
    max-block-size: var(--content-max-block-size);
    outline: 0 none;
    display: block;

    @media screen and (width <= 767px) {
      --head-font-size: 1em;
    }

    .fuji-alerts__form__head {
      block-size: var(--close-size);
      padding-block-end: 4px;
      border-block-end: 1px solid var(--line-color);

      display: flex;
      align-items: center;
      justify-content: space-between;

      .fuji-alerts__form__head__p {
        font-size: var(--head-font-size);
        color: var(--head-text-color);
      }
    }

    .fuji-alerts__form__main {
      --gap: 1em;
      --mask-vertical-size: var(--gap);
      --mask-vertical: linear-gradient(
        to bottom,
        transparent 0%,
        black calc(0% + var(--mask-vertical-size)),
        black calc(100% - var(--mask-vertical-size)),
        transparent 100%
      );

      /* scroll */
      --scrollbar-inline-size: 2px;
      --scrollbar-block-size: 2px;
      --scrollbar-background: transparent;
      --scrollbar-thumb-color: rgba(0 0 0/.2);
      --scrollbar-thumb: var(--scrollbar-thumb-color);

      inline-size: 100%;
      min-block-size: 100px;
      max-block-size: var(--main-max-block-size);
      overflow: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      box-sizing: border-box;
      mask-image: var(--mask-vertical);
      -webkit-mask-image: var(--mask-vertical);
      padding-block: var(--gap);

      &::-webkit-scrollbar {
        inline-size: var(--scrollbar-inline-size);
        block-size: var(--scrollbar-block-size);
      }

      &::-webkit-scrollbar-track {
        background: var(--scrollbar-background);
      }

      &::-webkit-scrollbar-thumb {
        border-radius: var(--scrollbar-block-size);
        background: var(--scrollbar-thumb);
      }
    }
  }

  .fuji-alerts__close {
    --background-color-normal: rgba(255 255 255/0);
    --background-color-active: var(--close-hover-background-color);
    --background-color: var(--background-color-normal);

    font-size: 0;
    position: relative;
    inline-size: var(--close-size-with-unit);
    aspect-ratio: 1/1;
    appearance: none;
    border: 0 none;
    border-radius: var(--close-size-with-unit);
    outline: 0 none;
    background-color: var(--background-color);
    transition: background-color 200ms ease;
    will-change: background-color;
    z-index: 1;

    &::before {
      position: absolute;
      inset-inline: 0 0;
      inset-block: 0 0;
      margin: auto;
      inline-size: 24px;
      block-size: 24px;
      content: '';
      background-color: var(--close-icon-color);
      clip-path: var(--close-mask);
      scale: var(--close-icon-scale);
    }

    &:active {
      scale: .8;
    }

    &:focus {
      --background-color: var(--background-color-active);
    }

    @media (hover: hover) {
      &:hover {
        --background-color: var(--background-color-active);
      }
    }
  }

  @media screen and (width <= 767px) {
    --padding-inline: 12px;
    --padding-block-start: 4px;
    --margin: 0px;

    --close-size: 32;
    --content-inline-size: 100dvi;

    border-end-start-radius: 0;
    border-end-end-radius: 0;

    &[open],
    &[close] {
      animation: revert;
    }

    &[open]:modal {
      animation: fuji-alerts-open-dock 400ms cubic-bezier(0.4, 0, 0.2, 1) normal;
    }

    &[close]:modal {
      animation: fuji-alerts-close-dock 400ms cubic-bezier(0, 0, 0.2, 1) normal;
    }

    &:modal {
      inline-size: 100%;
      max-inline-size: 100%;
      box-sizing: border-box;
      inset-block: auto 0;
    }
  }
}

@keyframes fuji-alerts-open {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fuji-alerts-close {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes fuji-alerts-open-dock {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0%);
    opacity: 1;
  }
}

@keyframes fuji-alerts-close-dock {
  from {
    transform: translateY(0%);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.prompt-result {
  --summarization-content-color: var(--msc-ai-summarization-content-text-color, rgba(35 42 49));
  --summarization-content-highlight-color: var(--msc-ai-summarization-content-highlight-text-color, rgba(68 71 70));
  --summarization-content-highlight-background-color: var(--msc-ai-summarization-content-highlight-background-color, rgba(233 238 246));
  --summarization-content-pre-background-color: var(--msc-ai-summarization-content-group-background-color, rgba(241 244 248));

  position:relative;

  .pretty-paragraph {
    word-break: break-word;
    hyphens: auto;
    text-wrap: pretty;
    white-space: pre-wrap;
  }

  .prompt-result__title {
    --sparkle-size: 28px;

    min-block-size: var(--sparkle-size);
    color: var(--introduction-color);
    line-height: 1.3;
    padding-block-start: .225em;
    padding-inline-start: calc(var(--sparkle-size) + .5em);
    background: 0% 0% / var(--sparkle-size) var(--sparkle-size) no-repeat url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0IDI4QzE0IDI2LjA2MzMgMTMuNjI2NyAyNC4yNDMzIDEyLjg4IDIyLjU0QzEyLjE1NjcgMjAuODM2NyAxMS4xNjUgMTkuMzU1IDkuOTA1IDE4LjA5NUM4LjY0NSAxNi44MzUgNy4xNjMzMyAxNS44NDMzIDUuNDYgMTUuMTJDMy43NTY2NyAxNC4zNzMzIDEuOTM2NjcgMTQgMCAxNEMxLjkzNjY3IDE0IDMuNzU2NjcgMTMuNjM4MyA1LjQ2IDEyLjkxNUM3LjE2MzMzIDEyLjE2ODMgOC42NDUgMTEuMTY1IDkuOTA1IDkuOTA1QzExLjE2NSA4LjY0NSAxMi4xNTY3IDcuMTYzMzMgMTIuODggNS40NkMxMy42MjY3IDMuNzU2NjcgMTQgMS45MzY2NyAxNCAwQzE0IDEuOTM2NjcgMTQuMzYxNyAzLjc1NjY3IDE1LjA4NSA1LjQ2QzE1LjgzMTcgNy4xNjMzMyAxNi44MzUgOC42NDUgMTguMDk1IDkuOTA1QzE5LjM1NSAxMS4xNjUgMjAuODM2NyAxMi4xNjgzIDIyLjU0IDEyLjkxNUMyNC4yNDMzIDEzLjYzODMgMjYuMDYzMyAxNCAyOCAxNEMyNi4wNjMzIDE0IDI0LjI0MzMgMTQuMzczMyAyMi41NCAxNS4xMkMyMC44MzY3IDE1Ljg0MzMgMTkuMzU1IDE2LjgzNSAxOC4wOTUgMTguMDk1QzE2LjgzNSAxOS4zNTUgMTUuODMxNyAyMC44MzY3IDE1LjA4NSAyMi41NEMxNC4zNjE3IDI0LjI0MzMgMTQgMjYuMDYzMyAxNCAyOFoiIGZpbGw9InVybCgjcGFpbnQwX3JhZGlhbF8xNjc3MV81MzIxMikiLz4KPGRlZnM+CjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQwX3JhZGlhbF8xNjc3MV81MzIxMiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgyLjc3ODc2IDExLjM3OTUpIHJvdGF0ZSgxOC42ODMyKSBzY2FsZSgyOS44MDI1IDIzOC43MzcpIj4KPHN0b3Agb2Zmc2V0PSIwLjA2NzEyNDYiIHN0b3AtY29sb3I9IiM5MTY4QzAiLz4KPHN0b3Agb2Zmc2V0PSIwLjM0MjU1MSIgc3RvcC1jb2xvcj0iIzU2ODREMSIvPgo8c3RvcCBvZmZzZXQ9IjAuNjcyMDc2IiBzdG9wLWNvbG9yPSIjMUJBMUUzIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==");
    box-sizing: border-box;
  }

  .prompt-result__content {
    color: var(--summarization-content-color);
    line-height: 1.3;
    inline-size: 100%;
    box-sizing: border-box;
    padding-inline: 1em;

    strong {
      font-weight: 700;
    }

    ul, ol {
      list-style: initial;
      margin-block: .5em;

      li+li {
        margin-block-start: .25em;
      }
    }

    code {
      font-size: 14px;
      line-height: 1.5;
      font-family: Google Sans Mono,monospace;
      color: var(--summarization-content-highlight-color);
      background-color: var(--summarization-content-highlight-background-color);
      border-radius: 6px;
      padding: 1px 6px;
    }

    pre:has(code) {
      max-inline-size: 100%;

      word-break: break-word;
      hyphens: auto;
      text-wrap: pretty;
      white-space: pre-wrap;

      background-color: var(--summarization-content-pre-background-color);
      border-radius: .75em;
      box-sizing: border-box;
      padding: 1em;

      code {
        background-color: transparent;
        border-radius: unset;
        padding: unset;
      }
    }
  }

  .prompt-result__action {
    padding-block: 1em;
  }
}
</style>

<div class="main" ontouchstart="" tabindex="0">
  <button
    type="button"
    class="btn-prompt btn-prompt--main"
    title="${defaults.l10n.summarize}"
    aria-label="${defaults.l10n.summarize}"
    part="trigger"
  >
    ${defaults.l10n.summarize}
  </button>
  <slot class="main__slot"></slot>
</div>

<dialog class="fuji-alerts">
  <form class="fuji-alerts__form dialog-content">
    <div class="fuji-alerts__form__head">
      <p class="fuji-alerts__form__head__p">${defaults.l10n.subject}</p>
      <button
        type="button"
        class="fuji-alerts__close"
        data-action="close"
      >
        cancel
      </button>
    </div>

    <div class="fuji-alerts__form__main">
      <div class="prompt-result">
        <p class="prompt-result__title pretty-paragraph">${defaults.l10n.introduction}</p>
        <div class="prompt-result__content pretty-paragraph"></div>
      
        <div class="prompt-result__action">
          <button
            type="button"
            class="btn-prompt btn-prompt--advance"
            data-action="advance"
          >
            ${defaults.l10n.showlongersummary}
          </button>
        </div>
      </div>
    </div>
  </form>
</dialog>
`;

const templateProgressSet = document.createElement('template');
templateProgressSet.innerHTML = `
<style>
.built-in-ai-loading-progress {
  --size: 50px;

  inset-inline-start: calc(100dvi - var(--size) - 8px);
  inset-block-start: calc(100dvb - var(--size) - 8px);

  inline-size: var(--size);
  aspect-ratio: 1/1;
  border-radius: var(--size);
  background-color: rgba(0 0 0/.8);

  padding: 5px;
  box-sizing: border-box;

  &::after {
    position: absolute;
    inset-inline-start: 50%;
    inset-block-start: 50%;
    content: 'AI';
    color: rgba(255 255 255);
    font-size: 16px;
    transform: translate(-50%, -50%);
  }

  msc-circle-progress {
    --msc-circle-progress-font-size: 0px;
    --msc-circle-progress-font-color: rgba(255 255 255);
    --msc-circle-progress-color: rgba(84 129 236);
  }

  &:popover-open {
    opacity: 1;
    scale: 1;
  }

  opacity: 0;
  scale: .001;

  transition-property: opacity,scale,display;
  transition-duration: 250ms;
  transition-behavior: allow-discrete;

  @starting-style {
    &:popover-open {
      opacity: 0;
      scale: .001;
    }
  }
}
</style>
<div id="{{id}}" class="built-in-ai-loading-progress" popover="manual">
  <msc-circle-progress size="5" value="0" max="100" round></msc-circle-progress>
</div>
`;

// Houdini Props and Vals, https://web.dev/at-property/
if (CSS?.registerProperty) {
  try {
    CSS.registerProperty({
      name: '--msc-ai-summarization-dialog-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-dialog-backdrop-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49/.6)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-dialog-head-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-dialog-line-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(199 205 210)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-dialog-close-icon-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(95 99 104)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-dialog-close-hover-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(245 248 250)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-dialog-apply-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0 99 235)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-dialog-introduction-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-content-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-content-highlight-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(68 71 70)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-content-highlight-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(233 238 246)'
    });

    CSS.registerProperty({
      name: '--msc-ai-summarization-content-group-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(241 244 248)'
    });
  } catch(err) {
    console.warn(`msc-ai-summarization: ${err.message}`);
  }
}

let available = 'no';
if (window.ai?.[NS]) {
  const updateConfig = async() => {
    const { available: A } = await window.ai[NS].capabilities();

    available = A;
    defaults.config = {
      type: legals.type[0],
      length: legals.length[0],
      format: legals.format[0]
    };
  };

  const { available: A } = await window.ai[NS].capabilities();
  if (A === 'after-download') {
    // setup download progress
    const id = `ps-${_wcl.getUUID()}`;
    const progressSetString = Mustache.render(templateProgressSet.innerHTML, { id });
    document.body.insertAdjacentHTML('beforeend', progressSetString);
    const popover = document.querySelector(`#${id}`);
    const progress = document.querySelector(`#${id} msc-circle-progress`);

    popover.showPopover();
    requestAnimationFrame(() => progress.refresh());

    const summarizer = await window.ai[NS].create();
    summarizer.addEventListener('downloadprogress',
      (e) => {
        const { loaded, total } = e;
        const value = Math.floor((loaded / total) * 100);

        progress.value = value;

        // complete loading
        if (loaded >= total) {
          popover.hidePopover();
        }
      }
    );

    await summarizer.ready;
  }

  await updateConfig();
}

export class MscAiSummarization extends HTMLElement {
  #data;
  #nodes;
  #config;

  constructor(config) {
    super();

    // template
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // data
    this.#data = {
      controller: '',
      summary: ''
    };

    // nodes
    this.#nodes = {
      styleSheet: this.shadowRoot.querySelector('style'),
      trigger: this.shadowRoot.querySelector('.btn-prompt'),
      dialog: this.shadowRoot.querySelector('dialog'),
      btnClose: this.shadowRoot.querySelector('.fuji-alerts__close'),
      btnAdvance: this.shadowRoot.querySelector('.btn-prompt--advance'),
      dialogSubject: this.shadowRoot.querySelector('.fuji-alerts__form__head__p'),
      dialogResultIntroduction: this.shadowRoot.querySelector('.prompt-result__title'),
      dialogResultContent: this.shadowRoot.querySelector('.prompt-result__content'),
      dialogMain: this.shadowRoot.querySelector('.fuji-alerts__form__main')
    };

    // config
    this.#config = {
      ...defaults,
      ...config // new MscAiSummarization(config)
    };

    // evts
    this._onClick = this._onClick.bind(this);
    this._onDialogCancel = this._onDialogCancel.bind(this);
    this._onDialogButtonsClick = this._onDialogButtonsClick.bind(this);
  }

  async connectedCallback() {
   const { config, error } = await _wcl.getWCConfig(this);
   const { trigger, dialog } = this.#nodes;

    if (error) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${error}`);
      this.remove();
      return;
    } else {
      this.#config = {
        ...this.#config,
        ...config
      };
    }

    // feature detect
    if (available === 'no') {
      trigger.remove();
      return;
    }

    // upgradeProperty
    Object.keys(defaults).forEach((key) => this.#upgradeProperty(key));

    // evts
    this.#data.controller = new AbortController();
    const signal = this.#data.controller.signal;
    trigger.addEventListener('click', this._onClick, { signal });
    dialog.addEventListener('cancel', this._onDialogCancel, { signal });
    dialog.addEventListener('click', this._onDialogButtonsClick, { signal });
  }

  disconnectedCallback() {
    const { dialog } = this.#nodes;

    if (dialog.open) {
      dialog.close();
    }

    if (this.#data.controller?.abort) {
      this.#data.controller.abort();
    }
  }

  #format(attrName, oldValue, newValue) {
    const hasValue = newValue !== null;

    if (!hasValue) {
      if (booleanAttrs.includes(attrName)) {
        this.#config[attrName] = false;
      } else {
        this.#config[attrName] = defaults[attrName];
      }
    } else {
      switch (attrName) {
        case 'l10n':
        case 'config': {
          let values;

          try {
            values = JSON.parse(newValue);
          } catch(err) {
            console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
            values = { ...defaults[attrName] };
          }

          if (attrName === 'config') {
            const { type, length, format } = values;

            values = {
              type: legals.type.includes(type) ? type : legals.type[0],
              length: legals.length.includes(length) ? length : legals.length[0],
              format: legals.format.includes(format) ? format : legals.format[0]
            };
          }

          this.#config[attrName] = values;
          break;
        }

        case 'disabled':
          this.#config[attrName] = true;
          break;
      }
    }
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (!MscAiSummarization.observedAttributes.includes(attrName)) {
      return;
    }

    this.#format(attrName, oldValue, newValue);

    switch (attrName) {
      case 'l10n': {
        const { subject, introduction, summarize } = this.l10n;
        const { dialogSubject, dialogResultIntroduction, trigger } = this.#nodes;

        dialogSubject.textContent = subject;
        dialogResultIntroduction.textContent = introduction;
        trigger.textContent = summarize;
        trigger.title = summarize;
        trigger.ariaLabel = summarize;
        break;
      }
    }
  }

  static get observedAttributes() {
    return Object.keys(defaults); // MscAiSummarization.observedAttributes
  }

  static get supportedEvents() {
    return Object.keys(custumEvents).map(
      (key) => {
        return custumEvents[key];
      }
    );
  }

  #upgradeProperty(prop) {
    let value;

    if (MscAiSummarization.observedAttributes.includes(prop)) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        value = this[prop];
        delete this[prop];
      } else {
        if (booleanAttrs.includes(prop)) {
          value = (this.hasAttribute(prop) || this.#config[prop]) ? true : false;
        } else if (objectAttrs.includes(prop)) {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : JSON.stringify(this.#config[prop]);
        } else {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : this.#config[prop];
        }
      }

      this[prop] = value;
    }
  }

  set config(value) {
    if (value) {
      const newValue = {
        ...defaults.config,
        ...this.config,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('config', JSON.stringify(newValue));
    } else {
      this.removeAttribute('config');
    }
  }

  get config() {
    return this.#config.config;
  }

  set disabled(value) {
    this.toggleAttribute('disabled', Boolean(value));
  }

  get disabled() {
    return this.#config.disabled;
  }

  set l10n(value) {
    if (value) {
      const newValue = {
        ...defaults.l10n,
        ...this.l10n,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('l10n', JSON.stringify(newValue));
    } else {
      this.removeAttribute('l10n');
    }
  }

  get l10n() {
    return this.#config.l10n;
  }

  get available() {
    return available;
  }

  get summary() {
    return this.#data.summary;
  }

  #fireEvent(evtName, detail) {
    this.dispatchEvent(new CustomEvent(evtName,
      {
        bubbles: true,
        composed: true,
        ...(detail && { detail })
      }
    ));
  }

  #prepareDialogClose() {
    const { dialog } = this.#nodes;

    if (!dialog.open) {
      return;
    }

    dialog.addEventListener(
      'animationend',
      () => {
        dialog.removeAttribute('close');
        dialog.close();
      },
      { once: true }
    );

    dialog.toggleAttribute('close', true);
  }

  _onDialogCancel(evt) {
    evt.preventDefault();

    this.#prepareDialogClose();
  }

  async _onDialogButtonsClick(evt) {
    const button = evt.target.closest('button');

    if (!button) {
      return;
    }

    const action = button.dataset.action;

    switch (action) {
      case 'close': {
        this.#prepareDialogClose();
        break;
      }

      case 'advance': {
        this.#prepareDialogClose();

        this.config = {
          length: this.config.length === 'long' ? 'short' : 'long'
        };

        await this.summarize({
          content: this.#data.prompts,
          useDialog: true
        });
        break;
      }
    }
  }

  async _onClick() {
    await this.summarize({ useDialog: true });
  }

  #getPrompts() {
    let clone = this.cloneNode(true);
    let prompts = '';

    const useless = Array.from(clone.querySelectorAll('style,script,noscript,base,link,meta,map,template'));
    useless.forEach((node) => node.remove());

    prompts = clone.textContent.trim();
    clone = null;

    return prompts;
  }

  async summarize({ content = '', useDialog = false, context = '' } = {}) {
    const { dialog, dialogMain, dialogResultContent, trigger, btnAdvance } = this.#nodes;
    const { format } = this.config;
    let result = '';

    if (!content) {
      content = this.#getPrompts();
    }

    if (!content || available === 'no') {
      return result;
    }

    const summarizer = await window.ai[NS].create(this.config);
    this.#data.summary = '';

    trigger.inert = true;
    btnAdvance.inert = true;
    this.#fireEvent(custumEvents.process);

    try {
      result = await summarizer.summarize(content, { context });
    } catch(err) {
      const { message } = err;

      if (dialog.open) {
        dialog.close();
      }

      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${message}`);
      this.#fireEvent(custumEvents.error, { message });
    }
    
    this.#data.summary = result;
    this.#data.prompts = content;
    summarizer.destroy();

    trigger.inert = false;
    btnAdvance.inert = false;
    this.#fireEvent(custumEvents.processEnd);

    // show result by dialog
    if (result && useDialog) {
      dialogResultContent.replaceChildren();

      if (format === 'markdown') {
        // convert markdown to html
        dialogResultContent.innerHTML = window.DOMPurify.sanitize(marked.parse(result));
      } else {
        dialogResultContent.textContent = result;
      }

      dialogMain.scrollTop = 0;
      btnAdvance.textContent = this.config.length === 'long'
        ? this.l10n.showshortersummary
        : this.l10n.showlongersummary
      ;

      dialog.showModal();
    }

    return result;
  }
}

// define web component
const S = _wcl.supports();
const T = _wcl.classToTagName('MscAiSummarization');
if (S.customElements && S.shadowDOM && S.template && !window.customElements.get(T)) {
  window.customElements.define(_wcl.classToTagName('MscAiSummarization'), MscAiSummarization);
}