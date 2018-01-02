var config = require('config');
var exec = require('child_process').exec;
var util = require('util');
var express = require('express');
var router = express.Router();

var devices = config.get("devices");

var irsendRoute = '/devices/:device/:directive/:code';

var irsendRouteHandler = function(req, res){
  var command = util.format('irsend %s %s %s', req.params.directive, devices[req.params.device].device, req.params.code);
  var result;
  console.log('executing: ' + command);
  exec(command, (error, stdout, stderr) => {
    result = stdout.trim();
    // success returns a blank string, I want to return something back to the browswer
    if(!result){
      result = "success";
    }
    res.json({result: result});
  });
};

router.get('/', function(req, res, next) {
  var key = Object.keys(devices)[0];
  res.render(key, { title: devices[key].title, device: key });
});

router.get('/devices/:device', function(req, res, next) {
  var device = req.params.device;
  res.render(device, {title: devices[device].title, device: device});
});

// not doing .all because keeping security in mind even though this website should be internal
router.get(irsendRoute, irsendRouteHandler); 
router.post(irsendRoute, irsendRouteHandler);

module.exports = router;
