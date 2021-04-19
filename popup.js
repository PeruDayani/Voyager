window.onload=function(){
    document.getElementById('toggleSettings').addEventListener('click', toggleSettings);
    document.getElementById("exploreButton").addEventListener("click", launchRandomTab);
    document.getElementById('saveTabButton').addEventListener('click', saveCurrentTab);
    document.getElementById('readTabButton').addEventListener('click', readCurrentTab);
    document.getElementById('clearReadTabs').addEventListener('click', clearReadTabs);
    document.getElementById('clearUnreadTabs').addEventListener('click', clearUnreadTabs);
    document.getElementById('extractTabs').addEventListener('click', extractTabs);
    displayURLs();
}

const defaultWebsites = [
    "https://www.eugenewei.com/",
    "https://onezero.medium.com/",
    "https://www.theatlantic.com/",
    "https://sive.rs/blog",
    "https://www.youtube.com/playlist?list=WL",
    "https://stackoverflow.blog/",
    "https://www.ribbonfarm.com/for-new-readers/",
    "https://www.nytimes.com/section/business/smallbusiness",
    "https://www.nytimes.com/section/technology",
    "https://en.wikipedia.org/wiki/Main_Page",
    "https://www.wired.com/category/ideas/",
    "https://www.wired.com/category/backchannel/",
    "https://blog.x.company/",
    "https://www.bloomberg.com/businessweek"
]

function toggleSettings(){

    var settings = document.getElementById("settings");
    var settingsIcon = document.getElementById("toggleSettings");

    if (settings.style.display === "none") {
        settings.style.display = "block";
        settingsIcon.style.color = "#f76c6c";
    } else {
        settings.style.display = "none";
        settingsIcon.style.color = "#ffffff";
    }
}

function get_urls(type) {

    if (type != 'unReadUrls' && type != 'readUrls'){
        alert("Invalid type given to get_urls")
        return [];
    }

    var urls = new Array;
    var urls_str = localStorage.getItem(type);

    if (urls_str !== null && urls_str !== []) {
        urls = JSON.parse(urls_str);
    } else {
        urls = [];
    }

    return urls;
}

function saveCurrentTab() {

    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        if (tabs !== null && tabs.length > 0) {
            let url = tabs[0].url;
            
            var urls = get_urls('unReadUrls');

            if (!urls.includes(url)){
                urls.push(url);
                localStorage.setItem('unReadUrls', JSON.stringify(urls));    
                displayURLs();
            }

        } else {
            alert('Unable to obtain url, please try again in a second'); 
        }
    });
}

function readCurrentTab() {

    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {

        if (tabs !== null && tabs.length > 0) {
            let url = tabs[0].url;
            
            var unReadUrls = get_urls('unReadUrls');
            var updatedUnreadUrls = unReadUrls.filter(function(value, index, arr){ 
                return value != url;
            });
            localStorage.setItem('unReadUrls', JSON.stringify(updatedUnreadUrls));  
            
            var readUrls = get_urls('readUrls');
            if (!readUrls.includes(url)){
                readUrls.push(url);
                localStorage.setItem('readUrls', JSON.stringify(readUrls));  
            }

            displayURLs();            
        } else {
            alert('Unable to obtain url, please try again in a second'); 
        }
    });

}

function launchRandomTab(){

    var urls = get_urls('unReadUrls');
    let randomURL = '';

    if (urls.length < 1) {
        randomURL = defaultWebsites[Math.floor(Math.random()*defaultWebsites.length)];
    } else {
        randomURL = urls[Math.floor(Math.random()*urls.length)];
    }

    window.open(randomURL);
}

function clearReadTabs() {
    localStorage.setItem('readUrls', JSON.stringify([]));  
    displayURLs();
}

function clearUnreadTabs() {
    localStorage.setItem('unReadUrls', JSON.stringify([]));  
    displayURLs();
}

