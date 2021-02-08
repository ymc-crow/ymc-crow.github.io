---
layout: post
comments : true
title:  "sentry용량 초과..facebook도 실수를!?"
image: ''
date:   2021-01-07 00:00:00
tags:
- trouble
description: ''
categories:
- basic
---


<br>
회사에서 에러 로깅 용 툴로 sentry를 사용하고 있다.
그런데 2020년 12월 말경에 순식간에 용량이 꽉차버리고 말았다.

용량을 채운 대부분의 에러는 아래 스크린샷과 같다.

![센트리 캡처화면](/assets/img/2021-01-07-sentry.png){: width="600" height="400"}

window.postMessage의 두번째 인자가 없다고 나온 에러다. 두번째 인자는 필수인자다.
그리고 이 소스는 페이스북 픽셀코드에서 비동기로 가져다 쓰는 소스다.

https://connect.facebook.net/en_US/fbevents.js
페이스북 소스에 fbq.version이 현제와 다르다 센트리 로그보니 연말에는 2.9.31이었고 

https://connect.facebook.net/signals/config/1506050232762893?v=2.9.31&r=stable

2.9.31 컨피그 소스에서 window.postMessage의 필수인자중 2번째 인자가 빠져있다.

https://connect.facebook.net/signals/config/1506050232762893?v=2.9.32&r=stable

2.9.32 버젼에서는 다시 2번째 인자가 들어감을 확인!!

**결국 facebook 소스 문제다!!**

해결법은??

1번 : 티몬도메인의 소스만 센트리로그의 화이트리스트로 관리 
-> 다른 jdk에서 나오는 치명적에러를 발견 못할수도 있다.<br>
2번 : 페이스북 jdk 소스를 블랙리스트로 관리
-> 해당 소스는 마케팅을 위한 소스이고 기능과 상관없으므로 괜찮아보임.<br>

1,2 방법의 공통된 문제점은 한번 리스트로 등록해놓으면 영원히 에러를 모를수도 있다는 것<br>

3번 : 다른 방법으로는 블랙리스트로 등록된 소스들의 로그데이터 용량을 수십회정도로 제한하는것.<br>

하지만 2번 밑에 적은 이유로 2번이 가장 적합하다고 판단하고 다른 외부 jdk에서도 에러가 나올경우 3번 적용가능성도 생각해볼수 있다.





