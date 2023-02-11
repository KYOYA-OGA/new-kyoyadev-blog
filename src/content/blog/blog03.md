---
title: 'ずっと無料のままNode.jsをデプロイする🤤'
layout: '@layouts/BlogLayout.astro'
date: '2022-07-14'
lastmod: '2022-11-01'
tags: ['Node.js', 'React', 'MERN', 'MongoDB', 'VPS']
excerpt: 'Oracle Cloudの無料枠にNode.jsサーバーを立ち上げて無料で運用する技を紹介。'
---

Node.jsが動く本番環境が欲しいけど費用が惜しい…

Herokuの無量プラン廃止がいただけない…

そんなケチで貧乏なあなたに朗報です。

Oracle Cloudの寛大な無料枠で VPS を利用させてもらい、Node.jsをデプロイする方法をご紹介します。しかもCloudPanelというコントロールパネルを使用するため設定も比較的かんたんです。

<div class="custom-block info">
  <div class="custom-block-body">
    <p>情報は 2022年11月時点のものです。Oracleの情け深いサービスがいつまで続くかは誰にも分かりません。</p>
  </div>
</div>

<div class="custom-block warn">
  <div class="custom-block-body">
    <p>別途ドメインの取得は必要になります。なので実のところ完全に無料ではありません🙇‍♂️</p>
  </div>
</div>

---

# ざっくりとした手順

1. Oracle Cloudのアカウント取得

2. Ubuntuサーバーを起動

3. SSHでサーバーに接続して、CloudPanelをインストール

4. CloudPanel上でNode.jsをインストール

5. ドメインを設定する

6. Node.jsプロジェクトをGithubからクローン

---

# 詳細

## Oracle Cloudのアカウント取得

### そもそもOracle Cloud Free Tierとは？

その名の通り Oracle Cloudの一部のサービスをずっと無料で利用できるというものです。AWSのように一年間無料というわけではなく、ずっとです。すごい。新規登録者向けの30日間Free Trialもありますが、それとは別のサービスです。

