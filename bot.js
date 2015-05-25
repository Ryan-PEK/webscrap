var Model = require('./model');
var Scraper = require('./scraper');
var Pages = [];

function generateFangUrls(from_id, to_id) {
    var url_host = 'www.fang.com';
    var url_port = 80;
    var url_path_pre = '/house/';
    var url_path_sub = '/housedetail.htm';
    var urls = [];
    var i;
    for (i = from_id; i <= to_id; i++) {
        urls.push({
            'host': url_host,
            'port': url_port,
            'path': url_path_pre + i + url_path_sub
        });
    }
    return urls;
}

function generateFocusUrls(from_id, to_id) {
        var url_host = 'house.focus.cn';
        var url_port = 80;
        var url_path_pre = '/votehouse/';
        var url_path_sub = '/xiangqing/';
        var urls = [];
        var i;
        for (i = from_id; i <= to_id; i++) {
            urls.push({
                'host': url_host,
                'port': url_port,
                'path': url_path_pre + i + url_path_sub
            });
        }
        return urls;
    }
    // store all urls in a global variable  
Pages = generateFangUrls(1010746171, 1010746180);
//Pages = generateFocusUrls(8579, 8585);

function wizard() {
    // if the Pages array is empty, we are Done!!
    if (!Pages.length) {
        return console.log('Done!!!!');
    }
    var url = Pages.pop();
    var scraper = new Scraper(url);
    var model;
    console.log('Requests Left: ' + Pages.length);
    // if the error occurs we still want to create our
    // next request
    scraper.on('error', function(error) {
        console.log(error);
        if (!Pages.length) {
            process.exit(0);
        }
        wizard();
    });
    // if the request completed successfully
    // we want to store the results in our database
    scraper.on('complete', function(listing) {
        if (listing.name !== '') {
            model = new Model(listing);
            console.log('Database saving...');
            model.save(function(err) {
                console.log('Database saving OK!');
                if (err) {
                    console.log('Database err saving: ' + url);
                }
                if (!Pages.length) {
                    process.exit(0);
                }
            });
        } else {
            if (!Pages.length) {
                process.exit(0);
            }
        }
        setTimeout(wizard, 100);
    });
}

var numberOfParallelRequests = 1;
for (var i = 0; i < numberOfParallelRequests; i++) {
    wizard();
}
