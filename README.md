# image-list-tuningーapp

## Setup

Make sure to install the dependencies:

```

# yarn
yarn install

# npm
npm install

# pnpm
pnpm install --shamefully-hoist

```

## データベース起動


```
 docker-compose up db 
 // or
 docker-compose up
```

### バックグラウンドで実行

```
docker-compose up　-d
```

## prismaのallinoneコード

```
yarn prisma:mps   (削除する場合y/nと聞かれますが、基本
yで大丈夫です)
```

## ローカルアプリ起動

```
yarn dev
```

### webpack bundle analyzer

```
yarn analyzer
```

# benchmark実行


```
// yarn dev と docker-compose up -d　等で、ローカル、データベースが立ち上がっていることを確認してください。

yarn bench

```

# Docs

[docs](/docs/)


# Experimental

originAppをローカルで起動させる

## originアプリ起動

yarn build等で、

ローカルにbuildし

docker-compose.ymlの `# origin`から`#     - 3000:3000`までのコメントアウトを解除してください。

以下のコマンドを実行

```
docker-compose up 
```

このようにすることで、

buildした時点のローカルの状態と、現在のローカルの時点で、
差分を検出することができます。

## bench先変更

上記のoriginアプリを起動した後に、

bench.js
```
//  const ORIGIN_APP_HOST = 'image-list-busy-site.herokuapp.com';
const ORIGIN_APP_HOST = 'localhost:8888';

```

としてください。


