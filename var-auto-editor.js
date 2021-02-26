// ==UserScript==
// @name         Bamboo Variable Auto-Editor
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Atlassian Bamboo automatic variable editor
// @author       Alessandro Cingolani (@gr3yc4t)
// @match        http*://*/chain/admin/config/configureChainVariables.action*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require      https://rawgit.com/notifyjs/notifyjs/master/dist/notify.js
// ==/UserScript==

(function() {
    'use strict';

    var altToken = "";  //Token for CSRF protection

    //NOTE: this variable specifies which 
    var varToEdit = "docker_image_version";

    $(document).ready(function(){

        var $buttonTest = $('<button class="aui-button" id="btn_apply_test">Use latest-test</button>');
        var $buttonStable = $('<button class="aui-button" id="btn_apply_stables">Use latest-stable </button>');


        $(".aui-toolbar").append($buttonTest);
        $(".aui-toolbar").append($buttonStable);



        console.log("DOCUMENT READY");

        //Fetch "alt-token" from the page
        altToken = $("#planVariables").children("input:last-child").val();
        console.log("ALT TOKEN = " + altToken);

        //Event Handlers
        $("#btn_apply_test").click( function () {
            editVariables("latest-test");
        });


        $("#btn_apply_stables").click( function () {
            editVariables("latest-stable");

        });


        /**
         * 
         * @param {*}                           table_rows 
         * @param {Integer}                     variable_id The ID of the variable
         * @param {function(variable_value)}    callback The callback function used to retrieve the var. value
         */
        function getCurrrentVarValue(table_rows, variable_id, callback){

            table_rows.find(".variable-value-container").each( function (index) {

                let value_id = "value_" + variable_id;

                var variable_value = $(this).find("#" + value_id).val();


                callback(variable_value);
            });

        }




        /**
         * 
         * @param {string} variable_value The new variables value
         */
        function editVariables(variable_value){

            console.log("Start fetching key name");

            var rows = $("#plan-variable-config").children();

            rows.find(".variable-key").each( function (index) {

                var key_name = $(this).find("input").val();
                var var_id = $(this).find("input").attr('id').replace("planVariables_key_", "");
                console.log("Keyname: " + key_name + ", VarID: " + var_id);

                if (key_name.includes(varToEdit)){


                    getCurrrentVarValue($(this).parent(), var_id, function(current_variable_value){

                        if (current_variable_value == variable_value){
                            $.notify("\"" + key_name + "\" skipped", "warn");
                        }else{

                            var my_json = { 'variableId': parseInt(var_id), 'variableKey': key_name, 'variableValue': variable_value, 'bamboo.successReturnMode': "json", 'decorator': "nothing", 'confirm': true, 'atl_token': altToken};

                            var encoded_string = jQuery.param(my_json);

                            var my_url = window.location.href;
                            var api_url = my_url.replace("/chain/admin/config/configureChainVariables.action?buildKey=", "/build/admin/ajax/updatePlanVariable.action?planKey=");


                            $.post( {
                                url: api_url,
                                data:   encoded_string,
                                success: function( result ) {
                                    console.log("Request result for " + key_name);
                                    console.log(result);

                                    if (result.status == "OK")
                                        $.notify("Applyed", "success");
                                    else
                                        $.notify("Unable to edit " + key_name, "error");

                                },
                                headers: {
                                    "X-Atlassian-Token": "no-check"     //To Fix XSFR Error
                                }
                            });
                        }
                    });
                }

            });

        }
    });
})();