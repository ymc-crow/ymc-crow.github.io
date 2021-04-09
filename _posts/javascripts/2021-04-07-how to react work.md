---
layout: post
comments : true
title:  "how to react work"
image: ''
date:   2021-04-07 00:06:31
tags:
- javascripts
description: ''
categories:
- basic
---


다음 글은 회사 동료가 다른 회사동료의 글에대해 강의를 듣고 정리한 내용임

원글은 https://goidle.github.io/ 링크를 참고하세요

# 고선생의 리액트 특강

## 리액트 패키지를 알아보자
### react
- 모델링
- $$type 에 따라 모델링하는 형태가 다르다
- 예를 들면 createElement 함수 제공
### 리컨실러
- VDOM을 조작한다
- 리액트 엘리먼트에서 Fiber 뽑아낸다
### 스케쥴러
- 브라우저 전문 핸들러
- 브라우저의 Idle Time에 작업 할수 있도록 브라우저 API 이용
- 우선순위 에 따라서 work (리컨실러가 VDOM 조작하는 단위) 를 16ms안에 동작 하도록 한다 16ms안에 동작이 안될거같으면 리컨실러와 제어권 주고 받으면서 계속 작업 완성해 나간다

## Fiber 아키텍쳐를 알아보자
### Fiber
- Fiber에는 부모형제 관계, 변경 상태 정보, 이펙트 태그 정보 등이 들어있다
- 업데이트가 필요한 이벤트 태그가 있는 Fiber들은 미리 render phase때 이벤트 노드 list에 들어가고 commit phase에서 이 Fiber가 나오면서 쓰이게 된다
### 예전 버전 - 콜스택 이용
- VDOM 업데이트시 콜스택의 재귀호출로 진행
- 한번 시작하면 중간에 유저 이벤트가 들어와도 멈출 수 가 없었음
### 지금 버전 - Fiber Architecture 이용
- 연결리스트로 Fiber 이어서 자식 -> 자식 -> 자식 자식없으면 형제 이런식으로 이어나가다가 유저 이벤트나 16ms 조건 만나면 제어권 반환 후에 다시 작업
- WorkInProcess라는 작업용 트리 따로 만들어서 작업하기 때문에 다시 작업 가능
    - 가장 위의 루트 노드부터 작업이 필요한 노드까지 길을 그리면서 내려온다

## jsx 가 실행 되는 것의 의미
- createElement가 계속 실행되고 자식 createElement도 실행되면서 props로 계속 전달이 된다
- setState 실행되면 dispatchAction 실행되면서 setState 실행한 컴포넌트 재호출
- 리액트 컴포넌트 재호출 조건
    - props가 그대로인지 확인
    - expirationTime에 의해서 우선순위에 들어 왔는지 확인
    - setState 호출 했지만 값 안 바뀌였는지 확인
- 부모가 실행되면 자식도 return 자식() 이니까 별다른 설정 안하면 props가 변경되고 위 재호출 조건 만족해서 무조건 실행된다
    - React.memo를 쓰게되면 얕은 비교를 해서 props 그대로면 재호출 안되도록 설정
        - useCallback 같은 것도 비슷한 원리
    - 함수를 밖으로 빼서 이미 호출된 렌더 값으로 받으면 재호출 안한다

## 리컨실러는 어떻게 Fiber를 다룰까
### 처음
- Fiber Tree 만들고 current에 저장한다
### 그후에 업데이트 상황에서 리컨실러의 재조정
- setState를 하게되면 dispatchAction 실행되고 해당 Fiber에 expirationTime 정보 새겨진다
- root 부터 내려오면서 expirationTime 정보 활용해서 업데이트 시작할 Fiber를 찾는다
- 루트부터 해당 Fiber 까지 연결리스트로 연결이되고 WIP의 시작이 된다
    - 새로 만들 필요가 없는 Fiber 는 Current에서 WIP로 바로 복사되고 Current와 alternate라는 참조 관계 형성해서 존재하게 된다 -> `Bailout`
- 해당 컴포넌트 `Call` 하고 reconcileChildren으로 그 아래 Tree `재조정 Reconcile` 작업 돌입
    - 주의 할 점은 자식 컴포넌트들은 별도의 설정없으면 props가 변경 됐기 때문에 일단 다 호출 된다는 것이다.
    - 호출을 해야 재조정 과정에서 비교해서 Fiber 재사용 판단 가능
- 재조정 과정에서 엘리먼트 $$type 과 key로 Fiber를 새로 만들어야 되는지 구별한다
    - key와 type이 같으면 Fiber 새로 안만들고 props만 변경 한다
    - jsx에서 map 사용시 key를 꼭 넣어줘야되는 이유가 바로 이 때문이다
    - key를 안넣어주면 null 이 들어가서 type만 똑같으면 똑같은줄 알고 map안의 jsx들에 변화가 있어도 Fiber 재생성을 안하고 props만 변경하게 된다
    - 예를 들면 동일한 type의 jsx A - B - C 순서대로 그리고 있다가 A가 빠지고 B - C 만 그려야 되는 상황에서도 type 은 똑같기 때문에 업데이트가 됐는지 몰라서 A는 그대로 있고 props만 B의 props가 들어와서 A 컴포넌트에 B props 가 들어오는 따로 노는 경우가 생긴다

## useEffect와 useLayout Effect
- DOM 변경과 화면 렌더링 사이 또는 렌더링 이후 개발자가 개입할 수 있도록 해줍니다.
- useLayoutEffect()와 useEffect()이 실행 되면 각각 소비시점이 다른 LayoutEffect와 Effect 생성하고 스케줄러에 등록 한다
### Effect Hook의  사이클
- 커밋 단계 돌입 -> 스냅샷 찍기 & clean-up-useEffect & useEffect 실행 -> (effectTag 참고해가면서 DOM 변형 시작) -> clean-up-useLayoutEffect & clean-up-useEffect -> (DOM 변형 완료) -> useLayoutEffect 실행 -> LayoutEffect 소비 -> 브라우저 화면 페인트 -> useEffect의 Effect 소비
- clean-up은 이펙트 등록 훅 실행 전이나 DOM이 사라지기 전에 일어 나기 때문에 DOM 변형 중에도 일어난다
### 주의 사항
- useLayoutEffect는 element가 DOM에 마운트된 상황이므로 참조하여 위치나 크기를 얻어올 수 있지만 아직까지는 call stack를 비워주지 않았으므로 브라우저는 렌더링 작업을 진행하지 못한 상태
    - 너무 큰 작업이면 동기적으로 실행되기 때문에 렌더링을 오랜시간 막을 수도 있다
    - useEffect의 Effect 는 페인팅 까지 끝난 상태에 실행된다
- useEffect 의 dependency에 값 변경될때 스케줄러에게 useEffect 소비함수 실행 요청하는게 아니다
  - setState 같은 트리거로 다시 스케줄링이 일어나고 업데이트 주기가 중에 useEffect dependency list에 등록된 값 변경 된거 확인되면 소비함수 실행 요청이 일어나는 것이다

## 많은게 담겨있는 그림
![](https://goidle.github.io/static/8add8101dc88320afdd3537f1f4d6b98/c94d1/reconcile_children.png)

