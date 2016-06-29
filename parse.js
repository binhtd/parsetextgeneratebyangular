/**
 * Created by binhtd on 27/06/2016.
 */

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};


var steps = [];
var testindex = 0;
var loadInProgress = false; //this is set to true when a page is still loading

/**************************************SETTINGS******************************************************************/
var webPage = require("webpage");
var page = webPage.create();
page.settings.userAgent = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36";
page.settings.javascriptEnabled = true;
page.settings.loadImages  = false; // Script is much faster with this field set to false
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

/***********************************SETTINGS END*********************************************************************/

console.log("All settings loaded, start with execution");
page.onConsoleMessage = function(msg){
    console.log(msg);
};
/*****************DEFINE STEPS THAT PHANTOM SHOULD DO************************************/
steps = [
    //Step 1 open https://compare.switchon.vic.gov.au
    function(){
        console.log("Step 1 - Open https://compare.switchon.vic.gov.au");
        page.open("https://compare.switchon.vic.gov.au", function(status){
            if ( status === "success" ) {
                page.injectJs("jquery.min.js");
            }
        });
    },
    //step 2 input filter value
    function() {
        console.log("Step 2.1 - Waiting for loading page and input filter value");
        page.evaluate(
            function () {
                var e = jQuery.Event("keypress");
                $("label[for='gas']").click();
                $("label[for='home']").click();
                $("label[for='home-shift']").click();
                $("input[name='postcode']").click();
                e.which = 13; //choose the one you want
                e.keyCode = 13;

                $("input[name='postcode']").trigger(e);
                $("input[name='postcode']").val("3011");
                $("#postcode-btn").click();
            }
        );

        waitFor(function() {
            // Check in the page if a specific element is now visible
            console.log("demoe");
            return page.evaluate(function() {
                return $("#lbl_step4_header").is(":visible");
            });
        }, function() {
           console.log("ajax response");
           $("label[for='energy-concession-no']").click();
           $("#disclaimer_chkbox").click();
           $("#btn-proceed").click();
        });
    },
    function() {
        console.log("Step 2.2 - Waiting for loading page and input filter value");
    },

    //step 3 continue input filter value
    function(){
        console.log("step 3 - Waiting for loading page and continue input filter value");
        var result = page.evaluate(function(){
            console.log(document.title);
        });
    },
];

/************END STEPS THAT PHANTOM SHOULD DO*******************************************/
//execute steps one by one
interval = setInterval(executeRequestStepByStep, 50);
function executeRequestStepByStep(){
    if ((loadInProgress == false) && (typeof steps[testindex] == "function")){
        steps[testindex]();
        testindex++;
    }

    if (typeof steps[testindex] != "function"){
        console.log("test completed");
        phantom.exit();
    }
}

/**
 * These listeners are very important in order to phantom wrok properly. Using these listeners, we control loadInProgress marker which controls, weather a page
 * is full loaed. Without this, we will get content of the page, event a page is not fully loaded.
 */

page.onLoadStarted = function(){
    loadInProgress = true;
    console.log("Loading started");
};

page.onLoadFinished = function(){
    loadInProgress = false;
    console.log("LOading finished");
};

page.onConsoleMessage = function(msg){
    console.log(msg);
};
