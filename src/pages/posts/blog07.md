---
title: 'Cloudflare Workers & Sendinblue & Astroでお問い合わせフォームをつくる'
layout: '@layouts/BlogLayout.astro'
date: '2022-08-23'
# lastmod: '2022-08-11'
tags:
  [
    'Astro',
    'TypeScript',
    'Cloudflare Workers',
    'Jamstack',
    'Sendinblue',
    'email',
  ]
excerpt: 'Astroで作成したサイトにお問い合わせフォーム機能をつける（Cloudflare Workers & Sendinblue編）'
---

[前回](https://www.kyoya.dev/posts/blog06/)はFormspreeを利用してお問い合わせフォームを作りましたが、自前のバックエンドで構築したいときもあるかと思います。

現在、[Cloudflare Workers](https://workers.cloudflare.com/)を攻略しようと目論んでおり、その一環でサーバーレスなお問い合わせフォームを作ってみました。通常のNode.js環境であれば、nodemailer等のライブラリを使用すれば事足りるのですが、Cloudflare Workersはやや仕様が異なるため、そう簡単にいきません。メールサービス各社が提供しているSDKも動かないことの方が多いかと思われます。

※Cloudflare Workersの仕様について詳しくは[こちら](https://developers.cloudflare.com/workers/learning/how-workers-works/)。

どうしたものかと色々調べていたところ、[こちらの方の記事](https://www.sitepoint.com/jamstack-form-handling-cloudflare-workers/)を発見しまして、「なるほど！直接APIを叩けばいいのか！」と発想を得た次第です。コードも要所要所参考にさせてもらいました。ありがとうございます🙇

上記のブログではメールサービスとして[mailgun](https://www.mailgun.com/)を使用していますが、mailgunは無料利用期間があるだけで無料プランがないのと、有料プラン高すぎだろと感じるため却下。その他、代表的なものとしては[SendGrid](https://sendgrid.com/)がありますが、こちらは無料プランがあるものの、アクティブでない状態で一定期間過ぎると**勝手に**サービスを停止するという暴挙に出るためこれまた却下。せめて連絡よこしてくださいな…。

ということで今回メールサービスとして採用するのは[Sendinblue](https://www.sendinblue.com/)です。無料プランでも一日あたり300通送信可能という太っ腹なサービスです。ただし、基本的には専用ライブラリで構築することを前提としているようですので、今回のやりかたは若干ハック感が否めません。ご容赦を。

SendinblueのAPIの利用にあたって、送信者メールアドレスの登録やAPI keyの取得が必要になります。

---

Cloudflare Workersのレポジトリは[こちら](https://github.com/KYOYA-OGA/cloudflare-workers-with-sendinblue)です。<br/> フロントエンドのレポジトリは[こちら](https://github.com/KYOYA-OGA/astro-form-demo)。

---

# Cloudflare Workersをセットアップする

Cloudflare Workersはちょこちょこ仕様が変わるようで、最新のものは[公式ドキュメント](https://developers.cloudflare.com/workers/)を参考にしてもらいたいのですが、公式ドキュメントにあるものすら古かったりするので困ったものです。余談でした。

開発環境を整えるためには、wranglerをインストールする必要があります。

```
npm install -g wrangler
```

<div class="custom-block info">
  <div class="custom-block-body">
    <p>自分の場合ここでハマりました笑。sudoを入れても権限エラーでインストールできない（Intel Mac環境）。Node.jsのバージョンマネージャーが原因だったようで、nvmを利用することで解決しました。</p>
  </div>
</div>

wranglerのコマンドでCloudflare Workers環境を立ち上げることができます。

```
wrangler generate cw-mail-demo
```

wranglerの基本的な使い方については[こちら](https://egghead.io/courses/introduction-to-cloudflare-workers-5aa3)のチュートリアル動画がおすすめです。

---

# Cloudflare WorkersでPOSTリクエストを処理する

Cloudflare Workersで行うことは以下の3点になります。

1. POSTリクエストを受け付ける
2. バリデーション
3. メール送信

## POSTリクエストを受け付ける

POSTかつcontent-typeがapplication/jsonのリクエストのみを受け付けるようにしているだけです。フロントからformDataを送る場合は別途対応が必要になりますが、今回はJSONを送るだけなのでよしとします。

#### src/index.ts

```ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'POST') {
      return handlePostRequest(request, env);
    } else {
      return new Response('Object not found', {
        status: 404,
        statusText: 'Not Found',
      });
    }
  },
};

async function readRequestJsonOnly(request: Request) {
  const { headers } = request;
  const contentType = headers.get('content-type');

  if (!contentType) {
    throw new Error('Content-Type header is missing');
  }

  if (contentType.includes('application/json')) {
    const body = await request.json();
    return body;
  }

  throw new Error('Content-Type header is not supported');
}

async function handlePostRequest(request: Request, env: Env) {
  try {
    const response = (await readRequestJsonOnly(request)) as IInput;
  } catch (error: any) {
    return new Response(error, {
      headers: { 'Content-Type': 'text/plain' },
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
```

送信データはrequestオブジェクトに格納されており、その中身はname,email,messageを想定しますので型を用意しておきます。

#### src/types.ts

```ts
export interface IInput {
  name: string;
  email: string;
  message: string;
}
```

## バリデーション

送信データのバリデーションをしておきます。@cfworker/json-schemaというCloudflare Workersでも使えるライブラリがあるとのことですのでこちらを利用します。

#### src/validator.ts

```ts
import { Validator } from '@cfworker/json-schema';

const validator = new Validator({
  type: 'object',
  required: ['name', 'email', 'message'],
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    message: { type: 'string', minLength: 1 },
  },
});

export function validate(input: any) {
  const { valid, errors } = validator.validate(input);

  const errorsList = errors.map((err) => {
    return {
      type: err.keyword,
      message: err.error,
    };
  });

  return { valid, errors: errorsList };
}
```

それぞれの入力項目を必須にして、メールアドレスの形式をチェックしています。typeをstringのみにすると何故か空文字で送信可能だったので、minLengthに1を設定しています。

index.tsファイルにバリデーションを追加します。

#### src/index.ts

```ts
//...
const response = (await readRequestJsonOnly(request)) as IInput;
const results = validate(response);

if (!results.valid) {
  return new Response(JSON.stringify(results), {
    status: 400,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
```

送信内容をチェックして、エラーがあったらエラーの内容を返します。

<div class="custom-block info">
  <div class="custom-block-body">
    <p>後になって気づいたのですが、このバリデーションだけですとフロント側から何でも送信可能です😅。厳密にname,email,message以外を受け付けないようにするには別の処理が必要になります。</p>
  </div>
</div>

## メール送信

取得したデータに基づいてメールを送りましょう。今回は管理者のみに送る仕様です。送信者本人に対して送信確認メールを送ることもできますが、あれ必要ですか？スパムの踏み台にされることもしばしばなので、なくなってほしい習慣です。

#### src/sendMail.ts

```ts
import { Env, IInput } from './types';

export async function sendMail(response: IInput, env: Env) {
  const { name, email, message } = response;
  const content = {
    sender: {
      name: env.SENDER_NAME,
      email: env.SENDER_EMAIL,
    },
    to: [
      {
        email: env.SEND_TO_EMAIL,
        name: env.SEND_TO_NAME,
      },
    ],
    textContent: `サイトからメッセージが届きましたよ。\n 名前:${name}\n メールアドレス:${email}\n メッセージ:${message}`,
    subject: 'サイトからメッセージが届きました',
    replyTo: {
      email: env.REPLY_TO_EMAIL,
      name: env.REPLY_TO_NAME,
    },
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': env.SIB_API_KEY,
    },
    body: JSON.stringify(content),
  };
  return fetch('https://api.sendinblue.com/v3/smtp/email', options);
}
```

色々書いていますが、基本的にはSendinblueの仕様に基づいてデータを整形しているだけです。[こちら](https://developers.sendinblue.com/reference/sendtransacemail)が参考になります。cURLでURLをたたくというところがミソですね。

## 環境変数の罠

Cloudflare Workersは環境変数の取り扱いがやっかいで、なかなかハマりました。ドキュメントにはwrangler.tomlファイルに設定することでグローバルで利用可能とありましたが見事に読み込まれません！同じ問題を抱える人は他にもいるようで、コミュニティ内でも[質問](https://community.cloudflare.com/t/how-to-inject-environment-variables-into-webpack/199334/5)があがっていたりしますが、結論、親の関数からenvを渡すことで解決しました。TypeScriptなので型の宣言も必要。

#### src/types.ts

```ts
// ...
export interface Env {
  SENDER_NAME: string;
  SENDER_EMAIL: string;
  SEND_TO_EMAIL: string;
  SEND_TO_NAME: string;
  REPLY_TO_EMAIL: string;
  REPLY_TO_NAME: string;
  SIB_API_KEY: string;
}
```

他にもbindings.d.tsを作れだのなんだのという情報が散らかっていて消耗しました🤢。Cloudflareはせっかく素晴らしいサービスを提供しているのにドキュメントがもったいない気がします。

なお、SIB_API_KEYといった機密情報は平文で保管するわけにもいかないので、以下のコマンドでWorkers内に保管します。（[参考](https://developers.cloudflare.com/workers/wrangler/commands/#secret)）

```
wrangler secret put SIB_API_KEY
```

他の環境変数は先述の通りwrangler.tomlに追加します。

#### wrangler.toml

```toml
...
[vars]
SENDER_NAME = ""
SENDER_EMAIL = ""
SEND_TO_EMAIL = ""
SEND_TO_NAME = ""
REPLY_TO_EMAIL = ""
REPLY_TO_NAME = ""
```

## indexファイルにまとめる

sendMail関数をindex.tsに追加します。

#### src/index.ts

```ts
//...
await sendMail(response, env);
return new Response(JSON.stringify({ message: 'Message successfully sent!' }), {
  status: 200,
  headers: {
    'content-type': 'application/json',
  },
});
// ...
```

エラー処理を追加した方がいいかもしれませんね…😷

## CORSの罠

実はこのままですと動きません。CORSエラーに対処する必要があるためです。詳しくは[こちら](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)。初めからある程度知っていないと理解できない類の文書ですが。要は異なるオリジン、今回の場合は何かしらのブラウザーからのリクエストは明示的に許可しない限り、サーバーは受け付けてくれません。

各ResponseにCORSに関する処理を加えて、CORS preflightにも対応しておきます。

#### src/index.ts

```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'POST') {
      return handlePostRequest(request, env);
    } else if (request.method === 'OPTIONS') {
      return new Response('OK', { headers: corsHeaders });
    } else {
      return new Response('Object not found', {
        status: 404,
        statusText: 'Not Found',
      });
    }
  },
};

// ...
if (!results.valid) {
  return new Response(JSON.stringify(results), {
    status: 400,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
//...
await sendMail(response, env);
return new Response(JSON.stringify({ message: 'Message successfully sent!' }), {
  status: 200,
  headers: {
    'content-type': 'application/json',
    ...corsHeaders,
  },
});
//...
```

# Cloudflare Workersにデプロイ

それでは本番環境にデプロイしましょう。wranglerコマンドを利用すれば簡単にデプロイできます。

```
wrangler login（済んでいなければ）
wrangler publish
```

環境変数も同時に登録されるため、ダッシュボードから入れ直す必要はありません。というかダッシュボードから環境変数を入力するとデプロイのタイミングで消えるためおすすめしません🤡。おとなしくwrangler.tomlかwrangler secretで処理しましょう。

# フロントエンドのお問い合わせからデータを送る

サーバーレス環境でのバックエンドは整ったので適当にフロントエンドを立ち上げましょう。おなじみAstroで作ります。

<div class="custom-block info">
  <div class="custom-block-body">
    <p>そもそもCloudflare PagesのFunctionsを使う手もありますが、今回は何故かAstroのインテグレーションがうまくいかず、おとなしく別にWorkersを立ち上げています。また試してみます。</p>
  </div>
</div>

シンプルにフォームを用意しました。ハマりポイントとしてはこれまた環境変数でして、JavaScriptに直接変数を渡せなかったため、泣く泣く一度HTMLに渡してJavaScriptから再度取得しています。なんか気持ち悪い🤮

#### src/pages/index.astro

```astro
---
import Layout from '../layouts/Layout.astro';
const API_URL = import.meta.env.PUBLIC_API_URL;
---

<Layout title="Welcome to Astro.">
	<main>
		<h1 class="text-gradient">Contact us</h1>
		<form id="contact-form" name="contact" data-url={API_URL}>
			<label>
				Name <input required type="text" name="name" />
			</label>
			<label>
				Email <input required type="email" name="email" />
			</label>
			<label>
				Message <textarea required name="message"></textarea>
			</label>
      <button id="submitButton" type="submit">Submit</button>
			<div class="form-result"></div>
    </form>
	</main>
</Layout>

<script type="module" is:inline>
	const contactForm = document.getElementById('contact-form');
	const submitButton = document.getElementById('submitButton');
	const formResult = document.querySelector('.form-result');

	const apiUrl = contactForm.dataset.url;

	contactForm.addEventListener('submit',async (e) => {
		e.preventDefault();
		submitButton.disabled = true;
		submitButton.innerText = 'Submitting...';
		const formElement = document.forms.contact;
		const data = {
			name: formElement.name.value,
			email: formElement.email.value,
			message: formElement.message.value
		};

		const response = await fetch(apiUrl,{
			method:'POST',
			headers:{
				'Content-Type':'application/json'
			},
			body:JSON.stringify(data)
		})
		const result = await response.json();

		if(response.ok) {
			submitButton.disabled = false;
			submitButton.innerText = 'Submit';
			formResult.innerText = result.message;
			contactForm.reset();
			return;
		}

		if(result.errors) {
			const errorMessages = result.errors
			const messageList = errorMessages.map(msg=>{
				return msg.message
			})
			formResult.innerText = messageList.join('\n');
			submitButton.disabled = false;
			submitButton.innerText = 'Submit';
		} else {
			submitButton.disabled = false;
			submitButton.innerText = 'Submit';
			formResult.innerText = 'Something went wrong...';
		}

	});

</script>

<style>
	:root {
		--astro-gradient: linear-gradient(0deg, #4f39fa, #da62c4);
	}

	* {
    box-sizing: border-box;
	}

	h1 {
		margin: 2rem 0;
	}

	main {
		margin: auto;
		padding: 1em;
		max-width: 700px;
	}

	.text-gradient {
		font-weight: 900;
		background-image: var(--astro-gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 100% 200%;
		background-position-y: 100%;
		border-radius: 0.4rem;
		animation: pulse 4s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			background-position-y: 0%;
		}
		50% {
			background-position-y: 80%;
		}
	}
	form > * + * {
		margin-top: 1rem;
	}
	label{
		display: block;
	}
	input, textarea{
		width: 100%;
		padding: 0.5em;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 1rem;

	}
	textarea{
		min-height: 150px;
	}
	button{
		background-color: #4f39fa;
		color: #fff;
		padding: 0.5em 2em;
		border-radius: 5px;
		cursor: pointer;
	}
	button:hover, button:focus{
		opacity: 0.8;
	}

</style>
```

![お問い合わせフォーム画面](/blogs/blog07/contact.jpeg)

CSSはAstroデフォルトの使いまわして、GitHub Copilotの候補をそのまま採用しました😂

JavaScriptのFetchでWorkersと通信しつつ、formDataではなくオブジェクトのデータをJSON形式にして送信しています。

これで（本格的な）フォームを作成することができました！

ではまた！
