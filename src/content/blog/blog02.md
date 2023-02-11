---
title: 'Next.js + Headless WordPressでJamstackなサイトをつくる(詳細ページ編)'
layout: '@layouts/BlogLayout.astro'
date: '2022-04-19'
# lastmod: '2022-03-02'
tags:
  [
    'Next.js',
    'React',
    'TailwindCSS',
    'WordPress',
    'Headless WordPress',
    'Jamstack',
  ]
excerpt: 'Next.jsをWordPressと連携させて詳細ページを作成'
---

前回は Headless WordPressから投稿データ一覧を取得しました。

今回は個別の投稿データを取得しましょう。

# 手順

1.Next.js上で動的なデータを取得する

2.slugを元に取得したいページを特定

## Next.js上で動的なデータを取得する

### ダイナミックルートのファイルを作成

Next.jsではpagesディレクトリ上に作成したファイル名を元にページが作成されます。
投稿データのようにデータ取得時に名前が決定するような動的なデータの場合は、[**].jsという記法を用います。

今回はスラッグを元に各詳細ページを作成したいので、

```
pages/blogs/[slug].js
```

というファイルを作成します。

---

※ちょっと余談ですが、日本語でスラッグを記載すると文字エンコードの関係上、ぐちゃぐちゃと長い文字列になってしまいます。WordPressはデフォルトではタイトルの文字列がスラッグにコピーされる仕様になっており色々と面倒なため、WordPress 側の設定でスラッグに日本語が使えないようにしています。こちらの[サイト様](https://techmemo.biz/wordpress/auto-slug-post-id/)が大変参考になりました。ありがとうございます。

こういった管理画面側の設定変更のしやすさもヘッドレス CMS として WordPress をあえて選択する理由になるかもしれませんね。

---

### GraphQL で slug に基づいてデータを取得する

とりあえず詳細データを取得しましょう。まずはgetStaticPropsの登場です。

#### pages/index.js

```js
export const getStaticProps = async ({ params }) => {
  // 変数を渡す
  const GET_POST = gql`
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        title
        content
      }
    }
  `;
  // paramsから変数を取得
  const response = await client.query({
    query: GET_POST,
    variables: {
      slug: params.slug,
    },
  });

  const post = response?.data?.post;

  return {
    props: {
      post,
    },
  };
};
```

GraphQLのクエリに変数を渡す必要があるのですが、その変数は URL から取得してきます。
今回はスラッグをもとに詳細ページを作成しているため、params.slugとしています。

### 何に基づいてデータを取得するのかNext.jsに教えてあげる(getStaticPaths)

ただし、詳細ページの場合、getStaticProps だけですとビルドに失敗します 😭

各詳細ページを静的サイトとして予めビルドしておくためには、何に基づいて個別のデータを取得するのかを Next.js に教えてあげる必要があるためです。
ファイル名を[slug].jsとしているため、スラッグに基づくことまでは分かるのですが、
そのスラッグ自体がいったいデータのどの部分と紐付いているのかを明らかにする必要があるわけです。（もっと良い説明がありそうだ…。）

そこで登場するのがgetStaticPathsになります。

#### pages/index.js

```js

import { gql } from '@apollo/client';
import { client } from '../../lib/apollo';

export const getStaticPaths = async () => {
  // ビルドするページのスラッグ一覧を取得
  const GET_POST_SLUGS = gql`
    query GetSlugs {
      posts {
        nodes {
          slug
        }
      }
    }
  `;
  const response = await client.query({
    query: GET_POST_SLUGS,
  });

  // 取得した各投稿のslugにもとづいてpathsオブジェクトを生成する
  const paths = response.data.posts.nodes.map((post) => ({
    params: { slug: post.slug },
  }));
  return { paths, fallback: false };
};

export const getStaticProps = async ({ params }) => {
  ...略

```

これで各詳細ページのデータを取得できたので、
ページテンプレートのpropsに渡してあげます。

#### pages/index.js

```js

...略

const PostPage = ({ post }) => {
  const { title, content } = post;
  return (
    <main className="px-3 mx-auto max-w-3xl lg:max-w-4xl grid place-content-center h-screen">
      <h1 className="text-xl text-blue-700">{title}</h1>
      <div className="mt-3" dangerouslySetInnerHTML={{ __html: content }}></div>
    </main>
  );
};

export default PostPage;

```

無事表示されました！

なお、WordPress のcontentデータはHTMLデータのため、dangerouslySetInnerHTML を用いる必要があります。名前が怖い。

![詳細ページ](/blogs/blog02/blog02-img01.jpeg)

ということで詳細ページまで作成できました。

気が向いたら（！）ページネーションを作成する予定です。

ではまた 😇
