---
layout: post
comments : true
title:  "set을 활용하여 중복값없는 stack과 queue 만들기"
image: ''
date:   2021-03-28 00:06:31
tags:
- javascripts
description: ''
categories:
- basic
---

<br>
Set은 동일한 값(객체일 경우 동일한 참조)은 하나만 갖고있다.이를 이용하여 중복값은 허용안하는 stack과 queue를 만들어보자.
중복값 체크를 위해 객체({})를 이용하는 경우도 있지만 이는 저장하는 값이 숫자나 문자열일때만 가능하다. 왜냐면 객체를 키로서 활용할수 없기때문이다. 객체를 문자열로 변환한다고 하더라도 이 문자열이 동일한 참조인지는 알수없다.

이전 글과도 상관이 있기에 한번 읽어보시길 권합니다..

이 글을 읽어보면 배열을 활용안하는 이유도 나와있습니다.

[이전 글](https://ymc-crow.github.io/basic/array%EC%9D%98-unshift-%EB%8C%80%EC%8B%A0%ED%95%A0%EA%B2%83/)

##Queue

큐 먼저 구현하는 이유는 Set 하나만으로도 거의 구현이 끝나기 때문이다. 관심있게 봐야할 부분은 Set에서 첫번째 값을 뽑아내는 부분이다. set은 인덱스가 없기 때문에 값의 순서에 따라 접근하기 위해 이터레이터를 활용했다. 다행히도 Set은 이터러블이라 [Symbol.iterator]()를 활용하여 deque를 구현했다.

이를통해 모든 작업을 O(1)의 시간복잡도를 가지도록 했다.
```js
class uniqQueue {
  constructor() {
    this.storage = new Set();
    this.size = 0;
  }
  enque(val) {
    if (this.storage.has(val)) return;
    this.storage.add(val);
    this.size++;
  }
  deque() {
    if (!this.size) return;
    this.size--;
    const iter = this.storage[Symbol.iterator]();
    const result = iter.next().value;
    this.storage.delete(result);
    return result;
  }
}

const test = new uniqQueue();
test.enque(1);
test.enque(3);
test.enque(4);
test.enque(2);
test.enque(5);

console.log(test.deque());
console.log(test.deque());
console.log(test);

// 객체는 참조로 동작한다.
let a1 = { a: 1 };
let a2 = { a: 2 };
const test2 = new uniqQueue();
test2.enque(a1);
test2.enque(a1);
test2.enque(a2);
test2.enque({ a: 3 });
test2.enque({ a: 4 });
test2.enque({ a: 4 });
console.log(test2);

console.log(test2.deque());
console.log(test2.deque());
console.log(test2.deque());
console.log(test2);
```


##Stack

중복값에 대한 체크는 Set에게 위임했지만 Set의 마지막 값을 가져오는 것이문제이다. 이터레이터를 활용하면 O(n)만큼 이터레이션 해야한다. queue에서는 한번만 next하면 되지만 stack에서는 끝까지 이터레이션 해야한다. 그래서 push 순서를 기억하기위해 배열을 활용했다. 보통 [...set]과 같이 set을 array화 하고 마지막값을 얻지만 이는 iteration을 완료하는것과 마찬가지로 O(n)의 시간복잡도를 가진다.

따라서 매 push마다 값의 인덱스를 가지고 있기 위한 배열이 필요하다.

```js
class uniqStack {
  constructor() {
    this.set = new Set();
    this.storage = [];
  }
  push(val) {
    if (this.set.has(val)) return;
    // 유니크 값을 위해
    this.set.add(val);
    // 입력된 순서를 기억하기 위해
    this.storage.push(val);
  }
  pop() {
    if (!this.size) return;
    const top = this.storage.pop();
    this.set.delete(top);
    return top;
  }
  get size() {
    return this.storage.length;
  }
}

const test3 = new uniqStack();
test3.push(1);
test3.push(1);
test3.push(3);
test3.push(4);
test3.push(2);
test3.push(5);

console.log(test3);
console.log(test3.pop());
console.log(test3.pop());
console.log(test3);

const test4 = new uniqStack();
test4.push(a1);
test4.push(a1);
test4.push(a1);
test4.push(a2);
test4.push({ a: 3 });
test4.push({ a: 3 });
test4.push({ a: 4 });
test4.push({ a: 4 });

console.log(test4);
console.log(test4.pop());
console.log(test4.pop());
console.log(test4);
```