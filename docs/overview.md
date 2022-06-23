# 画像投稿アプリ

minimumだが、ある程度のボトルネックが入るような題材

## データベース論理設計

    Post {
        id: String,
        title: String,
        createdAt: timestamp,
        updatedAt: timestamp,
        images: []Image
    }

    Image {
      postId Int
      id     Int
      image  String
    }

## フロントエンドファイル構成


    pages/
      [id].vue  　特定のpostのimageを全て表示する
      index.vue   postを一覧表示し、画像数と、idが1のImageを表示する
    mixin/
      DisplayImages.vue  [id].vue,index.vueは機能要件として似ているところがあるため、まとめるためmixin
    components/
      ImageCard.vue  imageを表示させるためのカードコンポーネント
      PageHeader.vue  headerを表示させるためのコンポーネント
    utils/
      elementUtil.ts  element要素を触る関係で用意した関数
      userGuard.ts  typescriptの型絞り込みを行うための関数
    assets/
      main.css  cssを別途記述

    public/images/*  表示に使う画像

    app.vue  nuxt3におけるpageのroot(index.htmlみたいなもの)

## バックエンドファイル構成

    server/api/post/index.ts   'api/post'で全てのpostを取得するためのもの
    server/api/post/index.ts    'api/post/image?postId=?'で特定のpostIdの全てのimageを取得するためのもの

## prisma

    prisma/schema.prisma   論理設計したものを、prismaに適応させるためのモデル
    prisma/script.ts  prismaClientを使いまわせるようにしたファイル
    prisma/json/post.json　今回扱う仮データ
    prisma/seed.ts  仮データをprismaに注入するためのスクリプト

## other

    createSeeds/    seedを作成したときに作りました。今回データベースはoriginアプリと今回チューニングするアプリは同じものを扱いますのでより数の多いデータや少ないデータを試したい場合お使いください。

    origin/    今回チューニングするアプリの初期状態。このアプリ内の文章では"originアプリ"と呼んでいます。

    bench.js  ベンチマーク用のjs。 `yarn bench`や　`node bench.js`で実行可能