function displayURLs() {

    // Populate unread urls list
    var urls = get_urls("unReadUrls");    
    var unreadTabs = urls.length;

    var html = '<ul>';
    for(var i=0; i<urls.length; i++) {

        let urlHref = urls[i];
        let urlName = urls[i];

        try {
            let urlNameHelper = urls[i].split('www.');

            if (urlNameHelper.length == 1){
                urlNameHelper = urls[i].split('https://');
            } 
            urlNameHelper = urlNameHelper[1]
            urlNameHelper = urlNameHelper.replaceAll('.com', '')
    
            if (urlNameHelper[urlNameHelper.length-1] == "/"){
                urlNameHelper = urlNameHelper.slice(0,urlNameHelper.length-1);
            }
            urlName = urlNameHelper;
        } catch (error) {
            console.log(error)
        }

        html += '<li>' + 
                '<span class="d-inline-block text-truncate">' + urlName + '</span>' +
                '<i class="fa fa-times-circle removeURL" style="color:white" id="' + i  + '"></i>' +
                '<a href=' + urlHref + ' target="_blank"> <i class="fa fa-link" style="color:white"> </i> </a>' + 
                '</li>';
    };
    html += '</ul>';

    document.getElementById('unreadTabs').innerHTML = html;

    var buttons = document.getElementsByClassName('removeURL');
    for (var i=0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', removeURL);
    };

    // Populate the read urls list
    urls = get_urls("readUrls");
    var readTabs = urls.length;

    html = '<ul>';
    for(var j=0; j<urls.length; j++) {

        let urlHref = urls[j];
        let urlName = urls[j];

        try {
            let urlNameHelper = urls[j].split('www.');

            if (urlNameHelper.length == 1){
                urlNameHelper = urls[j].split('https://');
            } 
            urlNameHelper = urlNameHelper[1]
            urlNameHelper = urlNameHelper.replaceAll('.com', '')
    
            if (urlNameHelper[urlNameHelper.length-1] == "/"){
                urlNameHelper = urlNameHelper.slice(0,urlNameHelper.length-1);
            }
            urlName = urlNameHelper;
        } catch (error) {
            console.log(error)
        }

        html += '<li>' + 
                '<span class="d-inline-block text-truncate">' + urlName + '</span>' +
                '<i class="fa fa-undo undoReadUrl" style="color:white" id="' + j  + '"></i>' +
                '<a href=' + urlHref + ' target="_blank"> <i class="fa fa-link" style="color:white"> </i> </a>' + 
                '</li>';
    };
    html += '</ul>';
    document.getElementById('readTabs').innerHTML = html;

    buttons = document.getElementsByClassName('undoReadUrl');
    for (var i=0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', undoReadUrl);
    };

    // Update the total number of read articles
    document.getElementById('progress-state').innerText = "Read " + readTabs + "/" + (readTabs + unreadTabs) 

}

function removeURL() {

    var id = this.getAttribute('id');
    var urls = get_urls('unReadUrls');
    
    urls.splice(id, 1);
    localStorage.setItem('unReadUrls', JSON.stringify(urls));

    displayURLs();
    return false;
}

function undoReadUrl() {
    var id = this.getAttribute('id');
    var readUrls = get_urls('readUrls');
    var url = readUrls[id]

    readUrls.splice(id, 1);
    localStorage.setItem('readUrls', JSON.stringify(readUrls));

    var unReadUrls = get_urls('unReadUrls');
    if (!unReadUrls.includes(url)){
        unReadUrls.push(url);
        localStorage.setItem('unReadUrls', JSON.stringify(unReadUrls));    
    }

    displayURLs();
}

