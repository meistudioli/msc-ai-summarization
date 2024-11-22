# msc-ai-summarization

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/msc-ai-summarization) [![DeepScan grade](https://deepscan.io/api/teams/16372/projects/28306/branches/911426/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=16372&pid=28306&bid=911426)

&lt;msc-ai-summarization /> is a web component based on Chrome Built-in AI > Summarization API. Web developers could use &lt;msc-ai-summarization /> wrap article which want to adopt summarize feature.

![<msc-ai-sumarization />](https://blog.lalacube.com/mei/img/preview/msc-ai-summarization.png)

## Basic Usage

&lt;msc-ai-summarization /> is a web component. All we need to do is put the required script into your HTML document. Then follow &lt;msc-ai-summarization />'s html structure and everything will be all set.

- Required Script

```html
<script
  type="module"
  src="https://unpkg.com/msc-ai-summarizationt/mjs/wc-msc-ai-summarization.js">        
</script>
```

- Structure

Put &lt;msc-ai-summarization /> into HTML document. It will have different functions and looks with attribute mutation.

```html
<msc-ai-summarization>
  <script type="application/json">
    {
      "config": {
        "type": "key-points",
        "length": "short",
        "format": "markdown",
        "sharedContext": ""
      },
      "l10n": {
        "subject": "Gemini",
        "introduction": "Here comes a summary.",
        "summarize": "Summarize this article",
        "showlongersummary": "Show me a longer summary",
        "showshortersummary": "Show me a shorter summary"
      }
    }
  </script>

  <!-- Put content element(s) which like to adopt summarize feature here -->
  <div class="intro">
    Apple introduces iPhone 16 and iPhone 16 Plus
    ...
    ...
    ...
  </div>
</msc-ai-summarization>
```

Otherwise, developers could also choose remoteconfig to fetch config for &lt;msc-ai-summarization />.

```html
<msc-ai-summarization
  remoteconfig="https://your-domain/api-path"
>
  ...
</msc-ai-summarization>
```

## JavaScript Instantiation

&lt;msc-ai-summarization /> could also use JavaScript to create DOM element. Here comes some examples.

```html
<script type="module">
import { MscAiSummarization } from 'https://unpkg.com/msc-ai-summarization/mjs/wc-msc-ai-summarization.js';

const contentElementTemplate = document.querySelector('.my-content-element-template');

// use DOM api
const nodeA = document.createElement('msc-ai-summarization');
document.body.appendChild(nodeA);
nodeA.appendChild(contentElementTemplate.content.cloneNode(true));
nodeA.config = {
  type: 'key-points',
  length: 'short',
  format: 'markdown'
};

// new instance with Class
const nodeB = new MscAiSummarization();
document.body.appendChild(nodeB);
nodeB.appendChild(contentElementTemplate.content.cloneNode(true));
nodeB.config = {
  type: 'tl;dr',
  length: 'long',
  format: 'markdown'
};

// new instance with Class & default config
const config = {
  config: {
    type: 'teaser',
    length: 'medium',
    format: 'plain-text'
  }
};
const nodeC = new MscAiSummarization(config);
document.body.appendChild(nodeC);
nodeC.appendChild(contentElementTemplate.content.cloneNode(true));
</script>
```

## Style Customization

Developers could apply styles to decorate &lt;msc-ai-summarization />'s looking.

```html
<style>
msc-ai-summarization {
  /* dialog */
  --msc-ai-summarization-dialog-background-color: rgba(255 255 255);
  --msc-ai-summarization-dialog-backdrop-color: rgba(35 42 49/.6);
  --msc-ai-summarization-dialog-head-text-color: rgba(35 42 49);
  --msc-ai-summarization-dialog-line-color: rgba(199 205 210);
  --msc-ai-summarization-dialog-close-icon-color: rgba(95 99 104);
  --msc-ai-summarization-dialog-close-hover-background-color: rgba(245 248 250);
  --msc-ai-summarization-dialog-introduction-color: rgba(35 42 49);
  --msc-ai-summarization-content-text-color: rgba(35 42 49);
  --msc-ai-summarization-content-highlight-text-color: rgba(68 71 70);
  --msc-ai-summarization-content-highlight-background-color: rgba(233 238 246);
  --msc-ai-summarization-content-group-background-color: rgba(241 244 248);
}
</style>
```

Delevelopers could add className - align-container-size to make &lt;msc-ai-summarization />'s size same as container's size.（default is inline-size: 100% only）

```html
<msc-ai-summarization class="align-container-size">
  ...
</msc-ai-summarization>
```

Otherwise, apply pseudo class `::part(trigger)` to direct style the summarize button.

```html
<style>
msc-ai-summarization {
  &::part(trigger) {
    background: red;
  }

  &::part(trigger):hover {
    background: green;
  }
}
</style>
```

## Attributes

&lt;msc-ai-summarization /> supports some attributes to let it become more convenience & useful.

- **config**

Set `type`、`length`、`format` and `sharedContext` for summarize setting.

`type`：Set type from `key-points`、`tl;dr`、`teaser` and `headline`. Default is `key-points`.\
`length`：Set length from `short`、`medium` and `long`. Default is `short`.\
`format`：Set format from `markdown` and `plain-text`. Default is `markdown`.\
`sharedContext`：Set sharedContext. Default is `""`.

```html
<msc-ai-summarization config='{"type":"key-points","length":"short","format":"markdown","sharedContext":""}'>
  ...
</msc-ai-summarization>
```

- **disabled**

Hides the summarize trigger button once set. It is `false` by default (not set).

```html
<msc-ai-summarization disabled>
  ...
</msc-ai-summarization>
```

- **l10n**

Set localization for title or action buttons.

`subject`：Set dialog subject.\
`introduction`：Set dialog result title.\
`summarize`：Set summarize trigger button's content.\
`showlongersummary`：Set advance button's content. (when lenght !== long)\
`showshortersummary`：Set advance button's content. (when lenght === long)

```html
<msc-ai-summarization l10n='{"subject":"Gemini","introduction":"Here comes a summary.","summarize":"Summarize","showlongersummary":"Show me a longer summary","showshortersummary":"Show me a shorter summary"}'>
  ...
</msc-ai-summarization>
```

## Properties

| Property Name | Type | Description |
| ----------- | ----------- | ----------- |
| config | Object | Getter / Setter config. Developers could set `type`、`length`、`format` and `sharedContext` here. |
| disabled | Boolean | Getter / Setter disabled. Hides the summarize trigger button once set. It is false by default. |
| l10n | Object | Getter / Setter localization for title or action buttons. Developers could set `subject`、`introduction`、`summarize`、`showlongersummary` and `showshortersummary` here. |
| available | String | Getter available. Web developers will get "`no`" if current browser doesn't support Build-in AI. |
| summary | String | Getter the last summary. |

## Mathods

| Mathod Signature | Description |
| ----------- | ----------- |
| summarize({ content = '', useDialog = false }) | Go summarize. This is an async function. Default will take &lt;msc-ai-summarization />'s children's text content. Developers could set `useDialog` to decide display summary by dialog or not. |

## Event
| Event Signature | Description |
| ----------- | ----------- |
| msc-ai-summarization-error | Fired when summarize process error occured. Developers could gather `message` information through event.detail. |
| msc-ai-summarization-process | Fired when prompt processing. |
| msc-ai-summarization-process-end | Fired when prompt process end. |

## Reference
- [AI on Chrome > Built-in AI](https://developer.chrome.com/docs/ai/built-in)
- [Join the early preview program](https://docs.google.com/forms/d/e/1FAIpQLSfZXeiwj9KO9jMctffHPym88ln12xNWCrVkMY_u06WfSTulQg/viewform)
- [Built-in AI > Summarization API](https://developer.chrome.com/docs/ai/summarizer-api)
- [&lt;msc-ai-summarization /> demo](https://blog.lalacube.com/mei/webComponent_msc-ai-summarization.html)
- [YouTube tutorial](https://youtube.com/shorts/xmqxw8PPTFo)
- [WEBCOMPONENTS.ORG](https://www.webcomponents.org/element/msc-ai-summarization)
