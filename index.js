const request = require('request');
const socks = require('socksv5');
const url = require('url');


function addProxyParams(params) {
  if (!process.env['ALL_PROXY']) {
    return params;
  }

  const proxy = url.parse(process.env['ALL_PROXY']);

  if (proxy.protocol === 'socks5h:') {
    return Object.assign(params, {
      agentClass: socks.HttpAgent,
      agentOptions: {
        proxyHost: proxy.hostname,
        proxyPort: proxy.port,
        auths: [
          socks.auth.None(),
        ],
        localDNS: false,
      },
    });
  } else {
    console.warning("ALL_PROXY: protocol not supported! (%s)", proxy.protocol);
    return params;
  };
}

function socks5_request (uri, options, callback) {
  return request(uri, addProxyParams(options), callback);
};

function verbFunc (verb) {
  const method = verb.toUpperCase();
  return function (uri, options, callback) {
    const params = request.initParams(uri, options, callback);
    params.method = method;
    return request(addProxyParams(params), params.callback);
  }
}

// define like this to please codeintel/intellisense IDEs
socks5_request.get = verbFunc('get');
socks5_request.head = verbFunc('head');
socks5_request.options = verbFunc('options');
socks5_request.post = verbFunc('post');
socks5_request.put = verbFunc('put');
socks5_request.patch = verbFunc('patch');
socks5_request.del = verbFunc('delete');
socks5_request['delete'] = verbFunc('delete');

module.exports = socks5_request;
