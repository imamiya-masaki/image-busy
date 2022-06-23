const fs = require('fs');
const dummyjson = require('dummy-json');
const myMockData = {
  firstNames:  ['一郎', '二郎', '三郎', '四郎', '五郎', '六郎', '七郎'],
  lastNames: ['佐藤', '鈴木', '高橋', '田中', '伊藤'],
  title: ['たくさんの画像', '楽しい雰囲気', 'リラックスするために！', '', 'here',],
  type: ['task', 'bug', 'request', 'other', 'question'],
  content: ['先日の件を踏まえて、\\n今回は整える', 'データベース選定、\\nprisma(postgre)、firebase、mongodbが候補。\\n\\n現状色々鑑みた結果prismaかなぁ...', '少し詰まってきたので設計を練り直す\\n', 'それも十月向後そうした奔走通りにおいてのの中にいうんませ。さきほど前をお話し顔はよほど同じ記憶なかっないなどから落ちつけていでをも評ほかならですんて、だんだんには引張っですなけれなです。幸にぶつかっで事はいよいよ場合といくらでもななた。いくら岡田さんに認定向うこう享有が変っでし後その霧みんなか講義にという大意見たたですうてこの場合は私か他がたに作っが張さんの事で自分の私を無論ご招待とあると私個人に実満足をやりようにもう肝内談から経るませんが、同じくとうてい公言を用いれないと行くな訳になるんで。'],
  userId: ["1","2","3","4","5"],
  status: ["todo", "in_progress", "done"]
};
// 動的にmyMockDataに追記
const dirPath = '../public/images';
const allDirents = fs.readdirSync(dirPath, { withFileTypes: false });
const fileNames = allDirents.map(( name ) => name.slice(0, name.length - 4));
myMockData.image = fileNames
// mockdataが素直に使えなかったので、動的にrandomで対処

/*

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

*/
const taslTemplete = `[
  {{#repeat 5000}}
  {
  "id": {{ add @index 1}},
  "title": "{{lorem min=1 max= 2}}",
  "images": [
   {{#repeat min=1 max=100 }}
   "{{random ${myMockData.image.map(a => '\'' + a + '\'').join(' ')}}}"
   {{/repeat}}
  ],
  "create_at": "{{date '2020-06-01' '2021-06-01'}}",
  "update_at": "{{date '2021-06-01' '2022-06-01'}}"
}
{{/repeat}}
]`
const test = '{{animal}} {{firstName}}';
console.log('templaete', taslTemplete);
const result = dummyjson.parse(taslTemplete, { mockdata: myMockData});

// 書き込み
const writeRootFile = './json'
fs.writeFileSync(`${writeRootFile}/post.json`, result);
/*

[
 {{#repeat min=10 max=100}}
 {
    "id": {{ add @index 1}},
    "type": "{{random 'task' 'bug' 'request', 'other', 'question'}}",
    "title": {{title}},
    "content": 
 }
]
*/