// Need to figure out the template issue with this
if (Meteor.isClient) {
Handlebars.registerHelper('eachProperty', function(context, options) {
    var ret = "";
    for(var prop in context)
    {
       if(prop!="image" && prop!="height") {
            ret = ret + options.fn({property:prop,value:context[prop]});
       }
   }
    return ret;
});

  Template.res_normal.data = function () {return Session.get("normal");};
  Template.res_mobile.data = function () {return Session.get("mobile");};
  Template.hello.events({
    'click button': function (e) {
       var url = $("#url").val();
       Session.set("normal",{"loading":"...","height":"0"});
       Session.set("mobile",{"loading":"...","height":"0"});
       Meteor.call("crawl",url, "normal",function(err,res){   
          Session.set("normal",res);
       });
       Meteor.call("crawl",url, "mobile",function(err,res){
          Session.set("mobile",res);
      });
    }
  });
}

// Server side seems to be complete
if (Meteor.isServer) {
  Meteor.methods({
      crawl: function (url,t) {
            var fut = new Future();
            console.log(url);
            var pname = CryptoJS.MD5(url).toString() + ".png";
            var params = {"analyze-css":true,"user-agent":"Mozilla/5.0 (Linux; U; Android 2.1-update1; en-us; SAMSUNG-SGH-I897/I897UCJH7 Build/ECLAIR) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17","viewport":"480x800","screenshot":"/tmp/"+pname};
            if(t=="mobile") {
               params["proxy"] = "173.193.215.18:8001";
            }
            phantomas(url,params,function(err,res){
               var image_data = fs.readFileSync("/tmp/"+pname);
               var image_b64 = new Buffer(image_data).toString('base64');
               console.log("Done");
               var ret = res["metrics"];
               ret["image"] = image_b64;
               ret["height"] = "800";
               fut.return(res["metrics"]);
            });
            return fut.wait();
      }
  });
  Meteor.startup(function () {
     fs = Npm.require('fs');
     Future = Npm.require('fibers/future');
     phantomas = Meteor.require('phantomas');
    // code to run on server at startup
  });
}
