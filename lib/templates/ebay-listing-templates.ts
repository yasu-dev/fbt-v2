// eBay Listing HTML Templates
// 5つのプロフェッショナルテンプレート

export interface EbayTemplate {
  id: string;
  name: string;
  coverImage: string;
  theme: string;
  html: string;
}

// テンプレート共通のスタイル
const commonStyles = `
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
<style>
    .template__main {
        word-break: break-word;
        max-width: 100%;
        background: #fff;
        border: 1px solid #000;
        padding: 0 20px 30px 20px !important;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        word-break: break-all;
    }

    .template__main h1 {
        font-family: "Verdana", sans-serif, sans-serif !important;
        font-style: italic;
        font-weight: bold;
        font-size: 22px !important;
        margin: 30px 0;
        text-align: center;
        color: #FF0010;
        word-break: break-word;
    }

    .template__main h2 {
        position: relative;
        background-color: #FFF100;
        font-family: "Verdana", sans-serif, sans-serif !important;
        font-style: italic;
        font-size: 18px !important;
        margin: 15px 0 15px 0;
        padding: 10px 10px;
        line-height: 1.2;
        text-align: left;
        color: #000;
        word-break: break-word;
    }

    .template__main h2:before {
        position: absolute;
        content: "";
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 15px 14px 0 14px;
        border-color: #FFF100 transparent transparent transparent;
        bottom: -10px;
    }

    .template__main h3 {
        position: relative;
        font-weight: bold;
        font-size: 18px !important;
        margin: 0;
        padding: 15px 10px 5px 20px;
        color: #111;
        word-break: break-word;
    }

    .template__main h3:before {
        position: absolute;
        left: 5px;
        content: "\\025a0";
        color: #FF0010;
    }

    .template__main .main__table {
        font-family: "Verdana", sans-serif, sans-serif !important;
        width: auto;
        padding-left: 50px;
        padding-bottom: 40px;
    }

    .template__main .main__table h3 {
        margin: 0;
        padding: 0 0 10px 0;
        font-size: 14px;
        color: #111;
        text-align: center;
        word-wrap: break-word;
        word-break: break-word;
    }

    .template__main .main__table table th {
        font-weight: bold;
        text-align: left;
    }

    .template__main .product_dec {
        font-style: italic;
        font-size: 18px !important;
        margin: 0;
        padding: 0 0 20px 0;
        text-align: left;
        color: #111;
    }

    .template__main .product__intro {
        font-size: 14px;
        line-height: 24px;
        padding: 0 30px 20px;
    }

    .template__main .product__intro ol {
        margin: 0;
        padding: 0;
    }

    .template__main .product__intro ol li {
        font-family: "Verdana", sans-serif, sans-serif !important;
        list-style-type: disc;
        font-size: 14px;
        color: #111;
        word-break: break-word;
    }

    .template__main p {
        word-break: break-word;
        font-family: "Verdana", sans-serif, sans-serif !important;
        margin: 0;
        padding: 0 10px 20px;
        font-size: 14px;
        line-height: 24px;
        text-align: left;
        color: #111;
    }

    .template__main table {
        border-collapse: separate;
        border-spacing: revert;
        width: 100% !important;
        font-size: 14px;
    }

    .template__main table tr {
        background-color: #eee;
        color: #111;
    }

    .template__main table tr:first-of-type {
        background-color: #FFF100;
        color: #111;
    }

    .template__main table th,
    .template__main table td {
        font-family: "Verdana", sans-serif, sans-serif !important;
        padding: 0.5em 0 0.5em 0.5em;
        word-break: break-word;
    }

    .template__main section {
        padding-bottom: 20px;
    }

    .template__main .img-area {
        text-align: center;
    }

    .template__main img {
        max-width: 100%;
        object-fit: cover;
    }
</style>`;

