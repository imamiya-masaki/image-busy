# image-busy( for tuning app )

## Setup

Make sure to install the dependencies:

```

# yarn
yarn install

# npm
npm install

```

next:

```

# yarn
yarn build

# npm
npm run build

```

next: 

[originApp](https://image-list-bussy-site.herokuapp.com/)
herokuでのデプロイですので、一度こちらにアクセスしといてください。

※[dyno のスリープ](https://devcenter.heroku.com/ja/articles/free-dyno-hours#dyno-sleeping)

next: 

```
touch .env
echo DATABASE_URL=\"postgresql://postgres:password@localhost:5432/postgres?schema=public\" >> .env

```

## データベース起動

[mac docker install](https://docs.docker.com/desktop/mac/install/)
[windows docker install](https://docs.docker.com/desktop/windows/install/)
```
 docker-compose up db 
 // or
 docker-compose up
```

### バックグラウンドで実行

```
docker-compose up -d
```

## prismaの初期立ち上げallinoneコード

```
yarn prisma:start
```


## prisma seed再読み込み

```
yarn prisma:seed
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
const ORIGIN_APP_HOST = 'localhost:3000';

```

としてください。

# License (public/images/*)


Simplified Pixabay License

https://pixabay.com/ja/service/license/


author: images
Lin Tong: bear-7195751.jpg animal-7154059.jpg fox-7206538.jpg temple-7228340.jpg rain-7230604.jpg

Quang NGUYEN DANG: sea-5382487.jpg bird-6564285.jpg

Alexas_Fotos: bird-7233900.jpg

suju-foto: river-7242735.jpg ducklings-7242762.jpg key-5105878.jpg rabbit-4038246.jpg katz-2821316.jpg owl-3649048.jpg

Sascha Zyballa: otter-7228458.jpg

jhenning: bird-6781956.jpg

Pexels: animal-1846462.jpg code.1839406.jpg audience-1866738.jpg archive-1850170.jpg arm-1284248.jpg

