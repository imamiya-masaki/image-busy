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
```

## originアプリ起動

```
docker-compose up origin
```

## データベースとoriginアプリ起動

```
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
// yarn dev と docker-compose up -d　等で、ローカル、originアプリ、データベースが立ち上がっていることを確認してください。

yarn bench

```

# Docs

[docs](/docs/)
