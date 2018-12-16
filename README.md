# Serverless AWS를 이용해 FaaS로 구현한 카카오 테스트 결제 모듈
![figure1: FaaS 개략적인 이미지](#)

FaaS는 Function as a Service... 마이크로서비스... FaaS 소개

## AWS Serverless
![figure2: AWS serverless 이미지](#)

FaaS를 제공하는 대표적인 서비스인 AWS Lambda와 AWS API Gateway를 이용해 구현할 것이다.

> Lambda 간단소개

> API Gateway 간단소개

이들을 통합적으로 관리할 수 있도록 한 것이 바로 _Serverless Framework_

## Serverless Famework
![figure3: Serverless FW 이미지](#)

Serverless 소개

ServerlessFW를 사용함으로써 아주 쉽고 간편하게 AWS Serverless architecture를 구현할 수 있다.

### Installation
https://hackernoon.com/a-crash-course-on-serverless-with-node-js-632b37d58b44#37bc

### Quick start
__"Hello!"__ 를 반환하는 서비스를 만들어보도록 하겠다.

#### 1. Serverless Configuration
이를 위해 먼저 Serverless의 환경을 설정해줘야 한다.

> `serverless.yml` 소개 및 설명

#### 2. Development
이제 개발을 시작해보자

```js
// 코드 및 설명
```

#### 3. Deploying to AWS
마지막으로 AWS에 업로드 하는 일만 남았다.

```sh
$ serverless deploy -v # 설명
```

이 명령 하나만으로 AWS에 업로드된다.

#### 4. Test
서비스가 잘 작동하는지 테스트

## Kakao-payment
![figure4: 카카오페이 이미지](#)

카카오페이와 API 간략소개

... 이러한 기술적인 배려?로 다음과 같이 아주 간단히 결제 요청을 할 수 있다.

```sh
# curl ...
```

request 간략한설명

요청으로 돌아오는 반환은 다음과 같다.

```json
// { ... }
```

json 간략한설명

한 번 사용된 링크는 재사용할 수 없기 때문에, 필요시마다 가져와야 했다.

## Development of Kakao-payment using Serverless
nodejs를 이용해 결제요청을 보낸 뒤, 링크를 받아와 결제 페이지로 리다이렉트 시키는 서비스를 serverless AWS를 이용한 FaaS로 구현해보도록 하겠다.

### Configuration

### Development

### Test

---

# 참고
* [AWS Korea: AWS Lambda와 API Gateway를 통한 Serverless Architecture 특집](https://www.slideshare.net/awskorea/serverless-architecture-lambda-api-gateway)
* [A creash course on Sserverless with Node.js](https://hackernoon.com/a-crash-course-on-serverless-with-node-js-632b37d58b44)
