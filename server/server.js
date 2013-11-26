
var lists = new Meteor.Collection("Lists");

//lists.remove({})
function adminUser(userId) {
  var adminUser = Meteor.users.findOne({username:"zzz"});
  return (userId && adminUser && userId === adminUser._id);
}
lists.allow({
  insert: function(userId, doc){
    return (adminUser(userId)|| (userId && doc.owner === userId));
  },
  update: function(userId, docs, fields, modifier){
    return adminUser(userId) ||
    _.all(docs, function(doc) {
      return doc.owner === userId;
    });;
  },
  remove: function (userId, docs){
    return adminUser(userId) ||
    _.all(docs, function(doc) {
      return doc.owner === userId;
    });
  }
});

  Meteor.publish("Categories", function() {
           /* client.get("foo", function (err, reply) {
            var ok=reply.toString();
            return [{Category:ok,owner:'zzz'}];         
        });*/

  return lists.find({owner:this.userId},{fields:{Category:1}}); 
});
  Meteor.publish("listdetails", function(category_id){
  return lists.find({_id:category_id}); 
});
  //var     client = redis.createClient(8080,"172.20.192.134", {detect_buffers: true});
  

  Meteor.startup(function () {
    // code to run on server at startup

    
    console.log("server ok")
  
      
      
  });

 RESTstop.add('get_num/:num?', function() {
        if(!this.params.num) {
          return [403, {success: false, message: 'You need a num as a parameter!'}];
        }
        console.log("get num"+this.params.num)      
        return this.params.num;
      });




// Handler to login with plaintext password.
//
// The meteor client doesn't use this, it is for other DDP clients who
// haven't implemented SRP. Since it sends the password in plaintext
// over the wire, it should only be run over SSL!
//
// Also, it might be nice if servers could turn this off. Or maybe it
// should be opt-in, not opt-out? Accounts.config option?
Accounts.registerLoginHandler(function (options) {
  if (!options.password || !options.user)
    return undefined; // don't handle

  check(options, {user: userQueryValidator, password: String});

  var selector = selectorFromUserQuery(options.user);
  var user = Meteor.users.findOne(selector);
  if (!user)
    throw new Meteor.Error(403, "User not found");

  if (!user.services || !user.services.password ||
      !user.services.password.srp)
    throw new Meteor.Error(403, "User has no password set");

  // Just check the verifier output when the same identity and salt
  // are passed. Don't bother with a full exchange.
  var verifier = user.services.password.srp;
  var newVerifier = SRP.generateVerifier(options.password, {
    identity: verifier.identity, salt: verifier.salt});

  if (verifier.verifier !== newVerifier.verifier)
    throw new Meteor.Error(403, "Incorrect password");

  var stampedLoginToken = Accounts._generateStampedLoginToken();
  Meteor.users.update(
    user._id, {$push: {'services.resume.loginTokens': stampedLoginToken}});

  return {
    token: stampedLoginToken.token,
    tokenExpires: Accounts._tokenExpiration(stampedLoginToken.when),
    id: user._id
  };
});
