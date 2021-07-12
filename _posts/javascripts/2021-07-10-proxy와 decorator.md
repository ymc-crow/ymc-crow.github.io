---
layout: post
comments : true
title:  "proxy와 decorator"
image: ''
date:   2021-03-28 00:06:31
tags:
- javascripts
description: ''
categories:
- basic
---

<br>
proxy와 decorator를 사용하면 어떠한 함수를 실행할때 그 함수는 변경하지 않고 그 함수의 앞이나 뒤로 어떠한 추가행동이 가능하다.

```js
class test {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    dist(other) {
        return Math.sqrt(
            (other.x-this.x)**2 + (other.y-this.y)**2);
    }
    me() {
        return this;
    }
}
```

만약 위 test 클래스르 생성된 객체의 모든 함수가 실행될때마다 argument를 console.log로 print 하고 싶다면 어떻게 해야할까?

# proxy

일단 proxy를 사용해보자

```js
function traceMethodCalls(obj) {
  const objRef = obj;
  const handler = {
      get(target, propKey, receiver) {
          // const targetValue = Reflect.get(target, propKey, receiver);
          if (typeof objRef[propKey] === 'function') {
              return function (...args) {
                  console.log('CALL', propKey, args);
                  return objRef[propKey].apply(this, args); // (A)
              }
          } else {
              return objRef[pWropKey];
          }
      }
  };
  return new Proxy(obj, handler);    
}

function addOneArg(obj) {
  const handler = {
      get(target, propKey, receiver) {
          const targetValue = Reflect.get(target, propKey, receiver);
          if (typeof targetValue === 'function') {
              return function (...args) {
                const origin = args[0];
                const mutated = {
                  x: ++origin.x,
                  y: ++origin.y,
                };
                  console.log('addOneArg', propKey, args);
                  return targetValue.apply(this, [mutated]); // (A)
              }
          } else {
              return targetValue;
          }
      }
  };
  return new Proxy(obj, handler);    
}

const pt = addOneArg(traceMethodCalls(new Test(3, 2)));
// console.log(pt.dist({x:-4, y: -5}))
// console.log(pt);
// console.log(pt.me().dist(new Test(5, 4)));
console.log(pt.dist(new Test(5, 4)));

```

target은 new Test로 만든 객체인데 콘솔로 get 안의 target을 찍어보면 클래스 메쏘드들은 안나온다. 객체의 getOwnProperty로 열거 가능한 property들만 들어있는 origin_target이 target이다.(https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver)

따라서 메쏘드프로퍼티에 접근하려면 위처럼 get함수 바깥 상위 스코프에 objRef로 참조를 가져오거나 reciver를 이용해야한다.

receiver – 타깃 프로퍼티가 getter라면 receiver는 getter가 호출될 때 this. 대개는 proxy 객체 자신이 this. 프락시 객체를 상속받은 객체가 있다면 해당 객체가 this가 되기도 함.
receiver는 프로토타입 체이닝 속에서, 최초로 작업 요청을 받은 객체가 무엇인지 알 수 있게 해준다.
(https://ui.toast.com/weekly-pick/ko_20210413)

참고자료 : [Tracing method calls via Proxies](https://2ality.com/2017/11/proxy-method-calls.html)

참고자료에서는 Reflect의 get을 활용했다. 위 주석부분을 풀고 objRef[propKey] 대신 targetValue를 사용하면 된다. 그러면 상위스코프를 활용안하고도 get함수내에서 클래스 메소드 접근과 this처리가 가능하다. 단순 참조방법을 이용하면 객체의 상속관계에서 사이드이펙트가 생길수 있으므로 참고자료처럼 코드를 짜는게 좋아보인다.

프록시는 클래스 입장에서는 미리 변경이 안되고 자기를 통해 생성된 객체가 프록시를 통해 wrapping되야한다.
wrapping하지 않고 클래스 단에서 변경이 가능하진 않을까?

타입스크립트의 decorator를 사용하면 가능하다.

# decorator

```js
function log(target: Function) {
    for (const propertyName of Object.keys(target.prototype)) {
        const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
        const isMethod = descriptor.value instanceof Function;
        if (!isMethod)
            continue;

        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            console.log("The method args are: " + JSON.stringify(args));
            const result = originalMethod.apply(this, args);
            console.log("The return value is: " + result);
            return result;
        };

        Object.defineProperty(target.prototype, propertyName, descriptor);        
    }
}

@log
class TESt {...}
```

참고자료 : [JS TS apply decorator to all methods / enumerate class methods](https://stackoverflow.com/questions/47621364/js-ts-apply-decorator-to-all-methods-enumerate-class-methods)


