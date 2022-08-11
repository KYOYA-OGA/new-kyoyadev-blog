---
title: 'Next.js + Headless WordPressでJamstackなサイトをつくる'
layout: '@layouts/BlogLayout.astro'
date: '2022-01-08'
lastmod: '2022-03-02'
tags:
  [
    'Next.js',
    'React',
    'tailwindcss',
    'WordPress',
    'Headless WordPress',
    'Jamstack',
  ]
excerpt: 'Next.jsをWordPressと連携させて静的サイトをつくっていく試み第一弾です。'
---

今回は Headless CMSとしてWordPressを用いる方法を解説します。

通常、WordPressは画面表示まで担当するフルスタックなシステムですが、
純粋にバックエンドとしてのみ働いてもらうことも可能です。

理由は様々ありますが、
端的にいって React等モダンなフロントエンド技術を用いた方が表示のパフォーマンスが良いです。特にメンテナンスされていない WordPress製のサイトは、開いた瞬間に「嗚呼、WordPressなんだろうな…」とわかることがしばしばです。

そしてなんといっても開発が楽しい、これに尽きます 😎

---

# 手順

1. WordPress にWPGraphQLをインストール
2. Next.jsとWordPressを連携してデータを取得
3. Next.js上ですべての投稿データを表示させる
4. 詳細（個別）ページを作成（次回以降…）
5. ブログのカテゴリーを作成（次回以降…）

# 使用する技術

- Next.js
- TailwindCSS
- WPGraphQL
- GraphQL
- WordPress（ローカル環境としてLOCALを使用）

## WordPressにWPGraphQLをインストール

### WordPressにデータを入稿

余談とはなりますが、私は昨今のWordPressのブロックエディターへの移行には面白みを感じていない派です。欲しいのはデザインのツールではなくて、データの入稿ツールなんですよね…。クラシックエディターあるいはカスタムフィールドはデータ入稿ツールとしてかなりの優れものだと思うのですが。

ちなみに、公式の声明によると以下の通り。

> Classic Editor は公式な WordPress プラグインであり、少なくとも 2022 年まで、または必要なくなるまでの間、完全にサポート・保守されます。

引用元：[Classic Editor](https://ja.wordpress.org/plugins/classic-editor/)

元々 2021 年末でサポートを切るという話だったはずなので、本当に使えなくなる日は相当先なのではないかと思ったりします。Headless需要に応えて、クラシックエディターが残っていくとありがたいですね。

閑話休題。

### WPGraphQLプラグインをインストール

まず WordPress に WPGraphQL プラグイン をインストールします。

![WPGraphQLプラグインを検索](/blogs/blog01/wpgraphql_img.jpeg)

WordPress はデフォルトで RESTAPI を提供していますが、取得するデータをコントロールできたほうが効率が良いため、GraphQL を用います。このあたりは好みが分かれるかもしれませんね。

ちなみに、このプラグインの作者である Jason Bahl さんは発信活動も熱心で、jamstack 関連の動画でよくお目にかかります。開発者として憧れますね。

### 取得するデータを実際にクエリしてみる

プラグインに内蔵されている GUI で取得するデータを確認できます。

今回は、投稿の id とタイトル、スラッグおよびコンテンツを取得しています。

![WPGraphiQLですべての投稿をクエリ](/blogs/blog01/wpgraphql_query.jpeg)

GraphQL はこの直感性が最高ですね 😇

クエリ項目は昔と比べてかなりすっきりしているのですが、それでも若干慣れが必要かもしれません。
今回はすべての投稿を取得しようとしているため、posts をクエリしています。

---

## Next.js と WordPress を接続してデータを取得する

### Next.js のセットアップ

スタイルには TailwindCSS を使用します。
一旦、TailwindCSS に慣れてしまうと従来のクラス記法が面倒で仕方がなくなります…。
CSS ってデフォルトで Tailwind で良くないですか？（過激派）

[tailwindcss 公式ドキュメント](https://tailwindcss.com/docs/guides/nextjs)

適当に仕上げていったんこんな感じになりました。

#### pages/index.js

```js
export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen">
      <h1 className="text-3xl font-bold underline">
        Next.js with Headless WordPress
      </h1>
    </main>
  );
}
```

![初期設定トップページ](/blogs/blog01/home01.jpeg)

### Apollo Client を追加

GraphQL でのデータ取得には Apollo Client を使用します。

```
npm install @apollo/client graphql
```

[Apollo ドキュメント](https://www.apollographql.com/docs/react/get-started)

どのファイルからも参照しやすいよう lib フォルダを作成し以下のファイルを置きます。

#### lib/apollo.js

```js
import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  uri: `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`,
  cache: new InMemoryCache(),
});
```

なお、WordPress については LOCAL(By Flywheel)で構築しているため URL を隠しても仕方ないのですが、念のため。

ルートに env.local ファイルを作成し保管。

#### .env.local

```
NEXT_PUBLIC_WORDPRESS_URL='あなたのWordPressサイトのURL'
```

今回は Next.js の getStaticProps を使用するため、必須ではないのですが、
ApolloPrivider でアプリ全体を囲っておきます。
（useQuery 等、Apollo が提供している React フックを使用できるようになります。）

#### pages/\_app.js

```js
import { ApolloProvider } from '@apollo/client';
import { client } from '../lib/apollo';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp;
```

### getStaticProps でデータを取得

静的なサイトを作成したいため、 みんな大好き getStaticProps を使用します。

特に複雑なことはせず、apollo 先生のルールにしたがって GraphQL をクエリするのみです。

#### pages/index.js

```js
import { gql } from '@apollo/client';
import { client } from '../lib/apollo';

export const getStaticProps = async () => {
  const GET_POSTS = gql`
    query AllPostsQuery {
      posts {
        nodes {
          id
          slug
          title
        }
      }
    }
  `;

  const response = await client.query({
    query: GET_POSTS,
  });

  const posts = response?.data?.posts?.nodes;

  return {
    props: {
      posts,
    },
  };
};
```

これで WordPress からのデータを取得できたので、
この値をページの props に渡します。

#### pages/index.js

```js

import Link from 'next/link';

...略

export default function Home({ posts }) {
  return (
    <main className="flex items-center justify-center h-screen">
      <div>
        <h1 className="text-3xl font-bold underline">
          Next.js with Headless WordPress
        </h1>
        <div className="mt-5 space-y-2">
          {posts.map((post) => {
            const { id, slug, title } = post;
            return (
              <Link key={id} href={`/posts/${slug}`}>
                <a className="block">{title}</a>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

```

無事 WordPress の投稿データを取得できました。

![初期設定トップページ](/blogs/blog01/home02.jpeg)

これでやっとスタート地点に立てました！

WordPress のみで開発するなら投稿をループするだけなので、異様に複雑性を増しているだけといえばそうなのですが、Jamstack での開発は一回慣れてしまうと元に戻れない中毒性がありますね。

技術の進化とはそういうものです 😇

Github レポジトリは[こちら](https://github.com/KYOYA-OGA/next-with-wp-practice)。

次回以降、個別ページやカテゴリーの作成、プレビューモードの実装などを行う予定です。
