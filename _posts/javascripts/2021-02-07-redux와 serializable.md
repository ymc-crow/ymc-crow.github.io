---
layout: post
comments : true
title:  "redux와 serializable"
image: ''
date:   2021-02-07 00:00:00
tags:
- javascripts
description: ''
categories:
- basic
---


<br>
react-redux를 쓰다가 recoil을 쓰니 recoil에서는 function,promise이나 domElement타입이 저장된다.
하지만 redux에서는 non-serializable type(앞에서 말한 타입 등)은 저장못한다. <br>

라고 알고있었지만.. 테스트 해보니 실제로는 저장된다. 다만 redux-devtools에서 표시를 안하는것이었다.

그래서 한번 분석해보았다.

일단 스택오버플로를 찾아보았다.

[Why redux store should be serializable?](https://stackoverflow.com/questions/40941079/why-redux-store-should-be-serializable)

기술적으로는 가능하나 store의 일관성 유지, 복원 기능, 시간여행 디버깅 등이 방해받을수 있기에 non-serialzable타입은 저장 안하는것이 좋단다..
글만 봐서는 와닫지 않는다.

직렬화 부터 알아보자

<h2>직렬화란(serialize)?</h2>

javascript에서 사용하는 데이터 타입은 주로 object이다. 하지만 이 자바스크립트 오브젝트가 다른 언어나 다른환경에서도 똑같이 사용될수 있을까? 간단한 예로는 localstorage가 있다. localstorage는 값으로 string을 가질수 있지만 object는 가질수 없다. 이럴때 우리는 json.stringify를 통해서 object를 스트링화 한다. 이것이 직렬화다. 그리고 다시 꺼내쓸때는 스트링은 json.parse하여 오브젝트로 다시 변환한다 이것이 역직렬화다.이때 직렬화 전 object와 역직렬화된 object는 같아야 한다.

위와같이 보통 자바스크립트에서 직렬화를 이용하는 방법은 JSON객체의 stringify와 parse를 사용하는 것이다.

<h2>코드 검색</h2>
serial, stringify 키워드로 검색해 보았다.

redux: 코드에서 검색결과 없음
react-redux: connectAdvanced.js에서 유효한 엘리멘트 타입이 아닐때 에러출럭용으로 사용
redux-devtool: serialize, stringify로 둘다 검색됨

결국 실제 직렬화 하는 부분은 redux-devtool에서만 발견되었다.

[react dev tools search serialize](https://github.com/reduxjs/redux-devtools/search?q=serialize)


<h2>결론</h2>

위 스택오버플로 링크에서도 봤듯이 데이터 일관성을 잘 유지할수있고 react-devtools 혹은 다른 redux 미들웨어들을 사용할때 오류를 감당할 자신이 있으면 non-serializable 타입의 데이터를 저장해도 된다.

그럼 결국 데이터 변화감지를 위해 비교를 수행하는데 함수나 프로미스 등은 오류를 발생시킬수있을까?? react-redux의 shallow eqaul함수를 보면 참조로 값을 비교하기 때문에 다른 참조값을 저장하면 update될것이다.

보너스로 shallow equal 함수를 분석해보자

[shallow Equal](https://github.com/reduxjs/react-redux/blob/e9094e7800e7b464d1221d26714454291f8a9730/src/utils/shallowEqual.js)

```js
function is(x, y) {
  if (x === y) {
    // +0, -0 을 비교하는경우 +0 === -0 true기 때문에 Infinity로 비교
    return x !== 0 || y !== 0 || 1 / x === 1 / y
    // return x !== 0 || 1 / x === 1 / y;로만 해도 충분해보인다
  } else {
    // x와 y가 둘다 NaN인 경우만 true 
    return x !== x && y !== y
  }
}

export default function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    // 윗단계에서 거르지 못하고 object 아니거나 null이면 false
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  // key들의 길이 비교
  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    if (
      // 객체의 프로토타입은 체크 안하기 위해 hasOwnProperty를 사용하고 각 객채의 hasOwnProperty는 변경 가능하므로 object 프로토타입의 hasOwnProperty를 사용한다. 그리고 각 객체의 1뎁스까지만 체크한다.
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false
    }
  }

  return true
}
```

