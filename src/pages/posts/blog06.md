---
title: 'AstroにFormspreeでお問い合わせフォームを実装する'
layout: '@layouts/BlogLayout.astro'
date: '2022-08-20'
# lastmod: '2022-08-11'
tags: ['Astro', 'TypeScript', 'React', 'Jamstack', 'SG', 'Formspree', 'email']
excerpt: 'Astroで作成したサイトにお問い合わせフォーム機能をつける'
---

お問い合わせフォームはサイト制作において、いまだ重要な立ち位置を保っています。しかし、実際作ろうとすると、そもそもバックエンドをどう実装するか、スパム対策等々、色々と苦労があるものです。

今回ご紹介する[Formspree](https://formspree.io/)はform要素に固有のIDを付与するだけでメール送信を担ってくれるという素晴らしいサービスです。

<div class="custom-block warn">
  <div class="custom-block-body">
    <p>今回はFormspreeのFreeプランを使用しますが、"For testing and development"とありますので商用利用には向かないと思われます。</p>
  </div>
</div>

Reactにも組み込むことができますが、今回はシンプルにするために、ただのHTML(Astro)にAJAX通信にて実装します。

---

今回のデモサイトは[こちら](https://astro-blog-demo.pages.dev/contact/)です。以前の使いまわしです。レポジトリは[こちら](https://github.com/KYOYA-OGA/astro-blog-demo)。

<div class="custom-block info">
  <div class="custom-block-body">
    <p>デモサイトのフォームはどこにも届きませんのでご注意を。</p>
  </div>
</div>

---

# Formspreeにサインアップする

[こちら](https://formspree.io/register)からサインアップします。登録するとProjectを作成できるようになるため、そちらを作成します。雑。こういった過程を説明するときは動画の方が分かりやすいよなとつくづく思います。

# IntegrationからポストするURLを取得

Integrationタブを選択するとポスト先のURLを取得できます。今回は以下の通り実装しました。実は見本を若干いじっているだけですが...。

#### pages/contact.astro

```astro
---
import Container from "@components/Container";
import FormInput from "@components/FormInput";
import MainLayout from "@layouts/MainLayout.astro";
const PUBLIC_FORMSPREE_URI = import.meta.env.PUBLIC_FORMSPREE_URI
---

<MainLayout>
  <Container className="py-5">
    <div class="grid place-content-center place-items-center">
      <form id="contact-form" action={PUBLIC_FORMSPREE_URI} method="POST" class="py-3 px-5 md:py-5 md:px-8 shadow dark:bg-slate-700 w-80 md:w-96">
        <fieldset class="space-y-5">
          <FormInput name="name" label="お名前" required />
          <FormInput name="email" label="メールアドレス" required />
          <FormInput name="message" label="メールアドレス" placeholder="ご用件をどうぞ..." textarea required className="min-h-[200px]" />
          <div class="text-center">
            <button id="submit-button" type="submit" class="bg-blue-500 text-white py-2 px-5 rounded-lg  transition hover:brightness-110 focus:brightness-110">送信する</button>
          </div>
          <p id="my-form-status" class="text-center"></p>
        </fieldset>
      </form>
    </div>
  </Container>
</MainLayout>

<!-- JavaScriptを読み込ませるためにis:inlineを指定 -->
<script is:inline>
  const form = document.getElementById("contact-form");
  const submitButton = document.getElementById("submit-button");
  const status = document.getElementById("my-form-status");
  async function handleSubmit(event) {
    event.preventDefault();
    submitButton.textContent = "送信中です...";
    const data = new FormData(event.target);
    fetch(event.target.action, {
      method: form.method,
      body: data,
      headers: {
          'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        status.textContent = "お問い合わせありがとうございます。";
        form.reset()
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            status.textContent = data["errors"].map(error => error["message"]).join(", ")
          } else {
            status.textContent = "嗚呼、送信エラーです。"
          }
        })
      }
    }).catch(error => {
      status.textContent = "ごめんなさい。送信エラーです。"
    }).finally(() => {
      submitButton.textContent = "送信する"
    });
  }
  form.addEventListener("submit", handleSubmit)
</script>
```

#### .env

```
PUBLIC_FORMSPREE_URI="https://formspree.io/f/{your_id}"
...
```

送信中の場合はボタンの文言を変更したり、帰ってきたレスポンスを表示したりすることでUXを良くしています（このままだとerror["message"]は英語で返ってきますが…）。何が起きているのか分からないフォームって恐怖ですよね。

FormInputコンポーネントは以下のとおりです。よく使うやつを使い回しているのでdarkクラスがついてたりしますがご容赦ください。書き慣れているReactコンポーネントをこのように使い回せるのが、これまたAstroの優れた点といえます。

#### components/FormInput.tsx

```tsx
interface Props {
  name: string;
  placeholder?: string;
  label: string;
  textarea?: boolean;
  required?: boolean;
  className?: string;
}

export default function FormInput({
  name,
  label,
  placeholder,
  textarea,
  required,
  className,
}: Props) {
  const formStyles = `bg-transparent rounded border-2 dark:border-dark-subtle border-light-subtle w-full text-lg outline-none dark:focus:border-white focus:border-primary p-1 dark:text-white peer ${className}`;
  return (
    <div className="flex flex-col-reverse">
      {textarea ? (
        <textarea
          name={name}
          id={label}
          className={formStyles}
          placeholder={placeholder}
          required={required}
        ></textarea>
      ) : (
        <input
          id={name}
          name={name}
          className={formStyles}
          placeholder={placeholder}
          required={required}
        />
      )}
      <label
        htmlFor={name}
        className="font-semibold dark:text-dark-subtle text-light-subtle dark:peer-focus:text-white peer-focus:text-primary transition-colors self-start"
      >
        {label}
      </label>
    </div>
  );
}
```

フォームが送信されると、Formspreeに登録したメールアドレス宛てにメールが届きます。内容はこんな感じです。

![送信結果メール](/blogs/blog06/result.jpg)

本当に素晴らしいサービスです。ご興味があればぜひお試しあれ！
