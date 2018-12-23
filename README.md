# Serverless AWS를 이용해 FaaS로 구현한 카카오 테스트 결제 모듈
![what-is-function-as-a-service-serverless-architectures](https://stackify.com/wp-content/uploads/2017/05/what-is-function-as-a-service-serverless-architectures-are-here-11196.png)

Function as a Service의 약자인 FaaS는... 간단히 설명하자면 직접 서버를 구현해야 했거나(IaaS, Infrastructure as a Service), 적어도 애플리케이션을 직접 구현해야 했던(PaaS, Platform as a Service) 기존의 방식에서 탈피해 __정말 필요한 기능에 대해서만__ 개발할 수 있도록 하는 클라우드 컴퓨팅 서비스의 종류이다. 이 덕분에 적은 비용으로 빠르게 최신 애플리케이션을 빌드할 수 있게 된다.

개발자는 클라우드에 어떠한 함수를 업로드하고, 필요 시 또는 특정 이벤트가 발생했을 때만 해당 함수를 실행하며, 함수가 실행된 횟수만큼 비용을 내는 방식이다.

이는 '서버리스 아키텍쳐'라고도 하는데, 서버가 없다는 의미가 아니라... 서버리스 아키텍처 서비스를 제공하는 기업에서 알아서 프로비저닝하거나 유지보수를 해 주기 때문에, 서버에 대해 더 이상 신경 쓸 필요가 없다는 의미로 받아들이면 된다.

이러한 FaaS는 대다수의 공룡 기업들(MS, AWS, Google...)에서 제공하며, 우리는 이들 중 AWS의 Lambda를 이용해 Serverless architecture로 구현해보도록 하겠다.

## AWS Serverless
![AWS serverless for microservices](./assets/imgs/AWS-serverless-for-microservices.png)

대표적인 FaaS 서비스인 AWS Lambda를 이용해 구현할 것이다. AWS Lambda에 함수를 업로드하고, 이를 호출하는 방식이다.

우리는 RESTfule API를 통해 AWS Lambda의 함수를 호출할 계획인데, 이는 AWS API Gateway를 통해 구현할 수 있다.

### AWS Lambda
![AWS Lambda](https://d1.awsstatic.com/Digital%20Marketing/House/PAC/2up/PAC-Q4_House-Ads_Lambda_2up.62dc7e19b7b2e0a2c06821594c31f1ce00a6bdda.png)

어떠한 이벤트에 대해 코드를 실행하고, 그 값을 응답으로 반환하거나 컴퓨팅 리소스를 관리하는 [AWS serverless computing](https://aws.amazon.com/ko/serverless/) 서비스이다.

간단히 말하자면 Lambda에 어떠한 함수를 작성(또는 업로드)한 뒤, API Gateway와 같은 서비스를 이용해 이벤트에 연결한다. 이후 이벤트가 트리깅되는 즉시 해당 함수를 실행하는 것.

주의할 것은 Lambda가 어떠한 상태를 저장하는 것은 아니기 때문에, 정보를 저장하기 위해서는 AWS DynamoDB와 같은 타 서비스를 Lambda에 연결해 사용해야 한다. 이렇게 Lambda는 AWS의 다른 서비스들과도 연결할 수 있다. 다만 이는 글의 주제와 맞지 않기 때문에, 더 알고 싶다면 [AWS Lambda 개발자 안내서](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/use-cases.html)를 참고하도록 한다.

### AWS API Gateway
![AWS API Gateway architecture](./assets/imgs/AWS-API-Gateway.jpg)

개발자가 API를 생성, 게시, 유지관리, 모니터링 등을 할 수 있는 AWS 서비스이다. API Gateway를 통해 Lambda 뿐 아니라 위의 그림에서와 같이 DDB(DynamoDB), EC2, S3 등의 여타 AWS 서비스들에 대해 액세스할 수 있는 endpoints를 생성할 수 있다.

다음과 같은 HTTP 요청만으로도 Lambda를 실행할 수 있다는 말.

```sh
$ curl -X GET https://my-api-gateway-endpoint.com/

# 요청에 대한 응답으로 Lambda에서 실행된 함수의 값을 반환받을 수 있다.
```

좋다. 거의 완벽하고 좋다. 중요한 것은 이러한 서비스들을 어떻게 사용할 수 있냐는 말이다.

여기서 _Serverless Framework_ 가 나온다.

## Serverless Famework
![Serverless FW 이미지](https://camo.githubusercontent.com/16068dbb37e2d7fdae1127de35a336c5f254a5e7/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6173736574732e6769746875622e7365727665726c6573732f726561646d652d7365727665726c6573732d6672616d65776f726b2e6a7067)

Serverless는 위와 같은 서버리스 아키텍쳐를 배포하고 운영하기 위한 [프레임워크](https://en.wikipedia.org/wiki/Software_framework)이다.

Serverless를 사용함으로써 아주 쉽고 간편하게 AWS Serverless architecture를 구현할 수 있다. 먼저 설치부터 시작해 하나하나 진행해보도록 하자.

### Quick start
Serverless를 설치하는 것 부터 시작해, __"Hello!"__ 를 반환하는 서비스를 만들어보도록 하겠다.

#### 0. npm 설치
Serverless는 JS로 작성된 Node.js 런타임 환경에서 제공되는 프레임워크이기 때문에, NPM(Node Package Manager)을 통해 설치해야 한다. 만약 npm이 설치되어 있지 않다면 [이 링크](https://www.npmjs.com/get-npm)를 통해 설치를 먼저 진행하도록 하자.

설치를 마쳤으면 다음의 명령이 정상적으로 실행될 것이다.

```sh
$ node -v
# v8.10.0

$ npm -v
# 6.1.0
```

물론 버전은 달라질 수 있다. 중요한 것은 저 명령이 실행되냐는 것.

npm 설치를 마쳤다면, 다음 순서대로 serverless를 설치해보도록 하자.

#### 1. Serverless 설치
다음의 명령으로 serverless를 설치할 수 있다.

```sh
$ npm install -g serverless
```

이 명령은 global하게 serverless를 설치한다는 것을 의미한다. 이 명령을 통해 다음과 같이 커맨드 창에서 해당 모듈로 접근할 수 있게 된다. (참고: [SO - what does the “-g” flag do in the command “npm install -g <something>”?](https://stackoverflow.com/a/13167605))

```sh
$ serverless create --template aws-nodejs --path my-service

# 좀 아래에서 보겠지만, serverless 프로젝트를 만드는 명령이다.
# 아직 입력은 하지 말도록 하자.
```

아무튼 설치를 마쳤다면 이제 AWS의 권한을 얻어야 할 차례이다.

#### 2. AWS IAM 만들기
먼저 AWS 콘솔에 로그인한다. AWS 계정이 없는 경우 그냥 생성하고 똑같이 진행하면 된다.

![IAM: search IAM](./assets/imgs/IAM-search-IAM.jpg)

콘솔 창의 왼쪽 상단 '서비스(Services)' 탭을 클릭 후, 다음과 같이 'IAM' 을 검색해 IAM 페이지로 들어가도록 하자.

![IAM: Add user](./assets/imgs/IAM-Add-user.jpg)

IAM 페이지에 들어갔으면, 왼쪽 사용자 탭을 클릭한 뒤 '사용자 추가(Add User)' 버튼을 누른다.

![IAM: Add user 1](./assets/imgs/IAM-Add-user-1.jpg)

다음으로 사용자 이름을 입력한 뒤, '프로그래밍 방식 액세스(Programmatic access)'에 체크한 뒤 다음 버튼을 누른다.

![IAM: Add user 2](./assets/imgs/IAM-Add-user-2.jpg)

다음 '기존 정책 직접 연결(Attach existing policies directly)' 버튼을 클릭한 뒤, 나오는 목록에서 'AdministratorAccess'를 체크한다. 이후 다음 버튼을 누른다.

![IAM: Add user 3](./assets/imgs/IAM-Add-user-3.jpg)

태그는 따로 추가할 것 없다. 다음 버튼을 눌러 계속 진행해주자.

![IAM: Add user 4](./assets/imgs/IAM-Add-user-4.jpg)

마지막으로 검토 창에서 설정한대로 계정이 만들어졌는지 검토를 한 뒤, '사용자 만들기' 버튼으로 사용자를 추가해주도록 하자.

![IAM: Add user 5](./assets/imgs/IAM-Add-user-5.jpg)

정상적으로 사용자가 추가되었다면, 위와 같은 화면이 반겨줄 것이다. 여기서 '액세스 키 ID(Access key ID)'와 '비밀 액세스 키(Secret access key)'를 Serverless 설정에서 사용할 것이다. 각각 복사해서 메모장에 잠시 붙여넣어주도록 하자.

이 키값들은 유의해서 다뤄야 하는데, 이를 이용하여 AWS 자원을 맘대로 소모시킬 수 있기 때문. 혹여 악의적인 목적을 가진 다른 사용자로 인해 금전적인 피해를 보고 싶지 않다면 이 값들을 잘 관리하도록 하자.

참고로 Sercret access key는 __발급 시 딱 한 번만 볼 수 있기 때문에__ 주의히자. 물론 잃어버린 경우 Access key ID를 새로 발급받아 새로운 Secret access key를 발급받을 수 있다(물론 이 경우도 발급받을 때 한 번만 볼 수 있다).

#### 3. Serverless credentials 설정
Serverless에서 여러가지 작업을 하기 위한 AWS 권한을 설정해주도록 하자.

다음의 명령으로 가능하다.

```sh
$ serverless config credentials --provider aws --key xxxxxxxxxx --secret xxxxxxxxxx
```

첫 번째 key는 Access key ID가 들어가고, 두 번째 key는 Secret access key가 들어가게 된다. 성공하게 되면 다음과 같이 나타날 것이다.

![serverless crediental configuration](./assets/imgs/serverless-credential-configuration.jpg)

참고로 이 명령을 통해 위의 사진에서도 나와있듯이 `~/.aws/credentials` 위치에 키값이 저장된다는 것을 알아두자.

이것으로 Serverless에서 AWS를 사용할 수 있는 모든 준비를 마쳤다. 이제 serverless project를 생성해보도록 하겠다.

#### 4. serverless 프로젝트 생성
프로젝트를 생성할 폴더로 명령창의 위치를 옮긴 다음(cd), 다음의 명령으로 serverless 프로젝트를 생성한다.

```sh
$ serverless create --template aws-nodejs --path quick-start
```

이 명령은 Node.js 런타임 환경에서 개발을 진행할 것이며, AWS의 서버리스 아키텍쳐 서비스를 이용할 것임을 의미한다. 참고로 명령을 입력하기 전에 프로젝트 이름인 `quick-start` 라는 이름의 폴더는 없어야만 한다.

성공적으로 프로젝트를 생성하였을 경우, 다음과 같이 나타난다.

![serverless create project](./assets/imgs/serverless-create-project.jpg)

이렇게 잘 생성되었으면 이제 해당 폴더의 내용물이 어떤 것이 생성되었는지 보도록 하자.

#### 5. init files
다음과 같은 파일이 `quick-start` 폴더 아래에 위치하게 된다.

![serverless create project init files](./assets/imgs/serverless-create-project-init-files.jpg)

각각 다음과 같다. (`.gitignore`은 git 관련 파일이다.)

##### `serverless.yml`
서비스의 모든 설정들이 들어있는 파일이다. 내용은 다음과 같다.

```yml
# serverless.yml

service: quick-start # service name

provider:
  name: aws # service provider
  runtime: nodejs8.10 # runtime

functions: # function lists
  hello: # function name
    handler: handler.hello # handler function (<file name.function>)
```

* __service__: 서비스의 이름
* __provider__: 서버리스 아키텍쳐 서비스 제공 업체와 런타임 환경 정의
* __funcitons__: 서비스의 모든 함수들에 대한 리스트

_function_ 프로퍼티 아래에는 구분을 위한 이름과 요청을 핸들링할 함수가 명시되어있으며, 아래에서 이 곳에 _events_ 프로퍼티를 추가해 트리거를 등록하도록 하겠다.

##### `handler.js`
파일을 열어보면 다음과 같다. Lmabda 부분에 해당되는 함수라고 생각하면 된다.

```js
// handler.js

'use strict';

module.exports.hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ // for stringify
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event
    })
  };
};
```

* _event_: 헤더 등의 정보
* _context_: 실행되는 함수 등의 정보

`serverless.yml`의 _funciton_ 프로퍼티에 설정했던 핸들러 함수인 `handler.js` 파일의 _hello_ 함수이다. 즉, 요청이 들어오면 이 함수가 실행된다는 것. 트리거 등록은 아래에서 진행하도록 하겠다.

반환되는 각각의 요소는 다음의 의미를 갖는다.

* _statusCode_: HTTP status code
* _body_: response body

여기서 우리는 _"Hello!"_ 를 반환하는 서비스를 만들기로 했으니, 다음과 같이 _body_ 를 구성하여야 할 것 이다.

```js
return {
  statusCode: 200,
  body: 'Hello!'
};
```

참고로 원래 다음과 같은 callback 패턴을 사용하였으나, 1.34.0 버전에서부터 prmise 패턴을 이용하여 반환할 수 있도록 구현되었다. ([Support returning promises from serverless.js](https://github.com/serverless/serverless/pull/4827))

```js
// handler.js (using callback pattern)

module.exports.hello = (event, context, callback) => {
  const response = { statusCode: 200, body: 'Hello!' };
  callback(null, response);
};
```

물론 원한다면 callback 패턴을 사용할 수도 있지만, [코드의 가독성과 간결함을 위해 promise 패턴을 사용할 수 있도록 하자.](https://medium.com/@pitzcarraldo/callback-hell-%EA%B3%BC-promise-pattern-471976ffd139)

아무튼 핸들러 함수는 모든 준비를 마쳤다. 남은 건 이제 이 함수에 대한 트리거를 등록하는 것 뿐이다.

이는 `serverless.yml` 에 다음과 같이 _events_ 프로퍼티를 추가함으로써 가능하다.

```yml
# serverless.yml

service: quick-start

provider:
  name: aws
  runtime: nodejs8.10

functions:
  hello:
    handler: handler.hello
    events: # added
      - http:
          path: /
          method: get
```

보면 대략 알 수도 있을텐데, '/' 위치에 'GET' HTTP에 대한 요청을 `handler.js` 파일의 _hello_ 함수에서 핸들링한다는 의미이다.

API Gateway에 대한 부분이라고 생각하면 되겠다. 여기서 받아들일 요청을 정의하고, 해당 요청이 들어오면 연결된 핸들러 함수를 실행하는 것이다.

#### 6. AWS에 업로드
모든 설정을 마쳤다면 이제 남은 건 AWS에 업로드 하는 것 뿐이다. 다음 명령 하나로 가능하다.

```sh
$ serverless deploy -v
```

정상적으로 deploying 되었다면 다음과 같은 로그가 출력된다.

![deploying to AWS](https://cdn-images-1.medium.com/max/1200/1*MZpOqG3asqfwkmuUML7_AA.png)

끝에 보면 _endpoint_ 로그가 출력되는 것이 보일 것이다. 이 링크를 통해 해당 서비스의 API로 접근할 수 있다.

이게 끝이다. 얼마나 간편한가.

### Relieving the pain
그러나 매번 핸들러 함수를 변경할 때 마다 deploying 할 수는 없을 것이다. 이는 [serverless offline](https://github.com/dherault/serverless-offline) 플러그인을 통해 해결할 수 있다.

설치는 다음과 같다. 참고로 npm 말고 좀 더 효율적인 yarn을 사용할 수도 있지만, 이는 글의 주제에서 벗어난다고 생각되어 그냥 위에서도 사용했던 npm으로 설치를 진행하도록 하겠다. ([Yarn: 처음 보는 자바스크립트의 새 패키지 매니저](https://www.vobour.com/yarn-%EC%B2%98%EC%9D%8C-%EB%B3%B4%EB%8A%94-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EC%9D%98-%EC%83%88-%ED%8C%A8%ED%82%A4%EC%A7%80-%EB%A7%A4%EB%8B%88%EC%A0%80-yarn-fir) 참고)

#### 1. init npm
해당 프로젝트 폴더(위의 예제에서는 `quick-start` 폴더가 될 것이다.)로 들어간 뒤 다음의 명령으로 _npm_ 사용을 위한 초기화를 진행하자.

```sh
$ npm init
```

명령 입력 시 프로젝트에 대한 정보를 입력해야 한다. 이는 [여기에 잘 정리되어 있으니](http://visualize.tistory.com/473), 참고하도록 한다.

#### 2. install serverless-offline
다음으로 _serverless-offline_ 모듈을 설치한다.

```sh
$ npm install serverless-offline --save-dev
```

_--save-dev_ 옵션은 개발 시에만 사용되는 모듈임을 명시한다. 이 옵션으로 실제 deploying 시에는 해당 모듈이 포함되지 않아 좀 더 가벼운 서비스로 만들 수 있다.

#### 3. Serverless configuration
다음으로 `serverless.yml`에 해당 모듈을 플러그인으로 사용한다고 명시해줘야 한다.

```yml
service: quick-start

provider:
  name: aws
  runtime: nodejs8.10

plugins: # added
  - serverless-offline

functions:
  hello:
    handler: handler.hello
    events:
      - http:
          path: /
          method: get
```

#### 4. run it locally
이제 남은 건 로컬에서 실행하는 것 뿐이다. 먼저, 플러그인의 초기화를 위해 다음의 명령을 입력해준다.

```sh
$ serverless
```

입력하면 다음의 로그가 출력된다.

![serverless offline init](./assets/imgs/serverless-offline-init.jpg)

정상적으로 플러그인이 등록되었을 시, 위의 사진에 나와있는 것 처럼 `Offline` 이라는 글자가 출력된다.

이제 다음 명령으로 로컬에서 serverless를 실행하도록 하자.

```sh
$ serverless offline start
```

정상적으로 실행되면 다음의 로그가 출력되며

![serverless offline start](./assets/imgs/serverless-offline-start.jpg)

`http://localhost:3000/` 위치에 접속하면 다음과 같은 값이 응답으로 돌아올 것이다.

![serverless offline start: web](./assets/imgs/serverless-offline-start-web.jpg)

이렇게 개발을 진행하면 된다. 개발이 완료되면 다시 deploying 명령을 통해 AWS로 업로드하면 되고...

## Kakao-payment (Option)
(카카오 플랫폼을 사용해 본 경험이 있다는 전제 아래에 진행하도록 하겠습니다.)

![kakao payment](http://www.techforkorea.com/wp-content/uploads/2017/01/unnamed-1-11.jpg)

카카오 플랫폼 서비스를 통해 REST API만으로 PC웹, 모바일 웹, 모바일 앱 등과 같이 다양한 환경에서 아주 간단히 결제를 진행할 수 있다.

(자세한 건 [여기](https://developers.kakao.com/docs/restapi/kakaopay-api)를 참고)

가령 하나의 결제 건에 대한 테스트를 진행하고 싶다면, 다음과 같이 요청을 보내기만 하면 된다.

```sh
curl -v -X POST 'https://kapi.kakao.com/v1/payment/ready' / # 결제 요청 url
-H 'Authorization: KakaoAK xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' / # Admin key
--data-urlencode 'cid=TC0ONETIME' / # 테스트 전용 가맹점 코드
--data-urlencode 'partner_order_id=partner_order_id' / # 가맹점 주문번호
--data-urlencode 'partner_user_id=partner_user_id' / # 가맹점 회원 ID
--data-urlencode 'item_name=초코파이' / # 상품명
--data-urlencode 'quantity=1' / # 상품 수량
--data-urlencode 'total_amount=2200' / # 상품 총액
--data-urlencode 'vat_amount=200' / # 상품 부과세 금액
--data-urlencode 'tax_free_amount=0' / # 상품 비과세 금액
--data-urlencode 'approval_url=https://developers.kakao.com/success' / # 결제 성공 시 redirect url
--data-urlencode 'fail_url=https://developers.kakao.com/fail' / # 결제 실패 시 redirect url
--data-urlencode 'cancel_url=https://developers.kakao.com/cancel' # 결제 취소 시 redirect url
```

이 외의 옵션은 [여기](https://developers.kakao.com/docs/restapi/kakaopay-api#단건결제-프로세스)를 참고.

요청이 성공하면 다음과 같은 응답이 JSON으로 반환된다.

```json
{
 "tid": "T1234567890123456789", // 결제 고유 번호
 "next_redirect_app_url": "https://mockup-pg-web.kakao.com/v1/xxxxxxxxxx/aInfo", // 모바일 앱 결제 url
 "next_redirect_mobile_url": "https://mockup-pg-web.kakao.com/v1/xxxxxxxxxx/mInfo", // 모바일 웹 결제 url
 "next_redirect_pc_url": "https://mockup-pg-web.kakao.com/v1/xxxxxxxxxx/info", // pc 웹 결제 url
 "android_app_scheme": "kakaotalk://kakaopay/pg?url=https://mockup-pg-web.kakao.com/v1/xxxxxxxxxx/order", // 안드로이드 결제 앱 scheme
 "ios_app_scheme": "kakaotalk://kakaopay/pg?url=https://mockup-pg-web.kakao.com/v1/xxxxxxxxxx/order", // IOS 결제 앱 scheme
 "created_at": "2016-11-15T21:18:22" // 결제 준비 요청 시간
}
```

반한되는 URL로 적절히 이동하면 다음과 같은 화면이 반겨주며, 테스트 결제가 진행된다.

![kakao payment process](https://developers.kakao.com/assets/images/rest/pay_process_pc.png)

참고로 한 번 사용된 링크는 재사용할 수 없기 때문에, 필요시마다 가져와야 한다.

### Development of Kakao-payment using Serverless
nodejs를 이용해 결제요청을 보낸 뒤, 링크를 받아와 결제 페이지로 리다이렉트 시키는 서비스를 serverless AWS를 이용한 FaaS로 구현해보도록 하겠다.

#### Installation
```sh
$ serverless create --template aws-nodejs --path kakao-payment-test

$ cd kakao-payment-test

$ npm i serverless-offline --save-dev
```

#### Configuration
```yml
# serverless.yml

service: kakao-payment-test

provider:
  name: aws
  runtime: nodejs8.10

plugins:
  - serverless-offline

region: ap-northeast-2

functions:
  payment:
    handler: handler.payment
    events:
      - http:
          path: /
          method: get
```

#### Development
```js
// handler.js

'use strict';

const axios = require('axios'); // 요청을 위한 모듈

module.exports.payment = async () => {

  const req = await axios.post('https://kapi.kakao.com/v1/payment/ready', [
    'cid=TC0ONETIME',
    'partner_order_id=partner_order_id',
    'partner_user_id=partner_user_id',
    'item_name=초코파이',
    'quantity=1',
    'total_amount=2200',
    'vat_amount=200',
    'tax_free_amount=0',
    'approval_url=http://example.com',
    'fail_url=http://example.com',
    'cancel_url=http://example.com'
  ].join('&'), {
    headers: {
      'Authorization': 'KakaoAK xxxxxxxxxx',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }); // 요청을 보내고 그에대한 응답을 받음

  const response = {
    statusCode: 301,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      Location: req.data.next_redirect_pc_url
    },
    body: ''
  }; // 응답 생성

  return response; // 반환(응답)
};
```

#### Test
```sh
$ serverless offline start # http://localhost:3000/

$ curl -I -HEAD http://localhost:3000/
```

정상적으로 실행되었을 경우 다음과 같은 헤더가 응답으로 반환된다.

![kakao payment response](./assets/imgs/kakao-payment-respnse.jpg)

`http://localhost:3000/` 에도 접속해보도록 하자(PC 웹). 카카오 결제 페이지로 redirect 될 것이다.

#### Watch out!
> redirect cache
  1. HTTP 301로 넘어가는 redirect response는 Crome 등 현대적인 브라우저에서 효율을 위해 caching 된다.
      * [SO - How long do browsers cache HTTP 301s?](https://stackoverflow.com/a/21396547)
  2. 때문에 다음과 같이 caching하지 말라는 헤더를 추가적으로 보내줘야만 한다.
      ```text
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
      ```
  3. 그렇지 않을 경우 cache로 인해 같은 링크로 계속 redirect 될 것이며, 이는 같은 결제 건에 대해서만 redirect 한다는 의미이기 떄문에 결국 중복 거래라는 결과를 초래한다.
      * ![실패(중복 또는 종료된 거래입니다) 이미지](#)

> 과금
  * AWS는 [프리 티어](https://aws.amazon.com/ko/free/?awsf.Free%20Tier%20Types=categories%23featured) 라는 서비스를 제공하여 AWS의 플랫폼과 제품 및 서비스를 무료로 체험해 볼 수 있도록 한다. 여기의 모든 과정들은 (잘만 따라온다면) 프리 티어의 범주 안에 속하는 것들이니 과금의 걱정은 하지 않아도 된다.
  * 그래도 과금이 걱정된다면 [결제 및 비용 관리](https://console.aws.amazon.com/billing/home?nc2=h_m_bc)에서 모든 청구 비용을 확인할 수도 있으니 참고하도록 한다.

---

# 참고
* [AWS Korea: AWS Lambda와 API Gateway를 통한 Serverless Architecture 특집](https://www.slideshare.net/awskorea/serverless-architecture-lambda-api-gateway)
* [A creash course on Sserverless with Node.js](https://hackernoon.com/a-crash-course-on-serverless-with-node-js-632b37d58b44)
* [Velopert - 서버리스 아키텍쳐란?](https://velopert.com/3543)
