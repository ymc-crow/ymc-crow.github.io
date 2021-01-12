---
layout: post
comments : true
title:  "sourceMap에 대해서"
image: ''
date:   2020-12-30 00:00:00
tags:
- javascripts
description: ''
categories:
- basic
---


<br>
압축된 js파일을 chrome DevTools에서 볼때 sourceMap 파일이 있으면 원본파일로 디버깅이 가능하다.<br>

소스맵 : [sourceMap and ChromeDev tool](https://developers.google.com/web/tools/chrome-devtools/javascript/source-maps?hl=ko)

소스맵의 생성방법과 작동원리를 알아보자<br>

원본소스 test.es6.js<br>
```js
const square = (x) => x * x;
```

변경된소스 test.js<br>
```js
"use strict";

var square = function square(x) {
  return x * x;
};

//# sourceMappingURL=test.js.map
```

test.js.map<br>
```js
{
    "version": 3,
    "sources": ["test.es6.js"],
    "names": [],
    "mappings": ";;AAAA,IAAM,MAAM,GAAG,SAAT,MAAM,CAAI,CAAC;SAAK,CAAC,GAAG,CAAC;CAAA,CAAC",
    "file": "test.js",
    "sourcesContent": ["const square = (x) => x * x;"]
}
```
웹팩에서 소스맵 옵션을 주고 빌드하면 대게 위와같이 변경된소스와 map파일이 생성된다.<br>

map파일을 살펴보자
version : sourcemap 버젼
sources : 변경되기전 원본 파일 이름들
names : 소스파일에서 사용되는 변수 및 함수 이름들
file : 변경된 파일 결과물
sourcesContent : 소스내 컨텐츠

실제로 원본소스와 연결되는 부분은 mappings이다. 그러면 이 mappings는 어떻게 생성될까?






