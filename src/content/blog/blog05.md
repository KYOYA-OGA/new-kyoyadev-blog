---
title: 'Astroサイトにダークモードを実装する'
slug: 'dark-mode-with-astro'
layout: '@layouts/BlogLayout.astro'
date: '2022-08-17'
lastmod: '2022-11-01'
tags: ['Astro', 'TypeScript', 'React', 'Jamstack', 'SG']
excerpt: 'Astroで作成したサイトにダークモード機能をつける'
---

もはやダークモードはデファクトスタンダードだと勝手に信じておりまして、自分のサイトでも採用すべきだということで実装してみましたのでその方法を共有します。

[Astro](https://astro.build/)製サイトでダークモードの採用を検討している方のお役に立てれば幸いです。

---

今回のレポというか本サイトのレポジトリは[こちら](https://github.com/KYOYA-OGA/new-kyoyadev-blog)です。煮たり焼いたりご自由にご利用ください。

---

# CSSの設定

[tailwindcss](https://tailwindcss.com/)を使用していればダークモードのスタイルの設定は容易です。そうでなければCSS変数を使用するのがベターかと思われますが、もはやtailwindを使わない理由は存在しないと考えているため(！)、tailwindを前提に話を進めます。

今回はダークモードとライトモードの切り替えボタンを設置するため、class記法を用います。

#### tailwind.config.js

```js
module.exports = {
  darkMode: 'class',
  // ...
};
```

このように設定することで、CSSを書く際にdark接頭辞をつけるだけでダークモード時のスタイルを設定することができます。tailwind最高🥳

---

# ダークモード切り替えボタンをヘッダーに設置

ヘッダーにダークモード切り替えボタンを設置します。適当に絵文字を採用しました。stateをどう管理するかは悩ましいポイントなのですが、結局localStorageかprefers-color-schemeを利用するだけなのでコンポーネント内のローカルstateにしています。

#### components/ThemeToggleButton.tsx

```tsx
import { useEffect, useState } from 'react';
import type { Theme } from 'src/types';

export default function ThemeToggleButton() {
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  if (
    (typeof localStorage.getItem('theme') === 'string' &&
      localStorage.getItem('theme') === 'dark') ||
    // 初期表示時にmatchMediaに合わせる
    (typeof window.localStorage.getItem('theme') !== 'string' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    return 'dark';
  } else {
    return 'light';
  }

  useEffect(() => {
    const currentTheme = getCurrentTheme();
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex-shrink-0 leading-tight text-xl md:text-2xl bg-gray-400 p-2 lg:py-2 lg:px-3 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      {theme === 'light' ? '🌙' : '🌞'}
    </button>
  );
}
```

#### types/index.ts

```ts
export type Theme = 'light' | 'dark';
// ...
```

ボタンをトグルすると以下のような動きをするようにしています。

- ルート要素(html要素)にdarkクラスを与えたり外したりする
- localStorageにテーマ情報を保管する

また、useEffectを用いてこのコンポーネントがレンダリングされたタイミングで、localStorageからテーマ情報を取得するようにしています。

---

# 共通ページレイアウトにてダークモードを読み込む

上記の設定だけですと、そもそもページ間で状態が保持されないのと、ページがレンダリングされる度にちらつきが発生してしまいます。💩ですね。できればページがレンダリングされる前、もしくは同じタイミングでダークモードクラスを付与しておきたいところです。

ということで共通するページテンプレートにあらかじめダークモードを読み込むスクリプトを書いておきます。

#### layouts/MainLayout.astro

```astro
<!-- ... --><!DOCTYPE html>
<html lang="ja">
  <head>
    <!-- ... -->
  </head>
  <body class="dark:bg-primary bg-soft-white dark:text-soft-white">
    <!-- ... -->
    <Header client:load />
    <!-- ... -->
    <script is:inline>
      // localStorageにデータがあるときはそちらを適用
      if (typeof window.localStorage.getItem('theme') === 'string') {
        const currentTheme = window.localStorage.getItem('theme');
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
      // localStorageになにもない時はmatchMediaで判定
      if (
        typeof window.localStorage.getItem('theme') !== 'string' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        document.documentElement.classList.add('dark');
      }
    </script>
  </body>
</html><!-- ... -->
```

繰り返しになりますが、localStorageにテーマ情報があるときはそちらを適用して、localStorageに情報がない場合にwindow.matchMediaでユーザーの好みを引っ張ってきます。

基本的にはlocalStorageの情報を優先するようにしています。いくらダークモードが好みとはいえ、サイト上でライトモードに切り替えてもページがリロードされる度にダークモードに戻されるのはイケてないですので（たまに遭遇しますね...）。

なお、HeaderコンポーネントはJavaScriptを必要としますので、Astroによって取り除かれないようにclient:loadディレクティブをお忘れなく。

# 気づいている問題点

- ページレイアウトが複数ある場合に同じコードを繰り返し書くことになる。共通の関数にして読み込ませるとうまくいかなかった...。

ではまた！
