/**
 * Class風の処理実装をさせるライブラリ
 *
 * @sample
 * var Animal = Class.extend({
 *   init: function() {
 *     console.log('animal');
 *   },
 *   walk: function() {
 *     console.log('walking');
 *   }
 * });
 * var Monkey = Animal.extend({
 *   _super: 'super!',
 *   init: function () {
 *     this._super();
 *     console.log('monkey');
 *   }
 * });
 * 
 * var monkey = new Monkey;
 * monkey.walk();
 * => walking
 */
(function (window) {
  'use strict';
  /**
   * メソッド内に_superの記述があるかのチェック
   * _superがあるメソッドだけ上書き
   * _superがあるかどうか判断できない場合は[/ .* /]となって全部上書き
   */
  var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  function Class() { /* noop. */ }

  Class.extend = function (props) {
    var SuperClass = this;

    function Class() {
      if (typeof this.init === 'function') {
        this.init.apply(this, arguments);
      }
      // _superプロパティを書き込み禁止
      Object.defineProperty(this, '_super', {
        value: undefined,
        enumerable: false,
        writable: false,
        configurable: true
      });
    }

    // prototypeチェーンを作る
    Class.prototype = Object.create(SuperClass.prototype, {
      constructor: {
        value: Class,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    // instanceメソッドをセット
    Object.keys(props).forEach(function (key) {
      var prop   = props[key],
          _super = SuperClass.prototype[key],
          isMethodOverride = (typeof prop === 'function' && typeof _super === 'function' && fnTest.test(prop));

      if (isMethodOverride) {
        Class.prototype[key] = function () {
          var ret,
              tmp = this._super;

          // _superプロパティを設定
          Object.defineProperty(this, '_super', {
            value: _super,
            enumerable: false,
            writable: false,
            configurable: true
          });

          ret = prop.apply(this, arguments);

          // _superプロパティを書き込み禁止にする
          Object.defineProperty(this, '_super', {
            value: tmp,
            enumerable: false,
            writable: false,
            configurable: true
          });

          return ret;
        };
      } else {
        Class.prototype[key] = prop;
      }
    });
    Class.extend = SuperClass.extend;
    return Class;
  };
  window.Class = Class;
}(window));
