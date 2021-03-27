---
layout: post
comments : true
title:  "array의 unshift를 대신할 것"
image: ''
date:   2021-03-26 00:06:31
tags:
- javascripts
description: ''
categories:
- basic
---




<br>
<br>
##Array의 unshift의 문제점은 무엇일까?

[4,3,2,1] 이라는 배열은 만들려고 loop를 돌아보자


```js
const ary = [];
for (let i=1; i<=4; i++) {
    ary.unshift(i);
}
console.log(ary);
```
unshift를 쓰게되면 배열에 원소를 추가할때마다 기존 배열의 index들이 한칸씩 밀리게 되어 엄밀히 따지면 성능이 좋지 않다.

물론 for문의 조건을 변경하여 push로 해결할수도 있다.
for문의 loop는 그대로 놔둔다고 생각해보자

하지만 다른 방법은 없을까??
예전에 자바스크립트를 사용하지 않는 개발자에게 이 질문을 받았었는데 제대로 답변하지 못 했는데 최근 다시 고민해보았다.

1. array 대신 다른 자료구조를 사용한다.예를 들면 연결리스트가 있다.

```js
class LinkedList {
    constructor(value=null, next=null) {
        this.value = value;
        this.next = next;
    }
}
const head = new LinkedList();
let cur = head.next;
for (let i=1; i<5; i++) {
    const newNode = new LinkedList(i);
    if (cur) newNode.next = cur;
    head.next = newNode;
    cur = newNode;
}

console.log(head.next);

let curr = head.next;
while(curr) {
    console.log(curr.value);
    curr = curr.next;
}
```

2. array가 이미 size만큼 공간이 있다고 생각하고 바로 인덱스로 접근한다.
(javascript array는 현재 size를 넘어가는 index에 값이 삽입되면 동적으로 size도 변화한다)

```js
const ary = [];
const size = 4;
for (let i=1; i<=size; i++) {
    ary[size-i] = i;
}
console.log(ary);
```


지금보니 참 간단한 내용이다.
그당시엔 왜 생각이 안났을까 ....

역시 프로그래밍은 끊임없는 생각하고 연습해야한다 ...