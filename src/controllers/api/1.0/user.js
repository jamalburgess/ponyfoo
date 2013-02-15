var mongoose = require('mongoose'),
    rest = require('../../../services/rest.js'),
    user = require('../../../models/user.js');

function find(req,res){
    var id = mongoose.Types.ObjectId(req.params.id);

    user.findOne({ _id: id}, function(err, document){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        rest.resHandler(err,{
            res:res,
            then: function(){
                rest.end(res,{
                    user: {
                        _id: document._id,
                        created: document.created,
                        displayName: document.displayName,
                        gravatarLarge: document.gravatarLarge,
                        website: document.website,
                        bio: document.bio,
                        passwordUndefined: document.password === undefined
                    }
                });
            }
        });
    });
}

function upd(req,res){
    var id = mongoose.Types.ObjectId(req.params.id);
    if(!id.equals(req.user._id)){
        rest.unauthorized(req,res);
        return;
    }

    user.findOne({ _id: id}, function(err, document){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        var changes = req.body.user;
        if (typeof changes.password === 'string' && changes.password.length > 0){
            document.password = changes.password;
        }

        var site = changes.website;
        if(!!site){
            if(!!site.url && site.url.search(/https?:\/\//i) === -1){
                site.url = 'http://' + site.url;
            }

            if(!site.url || !site.title){
                site = {};
            }
        }

        document.website = site;
        document.bio = changes.bio;
        document.save(function (err){
            rest.resHandler(err,{res:res});
        });
    });
}

module.exports = {
    get: find,
    upd: upd
};