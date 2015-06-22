goog.require('goog.crypt.Sha1');
goog.require('goog.crypt.Md5');
goog.require('goog.crypt');

var $builtinmodule = function(name)
{
    var mod = {};

    mod.algorithms=new Sk.builtin.list([Sk.builtin.str('md5'), 
                                        Sk.builtin.str('sha1')]);

    var md5_=function($gbl, $loc) {
        $loc.__init__=new Sk.builtin.func(function(self) {
           self._md5=new goog.crypt.Md5();
        });

        $loc.digest = new Sk.builtin.func(function(self) {
           //todo: convert to some type of bytes datatype
           return self._md5.digest();
        });
        $loc.hexdigest = new Sk.builtin.func(function(self) {
           var result=self._md5.digest();
           //create hexdecimal version of output and return;
           return new Sk.builtin.str(goog.crypt.byteArrayToHex(result));
        });
        $loc.update = new Sk.builtin.func(function(self, data) {
           var b;
           if (data instanceof Sk.builtin.str) {
              b=new goog.crypt.stringToUtf8ByteArray(data.v);
           } else if (data instanceof Sk.builtin.Bytes) {
              b=data;
           }
           self._md5.update(b);
        });
    } //var md5_

    mod.md5=Sk.misceval.buildClass(mod, md5_, 'md5', []);

    var sha1_=function($gbl, $loc) {
        $loc.__init__=new Sk.builtin.func(function(self) {
           self._sha1=new goog.crypt.Sha1();
        });

        $loc.digest = new Sk.builtin.func(function(self) {
           //todo: convert to some type of bytes datatype
           return self._sha1.digest();
        });
        $loc.hexdigest = new Sk.builtin.func(function(self) {
           var result=self._sha1.digest();
           //create hexdecimal version of output and return;
           return new Sk.builtin.str(goog.crypt.byteArrayToHex(result));
        });
        $loc.update = new Sk.builtin.func(function(self, data) {
           var b;
           if (data instanceof Sk.builtin.str) {
              b=new goog.crypt.stringToUtf8ByteArray(data.v);
           } else if (data instanceof Sk.builtin.Bytes) {
              b=data;
           }
           self._sha1.update(b);
        });
    } //var sha1_

    mod.sha1=Sk.misceval.buildClass(mod, sha1_, 'sha1', []);


    return mod;
};