function extractTabs() {

    let timestamp = Date.now();
    timestamp = new Date(timestamp);

    var unReadUrls = get_urls("unReadUrls");  
    var readUrls = get_urls("readUrls");    

    var text = "Timestamp: " + timestamp + "\n\n";
    text += 'Unread urls: \n';
    unReadUrls.forEach(url => {
        text += "- " + url + "\n"
    })

    text += "\n" + "Read urls: \n"
    readUrls.forEach(url => {
        text += "- " + url + "\n"
    })

    // Save As function from: https://github.com/koffsyrup/FileSaver.js
    var saveAs=saveAs ||(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator))||(function(view){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var doc=view.document,get_URL=function(){return view.URL||view.webkitURL||view},save_link=doc.createElementNS("http://www.w3.org/1999/xhtml","a"),can_use_save_link=!view.externalHost&&"download"in save_link,click=function(node){var event=doc.createEvent("MouseEvents");event.initMouseEvent("click",true,false,view,0,0,0,0,0,false,false,false,false,0,null);node.dispatchEvent(event)},webkit_req_fs=view.webkitRequestFileSystem,req_fs=view.requestFileSystem||webkit_req_fs||view.mozRequestFileSystem,throw_outside=function(ex){(view.setImmediate||view.setTimeout)(function(){throw ex},0)},force_saveable_type="application/octet-stream",fs_min_size=0,deletion_queue=[],process_deletion_queue=function(){var i=deletion_queue.length;while(i--){var file=deletion_queue[i];if(typeof file==="string"){get_URL().revokeObjectURL(file)}else{file.remove()}}deletion_queue.length=0;},dispatch=function(filesaver,event_types,event){event_types=[].concat(event_types);var i=event_types.length;while(i--){var listener=filesaver["on"+event_types[i]];if(typeof listener==="function"){try{listener.call(filesaver,event||filesaver)}catch(ex){throw_outside(ex)}}}},FileSaver=function(blob,name){var filesaver=this,type=blob.type,blob_changed=false,object_url,target_view,get_object_url=function(){var object_url=get_URL().createObjectURL(blob);deletion_queue.push(object_url);return object_url},dispatch_all=function(){dispatch(filesaver,"writestart progress write writeend".split(" "))},fs_error=function(){if(blob_changed||!object_url){object_url=get_object_url(blob)}if(target_view){target_view.location.href=object_url}else{window.open(object_url,"_blank")}filesaver.readyState=filesaver.DONE;dispatch_all()},abortable=function(func){return function(){if(filesaver.readyState!==filesaver.DONE){return func.apply(this,arguments)}}},create_if_not_found={create:true,exclusive:false},slice;filesaver.readyState=filesaver.INIT;if(!name){name="download"}if(can_use_save_link){object_url=get_object_url(blob);save_link.href=object_url;save_link.download=name;click(save_link);filesaver.readyState=filesaver.DONE;dispatch_all();return}if(view.chrome&&type&&type!==force_saveable_type){slice=blob.slice||blob.webkitSlice;blob=slice.call(blob,0,blob.size,force_saveable_type);blob_changed=true}if(webkit_req_fs&&name!=="download"){name+=".download"}if(type===force_saveable_type||webkit_req_fs){target_view=view}if(!req_fs){fs_error();return}fs_min_size+=blob.size;req_fs(view.TEMPORARY,fs_min_size,abortable(function(fs){fs.root.getDirectory("saved",create_if_not_found,abortable(function(dir){var save=function(){dir.getFile(name,create_if_not_found,abortable(function(file){file.createWriter(abortable(function(writer){writer.onwriteend=function(event){target_view.location.href=file.toURL();deletion_queue.push(file);filesaver.readyState=filesaver.DONE;dispatch(filesaver,"writeend",event)};writer.onerror=function(){var error=writer.error;if(error.code!==error.ABORT_ERR){fs_error()}};"writestart progress write abort".split(" ").forEach(function(event){writer["on"+event]=filesaver["on"+event]});writer.write(blob);filesaver.abort=function(){writer.abort();filesaver.readyState=filesaver.DONE};filesaver.readyState=filesaver.WRITING}),fs_error)}),fs_error)};dir.getFile(name,{create:false},abortable(function(file){file.remove();save()}),abortable(function(ex){if(ex.code===ex.NOT_FOUND_ERR){save()}else{fs_error()}}))}),fs_error)}),fs_error)},FS_proto=FileSaver.prototype,saveAs=function(blob,name){return new FileSaver(blob,name)};FS_proto.abort=function(){var filesaver=this;filesaver.readyState=filesaver.DONE;dispatch(filesaver,"abort")};FS_proto.readyState=FS_proto.INIT=0;FS_proto.WRITING=1;FS_proto.DONE=2;FS_proto.error=FS_proto.onwritestart=FS_proto.onprogress=FS_proto.onwrite=FS_proto.onabort=FS_proto.onerror=FS_proto.onwriteend=null;view.addEventListener("unload",process_deletion_queue,false);saveAs.unload=function(){process_deletion_queue();view.removeEventListener("unload",process_deletion_queue,false)};return saveAs}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content));if(typeof module!=="undefined"&&module!==null){module.exports=saveAs}else if((typeof define!=="undefined"&&define!==null)&&(define.amd!=null)){define([],function(){return saveAs})}String.prototype.endsWithAny=function(){var strArray=Array.prototype.slice.call(arguments),$this=this.toLowerCase().toString();for(var i=0;i<strArray.length;i+=1){if($this.indexOf(strArray[i],$this.length-strArray[i].length)!==-1){return true}}return false};var saveTextAs=saveTextAs||(function(textContent,fileName,charset){fileName=fileName||'Athena_Data.txt';charset=charset||'utf-8';textContent=(textContent||'').replace(/\r?\n/g,"\r\n");if(saveAs&&Blob){var blob=new Blob([textContent],{type:"text/plain;charset="+charset});saveAs(blob,fileName);return true}else{var saveTxtWindow=window.frames.saveTxtWindow;if(!saveTxtWindow){saveTxtWindow=document.createElement('iframe');saveTxtWindow.id='saveTxtWindow';saveTxtWindow.style.display='none';document.body.insertBefore(saveTxtWindow,null);saveTxtWindow=window.frames.saveTxtWindow;if(!saveTxtWindow){saveTxtWindow=window.open('','_temp','width=100,height=100');if(!saveTxtWindow){window.alert('Sorry, download file could not be created.');return false}}}var doc=saveTxtWindow.document;doc.open('text/html','replace');doc.charset=charset;if(fileName.endsWithAny('.htm','.html')){doc.close();doc.body.innerHTML='\r\n'+textContent+'\r\n'}else{if(!fileName.endsWithAny('.txt')){fileName+='.txt'}doc.write(textContent);doc.close()}var retValue=doc.execCommand('SaveAs',null,fileName);saveTxtWindow.close();return retValue}});
    saveTextAs(text, '');

}
