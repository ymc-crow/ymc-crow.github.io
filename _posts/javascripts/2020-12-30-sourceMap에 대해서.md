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

mappings의 ,를 구분자로 하나의 segment라고 부른다. 세그먼트는 4개의 숫자들로 이루어져있다(5개 혹은 6개인 경우도 있는것 같다. 5,6번째는 이 예제에서는 사용되지 않는다.)

1. 컴파일된 source에서의 Column 값(row값은 ";"로 구분된다, ;를 만날때마다 컴파일된 소스의 row값이 하나씩 증가하는것이다.)
2. 오리지날 소스의 인덱스(sources 배열)
3. 오리지날 소스의 row값
4. 오리지날 소스의 Column 
(5.Name index, 6.Omitting fields 이 예제에서는 없음)

중요한것은 이 segement의 값들이 이전 segment를 기준으로 하는 상대적인 값이다. 즉 이전 세크멘트의 같은 자리 숫자에 계속적으로 플러스되는것이다.(zero-based) 따라서 그대로 사용해도 되는 세그먼트는 첫 세그먼트 뿐이다.

그렇다면 그냥 숫자로 표현될것이 왜 AAAA,IAAM 같은 형태가 되었나?
VLQ와 base64 인코딩이 사용되었기 때문이다. base64 VLQs가 사용되는 이유는 segment의 길이를 줄이기 위해서다.

vlq:[vlq](https://en.wikipedia.org/wiki/Variable-length_quantity)<br>
base64 사용이유 : [base64](https://devuna.tistory.com/41)<br>
자세한 설명 : [detail](https://pvdz.ee/weblog/281)<br>

!중요! : 얼핏보면 알파벳 하나가 숫자 하나에 대응한다고 생각할수 있는데 아니다. base64인코딩표에서 g이상의 숫자들은 contiunation bit를 가지므로 뒤의 문자를 계속적으로 체크하고 g이하의 숫자가 나올때가 비로소 하나의 숫자가 완성된다.

그외 참고자료 : [good data]
(https://www.lucidchart.com/techblog/2019/08/22/decode-encoding-base64-vlqs-source-maps/)<br>

소스맵을 직접 해석해본 사람(이해하는데 아주 좋음)
https://github.com/Rich-Harris/vlq/blob/master/sourcemaps/README.md<br>





