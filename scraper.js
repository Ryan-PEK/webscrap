var http = require('follow-redirects').http;
var iconv = require('iconv-lite');
var zlib = require('zlib');
var cheerio = require('cheerio');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var STATUS_CODES = http.STATUS_CODES;
/*
 * Scraper Constructor
 **/
function Scraper(url) {
        this.url = url;
        this.init();
    }
    /*
     * Make it an EventEmitter
     **/
util.inherits(Scraper, EventEmitter);

/*
 * Initialize scraping
 **/
Scraper.prototype.init = function() {
    var model;
    var self = this;
    self.on('loaded', function(html) {
        model = self.parsePage(html);
        self.emit('complete', model);
    });
    self.loadWebPage();
};

Scraper.prototype.loadWebPage = function() {
    var self = this;
    console.log('\n\nLoading ' + self.url.host + self.url.path);
    http.get({
            hostname: self.url.host,
            port: self.url.port,
            path: self.url.path,
            headers: {
                'User-Agent': 'nodejs'
            }
        }, function(res) {
            var chunks = [];
            if (res.statusCode !== 200) {
                return self.emit('error', STATUS_CODES[res.statusCode]);
            }
            var encoding = res.headers['content-encoding'];
            console.log('content-encoding:' + encoding);
            if (encoding === 'gzip') {
                var gunzip = zlib.createGunzip();
                res.pipe(gunzip);
                gunzip.on('data', function(chunk) {
                    chunks.push(chunk);
                });
                gunzip.on('end', function() {
                    //console.log(Buffer.concat(chunks).toString());
                    self.emit('loaded', iconv.decode(Buffer.concat(chunks), 'gbk'));
                });
            } else {
                //console.log('Response not gzip');
                //self.emit('error', new Error('response not gzip'));
                res.on('data', function(chunk) {
                    chunks.push(chunk);
                });
                res.on('end', function() {
                    //console.log(Buffer.concat(chunks).toString());
                    self.emit('loaded', iconv.decode(Buffer.concat(chunks), 'gbk'));
                });
            }
        })
        .on('error', function(err) {
            self.emit('error', err);
        });
};
/*
 * Parse html and return an object
 **/
Scraper.prototype.parsePage = function(html) {
    var decodedhtml = html;
    var $ = cheerio.load(decodedhtml);
    // fang 
    var name = $('#daohang > div > div.lpname.fl > dl > dd > div.lpbt.tf.jq_nav > h1 > a').text();
    // foucs
    //var name = $('#skintitle > div.houseName.area > div:nth-child(2) > div > h1 > a').text();
    console.log(name.trim());
    var model = {
        name: name.trim()
    };
    return model;
};
module.exports = Scraper;
