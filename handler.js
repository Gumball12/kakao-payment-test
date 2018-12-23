'use strict';

const axios = require('axios');

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
      'Authorization': 'KakaoAK 441c20750456791d9388c24f8b438b78',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const response = {
    statusCode: 301,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      Location: req.data.next_redirect_pc_url
    },
    body: ''
  };

  return response;
};
