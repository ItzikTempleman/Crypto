"use strict";
var PageId;
(function (PageId) {
    PageId["HOME"] = "home-body-container";
    PageId["LIVE"] = "chart-page";
    PageId["ABOUT"] = "about-page";
})(PageId || (PageId = {}));
function getPage() {
    if (document.getElementById(PageId.HOME))
        return PageId.HOME;
    if (document.getElementById(PageId.LIVE))
        return PageId.LIVE;
    if (document.getElementById(PageId.ABOUT))
        return PageId.ABOUT;
    return null;
}