// テンプレート本体の生成関数
const generateTemplateHTML = (coverImage: string) => `${commonStyles}
<div class="template__main">
    <div class="img-area"><img src="${coverImage}" width="100%" alt="Cover Image"></div>
    <h1>{{itemTitle}}</h1>
    <section class="product_dec">
        <h2>Description</h2>
        <h3>Total Condition</h3>
        {{totalCondition}}
        <h3>Serial Number</h3>
        {{serialNumber}}
        <h3>Appearance</h3>
        {{appearance}}
        <h3>Optics</h3>
        {{optics}}
        <h3>Functional</h3>
        {{functional}}
        <h3>Bundled Items</h3>
        {{bundledItems}}
        <h2>Payment</h2>
        <div class="img-area"><img src="https://hosting.photobucket.com/images/i/kouichi4001/_.jpg?width=590&amp;height=370&amp;fit=bounds" alt="Payment Method"></div>
        Payment is due within <u>3 days</u> of the auction end.<br>
        We will ship the item <u>3 business days</u> after your payment clears.
        <h2>Shipping</h2>
        We will send your goods by FedEx International Priority or EMS.<br>
        We will provide you with a tracking number.<br>
        Please bid with confidence.<br>
        <br>
        We only ship to addresses registered with Ebay.<br>
        Please note that we cannot ship to addresses that are not registered with Ebay.<br>
        <br>
        <font color="#ff0010">
            We ship Monday through Friday Japan time.<br>
            On Sundays (Japan time), pickups are closed and shipping will be arranged the next day.
        </font>
        <h2>Returns</h2>
        <font color="#ff0010">
            Unconditional Return Policy<br>
        </font>
        <br>
        Customer service and satisfaction are very important to us.<br>
        I have an unconditional return policy if notified within All return requests must be made within 30 days of the receipt of the item.<br>
        <br>
        <font color="#ff0010">
            Please contact me first for return before you ship it back to me.<br>
            The postage of the returned goods is a buyer burden.
        </font>
        <h2>International Buyers</h2>
        Please Note:<br>
        Import duties, taxes, and charges are not included in the item price or shipping cost.<br>
        These charges are the buyer's responsibility.<br>
        Please check with your country's customs office to determine what these additional costs will be prior to bidding or buying.
    </section>
</div>`;

// 5つのテンプレート定義
export const ebayListingTemplates: EbayTemplate[] = [
  {
    id: 'template1',
    name: 'テンプレート① (オレンジ)',
    coverImage: 'https://hosting.photobucket.com/images/i/kouichi4001/78.jpg',
    theme: 'orange',
    html: generateTemplateHTML('https://hosting.photobucket.com/images/i/kouichi4001/78.jpg')
  },
  {
    id: 'template2',
    name: 'テンプレート② (ブルー)',
    coverImage: 'https://hosting.photobucket.com/images/i/kouichi4001/79.jpg',
    theme: 'blue',
    html: generateTemplateHTML('https://hosting.photobucket.com/images/i/kouichi4001/79.jpg')
  },
  {
    id: 'template3',
    name: 'テンプレート③ (グリーン)',
    coverImage: 'https://hosting.photobucket.com/images/i/kouichi4001/77.jpg',
    theme: 'green',
    html: generateTemplateHTML('https://hosting.photobucket.com/images/i/kouichi4001/77.jpg')
  },
  {
    id: 'template4',
    name: 'テンプレート④ (パープル)',
    coverImage: 'https://hosting.photobucket.com/images/i/kouichi4001/80.jpg',
    theme: 'purple',
    html: generateTemplateHTML('https://hosting.photobucket.com/images/i/kouichi4001/80.jpg')
  },
  {
    id: 'template5',
    name: 'テンプレート⑤ (レッド)',
    coverImage: 'https://hosting.photobucket.com/images/i/kouichi4001/_2022-09-06_20.51.45(1).png',
    theme: 'red',
    html: generateTemplateHTML('https://hosting.photobucket.com/images/i/kouichi4001/_2022-09-06_20.51.45(1).png')
  }
];

// テンプレートフィールドの定義
export interface TemplateFields {
  itemTitle: string;
  totalCondition: string;
  serialNumber: string;
  appearance: string;
  optics: string;
  functional: string;
  bundledItems: string;
}

// デフォルト値
export const defaultTemplateFields: TemplateFields = {
  itemTitle: 'Sample Camera Product Title',
  totalCondition: 'Excellent condition',
  serialNumber: '123456',
  appearance: `Appearance is beautiful.<br>
Tiny scuffs from normal use.<br>
It shows signs of use.<br>
* Please check photos.`,
  optics: `Beautiful condition.<br>
There is no fungus.<br>
There is no haze.<br>
There is no scratches.<br>
There is a few dust.<br>
<strong>No problem in the shooting.</strong>`,
  functional: 'It works properly.',
  bundledItems: `All you can see on the picture will be included in a set of a package.<br>
<br>
Please refer to the pictures for more details.<br>
Please check the pictures and don't hesitate to ask any questions about the item!<br>
Thank you.`
};

// HTMLテンプレートにフィールド値を適用
export function applyFieldsToTemplate(template: string, fields: TemplateFields): string {
  let html = template;
  
  // 各フィールドを置換
  Object.entries(fields).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    html = html.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return html;
}

// HTMLサニタイズ（基本的なもの）
export function sanitizeHTML(html: string): string {
  // eBayで許可されているタグのみを保持
  const allowedTags = [
    'div', 'span', 'p', 'br', 'strong', 'b', 'i', 'em', 'u',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'tbody', 'thead',
    'img', 'a', 'font', 'section', 'style', 'meta', 'link'
  ];
  
  // 基本的なサニタイズ（実際の実装ではDOMPurifyなどを使用推奨）
  return html;
}
