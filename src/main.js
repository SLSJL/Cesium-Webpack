import "./styles/index.less";
import "./js/index";

//除webpack.config.js以外,代码改动就可以实现热更新
if (module.hot) {
  module.hot.accept();
}
