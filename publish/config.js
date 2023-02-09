module.exports = {
  title: 'dist',
  host: '123.56.68.226',
  port: 22,
  username: 'root',
  privateKey: require('fs').readFileSync('c:/Users/yanghao/.ssh/id_rsa'),
  path: '/www/wwwroot/kdtd/front'
}

