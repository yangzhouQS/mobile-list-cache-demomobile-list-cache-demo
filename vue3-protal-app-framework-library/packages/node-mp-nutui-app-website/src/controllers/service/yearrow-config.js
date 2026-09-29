const axios = require('axios')
const crypto = require('crypto-js')

function paramsSerializer(params) {
  if (params) {
    var parts = []
    for (const key in params) {
      const element = params[key];
      parts.push(`${key}=${element}`)
    }
    return parts.join('&')
  } else {
    return ''
  }
}

async function yerrowApi({ path, method, data, yconfig }) {
  const baseURL = yconfig.baseURL
  const date = new Date().toUTCString()
  let policyItems = [method.toUpperCase()]
  let paramPath = path
  if (method === 'get') {
    if (data) {
      paramPath = `${path}?${paramsSerializer(data)}`
    }
  }
  policyItems.push(paramPath)
  policyItems.sort()
  const msg = policyItems.join(',')
  const authorization = yconfig.accessId + ':' + crypto.HmacSHA512(msg, yconfig.secretKey)
  const options = {
    baseURL,
    url: paramPath,
    method,
    headers: {
      authorization,
      date,
      'x-authorize-gateway': crypto.MD5(path).toString()
    }
  }

  if (['post', 'put'].includes(method)) {
    if (data) {
      options.data = data
    }
  }
  try {
    options.data = data
    const response = await axios(options)
    if (response.data.status === 'success') {
      return response.data
    } else {
      return {code: response.data.code, status: 'error', message: response.data.message}
    }
  } catch (err) {
    if (err.response?.data) {
      return {code: err.response.data.code, status: 'error', message: err.response.data.message}  // { errorCode: 1, message: err.response.data}
    } else {
      return {code: 500, status: 'fail', message: '访问接口失败'}
    }
  }
}

module.exports = {
  yerrowApi
}
