import request from '@/utils/request'

export function relation(keyword) {
  return request({
    url: '/nwEnterprise/getCompanyInfoByName?keyword=' + keyword,
    method: 'get',
  })
}