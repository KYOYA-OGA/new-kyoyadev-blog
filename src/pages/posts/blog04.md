---
title: '祝v1🎉 AstroとヘッドレスCMSで今どきなブログをつくる'
layout: '@layouts/BlogLayout.astro'
date: '2022-08-10'
lastmod: '2022-08-11'
tags: ['Astro', 'TypeScript', 'Newt', 'React', 'Jamstack', 'SSG', 'SG']
excerpt: '静的サイトジェネレーターの黒船ことAstroでブログをつくってみる'
---

今回は、先日ついに正式リリースされた[Astro](https://astro.build/)を用いてかんたんなブログサイトを構築します。

<!-- <div class="custom-block info">
  <div class="custom-block-body">
    <p></p>
  </div>
</div>

<div class="custom-block warn">
  <div class="custom-block-body">
    <p>ここに情報文を書くここに情報文を書くここに情報文を書くここに情報文を書くここに情報文を書く</p>
  </div>
</div>

<div class="custom-block question">
  <div class="custom-block-body">
    <p>ここに情報文を書くここに情報文を書くここに情報文を書くここに情報文を書くここに情報文を書く</p>
  </div>
</div> -->

Astroについては公式サイトにこう表現されています。([出典](https://docs.astro.build/en/concepts/why-astro/))

> Astro is an all-in-one web framework for building fast, content-focused websites.

websitesという言葉がミソですね。実際に、複雑なweb applicationを作りたいならNext.jsを使えば？と公式も述べています。

そしてさらなる特徴として、基本的にサーバーサイドレンダリングであり、Multi Page App（MPA）であると述べられています。Astroが重要視していることのひとつに**初期表示の高速化**があり、これはクライアントサイドレンダリングあるいはSPAが抱える重大な問題ともいえます。例えば、Create React Appでサイトを作成すると一見爆速なように見えて、実は初期表示が遅いことがあります。特にスマートフォンだとこの現象が顕著。たとえReactフレームワークを用いたとしてもこの問題はついて回ります。Gatsbyでサイトを作ったときに実際感じました。そしてこの遅延の犯人は、SPAを構築するために配信された大量のJavaScriptだったりします。

Astroはフロント側へのJavaScriptの配信を最低限にして初期表示を高速にするように設計されています。というかデフォルトではゼロ。JavaScriptが必要であれば特殊な記法で明示する必要があるわけです。

ここまでの話だけでも、GatsbyあるいはNext.jsといったこれまでのフレームワークとは一線を画していることがわかりますね。

---

詳細に入る前にメリット・デメリットを列挙しておきます。

## メリット🤩

- デフォルトでとにかく表示が高速

- ディレクトリ構造がシンプルでとっつきやすい

- コンポーネント単位で開発が可能

- 様々なUIライブラリが使える。そして混ぜられる。つまりReactとSvelteを同時に使用するということも可能。危険な気がしてなりませんが。

- 🆕TypeScriptをstrictモードにすると型チェックが効いて、ちゃんと叱ってくれる。これはv1になって改善しました。

## デメリット🤮

- 微妙な開発体験。エラーでサーバーが停止することが多く、その度に立ち上げ直す必要がある。これはViteの問題なのでしょうか...。

- 補完が効きづらい。自動インポートも効きづらい。Astroファイルの自動インデントが効かないこと多々。これらは地味にストレスがたまるので、今後の改善に期待！

---

今回作成するブログのサンプルは[こちら](https://astro-blog-demo.pages.dev/)。実はほぼこのブログサイト...。

コードは[こちら](https://github.com/KYOYA-OGA/astro-blog-demo)からご自由にご確認、ご利用ください。

---

# セットアップ(CSS)

CSS にはお馴染みtailwindcssを使用します。今回は[こちら](https://github.com/withastro/astro/tree/latest/examples/with-tailwindcss?on=github)からスターターテーマを利用させてもらいました。

ひとつ注意点として、デフォルトではcssファイルが見当たりません。

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

の基本設定をいじりたい場合は別途設定が必要になります。

## React のセットアップ

Astro は特定のライブラリやフレームワークに依存していないため、ReactだったりSvelteだったりVueだったりを自由に利用することができます。

が、今回は個人的な好みによりReactを採用します。

有名なライブラリであればインテグレーションが用意されているため、セットアップは容易です。

```
npx astro add react
```

もちろん、特にライブラリを用いなくとも.astroで開発可能です。

---

# レイアウトとコンポーネント作成

Astro の構成は非常にシンプルで、componentsディレクトリで各コンポーネントを管理、layoutsディレクトリで再利用可能なレイアウトを管理、pagesディレクトリで各ページを管理するだけです。

ファイルベースルーティングは他のフレームワークでもしばしば採用されていますし、直感的で良きですね。

まずはメインとなるレイアウトを用意します。

#### layouts/MainLayout.astro

```astro
---
import Header from '@components/Header'
import Footer from '@components/Footer'
---

<html>
  <head>
    <meta charset="utf-8">
    <title>タイトルです</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body class="dark:bg-primary bg-slate-200 dark:text-gray-100">
    <!-- メインの要素が足りないときにフッター下部に隙間ができるのを防ぐ -->
    <div class="min-h-screen grid grid-rows-[auto_1fr_auto] grid-cols-[100%]">
      <Header client:load/>
      <main class="flex-1">
        <slot /> <!-- your content is injected here -->
      </main>
      <Footer/>
    </div>
  </body>
</html>
```

slotの箇所に子要素が出力されます。ヘッダーについては次回以降触れます。

---

# Newtからコンテンツ取得

せっかくなのでデータを外部のヘッドレスCMSから引っ張ってきましょう。今回は[Newt](https://www.newt.so/) さんにお世話になります。[microCMS](https://microcms.io/)さんといい、日本語でのヘッドレスCMS環境の選択肢が増えてきたのは大変喜ばしいことです。

Newtの登録や設定方法は省きますが...🙇‍♂️、タイトル・スラッグ・サムネイル・本文を入力・出力できるようにしておきました。

公式の[JavaScript SDK](https://github.com/Newt-Inc/newt-client-js)を用いて、Newtから全投稿を取得する関数を用意します。

#### utils/api.ts

```ts
import { createClient } from 'newt-client-js';
const client = createClient({
  spaceUid: import.meta.env.NEWT_SPACE_UID,
  token: import.meta.env.NEWT_CDN_API_TOKEN,
  apiType: 'cdn',
});

export const getAllPosts = async () => {
  const allPosts = client
    .getContents({
      appUid: import.meta.env.NEWT_APP_UID,
      modelUid: import.meta.env.NEWT_MODEL_UID,
    })
    .then((content) => content)
    .catch((err) => {
      console.log(err);
      return err;
    });
  return allPosts;
};
```

認証情報はenvファイルへ。

#### .env

```
NEWT_SPACE_UID=
NEWT_CDN_API_TOKEN=
NEWT_APP_UID=
NEWT_MODEL_UID=
```

---

# 一覧ページ作成

ではトップページに投稿一覧ページをつくりましょう。

#### pages/index.astro

```astro
---
import { getAllPosts } from 'src/utils/api';
import MainLayout from "@layouts/MainLayout.astro";
import Container from "@components/Container";
import Data from '../utils/data.json';

type Post = typeof Data;

const data = await getAllPosts();
const posts: Post[] = data?.items;

---

<MainLayout>
  <Container className="py-5 md:py-10">
    <!-- ここに投稿を表示 -->
  </Container>
</MainLayout>
```

Astroファイルでは、インポート文や関数等は上部の点線内に記載します。マークダウンっぽい。

投稿を表示させるためのコンポーネントをさくっと作成します。

#### components/PostGrid.tsx

```tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function PostGrid({ children }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-10 md:gap-x-8 lg:gap-10 mb-10 lg:mb-32">
      {children}
    </div>
  );
}
```

#### components/PostCard.astro

```astro

---
// import { Image } from '@astrojs/image/components';
import LinkButton from '@components/LinkButton';

const {id, title, image} = Astro.props;
const imageUrl = image?.src;

---

<article class="shadow-lg flex flex-col h-full rounded-md overflow-hidden dark:bg-slate-700">
  <img src={imageUrl} width={350} alt={title} class="aspect-video object-cover mx-auto">
  <!-- <Image src={imageUrl} width={350} aspectRatio={4/3} alt={title} class="object-cover mx-auto" /> -->
  <div class="px-2 py-3 md:px-5 md:pb-5 space-y-3">
    <h1 class="md:text-2xl">{title}</h1>
    <LinkButton href={`/post/${id}`}>読む</LinkButton>
  </div>
</article>
```

PostCard本体は画像最適化インテグレーションである@astrojs/imageを使用したいため、astroファイルで作成...したのですが、Newtから配信される画像パスとの相性が悪くビルドでこけるため、泣く泣く通常のimgタグを採用しています。これはどうにかしたい...😭

リンクは使いまわせそうなので別途コンポーネントを作成します。

#### components/LinkButton.tsx

```tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  href: string;
  className?: string;
  disabled?: boolean;
}

export default function LinkButton({
  children,
  href,
  className = '',
  disabled = false,
}: Props) {
  return (
    <a
      href={href}
      className={`block text-center bg-blue-500 text-white py-2 px-5 rounded-lg  transition ${
        disabled ? 'brightness-50' : 'hover:brightness-110 focus:brightness-110'
      } ${className}`}
    >
      {children}
    </a>
  );
}
```

ここまで作成したコンポーネントをトップページにぶっこみます。

#### pages/index.astro

```astro
---
import { getAllPosts } from 'src/utils/api';
import LinkButton from '@components/LinkButton';
import PostGrid from "@components/PostGrid";
import MainLayout from "@layouts/MainLayout.astro";
import Container from "@components/Container";
import PostCard from "@components/PostCard.astro";
import Data from '../utils/data.json';

type Post = typeof Data;

const data = await getAllPosts();
const posts: Post[] = data?.items;

---

<MainLayout>
  <Container className="py-5 md:py-10">
    <PostGrid>
      {posts.map(post=>{
        return <PostCard image={post.thumbnail} id={post._id} title={post.title} />
      })}
    </PostGrid>
    <LinkButton href="/posts/1" className="w-11/12 mx-auto max-w-sm">記事をもっと探す</LinkButton>
  </Container>
</MainLayout>
```

投稿一覧を表示できました！

![投稿一覧ページ](/blogs/blog04/blog-list.jpeg)

---

次回以降、詳細ページを作成したり、ダークモードを実装したりします。

唐突ですが、ではまた！
