# 2022年12月29日現在の、キャンセルボタンの全て

『[Esc キーで「無」ボタンをトリガー](https://github.com/jurliyuuri/cerke_online_alpha/issues/366)』にも書いてある通り、

> 「ボタンが出ているときだけ、ボタンの onclick にセットされてるハンドラを呼び出せるようにする」を正しく実装する方法が分からない（アドホックに実装する方法はわかるけど）

まあ、現状の実装において一切の救いはないので、とりあえずアドホックに実装してコード負債をまた成長させる羽目になる。

よって、とりあえずキャンセルボタンが登場する全てのシーンをかき集め、それらの破壊時に漏らさず Esc でトリガーされるイベントハンドラを壊さねばならない。

`drawCancelButton` を検索すると、こんな感じである。

```
D:\cetkaik\cerke_online\src\draw_erase_animate.ts
  178,17: export function drawCancelButton(fn: () => void) {

D:\cetkaik\cerke_online\src\main.ts
  55,3:   drawCancelButton,
  138,3:   drawCancelButton(() => {
  338,3:   drawCancelButton(() => {
  374,3:   drawCancelButton(() => cancelMaybeStepping({ draw_the_field: true }));
  400,3:   drawCancelButton(cancelStepping);
```

（へー、VSCode って検索結果をコピペできるのね）

全て main.ts で呼ばれており、4 回呼ばれているのか。

`drawCancelButton` は `contains_phantom` 要素へと `appendChild` されているので、`contains_phantom` 要素が上書きされてキャンセルボタンが破壊されたときにイベントハンドラも消えなくてはいけない。

なるほど、`erasePhantomAndOptionallyCancelButton` 関数を呼び出すと `contains_phantom` 要素の子要素が全て消える。じゃあここで Esc イベントの解除もしてやればよさそうだな。

ということで、`erasePhantomAndOptionallyCancelButtonWhileAlsoRemovingEscEvent` という名前へと改名し、Esc に結び付けたイベントを消すようにし、

逆に `drawCancelButton` は `drawCancelButtonAndAddEscEvent` へと改名してイベントを登録。よし、ステージング環境で試そう

上手く行った。これは production にマージしにいくか。