[こちら](https://www.oracle.com/jp/a/otn/docs/oracle-always-free-application-development.pdf)の中の方のスライドに詳しいです。

まずは[公式サイト](https://www.oracle.com/cloud/)からサインアップします。

運用自体は無料で可能ですがクレジットカードの登録が必要になります。公式によるとデビットカードも使えるとのことですが、自分の場合は弾かれました。あるあるですね。

## Ubuntu サーバーを起動

いくつかサーバーの種類を選べますが、今回はCloudPanelというサービスを利用する関係上、Ubuntuを選択します。

![サーバーを選択する画面](/blogs/blog03/oc01.jpg)

プロセッサーには無料で使える Ampere を選択します。いったんCPUとメモリの構成は最小にしておきます。あまり上げすぎると警告が出ます。

![プロセッサーを選択する画面](/blogs/blog03/oc02.jpg)

あとでSSHで接続するために公開鍵を登録しておきます。Macの場合はssh-keygenで秘密鍵と公開鍵を生成しておきましょう。

（追記）↑とか言いながら、後日やったら鍵の生成方法をすっかり忘れていました。参考サイトは[こちら](https://webkaru.net/linux/mac-ssh-login-public-key/)。

![公開鍵入力画面](/blogs/blog03/oc03.jpg)

## SSH でサーバーに接続して、CloudPanel をインストール

無事サーバーが立ち上がったらSSHで接続しましょう。以下はMacの場合です。

```
ssh -i 秘密鍵までのパス ubuntu@パブリックIPアドレス
例) ssh -i ~/.ssh/id_highly_confidential_key  ubuntu@122.73.85.199
```

接続できたら一通りアップデートをかけてCloudPanelをインストールします。

基本的にはCloupPanelの[ドキュメント](https://www.cloudpanel.io/docs/v2/getting-started/other/)に沿うだけですが、一行でまとめて打つとエラーになるため、別々に実行します。

```
sudo apt update
sudo apt -y upgrade
sudo apt -y install curl wget
```

どのデータベースを選択するかでインストールコマンドが若干変わりますが、ここではMySQLを選択します。

```
curl -sSL https://installer.cloudpanel.io/ce/v2/install.sh | sudo bash
```

---

### CloudPanel ってなんだ？

公式サイトは[こちら](https://www.cloudpanel.io/)。サーバーを操作するためのコントロールパネルを無償で提供してくれるサービスです。よく見かけるcPanelとかと同じようなものかと。軽量で使用感もいい感じです。ファーストビューが [Vercel](https://vercel.com/) に似すぎているような気が…😂

---

## CloudPanel 上で Node.js をインストール

インストールが終わったら案内通り、ポート8443にアクセスします。

※正常に表示されない場合はサーバーを再起動してみてください。

「この接続ではプライバシーが保護されません」というオレオレ証明書に由来する警告が表示されますが、いったん無視して進めます。これは専用のドメインを取得しセットアップすることで解決します。

![CloudPanelサインアップ画面](/blogs/blog03/oc05.jpg)

ユーザー名やメールアドレス、パスワードを入力してサインアップします。
続いてサインイン画面が表示されるので作成したアカウントの認証情報を入力。
ログインできたらおそろしくシンプルなホーム画面が表示されるので右上のADD SITEをクリック。

![Node.js選択画面](/blogs/blog03/oc06.jpg)

どの種類のサイトを作りたいかと聞かれるのでNode.jsを選択します。実はWordPressも選択できます。無料でWordPressサイトを運用したい場合に便利ですね。

## ドメインを設定する

次にドメインの取得と設定しましょう。具体的にはDNSの設定になります。

ここでは適当なドメインをムームードメインで取得して設定します。設定画面はプロバイダーによってまちまちかと思いますが、やることはほぼ一緒かと。DNSの設定画面で作成したサーバーのIPアドレスを当てておきます。

![ムームードメインDNS設定画面](/blogs/blog03/oc08.jpg)

※IP アドレスは実際のものではありません。失敗したときのやつです🤪

cloud.~といったドメインを作成しておくと、そのURLでCloudPanelにアクセスできるようになります。SSL
証明書の取得の過程で必要になるため設定しておくことを推奨します。

<div class="custom-block info">
  <div class="custom-block-body">
    <p>ちなみにcloud.~というURLでアクセスするためには、後でCloudPanelの Admin Area→Settings→CloudPanel Custom Domainの項目を設定しておく必要があります。お忘れなく。加えて、DNSが浸透していないとエラーが出ます。気長に待ちましょう。</p>
  </div>
</div>

---

次に、Node.jsインストール画面上で、取得したドメインを入力します。このドメインにリダイレクトされるよう設定されてしまうため、実在するドメインを入れましょう（当たり前）。

ユーザー名とパスワードでSSH接続が可能になりますが、のちほど公開鍵認証に切り替えることもできます。

![Node.jsインストール画面](/blogs/blog03/oc07.jpg)

## Node.js プロジェクトをGithubからクローン

インストールが終わったら、SSHでログインします。

```
ssh -i ~/.ssh/秘密鍵までのパス  ユーザー名@パブリックIPアドレス
```

ちゃんとNode.js等がインストールされているか確認してみます。ついでgitも確認。こんな感じになるはずです。（2022年7月時点）

```
your-account-name:~/htdocs/$ node -v
v16.16.0
your-account-name:~/htdocs/$ npm -v
8.11.0
your-account-name:~/htdocs/$ git --version
git version 2.34.1
```

上記の設定通りであれば、htdocsの配下に、登録したドメイン名と同じ名前のフォルダがあるはずなので、そちらまで移動して Git から必要なレポジトリをクローンします。もし試すものがなければ、至極シンプルな Node.js アプリを作成してあるので[こちら](https://github.com/KYOYA-OGA/node-js-oracle-test)をお使いください。ポートが8888に固定してあるため、CloudPanel上での設定をお忘れなく。

```
git clone https://github.com/KYOYA-OGA/node-js-oracle-test
```

.envファイルが必要な場合は別途作成あるいは編集します。

```
nano .env
```

nodeコマンドでアプリを起動することもできますが、手動でオンオフするのはあまりにイケていないため、PM2という本番用プロセスマネージャーを使用します。

```
npm install -g pm2
※アドミン権限が必要な場合はsudoを文頭に付与
pm2 start server.js or your entry file
```

取得したドメインのURLにアクセスして、ファイルが表示されれば成功です。

DNSが浸透するまでやや時間がかかる場合もあります。DNSの確認は[こちらのサイト](https://dnschecker.org/)が便利です。
