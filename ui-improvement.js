// ==UserScript==
// @name         Bamboo UI Improvement
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Atlassian Bamboo UI improvement
// @author       Alessandro Cingolani (@gr3yc4t)
// @match        http*://*/browse/*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';


    $(document).ready(function(){

        //Check if the page is Bamboo due to the too permissive @match
        var app_name = $('meta[name=application-name]').attr('content');

        if(app_name != "Bamboo"){
            return;
        }else{
            var $buttonVariables = $('<a class=""><span class="aui-icon aui-icon-small aui-iconfont-settings"></span></a>');


            console.log("DOCUMENT READY");

            $(this).find(".project").each( function (index) {

                var plan_nickname = $(this).find(".build").find("a").attr('id').replace("viewBuild:", "");
                console.log(plan_nickname);
                $buttonVariables.attr("href", window.location.origin + "/chain/admin/config/configureChainVariables.action?buildKey=" + plan_nickname);

                $(this).find(".dashboard-operations").each(function (index) {
                    console.log("FOUND");
                    $(this).append($buttonVariables);
                });
            });

        }

    });
})();