// JS assets for plugin DisplayLayerProgress
(function () {
    try {
        // source: plugin/DisplayLayerProgress/js/DisplayLayerProgress.js
        /*
         * View model for DisplayLayerProgress
         *
         * Author: Olli
         * License: AGPLv3
         */
        $(function () {
            function DisplaylayerprogressViewModel(parameters) {
                var PLUGIN_ID = "DisplayLayerProgress";
                // enable support of resetSettings
                new ResetSettingsUtil().assignResetSettingsFeature(PLUGIN_ID, function(data){
                                        // assign new settings-values // TODO find a more generic way
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.showOnNavBar(data.showOnNavBar);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.showOnPrinterDisplay(data.showOnPrinterDisplay);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.showAllPrinterMessages(data.showAllPrinterMessages);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.navBarMessagePattern(data.navBarMessagePattern);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.printerDisplayMessagePattern(data.printerDisplayMessagePattern);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.printerDisplayScreenLocation(data.printerDisplayScreenLocation);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.printerDisplayWidth(data.printerDisplayWidth);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.addTrailingChar(data.addTrailingChar);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.layerExpressions(data.layerExpressions);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.showLayerInStatusBar(data.showLayerInStatusBar);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.showHeightInStatusBar(data.showHeightInStatusBar);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.updatePrinterDisplayWhilePrinting(data.updatePrinterDisplayWhilePrinting);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.feedrateFactor(data.feedrateFactor);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.feedrateFormat(data.feedrateFormat);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.debuggingEnabled(data.debuggingEnabled);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.layerAverageDurationCount(data.layerAverageDurationCount);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.layerAverageFormatPattern(data.layerAverageFormatPattern);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.zMaxExpressionPattern(data.zMaxExpressionPattern);
                });
        
                var self = this;
        
                // assign the injected parameters, e.g.:
                self.loginStateViewModel = parameters[0];
                self.settingsViewModel = parameters[1];
        
                self.navBarMessage = ko.observable();
        
                // startup
                self.onStartup = function () {
                    //alert("hallo");
                    var element = $("#state").find(".accordion-inner .progress");
                    if (element.length) {
                        var busyIndicator = " <i class='fa fa-spinner fa-spin busyIndicator' style='display:none'></i>";
        
                        // height
                        var label = gettext("Current Height");
                        var tooltip = gettext("Might be inaccurate!");
                        element.before("<span id='heightStateOutput' style='display:none'><span title='" + tooltip + "'>" + label + "</span>" + ": "
                            + "<strong id='state_height_message'>- / -</strong>"+busyIndicator+"  <br/></span>");
                        // layer
                        label = gettext("Layer");
                        tooltip = gettext("Shows the layer information");
                        element.before("<span id='layerStateOutput' style='display:none'> <span title='" + tooltip + "'>" + label + "</span>" + ": "
                            + "<strong id='state_layer_message'>- / -</strong>"+busyIndicator+"<br/></span>");
        
                        // call backend for update navbar and printer-display
                        OctoPrint.get("api/plugin/"+PLUGIN_ID);
                    }
        
                    $("#layerExpressionTextArea").numberedtextarea();
                };
        
                var printerDisplay = null;
                // receive data from server
                self.onDataUpdaterPluginMessage = function (plugin, data) {
        
                    if (plugin != PLUGIN_ID) {
                        return;
                    }
        
                    if (data.busy){
                        $(".busyIndicator").show();
                    } else {
                        $(".busyIndicator").hide();
                    }
        
                    // NavBar
                    if (data.navBarMessage){
                        self.navBarMessage(data.navBarMessage);
                    }
        
                    // visibility of height/layer in statebar
                    if (data.showHeightInStatusBar != null){
                        if(data.showHeightInStatusBar == true){
                            $("#heightStateOutput").show();
                        } else {
                            $("#heightStateOutput").hide();
                        }
                    }
                    if (data.showLayerInStatusBar != null){
                        if (data.showLayerInStatusBar == true){
                            $("#layerStateOutput").show();
                        } else {
                            $("#layerStateOutput").hide();
                        }
                    }
                    // State Layer
                    if (data.stateMessage){
                        var layerElement = document.getElementById("state_layer_message");
                        if (layerElement != null && data.stateMessage != null) {
                            layerElement.innerHTML = data.stateMessage;
                        }
                    }
                    // State Height
                    if (data.heightMessage){
                        var heightElement = document.getElementById("state_height_message");
                        if (heightElement != null && data.heightMessage != null) {
                            heightElement.innerHTML = data.heightMessage;
                        }
                    }
        			// Printer Display
                    if ( (printerDisplay == null && data.initPrinterDisplay) ||
                          data.initPrinterDisplay){
                        if (printerDisplay != null){
                            $("h4.ui-pnotify-title:contains('Printer Display')").parent().parent().remove();
                        }
                        //var stack_bar_bottom = {"dir1": "up", "dir2": "left", "spacing1": 0, "spacing2": 0};
                        var stack_bar_bottom = JSON.parse("{"+data.printerDisplayScreenLocation+"}");
                        printerDisplay = new PNotify({
                            title: 'Printer Display',
                            type: 'info',
                            width: data.printerDisplayWidth,
                            //addclass: "stack-bottomleft",
                            addclass: data.classDefinition,
                            stack: stack_bar_bottom,
                            hide: false
                            });
                    }
        			if (data.showDesktopPrinterDisplay && data.printerDisplay && printerDisplay != null){
                        printerDisplay.update({
                            text: '<h3 class="fontsforweb_fontid_507"><font color="lightblue" style="background-color:blue;">'+data.printerDisplay+'</font></h3>'
                        });
        			}
        
        			// NotificationMessages
        			if (data.notifyType){
        			    var notfiyType = data.notifyType;
        			    var notifyMessage = data.notifyMessage;
                        new PNotify({
                            title: 'Attention',
                            text: notifyMessage,
                            type: notfiyType,
                            hide: false
                            });
        
        			}
        
                };
        
                self.onBeforeBinding = function () {
                    self.settings = self.settingsViewModel.settings.plugins.DisplayLayerProgress;
                    // From server-settings to client-settings
                };
        
                self.onSettingsBeforeSave = function () {
                }
            }
        
            /* view model class, parameters for constructor, container to bind to
             * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
             * and a full list of the available options.
             */
            OCTOPRINT_VIEWMODELS.push({
                construct: DisplaylayerprogressViewModel,
                // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
                dependencies: ["loginStateViewModel", "settingsViewModel"],
                // Elements to bind to, e.g. #settings_plugin_DisplayLayerProgress, #tab_plugin_DisplayLayerProgress, ...
                //elements: [document.getElementById("progressinfo_plugin_navbar")]
                elements: [
                    document.getElementById("displayLayerProgress_plugin_navbar"),
                    document.getElementById("displayLayerProgress_plugin_settings")
                ]
            });
        });
        
        ;
        
        // source: plugin/DisplayLayerProgress/js/ResetSettingsUtil.js
        /**
         *
         */
        function ResetSettingsUtil(){
        
            var RESET_BUTTON_ID = "resetSettingsButton"
            var RESET_BUTTON_HTML = "<button id='"+RESET_BUTTON_ID+"' class='btn btn-warning' style='margin-right:3%'>Reset Settings</button>"
        
            this.assignResetSettingsFeature = function(PLUGIN_ID_string, mapSettingsToViewModel_function){
                var resetSettingsButtonFunction = function(){
                    var resetButton = $("#" + RESET_BUTTON_ID).hide();
                }
                // hide reset button when hidding settings. needed because of next dialog-shown event
                var settingsDialog = $("#settings_dialog");
                var settingsDialogDOMElement = settingsDialog.get(0);
        
                var eventObject = $._data(settingsDialogDOMElement, 'events');
                if (eventObject != undefined && eventObject.hide != undefined){
                    // already there, is it my function
                    if (eventObject.hide[0].handler.name != "resetSettingsButtonFunction"){
                        settingsDialog.on('hide', resetSettingsButtonFunction);
                    }
                } else {
                    settingsDialog.on('hide', resetSettingsButtonFunction);
                }
        
                // add click hook for own plugin the check if resetSettings is available
                var pluginSettingsLink = $("ul[id=settingsTabs] > li[id^=settings_plugin_"+PLUGIN_ID_string+"] > a[href^=\\#settings_plugin_"+PLUGIN_ID_string+"]:not([hooked="+PLUGIN_ID_string+"])");
                pluginSettingsLink.attr("hooked", PLUGIN_ID_string);
                pluginSettingsLink.click(function() {
                    // call backend, is resetSettingsButtonEnabled
                    // hide reset settings button
                    $.ajax({
                        url: API_BASEURL + "plugin/"+PLUGIN_ID_string+"?action=isResetSettingsEnabled",
                        type: "GET"
                    }).done(function( data ){
                        var resetButton = $("#" + RESET_BUTTON_ID);
                        if (data.enabled == "true"){
                            // build-button, if necessary
                            if (resetButton.length == 0){
                                // add button to page
                                $(".modal-footer > .aboutlink").after(RESET_BUTTON_HTML);
                                resetButton = $("#" + RESET_BUTTON_ID);
                            }
        
                            // add/update click action
                            resetButton.unbind( "click" );
                            resetButton.click(function() {
                                $.ajax({
                                    url: API_BASEURL + "plugin/"+PLUGIN_ID_string+"?action=resetSettings",
                                    type: "GET"
                                }).done(function( data ){
                                    new PNotify({
                                        title: "Default settings saved!",
                                        text: "The plugin-settings were now reseted to default values.<br>Please do a Browser reload (Strg+F5) to update all settings in the UI.",
                                        type: "info",
                                        hide: true
                                    });
        
                                    mapSettingsToViewModel_function(data);
                                });
                            });
        
                            resetButton.show();
                        } else {
                            if (resetButton.length != 0){
                                resetButton.hide();
                            }
                        }
                    });
                });
        
                // default behaviour -> hide reset button --> if not already assigned
                var otherSettingsLink = $("ul[id=settingsTabs] > li[id^=settings_] > a[href^=\\#settings_]:not([hooked])");
                if (otherSettingsLink.length != 0){
                    otherSettingsLink.attr("hooked", "otherSettings");
                    otherSettingsLink.click(resetSettingsButtonFunction);
                }
            }
        
        }
        
        ;
        
        // source: plugin/DisplayLayerProgress/js/jquery-numberedtextarea.js
        /*
         * NumberedTextarea - jQuery Plugin
         * Textarea with line numbering
         *
         * Copyright (c) 2015 Dariusz Arciszewski
         *
         * Requires: jQuery v2.0+
         *
         * Licensed under the GPL licenses:
         *   http://www.gnu.org/licenses/gpl.html
         */
        
        (function ($) {
        
            $.fn.numberedtextarea = function(options) {
        
                var settings = $.extend({
                    color:          null,        // Font color
                    borderColor:    null,        // Border color
                    class:          null,        // Add class to the 'numberedtextarea-wrapper'
                    allowTabChar:   false,       // If true Tab key creates indentation
                }, options);
        
                this.each(function() {
                    if(this.nodeName.toLowerCase() !== "textarea") {
                        console.log('This is not a <textarea>, so no way Jose...');
                        return false;
                    }
        
                    addWrapper(this, settings);
                    addLineNumbers(this, settings);
        
                    if(settings.allowTabChar) {
                        $(this).allowTabChar();
                    }
                });
        
                return this;
            };
        
            $.fn.allowTabChar = function() {
                if (this.jquery) {
                    this.each(function() {
                        if (this.nodeType == 1) {
                            var nodeName = this.nodeName.toLowerCase();
                            if (nodeName == "textarea" || (nodeName == "input" && this.type == "text")) {
                                allowTabChar(this);
                            }
                        }
                    })
                }
                return this;
            }
        
        
        
            function addWrapper(element, settings) {
                var wrapper = $('<div class="numberedtextarea-wrapper"></div>').insertAfter(element);
                $(element).detach().appendTo(wrapper);
            }
        
            function addLineNumbers(element, settings) {
                element = $(element);
        
                var wrapper = element.parents('.numberedtextarea-wrapper');
        
                // Get textarea styles to implement it on line numbers div
                var paddingLeft = parseFloat(element.css('padding-left'));
                var paddingTop = parseFloat(element.css('padding-top'));
                var paddingBottom = parseFloat(element.css('padding-bottom'));
        
                var lineNumbers = $('<div class="numberedtextarea-line-numbers"></div>').insertAfter(element);
        
                element.css({
                    paddingLeft: paddingLeft + lineNumbers.width() + 'px'
                }).on('input propertychange change keyup paste', function() {
                    renderLineNumbers(element, settings);
                }).on('scroll', function() {
                    scrollLineNumbers(element, settings);
                });
        
                lineNumbers.css({
                    paddingLeft: paddingLeft + 'px',
                    paddingTop: paddingTop + 'px',
                    lineHeight: element.css('line-height'),
                    fontFamily: element.css('font-family'),
                    width: lineNumbers.width() - paddingLeft + 'px',
                });
        
                element.trigger('change');
            }
        
            function renderLineNumbers(element, settings) {
                element = $(element);
        
                var linesDiv = element.parent().find('.numberedtextarea-line-numbers');
                var count = element.val().split("\n").length;
                var paddingBottom = parseFloat(element.css('padding-bottom'));
        
                linesDiv.find('.numberedtextarea-number').remove();
        
                for(i = 1; i<=count; i++) {
                    var line = $('<div class="numberedtextarea-number numberedtextarea-number-' + i + '">' + i + '</div>').appendTo(linesDiv);
        
                    if(i === count) {
                    	line.css('margin-bottom', paddingBottom + 'px');
                    }
                }
            }
        
            function scrollLineNumbers(element, settings) {
                element = $(element);
                var linesDiv = element.parent().find('.numberedtextarea-line-numbers');
                linesDiv.scrollTop(element.scrollTop());
            }
        
            function pasteIntoInput(el, text) {
                el.focus();
                if (typeof el.selectionStart == "number") {
                    var val = el.value;
                    var selStart = el.selectionStart;
                    el.value = val.slice(0, selStart) + text + val.slice(el.selectionEnd);
                    el.selectionEnd = el.selectionStart = selStart + text.length;
                } else if (typeof document.selection != "undefined") {
                    var textRange = document.selection.createRange();
                    textRange.text = text;
                    textRange.collapse(false);
                    textRange.select();
                }
            }
        
            function allowTabChar(el) {
                $(el).keydown(function(e) {
                    if (e.which == 9) {
                        pasteIntoInput(this, "\t");
                        return false;
                    }
                });
        
                // For Opera, which only allows suppression of keypress events, not keydown
                $(el).keypress(function(e) {
                    if (e.which == 9) {
                        return false;
                    }
                });
            }
        
        }(jQuery));
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin DisplayLayerProgress:", (error.stack || error));
    }
})();

// JS assets for plugin ScreenSquish
(function () {
    try {
        // source: plugin/ScreenSquish/js/squishsettings.js
        $(function() {
            function ScreenSquishViewModel(parameters) {
                var self = this;
        
                self.settings = parameters[0];
        
                self.override_version = ko.observable(false);
                self.show_override = ko.observable(true);
        
                self.onStartupComplete = function() {
                    new PNotify({
                        title: gettext("ScreenSquish Auto Off"),
                        text: gettext("ScreenSquish automatically turned itself off due to possible version incompatibility. It may need an update."),
                    });
                }
        
                self.onSettingsBeforeSave = function() {
                    version = '';
                    if (self.override_version()) {
                        version = $('span.version').text();
                    }
                    self.settings.settings.plugins.ScreenSquish.octoprint_max_version(version);
                    new PNotify({
                        title: gettext("ScreenSquish force enabled"),
                        text: gettext("This won't take effect until OctoPrint has been restarted.")
                    });
                }
            }
        
            OCTOPRINT_VIEWMODELS.push([
                ScreenSquishViewModel,
                ["settingsViewModel"],
                ["#screen_squish_settings"]
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin ScreenSquish:", (error.stack || error));
    }
})();

// JS assets for plugin active_filters
(function () {
    try {
        // source: plugin/active_filters/js/knockout.persist.js
        (function(ko) {
        
            // Don't crash on browsers that are missing localStorage
            if (typeof (localStorage) === "undefined") { return; }
        
            ko.extenders.persist = function(target, key) {
        
                var initialValue = target();
        
                // Load existing value from localStorage if set
                if (key && localStorage.getItem(key) !== null) {
                    try {
                        initialValue = JSON.parse(localStorage.getItem(key));
                    } catch (e) {
                    }
                }
                target(initialValue);
        
                // Subscribe to new values and add them to localStorage
                target.subscribe(function (newValue) {
                    localStorage.setItem(key, ko.toJSON(newValue));
                });
                return target;
        
            };
        
        })(ko);
        ;
        
        // source: plugin/active_filters/js/active_filters.js
        $(function() {
        	function activeFiltersPluginViewModel(viewModels) {
        		var self = this;
        		
        		self.onAfterBinding = function () {
        			terminal = viewModels[0];			
        			terminal.activeFilters = terminal.activeFilters.extend({ persist: 'terminal.activeFilters' });
        		}
        	}
        
        	OCTOPRINT_VIEWMODELS.push([
        		activeFiltersPluginViewModel, 
        		["terminalViewModel"],[]
        	]);
        });
        
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin active_filters:", (error.stack || error));
    }
})();

// JS assets for plugin cost
(function () {
    try {
        // source: plugin/cost/js/cost.js
        /*
         * View model for OctoPrint-Cost
         *
         * Author: Jan Szumiec
         * License: MIT
         */
        $(function() {
            function CostViewModel(parameters) {
                var printerState = parameters[0];
                var settingsState = parameters[1];
                var filesState = parameters[2];
                var self = this;
        
                // There must be a nicer way of doing this.
        	
        	settingsState.check_cost = ko.observable(true);
        
        	settingsState.costPerWeight = ko.pureComputed(function() {
        	  var currency = settingsState.settings.plugins.cost.currency();
        	  var weight = settingsState.settings.plugins.cost.weight();
        	  return currency + '/' + weight;
        	});
        	settingsState.costPerLength = ko.pureComputed(function() {
        	  var currency = settingsState.settings.plugins.cost.currency();
        	  var length = settingsState.settings.plugins.cost.length();
        	  return currency + '/' + length;
        	});
        	settingsState.costPerTime = ko.pureComputed(function() {
        	  var currency = settingsState.settings.plugins.cost.currency();
        	  var time = settingsState.settings.plugins.cost.time();
        	  return currency + '/' + time;
        	});
        	
                printerState.costString = ko.pureComputed(function() {
                    if (settingsState.settings === undefined) return '-';
                    if (printerState.filament().length == 0) return '-';
        
                    var currency = settingsState.settings.plugins.cost.currency();
        	    var cost_per_length = settingsState.settings.plugins.cost.cost_per_length();
        	    var cost_per_weight = settingsState.settings.plugins.cost.cost_per_weight();
        	    var density_of_filament = settingsState.settings.plugins.cost.density_of_filament();
                    var cost_per_time = settingsState.settings.plugins.cost.cost_per_time();
        
                    var filament_used_length = printerState.filament()[0].data().length / 1000;
        	    var filament_used_volume = printerState.filament()[0].data().volume / 1000;
                    var expected_time = printerState.estimatedPrintTime() / 3600;
        
        	    if (settingsState.check_cost()) {
        	      var totalCost = cost_per_weight * filament_used_volume * density_of_filament + expected_time * cost_per_time;
        	    }
        	    else {
        	      var totalCost = cost_per_length * filament_used_length + expected_time * cost_per_time;
        	    }
        
                    return '' + currency + totalCost.toFixed(2);
                });
        
                var originalGetAdditionalData = filesState.getAdditionalData;
                filesState.getAdditionalData = function(data) {
                    var output = originalGetAdditionalData(data);
        
                    if (data.hasOwnProperty('gcodeAnalysis')) {
                        var gcode = data.gcodeAnalysis;
                        if (gcode.hasOwnProperty('filament') && gcode.filament.hasOwnProperty('tool0') && gcode.hasOwnProperty('estimatedPrintTime')) {
                            var currency = settingsState.settings.plugins.cost.currency();
        		    var cost_per_length = settingsState.settings.plugins.cost.cost_per_length();
                            var cost_per_weight = settingsState.settings.plugins.cost.cost_per_weight();
        		    var density_of_filament = settingsState.settings.plugins.cost.density_of_filament();
                            var cost_per_time = settingsState.settings.plugins.cost.cost_per_time();
        
                            var filament_used_length = gcode.filament.tool0.length / 1000;
        		    var filament_used_volume = gcode.filament.tool0.volume / 1000;
                            var expected_time = gcode.estimatedPrintTime / 3600;
        
        		    if (settingsState.check_cost()) {
        		      var totalCost = cost_per_weight * filament_used_volume * density_of_filament + expected_time * cost_per_time;
        		    }
        		    else {
        		      var totalCost = cost_per_length * filament_used_length + expected_time * cost_per_time;
        		    }
        
                            output += gettext("Cost") + ": " + currency + totalCost.toFixed(2);
                        }
                    }
        
                    return output;
                };
        
                self.onStartup = function() {
                    var element = $("#state").find(".accordion-inner .progress");
                    if (element.length) {
                        var text = gettext("Cost");
                        element.before(text + ": <strong data-bind='text: costString'></strong><br>");
                    }
                };
        
            }
        
            // view model class, parameters for constructor, container to bind to
            OCTOPRINT_VIEWMODELS.push([
                CostViewModel,
                ["printerStateViewModel", "settingsViewModel", "gcodeFilesViewModel"],
                []
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin cost:", (error.stack || error));
    }
})();

// JS assets for plugin customControl
(function () {
    try {
        // source: plugin/customControl/js/jquery.ui.sortable.js
        /*! jQuery UI - v1.11.4 - 2015-08-30
        * http://jqueryui.com
        * Includes: core.js, widget.js, mouse.js, draggable.js, droppable.js, sortable.js
        * Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */
        
        (function( factory ) {
        	if ( typeof define === "function" && define.amd ) {
        
        		// AMD. Register as an anonymous module.
        		define([ "jquery" ], factory );
        	} else {
        
        		// Browser globals
        		factory( jQuery );
        	}
        }(function( $ ) {
        /*!
         * jQuery UI Core 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/category/ui-core/
         */
        
        
        // $.ui might exist from components with no dependencies, e.g., $.ui.position
        $.ui = $.ui || {};
        
        $.extend( $.ui, {
        	version: "1.11.4",
        
        	keyCode: {
        		BACKSPACE: 8,
        		COMMA: 188,
        		DELETE: 46,
        		DOWN: 40,
        		END: 35,
        		ENTER: 13,
        		ESCAPE: 27,
        		HOME: 36,
        		LEFT: 37,
        		PAGE_DOWN: 34,
        		PAGE_UP: 33,
        		PERIOD: 190,
        		RIGHT: 39,
        		SPACE: 32,
        		TAB: 9,
        		UP: 38
        	}
        });
        
        // plugins
        $.fn.extend({
        	scrollParent: function( includeHidden ) {
        		var position = this.css( "position" ),
        			excludeStaticParent = position === "absolute",
        			overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
        			scrollParent = this.parents().filter( function() {
        				var parent = $( this );
        				if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
        					return false;
        				}
        				return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
        			}).eq( 0 );
        
        		return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
        	},
        
        	uniqueId: (function() {
        		var uuid = 0;
        
        		return function() {
        			return this.each(function() {
        				if ( !this.id ) {
        					this.id = "ui-id-" + ( ++uuid );
        				}
        			});
        		};
        	})(),
        
        	removeUniqueId: function() {
        		return this.each(function() {
        			if ( /^ui-id-\d+$/.test( this.id ) ) {
        				$( this ).removeAttr( "id" );
        			}
        		});
        	}
        });
        
        // selectors
        function focusable( element, isTabIndexNotNaN ) {
        	var map, mapName, img,
        		nodeName = element.nodeName.toLowerCase();
        	if ( "area" === nodeName ) {
        		map = element.parentNode;
        		mapName = map.name;
        		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
        			return false;
        		}
        		img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
        		return !!img && visible( img );
        	}
        	return ( /^(input|select|textarea|button|object)$/.test( nodeName ) ?
        		!element.disabled :
        		"a" === nodeName ?
        			element.href || isTabIndexNotNaN :
        			isTabIndexNotNaN) &&
        		// the element and all of its ancestors must be visible
        		visible( element );
        }
        
        function visible( element ) {
        	return $.expr.filters.visible( element ) &&
        		!$( element ).parents().addBack().filter(function() {
        			return $.css( this, "visibility" ) === "hidden";
        		}).length;
        }
        
        $.extend( $.expr[ ":" ], {
        	data: $.expr.createPseudo ?
        		$.expr.createPseudo(function( dataName ) {
        			return function( elem ) {
        				return !!$.data( elem, dataName );
        			};
        		}) :
        		// support: jQuery <1.8
        		function( elem, i, match ) {
        			return !!$.data( elem, match[ 3 ] );
        		},
        
        	focusable: function( element ) {
        		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
        	},
        
        	tabbable: function( element ) {
        		var tabIndex = $.attr( element, "tabindex" ),
        			isTabIndexNaN = isNaN( tabIndex );
        		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
        	}
        });
        
        // support: jQuery <1.8
        if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
        	$.each( [ "Width", "Height" ], function( i, name ) {
        		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
        			type = name.toLowerCase(),
        			orig = {
        				innerWidth: $.fn.innerWidth,
        				innerHeight: $.fn.innerHeight,
        				outerWidth: $.fn.outerWidth,
        				outerHeight: $.fn.outerHeight
        			};
        
        		function reduce( elem, size, border, margin ) {
        			$.each( side, function() {
        				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
        				if ( border ) {
        					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
        				}
        				if ( margin ) {
        					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
        				}
        			});
        			return size;
        		}
        
        		$.fn[ "inner" + name ] = function( size ) {
        			if ( size === undefined ) {
        				return orig[ "inner" + name ].call( this );
        			}
        
        			return this.each(function() {
        				$( this ).css( type, reduce( this, size ) + "px" );
        			});
        		};
        
        		$.fn[ "outer" + name] = function( size, margin ) {
        			if ( typeof size !== "number" ) {
        				return orig[ "outer" + name ].call( this, size );
        			}
        
        			return this.each(function() {
        				$( this).css( type, reduce( this, size, true, margin ) + "px" );
        			});
        		};
        	});
        }
        
        // support: jQuery <1.8
        if ( !$.fn.addBack ) {
        	$.fn.addBack = function( selector ) {
        		return this.add( selector == null ?
        			this.prevObject : this.prevObject.filter( selector )
        		);
        	};
        }
        
        // support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
        if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
        	$.fn.removeData = (function( removeData ) {
        		return function( key ) {
        			if ( arguments.length ) {
        				return removeData.call( this, $.camelCase( key ) );
        			} else {
        				return removeData.call( this );
        			}
        		};
        	})( $.fn.removeData );
        }
        
        // deprecated
        $.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );
        
        $.fn.extend({
        	focus: (function( orig ) {
        		return function( delay, fn ) {
        			return typeof delay === "number" ?
        				this.each(function() {
        					var elem = this;
        					setTimeout(function() {
        						$( elem ).focus();
        						if ( fn ) {
        							fn.call( elem );
        						}
        					}, delay );
        				}) :
        				orig.apply( this, arguments );
        		};
        	})( $.fn.focus ),
        
        	disableSelection: (function() {
        		var eventType = "onselectstart" in document.createElement( "div" ) ?
        			"selectstart" :
        			"mousedown";
        
        		return function() {
        			return this.bind( eventType + ".ui-disableSelection", function( event ) {
        				event.preventDefault();
        			});
        		};
        	})(),
        
        	enableSelection: function() {
        		return this.unbind( ".ui-disableSelection" );
        	},
        
        	zIndex: function( zIndex ) {
        		if ( zIndex !== undefined ) {
        			return this.css( "zIndex", zIndex );
        		}
        
        		if ( this.length ) {
        			var elem = $( this[ 0 ] ), position, value;
        			while ( elem.length && elem[ 0 ] !== document ) {
        				// Ignore z-index if position is set to a value where z-index is ignored by the browser
        				// This makes behavior of this function consistent across browsers
        				// WebKit always returns auto if the element is positioned
        				position = elem.css( "position" );
        				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
        					// IE returns 0 when zIndex is not specified
        					// other browsers return a string
        					// we ignore the case of nested elements with an explicit value of 0
        					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
        					value = parseInt( elem.css( "zIndex" ), 10 );
        					if ( !isNaN( value ) && value !== 0 ) {
        						return value;
        					}
        				}
        				elem = elem.parent();
        			}
        		}
        
        		return 0;
        	}
        });
        
        // $.ui.plugin is deprecated. Use $.widget() extensions instead.
        $.ui.plugin = {
        	add: function( module, option, set ) {
        		var i,
        			proto = $.ui[ module ].prototype;
        		for ( i in set ) {
        			proto.plugins[ i ] = proto.plugins[ i ] || [];
        			proto.plugins[ i ].push( [ option, set[ i ] ] );
        		}
        	},
        	call: function( instance, name, args, allowDisconnected ) {
        		var i,
        			set = instance.plugins[ name ];
        
        		if ( !set ) {
        			return;
        		}
        
        		if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
        			return;
        		}
        
        		for ( i = 0; i < set.length; i++ ) {
        			if ( instance.options[ set[ i ][ 0 ] ] ) {
        				set[ i ][ 1 ].apply( instance.element, args );
        			}
        		}
        	}
        };
        
        
        /*!
         * jQuery UI Widget 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/jQuery.widget/
         */
        
        
        var widget_uuid = 0,
        	widget_slice = Array.prototype.slice;
        
        $.cleanData = (function( orig ) {
        	return function( elems ) {
        		var events, elem, i;
        		for ( i = 0; (elem = elems[i]) != null; i++ ) {
        			try {
        
        				// Only trigger remove when necessary to save time
        				events = $._data( elem, "events" );
        				if ( events && events.remove ) {
        					$( elem ).triggerHandler( "remove" );
        				}
        
        			// http://bugs.jquery.com/ticket/8235
        			} catch ( e ) {}
        		}
        		orig( elems );
        	};
        })( $.cleanData );
        
        $.widget = function( name, base, prototype ) {
        	var fullName, existingConstructor, constructor, basePrototype,
        		// proxiedPrototype allows the provided prototype to remain unmodified
        		// so that it can be used as a mixin for multiple widgets (#8876)
        		proxiedPrototype = {},
        		namespace = name.split( "." )[ 0 ];
        
        	name = name.split( "." )[ 1 ];
        	fullName = namespace + "-" + name;
        
        	if ( !prototype ) {
        		prototype = base;
        		base = $.Widget;
        	}
        
        	// create selector for plugin
        	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
        		return !!$.data( elem, fullName );
        	};
        
        	$[ namespace ] = $[ namespace ] || {};
        	existingConstructor = $[ namespace ][ name ];
        	constructor = $[ namespace ][ name ] = function( options, element ) {
        		// allow instantiation without "new" keyword
        		if ( !this._createWidget ) {
        			return new constructor( options, element );
        		}
        
        		// allow instantiation without initializing for simple inheritance
        		// must use "new" keyword (the code above always passes args)
        		if ( arguments.length ) {
        			this._createWidget( options, element );
        		}
        	};
        	// extend with the existing constructor to carry over any static properties
        	$.extend( constructor, existingConstructor, {
        		version: prototype.version,
        		// copy the object used to create the prototype in case we need to
        		// redefine the widget later
        		_proto: $.extend( {}, prototype ),
        		// track widgets that inherit from this widget in case this widget is
        		// redefined after a widget inherits from it
        		_childConstructors: []
        	});
        
        	basePrototype = new base();
        	// we need to make the options hash a property directly on the new instance
        	// otherwise we'll modify the options hash on the prototype that we're
        	// inheriting from
        	basePrototype.options = $.widget.extend( {}, basePrototype.options );
        	$.each( prototype, function( prop, value ) {
        		if ( !$.isFunction( value ) ) {
        			proxiedPrototype[ prop ] = value;
        			return;
        		}
        		proxiedPrototype[ prop ] = (function() {
        			var _super = function() {
        					return base.prototype[ prop ].apply( this, arguments );
        				},
        				_superApply = function( args ) {
        					return base.prototype[ prop ].apply( this, args );
        				};
        			return function() {
        				var __super = this._super,
        					__superApply = this._superApply,
        					returnValue;
        
        				this._super = _super;
        				this._superApply = _superApply;
        
        				returnValue = value.apply( this, arguments );
        
        				this._super = __super;
        				this._superApply = __superApply;
        
        				return returnValue;
        			};
        		})();
        	});
        	constructor.prototype = $.widget.extend( basePrototype, {
        		// TODO: remove support for widgetEventPrefix
        		// always use the name + a colon as the prefix, e.g., draggable:start
        		// don't prefix for widgets that aren't DOM-based
        		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
        	}, proxiedPrototype, {
        		constructor: constructor,
        		namespace: namespace,
        		widgetName: name,
        		widgetFullName: fullName
        	});
        
        	// If this widget is being redefined then we need to find all widgets that
        	// are inheriting from it and redefine all of them so that they inherit from
        	// the new version of this widget. We're essentially trying to replace one
        	// level in the prototype chain.
        	if ( existingConstructor ) {
        		$.each( existingConstructor._childConstructors, function( i, child ) {
        			var childPrototype = child.prototype;
        
        			// redefine the child widget using the same prototype that was
        			// originally used, but inherit from the new version of the base
        			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
        		});
        		// remove the list of existing child constructors from the old constructor
        		// so the old child constructors can be garbage collected
        		delete existingConstructor._childConstructors;
        	} else {
        		base._childConstructors.push( constructor );
        	}
        
        	$.widget.bridge( name, constructor );
        
        	return constructor;
        };
        
        $.widget.extend = function( target ) {
        	var input = widget_slice.call( arguments, 1 ),
        		inputIndex = 0,
        		inputLength = input.length,
        		key,
        		value;
        	for ( ; inputIndex < inputLength; inputIndex++ ) {
        		for ( key in input[ inputIndex ] ) {
        			value = input[ inputIndex ][ key ];
        			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
        				// Clone objects
        				if ( $.isPlainObject( value ) ) {
        					target[ key ] = $.isPlainObject( target[ key ] ) ?
        						$.widget.extend( {}, target[ key ], value ) :
        						// Don't extend strings, arrays, etc. with objects
        						$.widget.extend( {}, value );
        				// Copy everything else by reference
        				} else {
        					target[ key ] = value;
        				}
        			}
        		}
        	}
        	return target;
        };
        
        $.widget.bridge = function( name, object ) {
        	var fullName = object.prototype.widgetFullName || name;
        	$.fn[ name ] = function( options ) {
        		var isMethodCall = typeof options === "string",
        			args = widget_slice.call( arguments, 1 ),
        			returnValue = this;
        
        		if ( isMethodCall ) {
        			this.each(function() {
        				var methodValue,
        					instance = $.data( this, fullName );
        				if ( options === "instance" ) {
        					returnValue = instance;
        					return false;
        				}
        				if ( !instance ) {
        					return $.error( "cannot call methods on " + name + " prior to initialization; " +
        						"attempted to call method '" + options + "'" );
        				}
        				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
        					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
        				}
        				methodValue = instance[ options ].apply( instance, args );
        				if ( methodValue !== instance && methodValue !== undefined ) {
        					returnValue = methodValue && methodValue.jquery ?
        						returnValue.pushStack( methodValue.get() ) :
        						methodValue;
        					return false;
        				}
        			});
        		} else {
        
        			// Allow multiple hashes to be passed on init
        			if ( args.length ) {
        				options = $.widget.extend.apply( null, [ options ].concat(args) );
        			}
        
        			this.each(function() {
        				var instance = $.data( this, fullName );
        				if ( instance ) {
        					instance.option( options || {} );
        					if ( instance._init ) {
        						instance._init();
        					}
        				} else {
        					$.data( this, fullName, new object( options, this ) );
        				}
        			});
        		}
        
        		return returnValue;
        	};
        };
        
        $.Widget = function( /* options, element */ ) {};
        $.Widget._childConstructors = [];
        
        $.Widget.prototype = {
        	widgetName: "widget",
        	widgetEventPrefix: "",
        	defaultElement: "<div>",
        	options: {
        		disabled: false,
        
        		// callbacks
        		create: null
        	},
        	_createWidget: function( options, element ) {
        		element = $( element || this.defaultElement || this )[ 0 ];
        		this.element = $( element );
        		this.uuid = widget_uuid++;
        		this.eventNamespace = "." + this.widgetName + this.uuid;
        
        		this.bindings = $();
        		this.hoverable = $();
        		this.focusable = $();
        
        		if ( element !== this ) {
        			$.data( element, this.widgetFullName, this );
        			this._on( true, this.element, {
        				remove: function( event ) {
        					if ( event.target === element ) {
        						this.destroy();
        					}
        				}
        			});
        			this.document = $( element.style ?
        				// element within the document
        				element.ownerDocument :
        				// element is window or document
        				element.document || element );
        			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
        		}
        
        		this.options = $.widget.extend( {},
        			this.options,
        			this._getCreateOptions(),
        			options );
        
        		this._create();
        		this._trigger( "create", null, this._getCreateEventData() );
        		this._init();
        	},
        	_getCreateOptions: $.noop,
        	_getCreateEventData: $.noop,
        	_create: $.noop,
        	_init: $.noop,
        
        	destroy: function() {
        		this._destroy();
        		// we can probably remove the unbind calls in 2.0
        		// all event bindings should go through this._on()
        		this.element
        			.unbind( this.eventNamespace )
        			.removeData( this.widgetFullName )
        			// support: jquery <1.6.3
        			// http://bugs.jquery.com/ticket/9413
        			.removeData( $.camelCase( this.widgetFullName ) );
        		this.widget()
        			.unbind( this.eventNamespace )
        			.removeAttr( "aria-disabled" )
        			.removeClass(
        				this.widgetFullName + "-disabled " +
        				"ui-state-disabled" );
        
        		// clean up events and states
        		this.bindings.unbind( this.eventNamespace );
        		this.hoverable.removeClass( "ui-state-hover" );
        		this.focusable.removeClass( "ui-state-focus" );
        	},
        	_destroy: $.noop,
        
        	widget: function() {
        		return this.element;
        	},
        
        	option: function( key, value ) {
        		var options = key,
        			parts,
        			curOption,
        			i;
        
        		if ( arguments.length === 0 ) {
        			// don't return a reference to the internal hash
        			return $.widget.extend( {}, this.options );
        		}
        
        		if ( typeof key === "string" ) {
        			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
        			options = {};
        			parts = key.split( "." );
        			key = parts.shift();
        			if ( parts.length ) {
        				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
        				for ( i = 0; i < parts.length - 1; i++ ) {
        					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
        					curOption = curOption[ parts[ i ] ];
        				}
        				key = parts.pop();
        				if ( arguments.length === 1 ) {
        					return curOption[ key ] === undefined ? null : curOption[ key ];
        				}
        				curOption[ key ] = value;
        			} else {
        				if ( arguments.length === 1 ) {
        					return this.options[ key ] === undefined ? null : this.options[ key ];
        				}
        				options[ key ] = value;
        			}
        		}
        
        		this._setOptions( options );
        
        		return this;
        	},
        	_setOptions: function( options ) {
        		var key;
        
        		for ( key in options ) {
        			this._setOption( key, options[ key ] );
        		}
        
        		return this;
        	},
        	_setOption: function( key, value ) {
        		this.options[ key ] = value;
        
        		if ( key === "disabled" ) {
        			this.widget()
        				.toggleClass( this.widgetFullName + "-disabled", !!value );
        
        			// If the widget is becoming disabled, then nothing is interactive
        			if ( value ) {
        				this.hoverable.removeClass( "ui-state-hover" );
        				this.focusable.removeClass( "ui-state-focus" );
        			}
        		}
        
        		return this;
        	},
        
        	enable: function() {
        		return this._setOptions({ disabled: false });
        	},
        	disable: function() {
        		return this._setOptions({ disabled: true });
        	},
        
        	_on: function( suppressDisabledCheck, element, handlers ) {
        		var delegateElement,
        			instance = this;
        
        		// no suppressDisabledCheck flag, shuffle arguments
        		if ( typeof suppressDisabledCheck !== "boolean" ) {
        			handlers = element;
        			element = suppressDisabledCheck;
        			suppressDisabledCheck = false;
        		}
        
        		// no element argument, shuffle and use this.element
        		if ( !handlers ) {
        			handlers = element;
        			element = this.element;
        			delegateElement = this.widget();
        		} else {
        			element = delegateElement = $( element );
        			this.bindings = this.bindings.add( element );
        		}
        
        		$.each( handlers, function( event, handler ) {
        			function handlerProxy() {
        				// allow widgets to customize the disabled handling
        				// - disabled as an array instead of boolean
        				// - disabled class as method for disabling individual parts
        				if ( !suppressDisabledCheck &&
        						( instance.options.disabled === true ||
        							$( this ).hasClass( "ui-state-disabled" ) ) ) {
        					return;
        				}
        				return ( typeof handler === "string" ? instance[ handler ] : handler )
        					.apply( instance, arguments );
        			}
        
        			// copy the guid so direct unbinding works
        			if ( typeof handler !== "string" ) {
        				handlerProxy.guid = handler.guid =
        					handler.guid || handlerProxy.guid || $.guid++;
        			}
        
        			var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
        				eventName = match[1] + instance.eventNamespace,
        				selector = match[2];
        			if ( selector ) {
        				delegateElement.delegate( selector, eventName, handlerProxy );
        			} else {
        				element.bind( eventName, handlerProxy );
        			}
        		});
        	},
        
        	_off: function( element, eventName ) {
        		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) +
        			this.eventNamespace;
        		element.unbind( eventName ).undelegate( eventName );
        
        		// Clear the stack to avoid memory leaks (#10056)
        		this.bindings = $( this.bindings.not( element ).get() );
        		this.focusable = $( this.focusable.not( element ).get() );
        		this.hoverable = $( this.hoverable.not( element ).get() );
        	},
        
        	_delay: function( handler, delay ) {
        		function handlerProxy() {
        			return ( typeof handler === "string" ? instance[ handler ] : handler )
        				.apply( instance, arguments );
        		}
        		var instance = this;
        		return setTimeout( handlerProxy, delay || 0 );
        	},
        
        	_hoverable: function( element ) {
        		this.hoverable = this.hoverable.add( element );
        		this._on( element, {
        			mouseenter: function( event ) {
        				$( event.currentTarget ).addClass( "ui-state-hover" );
        			},
        			mouseleave: function( event ) {
        				$( event.currentTarget ).removeClass( "ui-state-hover" );
        			}
        		});
        	},
        
        	_focusable: function( element ) {
        		this.focusable = this.focusable.add( element );
        		this._on( element, {
        			focusin: function( event ) {
        				$( event.currentTarget ).addClass( "ui-state-focus" );
        			},
        			focusout: function( event ) {
        				$( event.currentTarget ).removeClass( "ui-state-focus" );
        			}
        		});
        	},
        
        	_trigger: function( type, event, data ) {
        		var prop, orig,
        			callback = this.options[ type ];
        
        		data = data || {};
        		event = $.Event( event );
        		event.type = ( type === this.widgetEventPrefix ?
        			type :
        			this.widgetEventPrefix + type ).toLowerCase();
        		// the original event may come from any element
        		// so we need to reset the target on the new event
        		event.target = this.element[ 0 ];
        
        		// copy original event properties over to the new event
        		orig = event.originalEvent;
        		if ( orig ) {
        			for ( prop in orig ) {
        				if ( !( prop in event ) ) {
        					event[ prop ] = orig[ prop ];
        				}
        			}
        		}
        
        		this.element.trigger( event, data );
        		return !( $.isFunction( callback ) &&
        			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
        			event.isDefaultPrevented() );
        	}
        };
        
        $.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
        	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
        		if ( typeof options === "string" ) {
        			options = { effect: options };
        		}
        		var hasOptions,
        			effectName = !options ?
        				method :
        				options === true || typeof options === "number" ?
        					defaultEffect :
        					options.effect || defaultEffect;
        		options = options || {};
        		if ( typeof options === "number" ) {
        			options = { duration: options };
        		}
        		hasOptions = !$.isEmptyObject( options );
        		options.complete = callback;
        		if ( options.delay ) {
        			element.delay( options.delay );
        		}
        		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
        			element[ method ]( options );
        		} else if ( effectName !== method && element[ effectName ] ) {
        			element[ effectName ]( options.duration, options.easing, callback );
        		} else {
        			element.queue(function( next ) {
        				$( this )[ method ]();
        				if ( callback ) {
        					callback.call( element[ 0 ] );
        				}
        				next();
        			});
        		}
        	};
        });
        
        var widget = $.widget;
        
        
        /*!
         * jQuery UI Mouse 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/mouse/
         */
        
        
        var mouseHandled = false;
        $( document ).mouseup( function() {
        	mouseHandled = false;
        });
        
        var mouse = $.widget("ui.mouse", {
        	version: "1.11.4",
        	options: {
        		cancel: "input,textarea,button,select,option",
        		distance: 1,
        		delay: 0
        	},
        	_mouseInit: function() {
        		var that = this;
        
        		this.element
        			.bind("mousedown." + this.widgetName, function(event) {
        				return that._mouseDown(event);
        			})
        			.bind("click." + this.widgetName, function(event) {
        				if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
        					$.removeData(event.target, that.widgetName + ".preventClickEvent");
        					event.stopImmediatePropagation();
        					return false;
        				}
        			});
        
        		this.started = false;
        	},
        
        	// TODO: make sure destroying one instance of mouse doesn't mess with
        	// other instances of mouse
        	_mouseDestroy: function() {
        		this.element.unbind("." + this.widgetName);
        		if ( this._mouseMoveDelegate ) {
        			this.document
        				.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate)
        				.unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
        		}
        	},
        
        	_mouseDown: function(event) {
        		// don't let more than one widget handle mouseStart
        		if ( mouseHandled ) {
        			return;
        		}
        
        		this._mouseMoved = false;
        
        		// we may have missed mouseup (out of window)
        		(this._mouseStarted && this._mouseUp(event));
        
        		this._mouseDownEvent = event;
        
        		var that = this,
        			btnIsLeft = (event.which === 1),
        			// event.target.nodeName works around a bug in IE 8 with
        			// disabled inputs (#7620)
        			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
        		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
        			return true;
        		}
        
        		this.mouseDelayMet = !this.options.delay;
        		if (!this.mouseDelayMet) {
        			this._mouseDelayTimer = setTimeout(function() {
        				that.mouseDelayMet = true;
        			}, this.options.delay);
        		}
        
        		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
        			this._mouseStarted = (this._mouseStart(event) !== false);
        			if (!this._mouseStarted) {
        				event.preventDefault();
        				return true;
        			}
        		}
        
        		// Click event may never have fired (Gecko & Opera)
        		if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
        			$.removeData(event.target, this.widgetName + ".preventClickEvent");
        		}
        
        		// these delegates are required to keep context
        		this._mouseMoveDelegate = function(event) {
        			return that._mouseMove(event);
        		};
        		this._mouseUpDelegate = function(event) {
        			return that._mouseUp(event);
        		};
        
        		this.document
        			.bind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
        			.bind( "mouseup." + this.widgetName, this._mouseUpDelegate );
        
        		event.preventDefault();
        
        		mouseHandled = true;
        		return true;
        	},
        
        	_mouseMove: function(event) {
        		// Only check for mouseups outside the document if you've moved inside the document
        		// at least once. This prevents the firing of mouseup in the case of IE<9, which will
        		// fire a mousemove event if content is placed under the cursor. See #7778
        		// Support: IE <9
        		if ( this._mouseMoved ) {
        			// IE mouseup check - mouseup happened when mouse was out of window
        			if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
        				return this._mouseUp(event);
        
        			// Iframe mouseup check - mouseup occurred in another document
        			} else if ( !event.which ) {
        				return this._mouseUp( event );
        			}
        		}
        
        		if ( event.which || event.button ) {
        			this._mouseMoved = true;
        		}
        
        		if (this._mouseStarted) {
        			this._mouseDrag(event);
        			return event.preventDefault();
        		}
        
        		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
        			this._mouseStarted =
        				(this._mouseStart(this._mouseDownEvent, event) !== false);
        			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
        		}
        
        		return !this._mouseStarted;
        	},
        
        	_mouseUp: function(event) {
        		this.document
        			.unbind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
        			.unbind( "mouseup." + this.widgetName, this._mouseUpDelegate );
        
        		if (this._mouseStarted) {
        			this._mouseStarted = false;
        
        			if (event.target === this._mouseDownEvent.target) {
        				$.data(event.target, this.widgetName + ".preventClickEvent", true);
        			}
        
        			this._mouseStop(event);
        		}
        
        		mouseHandled = false;
        		return false;
        	},
        
        	_mouseDistanceMet: function(event) {
        		return (Math.max(
        				Math.abs(this._mouseDownEvent.pageX - event.pageX),
        				Math.abs(this._mouseDownEvent.pageY - event.pageY)
        			) >= this.options.distance
        		);
        	},
        
        	_mouseDelayMet: function(/* event */) {
        		return this.mouseDelayMet;
        	},
        
        	// These are placeholder methods, to be overriden by extending plugin
        	_mouseStart: function(/* event */) {},
        	_mouseDrag: function(/* event */) {},
        	_mouseStop: function(/* event */) {},
        	_mouseCapture: function(/* event */) { return true; }
        });
        
        
        /*!
         * jQuery UI Draggable 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/draggable/
         */
        
        
        $.widget("ui.draggable", $.ui.mouse, {
        	version: "1.11.4",
        	widgetEventPrefix: "drag",
        	options: {
        		addClasses: true,
        		appendTo: "parent",
        		axis: false,
        		connectToSortable: false,
        		containment: false,
        		cursor: "auto",
        		cursorAt: false,
        		grid: false,
        		handle: false,
        		helper: "original",
        		iframeFix: false,
        		opacity: false,
        		refreshPositions: false,
        		revert: false,
        		revertDuration: 500,
        		scope: "default",
        		scroll: true,
        		scrollSensitivity: 20,
        		scrollSpeed: 20,
        		snap: false,
        		snapMode: "both",
        		snapTolerance: 20,
        		stack: false,
        		zIndex: false,
        
        		// callbacks
        		drag: null,
        		start: null,
        		stop: null
        	},
        	_create: function() {
        
        		if ( this.options.helper === "original" ) {
        			this._setPositionRelative();
        		}
        		if (this.options.addClasses){
        			this.element.addClass("ui-draggable");
        		}
        		if (this.options.disabled){
        			this.element.addClass("ui-draggable-disabled");
        		}
        		this._setHandleClassName();
        
        		this._mouseInit();
        	},
        
        	_setOption: function( key, value ) {
        		this._super( key, value );
        		if ( key === "handle" ) {
        			this._removeHandleClassName();
        			this._setHandleClassName();
        		}
        	},
        
        	_destroy: function() {
        		if ( ( this.helper || this.element ).is( ".ui-draggable-dragging" ) ) {
        			this.destroyOnClear = true;
        			return;
        		}
        		this.element.removeClass( "ui-draggable ui-draggable-dragging ui-draggable-disabled" );
        		this._removeHandleClassName();
        		this._mouseDestroy();
        	},
        
        	_mouseCapture: function(event) {
        		var o = this.options;
        
        		this._blurActiveElement( event );
        
        		// among others, prevent a drag on a resizable-handle
        		if (this.helper || o.disabled || $(event.target).closest(".ui-resizable-handle").length > 0) {
        			return false;
        		}
        
        		//Quit if we're not on a valid handle
        		this.handle = this._getHandle(event);
        		if (!this.handle) {
        			return false;
        		}
        
        		this._blockFrames( o.iframeFix === true ? "iframe" : o.iframeFix );
        
        		return true;
        
        	},
        
        	_blockFrames: function( selector ) {
        		this.iframeBlocks = this.document.find( selector ).map(function() {
        			var iframe = $( this );
        
        			return $( "<div>" )
        				.css( "position", "absolute" )
        				.appendTo( iframe.parent() )
        				.outerWidth( iframe.outerWidth() )
        				.outerHeight( iframe.outerHeight() )
        				.offset( iframe.offset() )[ 0 ];
        		});
        	},
        
        	_unblockFrames: function() {
        		if ( this.iframeBlocks ) {
        			this.iframeBlocks.remove();
        			delete this.iframeBlocks;
        		}
        	},
        
        	_blurActiveElement: function( event ) {
        		var document = this.document[ 0 ];
        
        		// Only need to blur if the event occurred on the draggable itself, see #10527
        		if ( !this.handleElement.is( event.target ) ) {
        			return;
        		}
        
        		// support: IE9
        		// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
        		try {
        
        			// Support: IE9, IE10
        			// If the <body> is blurred, IE will switch windows, see #9520
        			if ( document.activeElement && document.activeElement.nodeName.toLowerCase() !== "body" ) {
        
        				// Blur any element that currently has focus, see #4261
        				$( document.activeElement ).blur();
        			}
        		} catch ( error ) {}
        	},
        
        	_mouseStart: function(event) {
        
        		var o = this.options;
        
        		//Create and append the visible helper
        		this.helper = this._createHelper(event);
        
        		this.helper.addClass("ui-draggable-dragging");
        
        		//Cache the helper size
        		this._cacheHelperProportions();
        
        		//If ddmanager is used for droppables, set the global draggable
        		if ($.ui.ddmanager) {
        			$.ui.ddmanager.current = this;
        		}
        
        		/*
        		 * - Position generation -
        		 * This block generates everything position related - it's the core of draggables.
        		 */
        
        		//Cache the margins of the original element
        		this._cacheMargins();
        
        		//Store the helper's css position
        		this.cssPosition = this.helper.css( "position" );
        		this.scrollParent = this.helper.scrollParent( true );
        		this.offsetParent = this.helper.offsetParent();
        		this.hasFixedAncestor = this.helper.parents().filter(function() {
        				return $( this ).css( "position" ) === "fixed";
        			}).length > 0;
        
        		//The element's absolute position on the page minus margins
        		this.positionAbs = this.element.offset();
        		this._refreshOffsets( event );
        
        		//Generate the original position
        		this.originalPosition = this.position = this._generatePosition( event, false );
        		this.originalPageX = event.pageX;
        		this.originalPageY = event.pageY;
        
        		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
        		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));
        
        		//Set a containment if given in the options
        		this._setContainment();
        
        		//Trigger event + callbacks
        		if (this._trigger("start", event) === false) {
        			this._clear();
        			return false;
        		}
        
        		//Recache the helper size
        		this._cacheHelperProportions();
        
        		//Prepare the droppable offsets
        		if ($.ui.ddmanager && !o.dropBehaviour) {
        			$.ui.ddmanager.prepareOffsets(this, event);
        		}
        
        		// Reset helper's right/bottom css if they're set and set explicit width/height instead
        		// as this prevents resizing of elements with right/bottom set (see #7772)
        		this._normalizeRightBottom();
        
        		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position
        
        		//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
        		if ( $.ui.ddmanager ) {
        			$.ui.ddmanager.dragStart(this, event);
        		}
        
        		return true;
        	},
        
        	_refreshOffsets: function( event ) {
        		this.offset = {
        			top: this.positionAbs.top - this.margins.top,
        			left: this.positionAbs.left - this.margins.left,
        			scroll: false,
        			parent: this._getParentOffset(),
        			relative: this._getRelativeOffset()
        		};
        
        		this.offset.click = {
        			left: event.pageX - this.offset.left,
        			top: event.pageY - this.offset.top
        		};
        	},
        
        	_mouseDrag: function(event, noPropagation) {
        		// reset any necessary cached properties (see #5009)
        		if ( this.hasFixedAncestor ) {
        			this.offset.parent = this._getParentOffset();
        		}
        
        		//Compute the helpers position
        		this.position = this._generatePosition( event, true );
        		this.positionAbs = this._convertPositionTo("absolute");
        
        		//Call plugins and callbacks and use the resulting position if something is returned
        		if (!noPropagation) {
        			var ui = this._uiHash();
        			if (this._trigger("drag", event, ui) === false) {
        				this._mouseUp({});
        				return false;
        			}
        			this.position = ui.position;
        		}
        
        		this.helper[ 0 ].style.left = this.position.left + "px";
        		this.helper[ 0 ].style.top = this.position.top + "px";
        
        		if ($.ui.ddmanager) {
        			$.ui.ddmanager.drag(this, event);
        		}
        
        		return false;
        	},
        
        	_mouseStop: function(event) {
        
        		//If we are using droppables, inform the manager about the drop
        		var that = this,
        			dropped = false;
        		if ($.ui.ddmanager && !this.options.dropBehaviour) {
        			dropped = $.ui.ddmanager.drop(this, event);
        		}
        
        		//if a drop comes from outside (a sortable)
        		if (this.dropped) {
        			dropped = this.dropped;
        			this.dropped = false;
        		}
        
        		if ((this.options.revert === "invalid" && !dropped) || (this.options.revert === "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
        			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
        				if (that._trigger("stop", event) !== false) {
        					that._clear();
        				}
        			});
        		} else {
        			if (this._trigger("stop", event) !== false) {
        				this._clear();
        			}
        		}
        
        		return false;
        	},
        
        	_mouseUp: function( event ) {
        		this._unblockFrames();
        
        		//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
        		if ( $.ui.ddmanager ) {
        			$.ui.ddmanager.dragStop(this, event);
        		}
        
        		// Only need to focus if the event occurred on the draggable itself, see #10527
        		if ( this.handleElement.is( event.target ) ) {
        			// The interaction is over; whether or not the click resulted in a drag, focus the element
        			this.element.focus();
        		}
        
        		return $.ui.mouse.prototype._mouseUp.call(this, event);
        	},
        
        	cancel: function() {
        
        		if (this.helper.is(".ui-draggable-dragging")) {
        			this._mouseUp({});
        		} else {
        			this._clear();
        		}
        
        		return this;
        
        	},
        
        	_getHandle: function(event) {
        		return this.options.handle ?
        			!!$( event.target ).closest( this.element.find( this.options.handle ) ).length :
        			true;
        	},
        
        	_setHandleClassName: function() {
        		this.handleElement = this.options.handle ?
        			this.element.find( this.options.handle ) : this.element;
        		this.handleElement.addClass( "ui-draggable-handle" );
        	},
        
        	_removeHandleClassName: function() {
        		this.handleElement.removeClass( "ui-draggable-handle" );
        	},
        
        	_createHelper: function(event) {
        
        		var o = this.options,
        			helperIsFunction = $.isFunction( o.helper ),
        			helper = helperIsFunction ?
        				$( o.helper.apply( this.element[ 0 ], [ event ] ) ) :
        				( o.helper === "clone" ?
        					this.element.clone().removeAttr( "id" ) :
        					this.element );
        
        		if (!helper.parents("body").length) {
        			helper.appendTo((o.appendTo === "parent" ? this.element[0].parentNode : o.appendTo));
        		}
        
        		// http://bugs.jqueryui.com/ticket/9446
        		// a helper function can return the original element
        		// which wouldn't have been set to relative in _create
        		if ( helperIsFunction && helper[ 0 ] === this.element[ 0 ] ) {
        			this._setPositionRelative();
        		}
        
        		if (helper[0] !== this.element[0] && !(/(fixed|absolute)/).test(helper.css("position"))) {
        			helper.css("position", "absolute");
        		}
        
        		return helper;
        
        	},
        
        	_setPositionRelative: function() {
        		if ( !( /^(?:r|a|f)/ ).test( this.element.css( "position" ) ) ) {
        			this.element[ 0 ].style.position = "relative";
        		}
        	},
        
        	_adjustOffsetFromHelper: function(obj) {
        		if (typeof obj === "string") {
        			obj = obj.split(" ");
        		}
        		if ($.isArray(obj)) {
        			obj = { left: +obj[0], top: +obj[1] || 0 };
        		}
        		if ("left" in obj) {
        			this.offset.click.left = obj.left + this.margins.left;
        		}
        		if ("right" in obj) {
        			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
        		}
        		if ("top" in obj) {
        			this.offset.click.top = obj.top + this.margins.top;
        		}
        		if ("bottom" in obj) {
        			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
        		}
        	},
        
        	_isRootNode: function( element ) {
        		return ( /(html|body)/i ).test( element.tagName ) || element === this.document[ 0 ];
        	},
        
        	_getParentOffset: function() {
        
        		//Get the offsetParent and cache its position
        		var po = this.offsetParent.offset(),
        			document = this.document[ 0 ];
        
        		// This is a special case where we need to modify a offset calculated on start, since the following happened:
        		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
        		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
        		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
        		if (this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
        			po.left += this.scrollParent.scrollLeft();
        			po.top += this.scrollParent.scrollTop();
        		}
        
        		if ( this._isRootNode( this.offsetParent[ 0 ] ) ) {
        			po = { top: 0, left: 0 };
        		}
        
        		return {
        			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
        			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
        		};
        
        	},
        
        	_getRelativeOffset: function() {
        		if ( this.cssPosition !== "relative" ) {
        			return { top: 0, left: 0 };
        		}
        
        		var p = this.element.position(),
        			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );
        
        		return {
        			top: p.top - ( parseInt(this.helper.css( "top" ), 10) || 0 ) + ( !scrollIsRootNode ? this.scrollParent.scrollTop() : 0 ),
        			left: p.left - ( parseInt(this.helper.css( "left" ), 10) || 0 ) + ( !scrollIsRootNode ? this.scrollParent.scrollLeft() : 0 )
        		};
        
        	},
        
        	_cacheMargins: function() {
        		this.margins = {
        			left: (parseInt(this.element.css("marginLeft"), 10) || 0),
        			top: (parseInt(this.element.css("marginTop"), 10) || 0),
        			right: (parseInt(this.element.css("marginRight"), 10) || 0),
        			bottom: (parseInt(this.element.css("marginBottom"), 10) || 0)
        		};
        	},
        
        	_cacheHelperProportions: function() {
        		this.helperProportions = {
        			width: this.helper.outerWidth(),
        			height: this.helper.outerHeight()
        		};
        	},
        
        	_setContainment: function() {
        
        		var isUserScrollable, c, ce,
        			o = this.options,
        			document = this.document[ 0 ];
        
        		this.relativeContainer = null;
        
        		if ( !o.containment ) {
        			this.containment = null;
        			return;
        		}
        
        		if ( o.containment === "window" ) {
        			this.containment = [
        				$( window ).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
        				$( window ).scrollTop() - this.offset.relative.top - this.offset.parent.top,
        				$( window ).scrollLeft() + $( window ).width() - this.helperProportions.width - this.margins.left,
        				$( window ).scrollTop() + ( $( window ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
        			];
        			return;
        		}
        
        		if ( o.containment === "document") {
        			this.containment = [
        				0,
        				0,
        				$( document ).width() - this.helperProportions.width - this.margins.left,
        				( $( document ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
        			];
        			return;
        		}
        
        		if ( o.containment.constructor === Array ) {
        			this.containment = o.containment;
        			return;
        		}
        
        		if ( o.containment === "parent" ) {
        			o.containment = this.helper[ 0 ].parentNode;
        		}
        
        		c = $( o.containment );
        		ce = c[ 0 ];
        
        		if ( !ce ) {
        			return;
        		}
        
        		isUserScrollable = /(scroll|auto)/.test( c.css( "overflow" ) );
        
        		this.containment = [
        			( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
        			( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingTop" ), 10 ) || 0 ),
        			( isUserScrollable ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth ) -
        				( parseInt( c.css( "borderRightWidth" ), 10 ) || 0 ) -
        				( parseInt( c.css( "paddingRight" ), 10 ) || 0 ) -
        				this.helperProportions.width -
        				this.margins.left -
        				this.margins.right,
        			( isUserScrollable ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight ) -
        				( parseInt( c.css( "borderBottomWidth" ), 10 ) || 0 ) -
        				( parseInt( c.css( "paddingBottom" ), 10 ) || 0 ) -
        				this.helperProportions.height -
        				this.margins.top -
        				this.margins.bottom
        		];
        		this.relativeContainer = c;
        	},
        
        	_convertPositionTo: function(d, pos) {
        
        		if (!pos) {
        			pos = this.position;
        		}
        
        		var mod = d === "absolute" ? 1 : -1,
        			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );
        
        		return {
        			top: (
        				pos.top	+																// The absolute mouse position
        				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.top * mod -										// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.offset.scroll.top : ( scrollIsRootNode ? 0 : this.offset.scroll.top ) ) * mod)
        			),
        			left: (
        				pos.left +																// The absolute mouse position
        				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.offset.scroll.left : ( scrollIsRootNode ? 0 : this.offset.scroll.left ) ) * mod)
        			)
        		};
        
        	},
        
        	_generatePosition: function( event, constrainPosition ) {
        
        		var containment, co, top, left,
        			o = this.options,
        			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] ),
        			pageX = event.pageX,
        			pageY = event.pageY;
        
        		// Cache the scroll
        		if ( !scrollIsRootNode || !this.offset.scroll ) {
        			this.offset.scroll = {
        				top: this.scrollParent.scrollTop(),
        				left: this.scrollParent.scrollLeft()
        			};
        		}
        
        		/*
        		 * - Position constraining -
        		 * Constrain the position to a mix of grid, containment.
        		 */
        
        		// If we are not dragging yet, we won't check for options
        		if ( constrainPosition ) {
        			if ( this.containment ) {
        				if ( this.relativeContainer ){
        					co = this.relativeContainer.offset();
        					containment = [
        						this.containment[ 0 ] + co.left,
        						this.containment[ 1 ] + co.top,
        						this.containment[ 2 ] + co.left,
        						this.containment[ 3 ] + co.top
        					];
        				} else {
        					containment = this.containment;
        				}
        
        				if (event.pageX - this.offset.click.left < containment[0]) {
        					pageX = containment[0] + this.offset.click.left;
        				}
        				if (event.pageY - this.offset.click.top < containment[1]) {
        					pageY = containment[1] + this.offset.click.top;
        				}
        				if (event.pageX - this.offset.click.left > containment[2]) {
        					pageX = containment[2] + this.offset.click.left;
        				}
        				if (event.pageY - this.offset.click.top > containment[3]) {
        					pageY = containment[3] + this.offset.click.top;
        				}
        			}
        
        			if (o.grid) {
        				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
        				top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
        				pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;
        
        				left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
        				pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
        			}
        
        			if ( o.axis === "y" ) {
        				pageX = this.originalPageX;
        			}
        
        			if ( o.axis === "x" ) {
        				pageY = this.originalPageY;
        			}
        		}
        
        		return {
        			top: (
        				pageY -																	// The absolute mouse position
        				this.offset.click.top	-												// Click offset (relative to the element)
        				this.offset.relative.top -												// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
        				( this.cssPosition === "fixed" ? -this.offset.scroll.top : ( scrollIsRootNode ? 0 : this.offset.scroll.top ) )
        			),
        			left: (
        				pageX -																	// The absolute mouse position
        				this.offset.click.left -												// Click offset (relative to the element)
        				this.offset.relative.left -												// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
        				( this.cssPosition === "fixed" ? -this.offset.scroll.left : ( scrollIsRootNode ? 0 : this.offset.scroll.left ) )
        			)
        		};
        
        	},
        
        	_clear: function() {
        		this.helper.removeClass("ui-draggable-dragging");
        		if (this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
        			this.helper.remove();
        		}
        		this.helper = null;
        		this.cancelHelperRemoval = false;
        		if ( this.destroyOnClear ) {
        			this.destroy();
        		}
        	},
        
        	_normalizeRightBottom: function() {
        		if ( this.options.axis !== "y" && this.helper.css( "right" ) !== "auto" ) {
        			this.helper.width( this.helper.width() );
        			this.helper.css( "right", "auto" );
        		}
        		if ( this.options.axis !== "x" && this.helper.css( "bottom" ) !== "auto" ) {
        			this.helper.height( this.helper.height() );
        			this.helper.css( "bottom", "auto" );
        		}
        	},
        
        	// From now on bulk stuff - mainly helpers
        
        	_trigger: function( type, event, ui ) {
        		ui = ui || this._uiHash();
        		$.ui.plugin.call( this, type, [ event, ui, this ], true );
        
        		// Absolute position and offset (see #6884 ) have to be recalculated after plugins
        		if ( /^(drag|start|stop)/.test( type ) ) {
        			this.positionAbs = this._convertPositionTo( "absolute" );
        			ui.offset = this.positionAbs;
        		}
        		return $.Widget.prototype._trigger.call( this, type, event, ui );
        	},
        
        	plugins: {},
        
        	_uiHash: function() {
        		return {
        			helper: this.helper,
        			position: this.position,
        			originalPosition: this.originalPosition,
        			offset: this.positionAbs
        		};
        	}
        
        });
        
        $.ui.plugin.add( "draggable", "connectToSortable", {
        	start: function( event, ui, draggable ) {
        		var uiSortable = $.extend( {}, ui, {
        			item: draggable.element
        		});
        
        		draggable.sortables = [];
        		$( draggable.options.connectToSortable ).each(function() {
        			var sortable = $( this ).sortable( "instance" );
        
        			if ( sortable && !sortable.options.disabled ) {
        				draggable.sortables.push( sortable );
        
        				// refreshPositions is called at drag start to refresh the containerCache
        				// which is used in drag. This ensures it's initialized and synchronized
        				// with any changes that might have happened on the page since initialization.
        				sortable.refreshPositions();
        				sortable._trigger("activate", event, uiSortable);
        			}
        		});
        	},
        	stop: function( event, ui, draggable ) {
        		var uiSortable = $.extend( {}, ui, {
        			item: draggable.element
        		});
        
        		draggable.cancelHelperRemoval = false;
        
        		$.each( draggable.sortables, function() {
        			var sortable = this;
        
        			if ( sortable.isOver ) {
        				sortable.isOver = 0;
        
        				// Allow this sortable to handle removing the helper
        				draggable.cancelHelperRemoval = true;
        				sortable.cancelHelperRemoval = false;
        
        				// Use _storedCSS To restore properties in the sortable,
        				// as this also handles revert (#9675) since the draggable
        				// may have modified them in unexpected ways (#8809)
        				sortable._storedCSS = {
        					position: sortable.placeholder.css( "position" ),
        					top: sortable.placeholder.css( "top" ),
        					left: sortable.placeholder.css( "left" )
        				};
        
        				sortable._mouseStop(event);
        
        				// Once drag has ended, the sortable should return to using
        				// its original helper, not the shared helper from draggable
        				sortable.options.helper = sortable.options._helper;
        			} else {
        				// Prevent this Sortable from removing the helper.
        				// However, don't set the draggable to remove the helper
        				// either as another connected Sortable may yet handle the removal.
        				sortable.cancelHelperRemoval = true;
        
        				sortable._trigger( "deactivate", event, uiSortable );
        			}
        		});
        	},
        	drag: function( event, ui, draggable ) {
        		$.each( draggable.sortables, function() {
        			var innermostIntersecting = false,
        				sortable = this;
        
        			// Copy over variables that sortable's _intersectsWith uses
        			sortable.positionAbs = draggable.positionAbs;
        			sortable.helperProportions = draggable.helperProportions;
        			sortable.offset.click = draggable.offset.click;
        
        			if ( sortable._intersectsWith( sortable.containerCache ) ) {
        				innermostIntersecting = true;
        
        				$.each( draggable.sortables, function() {
        					// Copy over variables that sortable's _intersectsWith uses
        					this.positionAbs = draggable.positionAbs;
        					this.helperProportions = draggable.helperProportions;
        					this.offset.click = draggable.offset.click;
        
        					if ( this !== sortable &&
        							this._intersectsWith( this.containerCache ) &&
        							$.contains( sortable.element[ 0 ], this.element[ 0 ] ) ) {
        						innermostIntersecting = false;
        					}
        
        					return innermostIntersecting;
        				});
        			}
        
        			if ( innermostIntersecting ) {
        				// If it intersects, we use a little isOver variable and set it once,
        				// so that the move-in stuff gets fired only once.
        				if ( !sortable.isOver ) {
        					sortable.isOver = 1;
        
        					// Store draggable's parent in case we need to reappend to it later.
        					draggable._parent = ui.helper.parent();
        
        					sortable.currentItem = ui.helper
        						.appendTo( sortable.element )
        						.data( "ui-sortable-item", true );
        
        					// Store helper option to later restore it
        					sortable.options._helper = sortable.options.helper;
        
        					sortable.options.helper = function() {
        						return ui.helper[ 0 ];
        					};
        
        					// Fire the start events of the sortable with our passed browser event,
        					// and our own helper (so it doesn't create a new one)
        					event.target = sortable.currentItem[ 0 ];
        					sortable._mouseCapture( event, true );
        					sortable._mouseStart( event, true, true );
        
        					// Because the browser event is way off the new appended portlet,
        					// modify necessary variables to reflect the changes
        					sortable.offset.click.top = draggable.offset.click.top;
        					sortable.offset.click.left = draggable.offset.click.left;
        					sortable.offset.parent.left -= draggable.offset.parent.left -
        						sortable.offset.parent.left;
        					sortable.offset.parent.top -= draggable.offset.parent.top -
        						sortable.offset.parent.top;
        
        					draggable._trigger( "toSortable", event );
        
        					// Inform draggable that the helper is in a valid drop zone,
        					// used solely in the revert option to handle "valid/invalid".
        					draggable.dropped = sortable.element;
        
        					// Need to refreshPositions of all sortables in the case that
        					// adding to one sortable changes the location of the other sortables (#9675)
        					$.each( draggable.sortables, function() {
        						this.refreshPositions();
        					});
        
        					// hack so receive/update callbacks work (mostly)
        					draggable.currentItem = draggable.element;
        					sortable.fromOutside = draggable;
        				}
        
        				if ( sortable.currentItem ) {
        					sortable._mouseDrag( event );
        					// Copy the sortable's position because the draggable's can potentially reflect
        					// a relative position, while sortable is always absolute, which the dragged
        					// element has now become. (#8809)
        					ui.position = sortable.position;
        				}
        			} else {
        				// If it doesn't intersect with the sortable, and it intersected before,
        				// we fake the drag stop of the sortable, but make sure it doesn't remove
        				// the helper by using cancelHelperRemoval.
        				if ( sortable.isOver ) {
        
        					sortable.isOver = 0;
        					sortable.cancelHelperRemoval = true;
        
        					// Calling sortable's mouseStop would trigger a revert,
        					// so revert must be temporarily false until after mouseStop is called.
        					sortable.options._revert = sortable.options.revert;
        					sortable.options.revert = false;
        
        					sortable._trigger( "out", event, sortable._uiHash( sortable ) );
        					sortable._mouseStop( event, true );
        
        					// restore sortable behaviors that were modfied
        					// when the draggable entered the sortable area (#9481)
        					sortable.options.revert = sortable.options._revert;
        					sortable.options.helper = sortable.options._helper;
        
        					if ( sortable.placeholder ) {
        						sortable.placeholder.remove();
        					}
        
        					// Restore and recalculate the draggable's offset considering the sortable
        					// may have modified them in unexpected ways. (#8809, #10669)
        					ui.helper.appendTo( draggable._parent );
        					draggable._refreshOffsets( event );
        					ui.position = draggable._generatePosition( event, true );
        
        					draggable._trigger( "fromSortable", event );
        
        					// Inform draggable that the helper is no longer in a valid drop zone
        					draggable.dropped = false;
        
        					// Need to refreshPositions of all sortables just in case removing
        					// from one sortable changes the location of other sortables (#9675)
        					$.each( draggable.sortables, function() {
        						this.refreshPositions();
        					});
        				}
        			}
        		});
        	}
        });
        
        $.ui.plugin.add("draggable", "cursor", {
        	start: function( event, ui, instance ) {
        		var t = $( "body" ),
        			o = instance.options;
        
        		if (t.css("cursor")) {
        			o._cursor = t.css("cursor");
        		}
        		t.css("cursor", o.cursor);
        	},
        	stop: function( event, ui, instance ) {
        		var o = instance.options;
        		if (o._cursor) {
        			$("body").css("cursor", o._cursor);
        		}
        	}
        });
        
        $.ui.plugin.add("draggable", "opacity", {
        	start: function( event, ui, instance ) {
        		var t = $( ui.helper ),
        			o = instance.options;
        		if (t.css("opacity")) {
        			o._opacity = t.css("opacity");
        		}
        		t.css("opacity", o.opacity);
        	},
        	stop: function( event, ui, instance ) {
        		var o = instance.options;
        		if (o._opacity) {
        			$(ui.helper).css("opacity", o._opacity);
        		}
        	}
        });
        
        $.ui.plugin.add("draggable", "scroll", {
        	start: function( event, ui, i ) {
        		if ( !i.scrollParentNotHidden ) {
        			i.scrollParentNotHidden = i.helper.scrollParent( false );
        		}
        
        		if ( i.scrollParentNotHidden[ 0 ] !== i.document[ 0 ] && i.scrollParentNotHidden[ 0 ].tagName !== "HTML" ) {
        			i.overflowOffset = i.scrollParentNotHidden.offset();
        		}
        	},
        	drag: function( event, ui, i  ) {
        
        		var o = i.options,
        			scrolled = false,
        			scrollParent = i.scrollParentNotHidden[ 0 ],
        			document = i.document[ 0 ];
        
        		if ( scrollParent !== document && scrollParent.tagName !== "HTML" ) {
        			if ( !o.axis || o.axis !== "x" ) {
        				if ( ( i.overflowOffset.top + scrollParent.offsetHeight ) - event.pageY < o.scrollSensitivity ) {
        					scrollParent.scrollTop = scrolled = scrollParent.scrollTop + o.scrollSpeed;
        				} else if ( event.pageY - i.overflowOffset.top < o.scrollSensitivity ) {
        					scrollParent.scrollTop = scrolled = scrollParent.scrollTop - o.scrollSpeed;
        				}
        			}
        
        			if ( !o.axis || o.axis !== "y" ) {
        				if ( ( i.overflowOffset.left + scrollParent.offsetWidth ) - event.pageX < o.scrollSensitivity ) {
        					scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + o.scrollSpeed;
        				} else if ( event.pageX - i.overflowOffset.left < o.scrollSensitivity ) {
        					scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - o.scrollSpeed;
        				}
        			}
        
        		} else {
        
        			if (!o.axis || o.axis !== "x") {
        				if (event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
        					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
        				} else if ($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
        					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
        				}
        			}
        
        			if (!o.axis || o.axis !== "y") {
        				if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
        					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
        				} else if ($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
        					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
        				}
        			}
        
        		}
        
        		if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
        			$.ui.ddmanager.prepareOffsets(i, event);
        		}
        
        	}
        });
        
        $.ui.plugin.add("draggable", "snap", {
        	start: function( event, ui, i ) {
        
        		var o = i.options;
        
        		i.snapElements = [];
        
        		$(o.snap.constructor !== String ? ( o.snap.items || ":data(ui-draggable)" ) : o.snap).each(function() {
        			var $t = $(this),
        				$o = $t.offset();
        			if (this !== i.element[0]) {
        				i.snapElements.push({
        					item: this,
        					width: $t.outerWidth(), height: $t.outerHeight(),
        					top: $o.top, left: $o.left
        				});
        			}
        		});
        
        	},
        	drag: function( event, ui, inst ) {
        
        		var ts, bs, ls, rs, l, r, t, b, i, first,
        			o = inst.options,
        			d = o.snapTolerance,
        			x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
        			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;
        
        		for (i = inst.snapElements.length - 1; i >= 0; i--){
        
        			l = inst.snapElements[i].left - inst.margins.left;
        			r = l + inst.snapElements[i].width;
        			t = inst.snapElements[i].top - inst.margins.top;
        			b = t + inst.snapElements[i].height;
        
        			if ( x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d || !$.contains( inst.snapElements[ i ].item.ownerDocument, inst.snapElements[ i ].item ) ) {
        				if (inst.snapElements[i].snapping) {
        					(inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
        				}
        				inst.snapElements[i].snapping = false;
        				continue;
        			}
        
        			if (o.snapMode !== "inner") {
        				ts = Math.abs(t - y2) <= d;
        				bs = Math.abs(b - y1) <= d;
        				ls = Math.abs(l - x2) <= d;
        				rs = Math.abs(r - x1) <= d;
        				if (ts) {
        					ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top;
        				}
        				if (bs) {
        					ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top;
        				}
        				if (ls) {
        					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left;
        				}
        				if (rs) {
        					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left;
        				}
        			}
        
        			first = (ts || bs || ls || rs);
        
        			if (o.snapMode !== "outer") {
        				ts = Math.abs(t - y1) <= d;
        				bs = Math.abs(b - y2) <= d;
        				ls = Math.abs(l - x1) <= d;
        				rs = Math.abs(r - x2) <= d;
        				if (ts) {
        					ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top;
        				}
        				if (bs) {
        					ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top;
        				}
        				if (ls) {
        					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left;
        				}
        				if (rs) {
        					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left;
        				}
        			}
        
        			if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
        				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
        			}
        			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);
        
        		}
        
        	}
        });
        
        $.ui.plugin.add("draggable", "stack", {
        	start: function( event, ui, instance ) {
        		var min,
        			o = instance.options,
        			group = $.makeArray($(o.stack)).sort(function(a, b) {
        				return (parseInt($(a).css("zIndex"), 10) || 0) - (parseInt($(b).css("zIndex"), 10) || 0);
        			});
        
        		if (!group.length) { return; }
        
        		min = parseInt($(group[0]).css("zIndex"), 10) || 0;
        		$(group).each(function(i) {
        			$(this).css("zIndex", min + i);
        		});
        		this.css("zIndex", (min + group.length));
        	}
        });
        
        $.ui.plugin.add("draggable", "zIndex", {
        	start: function( event, ui, instance ) {
        		var t = $( ui.helper ),
        			o = instance.options;
        
        		if (t.css("zIndex")) {
        			o._zIndex = t.css("zIndex");
        		}
        		t.css("zIndex", o.zIndex);
        	},
        	stop: function( event, ui, instance ) {
        		var o = instance.options;
        
        		if (o._zIndex) {
        			$(ui.helper).css("zIndex", o._zIndex);
        		}
        	}
        });
        
        var draggable = $.ui.draggable;
        
        
        /*!
         * jQuery UI Droppable 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/droppable/
         */
        
        
        $.widget( "ui.droppable", {
        	version: "1.11.4",
        	widgetEventPrefix: "drop",
        	options: {
        		accept: "*",
        		activeClass: false,
        		addClasses: true,
        		greedy: false,
        		hoverClass: false,
        		scope: "default",
        		tolerance: "intersect",
        
        		// callbacks
        		activate: null,
        		deactivate: null,
        		drop: null,
        		out: null,
        		over: null
        	},
        	_create: function() {
        
        		var proportions,
        			o = this.options,
        			accept = o.accept;
        
        		this.isover = false;
        		this.isout = true;
        
        		this.accept = $.isFunction( accept ) ? accept : function( d ) {
        			return d.is( accept );
        		};
        
        		this.proportions = function( /* valueToWrite */ ) {
        			if ( arguments.length ) {
        				// Store the droppable's proportions
        				proportions = arguments[ 0 ];
        			} else {
        				// Retrieve or derive the droppable's proportions
        				return proportions ?
        					proportions :
        					proportions = {
        						width: this.element[ 0 ].offsetWidth,
        						height: this.element[ 0 ].offsetHeight
        					};
        			}
        		};
        
        		this._addToManager( o.scope );
        
        		o.addClasses && this.element.addClass( "ui-droppable" );
        
        	},
        
        	_addToManager: function( scope ) {
        		// Add the reference and positions to the manager
        		$.ui.ddmanager.droppables[ scope ] = $.ui.ddmanager.droppables[ scope ] || [];
        		$.ui.ddmanager.droppables[ scope ].push( this );
        	},
        
        	_splice: function( drop ) {
        		var i = 0;
        		for ( ; i < drop.length; i++ ) {
        			if ( drop[ i ] === this ) {
        				drop.splice( i, 1 );
        			}
        		}
        	},
        
        	_destroy: function() {
        		var drop = $.ui.ddmanager.droppables[ this.options.scope ];
        
        		this._splice( drop );
        
        		this.element.removeClass( "ui-droppable ui-droppable-disabled" );
        	},
        
        	_setOption: function( key, value ) {
        
        		if ( key === "accept" ) {
        			this.accept = $.isFunction( value ) ? value : function( d ) {
        				return d.is( value );
        			};
        		} else if ( key === "scope" ) {
        			var drop = $.ui.ddmanager.droppables[ this.options.scope ];
        
        			this._splice( drop );
        			this._addToManager( value );
        		}
        
        		this._super( key, value );
        	},
        
        	_activate: function( event ) {
        		var draggable = $.ui.ddmanager.current;
        		if ( this.options.activeClass ) {
        			this.element.addClass( this.options.activeClass );
        		}
        		if ( draggable ){
        			this._trigger( "activate", event, this.ui( draggable ) );
        		}
        	},
        
        	_deactivate: function( event ) {
        		var draggable = $.ui.ddmanager.current;
        		if ( this.options.activeClass ) {
        			this.element.removeClass( this.options.activeClass );
        		}
        		if ( draggable ){
        			this._trigger( "deactivate", event, this.ui( draggable ) );
        		}
        	},
        
        	_over: function( event ) {
        
        		var draggable = $.ui.ddmanager.current;
        
        		// Bail if draggable and droppable are same element
        		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
        			return;
        		}
        
        		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
        			if ( this.options.hoverClass ) {
        				this.element.addClass( this.options.hoverClass );
        			}
        			this._trigger( "over", event, this.ui( draggable ) );
        		}
        
        	},
        
        	_out: function( event ) {
        
        		var draggable = $.ui.ddmanager.current;
        
        		// Bail if draggable and droppable are same element
        		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
        			return;
        		}
        
        		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
        			if ( this.options.hoverClass ) {
        				this.element.removeClass( this.options.hoverClass );
        			}
        			this._trigger( "out", event, this.ui( draggable ) );
        		}
        
        	},
        
        	_drop: function( event, custom ) {
        
        		var draggable = custom || $.ui.ddmanager.current,
        			childrenIntersection = false;
        
        		// Bail if draggable and droppable are same element
        		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
        			return false;
        		}
        
        		this.element.find( ":data(ui-droppable)" ).not( ".ui-draggable-dragging" ).each(function() {
        			var inst = $( this ).droppable( "instance" );
        			if (
        				inst.options.greedy &&
        				!inst.options.disabled &&
        				inst.options.scope === draggable.options.scope &&
        				inst.accept.call( inst.element[ 0 ], ( draggable.currentItem || draggable.element ) ) &&
        				$.ui.intersect( draggable, $.extend( inst, { offset: inst.element.offset() } ), inst.options.tolerance, event )
        			) { childrenIntersection = true; return false; }
        		});
        		if ( childrenIntersection ) {
        			return false;
        		}
        
        		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
        			if ( this.options.activeClass ) {
        				this.element.removeClass( this.options.activeClass );
        			}
        			if ( this.options.hoverClass ) {
        				this.element.removeClass( this.options.hoverClass );
        			}
        			this._trigger( "drop", event, this.ui( draggable ) );
        			return this.element;
        		}
        
        		return false;
        
        	},
        
        	ui: function( c ) {
        		return {
        			draggable: ( c.currentItem || c.element ),
        			helper: c.helper,
        			position: c.position,
        			offset: c.positionAbs
        		};
        	}
        
        });
        
        $.ui.intersect = (function() {
        	function isOverAxis( x, reference, size ) {
        		return ( x >= reference ) && ( x < ( reference + size ) );
        	}
        
        	return function( draggable, droppable, toleranceMode, event ) {
        
        		if ( !droppable.offset ) {
        			return false;
        		}
        
        		var x1 = ( draggable.positionAbs || draggable.position.absolute ).left + draggable.margins.left,
        			y1 = ( draggable.positionAbs || draggable.position.absolute ).top + draggable.margins.top,
        			x2 = x1 + draggable.helperProportions.width,
        			y2 = y1 + draggable.helperProportions.height,
        			l = droppable.offset.left,
        			t = droppable.offset.top,
        			r = l + droppable.proportions().width,
        			b = t + droppable.proportions().height;
        
        		switch ( toleranceMode ) {
        		case "fit":
        			return ( l <= x1 && x2 <= r && t <= y1 && y2 <= b );
        		case "intersect":
        			return ( l < x1 + ( draggable.helperProportions.width / 2 ) && // Right Half
        				x2 - ( draggable.helperProportions.width / 2 ) < r && // Left Half
        				t < y1 + ( draggable.helperProportions.height / 2 ) && // Bottom Half
        				y2 - ( draggable.helperProportions.height / 2 ) < b ); // Top Half
        		case "pointer":
        			return isOverAxis( event.pageY, t, droppable.proportions().height ) && isOverAxis( event.pageX, l, droppable.proportions().width );
        		case "touch":
        			return (
        				( y1 >= t && y1 <= b ) || // Top edge touching
        				( y2 >= t && y2 <= b ) || // Bottom edge touching
        				( y1 < t && y2 > b ) // Surrounded vertically
        			) && (
        				( x1 >= l && x1 <= r ) || // Left edge touching
        				( x2 >= l && x2 <= r ) || // Right edge touching
        				( x1 < l && x2 > r ) // Surrounded horizontally
        			);
        		default:
        			return false;
        		}
        	};
        })();
        
        /*
        	This manager tracks offsets of draggables and droppables
        */
        $.ui.ddmanager = {
        	current: null,
        	droppables: { "default": [] },
        	prepareOffsets: function( t, event ) {
        
        		var i, j,
        			m = $.ui.ddmanager.droppables[ t.options.scope ] || [],
        			type = event ? event.type : null, // workaround for #2317
        			list = ( t.currentItem || t.element ).find( ":data(ui-droppable)" ).addBack();
        
        		droppablesLoop: for ( i = 0; i < m.length; i++ ) {
        
        			// No disabled and non-accepted
        			if ( m[ i ].options.disabled || ( t && !m[ i ].accept.call( m[ i ].element[ 0 ], ( t.currentItem || t.element ) ) ) ) {
        				continue;
        			}
        
        			// Filter out elements in the current dragged item
        			for ( j = 0; j < list.length; j++ ) {
        				if ( list[ j ] === m[ i ].element[ 0 ] ) {
        					m[ i ].proportions().height = 0;
        					continue droppablesLoop;
        				}
        			}
        
        			m[ i ].visible = m[ i ].element.css( "display" ) !== "none";
        			if ( !m[ i ].visible ) {
        				continue;
        			}
        
        			// Activate the droppable if used directly from draggables
        			if ( type === "mousedown" ) {
        				m[ i ]._activate.call( m[ i ], event );
        			}
        
        			m[ i ].offset = m[ i ].element.offset();
        			m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth, height: m[ i ].element[ 0 ].offsetHeight });
        
        		}
        
        	},
        	drop: function( draggable, event ) {
        
        		var dropped = false;
        		// Create a copy of the droppables in case the list changes during the drop (#9116)
        		$.each( ( $.ui.ddmanager.droppables[ draggable.options.scope ] || [] ).slice(), function() {
        
        			if ( !this.options ) {
        				return;
        			}
        			if ( !this.options.disabled && this.visible && $.ui.intersect( draggable, this, this.options.tolerance, event ) ) {
        				dropped = this._drop.call( this, event ) || dropped;
        			}
        
        			if ( !this.options.disabled && this.visible && this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
        				this.isout = true;
        				this.isover = false;
        				this._deactivate.call( this, event );
        			}
        
        		});
        		return dropped;
        
        	},
        	dragStart: function( draggable, event ) {
        		// Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
        		draggable.element.parentsUntil( "body" ).bind( "scroll.droppable", function() {
        			if ( !draggable.options.refreshPositions ) {
        				$.ui.ddmanager.prepareOffsets( draggable, event );
        			}
        		});
        	},
        	drag: function( draggable, event ) {
        
        		// If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
        		if ( draggable.options.refreshPositions ) {
        			$.ui.ddmanager.prepareOffsets( draggable, event );
        		}
        
        		// Run through all droppables and check their positions based on specific tolerance options
        		$.each( $.ui.ddmanager.droppables[ draggable.options.scope ] || [], function() {
        
        			if ( this.options.disabled || this.greedyChild || !this.visible ) {
        				return;
        			}
        
        			var parentInstance, scope, parent,
        				intersects = $.ui.intersect( draggable, this, this.options.tolerance, event ),
        				c = !intersects && this.isover ? "isout" : ( intersects && !this.isover ? "isover" : null );
        			if ( !c ) {
        				return;
        			}
        
        			if ( this.options.greedy ) {
        				// find droppable parents with same scope
        				scope = this.options.scope;
        				parent = this.element.parents( ":data(ui-droppable)" ).filter(function() {
        					return $( this ).droppable( "instance" ).options.scope === scope;
        				});
        
        				if ( parent.length ) {
        					parentInstance = $( parent[ 0 ] ).droppable( "instance" );
        					parentInstance.greedyChild = ( c === "isover" );
        				}
        			}
        
        			// we just moved into a greedy child
        			if ( parentInstance && c === "isover" ) {
        				parentInstance.isover = false;
        				parentInstance.isout = true;
        				parentInstance._out.call( parentInstance, event );
        			}
        
        			this[ c ] = true;
        			this[c === "isout" ? "isover" : "isout"] = false;
        			this[c === "isover" ? "_over" : "_out"].call( this, event );
        
        			// we just moved out of a greedy child
        			if ( parentInstance && c === "isout" ) {
        				parentInstance.isout = false;
        				parentInstance.isover = true;
        				parentInstance._over.call( parentInstance, event );
        			}
        		});
        
        	},
        	dragStop: function( draggable, event ) {
        		draggable.element.parentsUntil( "body" ).unbind( "scroll.droppable" );
        		// Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
        		if ( !draggable.options.refreshPositions ) {
        			$.ui.ddmanager.prepareOffsets( draggable, event );
        		}
        	}
        };
        
        var droppable = $.ui.droppable;
        
        
        /*!
         * jQuery UI Sortable 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/sortable/
         */
        
        
        var sortable = $.widget("ui.sortable", $.ui.mouse, {
        	version: "1.11.4",
        	widgetEventPrefix: "sort",
        	ready: false,
        	options: {
        		appendTo: "parent",
        		axis: false,
        		connectWith: false,
        		containment: false,
        		cursor: "auto",
        		cursorAt: false,
        		dropOnEmpty: true,
        		forcePlaceholderSize: false,
        		forceHelperSize: false,
        		grid: false,
        		handle: false,
        		helper: "original",
        		items: "> *",
        		opacity: false,
        		placeholder: false,
        		revert: false,
        		scroll: true,
        		scrollSensitivity: 20,
        		scrollSpeed: 20,
        		scope: "default",
        		tolerance: "intersect",
        		zIndex: 1000,
        
        		// callbacks
        		activate: null,
        		beforeStop: null,
        		change: null,
        		deactivate: null,
        		out: null,
        		over: null,
        		receive: null,
        		remove: null,
        		sort: null,
        		start: null,
        		stop: null,
        		update: null
        	},
        
        	_isOverAxis: function( x, reference, size ) {
        		return ( x >= reference ) && ( x < ( reference + size ) );
        	},
        
        	_isFloating: function( item ) {
        		return (/left|right/).test(item.css("float")) || (/inline|table-cell/).test(item.css("display"));
        	},
        
        	_create: function() {
        		this.containerCache = {};
        		this.element.addClass("ui-sortable");
        
        		//Get the items
        		this.refresh();
        
        		//Let's determine the parent's offset
        		this.offset = this.element.offset();
        
        		//Initialize mouse events for interaction
        		this._mouseInit();
        
        		this._setHandleClassName();
        
        		//We're ready to go
        		this.ready = true;
        
        	},
        
        	_setOption: function( key, value ) {
        		this._super( key, value );
        
        		if ( key === "handle" ) {
        			this._setHandleClassName();
        		}
        	},
        
        	_setHandleClassName: function() {
        		this.element.find( ".ui-sortable-handle" ).removeClass( "ui-sortable-handle" );
        		$.each( this.items, function() {
        			( this.instance.options.handle ?
        				this.item.find( this.instance.options.handle ) : this.item )
        				.addClass( "ui-sortable-handle" );
        		});
        	},
        
        	_destroy: function() {
        		this.element
        			.removeClass( "ui-sortable ui-sortable-disabled" )
        			.find( ".ui-sortable-handle" )
        				.removeClass( "ui-sortable-handle" );
        		this._mouseDestroy();
        
        		for ( var i = this.items.length - 1; i >= 0; i-- ) {
        			this.items[i].item.removeData(this.widgetName + "-item");
        		}
        
        		return this;
        	},
        
        	_mouseCapture: function(event, overrideHandle) {
        		var currentItem = null,
        			validHandle = false,
        			that = this;
        
        		if (this.reverting) {
        			return false;
        		}
        
        		if(this.options.disabled || this.options.type === "static") {
        			return false;
        		}
        
        		//We have to refresh the items data once first
        		this._refreshItems(event);
        
        		//Find out if the clicked node (or one of its parents) is a actual item in this.items
        		$(event.target).parents().each(function() {
        			if($.data(this, that.widgetName + "-item") === that) {
        				currentItem = $(this);
        				return false;
        			}
        		});
        		if($.data(event.target, that.widgetName + "-item") === that) {
        			currentItem = $(event.target);
        		}
        
        		if(!currentItem) {
        			return false;
        		}
        		if(this.options.handle && !overrideHandle) {
        			$(this.options.handle, currentItem).find("*").addBack().each(function() {
        				if(this === event.target) {
        					validHandle = true;
        				}
        			});
        			if(!validHandle) {
        				return false;
        			}
        		}
        
        		this.currentItem = currentItem;
        		this._removeCurrentsFromItems();
        		return true;
        
        	},
        
        	_mouseStart: function(event, overrideHandle, noActivation) {
        
        		var i, body,
        			o = this.options;
        
        		this.currentContainer = this;
        
        		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
        		this.refreshPositions();
        
        		//Create and append the visible helper
        		this.helper = this._createHelper(event);
        
        		//Cache the helper size
        		this._cacheHelperProportions();
        
        		/*
        		 * - Position generation -
        		 * This block generates everything position related - it's the core of draggables.
        		 */
        
        		//Cache the margins of the original element
        		this._cacheMargins();
        
        		//Get the next scrolling parent
        		this.scrollParent = this.helper.scrollParent();
        
        		//The element's absolute position on the page minus margins
        		this.offset = this.currentItem.offset();
        		this.offset = {
        			top: this.offset.top - this.margins.top,
        			left: this.offset.left - this.margins.left
        		};
        
        		$.extend(this.offset, {
        			click: { //Where the click happened, relative to the element
        				left: event.pageX - this.offset.left,
        				top: event.pageY - this.offset.top
        			},
        			parent: this._getParentOffset(),
        			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
        		});
        
        		// Only after we got the offset, we can change the helper's position to absolute
        		// TODO: Still need to figure out a way to make relative sorting possible
        		this.helper.css("position", "absolute");
        		this.cssPosition = this.helper.css("position");
        
        		//Generate the original position
        		this.originalPosition = this._generatePosition(event);
        		this.originalPageX = event.pageX;
        		this.originalPageY = event.pageY;
        
        		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
        		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));
        
        		//Cache the former DOM position
        		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };
        
        		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
        		if(this.helper[0] !== this.currentItem[0]) {
        			this.currentItem.hide();
        		}
        
        		//Create the placeholder
        		this._createPlaceholder();
        
        		//Set a containment if given in the options
        		if(o.containment) {
        			this._setContainment();
        		}
        
        		if( o.cursor && o.cursor !== "auto" ) { // cursor option
        			body = this.document.find( "body" );
        
        			// support: IE
        			this.storedCursor = body.css( "cursor" );
        			body.css( "cursor", o.cursor );
        
        			this.storedStylesheet = $( "<style>*{ cursor: "+o.cursor+" !important; }</style>" ).appendTo( body );
        		}
        
        		if(o.opacity) { // opacity option
        			if (this.helper.css("opacity")) {
        				this._storedOpacity = this.helper.css("opacity");
        			}
        			this.helper.css("opacity", o.opacity);
        		}
        
        		if(o.zIndex) { // zIndex option
        			if (this.helper.css("zIndex")) {
        				this._storedZIndex = this.helper.css("zIndex");
        			}
        			this.helper.css("zIndex", o.zIndex);
        		}
        
        		//Prepare scrolling
        		if(this.scrollParent[0] !== this.document[0] && this.scrollParent[0].tagName !== "HTML") {
        			this.overflowOffset = this.scrollParent.offset();
        		}
        
        		//Call callbacks
        		this._trigger("start", event, this._uiHash());
        
        		//Recache the helper size
        		if(!this._preserveHelperProportions) {
        			this._cacheHelperProportions();
        		}
        
        
        		//Post "activate" events to possible containers
        		if( !noActivation ) {
        			for ( i = this.containers.length - 1; i >= 0; i-- ) {
        				this.containers[ i ]._trigger( "activate", event, this._uiHash( this ) );
        			}
        		}
        
        		//Prepare possible droppables
        		if($.ui.ddmanager) {
        			$.ui.ddmanager.current = this;
        		}
        
        		if ($.ui.ddmanager && !o.dropBehaviour) {
        			$.ui.ddmanager.prepareOffsets(this, event);
        		}
        
        		this.dragging = true;
        
        		this.helper.addClass("ui-sortable-helper");
        		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
        		return true;
        
        	},
        
        	_mouseDrag: function(event) {
        		var i, item, itemElement, intersection,
        			o = this.options,
        			scrolled = false;
        
        		//Compute the helpers position
        		this.position = this._generatePosition(event);
        		this.positionAbs = this._convertPositionTo("absolute");
        
        		if (!this.lastPositionAbs) {
        			this.lastPositionAbs = this.positionAbs;
        		}
        
        		//Do scrolling
        		if(this.options.scroll) {
        			if(this.scrollParent[0] !== this.document[0] && this.scrollParent[0].tagName !== "HTML") {
        
        				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
        					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
        				} else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
        					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
        				}
        
        				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
        					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
        				} else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
        					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
        				}
        
        			} else {
        
        				if(event.pageY - this.document.scrollTop() < o.scrollSensitivity) {
        					scrolled = this.document.scrollTop(this.document.scrollTop() - o.scrollSpeed);
        				} else if(this.window.height() - (event.pageY - this.document.scrollTop()) < o.scrollSensitivity) {
        					scrolled = this.document.scrollTop(this.document.scrollTop() + o.scrollSpeed);
        				}
        
        				if(event.pageX - this.document.scrollLeft() < o.scrollSensitivity) {
        					scrolled = this.document.scrollLeft(this.document.scrollLeft() - o.scrollSpeed);
        				} else if(this.window.width() - (event.pageX - this.document.scrollLeft()) < o.scrollSensitivity) {
        					scrolled = this.document.scrollLeft(this.document.scrollLeft() + o.scrollSpeed);
        				}
        
        			}
        
        			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
        				$.ui.ddmanager.prepareOffsets(this, event);
        			}
        		}
        
        		//Regenerate the absolute position used for position checks
        		this.positionAbs = this._convertPositionTo("absolute");
        
        		//Set the helper position
        		if(!this.options.axis || this.options.axis !== "y") {
        			this.helper[0].style.left = this.position.left+"px";
        		}
        		if(!this.options.axis || this.options.axis !== "x") {
        			this.helper[0].style.top = this.position.top+"px";
        		}
        
        		//Rearrange
        		for (i = this.items.length - 1; i >= 0; i--) {
        
        			//Cache variables and intersection, continue if no intersection
        			item = this.items[i];
        			itemElement = item.item[0];
        			intersection = this._intersectsWithPointer(item);
        			if (!intersection) {
        				continue;
        			}
        
        			// Only put the placeholder inside the current Container, skip all
        			// items from other containers. This works because when moving
        			// an item from one container to another the
        			// currentContainer is switched before the placeholder is moved.
        			//
        			// Without this, moving items in "sub-sortables" can cause
        			// the placeholder to jitter between the outer and inner container.
        			if (item.instance !== this.currentContainer) {
        				continue;
        			}
        
        			// cannot intersect with itself
        			// no useless actions that have been done before
        			// no action if the item moved is the parent of the item checked
        			if (itemElement !== this.currentItem[0] &&
        				this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement &&
        				!$.contains(this.placeholder[0], itemElement) &&
        				(this.options.type === "semi-dynamic" ? !$.contains(this.element[0], itemElement) : true)
        			) {
        
        				this.direction = intersection === 1 ? "down" : "up";
        
        				if (this.options.tolerance === "pointer" || this._intersectsWithSides(item)) {
        					this._rearrange(event, item);
        				} else {
        					break;
        				}
        
        				this._trigger("change", event, this._uiHash());
        				break;
        			}
        		}
        
        		//Post events to containers
        		this._contactContainers(event);
        
        		//Interconnect with droppables
        		if($.ui.ddmanager) {
        			$.ui.ddmanager.drag(this, event);
        		}
        
        		//Call callbacks
        		this._trigger("sort", event, this._uiHash());
        
        		this.lastPositionAbs = this.positionAbs;
        		return false;
        
        	},
        
        	_mouseStop: function(event, noPropagation) {
        
        		if(!event) {
        			return;
        		}
        
        		//If we are using droppables, inform the manager about the drop
        		if ($.ui.ddmanager && !this.options.dropBehaviour) {
        			$.ui.ddmanager.drop(this, event);
        		}
        
        		if(this.options.revert) {
        			var that = this,
        				cur = this.placeholder.offset(),
        				axis = this.options.axis,
        				animation = {};
        
        			if ( !axis || axis === "x" ) {
        				animation.left = cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollLeft);
        			}
        			if ( !axis || axis === "y" ) {
        				animation.top = cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollTop);
        			}
        			this.reverting = true;
        			$(this.helper).animate( animation, parseInt(this.options.revert, 10) || 500, function() {
        				that._clear(event);
        			});
        		} else {
        			this._clear(event, noPropagation);
        		}
        
        		return false;
        
        	},
        
        	cancel: function() {
        
        		if(this.dragging) {
        
        			this._mouseUp({ target: null });
        
        			if(this.options.helper === "original") {
        				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
        			} else {
        				this.currentItem.show();
        			}
        
        			//Post deactivating events to containers
        			for (var i = this.containers.length - 1; i >= 0; i--){
        				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
        				if(this.containers[i].containerCache.over) {
        					this.containers[i]._trigger("out", null, this._uiHash(this));
        					this.containers[i].containerCache.over = 0;
        				}
        			}
        
        		}
        
        		if (this.placeholder) {
        			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
        			if(this.placeholder[0].parentNode) {
        				this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
        			}
        			if(this.options.helper !== "original" && this.helper && this.helper[0].parentNode) {
        				this.helper.remove();
        			}
        
        			$.extend(this, {
        				helper: null,
        				dragging: false,
        				reverting: false,
        				_noFinalSort: null
        			});
        
        			if(this.domPosition.prev) {
        				$(this.domPosition.prev).after(this.currentItem);
        			} else {
        				$(this.domPosition.parent).prepend(this.currentItem);
        			}
        		}
        
        		return this;
        
        	},
        
        	serialize: function(o) {
        
        		var items = this._getItemsAsjQuery(o && o.connected),
        			str = [];
        		o = o || {};
        
        		$(items).each(function() {
        			var res = ($(o.item || this).attr(o.attribute || "id") || "").match(o.expression || (/(.+)[\-=_](.+)/));
        			if (res) {
        				str.push((o.key || res[1]+"[]")+"="+(o.key && o.expression ? res[1] : res[2]));
        			}
        		});
        
        		if(!str.length && o.key) {
        			str.push(o.key + "=");
        		}
        
        		return str.join("&");
        
        	},
        
        	toArray: function(o) {
        
        		var items = this._getItemsAsjQuery(o && o.connected),
        			ret = [];
        
        		o = o || {};
        
        		items.each(function() { ret.push($(o.item || this).attr(o.attribute || "id") || ""); });
        		return ret;
        
        	},
        
        	/* Be careful with the following core functions */
        	_intersectsWith: function(item) {
        
        		var x1 = this.positionAbs.left,
        			x2 = x1 + this.helperProportions.width,
        			y1 = this.positionAbs.top,
        			y2 = y1 + this.helperProportions.height,
        			l = item.left,
        			r = l + item.width,
        			t = item.top,
        			b = t + item.height,
        			dyClick = this.offset.click.top,
        			dxClick = this.offset.click.left,
        			isOverElementHeight = ( this.options.axis === "x" ) || ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
        			isOverElementWidth = ( this.options.axis === "y" ) || ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r ),
        			isOverElement = isOverElementHeight && isOverElementWidth;
        
        		if ( this.options.tolerance === "pointer" ||
        			this.options.forcePointerForContainers ||
        			(this.options.tolerance !== "pointer" && this.helperProportions[this.floating ? "width" : "height"] > item[this.floating ? "width" : "height"])
        		) {
        			return isOverElement;
        		} else {
        
        			return (l < x1 + (this.helperProportions.width / 2) && // Right Half
        				x2 - (this.helperProportions.width / 2) < r && // Left Half
        				t < y1 + (this.helperProportions.height / 2) && // Bottom Half
        				y2 - (this.helperProportions.height / 2) < b ); // Top Half
        
        		}
        	},
        
        	_intersectsWithPointer: function(item) {
        
        		var isOverElementHeight = (this.options.axis === "x") || this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
        			isOverElementWidth = (this.options.axis === "y") || this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
        			isOverElement = isOverElementHeight && isOverElementWidth,
        			verticalDirection = this._getDragVerticalDirection(),
        			horizontalDirection = this._getDragHorizontalDirection();
        
        		if (!isOverElement) {
        			return false;
        		}
        
        		return this.floating ?
        			( ((horizontalDirection && horizontalDirection === "right") || verticalDirection === "down") ? 2 : 1 )
        			: ( verticalDirection && (verticalDirection === "down" ? 2 : 1) );
        
        	},
        
        	_intersectsWithSides: function(item) {
        
        		var isOverBottomHalf = this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
        			isOverRightHalf = this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
        			verticalDirection = this._getDragVerticalDirection(),
        			horizontalDirection = this._getDragHorizontalDirection();
        
        		if (this.floating && horizontalDirection) {
        			return ((horizontalDirection === "right" && isOverRightHalf) || (horizontalDirection === "left" && !isOverRightHalf));
        		} else {
        			return verticalDirection && ((verticalDirection === "down" && isOverBottomHalf) || (verticalDirection === "up" && !isOverBottomHalf));
        		}
        
        	},
        
        	_getDragVerticalDirection: function() {
        		var delta = this.positionAbs.top - this.lastPositionAbs.top;
        		return delta !== 0 && (delta > 0 ? "down" : "up");
        	},
        
        	_getDragHorizontalDirection: function() {
        		var delta = this.positionAbs.left - this.lastPositionAbs.left;
        		return delta !== 0 && (delta > 0 ? "right" : "left");
        	},
        
        	refresh: function(event) {
        		this._refreshItems(event);
        		this._setHandleClassName();
        		this.refreshPositions();
        		return this;
        	},
        
        	_connectWith: function() {
        		var options = this.options;
        		return options.connectWith.constructor === String ? [options.connectWith] : options.connectWith;
        	},
        
        	_getItemsAsjQuery: function(connected) {
        
        		var i, j, cur, inst,
        			items = [],
        			queries = [],
        			connectWith = this._connectWith();
        
        		if(connectWith && connected) {
        			for (i = connectWith.length - 1; i >= 0; i--){
        				cur = $(connectWith[i], this.document[0]);
        				for ( j = cur.length - 1; j >= 0; j--){
        					inst = $.data(cur[j], this.widgetFullName);
        					if(inst && inst !== this && !inst.options.disabled) {
        						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), inst]);
        					}
        				}
        			}
        		}
        
        		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);
        
        		function addItems() {
        			items.push( this );
        		}
        		for (i = queries.length - 1; i >= 0; i--){
        			queries[i][0].each( addItems );
        		}
        
        		return $(items);
        
        	},
        
        	_removeCurrentsFromItems: function() {
        
        		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");
        
        		this.items = $.grep(this.items, function (item) {
        			for (var j=0; j < list.length; j++) {
        				if(list[j] === item.item[0]) {
        					return false;
        				}
        			}
        			return true;
        		});
        
        	},
        
        	_refreshItems: function(event) {
        
        		this.items = [];
        		this.containers = [this];
        
        		var i, j, cur, inst, targetData, _queries, item, queriesLength,
        			items = this.items,
        			queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]],
        			connectWith = this._connectWith();
        
        		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
        			for (i = connectWith.length - 1; i >= 0; i--){
        				cur = $(connectWith[i], this.document[0]);
        				for (j = cur.length - 1; j >= 0; j--){
        					inst = $.data(cur[j], this.widgetFullName);
        					if(inst && inst !== this && !inst.options.disabled) {
        						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
        						this.containers.push(inst);
        					}
        				}
        			}
        		}
        
        		for (i = queries.length - 1; i >= 0; i--) {
        			targetData = queries[i][1];
        			_queries = queries[i][0];
        
        			for (j=0, queriesLength = _queries.length; j < queriesLength; j++) {
        				item = $(_queries[j]);
        
        				item.data(this.widgetName + "-item", targetData); // Data for target checking (mouse manager)
        
        				items.push({
        					item: item,
        					instance: targetData,
        					width: 0, height: 0,
        					left: 0, top: 0
        				});
        			}
        		}
        
        	},
        
        	refreshPositions: function(fast) {
        
        		// Determine whether items are being displayed horizontally
        		this.floating = this.items.length ?
        			this.options.axis === "x" || this._isFloating( this.items[ 0 ].item ) :
        			false;
        
        		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
        		if(this.offsetParent && this.helper) {
        			this.offset.parent = this._getParentOffset();
        		}
        
        		var i, item, t, p;
        
        		for (i = this.items.length - 1; i >= 0; i--){
        			item = this.items[i];
        
        			//We ignore calculating positions of all connected containers when we're not over them
        			if(item.instance !== this.currentContainer && this.currentContainer && item.item[0] !== this.currentItem[0]) {
        				continue;
        			}
        
        			t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;
        
        			if (!fast) {
        				item.width = t.outerWidth();
        				item.height = t.outerHeight();
        			}
        
        			p = t.offset();
        			item.left = p.left;
        			item.top = p.top;
        		}
        
        		if(this.options.custom && this.options.custom.refreshContainers) {
        			this.options.custom.refreshContainers.call(this);
        		} else {
        			for (i = this.containers.length - 1; i >= 0; i--){
        				p = this.containers[i].element.offset();
        				this.containers[i].containerCache.left = p.left;
        				this.containers[i].containerCache.top = p.top;
        				this.containers[i].containerCache.width = this.containers[i].element.outerWidth();
        				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
        			}
        		}
        
        		return this;
        	},
        
        	_createPlaceholder: function(that) {
        		that = that || this;
        		var className,
        			o = that.options;
        
        		if(!o.placeholder || o.placeholder.constructor === String) {
        			className = o.placeholder;
        			o.placeholder = {
        				element: function() {
        
        					var nodeName = that.currentItem[0].nodeName.toLowerCase(),
        						element = $( "<" + nodeName + ">", that.document[0] )
        							.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
        							.removeClass("ui-sortable-helper");
        
        					if ( nodeName === "tbody" ) {
        						that._createTrPlaceholder(
        							that.currentItem.find( "tr" ).eq( 0 ),
        							$( "<tr>", that.document[ 0 ] ).appendTo( element )
        						);
        					} else if ( nodeName === "tr" ) {
        						that._createTrPlaceholder( that.currentItem, element );
        					} else if ( nodeName === "img" ) {
        						element.attr( "src", that.currentItem.attr( "src" ) );
        					}
        
        					if ( !className ) {
        						element.css( "visibility", "hidden" );
        					}
        
        					return element;
        				},
        				update: function(container, p) {
        
        					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
        					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
        					if(className && !o.forcePlaceholderSize) {
        						return;
        					}
        
        					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
        					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css("paddingTop")||0, 10) - parseInt(that.currentItem.css("paddingBottom")||0, 10)); }
        					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css("paddingLeft")||0, 10) - parseInt(that.currentItem.css("paddingRight")||0, 10)); }
        				}
        			};
        		}
        
        		//Create the placeholder
        		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));
        
        		//Append it after the actual current item
        		that.currentItem.after(that.placeholder);
        
        		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
        		o.placeholder.update(that, that.placeholder);
        
        	},
        
        	_createTrPlaceholder: function( sourceTr, targetTr ) {
        		var that = this;
        
        		sourceTr.children().each(function() {
        			$( "<td>&#160;</td>", that.document[ 0 ] )
        				.attr( "colspan", $( this ).attr( "colspan" ) || 1 )
        				.appendTo( targetTr );
        		});
        	},
        
        	_contactContainers: function(event) {
        		var i, j, dist, itemWithLeastDistance, posProperty, sizeProperty, cur, nearBottom, floating, axis,
        			innermostContainer = null,
        			innermostIndex = null;
        
        		// get innermost container that intersects with item
        		for (i = this.containers.length - 1; i >= 0; i--) {
        
        			// never consider a container that's located within the item itself
        			if($.contains(this.currentItem[0], this.containers[i].element[0])) {
        				continue;
        			}
        
        			if(this._intersectsWith(this.containers[i].containerCache)) {
        
        				// if we've already found a container and it's more "inner" than this, then continue
        				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0])) {
        					continue;
        				}
        
        				innermostContainer = this.containers[i];
        				innermostIndex = i;
        
        			} else {
        				// container doesn't intersect. trigger "out" event if necessary
        				if(this.containers[i].containerCache.over) {
        					this.containers[i]._trigger("out", event, this._uiHash(this));
        					this.containers[i].containerCache.over = 0;
        				}
        			}
        
        		}
        
        		// if no intersecting containers found, return
        		if(!innermostContainer) {
        			return;
        		}
        
        		// move the item into the container if it's not there already
        		if(this.containers.length === 1) {
        			if (!this.containers[innermostIndex].containerCache.over) {
        				this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
        				this.containers[innermostIndex].containerCache.over = 1;
        			}
        		} else {
        
        			//When entering a new container, we will find the item with the least distance and append our item near it
        			dist = 10000;
        			itemWithLeastDistance = null;
        			floating = innermostContainer.floating || this._isFloating(this.currentItem);
        			posProperty = floating ? "left" : "top";
        			sizeProperty = floating ? "width" : "height";
        			axis = floating ? "clientX" : "clientY";
        
        			for (j = this.items.length - 1; j >= 0; j--) {
        				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) {
        					continue;
        				}
        				if(this.items[j].item[0] === this.currentItem[0]) {
        					continue;
        				}
        
        				cur = this.items[j].item.offset()[posProperty];
        				nearBottom = false;
        				if ( event[ axis ] - cur > this.items[ j ][ sizeProperty ] / 2 ) {
        					nearBottom = true;
        				}
        
        				if ( Math.abs( event[ axis ] - cur ) < dist ) {
        					dist = Math.abs( event[ axis ] - cur );
        					itemWithLeastDistance = this.items[ j ];
        					this.direction = nearBottom ? "up": "down";
        				}
        			}
        
        			//Check if dropOnEmpty is enabled
        			if(!itemWithLeastDistance && !this.options.dropOnEmpty) {
        				return;
        			}
        
        			if(this.currentContainer === this.containers[innermostIndex]) {
        				if ( !this.currentContainer.containerCache.over ) {
        					this.containers[ innermostIndex ]._trigger( "over", event, this._uiHash() );
        					this.currentContainer.containerCache.over = 1;
        				}
        				return;
        			}
        
        			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
        			this._trigger("change", event, this._uiHash());
        			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
        			this.currentContainer = this.containers[innermostIndex];
        
        			//Update the placeholder
        			this.options.placeholder.update(this.currentContainer, this.placeholder);
        
        			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
        			this.containers[innermostIndex].containerCache.over = 1;
        		}
        
        
        	},
        
        	_createHelper: function(event) {
        
        		var o = this.options,
        			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper === "clone" ? this.currentItem.clone() : this.currentItem);
        
        		//Add the helper to the DOM if that didn't happen already
        		if(!helper.parents("body").length) {
        			$(o.appendTo !== "parent" ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
        		}
        
        		if(helper[0] === this.currentItem[0]) {
        			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };
        		}
        
        		if(!helper[0].style.width || o.forceHelperSize) {
        			helper.width(this.currentItem.width());
        		}
        		if(!helper[0].style.height || o.forceHelperSize) {
        			helper.height(this.currentItem.height());
        		}
        
        		return helper;
        
        	},
        
        	_adjustOffsetFromHelper: function(obj) {
        		if (typeof obj === "string") {
        			obj = obj.split(" ");
        		}
        		if ($.isArray(obj)) {
        			obj = {left: +obj[0], top: +obj[1] || 0};
        		}
        		if ("left" in obj) {
        			this.offset.click.left = obj.left + this.margins.left;
        		}
        		if ("right" in obj) {
        			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
        		}
        		if ("top" in obj) {
        			this.offset.click.top = obj.top + this.margins.top;
        		}
        		if ("bottom" in obj) {
        			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
        		}
        	},
        
        	_getParentOffset: function() {
        
        
        		//Get the offsetParent and cache its position
        		this.offsetParent = this.helper.offsetParent();
        		var po = this.offsetParent.offset();
        
        		// This is a special case where we need to modify a offset calculated on start, since the following happened:
        		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
        		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
        		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
        		if(this.cssPosition === "absolute" && this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) {
        			po.left += this.scrollParent.scrollLeft();
        			po.top += this.scrollParent.scrollTop();
        		}
        
        		// This needs to be actually done for all browsers, since pageX/pageY includes this information
        		// with an ugly IE fix
        		if( this.offsetParent[0] === this.document[0].body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
        			po = { top: 0, left: 0 };
        		}
        
        		return {
        			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
        			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
        		};
        
        	},
        
        	_getRelativeOffset: function() {
        
        		if(this.cssPosition === "relative") {
        			var p = this.currentItem.position();
        			return {
        				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
        				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
        			};
        		} else {
        			return { top: 0, left: 0 };
        		}
        
        	},
        
        	_cacheMargins: function() {
        		this.margins = {
        			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
        			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
        		};
        	},
        
        	_cacheHelperProportions: function() {
        		this.helperProportions = {
        			width: this.helper.outerWidth(),
        			height: this.helper.outerHeight()
        		};
        	},
        
        	_setContainment: function() {
        
        		var ce, co, over,
        			o = this.options;
        		if(o.containment === "parent") {
        			o.containment = this.helper[0].parentNode;
        		}
        		if(o.containment === "document" || o.containment === "window") {
        			this.containment = [
        				0 - this.offset.relative.left - this.offset.parent.left,
        				0 - this.offset.relative.top - this.offset.parent.top,
        				o.containment === "document" ? this.document.width() : this.window.width() - this.helperProportions.width - this.margins.left,
        				(o.containment === "document" ? this.document.width() : this.window.height() || this.document[0].body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
        			];
        		}
        
        		if(!(/^(document|window|parent)$/).test(o.containment)) {
        			ce = $(o.containment)[0];
        			co = $(o.containment).offset();
        			over = ($(ce).css("overflow") !== "hidden");
        
        			this.containment = [
        				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
        				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
        				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
        				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
        			];
        		}
        
        	},
        
        	_convertPositionTo: function(d, pos) {
        
        		if(!pos) {
        			pos = this.position;
        		}
        		var mod = d === "absolute" ? 1 : -1,
        			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
        			scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
        
        		return {
        			top: (
        				pos.top	+																// The absolute mouse position
        				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.top * mod -											// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
        			),
        			left: (
        				pos.left +																// The absolute mouse position
        				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
        			)
        		};
        
        	},
        
        	_generatePosition: function(event) {
        
        		var top, left,
        			o = this.options,
        			pageX = event.pageX,
        			pageY = event.pageY,
        			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
        
        		// This is another very weird special case that only happens for relative elements:
        		// 1. If the css position is relative
        		// 2. and the scroll parent is the document or similar to the offset parent
        		// we have to refresh the relative offset during the scroll so there are no jumps
        		if(this.cssPosition === "relative" && !(this.scrollParent[0] !== this.document[0] && this.scrollParent[0] !== this.offsetParent[0])) {
        			this.offset.relative = this._getRelativeOffset();
        		}
        
        		/*
        		 * - Position constraining -
        		 * Constrain the position to a mix of grid, containment.
        		 */
        
        		if(this.originalPosition) { //If we are not dragging yet, we won't check for options
        
        			if(this.containment) {
        				if(event.pageX - this.offset.click.left < this.containment[0]) {
        					pageX = this.containment[0] + this.offset.click.left;
        				}
        				if(event.pageY - this.offset.click.top < this.containment[1]) {
        					pageY = this.containment[1] + this.offset.click.top;
        				}
        				if(event.pageX - this.offset.click.left > this.containment[2]) {
        					pageX = this.containment[2] + this.offset.click.left;
        				}
        				if(event.pageY - this.offset.click.top > this.containment[3]) {
        					pageY = this.containment[3] + this.offset.click.top;
        				}
        			}
        
        			if(o.grid) {
        				top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
        				pageY = this.containment ? ( (top - this.offset.click.top >= this.containment[1] && top - this.offset.click.top <= this.containment[3]) ? top : ((top - this.offset.click.top >= this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;
        
        				left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
        				pageX = this.containment ? ( (left - this.offset.click.left >= this.containment[0] && left - this.offset.click.left <= this.containment[2]) ? left : ((left - this.offset.click.left >= this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
        			}
        
        		}
        
        		return {
        			top: (
        				pageY -																// The absolute mouse position
        				this.offset.click.top -													// Click offset (relative to the element)
        				this.offset.relative.top	-											// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
        			),
        			left: (
        				pageX -																// The absolute mouse position
        				this.offset.click.left -												// Click offset (relative to the element)
        				this.offset.relative.left	-											// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
        			)
        		};
        
        	},
        
        	_rearrange: function(event, i, a, hardRefresh) {
        
        		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction === "down" ? i.item[0] : i.item[0].nextSibling));
        
        		//Various things done here to improve the performance:
        		// 1. we create a setTimeout, that calls refreshPositions
        		// 2. on the instance, we have a counter variable, that get's higher after every append
        		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
        		// 4. this lets only the last addition to the timeout stack through
        		this.counter = this.counter ? ++this.counter : 1;
        		var counter = this.counter;
        
        		this._delay(function() {
        			if(counter === this.counter) {
        				this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
        			}
        		});
        
        	},
        
        	_clear: function(event, noPropagation) {
        
        		this.reverting = false;
        		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
        		// everything else normalized again
        		var i,
        			delayedTriggers = [];
        
        		// We first have to update the dom position of the actual currentItem
        		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
        		if(!this._noFinalSort && this.currentItem.parent().length) {
        			this.placeholder.before(this.currentItem);
        		}
        		this._noFinalSort = null;
        
        		if(this.helper[0] === this.currentItem[0]) {
        			for(i in this._storedCSS) {
        				if(this._storedCSS[i] === "auto" || this._storedCSS[i] === "static") {
        					this._storedCSS[i] = "";
        				}
        			}
        			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
        		} else {
        			this.currentItem.show();
        		}
        
        		if(this.fromOutside && !noPropagation) {
        			delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
        		}
        		if((this.fromOutside || this.domPosition.prev !== this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent !== this.currentItem.parent()[0]) && !noPropagation) {
        			delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
        		}
        
        		// Check if the items Container has Changed and trigger appropriate
        		// events.
        		if (this !== this.currentContainer) {
        			if(!noPropagation) {
        				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
        				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
        				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
        			}
        		}
        
        
        		//Post events to containers
        		function delayEvent( type, instance, container ) {
        			return function( event ) {
        				container._trigger( type, event, instance._uiHash( instance ) );
        			};
        		}
        		for (i = this.containers.length - 1; i >= 0; i--){
        			if (!noPropagation) {
        				delayedTriggers.push( delayEvent( "deactivate", this, this.containers[ i ] ) );
        			}
        			if(this.containers[i].containerCache.over) {
        				delayedTriggers.push( delayEvent( "out", this, this.containers[ i ] ) );
        				this.containers[i].containerCache.over = 0;
        			}
        		}
        
        		//Do what was originally in plugins
        		if ( this.storedCursor ) {
        			this.document.find( "body" ).css( "cursor", this.storedCursor );
        			this.storedStylesheet.remove();
        		}
        		if(this._storedOpacity) {
        			this.helper.css("opacity", this._storedOpacity);
        		}
        		if(this._storedZIndex) {
        			this.helper.css("zIndex", this._storedZIndex === "auto" ? "" : this._storedZIndex);
        		}
        
        		this.dragging = false;
        
        		if(!noPropagation) {
        			this._trigger("beforeStop", event, this._uiHash());
        		}
        
        		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
        		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
        
        		if ( !this.cancelHelperRemoval ) {
        			if ( this.helper[ 0 ] !== this.currentItem[ 0 ] ) {
        				this.helper.remove();
        			}
        			this.helper = null;
        		}
        
        		if(!noPropagation) {
        			for (i=0; i < delayedTriggers.length; i++) {
        				delayedTriggers[i].call(this, event);
        			} //Trigger all delayed events
        			this._trigger("stop", event, this._uiHash());
        		}
        
        		this.fromOutside = false;
        		return !this.cancelHelperRemoval;
        
        	},
        
        	_trigger: function() {
        		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
        			this.cancel();
        		}
        	},
        
        	_uiHash: function(_inst) {
        		var inst = _inst || this;
        		return {
        			helper: inst.helper,
        			placeholder: inst.placeholder || $([]),
        			position: inst.position,
        			originalPosition: inst.originalPosition,
        			offset: inst.positionAbs,
        			item: inst.currentItem,
        			sender: _inst ? _inst.element : null
        		};
        	}
        
        });
        
        
        
        }));
        ;
        
        // source: plugin/customControl/js/customControl.js
        ﻿$(function () {
            function CustomControlViewModel(parameters) {
                var self = this;
        
                self.loginState = parameters[0];
                self.settingsViewModel = parameters[1];
                self.controlViewModel = parameters[2];
        
                self.customControlDialogViewModel = parameters[3];
        
                self.popup = undefined;
        
                self.controls = ko.observableArray([]);
        
                self.controlsFromServer = [];
                self.additionalControls = [];
        
                self.staticID = 0;
        
                self._showPopup = function (options, eventListeners) {
                    if (self.popup !== undefined) {
                        self.popup.remove();
                    }
                    self.popup = new PNotify(options);
        
                    if (eventListeners) {
                        var popupObj = self.popup.get();
                        _.each(eventListeners, function (value, key) {
                            popupObj.on(key, value);
                        })
                    }
                };
        
                self.onSettingsShown = function () {
                    self.requestData();
                };
        
                self.requestData = function () {
                    $.ajax({
                        url: API_BASEURL + "printer/command/custom",
                        method: "GET",
                        dataType: "json",
                        success: function (response) {
                            self._fromResponse(response);
                        }
                    });
                };
        
                self._fromResponse = function (response) {
                    self.controlsFromServer = response.controls;
                    self.rerenderControls();
                };
        
                self.rerenderControls = function () {
        
                    // TODO: Brainstorming about how to handle additionalControls...
        
                    self.staticID = 0;
                    self.controls(undefined);
                    self.controls(self._processControls(undefined, self.controlsFromServer));
        
                    $(".innerSortable").sortable({
                        connectWith: ".innerSortable",
                        items: "> .sortable",
                        cancel: '',
                        sort: function (event, ui) {
                          var self = $(this),
                              width = ui.helper.outerWidth(),
                              top = ui.helper.position().top;//changed to ;
        
                          self.children().each(function () {
                            if ($(this).hasClass('ui-sortable-helper') || $(this).hasClass('ui-sortable-placeholder')) {
                              return true;
                            }
                            // If overlap is more than half of the dragged item
                            var distance = Math.abs(ui.position.left - $(this).position().left),
                                before = ui.position.left > $(this).position().left;
        
                            if ((width - distance) > (width / 2) && (distance < width) && $(this).position().top === top) {
                              if (before) {
                                $('.ui-sortable-placeholder', self).insertBefore($(this));
                              } else {
                                $('.ui-sortable-placeholder', self).insertAfter($(this));
                              }
                              return false;
                            }
                          });
                        },
                        update: function(event, ui) {
                            var target = ko.dataFor(this);
                            var item = ko.dataFor(ui.item[0]);
        
                            if (target == undefined) {
                                return;
                            } else {
                                if (target == self) {
                                    if (!item.hasOwnProperty("children")) {
                                        return;
                                    }
                                }
                                else if (!target.hasOwnProperty("children")) {
                                    return;
                                }
                            }
        
                            var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
                            if (position >= 0) {
                                if (item.parent != undefined) {
                                    item.parent.children.remove(item);
        
                                    if (target == self)
                                        self.controlsFromServer.splice(position, 0, item);
                                    else
                                        target.children.splice(position, 0, item);
                                } else {
                                    self.controlsFromServer = _.without(self.controlsFromServer, item);
                                    if (target == self)
                                        self.controlsFromServer.splice(position, 0, item);
                                    else
                                        target.children.splice(position, 0, item);
                                }
                            }
                        },
                        stop: function(event, ui) {
                            self.rerenderControls();
                        }
                    }).disableSelection();
                };
        
                self._processControls = function (parent, controls) {
                    for (var i = 0; i < controls.length; i++) {
                        controls[i] = self._processControl(parent, controls[i]);
                    }
                    return controls;
                };
        
                self._processInput = function (list) {
                    var inputs = [];
        
                    var attributeToInt = function (obj, key, def) {
                        if (obj.hasOwnProperty(key)) {
                            var val = obj[key];
                            if (_.isNumber(val)) {
                                return val;
                            }
        
                            var parsedVal = parseInt(val);
                            if (!isNaN(parsedVal)) {
                                return parsedVal;
                            }
                        }
                        return def;
                    };
        
                    _.each(list, function (element, index, l) {
                        var input = {
                            name: ko.observable(element.name),
                            parameter: ko.observable(element.parameter),
                            default: ko.observable(element.hasOwnProperty("default") ? element.default : undefined)
                        }
        
                        if (element.hasOwnProperty("slider") && _.isObject(element.slider)) {
                            input.slider = {
                                min: ko.observable(element.slider.min),
                                max: ko.observable(element.slider.max),
                                step: ko.observable(element.slider.step)
                            }
        
                            var defaultValue = attributeToInt(element, "default", attributeToInt(element.slider, "min", 0));
        
                            // if default value is not within range of min and max, correct that
                            if (!_.inRange(defaultValue, element.slider.min, element.slider.max)) {
                                // use bound closer to configured default value
                                defaultValue = defaultValue < element.slider.min ? element.slider.min : element.slider.max;
                            }
        
                            input.value = ko.observable(defaultValue);
                        }
                        else {
                            input.slider = false;
                            input.value = input.default;
                        }
        
                        inputs.push(input);
                    });
        
                    return inputs;
                }
                self._processControl = function (parent, control) {
                    if (control.processed) {
                        control.id("settingsCustomControl_id" + self.staticID++);
                    }
                    else {
                        control.id = ko.observable("settingsCustomControl_id" + self.staticID++);
                    }
                    control.parent = parent;
        
                    if (control.processed) {
                        if (control.hasOwnProperty("children")) {
                            control.children(self._processControls(control, control.children()));
                        }
        
                        return control;
                    }
        
                    if (control.hasOwnProperty("template") && control.hasOwnProperty("regex")) {
                        control.template = ko.observable(control.template);
                        control.regex = ko.observable(control.regex);
                        control.default = ko.observable(control.default || "");
                        control.value = ko.computed(function () { return control.default(); });
        
                        delete control.key;
                        delete control.template_key;
                    }
        
                    if (control.hasOwnProperty("children")) {
                        control.children = ko.observableArray(self._processControls(control, control.children));
                        if (!control.hasOwnProperty("layout") || !(control.layout == "vertical" || control.layout == "horizontal" || control.layout == "horizontal_grid"))
                            control.layout = ko.observable("vertical");
                        else
                            control.layout = ko.observable(control.layout);
        
                        if (control.hasOwnProperty("collapsed"))
                            control.collapsed = ko.observable(control.collapsed);
                        else
                            control.collapsed = ko.observable(false);
                    }
                    
                    if (control.hasOwnProperty("input")) {
                        control.input = ko.observableArray(self._processInput(control.input));
                    }
        
                    control.name = ko.observable(control.name || "");
        
                    control.width = ko.observable(control.hasOwnProperty("width") ? control.width : "2");
                    control.offset = ko.observable(control.hasOwnProperty("offset") ? control.offset : "");
        
                    var js;
                    if (control.hasOwnProperty("javascript")) {
                        control.javascript = control.javascript;
                    }
        
                    if (control.hasOwnProperty("enabled")) {
                        control.enabled = control.enabled;
                    }
        
                    control.processed = true;
                    return control;
                };
        
                self.displayMode = function (customControl) {
                    if (customControl.hasOwnProperty("children")) {
                        return (customControl.hasOwnProperty("name") && customControl.name() != "") ? "settingsCustomControls_containerTemplate_collapsable" : "settingsCustomControls_containerTemplate_nameless";
                    } else {
                        return "settingsCustomControls_controlTemplate";
                    }
                }
        
                self.rowCss = function (customControl) {
                    var span = "span2";
                    var offset = "";
                    if (customControl.hasOwnProperty("width") && customControl.width() != "") {
                        span = "span" + customControl.width();
                    }
                    if (customControl.hasOwnProperty("offset") && customControl.offset() != "") {
                        offset = "offset" + customControl.offset();
                    }
                    return "sortable " + span + " " + offset;
                };
        
                self.searchElement = function (list, id) {
                    for (var i = 0; i < list.length; i++)
                    {
                        if (list[i].id() == id)
                            return list[i];
        
                        if (list[i].hasOwnProperty("children")) {
                            var element = self.searchElement(list[i].children(), id);
                            if (element != undefined)
                                return element;
                        }
                    }
        
                    return undefined;
                }
        
                self.createElement = function (invokedOn, contextParent, selectedMenu) {
                    if (contextParent.attr('id') == "base") {
                        self.customControlDialogViewModel.reset();
        
                        self.customControlDialogViewModel.show(function (ret) {
                            self.controlsFromServer.push(ret);
                            self.rerenderControls();
                        });
                    }
                    else {
                        var parentElement = self.searchElement(self.controlsFromServer, contextParent.attr('id'));
                        if (parentElement == undefined) {
                            self._showPopup({
                                title: gettext("Something went wrong while creating the new Element"),
                                type: "error"
                            });
                            return;
                        }
        
                        self.customControlDialogViewModel.reset({ parent: parentElement });
        
                        self.customControlDialogViewModel.show(function (ret) {
                            parentElement.children.push(self._processControl(parentElement, ret));
                        });
                    }
                }
                self.deleteElement = function (invokedOn, contextParent, selectedMenu) {
                    var element = self.searchElement(self.controlsFromServer, contextParent.attr('id'));
                    if (element == undefined) {
                        self._showPopup({
                            title: gettext("Something went wrong while creating the new Element"),
                            type: "error"
                        });
                        return;
                    }
        
                    showConfirmationDialog("", function (e) {
                        if (element.parent != undefined)
                            element.parent.children.remove(element);
                        else {
                            self.controlsFromServer = _.without(self.controlsFromServer, element);
                            self.rerenderControls();
                        }
                    });
                }
                self.editElement = function (invokedOn, contextParent, selectedMenu) {
                    var element = self.element = self.searchElement(self.controlsFromServer, contextParent.attr('id'));
                    if (element == undefined) {
                        self._showPopup({
                            title: gettext("Something went wrong while creating the new Element"),
                            type: "error"
                        });
                        return;
                    }
        
                    var title = "Edit Container";
                    var type = "container";
                    var data = {
                        parent: element.parent,
                    };
        
                    if (element.hasOwnProperty("name")) {
                        data.name = element.name();
                    }
                    if (element.hasOwnProperty("template")) {
                        data.template = element.template();
                        data.regex = element.regex();
                        data.defaultValue = element.default() || "";
        
                        title = "Edit Output";
                        type = "output";
                    }
                    if (element.hasOwnProperty("layout")) {
                        data.layout = element.layout();
                        data.collapsed = element.collapsed();
        
                        title = "Edit Container";
                        type = "container";
                    }
                    if (element.hasOwnProperty("command")) {
                        data.commands = element.command;
        
                        title = "Edit Command";
                        type = "command";
                    }
                    if (element.hasOwnProperty("commands")) {
                        var commands = "";
                        _.each(element.commands, function (e, index, list) {
                            commands += e;
                            if (index < list.length)
                                commands += '\n';
                        });
                        data.commands = commands;
        
                        title = "Edit Command";
                        type = "command";
                    }
                    if (element.hasOwnProperty("script")) {
                        data.script = element.script;
        
                        title = "Edit Script command";
                        type = "script";
                    }
                    if (element.hasOwnProperty("confirm")) {
                        data.confirm = element.confirm;
                    }
                    if (element.hasOwnProperty("input"))
                    {
                        data.input = [];
                        _.each(element.input(), function (element, index, list) {
                            data.input[index] = ko.mapping.toJS(element);
                            if (element.hasOwnProperty("default")) {
                                data.input[index].defaultValue = element.default;
                            }
                        });
                    }
        
                    if (element.hasOwnProperty("width")) {
                        data.width = element.width();
                    }
                    if (element.hasOwnProperty("offset")) {
                        data.offset = element.offset();
                    }
        
                    self.customControlDialogViewModel.reset(data);
                    self.customControlDialogViewModel.title(gettext(title));
                    self.customControlDialogViewModel.type(type);
        
                    self.customControlDialogViewModel.show(function (ret) {
                        var element = self.element;
        
                        switch (self.customControlDialogViewModel.type()) {
                            case "container": {
                                element.name(ret.name);                           
                                element.layout(ret.layout);
                                element.collapsed(ret.collapsed);
                                break;
                            }
                            case "command": {
                                element.name(ret.name);
        
                                if (ret.command != undefined) {
                                    element.command = ret.command;
                                    delete element.commands;
                                }
                                if (ret.commands != undefined) {
                                    element.commands = ret.commands;
                                    delete element.command;
                                }
        
                                if (ret.confirm != "") {
                                    element.confirm = ret.confirm;
                                }
        
                                if (ret.input != undefined) {
                                    _.each(ret.input, function (element, index, list) {
                                        data.input[index] = ko.mapping.toJS(element);
                                    });
        
                                    element.input(self._processInput(ret.input));
                                }
                                else
                                    delete element.input;
        
                                // Command can also be a output
                                if (ret.hasOwnProperty("template")) {
                                    if (element.hasOwnProperty("template"))
                                        element.template(ret.template);
                                    else
                                        element.template = ko.observable(ret.template);
        
                                    if (element.hasOwnProperty("regex"))
                                        element.regex(ret.regex);
                                    else
                                        element.regex = ko.observable(ret.regex);
        
                                    if (element.hasOwnProperty("default"))
                                        element.default(ret.default);
                                    else
                                        element.default = ko.observable(ret.default);
                                }
                                else
                                {
                                    if (element.hasOwnProperty("default"))
                                        element.default(undefined);
        
                                    delete element.template;
                                    delete element.regex;
                                    delete element.default;
                                }
                                break;
                            }
                            case "script": {
                                element.name(ret.name);
                                element.script = ret.script;
        
                                if (ret.confirm != "") {
                                    element.confirm = ret.confirm;
                                }
        
                                if (ret.input != undefined) {
                                    element.input(self._processInput(ret.input));
                                }
                                else
                                    delete element.input;
        
                                break;
                            }
                            case "output": {
                                element.template(ret.template);
                                element.regex(ret.regex);
                                element.default(ret.defaultValue);
                                break;
                            }
                        }
        
                        if (element.parent && element.parent.layout() == "horizontal_grid") {
                            if (ret.width != undefined && ret.width != "")
                                element.width(ret.width);
        
                            if (ret.offset != undefined && ret.offset != "")
                                element.offset(ret.offset);
                        }
                    });
                }
        
                self.controlContextMenu = function (invokedOn, contextParent, selectedMenu)
                {
                    switch (selectedMenu.attr('cmd')) {
                        case "editElement": {
                            self.editElement(invokedOn, contextParent, selectedMenu);
                            break;
                        }
                        case "deleteElement": {
                            self.deleteElement(invokedOn, contextParent, selectedMenu);
                            break;
                        }
                        default: {
                            if (selectedMenu.attr('cmd').startsWith("create")) {
                                switch (selectedMenu.attr('cmd')) {
                                    case "createContainer": {
                                        self.customControlDialogViewModel.title(gettext("Create container"));
                                        self.customControlDialogViewModel.type("container");
                                        break;
                                    }
                                    case "createCommand": {
                                        self.customControlDialogViewModel.title(gettext("Create Command"));
                                        self.customControlDialogViewModel.type("command");
                                        break;
                                    }
                                    case "createScript": {
                                        self.customControlDialogViewModel.title(gettext("Create Script"));
                                        self.customControlDialogViewModel.type("script");
                                        break;
                                    }
                                    case "createOutput": {
                                        self.customControlDialogViewModel.title(gettext("Create Output"));
                                        self.customControlDialogViewModel.type("output");
                                        break;
                                    }
                                }
        
                                self.createElement(invokedOn, contextParent, selectedMenu);
                            }
                            break;
                        }
                    }
                }
        
                self.editStyle = function (type) {
                }
               
                self.recursiveDeleteProperties = function (list) {
                    _.each(list, function (element, index, ll) {
                        if (!element.parent || (element.parent.hasOwnProperty("layout") && element.parent.layout() != "horizontal_grid")) {
                            delete element.width;
                            delete element.offset;
                        }
        
                        if (element.default == "")
                            delete element.default;
        
                        delete element.id;
                        delete element.parent;
                        delete element.processed;
                        delete element.output;
                        delete element.key;
                        delete element.template_key;
                        delete element.value;
        
                        if (element.hasOwnProperty("input")) {
                            _.each(element.input(), function (e, i, l) {
                                if (e.default == "")
                                    delete e.default;
        
                                delete e.value;
                            });
                        }
        
                        if (element.hasOwnProperty("width") && element.width() == "")
                            delete element.width;
                        if (element.hasOwnProperty("offset") && element.offset() == "")
                            delete element.offset;
        
                        if (!element.hasOwnProperty("name") || element.name() == "") {
                            delete element.name;
                            delete element.collapsed;
                        }
        
        
                        if (element.hasOwnProperty("children")) {
                            if (element.hasOwnProperty("collapsed") && !element.collapsed())
                                delete element.collapsed;
        
                            self.recursiveDeleteProperties(element.children());
                        }
                    });
                }
                self.onSettingsBeforeSave = function () {
                    self.recursiveDeleteProperties(self.controlsFromServer);
                    self.settingsViewModel.settings.plugins.customControl.controls = self.controlsFromServer;
                }
        
                self.onEventSettingsUpdated = function (payload) {
                    self.requestData();
                }
            }
        
            // view model class, parameters for constructor, container to bind to
            OCTOPRINT_VIEWMODELS.push([
                CustomControlViewModel,
                ["loginStateViewModel", "settingsViewModel", "controlViewModel", "customControlDialogViewModel"],
                "#settings_plugin_customControl"
            ]);
        });
        ;
        
        // source: plugin/customControl/js/customControlDialog.js
        ﻿$(function () {
            function customControlDialogViewModel(parameters) {
                var self = this;
        
                self.element = ko.observable();
        
                self.title = ko.observable(gettext("Create Container"));
                self.type = ko.observable("container");
        
                self.useInputs = ko.observable(false);
                self.useConfirm = ko.observable(false);
                self.useOutput = ko.observable(false);
                self.useJavaScript = ko.observable(false);
                self.useEnabled = ko.observable(false);
        
                self.layouts = ko.observableArray([
                    { name: gettext("Vertical"), key: "vertical" },
                    { name: gettext("Horizontal"), key: "horizontal" },
                    { name: gettext("Horizontal grid"), key: "horizontal_grid" }
                ]);
                self.types = ko.observableArray([
                    { name: gettext("Container"), key: "container" },
                    { name: gettext("Command"), key: "command" },
                    { name: gettext("Script"), key: "script" },
                    { name: gettext("Output"), key: "output" },
                ]);
        
                self.hasSlider = ko.computed(function () {
                    if (self.element() == undefined || self.element().input == undefined)
                        return false;
        
                    var inputs = self.element().input()
                    for(var i = 0; i < inputs.length; i++)    
                    {
                        if (inputs[i].hasOwnProperty("slider")) {
                            if (typeof inputs[i].slider == "object")
                                return true;
                        }
                    }
                    return false;
                });
                self.span = function(parameter) {
                    return ko.computed(function () {
                        if (self.hasSlider())
                            return "span2";
        
                        switch (parameter) {
                            case "name":
                            case "parameter":
                                return "span4";
                            case "default":
                                return "span3";
                        }
        
                        return "span2";
                    });
                }
        
                self.reset = function (data) {
                    var element = {
                        name: undefined,
                        collapsed: false,
                        commands: "",
                        confirm: "",
                        defaultValue: "",
                        script: "",
                        javascript: "",
                        enabled: "",
                        input: [],
                        layout: "vertical",
                        regex: "",
                        template: "",
                        confirm: "",
                        width: "2",
                        offset: "",
                        parent: undefined
                    };
        
                    if (typeof data == "object") {
                        element = _.extend(element, data);
        
                        self.useConfirm(data.hasOwnProperty("confirm"));
                        self.useInputs(data.hasOwnProperty("input"));
                        self.useOutput(data.hasOwnProperty("template"));
                    }
        
                    self.element(ko.mapping.fromJS(element));
                }
                self.show = function (f) {
                    var dialog = $("#customControlDialog");
                    var primarybtn = $('div.modal-footer .btn-primary', dialog);
        
                    primarybtn.unbind('click').bind('click', function (e) {
                        var obj = ko.mapping.toJS(self.element());
        
                        var el = {};
                        switch (self.type()) {
                            case "container": {
                                el.name = obj.name;
                                el.layout = obj.layout;
                                el.collapsed = obj.collapsed;
        
                                el.children = [];
                                break;
                            }
                            case "command": {
                                el.name = obj.name;
                                if (obj.commands.indexOf('\n') == -1)
                                    el.command = obj.commands;
                                else
                                    el.commands = obj.commands.split('\n');
        
                                if (self.useConfirm()) {
                                    el.confirm = obj.confirm;
                                }
        
                                if (self.useInputs()) {
                                    var attributeToInt = function (obj, key, def) {
                                        if (obj.hasOwnProperty(key)) {
                                            var val = obj[key];
                                            if (_.isNumber(val)) {
                                                return val;
                                            }
        
                                            var parsedVal = parseInt(val);
                                            if (!isNaN(parsedVal)) {
                                                return parsedVal;
                                            }
                                        }
                                        return def;
                                    };
        
                                    el.input = [];
                                    _.each(obj.input, function (element, index, list) {
                                        var input = {
                                            name: element.name,
                                            parameter: element.parameter,
                                            default: element.defaultValue
                                        };
                                        if (element.hasOwnProperty("slider") && element.slider != false) {
                                            input["slider"] = {
                                            };
        
                                            input.default = attributeToInt(element, "defaultValue", undefined);
        
                                            if (element.slider.hasOwnProperty("min") && element.slider.min != "")
                                                input.slider.min = element.slider.min;
                                            if (element.slider.hasOwnProperty("max") && element.slider.max != "")
                                                input.slider.max = element.slider.max;
                                            if (element.slider.hasOwnProperty("step") && element.slider.step != "")
                                                input.slider.step = element.slider.step;
                                        }
        
                                        el.input.push(input);
                                    });
                                }
        
                                if (self.useOutput()) {
                                    el.template = obj.template;
                                    el.regex = obj.regex;
                                    el.default = obj.defaultValue;
                                }
                                break;
                            }
                            case "script":
                                {
                                    el.name = obj.name;
                                    el.script = obj.script;
        
                                    if (self.useConfirm()) {
                                        el.confirm = obj.confirm;
                                    }
        
                                    if (self.useInputs()) {
                                        el.input = [];
                                        _.each(obj.input, function (element, index, list) {
                                            var input = {
                                                name: element.name,
                                                parameter: element.parameter,
                                                defaultValue: !isNaN(element.defaultValue) ? element.defaultValue : undefined
                                            };
                                            if (element.hasOwnProperty("slider") && element.slider != false) {
                                                input["slider"] = {
                                                };
        
                                                input.defaultValue = !isNaN(element.defaultValue) && element.defaultValue != undefined && element.defaultValue != "" ? parseInt(element.defaultValue) : undefined;
        
                                                if (element.slider.min != "")
                                                    input.slider.min = parseInt(element.slider.min);
                                                if (element.slider.max != "")
                                                    input.slider.max = parseInt(element.slider.max);
                                                if (element.slider.step != "")
                                                    input.slider.step = parseInt(element.slider.step);
                                            }
        
                                            el.input.push(input);
                                        });
                                    }
                                    break;
                                }
                            case "output": {
                                el.template = obj.template;
                                el.regex = obj.regex;
                                el.defaultValue = obj.defaultValue;
                                break;
                            }
                        }
        
                        el.width = obj.width;
                        el.offset = obj.offset;
        
                        f(el);
                    });
        
                    dialog.modal({
                        show: 'true',
                        backdrop: 'static',
                        keyboard: false
                    });
                }
        
                self.removeInput = function (data) {
                    self.element().input.remove(data);
                }
                self.addInput = function () {
                    var obj = {
                        name: ko.observable(""),
                        parameter: ko.observable(""),
                        defaultValue: ko.observable(""),
                        slider: false
                    }
        
                    self.element().input.push(obj);
                }
                self.addSliderInput = function () {
                    var obj = {
                        name: ko.observable(""),
                        parameter: ko.observable(""),
                        defaultValue: ko.observable(),
                        slider: {
                            min: ko.observable(),
                            max: ko.observable(),
                            step: ko.observable()
                        }
                    }
        
                    self.element().input.push(obj);
                }
            }
        
            // view model class, parameters for constructor, container to bind to
            OCTOPRINT_VIEWMODELS.push([
                customControlDialogViewModel,
                [],
                "#customControlDialog"
            ]);
        });
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin customControl:", (error.stack || error));
    }
})();

// JS assets for plugin dashboard
(function () {
    try {
        // source: plugin/dashboard/js/dashboard.js
        /*
         * View model for OctoPrint-Dashboard
         *
         * Author: Stefan Cohen
         * License: AGPLv3
         */
        $(function() {    
            function DashboardViewModel(parameters) {
                var self = this;
        
                self.temperatureModel = parameters[0];
                self.printerStateModel = parameters[1];
                self.printerProfilesModel = parameters[2];
                self.connectionModel = parameters[3];
                self.settingsViewModel = parameters[4];
                self.displaylayerprogressViewModel = parameters[5];
                self.controlViewModel = parameters[6];
        
                
                self.totalLayer = ko.observable("-");
                self.currentLayer = ko.observable("-");
                self.currentHeight = ko.observable("-");
                self.totalHeightWithExtrusion = ko.observable("-");
                self.feedrate = ko.observable("-");
                self.feedrateG0 = ko.observable("-");
                self.feedrateG1 = ko.observable("-");
                self.fanspeed = ko.observable("Off");
                self.lastLayerDuration = ko.observable("-");
                self.averageLayerDuration = ko.observable("-");
                self.getEta = ko.observable();
                self.embedUrl = ko.observable("");
        
                self.cpuPercent = ko.observable(0);
                self.virtualMemPercent = ko.observable(0);
                self.diskUsagePercent = ko.observable(0);
                self.cpuTemp = ko.observable(0);
        
                
                //Notify user if displaylayerprogress plugin is not installed
                self.DisplayLayerProgressAvailable = function() {
                    if (self.settingsViewModel.settings.plugins.DisplayLayerProgress)
                        return;
                    else {
                        printerDisplay = new PNotify({
                            title: 'Dashboard',
                            type: 'warning',
                            text: 'Can\'t get stats from <a href="https://plugins.octoprint.org/plugins/DisplayLayerProgress/"" target="_blank">DisplayLayerProgress</a>. This plugin is required and provides GCode parsing for Fan Speed, Layer/Height info and Average layer time. Is it installed, enabled and on the latest version?',
                            hide: false
                            });
                        return "Warning: Can't get stats from <a href='https://plugins.octoprint.org/plugins/DisplayLayerProgress/' target='_blank'>DisplayLayerProgress</a>. Is it installed, enabled and on the latest version?";                
                    }
                };
        
                // Toggle fullscreen
                self.fullScreen = function() {
                    var elem = document.getElementById("dasboardContainer");
                    if (elem.requestFullscreen) {
                        if (!document.fullscreenElement) {
                            elem.requestFullscreen();
                        } else {
                          if (document.exitFullscreen) {
                            document.exitFullscreen(); 
                          }
                        }
                    } else if (elem.mozRequestFullScreen) { /* Firefox */
                        if (!document.mozFullscreenElement) {
                            elem.mozRequestFullScreen();
                        } else {
                          if (document.mozExitFullscreen) {
                            document.mozExitFullscreen(); 
                          }
                        }
                    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                        if (!document.webkitFullscreenElement) {
                            elem.webkitRequestFullscreen();
                        } else {
                          if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen(); 
                          }
                        }
                    } else if (elem.msRequestFullscreen) { /* IE/Edge */
                        if (!document.msFullscreenElement) {
                            elem.msRequestFullscreen();
                        } else {
                          if (document.msExitFullscreen) {
                            document.msExitFullscreen(); 
                          }
                        }
                    }
        
                    return
                }
        
                //Events from displaylayerprogress Plugin
                self.onDataUpdaterPluginMessage = function(plugin, data) {
                    if (plugin != "dashboard") {
                        return;
                        }
                    if (data.totalLayer) { self.totalLayer(data.totalLayer); }
                    if (data.currentLayer) { self.currentLayer(data.currentLayer); }
                    if (data.currentHeight) { self.currentHeight(data.currentHeight); }
                    if (data.totalHeightWithExtrusion) { self.totalHeightWithExtrusion(data.totalHeightWithExtrusion); }
                    if (data.feedrate) { self.feedrate(data.feedrate); }
                    if (data.feedrateG0) { self.feedrateG0(data.feedrateG0); }
                    if (data.feedrateG1) { self.feedrateG1(data.feedrateG1); }
                    if (data.fanspeed) { self.fanspeed(data.fanspeed); }
                    if (data.lastLayerDuration) { self.lastLayerDuration(data.lastLayerDuration); }
                    if (data.averageLayerDuration) { self.averageLayerDuration(data.averageLayerDuration); }
                    if (data.cpuPercent) { self.cpuPercent(data.cpuPercent); }
                    if (data.virtualMemPercent) { self.virtualMemPercent(data.virtualMemPercent); }
                    if (data.diskUsagePercent) { self.diskUsagePercent(data.diskUsagePercent); }
                    if (data.cpuTemp) { self.cpuTemp(data.cpuTemp); }
                };
        
                self.embedUrl = function() { 
                    if (self.settingsViewModel.settings.webcam && self.settingsViewModel.settings.plugins.dashboard.showWebCam) {
                            return self.settingsViewModel.settings.webcam.streamUrl();
                    }
                    else return "ERROR: Webcam not enabled in config.";
                };
        
                self.getEta = function(seconds) { 
                    dt = new Date();
                    dt.setSeconds( dt.getSeconds() + seconds )
                    return dt.toTimeString().split(' ')[0];
                };
        
                self.formatFanOffset = function(fanSpeed) {
                    fanSpeed = fanSpeed.replace("%", "");
                    fanSpeed = fanSpeed.replace("-", 1);
                    fanSpeed = fanSpeed.replace("Off", 1);
                    if (fanSpeed) {
                        return 350 * (1 - (fanSpeed / 100));
                    }
                    else return 0;
                };
        
                self.formatProgressOffset = function(currentProgress) {
                    if (currentProgress) {
                        return 339.292 * (1 - (currentProgress / 100));
                    }
                    else return "0.0";
                };
        
                self.formatTempOffset = function(temp, range) {
                    if (temp) {
                        return 350 * (1 - temp / range);
                    }
                    else return 350;            
                };
        
                self.formatConnectionstatus = function(currentStatus) {
                    if (currentStatus) {
                        return "Connected";
                    }
                    else return "Disconnected";
                };
              };
        
            // view model class, parameters for constructor, container to bind to
            OCTOPRINT_VIEWMODELS.push({
                construct: DashboardViewModel,
                dependencies: [  "temperatureViewModel", "printerStateViewModel", "printerProfilesViewModel", "connectionViewModel", "settingsViewModel", "displaylayerprogressViewModel", "controlViewModel" ],
                optional: [ "displaylayerprogressViewModel" ],
                elements: [ "#tab_plugin_dashboard" ]
            });
        });
        
        
        
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin dashboard:", (error.stack || error));
    }
})();

// JS assets for plugin eeprom_marlin
(function () {
    try {
        // source: plugin/eeprom_marlin/js/eeprom_marlin.js
        /**
         * Created by Salandora on 27.07.2015.
         */
        $(function() {
            function EepromMarlinViewModel(parameters) {
                var self = this;
        
                self.control = parameters[0];
                self.connection = parameters[1];
        
                self.firmwareRegEx = /FIRMWARE_NAME:[^\s]+/i;
                self.marlinRegEx = /Marlin[^\s]*/i;
        
                self.eepromM92RegEx = /M92 ([X])(.*)[^0-9]([Y])(.*)[^0-9]([Z])(.*)[^0-9]([E])(.*)/;
                self.eepromM203RegEx = /M203 ([X])(.*)[^0-9]([Y])(.*)[^0-9]([Z])(.*)[^0-9]([E])(.*)/;
                self.eepromM201RegEx = /M201 ([X])(.*)[^0-9]([Y])(.*)[^0-9]([Z])(.*)[^0-9]([E])(.*)/;
                self.eepromM204RegEx = /M204 ([S])(.*)[^0-9]([T])(.*)/;
                self.eepromM205RegEx = /M205 ([S])(.*)[^0-9]([T])(.*)[^0-9]([B])(.*)[^0-9]([X])(.*)[^0-9]([Z])(.*)[^0-9]([E])(.*)/;
                self.eepromM206RegEx = /M206 ([X])(.*)[^0-9]([Y])(.*)[^0-9]([Z])(.*)/;
                self.eepromM301RegEx = /M301 ([P])(.*)[^0-9]([I])(.*)[^0-9]([D])(.*)/;
                self.eepromM851RegEx = /M851 ([Z])(.*)/;
        
                self.isMarlinFirmware = ko.observable(false);
        
                self.isConnected = ko.computed(function() {
                    return self.connection.isOperational() || self.connection.isPrinting() ||
                           self.connection.isReady() || self.connection.isPaused();
                });
        
                self.eepromData = ko.observableArray([]);
        
                self.onStartup = function() {
                    $('#settings_plugin_eeprom_marlin_link a').on('show', function(e) {
                        if (self.isConnected() && !self.isMarlinFirmware())
                            self._requestFirmwareInfo();
                    });
                }
        
                self.fromHistoryData = function(data) {
                    _.each(data.logs, function(line) {
                        var match = self.firmwareRegEx.exec(line);
                        if (match != null) {
                            if (self.marlinRegEx.exec(match[0]))
                                self.isMarlinFirmware(true);
                        }
                    });
                };
        
                self.fromCurrentData = function(data) {
                    if (!self.isMarlinFirmware()) {
                        _.each(data.logs, function (line) {
                            var match = self.firmwareRegEx.exec(line);
                            if (match) {
                                if (self.marlinRegEx.exec(match[0]))
                                    self.isMarlinFirmware(true);
                            }
                        });
                    }
                    else
                    {
                        _.each(data.logs, function (line) {
                            // M92 steps per unit
                            var match = self.eepromM92RegEx.exec(line);
                            if (match) {
                                self.eepromData.push({
                                    dataType: 'M92 X',
                                    position: 1,
                                    origValue: match[2],
                                    value: match[2],
                                    description: 'X steps per unit'
                                });
                                self.eepromData.push({
                                    dataType: 'M92 Y',
                                    position: 2,
                                    origValue: match[4],
                                    value: match[4],
                                    description: 'Y steps per unit'
                                });
                                self.eepromData.push({
                                    dataType: 'M92 Z',
                                    position: 3,
                                    origValue: match[6],
                                    value: match[6],
                                    description: 'Z steps per unit'
                                });
                                self.eepromData.push({
                                    dataType: 'M92 E',
                                    position: 4,
                                    origValue: match[8],
                                    value: match[8],
                                    description: 'E steps per unit'
                                });
                            }
        
                            // M203 feedrates
                            match = self.eepromM203RegEx.exec(line);
                            if (match) {
                                self.eepromData.push({
                                    dataType: 'M203 X',
                                    position: 5,
                                    origValue: match[2],
                                    value: match[2],
                                    description: 'X maximum feedrates (mm/s)'
                                });
                                self.eepromData.push({
                                    dataType: 'M203 Y',
                                    position: 6,
                                    origValue: match[4],
                                    value: match[4],
                                    description: 'Y maximum feedrates (mm/s)'
                                });
                                self.eepromData.push({
                                    dataType: 'M203 Z',
                                    position: 7,
                                    origValue: match[6],
                                    value: match[6],
                                    description: 'Z maximum feedrates (mm/s)'
                                });
                                self.eepromData.push({
                                    dataType: 'M203 E',
                                    position: 8,
                                    origValue: match[8],
                                    value: match[8],
                                    description: 'E maximum feedrates (mm/s)'
                                });
                            }
        
                            // M201 Maximum Acceleration (mm/s2)
                            match = self.eepromM201RegEx.exec(line);
                            if (match) {
                                self.eepromData.push({
                                    dataType: 'M201 X',
                                    position: 9,
                                    origValue: match[2],
                                    value: match[2],
                                    description: 'X maximum Acceleration (mm/s2)'
                                });
                                self.eepromData.push({
                                    dataType: 'M201 Y',
                                    position: 10,
                                    origValue: match[4],
                                    value: match[4],
                                    description: 'Y maximum Acceleration (mm/s2)'
                                });
                                self.eepromData.push({
                                    dataType: 'M201 Z',
                                    position: 11,
                                    origValue: match[6],
                                    value: match[6],
                                    description: 'Z maximum Acceleration (mm/s2)'
                                });
                                self.eepromData.push({
                                    dataType: 'M201 E',
                                    position: 12,
                                    origValue: match[8],
                                    value: match[8],
                                    description: 'E maximum Acceleration (mm/s2)'
                                });
                            }
        
                            // M204 Acceleration
                            match = self.eepromM204RegEx.exec(line);
                            if (match) {
                                self.eepromData.push({
                                    dataType: 'M204 S',
                                    position: 13,
                                    origValue: match[2],
                                    value: match[2],
                                    description: 'Acceleration'
                                });
                                self.eepromData.push({
                                    dataType: 'M204 T',
                                    position: 14,
                                    origValue: match[4],
                                    value: match[4],
                                    description: 'Retract acceleration'
                                });
                            }
        
                            // M205 Advanced variables
                            match = self.eepromM205RegEx.exec(line);
                            if (match) {
                                self.eepromData.push({
                                    dataType: 'M205 S',
                                    position: 15,
                                    origValue: match[2],
                                    value: match[2],
                                    description: 'Min feedrate (mm/s)'
                                });
                                self.eepromData.push({
                                    dataType: 'M205 T',
                                    position: 16,
                                    origValue: match[4],
                                    value: match[4],
                                    description: 'Min travel feedrate (mm/s)'
                                });
                                self.eepromData.push({
                                    dataType: 'M205 B',
                                    position: 17,
                                    origValue: match[6],
                                    value: match[6],
                                    description: 'Minimum segment time (ms)'
                                });
                                self.eepromData.push({
                                    dataType: 'M205 X',
                                    position: 18,
                                    origValue: match[8],
                                    value: match[8],
                                    description: 'Maximum XY jerk (mm/s)'
                                });
                                self.eepromData.push({
                                    dataType: 'M205 Z',
                                    position: 19,
                                    origValue: match[10],
                                    value: match[10],
                                    description: 'Maximum Z jerk (mm/s)'
                                });
                                self.eepromData.push({
                                    dataType: 'M205 E',
                                    position: 20,
                                    origValue: match[12],
                                    value: match[12],
                                    description: 'Maximum E jerk (mm/s)'
                                });
                            }
        
                            // M206 Home offset
                            match = self.eepromM206RegEx.exec(line);
                            if (match) {
                                self.eepromData.push({
                                    dataType: 'M206 X',
                                    position: 21,
                                    origValue: match[2],
                                    value: match[2],
                                    description: 'X Home offset (mm)'
                                });
                                self.eepromData.push({
                                    dataType: 'M206 Y',
                                    position: 22,
                                    origValue: match[4],
                                    value: match[4],
                                    description: 'Y Home offset (mm)'
                                });
                                self.eepromData.push({
                                    dataType: 'M206 Z',
                                    position: 23,
                                    origValue: match[6],
                                    value: match[6],
                                    description: 'Z Home offset (mm)'
                                });
                            }
        
                            // M301 PID settings
                            match = self.eepromM301RegEx.exec(line);
                            if (match) {
                                self.eepromData.push({
                                    dataType: 'M301 P',
                                    position: 24,
                                    origValue: match[2],
                                    value: match[2],
                                    description: 'PID - Proportional (Kp)'
                                });
                                self.eepromData.push({
                                    dataType: 'M301 I',
                                    position: 25,
                                    origValue: match[4],
                                    value: match[4],
                                    description: 'PID - Integral (Ki)'
                                });
                                self.eepromData.push({
                                    dataType: 'M301 D',
                                    position: 26,
                                    origValue: match[6],
                                    value: match[6],
                                    description: 'PID - Derivative (Kd)'
                                });
                            }
        
                            // M851 Z-Probe Offset
                            match = self.eepromM851RegEx.exec(line);
                            if (match) {
                                self.eepromData.push({
                                    dataType: 'M851 Z',
                                    position: 27,
                                    origValue: match[2],
                                    value: match[2],
                                    description: 'Z-Probe Offset (mm)'
                                });
                            }
                        });
                    }
                };
        
                self.onEventConnected = function() {
                    self._requestFirmwareInfo();
                }
        
                self.onEventDisconnected = function() {
                    self.isMarlinFirmware(false);
                };
        
                self.loadEeprom = function() {
                    self.eepromData([]);
                    self._requestEepromData();
                };
        
                self.saveEeprom = function()  {
                    var eepromData = self.eepromData();
                    _.each(eepromData, function(data) {
                        if (data.origValue != data.value) {
                            self._requestSaveDataToEeprom(data.dataType, data.position, data.value);
                            data.origValue = data.value;
                        }
                    });
        
                    var cmd = 'M500';
                    self.control.sendCustomCommand({ command: cmd });
                    alert('EEPROM data stored.');
                };
        
                self._requestFirmwareInfo = function() {
                    self.control.sendCustomCommand({ command: "M115" });
                };
        
                self._requestEepromData = function() {
                    self.control.sendCustomCommand({ command: "M503" });
                }
                self._requestSaveDataToEeprom = function(data_type, position, value) {
                    var cmd = data_type + value;
                    self.control.sendCustomCommand({ command: cmd });
                }
            }
        
            OCTOPRINT_VIEWMODELS.push([
                EepromMarlinViewModel,
                ["controlViewModel", "connectionViewModel"],
                "#settings_plugin_eeprom_marlin"
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin eeprom_marlin:", (error.stack || error));
    }
})();

// JS assets for plugin portlister
(function () {
    try {
        // source: plugin/portlister/js/portlister.js
        $(function () {
            function PortListerViewModel(parameters) {
                var self = this;
        
                self.connection = parameters[0];
        
                self.onDataUpdaterPluginMessage = function(plugin, message) {
                    if (plugin == "PortLister") {
                        self.connection.requestData();
                    }
                }
            }
        
            OCTOPRINT_VIEWMODELS.push([
                PortListerViewModel,
                ["connectionViewModel"],
                []
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin portlister:", (error.stack || error));
    }
})();

// JS assets for plugin requestspinner
(function () {
    try {
        // source: plugin/requestspinner/js/requestspinner.js
        $(function() {
            var requestSpinner = $("#requestspinner");
            if (requestSpinner.length > 0) {
                $(document).ajaxStart(function() {
                    log.debug("Requests started...");
                    requestSpinner.show("slow");
                });
                $(document).ajaxStop(function() {
                    log.debug("Requests done");
                    requestSpinner.hide("slow");
                });
            }
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin requestspinner:", (error.stack || error));
    }
})();

// JS assets for plugin systemcommandeditor
(function () {
    try {
        // source: plugin/systemcommandeditor/js/jquery.ui.sortable.js
        /*! jQuery UI - v1.12.1 - 2018-11-18
        * http://jqueryui.com
        * Includes: widget.js, data.js, disable-selection.js, scroll-parent.js, widgets/draggable.js, widgets/droppable.js, widgets/resizable.js, widgets/selectable.js, widgets/sortable.js, widgets/mouse.js
        * Copyright jQuery Foundation and other contributors; Licensed MIT */
        
        (function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)})(function(t){t.ui=t.ui||{},t.ui.version="1.12.1";var e=0,i=Array.prototype.slice;t.cleanData=function(e){return function(i){var s,n,o;for(o=0;null!=(n=i[o]);o++)try{s=t._data(n,"events"),s&&s.remove&&t(n).triggerHandler("remove")}catch(a){}e(i)}}(t.cleanData),t.widget=function(e,i,s){var n,o,a,r={},l=e.split(".")[0];e=e.split(".")[1];var h=l+"-"+e;return s||(s=i,i=t.Widget),t.isArray(s)&&(s=t.extend.apply(null,[{}].concat(s))),t.expr[":"][h.toLowerCase()]=function(e){return!!t.data(e,h)},t[l]=t[l]||{},n=t[l][e],o=t[l][e]=function(t,e){return this._createWidget?(arguments.length&&this._createWidget(t,e),void 0):new o(t,e)},t.extend(o,n,{version:s.version,_proto:t.extend({},s),_childConstructors:[]}),a=new i,a.options=t.widget.extend({},a.options),t.each(s,function(e,s){return t.isFunction(s)?(r[e]=function(){function t(){return i.prototype[e].apply(this,arguments)}function n(t){return i.prototype[e].apply(this,t)}return function(){var e,i=this._super,o=this._superApply;return this._super=t,this._superApply=n,e=s.apply(this,arguments),this._super=i,this._superApply=o,e}}(),void 0):(r[e]=s,void 0)}),o.prototype=t.widget.extend(a,{widgetEventPrefix:n?a.widgetEventPrefix||e:e},r,{constructor:o,namespace:l,widgetName:e,widgetFullName:h}),n?(t.each(n._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete n._childConstructors):i._childConstructors.push(o),t.widget.bridge(e,o),o},t.widget.extend=function(e){for(var s,n,o=i.call(arguments,1),a=0,r=o.length;r>a;a++)for(s in o[a])n=o[a][s],o[a].hasOwnProperty(s)&&void 0!==n&&(e[s]=t.isPlainObject(n)?t.isPlainObject(e[s])?t.widget.extend({},e[s],n):t.widget.extend({},n):n);return e},t.widget.bridge=function(e,s){var n=s.prototype.widgetFullName||e;t.fn[e]=function(o){var a="string"==typeof o,r=i.call(arguments,1),l=this;return a?this.length||"instance"!==o?this.each(function(){var i,s=t.data(this,n);return"instance"===o?(l=s,!1):s?t.isFunction(s[o])&&"_"!==o.charAt(0)?(i=s[o].apply(s,r),i!==s&&void 0!==i?(l=i&&i.jquery?l.pushStack(i.get()):i,!1):void 0):t.error("no such method '"+o+"' for "+e+" widget instance"):t.error("cannot call methods on "+e+" prior to initialization; "+"attempted to call method '"+o+"'")}):l=void 0:(r.length&&(o=t.widget.extend.apply(null,[o].concat(r))),this.each(function(){var e=t.data(this,n);e?(e.option(o||{}),e._init&&e._init()):t.data(this,n,new s(o,this))})),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{classes:{},disabled:!1,create:null},_createWidget:function(i,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=e++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=t(),this.hoverable=t(),this.focusable=t(),this.classesElementLookup={},s!==this&&(t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this.options=t.widget.extend({},this.options,this._getCreateOptions(),i),this._create(),this.options.disabled&&this._setOptionDisabled(this.options.disabled),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:function(){return{}},_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){var e=this;this._destroy(),t.each(this.classesElementLookup,function(t,i){e._removeClass(i,t)}),this.element.off(this.eventNamespace).removeData(this.widgetFullName),this.widget().off(this.eventNamespace).removeAttr("aria-disabled"),this.bindings.off(this.eventNamespace)},_destroy:t.noop,widget:function(){return this.element},option:function(e,i){var s,n,o,a=e;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof e)if(a={},s=e.split("."),e=s.shift(),s.length){for(n=a[e]=t.widget.extend({},this.options[e]),o=0;s.length-1>o;o++)n[s[o]]=n[s[o]]||{},n=n[s[o]];if(e=s.pop(),1===arguments.length)return void 0===n[e]?null:n[e];n[e]=i}else{if(1===arguments.length)return void 0===this.options[e]?null:this.options[e];a[e]=i}return this._setOptions(a),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return"classes"===t&&this._setOptionClasses(e),this.options[t]=e,"disabled"===t&&this._setOptionDisabled(e),this},_setOptionClasses:function(e){var i,s,n;for(i in e)n=this.classesElementLookup[i],e[i]!==this.options.classes[i]&&n&&n.length&&(s=t(n.get()),this._removeClass(n,i),s.addClass(this._classes({element:s,keys:i,classes:e,add:!0})))},_setOptionDisabled:function(t){this._toggleClass(this.widget(),this.widgetFullName+"-disabled",null,!!t),t&&(this._removeClass(this.hoverable,null,"ui-state-hover"),this._removeClass(this.focusable,null,"ui-state-focus"))},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_classes:function(e){function i(i,o){var a,r;for(r=0;i.length>r;r++)a=n.classesElementLookup[i[r]]||t(),a=e.add?t(t.unique(a.get().concat(e.element.get()))):t(a.not(e.element).get()),n.classesElementLookup[i[r]]=a,s.push(i[r]),o&&e.classes[i[r]]&&s.push(e.classes[i[r]])}var s=[],n=this;return e=t.extend({element:this.element,classes:this.options.classes||{}},e),this._on(e.element,{remove:"_untrackClassesElement"}),e.keys&&i(e.keys.match(/\S+/g)||[],!0),e.extra&&i(e.extra.match(/\S+/g)||[]),s.join(" ")},_untrackClassesElement:function(e){var i=this;t.each(i.classesElementLookup,function(s,n){-1!==t.inArray(e.target,n)&&(i.classesElementLookup[s]=t(n.not(e.target).get()))})},_removeClass:function(t,e,i){return this._toggleClass(t,e,i,!1)},_addClass:function(t,e,i){return this._toggleClass(t,e,i,!0)},_toggleClass:function(t,e,i,s){s="boolean"==typeof s?s:i;var n="string"==typeof t||null===t,o={extra:n?e:i,keys:n?t:e,element:n?this.element:t,add:s};return o.element.toggleClass(this._classes(o),s),this},_on:function(e,i,s){var n,o=this;"boolean"!=typeof e&&(s=i,i=e,e=!1),s?(i=n=t(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,n=this.widget()),t.each(s,function(s,a){function r(){return e||o.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof a?o[a]:a).apply(o,arguments):void 0}"string"!=typeof a&&(r.guid=a.guid=a.guid||r.guid||t.guid++);var l=s.match(/^([\w:-]*)\s*(.*)$/),h=l[1]+o.eventNamespace,c=l[2];c?n.on(h,c,r):i.on(h,r)})},_off:function(e,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.off(i).off(i),this.bindings=t(this.bindings.not(e).get()),this.focusable=t(this.focusable.not(e).get()),this.hoverable=t(this.hoverable.not(e).get())},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){this._addClass(t(e.currentTarget),null,"ui-state-hover")},mouseleave:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){this._addClass(t(e.currentTarget),null,"ui-state-focus")},focusout:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}}),t.widget,t.extend(t.expr[":"],{data:t.expr.createPseudo?t.expr.createPseudo(function(e){return function(i){return!!t.data(i,e)}}):function(e,i,s){return!!t.data(e,s[3])}}),t.fn.extend({disableSelection:function(){var t="onselectstart"in document.createElement("div")?"selectstart":"mousedown";return function(){return this.on(t+".ui-disableSelection",function(t){t.preventDefault()})}}(),enableSelection:function(){return this.off(".ui-disableSelection")}}),t.fn.scrollParent=function(e){var i=this.css("position"),s="absolute"===i,n=e?/(auto|scroll|hidden)/:/(auto|scroll)/,o=this.parents().filter(function(){var e=t(this);return s&&"static"===e.css("position")?!1:n.test(e.css("overflow")+e.css("overflow-y")+e.css("overflow-x"))}).eq(0);return"fixed"!==i&&o.length?o:t(this[0].ownerDocument||document)},t.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());var s=!1;t(document).on("mouseup",function(){s=!1}),t.widget("ui.mouse",{version:"1.12.1",options:{cancel:"input, textarea, button, select, option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.on("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).on("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.off("."+this.widgetName),this._mouseMoveDelegate&&this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(e){if(!s){this._mouseMoved=!1,this._mouseStarted&&this._mouseUp(e),this._mouseDownEvent=e;var i=this,n=1===e.which,o="string"==typeof this.options.cancel&&e.target.nodeName?t(e.target).closest(this.options.cancel).length:!1;return n&&!o&&this._mouseCapture(e)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(e)!==!1,!this._mouseStarted)?(e.preventDefault(),!0):(!0===t.data(e.target,this.widgetName+".preventClickEvent")&&t.removeData(e.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return i._mouseMove(t)},this._mouseUpDelegate=function(t){return i._mouseUp(t)},this.document.on("mousemove."+this.widgetName,this._mouseMoveDelegate).on("mouseup."+this.widgetName,this._mouseUpDelegate),e.preventDefault(),s=!0,!0)):!0}},_mouseMove:function(e){if(this._mouseMoved){if(t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button)return this._mouseUp(e);if(!e.which)if(e.originalEvent.altKey||e.originalEvent.ctrlKey||e.originalEvent.metaKey||e.originalEvent.shiftKey)this.ignoreMissingWhich=!0;else if(!this.ignoreMissingWhich)return this._mouseUp(e)}return(e.which||e.button)&&(this._mouseMoved=!0),this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),this._mouseDelayTimer&&(clearTimeout(this._mouseDelayTimer),delete this._mouseDelayTimer),this.ignoreMissingWhich=!1,s=!1,e.preventDefault()},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}}),t.ui.plugin={add:function(e,i,s){var n,o=t.ui[e].prototype;for(n in s)o.plugins[n]=o.plugins[n]||[],o.plugins[n].push([i,s[n]])},call:function(t,e,i,s){var n,o=t.plugins[e];if(o&&(s||t.element[0].parentNode&&11!==t.element[0].parentNode.nodeType))for(n=0;o.length>n;n++)t.options[o[n][0]]&&o[n][1].apply(t.element,i)}},t.ui.safeActiveElement=function(t){var e;try{e=t.activeElement}catch(i){e=t.body}return e||(e=t.body),e.nodeName||(e=t.body),e},t.ui.safeBlur=function(e){e&&"body"!==e.nodeName.toLowerCase()&&t(e).trigger("blur")},t.widget("ui.draggable",t.ui.mouse,{version:"1.12.1",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"===this.options.helper&&this._setPositionRelative(),this.options.addClasses&&this._addClass("ui-draggable"),this._setHandleClassName(),this._mouseInit()},_setOption:function(t,e){this._super(t,e),"handle"===t&&(this._removeHandleClassName(),this._setHandleClassName())},_destroy:function(){return(this.helper||this.element).is(".ui-draggable-dragging")?(this.destroyOnClear=!0,void 0):(this._removeHandleClassName(),this._mouseDestroy(),void 0)},_mouseCapture:function(e){var i=this.options;return this.helper||i.disabled||t(e.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(e),this.handle?(this._blurActiveElement(e),this._blockFrames(i.iframeFix===!0?"iframe":i.iframeFix),!0):!1)},_blockFrames:function(e){this.iframeBlocks=this.document.find(e).map(function(){var e=t(this);return t("<div>").css("position","absolute").appendTo(e.parent()).outerWidth(e.outerWidth()).outerHeight(e.outerHeight()).offset(e.offset())[0]})},_unblockFrames:function(){this.iframeBlocks&&(this.iframeBlocks.remove(),delete this.iframeBlocks)},_blurActiveElement:function(e){var i=t.ui.safeActiveElement(this.document[0]),s=t(e.target);s.closest(i).length||t.ui.safeBlur(i)},_mouseStart:function(e){var i=this.options;return this.helper=this._createHelper(e),this._addClass(this.helper,"ui-draggable-dragging"),this._cacheHelperProportions(),t.ui.ddmanager&&(t.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(!0),this.offsetParent=this.helper.offsetParent(),this.hasFixedAncestor=this.helper.parents().filter(function(){return"fixed"===t(this).css("position")}).length>0,this.positionAbs=this.element.offset(),this._refreshOffsets(e),this.originalPosition=this.position=this._generatePosition(e,!1),this.originalPageX=e.pageX,this.originalPageY=e.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",e)===!1?(this._clear(),!1):(this._cacheHelperProportions(),t.ui.ddmanager&&!i.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this._mouseDrag(e,!0),t.ui.ddmanager&&t.ui.ddmanager.dragStart(this,e),!0)},_refreshOffsets:function(t){this.offset={top:this.positionAbs.top-this.margins.top,left:this.positionAbs.left-this.margins.left,scroll:!1,parent:this._getParentOffset(),relative:this._getRelativeOffset()},this.offset.click={left:t.pageX-this.offset.left,top:t.pageY-this.offset.top}},_mouseDrag:function(e,i){if(this.hasFixedAncestor&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(e,!0),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",e,s)===!1)return this._mouseUp(new t.Event("mouseup",e)),!1;this.position=s.position}return this.helper[0].style.left=this.position.left+"px",this.helper[0].style.top=this.position.top+"px",t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),!1},_mouseStop:function(e){var i=this,s=!1;return t.ui.ddmanager&&!this.options.dropBehaviour&&(s=t.ui.ddmanager.drop(this,e)),this.dropped&&(s=this.dropped,this.dropped=!1),"invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||t.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?t(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",e)!==!1&&i._clear()}):this._trigger("stop",e)!==!1&&this._clear(),!1},_mouseUp:function(e){return this._unblockFrames(),t.ui.ddmanager&&t.ui.ddmanager.dragStop(this,e),this.handleElement.is(e.target)&&this.element.trigger("focus"),t.ui.mouse.prototype._mouseUp.call(this,e)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp(new t.Event("mouseup",{target:this.element[0]})):this._clear(),this},_getHandle:function(e){return this.options.handle?!!t(e.target).closest(this.element.find(this.options.handle)).length:!0},_setHandleClassName:function(){this.handleElement=this.options.handle?this.element.find(this.options.handle):this.element,this._addClass(this.handleElement,"ui-draggable-handle")},_removeHandleClassName:function(){this._removeClass(this.handleElement,"ui-draggable-handle")},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper),n=s?t(i.helper.apply(this.element[0],[e])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return n.parents("body").length||n.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s&&n[0]===this.element[0]&&this._setPositionRelative(),n[0]===this.element[0]||/(fixed|absolute)/.test(n.css("position"))||n.css("position","absolute"),n},_setPositionRelative:function(){/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative")},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_isRootNode:function(t){return/(html|body)/i.test(t.tagName)||t===this.document[0]},_getParentOffset:function(){var e=this.offsetParent.offset(),i=this.document[0];return"absolute"===this.cssPosition&&this.scrollParent[0]!==i&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),this._isRootNode(this.offsetParent[0])&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"!==this.cssPosition)return{top:0,left:0};var t=this.element.position(),e=this._isRootNode(this.scrollParent[0]);return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+(e?0:this.scrollParent.scrollTop()),left:t.left-(parseInt(this.helper.css("left"),10)||0)+(e?0:this.scrollParent.scrollLeft())}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options,o=this.document[0];return this.relativeContainer=null,n.containment?"window"===n.containment?(this.containment=[t(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,t(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,t(window).scrollLeft()+t(window).width()-this.helperProportions.width-this.margins.left,t(window).scrollTop()+(t(window).height()||o.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],void 0):"document"===n.containment?(this.containment=[0,0,t(o).width()-this.helperProportions.width-this.margins.left,(t(o).height()||o.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],void 0):n.containment.constructor===Array?(this.containment=n.containment,void 0):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=t(n.containment),s=i[0],s&&(e=/(scroll|auto)/.test(i.css("overflow")),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(e?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(e?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relativeContainer=i),void 0):(this.containment=null,void 0)},_convertPositionTo:function(t,e){e||(e=this.position);var i="absolute"===t?1:-1,s=this._isRootNode(this.scrollParent[0]);return{top:e.top+this.offset.relative.top*i+this.offset.parent.top*i-("fixed"===this.cssPosition?-this.offset.scroll.top:s?0:this.offset.scroll.top)*i,left:e.left+this.offset.relative.left*i+this.offset.parent.left*i-("fixed"===this.cssPosition?-this.offset.scroll.left:s?0:this.offset.scroll.left)*i}},_generatePosition:function(t,e){var i,s,n,o,a=this.options,r=this._isRootNode(this.scrollParent[0]),l=t.pageX,h=t.pageY;return r&&this.offset.scroll||(this.offset.scroll={top:this.scrollParent.scrollTop(),left:this.scrollParent.scrollLeft()}),e&&(this.containment&&(this.relativeContainer?(s=this.relativeContainer.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,t.pageX-this.offset.click.left<i[0]&&(l=i[0]+this.offset.click.left),t.pageY-this.offset.click.top<i[1]&&(h=i[1]+this.offset.click.top),t.pageX-this.offset.click.left>i[2]&&(l=i[2]+this.offset.click.left),t.pageY-this.offset.click.top>i[3]&&(h=i[3]+this.offset.click.top)),a.grid&&(n=a.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/a.grid[1])*a.grid[1]:this.originalPageY,h=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-a.grid[1]:n+a.grid[1]:n,o=a.grid[0]?this.originalPageX+Math.round((l-this.originalPageX)/a.grid[0])*a.grid[0]:this.originalPageX,l=i?o-this.offset.click.left>=i[0]||o-this.offset.click.left>i[2]?o:o-this.offset.click.left>=i[0]?o-a.grid[0]:o+a.grid[0]:o),"y"===a.axis&&(l=this.originalPageX),"x"===a.axis&&(h=this.originalPageY)),{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.offset.scroll.top:r?0:this.offset.scroll.top),left:l-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.offset.scroll.left:r?0:this.offset.scroll.left)}},_clear:function(){this._removeClass(this.helper,"ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1,this.destroyOnClear&&this.destroy()},_trigger:function(e,i,s){return s=s||this._uiHash(),t.ui.plugin.call(this,e,[i,s,this],!0),/^(drag|start|stop)/.test(e)&&(this.positionAbs=this._convertPositionTo("absolute"),s.offset=this.positionAbs),t.Widget.prototype._trigger.call(this,e,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),t.ui.plugin.add("draggable","connectToSortable",{start:function(e,i,s){var n=t.extend({},i,{item:s.element});s.sortables=[],t(s.options.connectToSortable).each(function(){var i=t(this).sortable("instance");i&&!i.options.disabled&&(s.sortables.push(i),i.refreshPositions(),i._trigger("activate",e,n))})},stop:function(e,i,s){var n=t.extend({},i,{item:s.element});s.cancelHelperRemoval=!1,t.each(s.sortables,function(){var t=this;t.isOver?(t.isOver=0,s.cancelHelperRemoval=!0,t.cancelHelperRemoval=!1,t._storedCSS={position:t.placeholder.css("position"),top:t.placeholder.css("top"),left:t.placeholder.css("left")},t._mouseStop(e),t.options.helper=t.options._helper):(t.cancelHelperRemoval=!0,t._trigger("deactivate",e,n))})},drag:function(e,i,s){t.each(s.sortables,function(){var n=!1,o=this;o.positionAbs=s.positionAbs,o.helperProportions=s.helperProportions,o.offset.click=s.offset.click,o._intersectsWith(o.containerCache)&&(n=!0,t.each(s.sortables,function(){return this.positionAbs=s.positionAbs,this.helperProportions=s.helperProportions,this.offset.click=s.offset.click,this!==o&&this._intersectsWith(this.containerCache)&&t.contains(o.element[0],this.element[0])&&(n=!1),n})),n?(o.isOver||(o.isOver=1,s._parent=i.helper.parent(),o.currentItem=i.helper.appendTo(o.element).data("ui-sortable-item",!0),o.options._helper=o.options.helper,o.options.helper=function(){return i.helper[0]},e.target=o.currentItem[0],o._mouseCapture(e,!0),o._mouseStart(e,!0,!0),o.offset.click.top=s.offset.click.top,o.offset.click.left=s.offset.click.left,o.offset.parent.left-=s.offset.parent.left-o.offset.parent.left,o.offset.parent.top-=s.offset.parent.top-o.offset.parent.top,s._trigger("toSortable",e),s.dropped=o.element,t.each(s.sortables,function(){this.refreshPositions()}),s.currentItem=s.element,o.fromOutside=s),o.currentItem&&(o._mouseDrag(e),i.position=o.position)):o.isOver&&(o.isOver=0,o.cancelHelperRemoval=!0,o.options._revert=o.options.revert,o.options.revert=!1,o._trigger("out",e,o._uiHash(o)),o._mouseStop(e,!0),o.options.revert=o.options._revert,o.options.helper=o.options._helper,o.placeholder&&o.placeholder.remove(),i.helper.appendTo(s._parent),s._refreshOffsets(e),i.position=s._generatePosition(e,!0),s._trigger("fromSortable",e),s.dropped=!1,t.each(s.sortables,function(){this.refreshPositions()}))})}}),t.ui.plugin.add("draggable","cursor",{start:function(e,i,s){var n=t("body"),o=s.options;n.css("cursor")&&(o._cursor=n.css("cursor")),n.css("cursor",o.cursor)},stop:function(e,i,s){var n=s.options;n._cursor&&t("body").css("cursor",n._cursor)}}),t.ui.plugin.add("draggable","opacity",{start:function(e,i,s){var n=t(i.helper),o=s.options;n.css("opacity")&&(o._opacity=n.css("opacity")),n.css("opacity",o.opacity)},stop:function(e,i,s){var n=s.options;n._opacity&&t(i.helper).css("opacity",n._opacity)}}),t.ui.plugin.add("draggable","scroll",{start:function(t,e,i){i.scrollParentNotHidden||(i.scrollParentNotHidden=i.helper.scrollParent(!1)),i.scrollParentNotHidden[0]!==i.document[0]&&"HTML"!==i.scrollParentNotHidden[0].tagName&&(i.overflowOffset=i.scrollParentNotHidden.offset())},drag:function(e,i,s){var n=s.options,o=!1,a=s.scrollParentNotHidden[0],r=s.document[0];a!==r&&"HTML"!==a.tagName?(n.axis&&"x"===n.axis||(s.overflowOffset.top+a.offsetHeight-e.pageY<n.scrollSensitivity?a.scrollTop=o=a.scrollTop+n.scrollSpeed:e.pageY-s.overflowOffset.top<n.scrollSensitivity&&(a.scrollTop=o=a.scrollTop-n.scrollSpeed)),n.axis&&"y"===n.axis||(s.overflowOffset.left+a.offsetWidth-e.pageX<n.scrollSensitivity?a.scrollLeft=o=a.scrollLeft+n.scrollSpeed:e.pageX-s.overflowOffset.left<n.scrollSensitivity&&(a.scrollLeft=o=a.scrollLeft-n.scrollSpeed))):(n.axis&&"x"===n.axis||(e.pageY-t(r).scrollTop()<n.scrollSensitivity?o=t(r).scrollTop(t(r).scrollTop()-n.scrollSpeed):t(window).height()-(e.pageY-t(r).scrollTop())<n.scrollSensitivity&&(o=t(r).scrollTop(t(r).scrollTop()+n.scrollSpeed))),n.axis&&"y"===n.axis||(e.pageX-t(r).scrollLeft()<n.scrollSensitivity?o=t(r).scrollLeft(t(r).scrollLeft()-n.scrollSpeed):t(window).width()-(e.pageX-t(r).scrollLeft())<n.scrollSensitivity&&(o=t(r).scrollLeft(t(r).scrollLeft()+n.scrollSpeed)))),o!==!1&&t.ui.ddmanager&&!n.dropBehaviour&&t.ui.ddmanager.prepareOffsets(s,e)}}),t.ui.plugin.add("draggable","snap",{start:function(e,i,s){var n=s.options;s.snapElements=[],t(n.snap.constructor!==String?n.snap.items||":data(ui-draggable)":n.snap).each(function(){var e=t(this),i=e.offset();this!==s.element[0]&&s.snapElements.push({item:this,width:e.outerWidth(),height:e.outerHeight(),top:i.top,left:i.left})})},drag:function(e,i,s){var n,o,a,r,l,h,c,u,d,p,f=s.options,g=f.snapTolerance,m=i.offset.left,_=m+s.helperProportions.width,v=i.offset.top,b=v+s.helperProportions.height;for(d=s.snapElements.length-1;d>=0;d--)l=s.snapElements[d].left-s.margins.left,h=l+s.snapElements[d].width,c=s.snapElements[d].top-s.margins.top,u=c+s.snapElements[d].height,l-g>_||m>h+g||c-g>b||v>u+g||!t.contains(s.snapElements[d].item.ownerDocument,s.snapElements[d].item)?(s.snapElements[d].snapping&&s.options.snap.release&&s.options.snap.release.call(s.element,e,t.extend(s._uiHash(),{snapItem:s.snapElements[d].item})),s.snapElements[d].snapping=!1):("inner"!==f.snapMode&&(n=g>=Math.abs(c-b),o=g>=Math.abs(u-v),a=g>=Math.abs(l-_),r=g>=Math.abs(h-m),n&&(i.position.top=s._convertPositionTo("relative",{top:c-s.helperProportions.height,left:0}).top),o&&(i.position.top=s._convertPositionTo("relative",{top:u,left:0}).top),a&&(i.position.left=s._convertPositionTo("relative",{top:0,left:l-s.helperProportions.width}).left),r&&(i.position.left=s._convertPositionTo("relative",{top:0,left:h}).left)),p=n||o||a||r,"outer"!==f.snapMode&&(n=g>=Math.abs(c-v),o=g>=Math.abs(u-b),a=g>=Math.abs(l-m),r=g>=Math.abs(h-_),n&&(i.position.top=s._convertPositionTo("relative",{top:c,left:0}).top),o&&(i.position.top=s._convertPositionTo("relative",{top:u-s.helperProportions.height,left:0}).top),a&&(i.position.left=s._convertPositionTo("relative",{top:0,left:l}).left),r&&(i.position.left=s._convertPositionTo("relative",{top:0,left:h-s.helperProportions.width}).left)),!s.snapElements[d].snapping&&(n||o||a||r||p)&&s.options.snap.snap&&s.options.snap.snap.call(s.element,e,t.extend(s._uiHash(),{snapItem:s.snapElements[d].item})),s.snapElements[d].snapping=n||o||a||r||p)}}),t.ui.plugin.add("draggable","stack",{start:function(e,i,s){var n,o=s.options,a=t.makeArray(t(o.stack)).sort(function(e,i){return(parseInt(t(e).css("zIndex"),10)||0)-(parseInt(t(i).css("zIndex"),10)||0)});a.length&&(n=parseInt(t(a[0]).css("zIndex"),10)||0,t(a).each(function(e){t(this).css("zIndex",n+e)}),this.css("zIndex",n+a.length))}}),t.ui.plugin.add("draggable","zIndex",{start:function(e,i,s){var n=t(i.helper),o=s.options;n.css("zIndex")&&(o._zIndex=n.css("zIndex")),n.css("zIndex",o.zIndex)},stop:function(e,i,s){var n=s.options;n._zIndex&&t(i.helper).css("zIndex",n._zIndex)}}),t.ui.draggable,t.widget("ui.droppable",{version:"1.12.1",widgetEventPrefix:"drop",options:{accept:"*",addClasses:!0,greedy:!1,scope:"default",tolerance:"intersect",activate:null,deactivate:null,drop:null,out:null,over:null},_create:function(){var e,i=this.options,s=i.accept;this.isover=!1,this.isout=!0,this.accept=t.isFunction(s)?s:function(t){return t.is(s)},this.proportions=function(){return arguments.length?(e=arguments[0],void 0):e?e:e={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight}},this._addToManager(i.scope),i.addClasses&&this._addClass("ui-droppable")},_addToManager:function(e){t.ui.ddmanager.droppables[e]=t.ui.ddmanager.droppables[e]||[],t.ui.ddmanager.droppables[e].push(this)},_splice:function(t){for(var e=0;t.length>e;e++)t[e]===this&&t.splice(e,1)},_destroy:function(){var e=t.ui.ddmanager.droppables[this.options.scope];this._splice(e)},_setOption:function(e,i){if("accept"===e)this.accept=t.isFunction(i)?i:function(t){return t.is(i)};else if("scope"===e){var s=t.ui.ddmanager.droppables[this.options.scope];this._splice(s),this._addToManager(i)}this._super(e,i)},_activate:function(e){var i=t.ui.ddmanager.current;this._addActiveClass(),i&&this._trigger("activate",e,this.ui(i))
        },_deactivate:function(e){var i=t.ui.ddmanager.current;this._removeActiveClass(),i&&this._trigger("deactivate",e,this.ui(i))},_over:function(e){var i=t.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this._addHoverClass(),this._trigger("over",e,this.ui(i)))},_out:function(e){var i=t.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this._removeHoverClass(),this._trigger("out",e,this.ui(i)))},_drop:function(e,i){var s=i||t.ui.ddmanager.current,o=!1;return s&&(s.currentItem||s.element)[0]!==this.element[0]?(this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function(){var i=t(this).droppable("instance");return i.options.greedy&&!i.options.disabled&&i.options.scope===s.options.scope&&i.accept.call(i.element[0],s.currentItem||s.element)&&n(s,t.extend(i,{offset:i.element.offset()}),i.options.tolerance,e)?(o=!0,!1):void 0}),o?!1:this.accept.call(this.element[0],s.currentItem||s.element)?(this._removeActiveClass(),this._removeHoverClass(),this._trigger("drop",e,this.ui(s)),this.element):!1):!1},ui:function(t){return{draggable:t.currentItem||t.element,helper:t.helper,position:t.position,offset:t.positionAbs}},_addHoverClass:function(){this._addClass("ui-droppable-hover")},_removeHoverClass:function(){this._removeClass("ui-droppable-hover")},_addActiveClass:function(){this._addClass("ui-droppable-active")},_removeActiveClass:function(){this._removeClass("ui-droppable-active")}});var n=t.ui.intersect=function(){function t(t,e,i){return t>=e&&e+i>t}return function(e,i,s,n){if(!i.offset)return!1;var o=(e.positionAbs||e.position.absolute).left+e.margins.left,a=(e.positionAbs||e.position.absolute).top+e.margins.top,r=o+e.helperProportions.width,l=a+e.helperProportions.height,h=i.offset.left,c=i.offset.top,u=h+i.proportions().width,d=c+i.proportions().height;switch(s){case"fit":return o>=h&&u>=r&&a>=c&&d>=l;case"intersect":return o+e.helperProportions.width/2>h&&u>r-e.helperProportions.width/2&&a+e.helperProportions.height/2>c&&d>l-e.helperProportions.height/2;case"pointer":return t(n.pageY,c,i.proportions().height)&&t(n.pageX,h,i.proportions().width);case"touch":return(a>=c&&d>=a||l>=c&&d>=l||c>a&&l>d)&&(o>=h&&u>=o||r>=h&&u>=r||h>o&&r>u);default:return!1}}}();t.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(e,i){var s,n,o=t.ui.ddmanager.droppables[e.options.scope]||[],a=i?i.type:null,r=(e.currentItem||e.element).find(":data(ui-droppable)").addBack();t:for(s=0;o.length>s;s++)if(!(o[s].options.disabled||e&&!o[s].accept.call(o[s].element[0],e.currentItem||e.element))){for(n=0;r.length>n;n++)if(r[n]===o[s].element[0]){o[s].proportions().height=0;continue t}o[s].visible="none"!==o[s].element.css("display"),o[s].visible&&("mousedown"===a&&o[s]._activate.call(o[s],i),o[s].offset=o[s].element.offset(),o[s].proportions({width:o[s].element[0].offsetWidth,height:o[s].element[0].offsetHeight}))}},drop:function(e,i){var s=!1;return t.each((t.ui.ddmanager.droppables[e.options.scope]||[]).slice(),function(){this.options&&(!this.options.disabled&&this.visible&&n(e,this,this.options.tolerance,i)&&(s=this._drop.call(this,i)||s),!this.options.disabled&&this.visible&&this.accept.call(this.element[0],e.currentItem||e.element)&&(this.isout=!0,this.isover=!1,this._deactivate.call(this,i)))}),s},dragStart:function(e,i){e.element.parentsUntil("body").on("scroll.droppable",function(){e.options.refreshPositions||t.ui.ddmanager.prepareOffsets(e,i)})},drag:function(e,i){e.options.refreshPositions&&t.ui.ddmanager.prepareOffsets(e,i),t.each(t.ui.ddmanager.droppables[e.options.scope]||[],function(){if(!this.options.disabled&&!this.greedyChild&&this.visible){var s,o,a,r=n(e,this,this.options.tolerance,i),l=!r&&this.isover?"isout":r&&!this.isover?"isover":null;l&&(this.options.greedy&&(o=this.options.scope,a=this.element.parents(":data(ui-droppable)").filter(function(){return t(this).droppable("instance").options.scope===o}),a.length&&(s=t(a[0]).droppable("instance"),s.greedyChild="isover"===l)),s&&"isover"===l&&(s.isover=!1,s.isout=!0,s._out.call(s,i)),this[l]=!0,this["isout"===l?"isover":"isout"]=!1,this["isover"===l?"_over":"_out"].call(this,i),s&&"isout"===l&&(s.isout=!1,s.isover=!0,s._over.call(s,i)))}})},dragStop:function(e,i){e.element.parentsUntil("body").off("scroll.droppable"),e.options.refreshPositions||t.ui.ddmanager.prepareOffsets(e,i)}},t.uiBackCompat!==!1&&t.widget("ui.droppable",t.ui.droppable,{options:{hoverClass:!1,activeClass:!1},_addActiveClass:function(){this._super(),this.options.activeClass&&this.element.addClass(this.options.activeClass)},_removeActiveClass:function(){this._super(),this.options.activeClass&&this.element.removeClass(this.options.activeClass)},_addHoverClass:function(){this._super(),this.options.hoverClass&&this.element.addClass(this.options.hoverClass)},_removeHoverClass:function(){this._super(),this.options.hoverClass&&this.element.removeClass(this.options.hoverClass)}}),t.ui.droppable,t.widget("ui.resizable",t.ui.mouse,{version:"1.12.1",widgetEventPrefix:"resize",options:{alsoResize:!1,animate:!1,animateDuration:"slow",animateEasing:"swing",aspectRatio:!1,autoHide:!1,classes:{"ui-resizable-se":"ui-icon ui-icon-gripsmall-diagonal-se"},containment:!1,ghost:!1,grid:!1,handles:"e,s,se",helper:!1,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:90,resize:null,start:null,stop:null},_num:function(t){return parseFloat(t)||0},_isNumber:function(t){return!isNaN(parseFloat(t))},_hasScroll:function(e,i){if("hidden"===t(e).css("overflow"))return!1;var s=i&&"left"===i?"scrollLeft":"scrollTop",n=!1;return e[s]>0?!0:(e[s]=1,n=e[s]>0,e[s]=0,n)},_create:function(){var e,i=this.options,s=this;this._addClass("ui-resizable"),t.extend(this,{_aspectRatio:!!i.aspectRatio,aspectRatio:i.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:i.helper||i.ghost||i.animate?i.helper||"ui-resizable-helper":null}),this.element[0].nodeName.match(/^(canvas|textarea|input|select|button|img)$/i)&&(this.element.wrap(t("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")})),this.element=this.element.parent().data("ui-resizable",this.element.resizable("instance")),this.elementIsWrapper=!0,e={marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom"),marginLeft:this.originalElement.css("marginLeft")},this.element.css(e),this.originalElement.css("margin",0),this.originalResizeStyle=this.originalElement.css("resize"),this.originalElement.css("resize","none"),this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"})),this.originalElement.css(e),this._proportionallyResize()),this._setupHandles(),i.autoHide&&t(this.element).on("mouseenter",function(){i.disabled||(s._removeClass("ui-resizable-autohide"),s._handles.show())}).on("mouseleave",function(){i.disabled||s.resizing||(s._addClass("ui-resizable-autohide"),s._handles.hide())}),this._mouseInit()},_destroy:function(){this._mouseDestroy();var e,i=function(e){t(e).removeData("resizable").removeData("ui-resizable").off(".resizable").find(".ui-resizable-handle").remove()};return this.elementIsWrapper&&(i(this.element),e=this.element,this.originalElement.css({position:e.css("position"),width:e.outerWidth(),height:e.outerHeight(),top:e.css("top"),left:e.css("left")}).insertAfter(e),e.remove()),this.originalElement.css("resize",this.originalResizeStyle),i(this.originalElement),this},_setOption:function(t,e){switch(this._super(t,e),t){case"handles":this._removeHandles(),this._setupHandles();break;default:}},_setupHandles:function(){var e,i,s,n,o,a=this.options,r=this;if(this.handles=a.handles||(t(".ui-resizable-handle",this.element).length?{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"}:"e,s,se"),this._handles=t(),this.handles.constructor===String)for("all"===this.handles&&(this.handles="n,e,s,w,se,sw,ne,nw"),s=this.handles.split(","),this.handles={},i=0;s.length>i;i++)e=t.trim(s[i]),n="ui-resizable-"+e,o=t("<div>"),this._addClass(o,"ui-resizable-handle "+n),o.css({zIndex:a.zIndex}),this.handles[e]=".ui-resizable-"+e,this.element.append(o);this._renderAxis=function(e){var i,s,n,o;e=e||this.element;for(i in this.handles)this.handles[i].constructor===String?this.handles[i]=this.element.children(this.handles[i]).first().show():(this.handles[i].jquery||this.handles[i].nodeType)&&(this.handles[i]=t(this.handles[i]),this._on(this.handles[i],{mousedown:r._mouseDown})),this.elementIsWrapper&&this.originalElement[0].nodeName.match(/^(textarea|input|select|button)$/i)&&(s=t(this.handles[i],this.element),o=/sw|ne|nw|se|n|s/.test(i)?s.outerHeight():s.outerWidth(),n=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join(""),e.css(n,o),this._proportionallyResize()),this._handles=this._handles.add(this.handles[i])},this._renderAxis(this.element),this._handles=this._handles.add(this.element.find(".ui-resizable-handle")),this._handles.disableSelection(),this._handles.on("mouseover",function(){r.resizing||(this.className&&(o=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)),r.axis=o&&o[1]?o[1]:"se")}),a.autoHide&&(this._handles.hide(),this._addClass("ui-resizable-autohide"))},_removeHandles:function(){this._handles.remove()},_mouseCapture:function(e){var i,s,n=!1;for(i in this.handles)s=t(this.handles[i])[0],(s===e.target||t.contains(s,e.target))&&(n=!0);return!this.options.disabled&&n},_mouseStart:function(e){var i,s,n,o=this.options,a=this.element;return this.resizing=!0,this._renderProxy(),i=this._num(this.helper.css("left")),s=this._num(this.helper.css("top")),o.containment&&(i+=t(o.containment).scrollLeft()||0,s+=t(o.containment).scrollTop()||0),this.offset=this.helper.offset(),this.position={left:i,top:s},this.size=this._helper?{width:this.helper.width(),height:this.helper.height()}:{width:a.width(),height:a.height()},this.originalSize=this._helper?{width:a.outerWidth(),height:a.outerHeight()}:{width:a.width(),height:a.height()},this.sizeDiff={width:a.outerWidth()-a.width(),height:a.outerHeight()-a.height()},this.originalPosition={left:i,top:s},this.originalMousePosition={left:e.pageX,top:e.pageY},this.aspectRatio="number"==typeof o.aspectRatio?o.aspectRatio:this.originalSize.width/this.originalSize.height||1,n=t(".ui-resizable-"+this.axis).css("cursor"),t("body").css("cursor","auto"===n?this.axis+"-resize":n),this._addClass("ui-resizable-resizing"),this._propagate("start",e),!0},_mouseDrag:function(e){var i,s,n=this.originalMousePosition,o=this.axis,a=e.pageX-n.left||0,r=e.pageY-n.top||0,l=this._change[o];return this._updatePrevProperties(),l?(i=l.apply(this,[e,a,r]),this._updateVirtualBoundaries(e.shiftKey),(this._aspectRatio||e.shiftKey)&&(i=this._updateRatio(i,e)),i=this._respectSize(i,e),this._updateCache(i),this._propagate("resize",e),s=this._applyChanges(),!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize(),t.isEmptyObject(s)||(this._updatePrevProperties(),this._trigger("resize",e,this.ui()),this._applyChanges()),!1):!1},_mouseStop:function(e){this.resizing=!1;var i,s,n,o,a,r,l,h=this.options,c=this;return this._helper&&(i=this._proportionallyResizeElements,s=i.length&&/textarea/i.test(i[0].nodeName),n=s&&this._hasScroll(i[0],"left")?0:c.sizeDiff.height,o=s?0:c.sizeDiff.width,a={width:c.helper.width()-o,height:c.helper.height()-n},r=parseFloat(c.element.css("left"))+(c.position.left-c.originalPosition.left)||null,l=parseFloat(c.element.css("top"))+(c.position.top-c.originalPosition.top)||null,h.animate||this.element.css(t.extend(a,{top:l,left:r})),c.helper.height(c.size.height),c.helper.width(c.size.width),this._helper&&!h.animate&&this._proportionallyResize()),t("body").css("cursor","auto"),this._removeClass("ui-resizable-resizing"),this._propagate("stop",e),this._helper&&this.helper.remove(),!1},_updatePrevProperties:function(){this.prevPosition={top:this.position.top,left:this.position.left},this.prevSize={width:this.size.width,height:this.size.height}},_applyChanges:function(){var t={};return this.position.top!==this.prevPosition.top&&(t.top=this.position.top+"px"),this.position.left!==this.prevPosition.left&&(t.left=this.position.left+"px"),this.size.width!==this.prevSize.width&&(t.width=this.size.width+"px"),this.size.height!==this.prevSize.height&&(t.height=this.size.height+"px"),this.helper.css(t),t},_updateVirtualBoundaries:function(t){var e,i,s,n,o,a=this.options;o={minWidth:this._isNumber(a.minWidth)?a.minWidth:0,maxWidth:this._isNumber(a.maxWidth)?a.maxWidth:1/0,minHeight:this._isNumber(a.minHeight)?a.minHeight:0,maxHeight:this._isNumber(a.maxHeight)?a.maxHeight:1/0},(this._aspectRatio||t)&&(e=o.minHeight*this.aspectRatio,s=o.minWidth/this.aspectRatio,i=o.maxHeight*this.aspectRatio,n=o.maxWidth/this.aspectRatio,e>o.minWidth&&(o.minWidth=e),s>o.minHeight&&(o.minHeight=s),o.maxWidth>i&&(o.maxWidth=i),o.maxHeight>n&&(o.maxHeight=n)),this._vBoundaries=o},_updateCache:function(t){this.offset=this.helper.offset(),this._isNumber(t.left)&&(this.position.left=t.left),this._isNumber(t.top)&&(this.position.top=t.top),this._isNumber(t.height)&&(this.size.height=t.height),this._isNumber(t.width)&&(this.size.width=t.width)},_updateRatio:function(t){var e=this.position,i=this.size,s=this.axis;return this._isNumber(t.height)?t.width=t.height*this.aspectRatio:this._isNumber(t.width)&&(t.height=t.width/this.aspectRatio),"sw"===s&&(t.left=e.left+(i.width-t.width),t.top=null),"nw"===s&&(t.top=e.top+(i.height-t.height),t.left=e.left+(i.width-t.width)),t},_respectSize:function(t){var e=this._vBoundaries,i=this.axis,s=this._isNumber(t.width)&&e.maxWidth&&e.maxWidth<t.width,n=this._isNumber(t.height)&&e.maxHeight&&e.maxHeight<t.height,o=this._isNumber(t.width)&&e.minWidth&&e.minWidth>t.width,a=this._isNumber(t.height)&&e.minHeight&&e.minHeight>t.height,r=this.originalPosition.left+this.originalSize.width,l=this.originalPosition.top+this.originalSize.height,h=/sw|nw|w/.test(i),c=/nw|ne|n/.test(i);return o&&(t.width=e.minWidth),a&&(t.height=e.minHeight),s&&(t.width=e.maxWidth),n&&(t.height=e.maxHeight),o&&h&&(t.left=r-e.minWidth),s&&h&&(t.left=r-e.maxWidth),a&&c&&(t.top=l-e.minHeight),n&&c&&(t.top=l-e.maxHeight),t.width||t.height||t.left||!t.top?t.width||t.height||t.top||!t.left||(t.left=null):t.top=null,t},_getPaddingPlusBorderDimensions:function(t){for(var e=0,i=[],s=[t.css("borderTopWidth"),t.css("borderRightWidth"),t.css("borderBottomWidth"),t.css("borderLeftWidth")],n=[t.css("paddingTop"),t.css("paddingRight"),t.css("paddingBottom"),t.css("paddingLeft")];4>e;e++)i[e]=parseFloat(s[e])||0,i[e]+=parseFloat(n[e])||0;return{height:i[0]+i[2],width:i[1]+i[3]}},_proportionallyResize:function(){if(this._proportionallyResizeElements.length)for(var t,e=0,i=this.helper||this.element;this._proportionallyResizeElements.length>e;e++)t=this._proportionallyResizeElements[e],this.outerDimensions||(this.outerDimensions=this._getPaddingPlusBorderDimensions(t)),t.css({height:i.height()-this.outerDimensions.height||0,width:i.width()-this.outerDimensions.width||0})},_renderProxy:function(){var e=this.element,i=this.options;this.elementOffset=e.offset(),this._helper?(this.helper=this.helper||t("<div style='overflow:hidden;'></div>"),this._addClass(this.helper,this._helper),this.helper.css({width:this.element.outerWidth(),height:this.element.outerHeight(),position:"absolute",left:this.elementOffset.left+"px",top:this.elementOffset.top+"px",zIndex:++i.zIndex}),this.helper.appendTo("body").disableSelection()):this.helper=this.element},_change:{e:function(t,e){return{width:this.originalSize.width+e}},w:function(t,e){var i=this.originalSize,s=this.originalPosition;return{left:s.left+e,width:i.width-e}},n:function(t,e,i){var s=this.originalSize,n=this.originalPosition;return{top:n.top+i,height:s.height-i}},s:function(t,e,i){return{height:this.originalSize.height+i}},se:function(e,i,s){return t.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[e,i,s]))},sw:function(e,i,s){return t.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[e,i,s]))},ne:function(e,i,s){return t.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[e,i,s]))},nw:function(e,i,s){return t.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[e,i,s]))}},_propagate:function(e,i){t.ui.plugin.call(this,e,[i,this.ui()]),"resize"!==e&&this._trigger(e,i,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}}),t.ui.plugin.add("resizable","animate",{stop:function(e){var i=t(this).resizable("instance"),s=i.options,n=i._proportionallyResizeElements,o=n.length&&/textarea/i.test(n[0].nodeName),a=o&&i._hasScroll(n[0],"left")?0:i.sizeDiff.height,r=o?0:i.sizeDiff.width,l={width:i.size.width-r,height:i.size.height-a},h=parseFloat(i.element.css("left"))+(i.position.left-i.originalPosition.left)||null,c=parseFloat(i.element.css("top"))+(i.position.top-i.originalPosition.top)||null;i.element.animate(t.extend(l,c&&h?{top:c,left:h}:{}),{duration:s.animateDuration,easing:s.animateEasing,step:function(){var s={width:parseFloat(i.element.css("width")),height:parseFloat(i.element.css("height")),top:parseFloat(i.element.css("top")),left:parseFloat(i.element.css("left"))};n&&n.length&&t(n[0]).css({width:s.width,height:s.height}),i._updateCache(s),i._propagate("resize",e)}})}}),t.ui.plugin.add("resizable","containment",{start:function(){var e,i,s,n,o,a,r,l=t(this).resizable("instance"),h=l.options,c=l.element,u=h.containment,d=u instanceof t?u.get(0):/parent/.test(u)?c.parent().get(0):u;d&&(l.containerElement=t(d),/document/.test(u)||u===document?(l.containerOffset={left:0,top:0},l.containerPosition={left:0,top:0},l.parentData={element:t(document),left:0,top:0,width:t(document).width(),height:t(document).height()||document.body.parentNode.scrollHeight}):(e=t(d),i=[],t(["Top","Right","Left","Bottom"]).each(function(t,s){i[t]=l._num(e.css("padding"+s))}),l.containerOffset=e.offset(),l.containerPosition=e.position(),l.containerSize={height:e.innerHeight()-i[3],width:e.innerWidth()-i[1]},s=l.containerOffset,n=l.containerSize.height,o=l.containerSize.width,a=l._hasScroll(d,"left")?d.scrollWidth:o,r=l._hasScroll(d)?d.scrollHeight:n,l.parentData={element:d,left:s.left,top:s.top,width:a,height:r}))},resize:function(e){var i,s,n,o,a=t(this).resizable("instance"),r=a.options,l=a.containerOffset,h=a.position,c=a._aspectRatio||e.shiftKey,u={top:0,left:0},d=a.containerElement,p=!0;d[0]!==document&&/static/.test(d.css("position"))&&(u=l),h.left<(a._helper?l.left:0)&&(a.size.width=a.size.width+(a._helper?a.position.left-l.left:a.position.left-u.left),c&&(a.size.height=a.size.width/a.aspectRatio,p=!1),a.position.left=r.helper?l.left:0),h.top<(a._helper?l.top:0)&&(a.size.height=a.size.height+(a._helper?a.position.top-l.top:a.position.top),c&&(a.size.width=a.size.height*a.aspectRatio,p=!1),a.position.top=a._helper?l.top:0),n=a.containerElement.get(0)===a.element.parent().get(0),o=/relative|absolute/.test(a.containerElement.css("position")),n&&o?(a.offset.left=a.parentData.left+a.position.left,a.offset.top=a.parentData.top+a.position.top):(a.offset.left=a.element.offset().left,a.offset.top=a.element.offset().top),i=Math.abs(a.sizeDiff.width+(a._helper?a.offset.left-u.left:a.offset.left-l.left)),s=Math.abs(a.sizeDiff.height+(a._helper?a.offset.top-u.top:a.offset.top-l.top)),i+a.size.width>=a.parentData.width&&(a.size.width=a.parentData.width-i,c&&(a.size.height=a.size.width/a.aspectRatio,p=!1)),s+a.size.height>=a.parentData.height&&(a.size.height=a.parentData.height-s,c&&(a.size.width=a.size.height*a.aspectRatio,p=!1)),p||(a.position.left=a.prevPosition.left,a.position.top=a.prevPosition.top,a.size.width=a.prevSize.width,a.size.height=a.prevSize.height)},stop:function(){var e=t(this).resizable("instance"),i=e.options,s=e.containerOffset,n=e.containerPosition,o=e.containerElement,a=t(e.helper),r=a.offset(),l=a.outerWidth()-e.sizeDiff.width,h=a.outerHeight()-e.sizeDiff.height;e._helper&&!i.animate&&/relative/.test(o.css("position"))&&t(this).css({left:r.left-n.left-s.left,width:l,height:h}),e._helper&&!i.animate&&/static/.test(o.css("position"))&&t(this).css({left:r.left-n.left-s.left,width:l,height:h})}}),t.ui.plugin.add("resizable","alsoResize",{start:function(){var e=t(this).resizable("instance"),i=e.options;t(i.alsoResize).each(function(){var e=t(this);e.data("ui-resizable-alsoresize",{width:parseFloat(e.width()),height:parseFloat(e.height()),left:parseFloat(e.css("left")),top:parseFloat(e.css("top"))})})},resize:function(e,i){var s=t(this).resizable("instance"),n=s.options,o=s.originalSize,a=s.originalPosition,r={height:s.size.height-o.height||0,width:s.size.width-o.width||0,top:s.position.top-a.top||0,left:s.position.left-a.left||0};t(n.alsoResize).each(function(){var e=t(this),s=t(this).data("ui-resizable-alsoresize"),n={},o=e.parents(i.originalElement[0]).length?["width","height"]:["width","height","top","left"];t.each(o,function(t,e){var i=(s[e]||0)+(r[e]||0);i&&i>=0&&(n[e]=i||null)}),e.css(n)})},stop:function(){t(this).removeData("ui-resizable-alsoresize")}}),t.ui.plugin.add("resizable","ghost",{start:function(){var e=t(this).resizable("instance"),i=e.size;e.ghost=e.originalElement.clone(),e.ghost.css({opacity:.25,display:"block",position:"relative",height:i.height,width:i.width,margin:0,left:0,top:0}),e._addClass(e.ghost,"ui-resizable-ghost"),t.uiBackCompat!==!1&&"string"==typeof e.options.ghost&&e.ghost.addClass(this.options.ghost),e.ghost.appendTo(e.helper)},resize:function(){var e=t(this).resizable("instance");e.ghost&&e.ghost.css({position:"relative",height:e.size.height,width:e.size.width})},stop:function(){var e=t(this).resizable("instance");e.ghost&&e.helper&&e.helper.get(0).removeChild(e.ghost.get(0))}}),t.ui.plugin.add("resizable","grid",{resize:function(){var e,i=t(this).resizable("instance"),s=i.options,n=i.size,o=i.originalSize,a=i.originalPosition,r=i.axis,l="number"==typeof s.grid?[s.grid,s.grid]:s.grid,h=l[0]||1,c=l[1]||1,u=Math.round((n.width-o.width)/h)*h,d=Math.round((n.height-o.height)/c)*c,p=o.width+u,f=o.height+d,g=s.maxWidth&&p>s.maxWidth,m=s.maxHeight&&f>s.maxHeight,_=s.minWidth&&s.minWidth>p,v=s.minHeight&&s.minHeight>f;s.grid=l,_&&(p+=h),v&&(f+=c),g&&(p-=h),m&&(f-=c),/^(se|s|e)$/.test(r)?(i.size.width=p,i.size.height=f):/^(ne)$/.test(r)?(i.size.width=p,i.size.height=f,i.position.top=a.top-d):/^(sw)$/.test(r)?(i.size.width=p,i.size.height=f,i.position.left=a.left-u):((0>=f-c||0>=p-h)&&(e=i._getPaddingPlusBorderDimensions(this)),f-c>0?(i.size.height=f,i.position.top=a.top-d):(f=c-e.height,i.size.height=f,i.position.top=a.top+o.height-f),p-h>0?(i.size.width=p,i.position.left=a.left-u):(p=h-e.width,i.size.width=p,i.position.left=a.left+o.width-p))}}),t.ui.resizable,t.widget("ui.selectable",t.ui.mouse,{version:"1.12.1",options:{appendTo:"body",autoRefresh:!0,distance:0,filter:"*",tolerance:"touch",selected:null,selecting:null,start:null,stop:null,unselected:null,unselecting:null},_create:function(){var e=this;this._addClass("ui-selectable"),this.dragged=!1,this.refresh=function(){e.elementPos=t(e.element[0]).offset(),e.selectees=t(e.options.filter,e.element[0]),e._addClass(e.selectees,"ui-selectee"),e.selectees.each(function(){var i=t(this),s=i.offset(),n={left:s.left-e.elementPos.left,top:s.top-e.elementPos.top};t.data(this,"selectable-item",{element:this,$element:i,left:n.left,top:n.top,right:n.left+i.outerWidth(),bottom:n.top+i.outerHeight(),startselected:!1,selected:i.hasClass("ui-selected"),selecting:i.hasClass("ui-selecting"),unselecting:i.hasClass("ui-unselecting")})})},this.refresh(),this._mouseInit(),this.helper=t("<div>"),this._addClass(this.helper,"ui-selectable-helper")},_destroy:function(){this.selectees.removeData("selectable-item"),this._mouseDestroy()},_mouseStart:function(e){var i=this,s=this.options;this.opos=[e.pageX,e.pageY],this.elementPos=t(this.element[0]).offset(),this.options.disabled||(this.selectees=t(s.filter,this.element[0]),this._trigger("start",e),t(s.appendTo).append(this.helper),this.helper.css({left:e.pageX,top:e.pageY,width:0,height:0}),s.autoRefresh&&this.refresh(),this.selectees.filter(".ui-selected").each(function(){var s=t.data(this,"selectable-item");s.startselected=!0,e.metaKey||e.ctrlKey||(i._removeClass(s.$element,"ui-selected"),s.selected=!1,i._addClass(s.$element,"ui-unselecting"),s.unselecting=!0,i._trigger("unselecting",e,{unselecting:s.element}))}),t(e.target).parents().addBack().each(function(){var s,n=t.data(this,"selectable-item");return n?(s=!e.metaKey&&!e.ctrlKey||!n.$element.hasClass("ui-selected"),i._removeClass(n.$element,s?"ui-unselecting":"ui-selected")._addClass(n.$element,s?"ui-selecting":"ui-unselecting"),n.unselecting=!s,n.selecting=s,n.selected=s,s?i._trigger("selecting",e,{selecting:n.element}):i._trigger("unselecting",e,{unselecting:n.element}),!1):void 0}))},_mouseDrag:function(e){if(this.dragged=!0,!this.options.disabled){var i,s=this,n=this.options,o=this.opos[0],a=this.opos[1],r=e.pageX,l=e.pageY;return o>r&&(i=r,r=o,o=i),a>l&&(i=l,l=a,a=i),this.helper.css({left:o,top:a,width:r-o,height:l-a}),this.selectees.each(function(){var i=t.data(this,"selectable-item"),h=!1,c={};i&&i.element!==s.element[0]&&(c.left=i.left+s.elementPos.left,c.right=i.right+s.elementPos.left,c.top=i.top+s.elementPos.top,c.bottom=i.bottom+s.elementPos.top,"touch"===n.tolerance?h=!(c.left>r||o>c.right||c.top>l||a>c.bottom):"fit"===n.tolerance&&(h=c.left>o&&r>c.right&&c.top>a&&l>c.bottom),h?(i.selected&&(s._removeClass(i.$element,"ui-selected"),i.selected=!1),i.unselecting&&(s._removeClass(i.$element,"ui-unselecting"),i.unselecting=!1),i.selecting||(s._addClass(i.$element,"ui-selecting"),i.selecting=!0,s._trigger("selecting",e,{selecting:i.element}))):(i.selecting&&((e.metaKey||e.ctrlKey)&&i.startselected?(s._removeClass(i.$element,"ui-selecting"),i.selecting=!1,s._addClass(i.$element,"ui-selected"),i.selected=!0):(s._removeClass(i.$element,"ui-selecting"),i.selecting=!1,i.startselected&&(s._addClass(i.$element,"ui-unselecting"),i.unselecting=!0),s._trigger("unselecting",e,{unselecting:i.element}))),i.selected&&(e.metaKey||e.ctrlKey||i.startselected||(s._removeClass(i.$element,"ui-selected"),i.selected=!1,s._addClass(i.$element,"ui-unselecting"),i.unselecting=!0,s._trigger("unselecting",e,{unselecting:i.element})))))}),!1}},_mouseStop:function(e){var i=this;return this.dragged=!1,t(".ui-unselecting",this.element[0]).each(function(){var s=t.data(this,"selectable-item");i._removeClass(s.$element,"ui-unselecting"),s.unselecting=!1,s.startselected=!1,i._trigger("unselected",e,{unselected:s.element})}),t(".ui-selecting",this.element[0]).each(function(){var s=t.data(this,"selectable-item");i._removeClass(s.$element,"ui-selecting")._addClass(s.$element,"ui-selected"),s.selecting=!1,s.selected=!0,s.startselected=!0,i._trigger("selected",e,{selected:s.element})}),this._trigger("stop",e),this.helper.remove(),!1}}),t.widget("ui.sortable",t.ui.mouse,{version:"1.12.1",widgetEventPrefix:"sort",ready:!1,options:{appendTo:"parent",axis:!1,connectWith:!1,containment:!1,cursor:"auto",cursorAt:!1,dropOnEmpty:!0,forcePlaceholderSize:!1,forceHelperSize:!1,grid:!1,handle:!1,helper:"original",items:"> *",opacity:!1,placeholder:!1,revert:!1,scroll:!0,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1e3,activate:null,beforeStop:null,change:null,deactivate:null,out:null,over:null,receive:null,remove:null,sort:null,start:null,stop:null,update:null},_isOverAxis:function(t,e,i){return t>=e&&e+i>t},_isFloating:function(t){return/left|right/.test(t.css("float"))||/inline|table-cell/.test(t.css("display"))},_create:function(){this.containerCache={},this._addClass("ui-sortable"),this.refresh(),this.offset=this.element.offset(),this._mouseInit(),this._setHandleClassName(),this.ready=!0},_setOption:function(t,e){this._super(t,e),"handle"===t&&this._setHandleClassName()},_setHandleClassName:function(){var e=this;this._removeClass(this.element.find(".ui-sortable-handle"),"ui-sortable-handle"),t.each(this.items,function(){e._addClass(this.instance.options.handle?this.item.find(this.instance.options.handle):this.item,"ui-sortable-handle")})},_destroy:function(){this._mouseDestroy();for(var t=this.items.length-1;t>=0;t--)this.items[t].item.removeData(this.widgetName+"-item");return this},_mouseCapture:function(e,i){var s=null,n=!1,o=this;return this.reverting?!1:this.options.disabled||"static"===this.options.type?!1:(this._refreshItems(e),t(e.target).parents().each(function(){return t.data(this,o.widgetName+"-item")===o?(s=t(this),!1):void 0}),t.data(e.target,o.widgetName+"-item")===o&&(s=t(e.target)),s?!this.options.handle||i||(t(this.options.handle,s).find("*").addBack().each(function(){this===e.target&&(n=!0)}),n)?(this.currentItem=s,this._removeCurrentsFromItems(),!0):!1:!1)},_mouseStart:function(e,i,s){var n,o,a=this.options;if(this.currentContainer=this,this.refreshPositions(),this.helper=this._createHelper(e),this._cacheHelperProportions(),this._cacheMargins(),this.scrollParent=this.helper.scrollParent(),this.offset=this.currentItem.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},t.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.helper.css("position","absolute"),this.cssPosition=this.helper.css("position"),this.originalPosition=this._generatePosition(e),this.originalPageX=e.pageX,this.originalPageY=e.pageY,a.cursorAt&&this._adjustOffsetFromHelper(a.cursorAt),this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]},this.helper[0]!==this.currentItem[0]&&this.currentItem.hide(),this._createPlaceholder(),a.containment&&this._setContainment(),a.cursor&&"auto"!==a.cursor&&(o=this.document.find("body"),this.storedCursor=o.css("cursor"),o.css("cursor",a.cursor),this.storedStylesheet=t("<style>*{ cursor: "+a.cursor+" !important; }</style>").appendTo(o)),a.opacity&&(this.helper.css("opacity")&&(this._storedOpacity=this.helper.css("opacity")),this.helper.css("opacity",a.opacity)),a.zIndex&&(this.helper.css("zIndex")&&(this._storedZIndex=this.helper.css("zIndex")),this.helper.css("zIndex",a.zIndex)),this.scrollParent[0]!==this.document[0]&&"HTML"!==this.scrollParent[0].tagName&&(this.overflowOffset=this.scrollParent.offset()),this._trigger("start",e,this._uiHash()),this._preserveHelperProportions||this._cacheHelperProportions(),!s)for(n=this.containers.length-1;n>=0;n--)this.containers[n]._trigger("activate",e,this._uiHash(this));return t.ui.ddmanager&&(t.ui.ddmanager.current=this),t.ui.ddmanager&&!a.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this.dragging=!0,this._addClass(this.helper,"ui-sortable-helper"),this._mouseDrag(e),!0},_mouseDrag:function(e){var i,s,n,o,a=this.options,r=!1;for(this.position=this._generatePosition(e),this.positionAbs=this._convertPositionTo("absolute"),this.lastPositionAbs||(this.lastPositionAbs=this.positionAbs),this.options.scroll&&(this.scrollParent[0]!==this.document[0]&&"HTML"!==this.scrollParent[0].tagName?(this.overflowOffset.top+this.scrollParent[0].offsetHeight-e.pageY<a.scrollSensitivity?this.scrollParent[0].scrollTop=r=this.scrollParent[0].scrollTop+a.scrollSpeed:e.pageY-this.overflowOffset.top<a.scrollSensitivity&&(this.scrollParent[0].scrollTop=r=this.scrollParent[0].scrollTop-a.scrollSpeed),this.overflowOffset.left+this.scrollParent[0].offsetWidth-e.pageX<a.scrollSensitivity?this.scrollParent[0].scrollLeft=r=this.scrollParent[0].scrollLeft+a.scrollSpeed:e.pageX-this.overflowOffset.left<a.scrollSensitivity&&(this.scrollParent[0].scrollLeft=r=this.scrollParent[0].scrollLeft-a.scrollSpeed)):(e.pageY-this.document.scrollTop()<a.scrollSensitivity?r=this.document.scrollTop(this.document.scrollTop()-a.scrollSpeed):this.window.height()-(e.pageY-this.document.scrollTop())<a.scrollSensitivity&&(r=this.document.scrollTop(this.document.scrollTop()+a.scrollSpeed)),e.pageX-this.document.scrollLeft()<a.scrollSensitivity?r=this.document.scrollLeft(this.document.scrollLeft()-a.scrollSpeed):this.window.width()-(e.pageX-this.document.scrollLeft())<a.scrollSensitivity&&(r=this.document.scrollLeft(this.document.scrollLeft()+a.scrollSpeed))),r!==!1&&t.ui.ddmanager&&!a.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e)),this.positionAbs=this._convertPositionTo("absolute"),this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),i=this.items.length-1;i>=0;i--)if(s=this.items[i],n=s.item[0],o=this._intersectsWithPointer(s),o&&s.instance===this.currentContainer&&n!==this.currentItem[0]&&this.placeholder[1===o?"next":"prev"]()[0]!==n&&!t.contains(this.placeholder[0],n)&&("semi-dynamic"===this.options.type?!t.contains(this.element[0],n):!0)){if(this.direction=1===o?"down":"up","pointer"!==this.options.tolerance&&!this._intersectsWithSides(s))break;
        this._rearrange(e,s),this._trigger("change",e,this._uiHash());break}return this._contactContainers(e),t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),this._trigger("sort",e,this._uiHash()),this.lastPositionAbs=this.positionAbs,!1},_mouseStop:function(e,i){if(e){if(t.ui.ddmanager&&!this.options.dropBehaviour&&t.ui.ddmanager.drop(this,e),this.options.revert){var s=this,n=this.placeholder.offset(),o=this.options.axis,a={};o&&"x"!==o||(a.left=n.left-this.offset.parent.left-this.margins.left+(this.offsetParent[0]===this.document[0].body?0:this.offsetParent[0].scrollLeft)),o&&"y"!==o||(a.top=n.top-this.offset.parent.top-this.margins.top+(this.offsetParent[0]===this.document[0].body?0:this.offsetParent[0].scrollTop)),this.reverting=!0,t(this.helper).animate(a,parseInt(this.options.revert,10)||500,function(){s._clear(e)})}else this._clear(e,i);return!1}},cancel:function(){if(this.dragging){this._mouseUp(new t.Event("mouseup",{target:null})),"original"===this.options.helper?(this.currentItem.css(this._storedCSS),this._removeClass(this.currentItem,"ui-sortable-helper")):this.currentItem.show();for(var e=this.containers.length-1;e>=0;e--)this.containers[e]._trigger("deactivate",null,this._uiHash(this)),this.containers[e].containerCache.over&&(this.containers[e]._trigger("out",null,this._uiHash(this)),this.containers[e].containerCache.over=0)}return this.placeholder&&(this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]),"original"!==this.options.helper&&this.helper&&this.helper[0].parentNode&&this.helper.remove(),t.extend(this,{helper:null,dragging:!1,reverting:!1,_noFinalSort:null}),this.domPosition.prev?t(this.domPosition.prev).after(this.currentItem):t(this.domPosition.parent).prepend(this.currentItem)),this},serialize:function(e){var i=this._getItemsAsjQuery(e&&e.connected),s=[];return e=e||{},t(i).each(function(){var i=(t(e.item||this).attr(e.attribute||"id")||"").match(e.expression||/(.+)[\-=_](.+)/);i&&s.push((e.key||i[1]+"[]")+"="+(e.key&&e.expression?i[1]:i[2]))}),!s.length&&e.key&&s.push(e.key+"="),s.join("&")},toArray:function(e){var i=this._getItemsAsjQuery(e&&e.connected),s=[];return e=e||{},i.each(function(){s.push(t(e.item||this).attr(e.attribute||"id")||"")}),s},_intersectsWith:function(t){var e=this.positionAbs.left,i=e+this.helperProportions.width,s=this.positionAbs.top,n=s+this.helperProportions.height,o=t.left,a=o+t.width,r=t.top,l=r+t.height,h=this.offset.click.top,c=this.offset.click.left,u="x"===this.options.axis||s+h>r&&l>s+h,d="y"===this.options.axis||e+c>o&&a>e+c,p=u&&d;return"pointer"===this.options.tolerance||this.options.forcePointerForContainers||"pointer"!==this.options.tolerance&&this.helperProportions[this.floating?"width":"height"]>t[this.floating?"width":"height"]?p:e+this.helperProportions.width/2>o&&a>i-this.helperProportions.width/2&&s+this.helperProportions.height/2>r&&l>n-this.helperProportions.height/2},_intersectsWithPointer:function(t){var e,i,s="x"===this.options.axis||this._isOverAxis(this.positionAbs.top+this.offset.click.top,t.top,t.height),n="y"===this.options.axis||this._isOverAxis(this.positionAbs.left+this.offset.click.left,t.left,t.width),o=s&&n;return o?(e=this._getDragVerticalDirection(),i=this._getDragHorizontalDirection(),this.floating?"right"===i||"down"===e?2:1:e&&("down"===e?2:1)):!1},_intersectsWithSides:function(t){var e=this._isOverAxis(this.positionAbs.top+this.offset.click.top,t.top+t.height/2,t.height),i=this._isOverAxis(this.positionAbs.left+this.offset.click.left,t.left+t.width/2,t.width),s=this._getDragVerticalDirection(),n=this._getDragHorizontalDirection();return this.floating&&n?"right"===n&&i||"left"===n&&!i:s&&("down"===s&&e||"up"===s&&!e)},_getDragVerticalDirection:function(){var t=this.positionAbs.top-this.lastPositionAbs.top;return 0!==t&&(t>0?"down":"up")},_getDragHorizontalDirection:function(){var t=this.positionAbs.left-this.lastPositionAbs.left;return 0!==t&&(t>0?"right":"left")},refresh:function(t){return this._refreshItems(t),this._setHandleClassName(),this.refreshPositions(),this},_connectWith:function(){var t=this.options;return t.connectWith.constructor===String?[t.connectWith]:t.connectWith},_getItemsAsjQuery:function(e){function i(){r.push(this)}var s,n,o,a,r=[],l=[],h=this._connectWith();if(h&&e)for(s=h.length-1;s>=0;s--)for(o=t(h[s],this.document[0]),n=o.length-1;n>=0;n--)a=t.data(o[n],this.widgetFullName),a&&a!==this&&!a.options.disabled&&l.push([t.isFunction(a.options.items)?a.options.items.call(a.element):t(a.options.items,a.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),a]);for(l.push([t.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):t(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]),s=l.length-1;s>=0;s--)l[s][0].each(i);return t(r)},_removeCurrentsFromItems:function(){var e=this.currentItem.find(":data("+this.widgetName+"-item)");this.items=t.grep(this.items,function(t){for(var i=0;e.length>i;i++)if(e[i]===t.item[0])return!1;return!0})},_refreshItems:function(e){this.items=[],this.containers=[this];var i,s,n,o,a,r,l,h,c=this.items,u=[[t.isFunction(this.options.items)?this.options.items.call(this.element[0],e,{item:this.currentItem}):t(this.options.items,this.element),this]],d=this._connectWith();if(d&&this.ready)for(i=d.length-1;i>=0;i--)for(n=t(d[i],this.document[0]),s=n.length-1;s>=0;s--)o=t.data(n[s],this.widgetFullName),o&&o!==this&&!o.options.disabled&&(u.push([t.isFunction(o.options.items)?o.options.items.call(o.element[0],e,{item:this.currentItem}):t(o.options.items,o.element),o]),this.containers.push(o));for(i=u.length-1;i>=0;i--)for(a=u[i][1],r=u[i][0],s=0,h=r.length;h>s;s++)l=t(r[s]),l.data(this.widgetName+"-item",a),c.push({item:l,instance:a,width:0,height:0,left:0,top:0})},refreshPositions:function(e){this.floating=this.items.length?"x"===this.options.axis||this._isFloating(this.items[0].item):!1,this.offsetParent&&this.helper&&(this.offset.parent=this._getParentOffset());var i,s,n,o;for(i=this.items.length-1;i>=0;i--)s=this.items[i],s.instance!==this.currentContainer&&this.currentContainer&&s.item[0]!==this.currentItem[0]||(n=this.options.toleranceElement?t(this.options.toleranceElement,s.item):s.item,e||(s.width=n.outerWidth(),s.height=n.outerHeight()),o=n.offset(),s.left=o.left,s.top=o.top);if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(i=this.containers.length-1;i>=0;i--)o=this.containers[i].element.offset(),this.containers[i].containerCache.left=o.left,this.containers[i].containerCache.top=o.top,this.containers[i].containerCache.width=this.containers[i].element.outerWidth(),this.containers[i].containerCache.height=this.containers[i].element.outerHeight();return this},_createPlaceholder:function(e){e=e||this;var i,s=e.options;s.placeholder&&s.placeholder.constructor!==String||(i=s.placeholder,s.placeholder={element:function(){var s=e.currentItem[0].nodeName.toLowerCase(),n=t("<"+s+">",e.document[0]);return e._addClass(n,"ui-sortable-placeholder",i||e.currentItem[0].className)._removeClass(n,"ui-sortable-helper"),"tbody"===s?e._createTrPlaceholder(e.currentItem.find("tr").eq(0),t("<tr>",e.document[0]).appendTo(n)):"tr"===s?e._createTrPlaceholder(e.currentItem,n):"img"===s&&n.attr("src",e.currentItem.attr("src")),i||n.css("visibility","hidden"),n},update:function(t,n){(!i||s.forcePlaceholderSize)&&(n.height()||n.height(e.currentItem.innerHeight()-parseInt(e.currentItem.css("paddingTop")||0,10)-parseInt(e.currentItem.css("paddingBottom")||0,10)),n.width()||n.width(e.currentItem.innerWidth()-parseInt(e.currentItem.css("paddingLeft")||0,10)-parseInt(e.currentItem.css("paddingRight")||0,10)))}}),e.placeholder=t(s.placeholder.element.call(e.element,e.currentItem)),e.currentItem.after(e.placeholder),s.placeholder.update(e,e.placeholder)},_createTrPlaceholder:function(e,i){var s=this;e.children().each(function(){t("<td>&#160;</td>",s.document[0]).attr("colspan",t(this).attr("colspan")||1).appendTo(i)})},_contactContainers:function(e){var i,s,n,o,a,r,l,h,c,u,d=null,p=null;for(i=this.containers.length-1;i>=0;i--)if(!t.contains(this.currentItem[0],this.containers[i].element[0]))if(this._intersectsWith(this.containers[i].containerCache)){if(d&&t.contains(this.containers[i].element[0],d.element[0]))continue;d=this.containers[i],p=i}else this.containers[i].containerCache.over&&(this.containers[i]._trigger("out",e,this._uiHash(this)),this.containers[i].containerCache.over=0);if(d)if(1===this.containers.length)this.containers[p].containerCache.over||(this.containers[p]._trigger("over",e,this._uiHash(this)),this.containers[p].containerCache.over=1);else{for(n=1e4,o=null,c=d.floating||this._isFloating(this.currentItem),a=c?"left":"top",r=c?"width":"height",u=c?"pageX":"pageY",s=this.items.length-1;s>=0;s--)t.contains(this.containers[p].element[0],this.items[s].item[0])&&this.items[s].item[0]!==this.currentItem[0]&&(l=this.items[s].item.offset()[a],h=!1,e[u]-l>this.items[s][r]/2&&(h=!0),n>Math.abs(e[u]-l)&&(n=Math.abs(e[u]-l),o=this.items[s],this.direction=h?"up":"down"));if(!o&&!this.options.dropOnEmpty)return;if(this.currentContainer===this.containers[p])return this.currentContainer.containerCache.over||(this.containers[p]._trigger("over",e,this._uiHash()),this.currentContainer.containerCache.over=1),void 0;o?this._rearrange(e,o,null,!0):this._rearrange(e,null,this.containers[p].element,!0),this._trigger("change",e,this._uiHash()),this.containers[p]._trigger("change",e,this._uiHash(this)),this.currentContainer=this.containers[p],this.options.placeholder.update(this.currentContainer,this.placeholder),this.containers[p]._trigger("over",e,this._uiHash(this)),this.containers[p].containerCache.over=1}},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper)?t(i.helper.apply(this.element[0],[e,this.currentItem])):"clone"===i.helper?this.currentItem.clone():this.currentItem;return s.parents("body").length||t("parent"!==i.appendTo?i.appendTo:this.currentItem[0].parentNode)[0].appendChild(s[0]),s[0]===this.currentItem[0]&&(this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")}),(!s[0].style.width||i.forceHelperSize)&&s.width(this.currentItem.width()),(!s[0].style.height||i.forceHelperSize)&&s.height(this.currentItem.height()),s},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var e=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==this.document[0]&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===this.document[0].body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&t.ui.ie)&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var t=this.currentItem.position();return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:t.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options;"parent"===n.containment&&(n.containment=this.helper[0].parentNode),("document"===n.containment||"window"===n.containment)&&(this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,"document"===n.containment?this.document.width():this.window.width()-this.helperProportions.width-this.margins.left,("document"===n.containment?this.document.height()||document.body.parentNode.scrollHeight:this.window.height()||this.document[0].body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]),/^(document|window|parent)$/.test(n.containment)||(e=t(n.containment)[0],i=t(n.containment).offset(),s="hidden"!==t(e).css("overflow"),this.containment=[i.left+(parseInt(t(e).css("borderLeftWidth"),10)||0)+(parseInt(t(e).css("paddingLeft"),10)||0)-this.margins.left,i.top+(parseInt(t(e).css("borderTopWidth"),10)||0)+(parseInt(t(e).css("paddingTop"),10)||0)-this.margins.top,i.left+(s?Math.max(e.scrollWidth,e.offsetWidth):e.offsetWidth)-(parseInt(t(e).css("borderLeftWidth"),10)||0)-(parseInt(t(e).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,i.top+(s?Math.max(e.scrollHeight,e.offsetHeight):e.offsetHeight)-(parseInt(t(e).css("borderTopWidth"),10)||0)-(parseInt(t(e).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top])},_convertPositionTo:function(e,i){i||(i=this.position);var s="absolute"===e?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==this.document[0]&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,o=/(html|body)/i.test(n[0].tagName);return{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():o?0:n.scrollTop())*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():o?0:n.scrollLeft())*s}},_generatePosition:function(e){var i,s,n=this.options,o=e.pageX,a=e.pageY,r="absolute"!==this.cssPosition||this.scrollParent[0]!==this.document[0]&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,l=/(html|body)/i.test(r[0].tagName);return"relative"!==this.cssPosition||this.scrollParent[0]!==this.document[0]&&this.scrollParent[0]!==this.offsetParent[0]||(this.offset.relative=this._getRelativeOffset()),this.originalPosition&&(this.containment&&(e.pageX-this.offset.click.left<this.containment[0]&&(o=this.containment[0]+this.offset.click.left),e.pageY-this.offset.click.top<this.containment[1]&&(a=this.containment[1]+this.offset.click.top),e.pageX-this.offset.click.left>this.containment[2]&&(o=this.containment[2]+this.offset.click.left),e.pageY-this.offset.click.top>this.containment[3]&&(a=this.containment[3]+this.offset.click.top)),n.grid&&(i=this.originalPageY+Math.round((a-this.originalPageY)/n.grid[1])*n.grid[1],a=this.containment?i-this.offset.click.top>=this.containment[1]&&i-this.offset.click.top<=this.containment[3]?i:i-this.offset.click.top>=this.containment[1]?i-n.grid[1]:i+n.grid[1]:i,s=this.originalPageX+Math.round((o-this.originalPageX)/n.grid[0])*n.grid[0],o=this.containment?s-this.offset.click.left>=this.containment[0]&&s-this.offset.click.left<=this.containment[2]?s:s-this.offset.click.left>=this.containment[0]?s-n.grid[0]:s+n.grid[0]:s)),{top:a-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():l?0:r.scrollTop()),left:o-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():l?0:r.scrollLeft())}},_rearrange:function(t,e,i,s){i?i[0].appendChild(this.placeholder[0]):e.item[0].parentNode.insertBefore(this.placeholder[0],"down"===this.direction?e.item[0]:e.item[0].nextSibling),this.counter=this.counter?++this.counter:1;var n=this.counter;this._delay(function(){n===this.counter&&this.refreshPositions(!s)})},_clear:function(t,e){function i(t,e,i){return function(s){i._trigger(t,s,e._uiHash(e))}}this.reverting=!1;var s,n=[];if(!this._noFinalSort&&this.currentItem.parent().length&&this.placeholder.before(this.currentItem),this._noFinalSort=null,this.helper[0]===this.currentItem[0]){for(s in this._storedCSS)("auto"===this._storedCSS[s]||"static"===this._storedCSS[s])&&(this._storedCSS[s]="");this.currentItem.css(this._storedCSS),this._removeClass(this.currentItem,"ui-sortable-helper")}else this.currentItem.show();for(this.fromOutside&&!e&&n.push(function(t){this._trigger("receive",t,this._uiHash(this.fromOutside))}),!this.fromOutside&&this.domPosition.prev===this.currentItem.prev().not(".ui-sortable-helper")[0]&&this.domPosition.parent===this.currentItem.parent()[0]||e||n.push(function(t){this._trigger("update",t,this._uiHash())}),this!==this.currentContainer&&(e||(n.push(function(t){this._trigger("remove",t,this._uiHash())}),n.push(function(t){return function(e){t._trigger("receive",e,this._uiHash(this))}}.call(this,this.currentContainer)),n.push(function(t){return function(e){t._trigger("update",e,this._uiHash(this))}}.call(this,this.currentContainer)))),s=this.containers.length-1;s>=0;s--)e||n.push(i("deactivate",this,this.containers[s])),this.containers[s].containerCache.over&&(n.push(i("out",this,this.containers[s])),this.containers[s].containerCache.over=0);if(this.storedCursor&&(this.document.find("body").css("cursor",this.storedCursor),this.storedStylesheet.remove()),this._storedOpacity&&this.helper.css("opacity",this._storedOpacity),this._storedZIndex&&this.helper.css("zIndex","auto"===this._storedZIndex?"":this._storedZIndex),this.dragging=!1,e||this._trigger("beforeStop",t,this._uiHash()),this.placeholder[0].parentNode.removeChild(this.placeholder[0]),this.cancelHelperRemoval||(this.helper[0]!==this.currentItem[0]&&this.helper.remove(),this.helper=null),!e){for(s=0;n.length>s;s++)n[s].call(this,t);this._trigger("stop",t,this._uiHash())}return this.fromOutside=!1,!this.cancelHelperRemoval},_trigger:function(){t.Widget.prototype._trigger.apply(this,arguments)===!1&&this.cancel()},_uiHash:function(e){var i=e||this;return{helper:i.helper,placeholder:i.placeholder||t([]),position:i.position,originalPosition:i.originalPosition,offset:i.positionAbs,item:i.currentItem,sender:e?e.element:null}}})});
        ;
        
        // source: plugin/systemcommandeditor/js/systemcommandeditor.js
        ﻿$(function() {
            function SystemCommandEditorViewModel(parameters) {
                var self = this;
        
                self.settingsViewModel = parameters[0];
                self.systemCommandEditorDialogViewModel = parameters[1];
        
                self.actionsFromServer = [];
                self.systemActions = ko.observableArray([]);
        
                self.popup = undefined;
        
                self.dividerID = 0;
        
                self.onSettingsShown = function () {
                    self.requestData();
                };
        
                self.requestData = function () {
                    $.ajax({
                        url: API_BASEURL + "settings",
                        type: "GET",
                        dataType: "json",
                        success: function(response) {
                            self.fromResponse(response);
                        }
                    });
                };
        
                self.fromResponse = function (response) {
                    self.actionsFromServer = response.system.actions || [];
                    self.rerenderActions();
        
                    $("#systemActions").sortable({
                        items: '> li:not(.static)',
                        cursor: 'move',
                        update: function(event, ui) {
                            var data = ko.dataFor(ui.item[0]);
                            var item = _.find(self.actionsFromServer, function(e) {
                                return e.action == data.action();
                            });
        
                            var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]) - 1;
                            if (position >= 0) {
                                self.actionsFromServer = _.without(self.actionsFromServer, item);
                                self.actionsFromServer.splice(position, 0, item);
                            }
                            ui.item.remove();
                            self.rerenderActions();
                        },
                        start: function(){
                            $('.static', this).each(function(){
                                var $this = $(this);
                                $this.data('pos', $this.index());
                            });
                        },
                        change: function(){
                            $sortable = $(this);
                            $statics = $('.static', this).detach();
                            $helper = $('<li></li>').prependTo(this);
                            $statics.each(function(){
                                var $this = $(this);
                                var target = $this.data('pos');
        
                                $this.insertAfter($('li', $sortable).eq(target));
                            });
                            $helper.remove();
                        }
                    });
                };
        
                self.rerenderActions = function() {
                    self.dividerID = 0;
        
                    var array = []
                    _.each(self.actionsFromServer, function(e) {
                        var element = {};
        
                        if (!e.action.startsWith("divider")) {
                            element = _.extend(element, {
                                name: ko.observable(e.name),
                                action: ko.observable(e.action),
                                command: ko.observable(e.command)
                            });
        
                            if (e.hasOwnProperty("confirm"))
                                element.confirm = ko.observable(e.confirm);
                        }
                        else
                        {
                            e.action = "divider" + (++self.dividerID);
                            element.action = ko.observable(e.action);
                        }
                        array.push(element);
                    })
                    self.systemActions(array);
                }
        
                self._showPopup = function (options, eventListeners) {
                    if (self.popup !== undefined) {
                        self.popup.remove();
                    }
                    self.popup = new PNotify(options);
        
                    if (eventListeners) {
                        var popupObj = self.popup.get();
                        _.each(eventListeners, function (value, key) {
                            popupObj.on(key, value);
                        })
                    }
                };
        
                self.createElement = function (invokedOn, contextParent, selectedMenu) {
                    self.systemCommandEditorDialogViewModel.reset();
                    self.systemCommandEditorDialogViewModel.title(gettext("Create Command"));
        
                    self.systemCommandEditorDialogViewModel.show(function (ret) {
                        self.actionsFromServer.push(ret);
                        self.rerenderActions();
                    });
                }
                self.deleteElement = function (invokedOn, contextParent, selectedMenu) {
                    var elementID = contextParent.attr('id');
                    var element = _.find(self.actionsFromServer, function(e) {
                        return e.action == elementID;
                    });
                    if (element == undefined) {
                        self._showPopup({
                            title: gettext("Something went wrong while creating the new Element"),
                            type: "error"
                        });
                        return;
                    }
        
                    showConfirmationDialog("", function (e) {
                        self.actionsFromServer = _.without(self.actionsFromServer, element);
                        self.rerenderActions();
                    });
                }
                self.editElement = function (invokedOn, contextParent, selectedMenu) {
                    var elementID = contextParent.attr('id');
                    var element = self.element = _.find(self.actionsFromServer, function(e) {
                        return e.action == elementID;
                    });
                    if (element == undefined) {
                        self._showPopup({
                            title: gettext("Something went wrong while creating the new Element"),
                            type: "error"
                        });
                        return;
                    }
        
                    var data = ko.mapping.toJS(element);
        
                    self.systemCommandEditorDialogViewModel.reset(data);
                    self.systemCommandEditorDialogViewModel.title(gettext("Edit Command"));
        
                    self.systemCommandEditorDialogViewModel.show(function (ret) {
                        var element = self.element;
        
                        element.name = ret.name;
                        element.action = ret.action;
                        element.command = ret.command;
        
                        if (ret.hasOwnProperty("confirm"))
                            element.confirm = ret.confirm;
                        else
                            delete element.confirm;
        
                        self.rerenderActions();
                    });
                }
        
                self.systemContextMenu = function (invokedOn, contextParent, selectedMenu) {
                    switch (selectedMenu.attr('cmd')) {
                        case "editCommand": {
                            self.editElement(invokedOn, contextParent, selectedMenu);
                            break;
                        }
                        case "deleteCommand": {
                            self.deleteElement(invokedOn, contextParent, selectedMenu);
                            break;
                        }
                        case "createCommand": {
                            self.createElement(invokedOn, contextParent, selectedMenu);
                            break;
                        }
                        case "createDivider": {
                            self.actionsFromServer.push({ action: "divider" });
                            self.rerenderActions();
                            break;
                        }
                    }
                }
        
                self.onBeforeBinding = function () {
                    self.settings = self.settingsViewModel.settings;
                }
        
                self.onSettingsBeforeSave = function () {
                    _.each(self.actionsFromServer, function(e) {
                        if (e.action.startsWith("divider")) {
                            e.action = "divider";
                        }
                    });
                    self.settingsViewModel.system_actions(self.actionsFromServer);
                }
        
                self.onEventSettingsUpdated = function (payload) {
                    self.requestData();
                }
            }
        
            // view model class, parameters for constructor, container to bind to
            OCTOPRINT_VIEWMODELS.push([
                SystemCommandEditorViewModel,
                ["settingsViewModel", "systemCommandEditorDialogViewModel"],
                ["#settings_plugin_systemcommandeditor"]
            ]);
        });
        ;
        
        // source: plugin/systemcommandeditor/js/systemcommandeditorDialog.js
        $(function () {
            function systemCommandEditorDialogViewModel(parameters) {
                var self = this;
        
                self.element = ko.observable();
        
                self.title = ko.observable(gettext("Create Command"));
        
                self.useConfirm = ko.observable(false);
        
                self.reset = function (data) {
                    var element = {
                        name: "",
                        action: "",
                        command: "",
                        confirm: ""
                    };
        
                    if (typeof data == "object") {
                        element = _.extend(element, data);
        
                        self.useConfirm(data.hasOwnProperty("confirm"));
                    }
        
                    self.element(ko.mapping.fromJS(element));
                };
        
                self.show = function (f) {
                    var dialog = $("#systemCommandEditorDialog");
                    var from = $('#systemCommandEditorDialogForm', dialog);
        
                    from.on('submit', function (e) {
                        var name = $('#systemCommandEditorDialog_Name');
                        var action = $('#systemCommandEditorDialog_Action');
        
                        var error = false;
        
                        if (!name.val()) {
                            name.closest('.control-group').removeClass('success').addClass('error');
        
                            error = true;
                        }
                        if (!action.val()) {
                            action.closest('.control-group').removeClass('success').addClass('error');
        
                            error = true;
                        }
        
                        if (error) {
                            e.preventDefault();
                            return;
                        }
        
                        dialog.modal('hide');
                        var obj = ko.mapping.toJS(self.element);
        
                        if (!self.useConfirm())
                            delete obj.confirm;
        
                        f(obj);
                    });
        
                    dialog.modal({
                        show: 'true',
                        backdrop: 'static',
                        keyboard: false
                    });
                };
            }
        
            // view model class, parameters for constructor, container to bind to
            OCTOPRINT_VIEWMODELS.push([
                systemCommandEditorDialogViewModel,
                [],
                "#systemCommandEditorDialog"
            ]);
        });
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin systemcommandeditor:", (error.stack || error));
    }
})();

// JS assets for plugin themeify
(function () {
    try {
        // source: plugin/themeify/dist/themeify.min.js
        !function(e){function t(o){if(n[o])return n[o].exports;var s=n[o]={i:o,l:!1,exports:{}};return e[o].call(s.exports,s,s.exports,t),s.l=!0,s.exports}var n={};t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,n){n(1),e.exports=n(2)},function(e,t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}$(function(){function e(e){var t=this;t.classId="themeify",t.settings=e[0],t.ownSettings={},t.customRules=[],t.customizedElements=[],t.builtInElements=[],t._ownSettingsPrev={},t.configSubscriptions={enabled:"",theme:""},t.tabIcons={},t.oldTabContent={};var o=function(e){return t._ownSettingsPrev[e]};t.onStartupComplete=function(){var e=$("html").attr("id");e&&"touch"==e&&$("html").removeClass(t.classId),t.updateColors(),t._updateCustomRules()},t.setupIcons=function(){t.tabIcons.tabs().filter(function(e){return e.domId()&&e.enabled()}).map(function(e,n){var o=e.domId,s=(e.enabled,e.faIcon),l=$("<i>",{class:s()}),i=$("".concat(o()," a"));i&&"tabs"===i.closest("ul").attr("id")?(t.oldTabContent[o()]=$("".concat(o()," a")).html(),i.html(l)):console.warn("Themeify: Failed to add icon! ".concat(o()," is not a child of the tab-list!"))})},t.restoreTabs=function(){t.tabIcons.tabs().filter(function(e){return e.domId()}).map(function(e,n){var o=e.domId,s=(e.enabled,e.faIcon,t.oldTabContent[o()]);s&&$("".concat(o()," a")).html(s)})},t.enableBeforeLoaded=function(){var e=localStorage.getItem("theme");e&&$("html").addClass(t.classId).addClass(e)},t.enable=function(){if(t.ownSettings.enabled()&&"touch"!==$("html").attr("id")){var e=t.ownSettings.theme();localStorage.setItem("theme",e),$("html").addClass(t.classId).addClass(t.ownSettings.theme())}},t.addNewCustomRule=function(){var e={selector:ko.observable(""),rule:ko.observable(""),value:ko.observable(""),enabled:ko.observable(!0)};t._subscribeToDictValues(e,"customRules"),t.ownSettings.customRules.push(e)},t.addNewIcon=function(){var e={domId:ko.observable(""),enabled:ko.observable(!0),faIcon:ko.observable("")};t._subscribeToDictValues(e,"tabs"),t.tabIcons.tabs.push(e)},t.onBeforeBinding=function(){t.settings=t.settings.settings,t.ownSettings=t.settings.plugins.themeify,t.customRules=t.ownSettings.customRules.extend({rateLimit:50}),t.onRuleToggle=t.onRuleToggle,t.tabIcons={enabled:t.ownSettings.tabs.enableIcons,tabs:t.ownSettings.tabs.icons},t.tabIcons.enabled()&&t.setupIcons(),t.enable(),t._copyOwnSettings()},t.updateColors=function(){t._removeBuiltInStyles(),t.ownSettings.enableCustomization()&&t.ownSettings.color().filter(function(e){return!!e.enabled()}).map(function(e,n){t._applyRule(e,!0)})},t._updateCustomRules=function(){t._removeCustomStyles(),t.updateColors(),t.ownSettings.enableCustomization()&&t.ownSettings.customRules().filter(function(e){return!!e.enabled()}).map(function(e){t._applyRule(e)})},t._applyRule=function(e){var n=arguments.length>1&&void 0!==arguments[1]&&arguments[1],o=$(e.selector()),s=o.css(e.rule());n?t.builtInElements.push({elem:o,rule:e.rule(),old:s}):t.customizedElements.push({elem:o,rule:e.rule(),old:s}),$(e.selector()).css(e.rule(),e.value())},t.clone=function(e){if("function"==typeof e)return e();if(null===e||"object"!==n(e)||"isActiveClone"in e)return e;if(e instanceof Date)var o=new e.constructor;else var o=e.constructor();for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&(e.isActiveClone=null,o[s]=t.clone(e[s]),delete e.isActiveClone);return o},t._copyOwnSettings=function(){Object.keys(t.ownSettings).forEach(function(e,n){t._ownSettingsPrev[e]=t.clone(t.ownSettings[e])})},t.onChange=function(e,n){t.updateColors(),t._copyOwnSettings()},t.onColorChange=function(e,n){t.updateColors(),t._copyOwnSettings()},t.onCustomRuleChange=function(e){t.updateColors(),e.rule()&&e.selector()&&e.value()&&t._updateCustomRules()},t.onThemeChange=function(e){var n=o("theme");(function(e){return $("html").hasClass(e)})(e)||(localStorage.setItem("theme",e),$("html").addClass(e).removeClass(n)),t._copyOwnSettings()},t.onEnabledChange=function(e){if(e&&"touch"!==$("html").attr("id")){var n=t.ownSettings.theme();$("html").addClass(t.classId).addClass(n),localStorage.setItem("theme",n)}else $("html").removeClass(t.classId),localStorage.setItem("theme",!1);t._copyOwnSettings()},t.onEnableCustomizationChange=function(e){e?(t.updateColors(),t._updateCustomRules()):(t._removeBuiltInStyles(),t._removeCustomStyles()),t._copyOwnSettings()},t.onIconsEnableChange=function(e){e?t.setupIcons():t.restoreTabs()},t.onIconChange=function(e,n,o){t.tabIcons.enabled()&&("enabled"!==o||n||t.restoreTabs(),t.setupIcons())},t._removeCustomStyles=function(){t.customizedElements.map(function(e){return e.elem.css(e.rule,"")})},t._removeBuiltInStyles=function(){t.builtInElements.map(function(e){return e.elem.css(e.rule,"")})},t._removeCustomStylesByRule=function(e){$(e.selector()).css(e.rule(),"")},t.onRuleToggle=function(e){e.enabled(!e.enabled())},t.ruleIsDeleteable=function(e){return!e.deletable||"function"!=typeof e.deletable||e.deletable()},t.onCustomRuleDelete=function(e){t.ruleIsDeleteable(e)&&(t.customRules.remove(e),t._updateCustomRules())},t.onIconDelete=function(e){t.restoreTabs(),t.tabIcons.tabs.remove(e),t.setupIcons()},t._subscribeToDictValues=function(e,n,o){var s=o?o.bind(this,e):t.onCustomRuleChange.bind(this,e);Object.keys(e).map(function(o){t.configSubscriptions[n].push(e[o].subscribe(function(e){return s(e,o)}))})},t.onSettingsShown=function(){var e=this;Object.keys(t.ownSettings).map(function(n,o){if("customRules"==n)t.configSubscriptions[n]=[],t.customRules().map(function(e,o){t._subscribeToDictValues(e,n)});else if("color"==n){t.configSubscriptions[n]=[];var s=t.onColorChange;t.ownSettings.color().map(function(e,o){t._subscribeToDictValues(e,n,s)})}else if("tabs"==n){var l=t.configSubscriptions[n]=[],i=t.tabIcons,u=i.enabled,a=i.tabs;l.push(u.subscribe(t.onIconsEnableChange)),a().map(function(e,o){t._subscribeToDictValues(e,n,t.onIconChange)})}else{var c=t.configOnChangeMap[n]?t.configOnChangeMap[n]:t.onChange.bind(e,n);t.configSubscriptions[n]=t.ownSettings[n].subscribe(c)}})},t.onSettingsHidden=function(){Object.keys(t.configSubscriptions).map(function(e,n){Array.isArray(t.configSubscriptions[e])?t.configSubscriptions[e].forEach(function(e){e.dispose()}):t.configSubscriptions[e].dispose()})},t.enableBeforeLoaded(),t.configOnChangeMap={enabled:t.onEnabledChange,theme:t.onThemeChange,enableCustomization:t.onEnableCustomizationChange}}OCTOPRINT_VIEWMODELS.push([e,["settingsViewModel"],["#settings_plugin_themeify"]])})},function(e,t){}]);
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin themeify:", (error.stack || error));
    }
})();

// JS assets for plugin touchui
(function () {
    try {
        // source: plugin/touchui/js/touchui.libraries.js
        /*! jQuery UI Virtual Keyboard v1.25.29 */
        !function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof module&&"object"==typeof module.exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){"use strict";var b=a.keyboard=function(c,d){var e,f=this;f.version="1.25.29",f.$el=a(c),f.el=c,f.$el.data("keyboard",f),f.init=function(){var c,g,h,i=b.css,j=b.events;f.settings=d||{},d&&d.position&&(g=a.extend({},d.position),d.position=null),f.options=e=a.extend(!0,{},b.defaultOptions,d),g&&(e.position=g,d.position=g),f.el.active=!0,f.namespace=".keyboard"+Math.random().toString(16).slice(2),f.extensionNamespace=[],f.shiftActive=f.altActive=f.metaActive=f.sets=f.capsLock=!1,f.rows=["","-shift","-alt","-alt-shift"],f.inPlaceholder=f.$el.attr("placeholder")||"",f.watermark=b.watermark&&""!==f.inPlaceholder,f.repeatTime=1e3/(e.repeatRate||20),e.preventDoubleEventTime=e.preventDoubleEventTime||100,f.isOpen=!1,f.wheel=a.isFunction(a.fn.mousewheel),f.escapeRegex=/[-\/\\^$*+?.()|[\]{}]/g,c=b.keyCodes,f.alwaysAllowed=[c.capsLock,c.pageUp,c.pageDown,c.end,c.home,c.left,c.up,c.right,c.down,c.insert,c["delete"]],f.$keyboard=[],f.enabled=!0,a.isEmptyObject(e.position)||(e.position.orig_at=e.position.at),f.checkCaret=e.lockInput||b.checkCaretSupport(),f.last={start:0,end:0,key:"",val:"",preVal:"",layout:"",virtual:!0,keyset:[!1,!1,!1],wheel_$Keys:null,wheelIndex:0,wheelLayers:[]},f.temp=["",0,0],a.each([j.kbInit,j.kbBeforeVisible,j.kbVisible,j.kbHidden,j.inputCanceled,j.inputAccepted,j.kbBeforeClose],function(b,c){a.isFunction(e[c])&&f.$el.bind(c+f.namespace+"callbacks",e[c])}),e.alwaysOpen&&(e.stayOpen=!0),h=a(document),f.el.ownerDocument!==document&&(h=h.add(f.el.ownerDocument)),h.bind("mousedown keyup touchstart checkkeyboard ".split(" ").join(f.namespace+" "),f.checkClose),f.$el.addClass(i.input+" "+e.css.input).attr({"aria-haspopup":"true",role:"textbox"}),(e.lockInput||f.el.readOnly)&&(e.lockInput=!0,f.$el.addClass(i.locked).attr({readonly:"readonly"})),(f.$el.is(":disabled")||f.$el.attr("readonly")&&!f.$el.hasClass(i.locked))&&f.$el.addClass(i.noKeyboard),e.openOn&&f.bindFocus(),f.watermark||""!==f.$el.val()||""===f.inPlaceholder||""===f.$el.attr("placeholder")||f.$el.addClass(i.placeholder).val(f.inPlaceholder),f.$el.trigger(j.kbInit,[f,f.el]),e.alwaysOpen&&f.reveal()},f.toggle=function(){var a=f.$keyboard.find("."+b.css.keyToggle),c=!f.enabled;f.$preview.prop("readonly",c||f.options.lockInput),f.$keyboard.toggleClass(b.css.keyDisabled,c).find("."+b.css.keyButton).not(a).prop("disabled",c).attr("aria-disabled",c),a.toggleClass(b.css.keyDisabled,c),c&&f.typing_options&&(f.typing_options.text="")},f.setCurrent=function(){var c=b.css,d=a("."+c.isCurrent),e=d.data("keyboard");a.isEmptyObject(e)||e.el===f.el||e.close(e.options.autoAccept?"true":!1),d.removeClass(c.isCurrent),a("."+c.hasFocus).removeClass(c.hasFocus),f.$el.addClass(c.isCurrent),f.$keyboard.addClass(c.hasFocus),f.isCurrent(!0),f.isOpen=!0},f.isCurrent=function(a){var c=b.currentKeyboard||!1;return a?c=b.currentKeyboard=f.el:a===!1&&c===f.el&&(c=b.currentKeyboard=""),c===f.el},f.isVisible=function(){return f.$keyboard&&f.$keyboard.length?f.$keyboard.is(":visible"):!1},f.focusOn=function(){!f&&f.el.active||f.isVisible()||(clearTimeout(f.timer),f.reveal())},f.redraw=function(){f.$keyboard.length&&(f.last.preVal=""+f.last.val,f.last.val=f.$preview&&f.$preview.val()||f.$el.val(),f.$el.val(f.last.val),f.removeKeyboard(),f.shiftActive=f.altActive=f.metaActive=!1),f.isOpen=e.alwaysOpen,f.reveal(!0)},f.reveal=function(c){var d=f.isOpen,g=b.css;return f.opening=!d,a("."+g.keyboard).not("."+g.alwaysOpen).each(function(){var b=a(this).data("keyboard");a.isEmptyObject(b)||b.close(b.options.autoAccept&&b.options.autoAcceptOnEsc?"true":!1)}),f.$el.is(":disabled")||f.$el.attr("readonly")&&!f.$el.hasClass(g.locked)?void f.$el.addClass(g.noKeyboard):(f.$el.removeClass(g.noKeyboard),e.openOn&&f.$el.unbind(a.trim((e.openOn+" ").split(/\s+/).join(f.namespace+" "))),f.$keyboard&&(!f.$keyboard||f.$keyboard.length&&!a.contains(document.body,f.$keyboard[0]))||f.startup(),f.watermark||f.el.value!==f.inPlaceholder||f.$el.removeClass(g.placeholder).val(""),f.originalContent=f.$el.val(),f.$preview.val(f.originalContent),e.acceptValid&&f.checkValid(),e.resetDefault&&(f.shiftActive=f.altActive=f.metaActive=!1),f.showSet(),f.isVisible()||f.$el.trigger(b.events.kbBeforeVisible,[f,f.el]),f.setCurrent(),f.toggle(),f.$keyboard.show(),e.usePreview&&b.msie&&("undefined"==typeof f.width&&(f.$preview.hide(),f.width=Math.ceil(f.$keyboard.width()),f.$preview.show()),f.$preview.width(f.width)),f.position=a.isEmptyObject(e.position)?!1:e.position,a.ui&&a.ui.position&&f.position&&(f.position.of=f.position.of||f.$el.data("keyboardPosition")||f.$el,f.position.collision=f.position.collision||"flipfit flipfit",e.position.at=e.usePreview?e.position.orig_at:e.position.at2,f.$keyboard.position(f.position)),f.checkDecimal(),f.lineHeight=parseInt(f.$preview.css("lineHeight"),10)||parseInt(f.$preview.css("font-size"),10)+4,e.caretToEnd&&f.saveCaret(f.originalContent.length,f.originalContent.length),b.allie&&(0===f.last.end&&f.last.start>0&&(f.last.end=f.last.start),f.last.start<0&&(f.last.start=f.last.end=f.originalContent.length)),d||c?(b.caret(f.$preview,f.last),f):(f.timer2=setTimeout(function(){var a;f.opening=!1,/(number|email)/i.test(f.el.type)||e.caretToEnd||f.saveCaret(a,a,f.$el),e.initialFocus&&b.caret(f.$preview,f.last),f.last.eventTime=(new Date).getTime(),f.$el.trigger(b.events.kbVisible,[f,f.el]),f.timer=setTimeout(function(){f&&f.saveCaret()},200)},10),f))},f.updateLanguage=function(){var c=b.layouts,d=e.language||c[e.layout]&&c[e.layout].lang&&c[e.layout].lang||[e.language||"en"],g=b.language;d=(a.isArray(d)?d[0]:d).split("-")[0],e.display=a.extend(!0,{},g.en.display,g[d]&&g[d].display||{},f.settings.display),e.combos=a.extend(!0,{},g.en.combos,g[d]&&g[d].combos||{},f.settings.combos),e.wheelMessage=g[d]&&g[d].wheelMessage||g.en.wheelMessage,e.rtl=c[e.layout]&&c[e.layout].rtl||g[d]&&g[d].rtl||!1,f.regex=g[d]&&g[d].comboRegex||b.comboRegex,f.decimal=/^\./.test(e.display.dec),f.$el.toggleClass("rtl",e.rtl).css("direction",e.rtl?"rtl":"")},f.startup=function(){var c=b.css;(e.alwaysOpen||e.userClosed)&&f.$preview||f.makePreview(),f.$keyboard&&f.$keyboard.length||("custom"===e.layout&&(e.layoutHash="custom"+f.customHash()),f.layout="custom"===e.layout?e.layoutHash:e.layout,f.last.layout=f.layout,f.updateLanguage(),"undefined"==typeof b.builtLayouts[f.layout]&&(a.isFunction(e.create)?f.$keyboard=e.create(f):f.$keyboard.length||f.buildKeyboard(f.layout,!0)),f.$keyboard=b.builtLayouts[f.layout].$keyboard.clone(),f.$keyboard.data("keyboard",f),""!==(f.el.id||"")&&f.$keyboard.attr("id",f.el.id+b.css.idSuffix),f.makePreview(),e.usePreview?a.isEmptyObject(e.position)||(e.position.at=e.position.orig_at):a.isEmptyObject(e.position)||(e.position.at=e.position.at2)),f.$decBtn=f.$keyboard.find("."+c.keyPrefix+"dec"),(e.enterNavigation||"TEXTAREA"===f.el.nodeName)&&f.alwaysAllowed.push(13),f.bindKeyboard(),f.$keyboard.appendTo(e.appendLocally?f.$el.parent():e.appendTo||"body"),f.bindKeys(),e.reposition&&a.ui&&a.ui.position&&"body"==e.appendTo&&a(window).bind("resize"+f.namespace,function(){f.position&&f.isVisible()&&f.$keyboard.position(f.position)})},f.makePreview=function(){if(e.usePreview){var c,d,g,h,i=b.css;for(f.$preview=f.$el.clone(!1).data("keyboard",f).removeClass(i.placeholder+" "+i.input).addClass(i.preview+" "+e.css.input).attr("tabindex","-1").show(),f.preview=f.$preview[0],"number"===f.preview.type&&(f.preview.type="text"),h=/^(data-|id|aria-haspopup)/i,d=f.$preview.get(0).attributes,c=d.length-1;c>=0;c--)g=d[c]&&d[c].name,h.test(g)&&f.preview.removeAttribute(g);a("<div />").addClass(i.wrapper).append(f.$preview).prependTo(f.$keyboard)}else f.$preview=f.$el,f.preview=f.el},f.saveCaret=function(a,c,d){var e=b.caret(d||f.$preview,a,c);f.last.start="undefined"==typeof a?e.start:a,f.last.end="undefined"==typeof c?e.end:c},f.setScroll=function(){if(f.last.virtual){var a,c,d,g,h="TEXTAREA"===f.preview.nodeName,i=f.last.val.substring(0,Math.max(f.last.start,f.last.end));f.$previewCopy||(f.$previewCopy=f.$preview.clone().removeAttr("id").css({position:"absolute",left:0,zIndex:-10,visibility:"hidden"}).addClass(b.css.inputClone),h||f.$previewCopy.css({"white-space":"pre",width:0}),e.usePreview?f.$preview.after(f.$previewCopy):f.$keyboard.prepend(f.$previewCopy)),h?(f.$previewCopy.height(f.lineHeight).val(i),f.preview.scrollTop=f.lineHeight*(Math.floor(f.$previewCopy[0].scrollHeight/f.lineHeight)-1)):(f.$previewCopy.val(i.replace(/\s/g," ")),d=/c/i.test(e.scrollAdjustment)?f.preview.clientWidth/2:e.scrollAdjustment,a=f.$previewCopy[0].scrollWidth-1,"undefined"==typeof f.last.scrollWidth&&(f.last.scrollWidth=a,f.last.direction=!0),g=f.last.scrollWidth===a?f.last.direction:f.last.scrollWidth<a,c=f.preview.clientWidth-d,g?c>a?f.preview.scrollLeft=0:f.preview.scrollLeft=a-c:a>=f.preview.scrollWidth-c?f.preview.scrollLeft=f.preview.scrollWidth-d:a-d>0?f.preview.scrollLeft=a-d:f.preview.scrollLeft=0,f.last.scrollWidth=a,f.last.direction=g)}},f.bindFocus=function(){e.openOn&&f&&f.el.active&&(f.$el.bind(e.openOn+f.namespace,function(){f.focusOn()}),a(":focus")[0]===f.el&&f.$el.blur())},f.bindKeyboard=function(){var c,d=b.keyCodes,g=b.builtLayouts[f.layout];f.$preview.unbind(f.namespace).bind("click"+f.namespace+" touchstart"+f.namespace,function(){e.alwaysOpen&&!f.isCurrent()&&f.reveal(),f.timer2=setTimeout(function(){f&&f.saveCaret()},150)}).bind("keypress"+f.namespace,function(h){if(e.lockInput||!f.isCurrent())return!1;var i=h.charCode||h.which,j=i>=d.A&&i<=d.Z,k=i>=d.a&&i<=d.z,l=f.last.key=String.fromCharCode(i);if(f.last.virtual=!1,f.last.event=h,f.last.$key=[],f.checkCaret&&f.saveCaret(),i!==d.capsLock&&(j||k)&&(f.capsLock=j&&!h.shiftKey||k&&h.shiftKey,f.capsLock&&!f.shiftActive&&(f.shiftActive=!0,f.showSet())),e.restrictInput){if((h.which===d.backSpace||0===h.which)&&a.inArray(h.keyCode,f.alwaysAllowed))return;-1===a.inArray(l,g.acceptedKeys)&&(h.preventDefault(),c=a.extend({},h),c.type=b.events.inputRestricted,f.$el.trigger(c,[f,f.el]),a.isFunction(e.restricted)&&e.restricted(c,f,f.el))}else if((h.ctrlKey||h.metaKey)&&(h.which===d.A||h.which===d.C||h.which===d.V||h.which>=d.X&&h.which<=d.Z))return;g.hasMappedKeys&&g.mappedKeys.hasOwnProperty(l)&&(f.last.key=g.mappedKeys[l],f.insertText(f.last.key),h.preventDefault()),f.checkMaxLength()}).bind("keyup"+f.namespace,function(c){if(f.isCurrent()){switch(f.last.virtual=!1,c.which){case d.tab:if(f.tab&&e.tabNavigation&&!e.lockInput){f.shiftActive=c.shiftKey;var g=b.keyaction.tab(f);if(f.tab=!1,!g)return!1}else c.preventDefault();break;case d.escape:return e.ignoreEsc||f.close(e.autoAccept&&e.autoAcceptOnEsc?"true":!1),!1}return clearTimeout(f.throttled),f.throttled=setTimeout(function(){f&&f.isVisible()&&f.checkCombos()},100),f.checkMaxLength(),f.last.preVal=""+f.last.val,f.last.val=f.$preview.val(),c.type=b.events.kbChange,c.action=f.last.key,f.$el.trigger(c,[f,f.el]),a.isFunction(e.change)?(c.type=b.events.inputChange,e.change(c,f,f.el),!1):void(e.acceptValid&&e.autoAcceptOnValid&&a.isFunction(e.validate)&&e.validate(f,f.$preview.val())&&(f.$preview.blur(),f.accept()))}}).bind("keydown"+f.namespace,function(a){if(e.alwaysOpen&&!f.isCurrent()&&f.reveal(),a.which===d.tab)return f.tab=!0,!1;if(e.lockInput)return!1;switch(f.last.virtual=!1,a.which){case d.backSpace:b.keyaction.bksp(f,null,a),a.preventDefault();break;case d.enter:b.keyaction.enter(f,null,a);break;case d.capsLock:f.shiftActive=f.capsLock=!f.capsLock,f.showSet();break;case d.V:if(a.ctrlKey||a.metaKey){if(e.preventPaste)return void a.preventDefault();f.checkCombos()}}}).bind("mouseup touchend ".split(" ").join(f.namespace+" "),function(){f.last.virtual=!0,f.saveCaret()}),f.$keyboard.bind("mousedown click touchstart ".split(" ").join(f.namespace+" "),function(b){b.stopPropagation(),f.isCurrent()||(f.reveal(),a(document).trigger("checkkeyboard"+f.namespace)),e.noFocus||f.$preview.focus()}),e.preventPaste&&(f.$preview.bind("contextmenu"+f.namespace,function(a){a.preventDefault()}),f.$el.bind("contextmenu"+f.namespace,function(a){a.preventDefault()}))},f.bindKeys=function(){var c=b.css;f.$allKeys=f.$keyboard.find("button."+c.keyButton).unbind(f.namespace+" "+f.namespace+"kb").bind("mouseenter mouseleave touchstart ".split(" ").join(f.namespace+" "),function(c){if(!e.alwaysOpen&&!e.userClosed||"mouseleave"===c.type||f.isCurrent()||(f.reveal(),f.$preview.focus(),b.caret(f.$preview,f.last)),f.isCurrent()){var d,g,h=f.last,i=a(this),j=c.type;e.useWheel&&f.wheel&&(d=f.getLayers(i),g=(d.length?d.map(function(){return a(this).attr("data-value")||""}).get():"")||[i.text()],h.wheel_$Keys=d,h.wheelLayers=g,h.wheelIndex=a.inArray(i.attr("data-value"),g)),"mouseenter"!==j&&"touchstart"!==j||"password"===f.el.type||i.hasClass(e.css.buttonDisabled)||(i.addClass(e.css.buttonHover),e.useWheel&&f.wheel&&i.attr("title",function(a,b){return f.wheel&&""===b&&f.sets&&g.length>1&&"touchstart"!==j?e.wheelMessage:b})),"mouseleave"===j&&(i.removeClass("password"===f.el.type?"":e.css.buttonHover),e.useWheel&&f.wheel&&(h.wheelIndex=0,h.wheelLayers=[],h.wheel_$Keys=null,i.attr("title",function(a,b){return b===e.wheelMessage?"":b}).html(i.attr("data-html"))))}}).bind(e.keyBinding.split(" ").join(f.namespace+" ")+f.namespace+" "+b.events.kbRepeater,function(d){if(d.preventDefault(),!f.$keyboard.is(":visible"))return!1;var g,h,i=f.last,j=this,k=a(j),l=(new Date).getTime();if(e.useWheel&&f.wheel&&(h=i.wheel_$Keys,k=h&&i.wheelIndex>-1?h.eq(i.wheelIndex):k),g=k.attr("data-action"),!(l-(i.eventTime||0)<e.preventDoubleEventTime)){if(i.eventTime=l,i.event=d,i.virtual=!0,e.noFocus||f.$preview.focus(),i.$key=k,i.key=k.attr("data-value"),f.checkCaret&&b.caret(f.$preview,i),g.match("meta")&&(g="meta"),g===i.key&&"string"==typeof b.keyaction[g])i.key=g=b.keyaction[g];else if(g in b.keyaction&&a.isFunction(b.keyaction[g])){if(b.keyaction[g](f,this,d)===!1)return!1;g=null}return"undefined"!=typeof g&&null!==g&&(i.key=a(this).hasClass(c.keyAction)?g:i.key,f.insertText(i.key),f.capsLock||e.stickyShift||d.shiftKey||(f.shiftActive=!1,f.showSet(k.attr("data-name")))),b.caret(f.$preview,i),f.checkCombos(),d.type=b.events.kbChange,d.action=i.key,f.$el.trigger(d,[f,f.el]),i.preVal=""+i.val,i.val=f.$preview.val(),a.isFunction(e.change)?(d.type=b.events.inputChange,e.change(d,f,f.el),!1):void 0}}).bind("mouseup"+f.namespace+" "+"mouseleave touchend touchmove touchcancel ".split(" ").join(f.namespace+"kb "),function(c){f.last.virtual=!0;var d,g=a(this);if("touchmove"===c.type){if(d=g.offset(),d.right=d.left+g.outerWidth(),d.bottom=d.top+g.outerHeight(),c.originalEvent.touches[0].pageX>=d.left&&c.originalEvent.touches[0].pageX<d.right&&c.originalEvent.touches[0].pageY>=d.top&&c.originalEvent.touches[0].pageY<d.bottom)return!0}else/(mouseleave|touchend|touchcancel)/i.test(c.type)?g.removeClass(e.css.buttonHover):(!e.noFocus&&f.isCurrent()&&f.isVisible()&&f.$preview.focus(),f.checkCaret&&b.caret(f.$preview,f.last));return f.mouseRepeat=[!1,""],clearTimeout(f.repeater),!1}).bind("click"+f.namespace,function(){return!1}).not("."+c.keyAction).bind("mousewheel"+f.namespace,function(b,c){if(e.useWheel&&f.wheel){c=c||b.deltaY;var d,g=f.last.wheelLayers||[];return g.length>1?(d=f.last.wheelIndex+(c>0?-1:1),d>g.length-1&&(d=0),0>d&&(d=g.length-1)):d=0,f.last.wheelIndex=d,a(this).html(g[d]),!1}}).add("."+c.keyPrefix+"tab bksp space enter".split(" ").join(",."+c.keyPrefix),f.$keyboard).bind("mousedown touchstart ".split(" ").join(f.namespace+"kb "),function(){if(0!==e.repeatRate){var b=a(this);f.mouseRepeat=[!0,b],setTimeout(function(){f&&f.mouseRepeat[0]&&f.mouseRepeat[1]===b&&!b[0].disabled&&f.repeatKey(b)},e.repeatDelay)}return!1})},f.insertText=function(a){if("undefined"!=typeof a){var c,d,e="\b"===a,g=f.$preview.val(),h=b.caret(f.$preview),i=g.length;h.end<h.start&&(h.end=h.start),h.start>i&&(h.end=h.start=i),"TEXTAREA"===f.preview.nodeName&&b.msie&&"\n"===g.substr(h.start,1)&&(h.start+=1,h.end+=1),"{d}"===a&&(a="",d=h.start,h.end+=1),c=e&&h.start===h.end,a=e?"":a,g=g.substr(0,h.start-(c?1:0))+a+g.substr(h.end),d=h.start+(c?-1:a.length),f.$preview.val(g),f.saveCaret(d,d),f.setScroll()}},f.checkMaxLength=function(){if(f.isCurrent()){var a,c,d=f.$preview.val();e.maxLength!==!1&&d.length>e.maxLength&&(a=b.caret(f.$preview).start,c=Math.min(a,e.maxLength),e.maxInsert||(d=f.last.val,c=a-1),f.$preview.val(d.substring(0,e.maxLength)),f.saveCaret(c,c)),f.$decBtn.length&&f.checkDecimal()}},f.repeatKey=function(a){a.trigger(b.events.kbRepeater),f.mouseRepeat[0]&&(f.repeater=setTimeout(function(){f&&f.repeatKey(a)},f.repeatTime))},f.showKeySet=function(a){"string"==typeof a?(f.last.keyset=[f.shiftActive,f.altActive,f.metaActive],f.shiftActive=/shift/i.test(a),f.altActive=/alt/i.test(a),/meta/.test(a)?(f.metaActive=!0,f.showSet(a.match(/meta\d+/i)[0])):(f.metaActive=!1,f.showSet())):f.showSet(a)},f.showSet=function(a){e=f.options;var c=b.css,d="."+c.keyPrefix,g=e.css.buttonActive,h="",i=(f.shiftActive?1:0)+(f.altActive?2:0);return f.shiftActive||(f.capsLock=!1),f.metaActive?(h=/meta/i.test(a)?a:"",""===h?h=f.metaActive===!0?"":f.metaActive:f.metaActive=h,(!e.stickyShift&&f.last.keyset[2]!==f.metaActive||(f.shiftActive||f.altActive)&&!f.$keyboard.find("."+c.keySet+"-"+h+f.rows[i]).length)&&(f.shiftActive=f.altActive=!1)):!e.stickyShift&&f.last.keyset[2]!==f.metaActive&&f.shiftActive&&(f.shiftActive=f.altActive=!1),i=(f.shiftActive?1:0)+(f.altActive?2:0),h=0!==i||f.metaActive?""===h?"":"-"+h:"-normal",f.$keyboard.find("."+c.keySet+h+f.rows[i]).length?(f.$keyboard.find(d+"alt,"+d+"shift,."+c.keyAction+"[class*=meta]").removeClass(g).end().find(d+"alt").toggleClass(g,f.altActive).end().find(d+"shift").toggleClass(g,f.shiftActive).end().find(d+"lock").toggleClass(g,f.capsLock).end().find("."+c.keySet).hide().end().find("."+c.keyAction+d+h).addClass(g),f.$keyboard.find("."+c.keySet+h+f.rows[i])[0].style.display="inline-block",f.metaActive&&f.$keyboard.find(d+f.metaActive).toggleClass(g,f.metaActive!==!1),f.last.keyset=[f.shiftActive,f.altActive,f.metaActive],void f.$el.trigger(b.events.kbKeysetChange,[f,f.el])):(f.shiftActive=f.last.keyset[0],f.altActive=f.last.keyset[1],void(f.metaActive=f.last.keyset[2]))},f.checkCombos=function(){if(!f.isVisible()&&!f.$keyboard.hasClass(b.css.hasFocus))return f.$preview.val();var c,d,g,h=f.$preview.val(),i=b.caret(f.$preview),j=b.builtLayouts[f.layout],k=h.length;return""===h?(e.acceptValid&&f.checkValid(),h):(i.end<i.start&&(i.end=i.start),i.start>k&&(i.end=i.start=k),b.msie&&"\n"===h.substr(i.start,1)&&(i.start+=1,i.end+=1),e.useCombos&&(b.msie?h=h.replace(f.regex,function(a,b,c){return e.combos.hasOwnProperty(b)?e.combos[b][c]||a:a}):f.$preview.length&&(d=i.start-(i.start-2>=0?2:0),b.caret(f.$preview,d,i.end),g=(b.caret(f.$preview).text||"").replace(f.regex,function(a,b,c){return e.combos.hasOwnProperty(b)?e.combos[b][c]||a:a}),f.$preview.val(b.caret(f.$preview).replaceStr(g)),h=f.$preview.val())),e.restrictInput&&""!==h&&(d=j.acceptedKeys.length,c=j.acceptedKeysRegex,c||(g=a.map(j.acceptedKeys,function(a){return a.replace(f.escapeRegex,"\\$&")}),c=j.acceptedKeysRegex=new RegExp("("+g.join("|")+")","g")),g=h.match(c),g?h=g.join(""):(h="",k=0)),i.start+=h.length-k,i.end+=h.length-k,f.$preview.val(h),f.saveCaret(i.start,i.end),f.setScroll(),f.checkMaxLength(),e.acceptValid&&f.checkValid(),h)},f.checkValid=function(){var c=b.css,d=f.$keyboard.find("."+c.keyPrefix+"accept"),g=!0;a.isFunction(e.validate)&&(g=e.validate(f,f.$preview.val(),!1)),d.toggleClass(c.inputInvalid,!g).toggleClass(c.inputValid,g).attr("title",d.attr("data-title")+" ("+e.display[g?"valid":"invalid"]+")")},f.checkDecimal=function(){f.decimal&&/\./g.test(f.preview.value)||!f.decimal&&/\,/g.test(f.preview.value)?f.$decBtn.attr({disabled:"disabled","aria-disabled":"true"}).removeClass(e.css.buttonHover).addClass(e.css.buttonDisabled):f.$decBtn.removeAttr("disabled").attr({"aria-disabled":"false"}).addClass(e.css.buttonDefault).removeClass(e.css.buttonDisabled)},f.getLayers=function(c){var d=b.css,e=c.attr("data-pos"),f=c.closest("."+d.keyboard).find('button[data-pos="'+e+'"]');return f.filter(function(){return""!==a(this).find("."+d.keyText).text()}).add(c)},f.switchInput=function(b,c){if(a.isFunction(e.switchInput))e.switchInput(f,b,c);else{f.$keyboard.length&&f.$keyboard.hide();var d,g=!1,h=a("button, input, textarea, a").filter(":visible").not(":disabled"),i=h.index(f.$el)+(b?1:-1);if(f.$keyboard.length&&f.$keyboard.show(),i>h.length-1&&(g=e.stopAtEnd,i=0),0>i&&(g=e.stopAtEnd,i=h.length-1),!g){if(c=f.close(c),!c)return;d=h.eq(i).data("keyboard"),d&&d.options.openOn.length?d.focusOn():h.eq(i).focus()}}return!1},f.close=function(c){if(f.isOpen&&f.$keyboard.length){clearTimeout(f.throttled);var d=b.css,g=b.events,h=c?f.checkCombos():f.originalContent;if(c&&a.isFunction(e.validate)&&!e.validate(f,h,!0)&&(h=f.originalContent,c=!1,e.cancelClose))return;f.isCurrent(!1),f.isOpen=e.alwaysOpen||e.userClosed,f.$preview.val(h),f.$el.removeClass(d.isCurrent+" "+d.inputAutoAccepted).addClass(c?c===!0?"":d.inputAutoAccepted:"").val(h).trigger(g.inputChange),e.alwaysOpen||f.$el.trigger(g.kbBeforeClose,[f,f.el,c||!1]),f.$el.trigger(c?g.inputAccepted:g.inputCanceled,[f,f.el]).trigger(e.alwaysOpen?g.kbInactive:g.kbHidden,[f,f.el]).blur(),b.caret(f.$preview,f.last),f&&(f.last.eventTime=(new Date).getTime(),e.alwaysOpen||e.userClosed&&"true"===c||!f.$keyboard.length||(f.removeKeyboard(),f.timer=setTimeout(function(){f&&f.bindFocus()},500)),f.watermark||""!==f.el.value||""===f.inPlaceholder||f.$el.addClass(d.placeholder).val(f.inPlaceholder))}return!!c},f.accept=function(){return f.close(!0)},f.checkClose=function(b){if(!f.opening){f.escClose(b);var c=a.keyboard.css,d=a(b.target);if(d.hasClass(c.input)){var e=d.data("keyboard");e!==f||e.$el.hasClass(c.isCurrent)||b.type!==e.options.openOn||e.focusOn()}}},f.escClose=function(c){if(c&&"keyup"===c.type)return c.which!==b.keyCodes.escape||e.ignoreEsc?"":f.close(e.autoAccept&&e.autoAcceptOnEsc?"true":!1);if(f.isOpen&&(!f.isCurrent()&&f.isOpen||f.isOpen&&c.target!==f.el)){if((e.stayOpen||e.userClosed)&&!a(c.target).hasClass(b.css.input))return;b.allie&&c.preventDefault(),f.close(e.autoAccept?"true":!1)}},f.keyBtn=a("<button />").attr({role:"button",type:"button","aria-disabled":"false",tabindex:"-1"}).addClass(b.css.keyButton),f.processName=function(a){var b,c,d=(a||"").replace(/[^a-z0-9-_]/gi,""),e=d.length,f=[];if(e>1&&a===d)return a;if(e=a.length){for(b=0;e>b;b++)c=a[b],f.push(/[a-z0-9-_]/i.test(c)?/[-_]/.test(c)&&0!==b?"":c:(0===b?"":"-")+c.charCodeAt(0));return f.join("")}return a},f.processKeys=function(b){var c,d=b.split(":"),e={name:null,map:"",title:""};return/\(.+\)/.test(d[0])||/^:\(.+\)/.test(b)||/\([(:)]\)/.test(b)?/\([(:)]\)/.test(b)?(c=d[0].match(/([^(]+)\((.+)\)/),c&&c.length?(e.name=c[1],e.map=c[2],e.title=d.length>1?d.slice(1).join(":"):""):(e.name=b.match(/([^(]+)/)[0],":"===e.name&&(d=d.slice(1)),null===c&&(e.map=":",d=d.slice(2)),e.title=d.length?d.join(":"):"")):(e.map=b.match(/\(([^()]+?)\)/)[1],b=b.replace(/\(([^()]+)\)/,""),c=b.split(":"),""===c[0]?(e.name=":",d=d.slice(1)):e.name=c[0],e.title=d.length>1?d.slice(1).join(":"):""):(""===d[0]?(e.name=":",d=d.slice(1)):e.name=d[0],e.title=d.length>1?d.slice(1).join(":"):""),e.title=a.trim(e.title).replace(/_/g," "),e},f.addKey=function(a,c,d){var g,h,i,j={},k=f.processKeys(d?a:c),l=b.css;return!d&&e.display[k.name]?(i=f.processKeys(e.display[k.name]),i.action=f.processKeys(a).name):(i=k,i.action=k.name),j.name=f.processName(k.name),""!==i.map?(b.builtLayouts[f.layout].mappedKeys[i.map]=i.name,b.builtLayouts[f.layout].acceptedKeys.push(i.name)):d&&b.builtLayouts[f.layout].acceptedKeys.push(i.name),g=d?""===j.name?"":l.keyPrefix+j.name:l.keyAction+" "+l.keyPrefix+i.action,g+=(i.name.length>2?" "+l.keyWide:"")+" "+e.css.buttonDefault,j.html='<span class="'+l.keyText+'">'+i.name.replace(/[\u00A0-\u9999]/gim,function(a){return"&#"+a.charCodeAt(0)+";"})+"</span>",j.$key=f.keyBtn.clone().attr({"data-value":d?i.name:i.action,"data-name":i.action,"data-pos":f.temp[1]+","+f.temp[2],"data-action":i.action,"data-html":j.html}).addClass(g).html(j.html).appendTo(f.temp[0]),i.map&&j.$key.attr("data-mapped",i.map),(i.title||k.title)&&j.$key.attr({"data-title":k.title||i.title,title:k.title||i.title}),"function"==typeof e.buildKey&&(j=e.buildKey(f,j),h=j.$key.html(),j.$key.attr("data-html",h)),j.$key},f.customHash=function(a){var b,c,d,f,g,h=[],i=[];a="undefined"==typeof a?e.customLayout:a;for(c in a)a.hasOwnProperty(c)&&h.push(a[c]);if(i=i.concat.apply(i,h).join(" "),d=0,g=i.length,0===g)return d;for(b=0;g>b;b++)f=i.charCodeAt(b),d=(d<<5)-d+f,d&=d;return d},f.buildKeyboard=function(c,d){a.isEmptyObject(e.display)&&f.updateLanguage();var g,h,i,j=b.css,k=0,l=b.builtLayouts[c||f.layout||e.layout]={mappedKeys:{},acceptedKeys:[]},m=l.acceptedKeys=e.restrictInclude?(""+e.restrictInclude).split(/\s+/)||[]:[],n=j.keyboard+" "+e.css.popup+" "+e.css.container+(e.alwaysOpen||e.userClosed?" "+j.alwaysOpen:""),o=a("<div />").addClass(n).attr({role:"textbox"}).hide();return d&&"custom"===e.layout||!b.layouts.hasOwnProperty(e.layout)?(e.layout="custom",n=b.layouts.custom=e.customLayout||{normal:["{cancel}"]}):n=b.layouts[d?e.layout:c||f.layout||e.layout],a.each(n,function(b,c){if(""!==b&&!/^(name|lang|rtl)$/i.test(b))for("default"===b&&(b="normal"),k++,h=a("<div />").attr("name",b).addClass(j.keySet+" "+j.keySet+"-"+b).appendTo(o).toggle("normal"===b),g=0;g<c.length;g++)i=a.trim(c[g]).replace(/\{(\.?)[\s+]?:[\s+]?(\.?)\}/g,"{$1:$2}"),f.buildRow(h,g,i.split(/\s+/),m),h.find("."+j.keyButton+",."+j.keySpacer).filter(":last").after('<br class="'+j.endRow+'"/>')}),k>1&&(f.sets=!0),l.hasMappedKeys=!a.isEmptyObject(l.mappedKeys),l.$keyboard=o,o},f.buildRow=function(c,d,g,h){var i,j,k,l,m,n,o=b.css;for(k=0;k<g.length;k++)if(f.temp=[c,d,k],l=!1,0!==g[k].length)if(/^\{\S+\}$/.test(g[k])){if(m=g[k].match(/^\{(\S+)\}$/)[1],/\!\!/.test(m)&&(m=m.replace("!!",""),l=!0),/^sp:((\d+)?([\.|,]\d+)?)(em|px)?$/i.test(m)&&(n=parseFloat(m.replace(/,/,".").match(/^sp:((\d+)?([\.|,]\d+)?)(em|px)?$/i)[1]||0),a('<span class="'+o.keyText+'"></span>').width(m.match(/px/i)?n+"px":2*n+"em").addClass(o.keySpacer).appendTo(c)),/^empty(:((\d+)?([\.|,]\d+)?)(em|px)?)?$/i.test(m)&&(n=/:/.test(m)?parseFloat(m.replace(/,/,".").match(/^empty:((\d+)?([\.|,]\d+)?)(em|px)?$/i)[1]||0):"",f.addKey(""," ").addClass(e.css.buttonDisabled+" "+e.css.buttonEmpty).attr("aria-disabled",!0).width(n?m.match("px")?n+"px":2*n+"em":"")),/^meta\d+\:?(\w+)?/i.test(m)){f.addKey(m.split(":")[0],m).addClass(o.keyHasActive);continue}switch(j=m.split(":"),j[0].toLowerCase()){case"a":case"accept":f.addKey("accept",m).addClass(e.css.buttonAction+" "+o.keyAction);break;case"alt":case"altgr":f.addKey("alt",m).addClass(o.keyHasActive);break;case"b":case"bksp":f.addKey("bksp",m);break;case"c":case"cancel":f.addKey("cancel",m).addClass(e.css.buttonAction+" "+o.keyAction);break;case"combo":f.addKey("combo",m).addClass(o.keyHasActive).attr("title",function(a,b){return b+" "+e.display[e.useCombos?"active":"disabled"]}).toggleClass(e.css.buttonActive,e.useCombos);break;case"dec":h.push(f.decimal?".":","),f.addKey("dec",m);break;case"e":case"enter":f.addKey("enter",m).addClass(e.css.buttonAction+" "+o.keyAction);break;case"lock":f.addKey("lock",m).addClass(o.keyHasActive);break;case"s":case"shift":f.addKey("shift",m).addClass(o.keyHasActive);break;case"sign":h.push("-"),f.addKey("sign",m);break;case"space":h.push(" "),f.addKey("space",m);break;case"t":case"tab":f.addKey("tab",m);break;default:b.keyaction.hasOwnProperty(j[0])&&f.addKey(j[0],m).toggleClass(e.css.buttonAction+" "+o.keyAction,l)}}else i=g[k],f.addKey(i,i,!0)},f.removeBindings=function(b){a(document).unbind(b),f.el.ownerDocument!==document&&a(f.el.ownerDocument).unbind(b),a(window).unbind(b),f.$el.unbind(b)},f.removeKeyboard=function(){f.$allKeys=null,f.$decBtn=null,e.usePreview&&f.$preview.removeData("keyboard"),f.preview=null,f.$preview=null,f.$previewCopy=null,f.$keyboard.removeData("keyboard"),f.$keyboard.remove(),f.$keyboard=[],f.isOpen=!1,f.isCurrent(!1)},f.destroy=function(a){var c,d=b.css,g=f.extensionNamespace.length,h=[d.input,d.locked,d.placeholder,d.noKeyboard,d.alwaysOpen,e.css.input,d.isCurrent].join(" ");for(clearTimeout(f.timer),clearTimeout(f.timer2),f.$keyboard.length&&f.removeKeyboard(),f.removeBindings(f.namespace),f.removeBindings(f.namespace+"callbacks"),c=0;g>c;c++)f.removeBindings(f.extensionNamespace[c]);f.el.active=!1,f.$el.removeClass(h).removeAttr("aria-haspopup").removeAttr("role").removeData("keyboard"),f=null,"function"==typeof a&&a()},f.init()};return b.keyCodes={backSpace:8,tab:9,enter:13,capsLock:20,escape:27,space:32,pageUp:33,pageDown:34,end:35,home:36,left:37,up:38,right:39,down:40,insert:45,"delete":46,A:65,Z:90,V:86,C:67,X:88,a:97,z:122},b.css={idSuffix:"_keyboard",input:"ui-keyboard-input",inputClone:"ui-keyboard-preview-clone",wrapper:"ui-keyboard-preview-wrapper",preview:"ui-keyboard-preview",keyboard:"ui-keyboard",keySet:"ui-keyboard-keyset",keyButton:"ui-keyboard-button",keyWide:"ui-keyboard-widekey",keyPrefix:"ui-keyboard-",keyText:"ui-keyboard-text",keyHasActive:"ui-keyboard-hasactivestate",keyAction:"ui-keyboard-actionkey",keySpacer:"ui-keyboard-spacer",keyToggle:"ui-keyboard-toggle",keyDisabled:"ui-keyboard-disabled",locked:"ui-keyboard-lockedinput",alwaysOpen:"ui-keyboard-always-open",noKeyboard:"ui-keyboard-nokeyboard",placeholder:"ui-keyboard-placeholder",hasFocus:"ui-keyboard-has-focus",isCurrent:"ui-keyboard-input-current",inputValid:"ui-keyboard-valid-input",inputInvalid:"ui-keyboard-invalid-input",inputAutoAccepted:"ui-keyboard-autoaccepted",endRow:"ui-keyboard-button-endrow"},b.events={kbChange:"keyboardChange",kbBeforeClose:"beforeClose",kbBeforeVisible:"beforeVisible",kbVisible:"visible",kbInit:"initialized",kbInactive:"inactive",kbHidden:"hidden",kbRepeater:"repeater",kbKeysetChange:"keysetChange",inputAccepted:"accepted",inputCanceled:"canceled",inputChange:"change",inputRestricted:"restricted"},b.keyaction={accept:function(a){return a.close(!0),!1},alt:function(a){a.altActive=!a.altActive,a.showSet()},bksp:function(a){a.insertText("\b")},cancel:function(a){return a.close(),!1},clear:function(a){a.$preview.val(""),a.$decBtn.length&&a.checkDecimal()},combo:function(a){var c=a.options,d=!c.useCombos,e=a.$keyboard.find("."+b.css.keyPrefix+"combo");return c.useCombos=d,e.toggleClass(c.css.buttonActive,d).attr("title",e.attr("data-title")+" ("+c.display[d?"active":"disabled"]+")"),d&&a.checkCombos(),!1},dec:function(a){a.insertText(a.decimal?".":",")},del:function(a){a.insertText("{d}")},"default":function(a){a.shiftActive=a.altActive=a.metaActive=!1,a.showSet()},enter:function(c,d,e){var f=c.el.nodeName,g=c.options;return e.shiftKey?g.enterNavigation?c.switchInput(!e[g.enterMod],!0):c.close(!0):g.enterNavigation&&("TEXTAREA"!==f||e[g.enterMod])?c.switchInput(!e[g.enterMod],g.autoAccept?"true":!1):void("TEXTAREA"===f&&a(e.target).closest("button").length&&c.insertText((b.msie?" ":"")+"\n"))},lock:function(a){a.last.keyset[0]=a.shiftActive=a.capsLock=!a.capsLock,a.showSet()},left:function(a){var c=b.caret(a.$preview);c.start-1>=0&&(a.last.start=a.last.end=c.start-1,b.caret(a.$preview,a.last),a.setScroll())},meta:function(b,c){var d=a(c);b.metaActive=!d.hasClass(b.options.css.buttonActive),b.showSet(d.attr("data-name"))},next:function(a){return a.switchInput(!0,a.options.autoAccept),!1},normal:function(a){a.shiftActive=a.altActive=a.metaActive=!1,a.showSet()},prev:function(a){return a.switchInput(!1,a.options.autoAccept),!1},right:function(a){var c=b.caret(a.$preview);c.start+1<=a.$preview.val().length&&(a.last.start=a.last.end=c.start+1,b.caret(a.$preview,a.last),a.setScroll())},shift:function(a){a.last.keyset[0]=a.shiftActive=!a.shiftActive,a.showSet()},sign:function(a){/^\-?\d*\.?\d*$/.test(a.$preview.val())&&a.$preview.val(-1*a.$preview.val())},space:function(a){
        a.insertText(" ")},tab:function(a){var b=a.el.nodeName,c=a.options;return"INPUT"===b?c.tabNavigation?a.switchInput(!a.shiftActive,!0):!1:void a.insertText("	")},toggle:function(a){a.enabled=!a.enabled,a.toggle()},NBSP:" ",ZWSP:"​",ZWNJ:"‌",ZWJ:"‍",LRM:"‎",RLM:"‏"},b.builtLayouts={},b.layouts={alpha:{normal:["` 1 2 3 4 5 6 7 8 9 0 - = {bksp}","{tab} a b c d e f g h i j [ ] \\","k l m n o p q r s ; ' {enter}","{shift} t u v w x y z , . / {shift}","{accept} {space} {cancel}"],shift:["~ ! @ # $ % ^ & * ( ) _ + {bksp}","{tab} A B C D E F G H I J { } |",'K L M N O P Q R S : " {enter}',"{shift} T U V W X Y Z < > ? {shift}","{accept} {space} {cancel}"]},qwerty:{normal:["` 1 2 3 4 5 6 7 8 9 0 - = {bksp}","{tab} q w e r t y u i o p [ ] \\","a s d f g h j k l ; ' {enter}","{shift} z x c v b n m , . / {shift}","{accept} {space} {cancel}"],shift:["~ ! @ # $ % ^ & * ( ) _ + {bksp}","{tab} Q W E R T Y U I O P { } |",'A S D F G H J K L : " {enter}',"{shift} Z X C V B N M < > ? {shift}","{accept} {space} {cancel}"]},international:{normal:["` 1 2 3 4 5 6 7 8 9 0 - = {bksp}","{tab} q w e r t y u i o p [ ] \\","a s d f g h j k l ; ' {enter}","{shift} z x c v b n m , . / {shift}","{accept} {alt} {space} {alt} {cancel}"],shift:["~ ! @ # $ % ^ & * ( ) _ + {bksp}","{tab} Q W E R T Y U I O P { } |",'A S D F G H J K L : " {enter}',"{shift} Z X C V B N M < > ? {shift}","{accept} {alt} {space} {alt} {cancel}"],alt:["~ ¡ ² ³ ¤ € ¼ ½ ¾ ‘ ’ ¥ × {bksp}","{tab} ä å é ® þ ü ú í ó ö « » ¬","á ß ð f g h j k ø ¶ ´ {enter}","{shift} æ x © v b ñ µ ç > ¿ {shift}","{accept} {alt} {space} {alt} {cancel}"],"alt-shift":["~ ¹ ² ³ £ € ¼ ½ ¾ ‘ ’ ¥ ÷ {bksp}","{tab} Ä Å É ® Þ Ü Ú Í Ó Ö « » ¦","Ä § Ð F G H J K Ø ° ¨ {enter}","{shift} Æ X ¢ V B Ñ µ Ç . ¿ {shift}","{accept} {alt} {space} {alt} {cancel}"]},colemak:{normal:["` 1 2 3 4 5 6 7 8 9 0 - = {bksp}","{tab} q w f p g j l u y ; [ ] \\","{bksp} a r s t d h n e i o ' {enter}","{shift} z x c v b k m , . / {shift}","{accept} {space} {cancel}"],shift:["~ ! @ # $ % ^ & * ( ) _ + {bksp}","{tab} Q W F P G J L U Y : { } |",'{bksp} A R S T D H N E I O " {enter}',"{shift} Z X C V B K M < > ? {shift}","{accept} {space} {cancel}"]},dvorak:{normal:["` 1 2 3 4 5 6 7 8 9 0 [ ] {bksp}","{tab} ' , . p y f g c r l / = \\","a o e u i d h t n s - {enter}","{shift} ; q j k x b m w v z {shift}","{accept} {space} {cancel}"],shift:["~ ! @ # $ % ^ & * ( ) { } {bksp}",'{tab} " < > P Y F G C R L ? + |',"A O E U I D H T N S _ {enter}","{shift} : Q J K X B M W V Z {shift}","{accept} {space} {cancel}"]},num:{normal:["= ( ) {b}","{clear} / * -","7 8 9 +","4 5 6 {sign}","1 2 3 %","0 {dec} {a} {c}"]}},b.language={en:{display:{a:"✔:Accept (Shift+Enter)",accept:"Accept:Accept (Shift+Enter)",alt:"Alt:⌥ AltGr",b:"⌫:Backspace",bksp:"Bksp:Backspace",c:"✖:Cancel (Esc)",cancel:"Cancel:Cancel (Esc)",clear:"C:Clear",combo:"ö:Toggle Combo Keys",dec:".:Decimal",e:"⏎:Enter",empty:" ",enter:"Enter:Enter ⏎",left:"←",lock:"Lock:⇪ Caps Lock",next:"Next ⇨",prev:"⇦ Prev",right:"→",s:"⇧:Shift",shift:"Shift:Shift",sign:"±:Change Sign",space:" :Space",t:"⇥:Tab",tab:"⇥ Tab:Tab",toggle:" ",valid:"valid",invalid:"invalid",active:"active",disabled:"disabled"},wheelMessage:"Use mousewheel to see other keys",comboRegex:/([`\'~\^\"ao])([a-z])/gim,combos:{"`":{a:"à",A:"À",e:"è",E:"È",i:"ì",I:"Ì",o:"ò",O:"Ò",u:"ù",U:"Ù",y:"ỳ",Y:"Ỳ"},"'":{a:"á",A:"Á",e:"é",E:"É",i:"í",I:"Í",o:"ó",O:"Ó",u:"ú",U:"Ú",y:"ý",Y:"Ý"},'"':{a:"ä",A:"Ä",e:"ë",E:"Ë",i:"ï",I:"Ï",o:"ö",O:"Ö",u:"ü",U:"Ü",y:"ÿ",Y:"Ÿ"},"^":{a:"â",A:"Â",e:"ê",E:"Ê",i:"î",I:"Î",o:"ô",O:"Ô",u:"û",U:"Û",y:"ŷ",Y:"Ŷ"},"~":{a:"ã",A:"Ã",e:"ẽ",E:"Ẽ",i:"ĩ",I:"Ĩ",o:"õ",O:"Õ",u:"ũ",U:"Ũ",y:"ỹ",Y:"Ỹ",n:"ñ",N:"Ñ"}}}},b.defaultOptions={language:null,rtl:!1,layout:"qwerty",customLayout:null,position:{of:null,my:"center top",at:"center top",at2:"center bottom"},reposition:!0,usePreview:!0,alwaysOpen:!1,initialFocus:!0,noFocus:!1,stayOpen:!1,ignoreEsc:!1,css:{input:"ui-widget-content ui-corner-all",container:"ui-widget-content ui-widget ui-corner-all ui-helper-clearfix",popup:"",buttonDefault:"ui-state-default ui-corner-all",buttonHover:"ui-state-hover",buttonAction:"ui-state-active",buttonActive:"ui-state-active",buttonDisabled:"ui-state-disabled",buttonEmpty:"ui-keyboard-empty"},autoAccept:!1,autoAcceptOnEsc:!1,lockInput:!1,restrictInput:!1,restrictInclude:"",acceptValid:!1,autoAcceptOnValid:!1,cancelClose:!0,tabNavigation:!1,enterNavigation:!1,enterMod:"altKey",stopAtEnd:!0,appendLocally:!1,appendTo:"body",stickyShift:!0,preventPaste:!1,caretToEnd:!1,scrollAdjustment:10,maxLength:!1,maxInsert:!0,repeatDelay:500,repeatRate:20,resetDefault:!0,openOn:"focus",keyBinding:"mousedown touchstart",useWheel:!0,useCombos:!0,validate:function(a,b,c){return!0}},b.comboRegex=/([`\'~\^\"ao])([a-z])/gim,b.currentKeyboard="",a('<!--[if lte IE 8]><script>jQuery("body").addClass("oldie");</script><![endif]--><!--[if IE]><script>jQuery("body").addClass("ie");</script><![endif]-->').appendTo("body").remove(),b.msie=a("body").hasClass("oldie"),b.allie=a("body").hasClass("ie"),b.watermark="undefined"!=typeof document.createElement("input").placeholder,b.checkCaretSupport=function(){if("boolean"!=typeof b.checkCaret){var c=a('<div style="height:0px;width:0px;overflow:hidden;position:fixed;top:0;left:-100px;"><input type="text" value="testing"/></div>').prependTo("body");b.caret(c.find("input"),3,3),b.checkCaret=3!==b.caret(c.find("input").hide().show()).start,c.remove()}return b.checkCaret},b.caret=function(a,b,c){if(!a||!a.length||a.is(":hidden")||"hidden"===a.css("visibility"))return{};var d,e,f,g,h=a.data("keyboard"),i=h&&h.options.noFocus;return i||a.focus(),"undefined"!=typeof b?("object"==typeof b&&"start"in b&&"end"in b?(d=b.start,e=b.end):"undefined"==typeof c&&(c=b),"number"==typeof b&&"number"==typeof c?(d=b,e=c):"start"===b?d=e=0:"string"==typeof b&&(d=e=a.val().length),a.caret(d,e,i)):(g=a.caret(),d=g.start,e=g.end,f=a[0].value||a.text()||"",{start:d,end:e,text:f.substring(d,e),replaceStr:function(a){return f.substring(0,d)+a+f.substring(e,f.length)}})},a.fn.keyboard=function(b){return this.each(function(){a(this).data("keyboard")||new a.keyboard(this,b)})},a.fn.getkeyboard=function(){return this.data("keyboard")},a.fn.caret=function(a,b,c){if("undefined"==typeof this[0]||this.is(":hidden")||"hidden"===this.css("visibility"))return this;var d,e,f,g,h,i=document.selection,j=this,k=j[0],l=k.scrollTop,m=!1,n=!0;try{m="selectionStart"in k}catch(o){n=!1}return n&&"undefined"!=typeof a?(/(email|number)/i.test(k.type)||(m?(k.selectionStart=a,k.selectionEnd=b):(d=k.createTextRange(),d.collapse(!0),d.moveStart("character",a),d.moveEnd("character",b-a),d.select())),c||!j.is(":visible")&&"hidden"===j.css("visibility")||k.focus(),k.scrollTop=l,this):(/(email|number)/i.test(k.type)?a=b=j.val().length:m?(a=k.selectionStart,b=k.selectionEnd):i?"TEXTAREA"===k.nodeName?(h=j.val(),e=i.createRange(),f=e.duplicate(),f.moveToElementText(k),f.setEndPoint("EndToEnd",e),a=f.text.replace(/\r/g,"\n").length,b=a+e.text.replace(/\r/g,"\n").length):(h=j.val().replace(/\r/g,"\n"),e=i.createRange().duplicate(),e.moveEnd("character",h.length),a=""===e.text?h.length:h.lastIndexOf(e.text),e=i.createRange().duplicate(),e.moveStart("character",-h.length),b=e.text.length):a=b=(k.value||"").length,g=k.value||"",{start:a,end:b,text:g.substring(a,b),replace:function(c){return g.substring(0,a)+c+g.substring(b,g.length)}})},b});
        /*
         jquery.fullscreen 1.1.4
         https://github.com/kayahr/jquery-fullscreen-plugin
         Copyright (C) 2012 Klaus Reimer <k@ailis.de>
         Licensed under the MIT license
         (See http://www.opensource.org/licenses/mit-license)
        */
        function d(b){var c,a;if(!this.length)return this;c=this[0];c.ownerDocument?a=c.ownerDocument:(a=c,c=a.documentElement);if(null==b){if(!a.cancelFullScreen&&!a.webkitCancelFullScreen&&!a.mozCancelFullScreen)return null;b=!!a.fullScreen||!!a.webkitIsFullScreen||!!a.mozFullScreen;return!b?b:a.fullScreenElement||a.webkitCurrentFullScreenElement||a.mozFullScreenElement||b}b?(b=c.requestFullScreen||c.webkitRequestFullScreen||c.mozRequestFullScreen)&&b.call(c,Element.ALLOW_KEYBOARD_INPUT):(b=a.cancelFullScreen||
        a.webkitCancelFullScreen||a.mozCancelFullScreen)&&b.call(a);return this}jQuery.fn.fullScreen=d;jQuery.fn.toggleFullScreen=function(){return d.call(this,!d.call(this))};var e,f,g;e=document;e.webkitCancelFullScreen?(f="webkitfullscreenchange",g="webkitfullscreenerror"):e.mozCancelFullScreen?(f="mozfullscreenchange",g="mozfullscreenerror"):(f="fullscreenchange",g="fullscreenerror");jQuery(document).bind(f,function(){jQuery(document).trigger(new jQuery.Event("fullscreenchange"))});
        jQuery(document).bind(g,function(){jQuery(document).trigger(new jQuery.Event("fullscreenerror"))});
        !function(t,i,s){function e(s,e){this.wrapper="string"==typeof s?i.querySelector(s):s,this.scroller=this.wrapper.children[0],this.scrollerStyle=this.scroller.style,this.options={resizeScrollbars:!0,mouseWheelSpeed:20,snapThreshold:.334,disablePointer:!h.hasPointer,disableTouch:h.hasPointer||!h.hasTouch,disableMouse:h.hasPointer||h.hasTouch,startX:0,startY:0,scrollY:!0,directionLockThreshold:5,momentum:!0,bounce:!0,bounceTime:600,bounceEasing:"",preventDefault:!0,preventDefaultException:{tagName:/^(INPUT|TEXTAREA|BUTTON|SELECT)$/},HWCompositing:!0,useTransition:!0,useTransform:!0,bindToWrapper:"undefined"==typeof t.onmousedown};for(var o in e)this.options[o]=e[o];this.translateZ=this.options.HWCompositing&&h.hasPerspective?" translateZ(0)":"",this.options.useTransition=h.hasTransition&&this.options.useTransition,this.options.useTransform=h.hasTransform&&this.options.useTransform,this.options.eventPassthrough=this.options.eventPassthrough===!0?"vertical":this.options.eventPassthrough,this.options.preventDefault=!this.options.eventPassthrough&&this.options.preventDefault,this.options.scrollY="vertical"!=this.options.eventPassthrough&&this.options.scrollY,this.options.scrollX="horizontal"!=this.options.eventPassthrough&&this.options.scrollX,this.options.freeScroll=this.options.freeScroll&&!this.options.eventPassthrough,this.options.directionLockThreshold=this.options.eventPassthrough?0:this.options.directionLockThreshold,this.options.bounceEasing="string"==typeof this.options.bounceEasing?h.ease[this.options.bounceEasing]||h.ease.circular:this.options.bounceEasing,this.options.resizePolling=void 0===this.options.resizePolling?60:this.options.resizePolling,this.options.tap===!0&&(this.options.tap="tap"),"scale"==this.options.shrinkScrollbars&&(this.options.useTransition=!1),this.options.invertWheelDirection=this.options.invertWheelDirection?-1:1,this.x=0,this.y=0,this.directionX=0,this.directionY=0,this._events={},this._init(),this.refresh(),this.scrollTo(this.options.startX,this.options.startY),this.enable()}function o(t,s,e){var o=i.createElement("div"),n=i.createElement("div");return e===!0&&(o.style.cssText="position:absolute;z-index:9999",n.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px"),n.className="iScrollIndicator","h"==t?(e===!0&&(o.style.cssText+=";height:7px;left:2px;right:2px;bottom:0",n.style.height="100%"),o.className="iScrollHorizontalScrollbar"):(e===!0&&(o.style.cssText+=";width:7px;bottom:2px;top:2px;right:1px",n.style.width="100%"),o.className="iScrollVerticalScrollbar"),o.style.cssText+=";overflow:hidden",s||(o.style.pointerEvents="none"),o.appendChild(n),o}function n(s,e){this.wrapper="string"==typeof e.el?i.querySelector(e.el):e.el,this.wrapperStyle=this.wrapper.style,this.indicator=this.wrapper.children[0],this.indicatorStyle=this.indicator.style,this.scroller=s,this.options={listenX:!0,listenY:!0,interactive:!1,resize:!0,defaultScrollbars:!1,shrink:!1,fade:!1,speedRatioX:0,speedRatioY:0};for(var o in e)this.options[o]=e[o];if(this.sizeRatioX=1,this.sizeRatioY=1,this.maxPosX=0,this.maxPosY=0,this.options.interactive&&(this.options.disableTouch||(h.addEvent(this.indicator,"touchstart",this),h.addEvent(t,"touchend",this)),this.options.disablePointer||(h.addEvent(this.indicator,h.prefixPointerEvent("pointerdown"),this),h.addEvent(t,h.prefixPointerEvent("pointerup"),this)),this.options.disableMouse||(h.addEvent(this.indicator,"mousedown",this),h.addEvent(t,"mouseup",this))),this.options.fade){this.wrapperStyle[h.style.transform]=this.scroller.translateZ;var n=h.style.transitionDuration;this.wrapperStyle[n]=h.isBadAndroid?"0.0001ms":"0ms";var a=this;h.isBadAndroid&&r(function(){"0.0001ms"===a.wrapperStyle[n]&&(a.wrapperStyle[n]="0s")}),this.wrapperStyle.opacity="0"}}var r=t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||t.msRequestAnimationFrame||function(i){t.setTimeout(i,1e3/60)},h=function(){function e(t){return r!==!1&&(""===r?t:r+t.charAt(0).toUpperCase()+t.substr(1))}var o={},n=i.createElement("div").style,r=function(){for(var t,i=["t","webkitT","MozT","msT","OT"],s=0,e=i.length;s<e;s++)if(t=i[s]+"ransform",t in n)return i[s].substr(0,i[s].length-1);return!1}();o.getTime=Date.now||function(){return(new Date).getTime()},o.extend=function(t,i){for(var s in i)t[s]=i[s]},o.addEvent=function(t,i,s,e){t.addEventListener(i,s,!!e)},o.removeEvent=function(t,i,s,e){t.removeEventListener(i,s,!!e)},o.prefixPointerEvent=function(i){return t.MSPointerEvent?"MSPointer"+i.charAt(7).toUpperCase()+i.substr(8):i},o.momentum=function(t,i,e,o,n,r){var h,a,l=t-i,c=s.abs(l)/e;return r=void 0===r?6e-4:r,h=t+c*c/(2*r)*(l<0?-1:1),a=c/r,h<o?(h=n?o-n/2.5*(c/8):o,l=s.abs(h-t),a=l/c):h>0&&(h=n?n/2.5*(c/8):0,l=s.abs(t)+h,a=l/c),{destination:s.round(h),duration:a}};var h=e("transform");return o.extend(o,{hasTransform:h!==!1,hasPerspective:e("perspective")in n,hasTouch:"ontouchstart"in t,hasPointer:!(!t.PointerEvent&&!t.MSPointerEvent),hasTransition:e("transition")in n}),o.isBadAndroid=function(){var i=t.navigator.appVersion;if(/Android/.test(i)&&!/Chrome\/\d/.test(i)){var s=i.match(/Safari\/(\d+.\d)/);return!(s&&"object"==typeof s&&s.length>=2)||parseFloat(s[1])<535.19}return!1}(),o.extend(o.style={},{transform:h,transitionTimingFunction:e("transitionTimingFunction"),transitionDuration:e("transitionDuration"),transitionDelay:e("transitionDelay"),transformOrigin:e("transformOrigin")}),o.hasClass=function(t,i){var s=new RegExp("(^|\\s)"+i+"(\\s|$)");return s.test(t.className)},o.addClass=function(t,i){if(!o.hasClass(t,i)){var s=t.className.split(" ");s.push(i),t.className=s.join(" ")}},o.removeClass=function(t,i){if(o.hasClass(t,i)){var s=new RegExp("(^|\\s)"+i+"(\\s|$)","g");t.className=t.className.replace(s," ")}},o.offset=function(t){for(var i=-t.offsetLeft,s=-t.offsetTop;t=t.offsetParent;)i-=t.offsetLeft,s-=t.offsetTop;return{left:i,top:s}},o.preventDefaultException=function(t,i){for(var s in i)if(i[s].test(t[s]))return!0;return!1},o.extend(o.eventType={},{touchstart:1,touchmove:1,touchend:1,mousedown:2,mousemove:2,mouseup:2,pointerdown:3,pointermove:3,pointerup:3,MSPointerDown:3,MSPointerMove:3,MSPointerUp:3}),o.extend(o.ease={},{quadratic:{style:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",fn:function(t){return t*(2-t)}},circular:{style:"cubic-bezier(0.1, 0.57, 0.1, 1)",fn:function(t){return s.sqrt(1- --t*t)}},back:{style:"cubic-bezier(0.175, 0.885, 0.32, 1.275)",fn:function(t){var i=4;return(t-=1)*t*((i+1)*t+i)+1}},bounce:{style:"",fn:function(t){return(t/=1)<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}},elastic:{style:"",fn:function(t){var i=.22,e=.4;return 0===t?0:1==t?1:e*s.pow(2,-10*t)*s.sin((t-i/4)*(2*s.PI)/i)+1}}}),o.tap=function(t,s){var e=i.createEvent("Event");e.initEvent(s,!0,!0),e.pageX=t.pageX,e.pageY=t.pageY,t.target.dispatchEvent(e)},o.click=function(t){var s,e=t.target;/(SELECT|INPUT|TEXTAREA)/i.test(e.tagName)||(s=i.createEvent("MouseEvents"),s.initMouseEvent("click",!0,!0,t.view,1,e.screenX,e.screenY,e.clientX,e.clientY,t.ctrlKey,t.altKey,t.shiftKey,t.metaKey,0,null),s._constructed=!0,e.dispatchEvent(s))},o}();e.prototype={version:"5.2.0",_init:function(){this._initEvents(),(this.options.scrollbars||this.options.indicators)&&this._initIndicators(),this.options.mouseWheel&&this._initWheel(),this.options.snap&&this._initSnap(),this.options.keyBindings&&this._initKeys()},destroy:function(){this._initEvents(!0),clearTimeout(this.resizeTimeout),this.resizeTimeout=null,this._execEvent("destroy")},_transitionEnd:function(t){t.target==this.scroller&&this.isInTransition&&(this._transitionTime(),this.resetPosition(this.options.bounceTime)||(this.isInTransition=!1,this._execEvent("scrollEnd")))},_start:function(t){if(1!=h.eventType[t.type]){var i;if(i=t.which?t.button:t.button<2?0:4==t.button?1:2,0!==i)return}if(this.enabled&&(!this.initiated||h.eventType[t.type]===this.initiated)){!this.options.preventDefault||h.isBadAndroid||h.preventDefaultException(t.target,this.options.preventDefaultException)||t.preventDefault();var e,o=t.touches?t.touches[0]:t;this.initiated=h.eventType[t.type],this.moved=!1,this.distX=0,this.distY=0,this.directionX=0,this.directionY=0,this.directionLocked=0,this.startTime=h.getTime(),this.options.useTransition&&this.isInTransition?(this._transitionTime(),this.isInTransition=!1,e=this.getComputedPosition(),this._translate(s.round(e.x),s.round(e.y)),this._execEvent("scrollEnd")):!this.options.useTransition&&this.isAnimating&&(this.isAnimating=!1,this._execEvent("scrollEnd")),this.startX=this.x,this.startY=this.y,this.absStartX=this.x,this.absStartY=this.y,this.pointX=o.pageX,this.pointY=o.pageY,this._execEvent("beforeScrollStart")}},_move:function(t){if(this.enabled&&h.eventType[t.type]===this.initiated){this.options.preventDefault&&t.preventDefault();var i,e,o,n,r=t.touches?t.touches[0]:t,a=r.pageX-this.pointX,l=r.pageY-this.pointY,c=h.getTime();if(this.pointX=r.pageX,this.pointY=r.pageY,this.distX+=a,this.distY+=l,o=s.abs(this.distX),n=s.abs(this.distY),!(c-this.endTime>300&&o<10&&n<10)){if(this.directionLocked||this.options.freeScroll||(o>n+this.options.directionLockThreshold?this.directionLocked="h":n>=o+this.options.directionLockThreshold?this.directionLocked="v":this.directionLocked="n"),"h"==this.directionLocked){if("vertical"==this.options.eventPassthrough)t.preventDefault();else if("horizontal"==this.options.eventPassthrough)return void(this.initiated=!1);l=0}else if("v"==this.directionLocked){if("horizontal"==this.options.eventPassthrough)t.preventDefault();else if("vertical"==this.options.eventPassthrough)return void(this.initiated=!1);a=0}a=this.hasHorizontalScroll?a:0,l=this.hasVerticalScroll?l:0,i=this.x+a,e=this.y+l,(i>0||i<this.maxScrollX)&&(i=this.options.bounce?this.x+a/3:i>0?0:this.maxScrollX),(e>0||e<this.maxScrollY)&&(e=this.options.bounce?this.y+l/3:e>0?0:this.maxScrollY),this.directionX=a>0?-1:a<0?1:0,this.directionY=l>0?-1:l<0?1:0,this.moved||this._execEvent("scrollStart"),this.moved=!0,this._translate(i,e),c-this.startTime>300&&(this.startTime=c,this.startX=this.x,this.startY=this.y)}}},_end:function(t){if(this.enabled&&h.eventType[t.type]===this.initiated){this.options.preventDefault&&!h.preventDefaultException(t.target,this.options.preventDefaultException)&&t.preventDefault();var i,e,o=(t.changedTouches?t.changedTouches[0]:t,h.getTime()-this.startTime),n=s.round(this.x),r=s.round(this.y),a=s.abs(n-this.startX),l=s.abs(r-this.startY),c=0,p="";if(this.isInTransition=0,this.initiated=0,this.endTime=h.getTime(),!this.resetPosition(this.options.bounceTime)){if(this.scrollTo(n,r),!this.moved)return this.options.tap&&h.tap(t,this.options.tap),this.options.click&&h.click(t),void this._execEvent("scrollCancel");if(this._events.flick&&o<200&&a<100&&l<100)return void this._execEvent("flick");if(this.options.momentum&&o<300&&(i=this.hasHorizontalScroll?h.momentum(this.x,this.startX,o,this.maxScrollX,this.options.bounce?this.wrapperWidth:0,this.options.deceleration):{destination:n,duration:0},e=this.hasVerticalScroll?h.momentum(this.y,this.startY,o,this.maxScrollY,this.options.bounce?this.wrapperHeight:0,this.options.deceleration):{destination:r,duration:0},n=i.destination,r=e.destination,c=s.max(i.duration,e.duration),this.isInTransition=1),this.options.snap){var d=this._nearestSnap(n,r);this.currentPage=d,c=this.options.snapSpeed||s.max(s.max(s.min(s.abs(n-d.x),1e3),s.min(s.abs(r-d.y),1e3)),300),n=d.x,r=d.y,this.directionX=0,this.directionY=0,p=this.options.bounceEasing}return n!=this.x||r!=this.y?((n>0||n<this.maxScrollX||r>0||r<this.maxScrollY)&&(p=h.ease.quadratic),void this.scrollTo(n,r,c,p)):void this._execEvent("scrollEnd")}}},_resize:function(){var t=this;clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(function(){t.refresh()},this.options.resizePolling)},resetPosition:function(t){var i=this.x,s=this.y;return t=t||0,!this.hasHorizontalScroll||this.x>0?i=0:this.x<this.maxScrollX&&(i=this.maxScrollX),!this.hasVerticalScroll||this.y>0?s=0:this.y<this.maxScrollY&&(s=this.maxScrollY),(i!=this.x||s!=this.y)&&(this.scrollTo(i,s,t,this.options.bounceEasing),!0)},disable:function(){this.enabled=!1},enable:function(){this.enabled=!0},refresh:function(){this.wrapper.offsetHeight;this.wrapperWidth=this.wrapper.clientWidth,this.wrapperHeight=this.wrapper.clientHeight,this.scrollerWidth=this.scroller.offsetWidth,this.scrollerHeight=this.scroller.offsetHeight,this.maxScrollX=this.wrapperWidth-this.scrollerWidth,this.maxScrollY=this.wrapperHeight-this.scrollerHeight,this.hasHorizontalScroll=this.options.scrollX&&this.maxScrollX<0,this.hasVerticalScroll=this.options.scrollY&&this.maxScrollY<0,this.hasHorizontalScroll||(this.maxScrollX=0,this.scrollerWidth=this.wrapperWidth),this.hasVerticalScroll||(this.maxScrollY=0,this.scrollerHeight=this.wrapperHeight),this.endTime=0,this.directionX=0,this.directionY=0,this.wrapperOffset=h.offset(this.wrapper),this._execEvent("refresh"),this.resetPosition()},on:function(t,i){this._events[t]||(this._events[t]=[]),this._events[t].push(i)},off:function(t,i){if(this._events[t]){var s=this._events[t].indexOf(i);s>-1&&this._events[t].splice(s,1)}},_execEvent:function(t){if(this._events[t]){var i=0,s=this._events[t].length;if(s)for(;i<s;i++)this._events[t][i].apply(this,[].slice.call(arguments,1))}},scrollBy:function(t,i,s,e){t=this.x+t,i=this.y+i,s=s||0,this.scrollTo(t,i,s,e)},scrollTo:function(t,i,s,e){e=e||h.ease.circular,this.isInTransition=this.options.useTransition&&s>0;var o=this.options.useTransition&&e.style;!s||o?(o&&(this._transitionTimingFunction(e.style),this._transitionTime(s)),this._translate(t,i)):this._animate(t,i,s,e.fn)},scrollToElement:function(t,i,e,o,n){if(t=t.nodeType?t:this.scroller.querySelector(t)){var r=h.offset(t);r.left-=this.wrapperOffset.left,r.top-=this.wrapperOffset.top,e===!0&&(e=s.round(t.offsetWidth/2-this.wrapper.offsetWidth/2)),o===!0&&(o=s.round(t.offsetHeight/2-this.wrapper.offsetHeight/2)),r.left-=e||0,r.top-=o||0,r.left=r.left>0?0:r.left<this.maxScrollX?this.maxScrollX:r.left,r.top=r.top>0?0:r.top<this.maxScrollY?this.maxScrollY:r.top,i=void 0===i||null===i||"auto"===i?s.max(s.abs(this.x-r.left),s.abs(this.y-r.top)):i,this.scrollTo(r.left,r.top,i,n)}},_transitionTime:function(t){t=t||0;var i=h.style.transitionDuration;if(this.scrollerStyle[i]=t+"ms",!t&&h.isBadAndroid){this.scrollerStyle[i]="0.0001ms";var s=this;r(function(){"0.0001ms"===s.scrollerStyle[i]&&(s.scrollerStyle[i]="0s")})}if(this.indicators)for(var e=this.indicators.length;e--;)this.indicators[e].transitionTime(t)},_transitionTimingFunction:function(t){if(this.scrollerStyle[h.style.transitionTimingFunction]=t,this.indicators)for(var i=this.indicators.length;i--;)this.indicators[i].transitionTimingFunction(t)},_translate:function(t,i){if(this.options.useTransform?this.scrollerStyle[h.style.transform]="translate("+t+"px,"+i+"px)"+this.translateZ:(t=s.round(t),i=s.round(i),this.scrollerStyle.left=t+"px",this.scrollerStyle.top=i+"px"),this.x=t,this.y=i,this.indicators)for(var e=this.indicators.length;e--;)this.indicators[e].updatePosition()},_initEvents:function(i){var s=i?h.removeEvent:h.addEvent,e=this.options.bindToWrapper?this.wrapper:t;s(t,"orientationchange",this),s(t,"resize",this),this.options.click&&s(this.wrapper,"click",this,!0),this.options.disableMouse||(s(this.wrapper,"mousedown",this),s(e,"mousemove",this),s(e,"mousecancel",this),s(e,"mouseup",this)),h.hasPointer&&!this.options.disablePointer&&(s(this.wrapper,h.prefixPointerEvent("pointerdown"),this),s(e,h.prefixPointerEvent("pointermove"),this),s(e,h.prefixPointerEvent("pointercancel"),this),s(e,h.prefixPointerEvent("pointerup"),this)),h.hasTouch&&!this.options.disableTouch&&(s(this.wrapper,"touchstart",this),s(e,"touchmove",this),s(e,"touchcancel",this),s(e,"touchend",this)),s(this.scroller,"transitionend",this),s(this.scroller,"webkitTransitionEnd",this),s(this.scroller,"oTransitionEnd",this),s(this.scroller,"MSTransitionEnd",this)},getComputedPosition:function(){var i,s,e=t.getComputedStyle(this.scroller,null);return this.options.useTransform?(e=e[h.style.transform].split(")")[0].split(", "),i=+(e[12]||e[4]),s=+(e[13]||e[5])):(i=+e.left.replace(/[^-\d.]/g,""),s=+e.top.replace(/[^-\d.]/g,"")),{x:i,y:s}},_initIndicators:function(){function t(t){if(h.indicators)for(var i=h.indicators.length;i--;)t.call(h.indicators[i])}var i,s=this.options.interactiveScrollbars,e="string"!=typeof this.options.scrollbars,r=[],h=this;this.indicators=[],this.options.scrollbars&&(this.options.scrollY&&(i={el:o("v",s,this.options.scrollbars),interactive:s,defaultScrollbars:!0,customStyle:e,resize:this.options.resizeScrollbars,shrink:this.options.shrinkScrollbars,fade:this.options.fadeScrollbars,listenX:!1},this.wrapper.appendChild(i.el),r.push(i)),this.options.scrollX&&(i={el:o("h",s,this.options.scrollbars),interactive:s,defaultScrollbars:!0,customStyle:e,resize:this.options.resizeScrollbars,shrink:this.options.shrinkScrollbars,fade:this.options.fadeScrollbars,listenY:!1},this.wrapper.appendChild(i.el),r.push(i))),this.options.indicators&&(r=r.concat(this.options.indicators));for(var a=r.length;a--;)this.indicators.push(new n(this,r[a]));this.options.fadeScrollbars&&(this.on("scrollEnd",function(){t(function(){this.fade()})}),this.on("scrollCancel",function(){t(function(){this.fade()})}),this.on("scrollStart",function(){t(function(){this.fade(1)})}),this.on("beforeScrollStart",function(){t(function(){this.fade(1,!0)})})),this.on("refresh",function(){t(function(){this.refresh()})}),this.on("destroy",function(){t(function(){this.destroy()}),delete this.indicators})},_initWheel:function(){h.addEvent(this.wrapper,"wheel",this),h.addEvent(this.wrapper,"mousewheel",this),h.addEvent(this.wrapper,"DOMMouseScroll",this),this.on("destroy",function(){clearTimeout(this.wheelTimeout),this.wheelTimeout=null,h.removeEvent(this.wrapper,"wheel",this),h.removeEvent(this.wrapper,"mousewheel",this),h.removeEvent(this.wrapper,"DOMMouseScroll",this)})},_wheel:function(t){if(this.enabled){t.preventDefault();var i,e,o,n,r=this;if(void 0===this.wheelTimeout&&r._execEvent("scrollStart"),clearTimeout(this.wheelTimeout),this.wheelTimeout=setTimeout(function(){r.options.snap||r._execEvent("scrollEnd"),r.wheelTimeout=void 0},400),"deltaX"in t)1===t.deltaMode?(i=-t.deltaX*this.options.mouseWheelSpeed,e=-t.deltaY*this.options.mouseWheelSpeed):(i=-t.deltaX,e=-t.deltaY);else if("wheelDeltaX"in t)i=t.wheelDeltaX/120*this.options.mouseWheelSpeed,e=t.wheelDeltaY/120*this.options.mouseWheelSpeed;else if("wheelDelta"in t)i=e=t.wheelDelta/120*this.options.mouseWheelSpeed;else{if(!("detail"in t))return;i=e=-t.detail/3*this.options.mouseWheelSpeed}if(i*=this.options.invertWheelDirection,e*=this.options.invertWheelDirection,this.hasVerticalScroll||(i=e,e=0),this.options.snap)return o=this.currentPage.pageX,n=this.currentPage.pageY,i>0?o--:i<0&&o++,e>0?n--:e<0&&n++,void this.goToPage(o,n);o=this.x+s.round(this.hasHorizontalScroll?i:0),n=this.y+s.round(this.hasVerticalScroll?e:0),this.directionX=i>0?-1:i<0?1:0,this.directionY=e>0?-1:e<0?1:0,o>0?o=0:o<this.maxScrollX&&(o=this.maxScrollX),n>0?n=0:n<this.maxScrollY&&(n=this.maxScrollY),this.scrollTo(o,n,0)}},_initSnap:function(){this.currentPage={},"string"==typeof this.options.snap&&(this.options.snap=this.scroller.querySelectorAll(this.options.snap)),this.on("refresh",function(){var t,i,e,o,n,r,h=0,a=0,l=0,c=this.options.snapStepX||this.wrapperWidth,p=this.options.snapStepY||this.wrapperHeight;if(this.pages=[],this.wrapperWidth&&this.wrapperHeight&&this.scrollerWidth&&this.scrollerHeight){if(this.options.snap===!0)for(e=s.round(c/2),o=s.round(p/2);l>-this.scrollerWidth;){for(this.pages[h]=[],t=0,n=0;n>-this.scrollerHeight;)this.pages[h][t]={x:s.max(l,this.maxScrollX),y:s.max(n,this.maxScrollY),width:c,height:p,cx:l-e,cy:n-o},n-=p,t++;l-=c,h++}else for(r=this.options.snap,t=r.length,i=-1;h<t;h++)(0===h||r[h].offsetLeft<=r[h-1].offsetLeft)&&(a=0,i++),this.pages[a]||(this.pages[a]=[]),l=s.max(-r[h].offsetLeft,this.maxScrollX),n=s.max(-r[h].offsetTop,this.maxScrollY),e=l-s.round(r[h].offsetWidth/2),o=n-s.round(r[h].offsetHeight/2),this.pages[a][i]={x:l,y:n,width:r[h].offsetWidth,height:r[h].offsetHeight,cx:e,cy:o},l>this.maxScrollX&&a++;this.goToPage(this.currentPage.pageX||0,this.currentPage.pageY||0,0),this.options.snapThreshold%1===0?(this.snapThresholdX=this.options.snapThreshold,this.snapThresholdY=this.options.snapThreshold):(this.snapThresholdX=s.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width*this.options.snapThreshold),this.snapThresholdY=s.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height*this.options.snapThreshold))}}),this.on("flick",function(){var t=this.options.snapSpeed||s.max(s.max(s.min(s.abs(this.x-this.startX),1e3),s.min(s.abs(this.y-this.startY),1e3)),300);this.goToPage(this.currentPage.pageX+this.directionX,this.currentPage.pageY+this.directionY,t)})},_nearestSnap:function(t,i){if(!this.pages.length)return{x:0,y:0,pageX:0,pageY:0};var e=0,o=this.pages.length,n=0;if(s.abs(t-this.absStartX)<this.snapThresholdX&&s.abs(i-this.absStartY)<this.snapThresholdY)return this.currentPage;for(t>0?t=0:t<this.maxScrollX&&(t=this.maxScrollX),i>0?i=0:i<this.maxScrollY&&(i=this.maxScrollY);e<o;e++)if(t>=this.pages[e][0].cx){t=this.pages[e][0].x;break}for(o=this.pages[e].length;n<o;n++)if(i>=this.pages[0][n].cy){i=this.pages[0][n].y;break}return e==this.currentPage.pageX&&(e+=this.directionX,e<0?e=0:e>=this.pages.length&&(e=this.pages.length-1),t=this.pages[e][0].x),n==this.currentPage.pageY&&(n+=this.directionY,n<0?n=0:n>=this.pages[0].length&&(n=this.pages[0].length-1),i=this.pages[0][n].y),{x:t,y:i,pageX:e,pageY:n}},goToPage:function(t,i,e,o){o=o||this.options.bounceEasing,t>=this.pages.length?t=this.pages.length-1:t<0&&(t=0),i>=this.pages[t].length?i=this.pages[t].length-1:i<0&&(i=0);var n=this.pages[t][i].x,r=this.pages[t][i].y;e=void 0===e?this.options.snapSpeed||s.max(s.max(s.min(s.abs(n-this.x),1e3),s.min(s.abs(r-this.y),1e3)),300):e,this.currentPage={x:n,y:r,pageX:t,pageY:i},this.scrollTo(n,r,e,o)},next:function(t,i){var s=this.currentPage.pageX,e=this.currentPage.pageY;s++,s>=this.pages.length&&this.hasVerticalScroll&&(s=0,e++),this.goToPage(s,e,t,i)},prev:function(t,i){var s=this.currentPage.pageX,e=this.currentPage.pageY;s--,s<0&&this.hasVerticalScroll&&(s=0,e--),this.goToPage(s,e,t,i)},_initKeys:function(i){var s,e={pageUp:33,pageDown:34,end:35,home:36,left:37,up:38,right:39,down:40};if("object"==typeof this.options.keyBindings)for(s in this.options.keyBindings)"string"==typeof this.options.keyBindings[s]&&(this.options.keyBindings[s]=this.options.keyBindings[s].toUpperCase().charCodeAt(0));else this.options.keyBindings={};for(s in e)this.options.keyBindings[s]=this.options.keyBindings[s]||e[s];h.addEvent(t,"keydown",this),this.on("destroy",function(){h.removeEvent(t,"keydown",this)})},_key:function(t){if(this.enabled){var i,e=this.options.snap,o=e?this.currentPage.pageX:this.x,n=e?this.currentPage.pageY:this.y,r=h.getTime(),a=this.keyTime||0,l=.25;switch(this.options.useTransition&&this.isInTransition&&(i=this.getComputedPosition(),this._translate(s.round(i.x),s.round(i.y)),this.isInTransition=!1),this.keyAcceleration=r-a<200?s.min(this.keyAcceleration+l,50):0,t.keyCode){case this.options.keyBindings.pageUp:this.hasHorizontalScroll&&!this.hasVerticalScroll?o+=e?1:this.wrapperWidth:n+=e?1:this.wrapperHeight;break;case this.options.keyBindings.pageDown:this.hasHorizontalScroll&&!this.hasVerticalScroll?o-=e?1:this.wrapperWidth:n-=e?1:this.wrapperHeight;break;case this.options.keyBindings.end:o=e?this.pages.length-1:this.maxScrollX,n=e?this.pages[0].length-1:this.maxScrollY;break;case this.options.keyBindings.home:o=0,n=0;break;case this.options.keyBindings.left:o+=e?-1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.up:n+=e?1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.right:o-=e?-1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.down:n-=e?1:5+this.keyAcceleration>>0;break;default:return}if(e)return void this.goToPage(o,n);o>0?(o=0,this.keyAcceleration=0):o<this.maxScrollX&&(o=this.maxScrollX,this.keyAcceleration=0),n>0?(n=0,this.keyAcceleration=0):n<this.maxScrollY&&(n=this.maxScrollY,this.keyAcceleration=0),this.scrollTo(o,n,0),this.keyTime=r}},_animate:function(t,i,s,e){function o(){var d,u,m,f=h.getTime();return f>=p?(n.isAnimating=!1,n._translate(t,i),void(n.resetPosition(n.options.bounceTime)||n._execEvent("scrollEnd"))):(f=(f-c)/s,m=e(f),d=(t-a)*m+a,u=(i-l)*m+l,n._translate(d,u),void(n.isAnimating&&r(o)))}var n=this,a=this.x,l=this.y,c=h.getTime(),p=c+s;this.isAnimating=!0,o()},handleEvent:function(t){switch(t.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(t);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(t);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(t);break;case"orientationchange":case"resize":this._resize();break;case"transitionend":case"webkitTransitionEnd":case"oTransitionEnd":case"MSTransitionEnd":this._transitionEnd(t);break;case"wheel":case"DOMMouseScroll":case"mousewheel":this._wheel(t);break;case"keydown":this._key(t);break;case"click":this.enabled&&!t._constructed&&(t.preventDefault(),t.stopPropagation())}}},n.prototype={handleEvent:function(t){switch(t.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(t);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(t);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(t)}},destroy:function(){this.options.fadeScrollbars&&(clearTimeout(this.fadeTimeout),this.fadeTimeout=null),this.options.interactive&&(h.removeEvent(this.indicator,"touchstart",this),h.removeEvent(this.indicator,h.prefixPointerEvent("pointerdown"),this),h.removeEvent(this.indicator,"mousedown",this),h.removeEvent(t,"touchmove",this),h.removeEvent(t,h.prefixPointerEvent("pointermove"),this),h.removeEvent(t,"mousemove",this),h.removeEvent(t,"touchend",this),h.removeEvent(t,h.prefixPointerEvent("pointerup"),this),h.removeEvent(t,"mouseup",this)),this.options.defaultScrollbars&&this.wrapper.parentNode.removeChild(this.wrapper)},_start:function(i){var s=i.touches?i.touches[0]:i;i.preventDefault(),i.stopPropagation(),this.transitionTime(),this.initiated=!0,this.moved=!1,this.lastPointX=s.pageX,this.lastPointY=s.pageY,this.startTime=h.getTime(),this.options.disableTouch||h.addEvent(t,"touchmove",this),this.options.disablePointer||h.addEvent(t,h.prefixPointerEvent("pointermove"),this),this.options.disableMouse||h.addEvent(t,"mousemove",this),this.scroller._execEvent("beforeScrollStart")},_move:function(t){var i,s,e,o,n=t.touches?t.touches[0]:t;h.getTime();this.moved||this.scroller._execEvent("scrollStart"),this.moved=!0,i=n.pageX-this.lastPointX,this.lastPointX=n.pageX,s=n.pageY-this.lastPointY,this.lastPointY=n.pageY,e=this.x+i,o=this.y+s,this._pos(e,o),t.preventDefault(),t.stopPropagation()},_end:function(i){if(this.initiated){if(this.initiated=!1,i.preventDefault(),i.stopPropagation(),h.removeEvent(t,"touchmove",this),h.removeEvent(t,h.prefixPointerEvent("pointermove"),this),h.removeEvent(t,"mousemove",this),this.scroller.options.snap){var e=this.scroller._nearestSnap(this.scroller.x,this.scroller.y),o=this.options.snapSpeed||s.max(s.max(s.min(s.abs(this.scroller.x-e.x),1e3),s.min(s.abs(this.scroller.y-e.y),1e3)),300);this.scroller.x==e.x&&this.scroller.y==e.y||(this.scroller.directionX=0,this.scroller.directionY=0,this.scroller.currentPage=e,this.scroller.scrollTo(e.x,e.y,o,this.scroller.options.bounceEasing))}this.moved&&this.scroller._execEvent("scrollEnd")}},transitionTime:function(t){t=t||0;var i=h.style.transitionDuration;if(this.indicatorStyle[i]=t+"ms",!t&&h.isBadAndroid){this.indicatorStyle[i]="0.0001ms";var s=this;r(function(){"0.0001ms"===s.indicatorStyle[i]&&(s.indicatorStyle[i]="0s")})}},transitionTimingFunction:function(t){this.indicatorStyle[h.style.transitionTimingFunction]=t},refresh:function(){this.transitionTime(),this.options.listenX&&!this.options.listenY?this.indicatorStyle.display=this.scroller.hasHorizontalScroll?"block":"none":this.options.listenY&&!this.options.listenX?this.indicatorStyle.display=this.scroller.hasVerticalScroll?"block":"none":this.indicatorStyle.display=this.scroller.hasHorizontalScroll||this.scroller.hasVerticalScroll?"block":"none",this.scroller.hasHorizontalScroll&&this.scroller.hasVerticalScroll?(h.addClass(this.wrapper,"iScrollBothScrollbars"),h.removeClass(this.wrapper,"iScrollLoneScrollbar"),this.options.defaultScrollbars&&this.options.customStyle&&(this.options.listenX?this.wrapper.style.right="8px":this.wrapper.style.bottom="8px")):(h.removeClass(this.wrapper,"iScrollBothScrollbars"),h.addClass(this.wrapper,"iScrollLoneScrollbar"),this.options.defaultScrollbars&&this.options.customStyle&&(this.options.listenX?this.wrapper.style.right="2px":this.wrapper.style.bottom="2px"));this.wrapper.offsetHeight;this.options.listenX&&(this.wrapperWidth=this.wrapper.clientWidth,this.options.resize?(this.indicatorWidth=s.max(s.round(this.wrapperWidth*this.wrapperWidth/(this.scroller.scrollerWidth||this.wrapperWidth||1)),8),this.indicatorStyle.width=this.indicatorWidth+"px"):this.indicatorWidth=this.indicator.clientWidth,this.maxPosX=this.wrapperWidth-this.indicatorWidth,"clip"==this.options.shrink?(this.minBoundaryX=-this.indicatorWidth+8,this.maxBoundaryX=this.wrapperWidth-8):(this.minBoundaryX=0,this.maxBoundaryX=this.maxPosX),this.sizeRatioX=this.options.speedRatioX||this.scroller.maxScrollX&&this.maxPosX/this.scroller.maxScrollX),this.options.listenY&&(this.wrapperHeight=this.wrapper.clientHeight,this.options.resize?(this.indicatorHeight=s.max(s.round(this.wrapperHeight*this.wrapperHeight/(this.scroller.scrollerHeight||this.wrapperHeight||1)),8),this.indicatorStyle.height=this.indicatorHeight+"px"):this.indicatorHeight=this.indicator.clientHeight,this.maxPosY=this.wrapperHeight-this.indicatorHeight,"clip"==this.options.shrink?(this.minBoundaryY=-this.indicatorHeight+8,this.maxBoundaryY=this.wrapperHeight-8):(this.minBoundaryY=0,this.maxBoundaryY=this.maxPosY),this.maxPosY=this.wrapperHeight-this.indicatorHeight,this.sizeRatioY=this.options.speedRatioY||this.scroller.maxScrollY&&this.maxPosY/this.scroller.maxScrollY),this.updatePosition()},updatePosition:function(){var t=this.options.listenX&&s.round(this.sizeRatioX*this.scroller.x)||0,i=this.options.listenY&&s.round(this.sizeRatioY*this.scroller.y)||0;this.options.ignoreBoundaries||(t<this.minBoundaryX?("scale"==this.options.shrink&&(this.width=s.max(this.indicatorWidth+t,8),this.indicatorStyle.width=this.width+"px"),t=this.minBoundaryX):t>this.maxBoundaryX?"scale"==this.options.shrink?(this.width=s.max(this.indicatorWidth-(t-this.maxPosX),8),this.indicatorStyle.width=this.width+"px",t=this.maxPosX+this.indicatorWidth-this.width):t=this.maxBoundaryX:"scale"==this.options.shrink&&this.width!=this.indicatorWidth&&(this.width=this.indicatorWidth,this.indicatorStyle.width=this.width+"px"),i<this.minBoundaryY?("scale"==this.options.shrink&&(this.height=s.max(this.indicatorHeight+3*i,8),this.indicatorStyle.height=this.height+"px"),i=this.minBoundaryY):i>this.maxBoundaryY?"scale"==this.options.shrink?(this.height=s.max(this.indicatorHeight-3*(i-this.maxPosY),8),this.indicatorStyle.height=this.height+"px",i=this.maxPosY+this.indicatorHeight-this.height):i=this.maxBoundaryY:"scale"==this.options.shrink&&this.height!=this.indicatorHeight&&(this.height=this.indicatorHeight,this.indicatorStyle.height=this.height+"px")),
        this.x=t,this.y=i,this.scroller.options.useTransform?this.indicatorStyle[h.style.transform]="translate("+t+"px,"+i+"px)"+this.scroller.translateZ:(this.indicatorStyle.left=t+"px",this.indicatorStyle.top=i+"px")},_pos:function(t,i){t<0?t=0:t>this.maxPosX&&(t=this.maxPosX),i<0?i=0:i>this.maxPosY&&(i=this.maxPosY),t=this.options.listenX?s.round(t/this.sizeRatioX):this.scroller.x,i=this.options.listenY?s.round(i/this.sizeRatioY):this.scroller.y,this.scroller.scrollTo(t,i)},fade:function(t,i){if(!i||this.visible){clearTimeout(this.fadeTimeout),this.fadeTimeout=null;var s=t?250:500,e=t?0:300;t=t?"1":"0",this.wrapperStyle[h.style.transitionDuration]=s+"ms",this.fadeTimeout=setTimeout(function(t){this.wrapperStyle.opacity=t,this.visible=+t}.bind(this,t),e)}}},e.utils=h,"undefined"!=typeof module&&module.exports?module.exports=e:"function"==typeof define&&define.amd?define(function(){return e}):t.IScroll=e}(window,document,Math);
        /*! tinycolorpicker - v0.9.4 - 2015-11-20
         * http://www.baijs.com/tinycolorpicker
         *
         * Copyright (c) 2015 Maarten Baijs <wieringen@gmail.com>;
         * Licensed under the MIT license */
        
        !function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){function b(b,e){function f(){return s?(m=a("<canvas></canvas>"),k.append(m),q=m[0].getContext("2d"),g()):a.each(j.options.colors,function(a,b){var c=p.clone();c.css("backgroundColor",b),c.attr("data-color",b),o.append(c)}),h(),j}function g(){var b=new Image,c=k.css("background-image").replace(/"/g,"").replace(/url\(|\)$/gi,"");b.crossOrigin="Anonymous",k.css("background-image","none"),a(b).on("load",function(){m.attr("width",this.width),m.attr("height",this.height),q.drawImage(b,0,0,this.width,this.height)}),b.src=j.options.backgroundUrl||c}function h(){var b=t?"touchstart":"mousedown";s?(l.bind(b,function(b){b.preventDefault(),b.stopPropagation(),k.toggle(),a(document).bind("mousedown.colorpicker",function(b){a(document).unbind(".colorpicker"),j.close()})}),t?(m.bind("touchstart",function(a){return r=!0,i(a.originalEvent.touches[0]),!1}),m.bind("touchmove",function(a){return i(a.originalEvent.touches[0]),!1}),m.bind("touchend",function(a){return j.close(),!1})):(m.mousedown(function(b){return r=!0,i(b),a(document).bind("mouseup.colorpicker",function(b){return a(document).unbind(".colorpicker"),j.close(),!1}),!1}),m.mousemove(i))):(l.bind("mousedown",function(a){a.preventDefault(),a.stopPropagation(),o.toggle()}),o.delegate("li","mousedown",function(b){b.preventDefault(),b.stopImmediatePropagation();var c=a(this).attr("data-color");j.setColor(c),o.hide()}))}function i(c){if(r){var d=a(c.target),e=d.offset(),f=q.getImageData(c.pageX-e.left,c.pageY-e.top,1,1).data;j.setColor("rgb("+f[0]+","+f[1]+","+f[2]+")"),b.trigger("change",[j.colorHex,j.colorRGB])}}this.options=a.extend({},d,e),this._defaults=d,this._name=c;var j=this,k=b.find(".track"),l=b.find(".color"),m=null,n=b.find(".colorInput"),o=b.find(".dropdown"),p=o.find("li").remove(),q=null,r=!1,s=!!document.createElement("canvas").getContext,t="ontouchstart"in document.documentElement;return this.colorHex="",this.colorRGB="",this.setColor=function(a){a.indexOf("#")>=0?(j.colorHex=a,j.colorRGB=j.hexToRgb(j.colorHex)):(j.colorRGB=a,j.colorHex=j.rgbToHex(j.colorRGB)),l.find(".colorInner").css("backgroundColor",j.colorHex),n.val(j.colorHex)},this.close=function(){r=!1,k.hide()},this.hexToRgb=function(a){var b=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);return"rgb("+parseInt(b[1],16)+","+parseInt(b[2],16)+","+parseInt(b[3],16)+")"},this.rgbToHex=function(a){function b(a){var b=new Array("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F");return isNaN(a)?"00":b[(a-a%16)/16]+b[a%16]}var c=a.match(/\d+/g);return"#"+b(c[0])+b(c[1])+b(c[2])},f()}var c="tinycolorpicker",d={colors:["#ffffff","#A7194B","#FE2712","#FB9902","#FABC02","#FEFE33","#D0EA2B","#66B032","#0391CE","#0247FE","#3D01A5","#8601AF"],backgroundUrl:null};a.fn[c]=function(d){return this.each(function(){a.data(this,"plugin_"+c)||a.data(this,"plugin_"+c,new b(a(this),d))})}});
        ;
        
        // source: plugin/touchui/js/touchui.bundled.js
        var TouchUI = function() {
        	this.core.init.call(this);
        	this.knockout.viewModel.call(this);
        	this.knockout.bindings.call(this);
        	return this.core.bridge.call(this);
        };
        
        TouchUI.prototype = {
        	constructor: TouchUI,
        	isActive: ko.observable(false),
        
        	settings: {
        		id: "touch",
        		version: 0,
        		requiredBootloaderVersion: 1,
        
        		isFullscreen: ko.observable(false),
        		isTouchscreen: ko.observable(false),
        
        		isEpiphanyOrKweb: (window.navigator.userAgent.indexOf("AppleWebKit") !== -1 && window.navigator.userAgent.indexOf("ARM Mac OS X") !== -1),
        		isChromiumArm: (window.navigator.userAgent.indexOf("X11") !== -1 && window.navigator.userAgent.indexOf("Chromium") !== -1 && window.navigator.userAgent.indexOf("armv7l") !== -1 || window.navigator.userAgent.indexOf("TouchUI") !== -1),
        
        		hasFullscreen: ko.observable(document.webkitCancelFullScreen || document.msCancelFullScreen || document.oCancelFullScreen || document.mozCancelFullScreen || document.cancelFullScreen),
        		hasLocalStorage: ('localStorage' in window),
        		hasTouch: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0),
        
        		canBoot: {
        			resolution: $("#touchui_auto_load_resolution").length > 0,
        			touch: $("#touchui_auto_load_touch").length > 0
        		},
        
        		whatsNew: ko.observable(false)
        	},
        
        	core: {},
        	components: {},
        	knockout: {},
        	plugins: {},
        	animate: {
        		isHidebarActive: ko.observable(false)
        	},
        	DOM: {
        		create: {},
        		move: {},
        		overwrite: {}
        	},
        	scroll: {
        
        		defaults: {
        			iScroll: {
        				eventPassthrough: 'horizontal',
        				scrollbars: true,
        				mouseWheel: true,
        				interactiveScrollbars: true,
        				shrinkScrollbars: "scale",
        				fadeScrollbars: true
        			}
        		},
        
        		iScrolls: {},
        		currentActive: null
        	}
        
        }
        
        TouchUI.prototype.animate.hide = function(what) {
        	var self = this;
        
        	//Lets hide the navbar by scroll
        	if( what === "navbar" ) {
        		if( this.animate.isHidebarActive() ) {
        			var navbar = $("#navbar"),
        				navbarHeight = parseFloat(navbar.height());
        
        			if( this.settings.hasTouch ) {
        				// Hide navigation bar on mobile
        				window.scrollTo(0,1);
        
        				if(parseFloat($("html,body").prop('scrollHeight')) > ($(window).height() + navbarHeight)) {//hasEnoughScroll?
        					$("html,body").stop().animate({
        						scrollTop: navbarHeight
        					}, 160, "swing");
        				}
        
        			} else {
        				var scroll = self.scroll.iScrolls.body;
        
        				if(scroll.isAnimating) {
        					setTimeout(function() {
        						self.animate.hide.call(self, what);
        					}, 10);
        					return;
        				}
        
        				setTimeout(function() {
        					if(Math.abs(scroll.maxScrollY) > 0) {
        						scroll.scrollTo(0, -navbarHeight, 160);
        					}
        				}, 0);
        
        			}
        		}
        	}
        
        }
        
        TouchUI.prototype.components.dropdown = {
        
        	init: function() {
        		this.components.dropdown.toggleSubmenu.call( this );
        		this.components.dropdown.toggle.call( this );
        	},
        
        	// Rewrite opening of dropdowns
        	toggle: function() {
        		var self = this;
        		var namespace = ".touchui.dropdown";
        
        		$(document)
        			.off('.dropdown')
        			.on('touchstart.dropdown.data-api', '.dropdown-menu', function (e) { e.stopPropagation() })
        			.on('click.dropdown.data-api', '[data-toggle=dropdown]', function(e) {
        				var $dropdownToggle = $(e.currentTarget);
        				var $dropdownContainer = $dropdownToggle.parent();
        
        				// Stop the hashtag from propagating
        				e.preventDefault();
        
        				// Toggle the targeted dropdown
        				$dropdownContainer.toggleClass("open");
        
        				// Refresh current scroll and add a min-height so we can reach the dropdown if needed
        				self.components.dropdown.containerMinHeight.call(self, $dropdownContainer, $dropdownToggle);
        
        				// Skip everything if we are in a dropdown toggling a dropdown (one click event is enuff!)
        				if( $dropdownContainer.parents('.open > .dropdown-menu').length > 0 ) {
        					return;
        				}
        
        				// Remove all other active dropdowns
        				$('.open [data-toggle="dropdown"]').not($dropdownToggle).parent().removeClass('open');
        
        				if ( !self.settings.hasTouch ) {
        					self.scroll.iScrolls.terminal.disable();
        				}
        
        				$(document).off("click"+namespace).on("click"+namespace, function(eve) {
        					// Check if we scrolled (touch devices wont trigger this click event after scrolling so assume we didn't move)
        					var moved = ( !self.settings.hasTouch ) ? self.scroll.currentActive.moved : false,
        						$target = $(eve.target);
        
        					if (
        						!moved && // If scrolling did not move
        						$target.parents(".ui-pnotify").length === 0 && // if not a click within notifiaction
        						(
        							!$target.parents().is($dropdownContainer) || // if clicks are not made within the dropdown container
        							$target.is('a:not([data-toggle="dropdown"])') // Unless it's a link but not a [data-toggle]
        						)
        					) {
        						$(document).off(eve);
        						$dropdownContainer.removeClass('open');
        
        						if ( !self.settings.hasTouch ) {
        							$('.octoprint-container').css("min-height", 0);
        							self.scroll.currentActive.refresh();
        							self.scroll.iScrolls.terminal.enable();
        						}
        					}
        				});
        			});
        
        	},
        
        	// Support 1.3.0 onMouseOver dropdowns
        	toggleSubmenu: function() {
        		$(".dropdown-submenu").addClass("dropdown");
        		$(".dropdown-submenu > a").attr("data-toggle", "dropdown");
        	},
        
        	// Refresh current scroll and add a min-height so we can reach the dropdown if needed
        	containerMinHeight: function($dropdownContainer, $dropdownToggle) {
        		var self = this;
        
        		// Touch devices can reach the dropdown by CSS, only if we're using iScroll
        		if ( !self.settings.hasTouch ) {
        			// Get active container
        			var $container = ($dropdownContainer.parents('.modal').length === 0 ) ? $('.octoprint-container') : $dropdownContainer.parents('.modal .modal-body');
        
        			// If we toggle within the dropdown then get the parent dropdown for total height
        			var $dropdownMenu = ( $dropdownContainer.parents('.open > .dropdown-menu').length > 0 ) ? $dropdownContainer.parents('.open > .dropdown-menu') : $dropdownToggle.next();
        
        			setTimeout(function() {
        
        				//If the main dropdown has closed (by toggle) then let's remove the min-height else
        				if(!$dropdownMenu.parent().hasClass("open")) {
        					$container.css("min-height", 0);
        					self.scroll.currentActive.refresh();
        				} else {
        					var y = Math.abs(self.scroll.currentActive.y),
        						height = $dropdownMenu.outerHeight(),
        						top = $dropdownMenu.offset().top;
        
        					$container.css("min-height", y + top + height);
        					self.scroll.currentActive.refresh();
        				}
        
        			}, 0);
        		}
        	}
        
        }
        
        TouchUI.prototype.components.fullscreen = {
        	init: function() {
        		var self = this;
        
        		// Bind fullscreenChange to knockout
        		$(document).bind("fullscreenchange", function() {
        			self.settings.isFullscreen($(document).fullScreen() !== false);
        			self.DOM.storage.set("fullscreen", self.settings.isFullscreen());
        		});
        
        	}
        }
        
        TouchUI.prototype.components.keyboard = {
        
        	isActive: ko.observable(false),
        	config: {
        
        		default: {
        
        			display: {
        				'accept' :  'Save',
        				'bksp'   :  ' ',
        				'default': 'ABC',
        				'meta1'  : '.?123',
        				'meta2'  : '#+='
        			},
        
        			layout: 'custom',
        			customLayout: {
        				'default': [
        					'q w e r t y u i o p',
        					'a s d f g h j k l',
        					'{bksp} {s} z x c v b n m',
        					'{accept} {c} {left} {right} {meta1} {space}'
        				],
        				'shift': [
        					'Q W E R T Y U I O P',
        					'A S D F G H J K L',
        					'{bksp} {s} Z X C V B N M',
        					'{accept} {c} {left} {right} {meta1} {space}'
        				],
        				'meta1': [
        					'1 2 3 4 5 6 7 8 9 0',
        					'- / : ; ( ) \u20ac & @',
        					'{bksp} {meta2} . , ? ! \' "',
        					'{accept} {c} {left} {right} {default} {space}'
        				],
        				'meta2': [
        					'[ ] { } # % ^ * + =',
        					'_ \\ | ~ < > $ \u00a3 \u00a5',
        					'{bksp} {meta1} . , ? ! \' "',
        					'{accept} {c} {left} {right} {default} {space}'
        				]
        			}
        
        		},
        		terminal: {
        			display: {
        				'bksp'   :  ' ',
        				'accept' : 'Save',
        				'default': 'ABC',
        				'meta1'  : '.?123',
        				'meta2'  : '#+='
        			},
        
        			layout: 'custom',
        			customLayout: {
        				'default': [
        					'Q W E R T Y U I O P',
        					'A S D F G H J K L',
        					'{bksp} {s} Z X C V B N M',
        					'{accept} {c} {left} {right} {meta1} {space}'
        				],
        				'meta1': [
        					'1 2 3 4 5 6 7 8 9 0',
        					'- / : ; ( ) \u20ac & @',
        					'{bksp} {meta2} . , ? ! \' "',
        					'{accept} {c} {left} {right} {default} {space}'
        				],
        				'meta2': [
        					'[ ] { } # % ^ * + =',
        					'_ \\ | ~ < > $ \u00a3 \u00a5',
        					'{bksp} {meta1} . , ? ! \' "',
        					'{accept} {c} {left} {right} {default} {space}'
        				]
        			}
        
        		},
        		number: {
        			display: {
        				'bksp'   :  ' ',
        				'a'      :  'Save',
        				'c'      :  'Cancel'
        			},
        
        			layout: 'custom',
        			customLayout: {
        				'default' : [
        					'{bksp} 1 2 3 4 5 6 7 ',
        					'{accept} {c} {left} {right} 8 9 0 - , . '
        				]
        			},
        		}
        
        
        	},
        
        	init: function() {
        		var self = this;
        
        		// Add virtual keyboard
        		var obj = {
        			visible: self.components.keyboard.onShow,
        			beforeClose: self.components.keyboard.onClose
        		};
        
        		var notThis = ['[type="file"]','[type="checkbox"]','[type="radio"]'];
        		$(document).on("mousedown", 'input:not('+notThis+'), textarea', function(e) {
        			var $elm = $(e.target);
        
        			if(!self.components.keyboard.isActive()) {
        
        				if($elm.data("keyboard")) {
        					$elm.data("keyboard").close().destroy();
        				}
        
        			} else {
        
        				if(!self.settings.hasTouch) {
        
        					// Force iScroll to stop following the mouse (bug)
        					self.scroll.currentActive._end(e);
        					setTimeout(function() {
        						self.scroll.currentActive.scrollToElement($elm[0], 200, 0, -30);
        					}, 0);
        
        				}
        
        				// $elm already has a keyboard
        				if($elm.data("keyboard")) {
        					$elm.data('keyboard').reveal();
        					return;
        				}
        
        				if($elm.attr("type") === "number") {
        					$elm.keyboard($.extend(self.components.keyboard.config.number, obj));
        				} else if($elm.attr("id") === "terminal-command") {
        					$elm.keyboard($.extend(self.components.keyboard.config.terminal, obj));
        				} else {
        					$elm.keyboard($.extend(self.components.keyboard.config.default, obj));
        				}
        			}
        
        		});
        	},
        
        	onShow: function(event, keyboard, el) {
        		// Set the input cursor to the end of the input field
        		setTimeout(function() {
        			var prev = keyboard.$preview.get(0);
        			if (prev) {
        				prev.selectionStart = prev.selectionEnd = prev.value.length;
        			}
        		}, 10);
        		
        		keyboard.$keyboard.find("button").on("mousedown", function(e) {
        			$(e.target).addClass("touch-focus");
        
        			if(typeof $(e.target).data("timeout") !== "function") {
        				clearTimeout($(e.target).data("timeout"));
        			}
        			var timeout = setTimeout(function() {
        				$(e.target).removeClass("touch-focus").data("timeout", "");
        			}, 600);
        			$(e.target).data("timeout", timeout);
        		});
        	},
        
        	onClose: function(event, keyboard, el) {
        		keyboard.$keyboard.find("button").off("mousedown");
        	}
        
        }
        
        TouchUI.prototype.components.modal = {
        
        	init: function() {
        		if($("#settings_dialog_menu").length > 0) {
        			this.components.modal.dropdown.create.call(this, "#settings_dialog_menu", "special-dropdown-uni", "#settings_dialog_label");
        		}
        		if($("#usersettings_dialog ul.nav").length > 0) {
        			this.components.modal.dropdown.create.call(this, "#usersettings_dialog ul.nav", "special-dropdown-uni-2", "#usersettings_dialog h3");
        		}
        	},
        
        	dropdown: {
        		create: function(cloneId, newId, appendTo) {
        			var self = this;
        
        			// Remove unwanted whitespaces
        			$(appendTo).text($(appendTo).text().trim());
        
        			// Create a label that is clickable
        			var $settingsLabel = $("<span></span>")
        				.addClass("hidden")
        				.attr("id", newId)
        				.appendTo(appendTo)
        				.text($(cloneId+" .active").text().trim())
        				.on("click", function(e) {
        
        					// Stop if we clicked on the dropdown and stop the dropdown from regenerating more then once
        					if(e.target !== this || (e.target === this && $(".show-dropdown").length > 0)) {
        						return;
        					}
        
        					// Clone the main settings menu
        					var elm = $(cloneId)
        						.clone()
        						.attr("id", "")
        						.appendTo(this)
        						.addClass("show-dropdown");
        
        					// Add click binder to close down the dropdown
        					$(document).on("click", function(event) {
        
        						if(
        							$(event.target).closest('[data-toggle="tab"]').length > 0 || //Check if we clicked on a tab-link
        							$(event.target).closest("#"+newId).length === 0 //Check if we clicked outside the dropdown
        						) {
        							var href = $settingsLabel.find(".active").find('[data-toggle="tab"]').attr("href");
        							$(document).off(event).trigger("dropdown-closed.touchui"); // Trigger event for enabling scrolling
        
        							$('.show-dropdown').remove();
        							$('[href="'+href+'"]').click();
        							$settingsLabel.text($('[href="'+href+'"]').text());
        
        							if( !self.settings.hasTouch ) {
        								setTimeout(function() {
        									self.scroll.modal.stack[self.scroll.modal.stack.length-1].refresh();
        								}, 0);
        							}
        						}
        
        					});
        
        					// Trigger event for disabling scrolling
        					$(document).trigger("dropdown-open.touchui", elm[0]);
        				});
        
        			// reset the active text in dropdown on open
        			$(appendTo)
        				.closest(".modal")
        				.on("modal.touchui", function() {
        					var href = $(cloneId)
        						.find(".active")
        						.find('[data-toggle="tab"]')
        						.attr("href");
        
        					$settingsLabel.text($('[href="'+href+'"]').text());
        				});
        
        		}
        	}
        }
        
        TouchUI.prototype.components.slider = {
        
        	init: function() {
        
        		ko.bindingHandlers.slider = {
        			init: function (element, valueAccessor) {
        				var $element = $(element);
        
        				// Set value on input field
        				$element.val(valueAccessor().value());
        
        				// Create container
        				var div = $('<div class="slider-container"></div>').insertBefore(element);
        
        				// Wait untill next DOM bindings are executed
        				setTimeout(function() {
        					var $button = $(element).next('button');
        					var id = _.uniqueId("ui-inp");
        
        					$button.appendTo(div);
        					$element.appendTo(div);
        
        					$(div).find('input').attr("id", id);
        
        					var lbl = $('<label for="' + id + '" style="display: inline-block;">' + $button.text().split(":")[0].replace(" ", "") + ':</label>');
        					lbl.appendTo('.octoprint-container')
        					$element.attr("style", "padding-left:" + (lbl.width() + 15) + "px");
        					lbl.appendTo(div);
        
        				}, 60);
        
        				$element.on("change", function(e) {
        					valueAccessor().value(parseFloat($element.val()));
        				}).attr({
        					max: valueAccessor().max,
        					min: valueAccessor().min,
        					step: valueAccessor().step,
        				});
        
        			},
        			update: function (element, valueAccessor) {
        				$(element).val(parseFloat(valueAccessor().value()));
        			}
        		};
        
        	}
        
        }
        
        TouchUI.prototype.components.touchList = {
        	init: function() {
        
        		/* Add touch friendly files list */
        		var self = this;
        		var touch = false;
        		var start = 0;
        		var namespace = ".files.touchui";
        
        		$(document).on("mousedown touchstart", "#files .entry:not(.folder, .back), #temp .row-fluid", function(e) {
        			try {
        				touch = e.currentTarget;
        				start = e.pageX || e.originalEvent.targetTouches[0].pageX;
        			} catch(err) {
        				return;
        			}
        
        			$(document).one("mouseup"+namespace+" touchend"+namespace, function(e) {
        				touch = false;
        				start = 0;
        
        				$(document).off(namespace);
        			});
        
        			$(document).on("mousemove"+namespace+" touchmove"+namespace, function(event) {
        				if(touch !== false) {
        					try {
        						var current = event.pageX || event.originalEvent.targetTouches[0].pageX;
        
        						if(current > start + 80) {
        							$(document).trigger("fileclose" + namespace, event.target);
        							$(touch).removeClass("open");
        							start = current;
        						} else if(current < start - 80) {
        							$(document).trigger("fileopen" + namespace, event.target);
        							$(touch).addClass("open");
        							start = current;
        
        							if( $(touch).find(".btn-group").children().length > 4 ) {
        								$(touch).addClass("large");
        							}
        						}
        					} catch(err) {
        						//Ignore step
        					}
        				}
        			});
        
        		});
        
        	}
        
        }
        
        TouchUI.prototype.components.touchscreen = {
        
        	init: function () {
        		$("html").addClass("isTouchscreenUI");
        		
        		if (this.settings.isEpiphanyOrKweb) {
        			this.settings.hasTouch = false;
        			this.scroll.defaults.iScroll.disableTouch = true;
        			this.scroll.defaults.iScroll.disableMouse = false;
        		}
        		
        		this.settings.isTouchscreen(true);
        
        		if (this.settings.isEpiphanyOrKweb || this.settings.isChromiumArm) {
        			this.settings.hasFullscreen(false);
        		}
        		
        		$('.modal.fade').removeClass('fade');
        		$('#gcode_link').remove();
        
        		// Improve performace
        		this.scroll.defaults.iScroll.scrollbars = false;
        		this.scroll.defaults.iScroll.interactiveScrollbars = false;
        		this.scroll.defaults.iScroll.useTransition = false;
        		// this.scroll.defaults.iScroll.useTransform = false;
        		// this.scroll.defaults.iScroll.HWCompositing = false;
        
        		// Remove any links opening in a new tab
        		$('[target="_blank"]').each(function(ind, elm) {
        			$(elm)
        				.attr("target", "")
        				.on("click", function(e) {
        					return confirm("Do you want to navigate away from TouchUI?");
        				});
        		});
        	},
        
        	isLoading: function (viewModels) {
        
        		if(this.settings.isTouchscreen()) {
        			// Disable fancy functionality
        			if(viewModels.terminalViewModel.enableFancyFunctionality) { //TODO: check if 1.2.9 to not throw errors in 1.2.8<
        				 viewModels.terminalViewModel.enableFancyFunctionality(false);
        			}
        
        			// Disable GCodeViewer in touchscreen mode
        			if (viewModels.gcodeViewModel) {
        				console.info("TouchUI: GCodeViewer is disabled while TouchUI is active and in touchscreen mode.");
        				viewModels.gcodeViewModel.enabled = false;
        				viewModels.gcodeViewModel.initialize = _.noop;
        				viewModels.gcodeViewModel.clear = _.noop;
        				viewModels.gcodeViewModel._processData = _.noop;
        			}
        		}
        
        	}
        
        }
        
        TouchUI.prototype.core.init = function() {
        
        	// Migrate old cookies into localstorage
        	this.DOM.storage.migration.call(this);
        
        	// Bootup TouchUI if Touch, Small resolution or storage say's so
        	if (this.core.boot.call(this)) {
        
        		// Send Touchscreen loading status
        		if (window.top.postMessage) {
        			window.top.postMessage("loading", "*");
        		}
        
        		// Attach id for TouchUI styling
        		$("html").attr("id", this.settings.id);
        
        		// Force mobile browser to set the window size to their format
        		$('<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, user-scalable=no, minimal-ui">').appendTo("head");
        		$('<meta name="apple-mobile-web-app-capable" content="yes">').appendTo("head");
        		$('<meta name="mobile-web-app-capable" content="yes">').appendTo("head");
        
        		this.isActive(true);
        
        		// Enforce active cookie
        		this.DOM.storage.set("active", true);
        
        		// Create keyboard cookie if not existing
        		if (this.DOM.storage.get("keyboardActive") === undefined) {
        			if (!this.settings.hasTouch || this.settings.isChromiumArm) {
        				this.DOM.storage.set("keyboardActive", true);
        			} else {
        				this.DOM.storage.set("keyboardActive", false);
        			}
        		}
        
        		// Create hide navbar on click if not existing
        		if (this.DOM.storage.get("hideNavbarActive") === undefined) {
        			this.DOM.storage.set("hideNavbarActive", false);
        		}
        
        		// Treat KWEB3 as a special Touchscreen mode or enabled by cookie
        		if (
        			(
        				this.settings.isEpiphanyOrKweb || 
        				this.settings.isChromiumArm && 
        				this.DOM.storage.get("touchscreenActive") === undefined
        			) || 
        			this.DOM.storage.get("touchscreenActive")
        		) {
        			this.components.touchscreen.init.call(this);
        		}
        
        		// If TouchUI has been started through bootloader then initialize the process during reloads
        		if (this.settings.isChromiumArm && window.top.postMessage) {
        			window.onbeforeunload = function(event) {
        				window.top.postMessage("reset", "*");
        			};
        		}
        
        		// Get state of cookies and store them in KO
        		this.components.keyboard.isActive(this.DOM.storage.get("keyboardActive"));
        		this.animate.isHidebarActive(this.DOM.storage.get("hideNavbarActive"));
        		this.settings.isFullscreen($(document).fullScreen() !== false);
        	}
        
        }
        
        TouchUI.prototype.core.boot = function() {
        
        	// This should always start TouchUI
        	if(
        		document.location.hash === "#touch" ||
        		document.location.href.indexOf("?touch") > 0 ||
        		this.DOM.storage.get("active") ||
        		this.settings.isChromiumArm
        	) {
        
        		return true;
        
        	} else if(
        		this.DOM.storage.get("active") !== false
        	) {
        
        		if($(window).width() < 980 && this.settings.canBoot.resolution) {
        			return true;
        		}
        
        		if(this.settings.hasTouch && this.settings.canBoot.touch) {
        			return true;
        		}
        
        	}
        
        	return false;
        
        }
        
        TouchUI.prototype.core.bridge = function() {
        	var self = this;
        
        	this.core.bridge = {
        
        		allViewModels: {},
        		TOUCHUI_REQUIRED_VIEWMODELS: [
        			"terminalViewModel",
        			"connectionViewModel",
        			"settingsViewModel",
        			"softwareUpdateViewModel",
        			"controlViewModel",
        			"gcodeFilesViewModel",
        			"navigationViewModel",
        			"pluginManagerViewModel",
        			"temperatureViewModel",
        			"loginStateViewModel"
        		],
        		TOUCHUI_ELEMENTS: [
        			"#touchui_settings_dialog",
        			"#settings_plugin_touchui",
        			"#navbar_plugin_touchui"
        		],
        
        		domLoading: function() {
        			if (self.isActive()) {
        				self.scroll.beforeLoad.call(self);
        				self.DOM.init.call(self);
        
        				if (moment && moment.locale) {
        					// Overwrite the 'moment.locale' fuction and call original:
        					// The purpose is that we want to remove data before
        					// registering it to OctoPrint. Moment.locale is called
        					// just before this happens.
        					var old = moment.locale;
        					moment.locale = function() {
        						self.plugins.tempsGraph.call(self);
        						self.plugins.webcamTab.call(self);
        						self.plugins.autoBedLevel.call(self);
        						self.plugins.themify.call(self);
        						old.apply(moment, arguments);
        					};
        				}
        			}
        		},
        
        		domReady: function() {
        			if (self.isActive()) {
        
        				if($("#gcode").length > 0) {
        					self.core.bridge.TOUCHUI_REQUIRED_VIEWMODELS = self.core.bridge.TOUCHUI_REQUIRED_VIEWMODELS.concat(["gcodeViewModel"]);
        				}
        
        				self.components.dropdown.init.call(self);
        				self.components.fullscreen.init.call(self);
        				self.components.keyboard.init.call(self);
        				self.components.modal.init.call(self);
        				self.components.touchList.init.call(self);
        				self.components.slider.init.call(self);
        
        				self.scroll.init.call(self);
        			}
        		},
        
        		koStartup: function TouchUIViewModel(viewModels) {
        			self.core.bridge.allViewModels = _.object(self.core.bridge.TOUCHUI_REQUIRED_VIEWMODELS, viewModels);
        			self.knockout.isLoading.call(self, self.core.bridge.allViewModels);
        			return self;
        		}
        	}
        
        	return this.core.bridge;
        }
        
        TouchUI.prototype.core.less = {
        
        	options: {
        		template: {
        			importUrl:	"./plugin/touchui/static/less/touchui.bundled.less?t=" + new Date().getTime(),
        			import:		'@import "{importUrl}"; \n',
        			variables:	"@main-color: {mainColor}; \n" +
        						"@terminal-color: {termColor}; \n" +
        						"@text-color: {textColor}; \n" +
        						"@main-font-size: {fontSize}px; \n" +
        						"@main-background: {bgColor}; \n\n"
        		},
        		API: "./plugin/touchui/css"
        	},
        
        	save: function() {
        		var options = this.core.less.options;
        		var self = this;
        
        		if(self.settings.useCustomization()) {
        			if(self.settings.colors.useLocalFile()) {
        
        				$.get(options.API, {
        						path: self.settings.colors.customPath()
        					})
        					.done(function(response) {
        						self.core.less.render.call(self, options.template.import.replace("{importUrl}", options.template.importUrl) + response);
        					})
        					.error(function(error) {
        						self.core.less.error.call(self, error);
        					});
        
        			} else {
        
        				self.core.less.render.call(self, "" +
        					options.template.import.replace("{importUrl}", options.template.importUrl) +
        					options.template.variables.replace("{mainColor}", self.settings.colors.mainColor())
        						.replace("{termColor}", self.settings.colors.termColor())
        						.replace("{textColor}", self.settings.colors.textColor())
        						.replace("{bgColor}", self.settings.colors.bgColor())
        						.replace("{fontSize}", self.settings.colors.fontSize())
        				);
        
        			}
        		}
        	},
        
        	render: function(data) {
        		var self = this;
        		var callback = function(error, result) {
        
        				if (error) {
        					self.core.less.error.call(self, { responseText: 'Less parser: ' + error.message, status: 0 });
        					console.error(error);
        				} else {
        					result.css = result.css.replace(/mixin\:placeholder\;/g, '');
        
        					$.post(self.core.less.options.API, {
        							css: result.css
        						})
        						.done(function() {
        							self.settings.refreshCSS(true);
        							$(window).trigger('resize');
        						})
        						.fail(function(error) {
        							self.core.less.error.call(self, error);
        						});
        
        				}
        			}
        
        		if(window.less.render) {
        			window.less.render(data, {
        				compress: true
        			}, callback);
        		} else {
        			window.less.Parser({}).parse(data, function(error, result) {
        				if(result) {
        					result = {
        						css: result.toCSS({
        							compress: true
        						})
        					}
        				}
        				callback.call(this, error, result);
        			});
        		}
        	},
        
        	error: function(error) {
        		var content = error.responseText;
        		if(content && content.trim() && error.status !== 401) {
        			new PNotify({
        				title: 'TouchUI: Whoops, something went wrong...',
        				text: content,
        				icon: 'glyphicon glyphicon-question-sign',
        				type: 'error',
        				hide: false
        			});
        		}
        
        	}
        
        }
        
        TouchUI.prototype.core.version = {
        
        	init: function(softwareUpdateViewModel) {
        		var self = this;
        
        		$("<span></span>").appendTo("#terminal-output");
        
        		if(softwareUpdateViewModel) {
        
        			softwareUpdateViewModel.versions.items.subscribe(function(changes) {
        
        				var touchui = softwareUpdateViewModel.versions.getItem(function(elm) {
        					return (elm.key === "touchui");
        				}, true) || false;
        
        				if( touchui !== false && touchui.information !== null ) {
        					var remote = Number(touchui.information.remote.value.split('.').join('')),
        						local = Number(touchui.information.local.value.split('.').join(''));
        
        					if(remote > local) {
        						$("#touch_updates_css").remove();
        						$('head').append('<style id="touch_updates_css">#term pre span:first-child:before{ content: "v'+touchui.information.local.value+" outdated, new version: v"+touchui.information.remote.value+'" !important; }</style>');
        					} else {
        						if( $("#touch_updates_css").length === 0 ) {
        							$('head').append('<style id="touch_updates_css">#term pre span:first-child:before{ content: "v'+touchui.information.local.value+'" !important; }</style>');
        						}
        					}
        				}
        
        			});
        
        		}
        
        	}
        
        }
        
        TouchUI.prototype.DOM.init = function() {
        
        	// Create new tab with printer status and make it active
        	this.DOM.create.printer.init(this.DOM.create.tabbar);
        	this.DOM.create.printer.menu.$elm.find('a').trigger("click");
        
        	// Create a new persistent dropdown
        	this.DOM.create.dropdown.init.call( this.DOM.create.dropdown );
        
        	// Add a webcam tab if it's defined
        	if ($("#webcam_container").length > 0) {
        		this.DOM.create.webcam.init(this.DOM.create.tabbar);
        	}
        
        	// Move all other items from tabbar into dropdown
        	this.DOM.move.sidebar.init.call(this);
        	this.DOM.move.navbar.init.call(this);
        	this.DOM.move.tabbar.init.call(this);
        	this.DOM.move.afterTabAndNav.call(this);
        	this.DOM.move.overlays.init.call(this);
        	this.DOM.move.terminal.init.call(this);
        
        	// Move connection sidebar into a new modal
        	this.DOM.move.connection.init(this.DOM.create.tabbar);
        
        	// Manipulate controls div
        	this.DOM.move.controls.init();
        
        	// Disable these bootstrap/jquery plugins
        	this.DOM.overwrite.tabdrop.call(this);
        	this.DOM.overwrite.modal.call(this);
        	this.DOM.overwrite.pnotify.call(this);
        
        	// Add class with how many tab-items
        	$("#tabs, #navbar").addClass("items-" + $("#tabs li:not(.hidden_touch)").length);
        
        	// Remove active class when clicking on a tab in the tabbar
        	$('#tabs [data-toggle=tab]').on("click", function() {
        		$("#all_touchui_settings").removeClass("item_active");
        	});
        
        	// If touch emulator is enabled, then disable dragging of a menu item for scrolling
        	if(!this.settings.hasTouch) {
        		$("#navbar ul.nav > li a").on("dragstart drop", function(e) {
        			return false;
        		});
        	}
        }
        
        TouchUI.prototype.DOM.cookies = {
        
        	get: function(key, isPlain) {
        		var name = (isPlain) ? key + "=" : "TouchUI." + key + "=";
        		var ca = document.cookie.split(';');
        		var tmp;
        		for(var i=0; i<ca.length; i++) {
        			var c = ca[i];
        			while (c.charAt(0)==' ') c = c.substring(1);
        			if (c.indexOf(name) == 0) tmp = c.substring(name.length,c.length);
        			return (isPlain) ? tmp : $.parseJSON(tmp);
        			
        		}
        		return undefined;
        	},
        
        	set: function(key, value, isPlain) {
        		key = (isPlain) ? key + "=" : "TouchUI." + key + "=";
        		var d = new Date();
        		d.setTime(d.getTime()+(360*24*60*60*1000));
        		var expires = "expires="+d.toUTCString();
        		document.cookie = key + value + "; " + expires;
        	},
        
        	toggleBoolean: function(key, isPlain) {
        		var value = $.parseJSON(this.get(key, isPlain) || "false");
        
        		if(value === true) {
        			this.set(key, "false", isPlain);
        		} else {
        			this.set(key, "true", isPlain);
        		}
        
        		return !value;
        
        	}
        
        }
        
        TouchUI.prototype.DOM.localstorage = {
        	store: JSON.parse(localStorage["TouchUI"] || "{}"),
        
        	get: function (key) {
        		return this.store[key];
        	},
        
        	set: function (key, value) {
        		this.store[key] = value;
        		localStorage["TouchUI"] = JSON.stringify(this.store);
        		return this.store[key];
        	},
        
        	toggleBoolean: function (key) {
        		var value = this.store[key] || false;
        
        		if(value === true) {
        			this.set(key, false);
        		} else {
        			this.set(key, true);
        		}
        
        		return !value;
        
        	}
        
        }
        
        // Since I messed up by releasing start_kweb3.xinit without disabling private
        // mode, we now need to check if we can store anything at all in localstorage
        // the missing -P will prevent any localstorage
        if (TouchUI.prototype.settings.hasLocalStorage) {
        	try {
        		localStorage["TouchUIcanWeHazStorage"] = "true";
        		TouchUI.prototype.DOM.storage = TouchUI.prototype.DOM.localstorage;
        		delete localStorage["TouchUIcanWeHazStorage"];
        	} catch(err) {
        
        		// TODO: remove this is future
        		if(TouchUI.prototype.settings.isEpiphanyOrKweb) {
        			$(function() {
        				new PNotify({
        					type: 'error',
        					title: "Private Mode detection:",
        					text: "Edit the startup file 'start_kweb3.xinit' in '~/OctoPrint-TouchUI-autostart/' "+
        						"and add the parameter 'P' after the dash. \n\n" +
        						"For more information see the v0.3.3 release notes.",
        					hide: false
        				});
        			});
        		}
        
        		console.info("Localstorage defined but failback to cookies due to errors.");
        		TouchUI.prototype.DOM.storage = TouchUI.prototype.DOM.cookies;
        	}
        } else {
        	TouchUI.prototype.DOM.storage = TouchUI.prototype.DOM.cookies;
        }
        
        TouchUI.prototype.DOM.storage.migration = (TouchUI.prototype.DOM.storage === TouchUI.prototype.DOM.localstorage) ? function migration() {
        
        	if (this.settings.hasLocalStorage) {
        		if (document.cookie.indexOf("TouchUI.") !== -1) {
        			console.info("TouchUI cookies migration.");
        
        			var name = "TouchUI.";
        			var ca = document.cookie.split(';');
        			for (var i=0; i<ca.length; i++) {
        				var c = ca[i];
        				while (c.charAt(0)==' ') c = c.substring(1);
        				if (c.indexOf(name) == 0) {
        					var string = c.substring(name.length,c.length);
        					string = string.split("=");
        					var value = $.parseJSON(string[1]);
        
        					console.info("Saving cookie", string[0], "with value", value, "to localstorage.");
        					this.DOM.storage.set(string[0], value);
        
        					console.info("Removing cookie", string[0]);
        					document.cookie = "TouchUI." + string[0] + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        				}
        			}
        		}
        	}
        
        } : _.noop;
        
        TouchUI.prototype.knockout.bindings = function() {
        	var self = this;
        
        	this.bindings = {
        
        		toggleTouch: function() {
        			if (self.DOM.storage.toggleBoolean("active")) {
        				document.location.hash = "#touch";
        			} else {
        				document.location.hash = "";
        			}
        			document.location.reload();
        		},
        
        		toggleKeyboard: function() {
        			if (self.isActive()) {
        				self.components.keyboard.isActive(self.DOM.storage.toggleBoolean("keyboardActive"));
        			}
        		},
        
        		toggleHidebar: function() {
        			if (self.isActive()) {
        				self.animate.isHidebarActive(self.DOM.storage.toggleBoolean("hideNavbarActive"));
        			}
        		},
        
        		toggleFullscreen: function() {
        			$(document).toggleFullScreen();
        		},
        
        		toggleTouchscreen: function() {
        			if (self.isActive()) {
        				self.settings.isTouchscreen(self.DOM.storage.toggleBoolean("touchscreenActive"));
        				document.location.reload();
        			}
        		},
        
        		show: function() {
        			$('#touchui_settings_dialog').modal("show").trigger('click');
        		}
        
        	}
        
        }
        
        TouchUI.prototype.knockout.isLoading = function (viewModels) {
        	var self = this;
        
        	if(self.isActive()) {
        		self.components.touchscreen.isLoading.call(self, viewModels);
        
        		// Reload dimensions of webcam with onload event
        		// Legacy code from 1.3.3
        		// Fixes bug #78
        		if(viewModels.controlViewModel && viewModels.controlViewModel.updateRotatorWidth) {
        			$("#webcam_image").on("load", function() {
        				viewModels.controlViewModel.updateRotatorWidth();
        			});
        		}
        
        		// Prevent user from double clicking in a short period on buttons
        		$(document).on("click", "button:not(#login_button, .box, .distance, .dropdown-toggle, .btn-input-inc, .btn-input-dec, .temperature_target .btn-group button)", function(e) {
        			var printer = $(e.target);
        			printer.prop('disabled', true);
        
        			setTimeout(function() {
        				printer.prop('disabled', false);
        			}, 600);
        		});
        
        		// Update scroll area if new items arrived
        		if( !self.settings.hasTouch ) {
        			viewModels.gcodeFilesViewModel.listHelper.paginatedItems.subscribe(function(a) {
        				setTimeout(function() {
        					self.scroll.iScrolls.body.refresh();
        				}, 300);
        			});
        		}
        
        		// Watch the operational binder for visual online/offline
        		viewModels.connectionViewModel.isOperational.subscribe(function(newOperationalState) {
        			var printLink = $("#all_touchui_settings");
        			if( !newOperationalState ) {
        				printLink.addClass("offline").removeClass("online");
        				$("#conn_link2").addClass("offline").removeClass("online");
        			} else {
        				printLink.removeClass("offline").addClass("online");
        				$("#conn_link2").removeClass("offline").addClass("online");
        				$('#connection_dialog').modal('hide');
        			}
        		});
        	}
        
        	// Check if we can show whats new in this version
        	self.settings.whatsNew.subscribe(function(whatsNew) {
        		if(whatsNew !== false && whatsNew.trim() != "") {
        			new PNotify({
        				title: 'TouchUI: What\'s new?',
        				text: whatsNew,
        				icon: 'glyphicon glyphicon-question-sign',
        				type: 'info',
        				hide: false
        			});
        		}
        	});
        
        }
        
        TouchUI.prototype.knockout.isReady = function (viewModels) {
        	var self = this;
        
        	if(self.isActive()) {
        		// Repaint graph after resize (.e.g orientation changed)
        		$(window).on("resize", function() {
        			viewModels.temperatureViewModel.updatePlot();
        		});
        
        		// Remove slimScroll from files list
        		$('.gcode_files').slimScroll({destroy: true});
        		$('.slimScrollDiv').slimScroll({destroy: true});
        
        		// Remove active keyboard when disabled
        		self.components.keyboard.isActive.subscribe(function(isActive) {
        			if( !isActive ) {
        				$(".ui-keyboard-input").each(function(ind, elm) {
        					$(elm).data("keyboard").destroy();
        				});
        			}
        		});
        
        		// Remove drag files into website feature
        		$(document).off("drag");
        		$(document).off("dragover");
        		if(viewModels.gcodeFilesViewModel && viewModels.gcodeFilesViewModel._enableDragNDrop) {
        			viewModels.gcodeFilesViewModel._enableDragNDrop(false);
        			viewModels.gcodeFilesViewModel._enableDragNDrop = function() {};
        			viewModels.gcodeFilesViewModel._forceEndDragNDrop = function() {};
        		}
        
        		// Hide the dropdown after login
        		viewModels.settingsViewModel.loginState.loggedIn.subscribe(function(isLoggedIn) {
        			if(isLoggedIn && $(".open > .dropdown-menu").length > 0) {
        				$(document).trigger("click");
        			}
        		});
        
        		// Redo scroll-to-end interface
        		$("#term .terminal small.pull-right").html('<a href="#"><i class="fa fa-angle-double-down"></i></a>').on("click", function() {
        			viewModels.terminalViewModel.scrollToEnd();
        			return false;
        		});
        
        		// Resize height of low-fi terminal to enable scrolling
        		if($("#terminal-output-lowfi").prop("scrollHeight")) {
        			viewModels.terminalViewModel.plainLogOutput.subscribe(function() {
        				$("#terminal-output-lowfi").height($("#terminal-output-lowfi").prop("scrollHeight"));
        			});
        		}
        
        		// Overwrite terminal knockout functions (i.e. scroll to end)
        		this.scroll.overwrite.call(this, viewModels.terminalViewModel);
        
        		// Setup version tracking in terminal
        		this.core.version.init.call(this, viewModels.softwareUpdateViewModel);
        
        		// (Re-)Apply bindings to the new webcam div
        		if($("#webcam").length) {
        			ko.applyBindings(viewModels.controlViewModel, $("#webcam")[0]);
        		}
        
        		// (Re-)Apply bindings to the new navigation div
        		if($("#navbar_login").length) {
        			try {
        				ko.applyBindings(viewModels.navigationViewModel, $("#navbar_login")[0]);
        			} catch(err) {}
        
        			viewModels.navigationViewModel.loginState.loggedIn.subscribe(function() {
        				// Refresh scroll view when login state changed
        				if( !self.settings.hasTouch ) {
        					setTimeout(function() {
        						self.scroll.currentActive.refresh();
        					}, 0);
        				}
        			});
        		}
        
        		// (Re-)Apply bindings to the new system commands div
        		if($("#navbar_systemmenu").length) {
        			ko.applyBindings(viewModels.navigationViewModel, $("#navbar_systemmenu")[0]);
        			ko.applyBindings(viewModels.navigationViewModel, $("#divider_systemmenu")[0]);
        		}
        
        		// Force knockout to read the change
        		$('.colorPicker').tinycolorpicker().on("change", function(e, hex, rgb, isTriggered) {
        			if(isTriggered !== false) {
        				$(this).find("input").trigger("change", [hex, rgb, false]);
        			}
        		});
        
        		// Reuse for code below
        		var refreshUrl = function(href) {
        			return href.split("?")[0] + "?ts=" + new Date().getTime();
        		}
        
        		// Reload CSS if needed
        		self.settings.refreshCSS.subscribe(function(hasRefresh) {
        			if (hasRefresh || hasRefresh === "fast") {
        				// Wait 2 seconds, so we're not too early
        				setTimeout(function() {
        					var $css = $("#touchui-css");
        					$css.attr("href", refreshUrl($css.attr("href")));
        					self.settings.refreshCSS(false);
        				}, (hasRefresh === "fast") ? 0 : 1200);
        			}
        		});
        
        		// Reload CSS or LESS after saving our settings
        		self.settings.hasCustom.subscribe(function(customCSS) {
        			if(customCSS !== "") {
        				var $css = $("#touchui-css");
        				var href = $css.attr("href");
        
        				if(customCSS) {
        					href = href.replace("touchui.css", "touchui.custom.css");
        				} else {
        					href = href.replace("touchui.custom.css", "touchui.css");
        				}
        
        				$css.attr("href", refreshUrl(href));
        			}
        		});
        
        		// Check if we need to update an old LESS file with a new LESS one
        		var requireNewCSS = ko.computed(function() {
        			return self.settings.requireNewCSS() && viewModels.loginStateViewModel.isAdmin();
        		});
        		requireNewCSS.subscribe(function(requireNewCSS) {
        			if(requireNewCSS) {
        				setTimeout(function() {
        					self.core.less.save.call(self, self);
        				}, 100);
        			}
        		});
        		
        		// Evuluate computed subscriber defined above:
        		// In OctoPrint >1.3.5 the settings will be defined upfront
        		requireNewCSS.notifySubscribers(self.settings.requireNewCSS() && viewModels.loginStateViewModel.isAdmin());
        		
        		//TODO: move this
        		$("li.dropdown#navbar_login > a.dropdown-toggle").off("click").on("click", function(e) {
        			e.stopImmediatePropagation();
        			e.preventDefault();
        
        			$(this).parent().toggleClass("open");
        		});
        		
        		if (window.top.postMessage) {
        			// Tell bootloader we're ready with giving him the expected version for the bootloader
        			// if version is lower on the bootloader, then the bootloader will throw an update msg
        			window.top.postMessage(self.settings.requiredBootloaderVersion, "*");
        			
        			// Sync customization with bootloader
        			window.top.postMessage([true, $("#navbar").css("background-color"), $("body").css("background-color")], "*");
        			
        			// Stop watching for errors
        			$(window).off("error.touchui");
        			
        			// Trigger wake-up for iScroll
        			if(window.dispatchEvent) {
        				window.dispatchEvent(new Event('resize'));
        			}
        		}
        	}
        }
        
        TouchUI.prototype.knockout.viewModel = function() {
        	var self = this;
        
        	// Subscribe to OctoPrint events
        	self.onStartupComplete = function () {
        		if (self.isActive()) {
        			self.DOM.overwrite.tabbar.call(self);
        		}
        		self.knockout.isReady.call(self, self.core.bridge.allViewModels);
        		if (self.isActive()) {
        			self.plugins.init.call(self, self.core.bridge.allViewModels);
        		}
        	}
        
        	self.onBeforeBinding = function() {
        		ko.mapping.fromJS(self.core.bridge.allViewModels.settingsViewModel.settings.plugins.touchui, {}, self.settings);
        	}
        
        	self.onSettingsBeforeSave = function() {
        		self.core.less.save.call(self);
        	}
        
        	self.onTabChange = function() {
        		if (self.isActive()) {
        			self.animate.hide.call(self, "navbar");
        
        			if(!self.settings.hasTouch && self.scroll.currentActive) {
        				self.scroll.currentActive.refresh();
        				setTimeout(function() {
        					self.scroll.currentActive.refresh();
        				}, 0);
        			}
        		}
        	}
        }
        
        TouchUI.prototype.plugins.init = function (viewModels) {
        	this.plugins.screenSquish(viewModels.pluginManagerViewModel);
        }
        
        TouchUI.prototype.plugins.autoBedLevel = function() {
        
        	_.remove(OCTOPRINT_VIEWMODELS, function(obj) {
        		if (obj && obj.construct && obj.construct.name && obj.construct.name === "AblExpertViewModel") {
        			console.info("TouchUI: AblExpert is disabled while TouchUI is active.");
        
        			$('#settings_plugin_ABL_Expert').hide();
        			$('#settings_plugin_ABL_Expert_link').hide();
        			$('#processing_dialog_plugin_ABL_Expert').hide();
        			$('#results_dialog_plugin_ABL_Expert').hide();
        
        			return true;
        		}
        		
        		return false;
        	});
        }
        
        TouchUI.prototype.plugins.navbarTemp = function() {}
        
        TouchUI.prototype.plugins.psuControl = function() {
        
        	// Manually move navbar temp (hard move)
        	if( $("#navbar_plugin_psucontrol a").length > 0 ) {
        		$("#navbar_plugin_psucontrol a")
        			.text('PSU Control');
        	}
        
        }
        
        TouchUI.prototype.plugins.screenSquish = function(pluginManagerViewModel) {
        	var shown = false;
        
        	pluginManagerViewModel.plugins.items.subscribe(function() {
        
        		var ScreenSquish = pluginManagerViewModel.plugins.getItem(function(elm) {
        			return (elm.key === "ScreenSquish");
        		}, true) || false;
        
        		if(!shown && ScreenSquish && ScreenSquish.enabled) {
        			shown = true;
        			new PNotify({
        				title: 'TouchUI: ScreenSquish is running',
        				text: 'Running ScreenSquish and TouchUI will give issues since both plugins try the same, we recommend turning off ScreenSquish.',
        				icon: 'glyphicon glyphicon-question-sign',
        				type: 'error',
        				hide: false,
        				confirm: {
        					confirm: true,
        					buttons: [{
        						text: 'Disable ScreenSquish',
        						addClass: 'btn-primary',
        						click: function(notice) {
        							if(!ScreenSquish.pending_disable) {
        								pluginManagerViewModel.togglePlugin(ScreenSquish);
        							}
        							notice.remove();
        						}
        					}]
        				},
        			});
        		}
        
        	});
        
        };
        
        TouchUI.prototype.plugins.tempsGraph = function() {
        
        	_.remove(OCTOPRINT_VIEWMODELS, function(obj) {
        		if (obj[0] && obj[0].name === "TempsgraphViewModel") {
        			console.info("TouchUI: TempsGraph is disabled while TouchUI is active.");
        			return true;
        		}
        		
        		return false;
        	});
        
        }
        
        TouchUI.prototype.plugins.themify = function() {
        
        	_.remove(OCTOPRINT_VIEWMODELS, function(obj) {
        		if (obj[2] && obj[2].indexOf("#settings_plugin_themeify") !== -1) {
        			console.info("TouchUI: Themeify is disabled while TouchUI is active.");
        			return true;
        		}
        		
        		return false;
        	});
        
        }
        
        TouchUI.prototype.plugins.webcamTab = function() {
        
        	_.remove(OCTOPRINT_VIEWMODELS, function(obj) {
        		if (obj && obj.construct && obj.construct.name && obj.construct.name === "WebcamTabViewModel") {
        			console.info("TouchUI: WebcamTab is disabled while TouchUI is active.");
        			$('#tab_plugin_webcamtab_link, #tab_plugin_webcamtab').remove();
        			return true;
        		}
        		
        		return false;
        	});
        
        }
        
        TouchUI.prototype.scroll.beforeLoad = function() {
        
        	// Manipulate DOM for iScroll before knockout binding kicks in
        	if (!this.settings.hasTouch) {
        		$('<div id="scroll"></div>').insertBefore('.page-container');
        		$('.page-container').appendTo("#scroll");
        	}
        
        }
        
        TouchUI.prototype.scroll.init = function() {
        	var self = this;
        
        	if ( this.settings.hasTouch ) {
        		var width = $(window).width();
        
        		// Covert VH to the initial height (prevent height from jumping when navigation bar hides/shows)
        		$("#temperature-graph").parent().height($("#temperature-graph").parent().outerHeight());
        		$("#terminal-scroll").height($("#terminal-scroll").outerHeight());
        		$("#terminal-sendpanel").css("top", $("#terminal-scroll").outerHeight()-1);
        
        		$(window).on("resize", function() {
        
        			if(width !== $(window).width()) {
        				$("#temperature-graph").parent().height($("#temperature-graph").parent().outerHeight());
        				$("#terminal-scroll").css("height", "").height($("#terminal-scroll").outerHeight());
        				$("#terminal-sendpanel").css("top", $("#terminal-scroll").outerHeight()-1);
        				width = $(window).width();
        			}
        
        
        		});
        
        	} else {
        
        		// Set overflow hidden for best performance
        		$("html").addClass("emulateTouch");
        
        		self.scroll.terminal.init.call(self);
        		self.scroll.body.init.call(self);
        		self.scroll.modal.init.call(self);
        		self.scroll.overlay.init.call(self);
        
        		$(document).on("slideCompleted", function() {
        			self.scroll.currentActive.refresh();
        		});
        
        		// Refresh body on dropdown click
        		$(document).on("click", ".pagination ul li a", function() {
        			setTimeout(function() {
        				self.scroll.currentActive.refresh();
        			}, 0);
        		});
        
        	}
        
        }
        
        TouchUI.prototype.scroll.blockEvents = {
        	className: "no-pointer",
        
        	scrollStart: function($elm, iScrollInstance) {
        		$elm.addClass(this.className);
        	},
        
        	scrollEnd: function($elm, iScrollInstance) {
        		$elm.removeClass(this.className);
        		iScrollInstance.refresh();
        	}
        
        }
        
        TouchUI.prototype.scroll.body = {
        
        	init: function() {
        		var self = this;
        		var scrollStart = false;
        		var $noPointer = $('.page-container');
        
        		// Create main body scroll
        		self.scroll.iScrolls.body = new IScroll("#scroll", self.scroll.defaults.iScroll);
        		self.scroll.currentActive = self.scroll.iScrolls.body;
        
        		// Block everthing while scrolling
        		var scrollStart = self.scroll.blockEvents.scrollStart.bind(self.scroll.blockEvents, $noPointer, self.scroll.iScrolls.body),
        			scrollEnd = self.scroll.blockEvents.scrollEnd.bind(self.scroll.blockEvents, $noPointer, self.scroll.iScrolls.body);
        
        		// Disable all JS events while scrolling for best performance
        		self.scroll.iScrolls.body.on("scrollStart", scrollStart);
        		self.scroll.iScrolls.body.on("onBeforeScrollStart", scrollStart);
        		self.scroll.iScrolls.body.on("scrollEnd", scrollEnd);
        		self.scroll.iScrolls.body.on("scrollCancel", scrollEnd);
        
        		// Prevent any misfortune
        		$(document).on("mouseup.prevent.pointer touchend.prevent.pointer", function() {
        			$noPointer.removeClass('no-pointer');
        		});
        
        	}
        
        }
        
        TouchUI.prototype.scroll.modal = {
        	stack: [],
        	dropdown: null,
        
        	init: function() {
        		var $document = $(document),
        			self = this;
        
        		$document.on("modal.touchui", function(e, elm) {
        			var $modalElm = $(elm),
        				$modalContainer = $(elm).parent();
        
        			// Create temp iScroll within the modal
        			var curModal = new IScroll($modalContainer[0], self.scroll.defaults.iScroll);
        
        			// Store into stack
        			self.scroll.modal.stack.push(curModal);
        			self.scroll.currentActive = curModal;
        
        			// Force iScroll to get the correct scrollHeight
        			setTimeout(function() {
        				if(curModal) {
        					curModal.refresh();
        				}
        			}, 0);
        			// And Refresh again after animation
        			setTimeout(function() {
        				if(curModal) {
        					curModal.refresh();
        				}
        			}, 800);
        
        			// Store bindings into variable for future reference
        			var scrollStart = self.scroll.blockEvents.scrollStart.bind(self.scroll.blockEvents, $modalElm, curModal),
        				scrollEnd = self.scroll.blockEvents.scrollEnd.bind(self.scroll.blockEvents, $modalElm, curModal);
        
        			// Disable all JS events while scrolling for best performance
        			curModal.on("scrollStart", scrollStart);
        			curModal.on("scrollEnd", scrollEnd);
        			curModal.on("scrollCancel", scrollEnd);
        
        			// Refresh the scrollHeight and scroll back to top with these actions:
        			$document.on("click.scrollHeightTouchUI", '[data-toggle="tab"], .pagination ul li a', function(e) {
        				curModal._end(e);
        
        				setTimeout(function() {
        					curModal.refresh();
        					curModal.scrollTo(0, 0);
        				}, 0);
        			});
        
        			// Kill it with fire!
        			$modalElm.one("destroy", function() {
        				$document.off("click.scrollHeightTouchUI");
        				self.scroll.modal.stack.pop();
        
        				if(self.scroll.modal.stack.length > 0) {
        					self.scroll.currentActive = self.scroll.modal.stack[self.scroll.modal.stack.length-1];
        				} else {
        					self.scroll.currentActive = self.scroll.iScrolls.body;
        				}
        
        				curModal.destroy();
        				curModal.off("scrollStart", scrollStart);
        				curModal.off("scrollEnd", scrollEnd);
        				curModal.off("scrollCancel", scrollEnd);
        				curModal = undefined;
        			});
        
        		});
        
        		// Triggered when we create the dropdown and need scrolling
        		$document.on("dropdown-open.touchui", function(e, elm) {
        			var $elm = $(elm);
        
        			// Create dropdown scroll
        			self.scroll.modal.dropdown = new IScroll(elm, {
        				scrollbars: true,
        				mouseWheel: true,
        				interactiveScrollbars: true,
        				shrinkScrollbars: "scale"
        			});
        
        			// Set scroll to active item
        			self.scroll.modal.dropdown.scrollToElement($elm.find('li.active')[0], 0, 0, -30);
        
        			// Disable scrolling in active modal
        			self.scroll.modal.stack[self.scroll.modal.stack.length-1].disable();
        
        			// Store bindings into variable for future reference
        			var scrollStart = self.scroll.blockEvents.scrollStart.bind(self.scroll.blockEvents, $elm, self.scroll.modal.dropdown),
        				scrollEnd = self.scroll.blockEvents.scrollEnd.bind(self.scroll.blockEvents, $elm, self.scroll.modal.dropdown);
        
        			// Disable all JS events for smooth scrolling
        			self.scroll.modal.dropdown.on("scrollStart", scrollStart);
        			self.scroll.modal.dropdown.on("scrollEnd", scrollEnd);
        			self.scroll.modal.dropdown.on("scrollCancel", scrollEnd);
        
        			$document.on("dropdown-closed.touchui", function() {
        				// Enable active modal
        				self.scroll.modal.stack[self.scroll.modal.stack.length-1].enable();
        
        				self.scroll.modal.dropdown.off("scrollStart", scrollStart);
        				self.scroll.modal.dropdown.off("scrollEnd", scrollEnd);
        				self.scroll.modal.dropdown.off("scrollCancel", scrollEnd);
        			});
        
        		});
        
        	}
        }
        
        TouchUI.prototype.scroll.overlay = {
        
        	mainItems: ['#offline_overlay', '#reloadui_overlay'],
        	init: function() {
        		var self = this;
        
        		self.scroll.iScrolls.overlay = [];
        
        		var $items = $(this.scroll.overlay.mainItems);
        		$items.each(function(ind, elm) {
        			var child = $(elm).children("#" + $(elm).attr("id") + "_wrapper");
        			var div = $('<div></div>').prependTo(elm);
        			child.appendTo(div);
        
        			$(elm).addClass("iscroll");
        
        			self.scroll.iScrolls.overlay[ind] = new IScroll(elm, self.scroll.defaults.iScroll);
        		});
        
        	},
        
        	refresh: function() {
        		var self = this;
        
        		setTimeout(function() {
        			$.each(self.scroll.iScrolls.overlay, function(ind) {
        				self.scroll.iScrolls.overlay[ind].refresh();
        			});
        		}, 0);
        
        	}
        
        }
        
        TouchUI.prototype.scroll.overwrite = function(terminalViewModel) {
        	var self = this;
        
        	if ( !this.settings.hasTouch ) {
        
        		// Enforce no scroll jumping
        		$("#scroll").on("scroll", function() {
        			if($("#scroll").scrollTop() !== 0) {
        				$("#scroll").scrollTop(0);
        			}
        		});
        
        		// Refresh terminal scroll height
        		terminalViewModel.displayedLines.subscribe(function() {
        			self.scroll.iScrolls.terminal.refresh();
        		});
        
        		// Overwrite scrollToEnd function with iScroll functions
        		terminalViewModel.scrollToEnd = function() {
        			self.scroll.iScrolls.terminal.refresh();
        			self.scroll.iScrolls.terminal.scrollTo(0, self.scroll.iScrolls.terminal.maxScrollY);
        		};
        
        		// Overwrite orginal helper, add one step and call the orginal function
        		var showOfflineOverlay = window.showOfflineOverlay;
        		window.showOfflineOverlay = function(title, message, reconnectCallback) {
        			showOfflineOverlay.call(this, title, message, reconnectCallback);
        			self.scroll.overlay.refresh.call(self);
        		};
        
        		// Overwrite orginal helper, add one step and call the orginal function
        		var showConfirmationDialog = window.showConfirmationDialog;
        		window.showConfirmationDialog = function(message, onacknowledge) {
        			self.scroll.iScrolls.body.scrollTo(0, 0, 500);
        			showConfirmationDialog.call(this, message, onacknowledge);
        		};
        
        		// Overwrite orginal helper, add one step and call the orginal function
        		var showReloadOverlay = $.fn.show;
        		$.fn.show = function(e,r,i) {
        			if($(this).hasClass("iscroll")) {
        				setTimeout(function() {
        					self.scroll.overlay.refresh.call(self);
        				}, 0);
        			}
        
        			return showReloadOverlay.call(this,e,r,i);
        		}
        
        	} else {
        
        		// Overwrite scrollToEnd function with #terminal-scroll as scroller
        		terminalViewModel.scrollToEnd = function() {
        			var $container = $("#terminal-scroll");
        			if ($container.length) {
        				$container.scrollTop($container[0].scrollHeight - $container.height())
        			}
        		}
        
        	}
        }
        
        TouchUI.prototype.scroll.terminal = {
        
        	init: function() {
        		var self = this;
        
        		// Create scrolling for terminal
        		self.scroll.iScrolls.terminal = new IScroll("#terminal-scroll", self.scroll.defaults.iScroll);
        
        		// Enforce the right scrollheight and disable main scrolling if we have a scrolling content
        		self.scroll.iScrolls.terminal.on("beforeScrollStart", function() {
        			self.scroll.iScrolls.terminal.refresh();
        
        			if(this.hasVerticalScroll) {
        				self.scroll.iScrolls.body.disable();
        			}
        		});
        		self.scroll.iScrolls.terminal.on("scrollEnd", function() {
        			self.scroll.iScrolls.body.enable();
        		});
        
        	}
        }
        
        TouchUI.prototype.DOM.create.dropdown = {
        
        	menuItem: {
        		cloneTo: $('#navbar ul.nav')
        	},
        	container: null,
        
        	init: function() {
        
        		this.menuItem.menu = $('' +
        			'<li id="all_touchui_settings" class="dropdown">' +
        				'<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
        					$('navbar_show_settings').text() || $('navbar_show_settings').attr("title") +
        				'</a>' +
        			'</li>').prependTo(this.menuItem.cloneTo);
        
        		this.container = $('<ul class="dropdown-menu"></ul>').appendTo(this.menuItem.menu);
        	}
        
        }
        
        TouchUI.prototype.DOM.create.printer = {
        
        	menu: {
        		cloneTo: "#tabs"
        	},
        
        	container: {
        		cloneTo: "#temp"
        	},
        
        	move: {
        		$state: $("#state_wrapper"),
        		$files: $("#files_wrapper")
        	},
        
        	init: function( tabbar ) {
        		this.menu.$elm = tabbar.createItem("print_link", "printer", "tab").prependTo(this.menu.cloneTo);
        		this.container.$elm = $('<div id="printer" class="tab-pane active"><div class="row-fluid"></div></div>').insertBefore(this.container.cloneTo);
        
        		// Move the contents of the hidden accordions to the new print status and files tab
        		this.move.$state.appendTo(this.container.$elm.find(".row-fluid"));
        		this.move.$files.insertAfter(this.container.$elm.find(".row-fluid #state_wrapper"));
        
        		// Create an upload button in the header
        		$('<div class="upload-trigger accordion-heading-button btn-group" data-bind="enable: $root.loginState.isUser(), css: {disabled: !$root.loginState.isUser()}">' +
        			'<a href="#" title="' + $('.upload-buttons .fileinput-button:first-child > span').text()  +'">' +
        				'<i class="fa fa-upload"></i>' +
        			'</a>' +
        		'</div>')
        			.appendTo('#files_wrapper .accordion-heading')
        			.find('a[href="#"]')
        			.on('click', function(e) {
        				e.preventDefault();
        				$('#gcode_upload').click();
        			});
        	}
        
        }
        
        TouchUI.prototype.DOM.create.tabbar = {
        
        	createItem: function(itemId, linkId, toggle, text) {
        		text = (text) ? text : "";
        		return $('<li id="'+itemId+'"><a href="#'+linkId+'" data-toggle="'+toggle+'">'+text+'</a></li>');
        
        	}
        }
        
        TouchUI.prototype.DOM.create.webcam = {
        
        	menu: {
        		webcam: {
        			cloneTo: "#tabs #control_link"
        		}
        	},
        
        	container: {
        		cloneTo: "#tabs + .tab-content",
        
        		webcam: {
        			$container: $("#webcam_container"),
        			cloneTo: "#webcam"
        		}
        	},
        
        	init: function( tabbar ) {
        		this.container.$elm = $('<div id="webcam" class="tab-pane"></div>').appendTo(this.container.cloneTo);
        		this.menu.webcam.$elm = tabbar.createItem("webcam_link", "webcam", "tab").insertAfter(this.menu.webcam.cloneTo).find('a').text('Webcam');
        
        		this.container.webcam.$container.next().appendTo(this.container.webcam.cloneTo);
        		this.container.webcam.$container.prependTo(this.container.webcam.cloneTo);
        
        		$('<!-- ko allowBindings: false -->').insertBefore(this.container.$elm);
        		$('<!-- /ko -->').insertAfter(this.container.$elm);
        
        		$("#webcam_container").attr("data-bind", $("#webcam_container").attr("data-bind").replace("keydown: onKeyDown, ", ""));
        		$("#webcam_image").on("mousedown", function(e) {
        			e.preventDefault();
        		});
        	}
        
        }
        
        TouchUI.prototype.DOM.move.afterTabAndNav = function() {
        
        	this.DOM.create.dropdown.container.children().each(function(ind, elm) {
        		var $elm = $(elm);
        		$('<!-- ko allowBindings: false -->').insertBefore($elm);
        		$('<!-- /ko -->').insertAfter($elm);
        	});
        
        	//Add hr before the settings icon
        	$('<li class="divider"></li>').insertBefore("#navbar_settings");
        	$('<li class="divider" id="divider_systemmenu" style="display: none;"></li>').insertBefore("#navbar_systemmenu").attr("data-bind", $("#navbar_systemmenu").attr("data-bind"));
        
        	if ($("#touchui_text_nonlink_container").length > 0) {
        		$('<li class="divider"></li>').insertBefore($("#touchui_text_nonlink_container").parent());
        	}
        }
        
        TouchUI.prototype.DOM.move.connection = {
        	$container: null,
        	containerId: "connection_dialog",
        	$cloneContainer: $("#usersettings_dialog"),
        	$cloneModal: $("#connection_wrapper"),
        	cloneTo: "#all_touchui_settings > ul",
        
        	init: function( tabbar ) {
        		var text = this.$cloneModal.find(".accordion-heading").text().trim();
        
        		// Clone usersettings modal
        		this.$container = this.$cloneContainer.clone().attr("id", this.containerId).insertAfter(this.$cloneContainer);
        		this.$containerBody = this.$container.find(".modal-body");
        
        		// Remove all html from clone
        		this.$containerBody.html("");
        
        		// Append tab contents to modal
        		this.$cloneModal.appendTo(this.$containerBody);
        
        		// Set modal header to accordion header
        		this.$container.find(".modal-header h3").text(text);
        
        		// Create a link in the dropdown
        		this.$menuItem = tabbar.createItem("conn_link2", this.containerId, "modal", text)
        			.attr("data-bind", "visible: loginState.isAdmin")
        			.prependTo(this.cloneTo);
        	}
        }
        
        TouchUI.prototype.DOM.move.controls = {
        
        	init: function() {
        
        		// backward compatibility with <1.3.0
        		if($('#control-jog-feedrate').length === 0) {
        			var jogPanels = $('#control > .jog-panel');
        
        			$(jogPanels[0]).find(".jog-panel:nth-child(1)").attr("id", "control-jog-xy");
        			$(jogPanels[0]).find(".jog-panel:nth-child(2)").attr("id", "control-jog-z");
        			$(jogPanels[1]).attr("id", "control-jog-extrusion");
        			$(jogPanels[2]).attr("id", "control-jog-general");
        
        			$('<div class="jog-panel" id="control-jog-feedrate"></div>').insertAfter($(jogPanels[2]));
        			$(jogPanels[0]).find("> button:last-child").prependTo("#control-jog-feedrate");
        			$(jogPanels[0]).find("> input:last-child").prependTo("#control-jog-feedrate");
        			$(jogPanels[0]).find("> .slider:last-child").prependTo("#control-jog-feedrate");
        
        		}
        
        		$("#control-jog-feedrate").attr("data-bind", $("#control-jog-extrusion").data("bind")).insertAfter("#control-jog-extrusion");
        		$("#control-jog-extrusion button:last-child").prependTo("#control-jog-feedrate");
        		$("#control-jog-extrusion input:last-child").prependTo("#control-jog-feedrate");
        		$("#control-jog-extrusion .slider:last-child").prependTo("#control-jog-feedrate");
        
        		$("#control div.distance").prependTo("#control-jog-feedrate");
        		$("#control-jog-feedrate").insertBefore("#control-jog-extrusion");
        
        	}
        
        }
        
        TouchUI.prototype.DOM.move.navbar = {
        	mainItems: ['#all_touchui_settings', '#navbar_login', '.hidden_touch', '#touchui_auto_load_touch', '#touchui_auto_load_resolution'],
        	init: function() {
        
        		var $items = $("#navbar ul.nav > li:not("+this.DOM.move.navbar.mainItems+")");
        		var hasTextLinks = false;
        		$($items.get().reverse()).each(function(ind, elm) {
        			var $elm = $(elm);
        
        			if($elm.children('a').length > 0) {
        				var elme = $elm.children('a')[0];
        
        				$elm.prependTo(this.DOM.create.dropdown.container);
        
        				$.each(elme.childNodes, function(key, node) {
        					if(node.nodeName === "#text") {
        						node.nodeValue = node.nodeValue.trim();
        					}
        				});
        
        				if(!$(elme).text()) {
        					if(!$(elme).text()) {
        						$(elme).text($(elme).attr('title'));
        					}
        				}
        			} else {
        				if(!hasTextLinks) {
        					hasTextLinks = true;
        					$('<li><ul id="touchui_text_nonlink_container"></ul></li>').appendTo(this.DOM.create.dropdown.container);
        				}
        
        				$elm.appendTo("#touchui_text_nonlink_container");
        			}
        		}.bind(this));
        
        		$(document).on('click', function(elm) {
        			if($(elm.target).parents('#tabs').length > 0) {
        				$('#tabs .itemActive').removeClass('itemActive');
        				$(elm.target).addClass('itemActive');
        			}
        		});
        
        		$('[href="'+document.location.hash+'"]').addClass('itemActive');
        
        		// Move TouchUI to main dropdown
        		$("#navbar_plugin_touchui").insertAfter("#navbar_settings");
        
        		// Create and Move login form to main dropdown
        		$('<li><ul id="youcanhazlogin"></ul></li>').insertAfter("#navbar_plugin_touchui");
        		
        		$('#navbar_login')
        			.appendTo('#youcanhazlogin')
        			.find('a.dropdown-toggle')
        			.text($('#youcanhazlogin').find('a.dropdown-toggle').text().trim())
        			.attr("data-bind", "visible: !loginState.loggedIn()");
        
        		// Create a fake dropdown link that will be overlapped by settings icon
        		$('<li id="touchui_dropdown_link"><a href="#"></a></li>').appendTo("#tabs");
        		
        		// Move the navbar temp plugin
        		this.plugins.psuControl.call(this);
        	}
        
        }
        
        TouchUI.prototype.DOM.move.overlays = {
        
        	mainItems: ['#offline_overlay', '#reloadui_overlay', '#drop_overlay'],
        	init: function() {
        
        		$(this.DOM.move.overlays.mainItems).each(function(ind, elm) {
        			var $elm = $(elm);
        			$elm.appendTo('body');
        		}.bind(this));
        
        	}
        
        }
        
        TouchUI.prototype.DOM.move.sidebar = {
        
        	items: ".octoprint-container > .row > .accordion > div",
        
        	menu: {
        		cloneTo: "#tabs"
        	},
        
        	container: {
        		cloneTo: "#temp"
        	},
        
        	doNotMove: [
        		'#sidebar_plugin_printer_safety_check_wrapper',
        		'#connection_wrapper'
        	],
        
        	init: function() {
        		var tabbar = this.DOM.create.tabbar;
        		$(this.DOM.move.sidebar.items + ':not(' + this.DOM.move.sidebar.doNotMove + ')').each(function(ind, elm) {
        			var id = $(elm).attr('id');
        			
        			tabbar.createItem(id + "_link", id, "tab")
        				.appendTo(this.menu.cloneTo)
        				.find('[data-toggle="tab"]')
        				.text($(elm).find('.accordion-toggle').text().trim());
        
        			$('<div id="' + id + '" class="tab-pane touchui touchui-accordion"><div class="row-fluid"></div></div>')
        				.insertBefore(this.container.cloneTo)
        				.children().get(0)
        				.prepend(elm);
        
        		}.bind(this.DOM.move.sidebar));
        
        	}
        
        }
        
        TouchUI.prototype.DOM.move.tabbar = {
        	init: function() {
        		//var howManyToSplice = ($("#webcam_container").length > 0) ? 3 : 4;
        
        		var $items = $("#tabs > li:not(#print_link, #touchui_dropdown_link, .hidden_touch)");
        		$($items).each(function(ind, elm) {
        			var $elm = $(elm);
        
        			// Clone the items into the dropdown, and make it click the orginal link
        			$elm
        				.clone()
        				.attr("id", $elm.attr("id")+"2")
        				.prependTo("#all_touchui_settings > .dropdown-menu")
        				.find("a")
        				.off("click")
        				.on("click", function(e) {
        					$elm.find('a').click();
        					$("#all_touchui_settings").addClass("item_active");
        					e.preventDefault();
        					return false;
        				});
        
        			$elm.addClass("hidden_touch");
        		}.bind(this));
        
        		$items = $("#tabs > li > a");
        		$items.each(function(ind, elm) {
        			$(elm).text("");
        		}.bind(this));
        		
        		var resize = function() {
        			var width = $('#print_link').width();
        			var winWidth = $(window).width();
        			var items = $('#tabs > li:not("#touchui_dropdown_link")');
        			var itemsFit = Math.floor(winWidth / width) - 2;
        
        			if (winWidth > (width * 2)) {
        				items.each(function(key, elm) {
        					if (key > itemsFit) {
        						$(elm).addClass('hidden_touch');
        						$('#' + $(elm).attr('id') + '2').removeClass('hidden_touch');
        					} else {
        						$(elm).removeClass('hidden_touch');
        						$('#' + $(elm).attr('id') + '2').addClass('hidden_touch');
        					}
        				});
        			}
        
        			// Sync width of dropdown link
        			$('#all_touchui_settings').width(width);
        		}
        
        		$(window).on('resize.touchui.tabbar', resize);
        		$(window).on('resize.touchui.tabbar', _.debounce(resize, 200));
        		$(window).on('resize.touchui.tabbar', _.debounce(resize, 600));
        		resize();
        
        	}
        }
        
        TouchUI.prototype.DOM.move.terminal = {
        
        	init: function() {
        
        		// Add version number placeholder
        		$('<span></span>').prependTo("#terminal-output");
        
        		// Create iScroll container for terminal
        		var container = $('<div id="terminal-scroll"></div>').insertBefore("#terminal-output");
        		var inner = $('<div id="terminal-scroll-inner"></div>').appendTo(container);
        		$("#terminal-output").appendTo(inner);
        		$("#terminal-output-lowfi").appendTo(inner);
        
        	}
        
        };
        
        TouchUI.prototype.DOM.overwrite.modal = function() {
        
        	//We need a reliable event for catching new modals for attaching a scrolling bar
        	$.fn.modalBup = $.fn.modal;
        	$.fn.modal = function(options, args) {
        		// Update any other modifications made by others (i.e. OctoPrint itself)
        		$.fn.modalBup.defaults = $.fn.modal.defaults;
        
        		// Create modal, store into variable so we can trigger an event first before return
        		var tmp = $(this).modalBup(options, args);
        		if (options !== "hide") {
        			$(this).trigger("modal.touchui", this);
        		}
        		return tmp;
        	};
        	$.fn.modal.prototype = { constructor: $.fn.modal };
        	$.fn.modal.Constructor = $.fn.modal;
        	$.fn.modal.defaults = $.fn.modalBup.defaults;
        
        }
        
        TouchUI.prototype.DOM.overwrite.pnotify = function() {
        
        	if(!this.settings.hasTouch) {
        		var tmp = PNotify.prototype.options.stack;
        		tmp.context = $('#scroll .page-container');
        		PNotify.prototype.options.stack = tmp;
        	}
        
        }
        
        TouchUI.prototype.DOM.overwrite.tabbar = function() {
        
        	// Force the webcam tab to load the webcam feed that original is located on the controls tab
        	$('#tabs [data-toggle=tab]').each(function(ind, elm) {
        
        		var data_event = jQuery._data(elm, "events");
        		if (data_event && data_event.show) {
        
        			// Get the currently attached events to the toggle
        			var events = $.extend([], data_event.show),
        				$elm = $(elm);
        
        			// Remove all previous set events and call them after manipulating a few things
        			$elm.off("show").on("show", function(e) {
        				var scope = this,
        					current = e.target.hash,
        					previous = e.relatedTarget.hash;
        
        				current = (current === "#control") ? "#control_without_webcam" : current;
        				current = (current === "#webcam") ? "#control" : current;
        
        				previous = (previous === "#control") ? "#control_without_webcam" : previous;
        				previous = (previous === "#webcam") ? "#control" : previous;
        
        				// Call previous unset functions (e.g. let's trigger the event onTabChange in all the viewModels)
        				$.each(events, function(key, event) {
        					event.handler.call(scope, {
        						target: {
        							hash: current
        						},
        						relatedTarget: {
        							hash: previous
        						}
        					});
        				});
        			});
        		}
        
        	});
        
        }
        
        TouchUI.prototype.DOM.overwrite.tabdrop = function() {
        	$.fn.tabdrop = function() {};
        	$.fn.tabdrop.prototype = { constructor: $.fn.tabdrop };
        	$.fn.tabdrop.Constructor = $.fn.tabdrop;
        }
        
        ;
        
        // source: plugin/touchui/js/touchui.bootstrap.js
        !function(){if(TouchUI.prototype.settings.isChromiumArm&&window.log&&window.log.error){var o=window.log.error;window.log.error=function(n,r){window.top.postMessage([r,""],"*"),o.apply(window.log,arguments)}}var n=new TouchUI;n.domLoading(),$(function(){n.domReady(),OCTOPRINT_VIEWMODELS.push([n.koStartup,n.TOUCHUI_REQUIRED_VIEWMODELS,n.TOUCHUI_ELEMENTS,n.TOUCHUI_REQUIRED_VIEWMODELS])})}();
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin touchui:", (error.stack || error));
    }
})();

// JS assets for plugin yamlpatcher
(function () {
    try {
        // source: plugin/yamlpatcher/js/jsdiff.js
        /*
         * Software License Agreement (BSD License)
         *
         * Copyright (c) 2009-2011, Kevin Decker kpdecker@gmail.com
         *
         * All rights reserved.
         *
         * Redistribution and use of this software in source and binary forms, with or
         * without modification, are permitted provided that the following conditions
         * are met:
         *
         *   * Redistributions of source code must retain the above copyright notice,
         *     this list of conditions and the following disclaimer.
         *
         *   * Redistributions in binary form must reproduce the above copyright notice,
         *     this list of conditions and the following disclaimer in the documentation
         *     and/or other materials provided with the distribution.
         *
         *   * Neither the name of Kevin Decker nor the names of its contributors may
         *     be used to endorse or promote products derived from this software without
         *     specific prior written permission.
         *
         * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
         * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
         * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
         * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
         * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
         * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
         * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
         * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
         * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
         * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
         * POSSIBILITY OF SUCH DAMAGE.
         */
        
        /*
         * Text diff implementation.
         *
         * This library supports the following APIS:
         * JsDiff.diffChars: Character by character diff
         * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
         * JsDiff.diffLines: Line based diff
         *
         * JsDiff.diffCss: Diff targeted at CSS content
         *
         * These methods are based on the implementation proposed in
         * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
         * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
         */
        (function(global, undefined) {
            var objectPrototypeToString = Object.prototype.toString;
        
            /*istanbul ignore next*/
            function map(arr, mapper, that) {
                if (Array.prototype.map) {
                    return Array.prototype.map.call(arr, mapper, that);
                }
        
                var other = new Array(arr.length);
        
                for (var i = 0, n = arr.length; i < n; i++) {
                    other[i] = mapper.call(that, arr[i], i, arr);
                }
                return other;
            }
            function clonePath(path) {
                return { newPos: path.newPos, components: path.components.slice(0) };
            }
            function removeEmpty(array) {
                var ret = [];
                for (var i = 0; i < array.length; i++) {
                    if (array[i]) {
                        ret.push(array[i]);
                    }
                }
                return ret;
            }
            function escapeHTML(s) {
                var n = s;
                n = n.replace(/&/g, '&amp;');
                n = n.replace(/</g, '&lt;');
                n = n.replace(/>/g, '&gt;');
                n = n.replace(/"/g, '&quot;');
        
                return n;
            }
        
            // This function handles the presence of circular references by bailing out when encountering an
            // object that is already on the "stack" of items being processed.
            function canonicalize(obj, stack, replacementStack) {
                stack = stack || [];
                replacementStack = replacementStack || [];
        
                var i;
        
                for (i = 0; i < stack.length; i += 1) {
                    if (stack[i] === obj) {
                        return replacementStack[i];
                    }
                }
        
                var canonicalizedObj;
        
                if ('[object Array]' === objectPrototypeToString.call(obj)) {
                    stack.push(obj);
                    canonicalizedObj = new Array(obj.length);
                    replacementStack.push(canonicalizedObj);
                    for (i = 0; i < obj.length; i += 1) {
                        canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack);
                    }
                    stack.pop();
                    replacementStack.pop();
                } else if (typeof obj === 'object' && obj !== null) {
                    stack.push(obj);
                    canonicalizedObj = {};
                    replacementStack.push(canonicalizedObj);
                    var sortedKeys = [],
                        key;
                    for (key in obj) {
                        sortedKeys.push(key);
                    }
                    sortedKeys.sort();
                    for (i = 0; i < sortedKeys.length; i += 1) {
                        key = sortedKeys[i];
                        canonicalizedObj[key] = canonicalize(obj[key], stack, replacementStack);
                    }
                    stack.pop();
                    replacementStack.pop();
                } else {
                    canonicalizedObj = obj;
                }
                return canonicalizedObj;
            }
        
            function buildValues(components, newString, oldString, useLongestToken) {
                var componentPos = 0,
                    componentLen = components.length,
                    newPos = 0,
                    oldPos = 0;
        
                for (; componentPos < componentLen; componentPos++) {
                    var component = components[componentPos];
                    if (!component.removed) {
                        if (!component.added && useLongestToken) {
                            var value = newString.slice(newPos, newPos + component.count);
                            value = map(value, function(value, i) {
                                var oldValue = oldString[oldPos + i];
                                return oldValue.length > value.length ? oldValue : value;
                            });
        
                            component.value = value.join('');
                        } else {
                            component.value = newString.slice(newPos, newPos + component.count).join('');
                        }
                        newPos += component.count;
        
                        // Common case
                        if (!component.added) {
                            oldPos += component.count;
                        }
                    } else {
                        component.value = oldString.slice(oldPos, oldPos + component.count).join('');
                        oldPos += component.count;
        
                        // Reverse add and remove so removes are output first to match common convention
                        // The diffing algorithm is tied to add then remove output and this is the simplest
                        // route to get the desired output with minimal overhead.
                        if (componentPos && components[componentPos - 1].added) {
                            var tmp = components[componentPos - 1];
                            components[componentPos - 1] = components[componentPos];
                            components[componentPos] = tmp;
                        }
                    }
                }
        
                return components;
            }
        
            function Diff(ignoreWhitespace) {
                this.ignoreWhitespace = ignoreWhitespace;
            }
            Diff.prototype = {
                diff: function(oldString, newString, callback) {
                    var self = this;
        
                    function done(value) {
                        if (callback) {
                            setTimeout(function() { callback(undefined, value); }, 0);
                            return true;
                        } else {
                            return value;
                        }
                    }
        
                    // Handle the identity case (this is due to unrolling editLength == 0
                    if (newString === oldString) {
                        return done([{ value: newString }]);
                    }
                    if (!newString) {
                        return done([{ value: oldString, removed: true }]);
                    }
                    if (!oldString) {
                        return done([{ value: newString, added: true }]);
                    }
        
                    newString = this.tokenize(newString);
                    oldString = this.tokenize(oldString);
        
                    var newLen = newString.length, oldLen = oldString.length;
                    var editLength = 1;
                    var maxEditLength = newLen + oldLen;
                    var bestPath = [{ newPos: -1, components: [] }];
        
                    // Seed editLength = 0, i.e. the content starts with the same values
                    var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
                    if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
                        // Identity per the equality and tokenizer
                        return done([{value: newString.join('')}]);
                    }
        
                    // Main worker method. checks all permutations of a given edit length for acceptance.
                    function execEditLength() {
                        for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
                            var basePath;
                            var addPath = bestPath[diagonalPath - 1],
                                removePath = bestPath[diagonalPath + 1],
                                oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
                            if (addPath) {
                                // No one else is going to attempt to use this value, clear it
                                bestPath[diagonalPath - 1] = undefined;
                            }
        
                            var canAdd = addPath && addPath.newPos + 1 < newLen,
                                canRemove = removePath && 0 <= oldPos && oldPos < oldLen;
                            if (!canAdd && !canRemove) {
                                // If this path is a terminal then prune
                                bestPath[diagonalPath] = undefined;
                                continue;
                            }
        
                            // Select the diagonal that we want to branch from. We select the prior
                            // path whose position in the new string is the farthest from the origin
                            // and does not pass the bounds of the diff graph
                            if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
                                basePath = clonePath(removePath);
                                self.pushComponent(basePath.components, undefined, true);
                            } else {
                                basePath = addPath;   // No need to clone, we've pulled it from the list
                                basePath.newPos++;
                                self.pushComponent(basePath.components, true, undefined);
                            }
        
                            oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath);
        
                            // If we have hit the end of both strings, then we are done
                            if (basePath.newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
                                return done(buildValues(basePath.components, newString, oldString, self.useLongestToken));
                            } else {
                                // Otherwise track this path as a potential candidate and continue.
                                bestPath[diagonalPath] = basePath;
                            }
                        }
        
                        editLength++;
                    }
        
                    // Performs the length of edit iteration. Is a bit fugly as this has to support the
                    // sync and async mode which is never fun. Loops over execEditLength until a value
                    // is produced.
                    if (callback) {
                        (function exec() {
                            setTimeout(function() {
                                // This should not happen, but we want to be safe.
                                /*istanbul ignore next */
                                if (editLength > maxEditLength) {
                                    return callback();
                                }
        
                                if (!execEditLength()) {
                                    exec();
                                }
                            }, 0);
                        }());
                    } else {
                        while (editLength <= maxEditLength) {
                            var ret = execEditLength();
                            if (ret) {
                                return ret;
                            }
                        }
                    }
                },
        
                pushComponent: function(components, added, removed) {
                    var last = components[components.length - 1];
                    if (last && last.added === added && last.removed === removed) {
                        // We need to clone here as the component clone operation is just
                        // as shallow array clone
                        components[components.length - 1] = {count: last.count + 1, added: added, removed: removed };
                    } else {
                        components.push({count: 1, added: added, removed: removed });
                    }
                },
                extractCommon: function(basePath, newString, oldString, diagonalPath) {
                    var newLen = newString.length,
                        oldLen = oldString.length,
                        newPos = basePath.newPos,
                        oldPos = newPos - diagonalPath,
        
                        commonCount = 0;
                    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
                        newPos++;
                        oldPos++;
                        commonCount++;
                    }
        
                    if (commonCount) {
                        basePath.components.push({count: commonCount});
                    }
        
                    basePath.newPos = newPos;
                    return oldPos;
                },
        
                equals: function(left, right) {
                    var reWhitespace = /\S/;
                    return left === right || (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right));
                },
                tokenize: function(value) {
                    return value.split('');
                }
            };
        
            var CharDiff = new Diff();
        
            var WordDiff = new Diff(true);
            var WordWithSpaceDiff = new Diff();
            WordDiff.tokenize = WordWithSpaceDiff.tokenize = function(value) {
                return removeEmpty(value.split(/(\s+|\b)/));
            };
        
            var CssDiff = new Diff(true);
            CssDiff.tokenize = function(value) {
                return removeEmpty(value.split(/([{}:;,]|\s+)/));
            };
        
            var LineDiff = new Diff();
        
            var TrimmedLineDiff = new Diff();
            TrimmedLineDiff.ignoreTrim = true;
        
            LineDiff.tokenize = TrimmedLineDiff.tokenize = function(value) {
                var retLines = [],
                    lines = value.split(/^/m);
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i],
                        lastLine = lines[i - 1],
                        lastLineLastChar = lastLine && lastLine[lastLine.length - 1];
        
                    // Merge lines that may contain windows new lines
                    if (line === '\n' && lastLineLastChar === '\r') {
                        retLines[retLines.length - 1] = retLines[retLines.length - 1].slice(0, -1) + '\r\n';
                    } else {
                        if (this.ignoreTrim) {
                            line = line.trim();
                            // add a newline unless this is the last line.
                            if (i < lines.length - 1) {
                                line += '\n';
                            }
                        }
                        retLines.push(line);
                    }
                }
        
                return retLines;
            };
        
            var PatchDiff = new Diff();
            PatchDiff.tokenize = function(value) {
                var ret = [],
                    linesAndNewlines = value.split(/(\n|\r\n)/);
        
                // Ignore the final empty token that occurs if the string ends with a new line
                if (!linesAndNewlines[linesAndNewlines.length - 1]) {
                    linesAndNewlines.pop();
                }
        
                // Merge the content and line separators into single tokens
                for (var i = 0; i < linesAndNewlines.length; i++) {
                    var line = linesAndNewlines[i];
        
                    if (i % 2) {
                        ret[ret.length - 1] += line;
                    } else {
                        ret.push(line);
                    }
                }
                return ret;
            };
        
            var SentenceDiff = new Diff();
            SentenceDiff.tokenize = function(value) {
                return removeEmpty(value.split(/(\S.+?[.!?])(?=\s+|$)/));
            };
        
            var JsonDiff = new Diff();
            // Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
            // dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:
            JsonDiff.useLongestToken = true;
            JsonDiff.tokenize = LineDiff.tokenize;
            JsonDiff.equals = function(left, right) {
                return LineDiff.equals(left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'));
            };
        
            var JsDiff = {
                Diff: Diff,
        
                diffChars: function(oldStr, newStr, callback) { return CharDiff.diff(oldStr, newStr, callback); },
                diffWords: function(oldStr, newStr, callback) { return WordDiff.diff(oldStr, newStr, callback); },
                diffWordsWithSpace: function(oldStr, newStr, callback) { return WordWithSpaceDiff.diff(oldStr, newStr, callback); },
                diffLines: function(oldStr, newStr, callback) { return LineDiff.diff(oldStr, newStr, callback); },
                diffTrimmedLines: function(oldStr, newStr, callback) { return TrimmedLineDiff.diff(oldStr, newStr, callback); },
        
                diffSentences: function(oldStr, newStr, callback) { return SentenceDiff.diff(oldStr, newStr, callback); },
        
                diffCss: function(oldStr, newStr, callback) { return CssDiff.diff(oldStr, newStr, callback); },
                diffJson: function(oldObj, newObj, callback) {
                    return JsonDiff.diff(
                        typeof oldObj === 'string' ? oldObj : JSON.stringify(canonicalize(oldObj), undefined, '  '),
                        typeof newObj === 'string' ? newObj : JSON.stringify(canonicalize(newObj), undefined, '  '),
                        callback
                    );
                },
        
                createTwoFilesPatch: function(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader) {
                    var ret = [];
        
                    if (oldFileName == newFileName) {
                        ret.push('Index: ' + oldFileName);
                    }
                    ret.push('===================================================================');
                    ret.push('--- ' + oldFileName + (typeof oldHeader === 'undefined' ? '' : '\t' + oldHeader));
                    ret.push('+++ ' + newFileName + (typeof newHeader === 'undefined' ? '' : '\t' + newHeader));
        
                    var diff = PatchDiff.diff(oldStr, newStr);
                    diff.push({value: '', lines: []});   // Append an empty value to make cleanup easier
        
                    // Formats a given set of lines for printing as context lines in a patch
                    function contextLines(lines) {
                        return map(lines, function(entry) { return ' ' + entry; });
                    }
        
                    // Outputs the no newline at end of file warning if needed
                    function eofNL(curRange, i, current) {
                        var last = diff[diff.length - 2],
                            isLast = i === diff.length - 2,
                            isLastOfType = i === diff.length - 3 && current.added !== last.added;
        
                        // Figure out if this is the last line for the given file and missing NL
                        if (!(/\n$/.test(current.value)) && (isLast || isLastOfType)) {
                            curRange.push('\\ No newline at end of file');
                        }
                    }
        
                    var oldRangeStart = 0, newRangeStart = 0, curRange = [],
                        oldLine = 1, newLine = 1;
                    for (var i = 0; i < diff.length; i++) {
                        var current = diff[i],
                            lines = current.lines || current.value.replace(/\n$/, '').split('\n');
                        current.lines = lines;
        
                        if (current.added || current.removed) {
                            // If we have previous context, start with that
                            if (!oldRangeStart) {
                                var prev = diff[i - 1];
                                oldRangeStart = oldLine;
                                newRangeStart = newLine;
        
                                if (prev) {
                                    curRange = contextLines(prev.lines.slice(-4));
                                    oldRangeStart -= curRange.length;
                                    newRangeStart -= curRange.length;
                                }
                            }
        
                            // Output our changes
                            curRange.push.apply(curRange, map(lines, function(entry) {
                                return (current.added ? '+' : '-') + entry;
                            }));
                            eofNL(curRange, i, current);
        
                            // Track the updated file position
                            if (current.added) {
                                newLine += lines.length;
                            } else {
                                oldLine += lines.length;
                            }
                        } else {
                            // Identical context lines. Track line changes
                            if (oldRangeStart) {
                                // Close out any changes that have been output (or join overlapping)
                                if (lines.length <= 8 && i < diff.length - 2) {
                                    // Overlapping
                                    curRange.push.apply(curRange, contextLines(lines));
                                } else {
                                    // end the range and output
                                    var contextSize = Math.min(lines.length, 4);
                                    ret.push(
                                        '@@ -' + oldRangeStart + ',' + (oldLine - oldRangeStart + contextSize)
                                        + ' +' + newRangeStart + ',' + (newLine - newRangeStart + contextSize)
                                        + ' @@');
                                    ret.push.apply(ret, curRange);
                                    ret.push.apply(ret, contextLines(lines.slice(0, contextSize)));
                                    if (lines.length <= 4) {
                                        eofNL(ret, i, current);
                                    }
        
                                    oldRangeStart = 0;
                                    newRangeStart = 0;
                                    curRange = [];
                                }
                            }
                            oldLine += lines.length;
                            newLine += lines.length;
                        }
                    }
        
                    return ret.join('\n') + '\n';
                },
        
                createPatch: function(fileName, oldStr, newStr, oldHeader, newHeader) {
                    return JsDiff.createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader);
                },
        
                applyPatch: function(oldStr, uniDiff) {
                    var diffstr = uniDiff.split('\n'),
                        hunks = [],
                        i = 0,
                        remEOFNL = false,
                        addEOFNL = false;
        
                    // Skip to the first change hunk
                    while (i < diffstr.length && !(/^@@/.test(diffstr[i]))) {
                        i++;
                    }
        
                    // Parse the unified diff
                    for (; i < diffstr.length; i++) {
                        if (diffstr[i][0] === '@') {
                            var chnukHeader = diffstr[i].split(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
                            hunks.unshift({
                                start: chnukHeader[3],
                                oldlength: +chnukHeader[2],
                                removed: [],
                                newlength: chnukHeader[4],
                                added: []
                            });
                        } else if (diffstr[i][0] === '+') {
                            hunks[0].added.push(diffstr[i].substr(1));
                        } else if (diffstr[i][0] === '-') {
                            hunks[0].removed.push(diffstr[i].substr(1));
                        } else if (diffstr[i][0] === ' ') {
                            hunks[0].added.push(diffstr[i].substr(1));
                            hunks[0].removed.push(diffstr[i].substr(1));
                        } else if (diffstr[i][0] === '\\') {
                            if (diffstr[i - 1][0] === '+') {
                                remEOFNL = true;
                            } else if (diffstr[i - 1][0] === '-') {
                                addEOFNL = true;
                            }
                        }
                    }
        
                    // Apply the diff to the input
                    var lines = oldStr.split('\n');
                    for (i = hunks.length - 1; i >= 0; i--) {
                        var hunk = hunks[i];
                        // Sanity check the input string. Bail if we don't match.
                        for (var j = 0; j < hunk.oldlength; j++) {
                            if (lines[hunk.start - 1 + j] !== hunk.removed[j]) {
                                return false;
                            }
                        }
                        Array.prototype.splice.apply(lines, [hunk.start - 1, hunk.oldlength].concat(hunk.added));
                    }
        
                    // Handle EOFNL insertion/removal
                    if (remEOFNL) {
                        while (!lines[lines.length - 1]) {
                            lines.pop();
                        }
                    } else if (addEOFNL) {
                        lines.push('');
                    }
                    return lines.join('\n');
                },
        
                convertChangesToXML: function(changes) {
                    var ret = [];
                    for (var i = 0; i < changes.length; i++) {
                        var change = changes[i];
                        if (change.added) {
                            ret.push('<ins>');
                        } else if (change.removed) {
                            ret.push('<del>');
                        }
        
                        ret.push(escapeHTML(change.value));
        
                        if (change.added) {
                            ret.push('</ins>');
                        } else if (change.removed) {
                            ret.push('</del>');
                        }
                    }
                    return ret.join('');
                },
        
                // See: http://code.google.com/p/google-diff-match-patch/wiki/API
                convertChangesToDMP: function(changes) {
                    var ret = [],
                        change,
                        operation;
                    for (var i = 0; i < changes.length; i++) {
                        change = changes[i];
                        if (change.added) {
                            operation = 1;
                        } else if (change.removed) {
                            operation = -1;
                        } else {
                            operation = 0;
                        }
        
                        ret.push([operation, change.value]);
                    }
                    return ret;
                },
        
                canonicalize: canonicalize
            };
        
            /*istanbul ignore next */
            /*global module */
            if (typeof module !== 'undefined' && module.exports) {
                module.exports = JsDiff;
            } else if (typeof define === 'function' && define.amd) {
                /*global define */
                define([], function() { return JsDiff; });
            } else if (typeof global.JsDiff === 'undefined') {
                global.JsDiff = JsDiff;
            }
        }(this));
        
        ;
        
        // source: plugin/yamlpatcher/js/js-yaml.min.js
        /* js-yaml 3.3.1 https://github.com/nodeca/js-yaml */
        !function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.jsyaml=e()}}(function(){return function e(t,n,i){function r(a,s){if(!n[a]){if(!t[a]){var u="function"==typeof require&&require;if(!s&&u)return u(a,!0);if(o)return o(a,!0);var c=new Error("Cannot find module '"+a+"'");throw c.code="MODULE_NOT_FOUND",c}var l=n[a]={exports:{}};t[a][0].call(l.exports,function(e){var n=t[a][1][e];return r(n?n:e)},l,l.exports,e,t,n,i)}return n[a].exports}for(var o="function"==typeof require&&require,a=0;a<i.length;a++)r(i[a]);return r}({1:[function(e,t,n){"use strict";function i(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}var r=e("./js-yaml/loader"),o=e("./js-yaml/dumper");t.exports.Type=e("./js-yaml/type"),t.exports.Schema=e("./js-yaml/schema"),t.exports.FAILSAFE_SCHEMA=e("./js-yaml/schema/failsafe"),t.exports.JSON_SCHEMA=e("./js-yaml/schema/json"),t.exports.CORE_SCHEMA=e("./js-yaml/schema/core"),t.exports.DEFAULT_SAFE_SCHEMA=e("./js-yaml/schema/default_safe"),t.exports.DEFAULT_FULL_SCHEMA=e("./js-yaml/schema/default_full"),t.exports.load=r.load,t.exports.loadAll=r.loadAll,t.exports.safeLoad=r.safeLoad,t.exports.safeLoadAll=r.safeLoadAll,t.exports.dump=o.dump,t.exports.safeDump=o.safeDump,t.exports.YAMLException=e("./js-yaml/exception"),t.exports.MINIMAL_SCHEMA=e("./js-yaml/schema/failsafe"),t.exports.SAFE_SCHEMA=e("./js-yaml/schema/default_safe"),t.exports.DEFAULT_SCHEMA=e("./js-yaml/schema/default_full"),t.exports.scan=i("scan"),t.exports.parse=i("parse"),t.exports.compose=i("compose"),t.exports.addConstructor=i("addConstructor")},{"./js-yaml/dumper":3,"./js-yaml/exception":4,"./js-yaml/loader":5,"./js-yaml/schema":7,"./js-yaml/schema/core":8,"./js-yaml/schema/default_full":9,"./js-yaml/schema/default_safe":10,"./js-yaml/schema/failsafe":11,"./js-yaml/schema/json":12,"./js-yaml/type":13}],2:[function(e,t,n){"use strict";function i(e){return"undefined"==typeof e||null===e}function r(e){return"object"==typeof e&&null!==e}function o(e){return Array.isArray(e)?e:i(e)?[]:[e]}function a(e,t){var n,i,r,o;if(t)for(o=Object.keys(t),n=0,i=o.length;i>n;n+=1)r=o[n],e[r]=t[r];return e}function s(e,t){var n,i="";for(n=0;t>n;n+=1)i+=e;return i}function u(e){return 0===e&&Number.NEGATIVE_INFINITY===1/e}t.exports.isNothing=i,t.exports.isObject=r,t.exports.toArray=o,t.exports.repeat=s,t.exports.isNegativeZero=u,t.exports.extend=a},{}],3:[function(e,t,n){"use strict";function i(e,t){var n,i,r,o,a,s,u;if(null===t)return{};for(n={},i=Object.keys(t),r=0,o=i.length;o>r;r+=1)a=i[r],s=String(t[a]),"!!"===a.slice(0,2)&&(a="tag:yaml.org,2002:"+a.slice(2)),u=e.compiledTypeMap[a],u&&F.call(u.styleAliases,s)&&(s=u.styleAliases[s]),n[a]=s;return n}function r(e){var t,n,i;if(t=e.toString(16).toUpperCase(),255>=e)n="x",i=2;else if(65535>=e)n="u",i=4;else{if(!(4294967295>=e))throw new I("code point within a string may not be greater than 0xFFFFFFFF");n="U",i=8}return"\\"+n+j.repeat("0",i-t.length)+t}function o(e){this.schema=e.schema||S,this.indent=Math.max(1,e.indent||2),this.skipInvalid=e.skipInvalid||!1,this.flowLevel=j.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=i(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function a(e,t){for(var n,i=j.repeat(" ",t),r=0,o=-1,a="",s=e.length;s>r;)o=e.indexOf("\n",r),-1===o?(n=e.slice(r),r=s):(n=e.slice(r,o+1),r=o+1),n.length&&"\n"!==n&&(a+=i),a+=n;return a}function s(e,t){return"\n"+j.repeat(" ",e.indent*t)}function u(e,t){var n,i,r;for(n=0,i=e.implicitTypes.length;i>n;n+=1)if(r=e.implicitTypes[n],r.resolve(t))return!0;return!1}function c(e){this.source=e,this.result="",this.checkpoint=0}function l(e,t,n){var i,r,o,s,l,f,m,g,y,x,v,A,b,w,C,k,j,I,S,O,E;if(0===t.length)return void(e.dump="''");if(-1!==te.indexOf(t))return void(e.dump="'"+t+"'");for(i=!0,r=t.length?t.charCodeAt(0):0,o=M===r||M===t.charCodeAt(t.length-1),(K===r||G===r||V===r||J===r)&&(i=!1),o?(i=!1,s=!1,l=!1):(s=!0,l=!0),f=!0,m=new c(t),g=!1,y=0,x=0,v=e.indent*n,A=80,40>v?A-=v:A=40,w=0;w<t.length;w++){if(b=t.charCodeAt(w),i){if(h(b))continue;i=!1}f&&b===P&&(f=!1),C=ee[b],k=d(b),(C||k)&&(b!==T&&b!==D&&b!==P?(s=!1,l=!1):b===T&&(g=!0,f=!1,w>0&&(j=t.charCodeAt(w-1),j===M&&(l=!1,s=!1)),s&&(I=w-y,y=w,I>x&&(x=I))),b!==D&&(f=!1),m.takeUpTo(w),m.escapeChar())}if(i&&u(e,t)&&(i=!1),S="",(s||l)&&(O=0,t.charCodeAt(t.length-1)===T&&(O+=1,t.charCodeAt(t.length-2)===T&&(O+=1)),0===O?S="-":2===O&&(S="+")),l&&A>x&&(s=!1),g||(l=!1),i)e.dump=t;else if(f)e.dump="'"+t+"'";else if(s)E=p(t,A),e.dump=">"+S+"\n"+a(E,v);else if(l)S||(t=t.replace(/\n$/,"")),e.dump="|"+S+"\n"+a(t,v);else{if(!m)throw new Error("Failed to dump scalar value");m.finish(),e.dump='"'+m.result+'"'}}function p(e,t){var n,i="",r=0,o=e.length,a=/\n+$/.exec(e);for(a&&(o=a.index+1);o>r;)n=e.indexOf("\n",r),n>o||-1===n?(i&&(i+="\n\n"),i+=f(e.slice(r,o),t),r=o):(i&&(i+="\n\n"),i+=f(e.slice(r,n),t),r=n+1);return a&&"\n"!==a[0]&&(i+=a[0]),i}function f(e,t){if(""===e)return e;for(var n,i,r,o=/[^\s] [^\s]/g,a="",s=0,u=0,c=o.exec(e);c;)n=c.index,n-u>t&&(i=s!==u?s:n,a&&(a+="\n"),r=e.slice(u,i),a+=r,u=i+1),s=n+1,c=o.exec(e);return a&&(a+="\n"),a+=u!==s&&e.length-u>t?e.slice(u,s)+"\n"+e.slice(s+1):e.slice(u)}function h(e){return N!==e&&T!==e&&_!==e&&B!==e&&W!==e&&Z!==e&&z!==e&&X!==e&&U!==e&&q!==e&&$!==e&&L!==e&&Q!==e&&H!==e&&P!==e&&D!==e&&Y!==e&&R!==e&&!ee[e]&&!d(e)}function d(e){return!(e>=32&&126>=e||133===e||e>=160&&55295>=e||e>=57344&&65533>=e||e>=65536&&1114111>=e)}function m(e,t,n){var i,r,o="",a=e.tag;for(i=0,r=n.length;r>i;i+=1)A(e,t,n[i],!1,!1)&&(0!==i&&(o+=", "),o+=e.dump);e.tag=a,e.dump="["+o+"]"}function g(e,t,n,i){var r,o,a="",u=e.tag;for(r=0,o=n.length;o>r;r+=1)A(e,t+1,n[r],!0,!0)&&(i&&0===r||(a+=s(e,t)),a+="- "+e.dump);e.tag=u,e.dump=a||"[]"}function y(e,t,n){var i,r,o,a,s,u="",c=e.tag,l=Object.keys(n);for(i=0,r=l.length;r>i;i+=1)s="",0!==i&&(s+=", "),o=l[i],a=n[o],A(e,t,o,!1,!1)&&(e.dump.length>1024&&(s+="? "),s+=e.dump+": ",A(e,t,a,!1,!1)&&(s+=e.dump,u+=s));e.tag=c,e.dump="{"+u+"}"}function x(e,t,n,i){var r,o,a,u,c,l,p="",f=e.tag,h=Object.keys(n);if(e.sortKeys===!0)h.sort();else if("function"==typeof e.sortKeys)h.sort(e.sortKeys);else if(e.sortKeys)throw new I("sortKeys must be a boolean or a function");for(r=0,o=h.length;o>r;r+=1)l="",i&&0===r||(l+=s(e,t)),a=h[r],u=n[a],A(e,t+1,a,!0,!0)&&(c=null!==e.tag&&"?"!==e.tag||e.dump&&e.dump.length>1024,c&&(l+=e.dump&&T===e.dump.charCodeAt(0)?"?":"? "),l+=e.dump,c&&(l+=s(e,t)),A(e,t+1,u,!0,c)&&(l+=e.dump&&T===e.dump.charCodeAt(0)?":":": ",l+=e.dump,p+=l));e.tag=f,e.dump=p||"{}"}function v(e,t,n){var i,r,o,a,s,u;for(r=n?e.explicitTypes:e.implicitTypes,o=0,a=r.length;a>o;o+=1)if(s=r[o],(s.instanceOf||s.predicate)&&(!s.instanceOf||"object"==typeof t&&t instanceof s.instanceOf)&&(!s.predicate||s.predicate(t))){if(e.tag=n?s.tag:"?",s.represent){if(u=e.styleMap[s.tag]||s.defaultStyle,"[object Function]"===E.call(s.represent))i=s.represent(t,u);else{if(!F.call(s.represent,u))throw new I("!<"+s.tag+'> tag resolver accepts not "'+u+'" style');i=s.represent[u](t,u)}e.dump=i}return!0}return!1}function A(e,t,n,i,r){e.tag=null,e.dump=n,v(e,n,!1)||v(e,n,!0);var o=E.call(e.dump);i&&(i=0>e.flowLevel||e.flowLevel>t),(null!==e.tag&&"?"!==e.tag||2!==e.indent&&t>0)&&(r=!1);var a,s,u="[object Object]"===o||"[object Array]"===o;if(u&&(a=e.duplicates.indexOf(n),s=-1!==a),s&&e.usedDuplicates[a])e.dump="*ref_"+a;else{if(u&&s&&!e.usedDuplicates[a]&&(e.usedDuplicates[a]=!0),"[object Object]"===o)i&&0!==Object.keys(e.dump).length?(x(e,t,e.dump,r),s&&(e.dump="&ref_"+a+(0===t?"\n":"")+e.dump)):(y(e,t,e.dump),s&&(e.dump="&ref_"+a+" "+e.dump));else if("[object Array]"===o)i&&0!==e.dump.length?(g(e,t,e.dump,r),s&&(e.dump="&ref_"+a+(0===t?"\n":"")+e.dump)):(m(e,t,e.dump),s&&(e.dump="&ref_"+a+" "+e.dump));else{if("[object String]"!==o){if(e.skipInvalid)return!1;throw new I("unacceptable kind of an object to dump "+o)}"?"!==e.tag&&l(e,e.dump,t)}null!==e.tag&&"?"!==e.tag&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function b(e,t){var n,i,r=[],o=[];for(w(e,r,o),n=0,i=o.length;i>n;n+=1)t.duplicates.push(r[o[n]]);t.usedDuplicates=new Array(i)}function w(e,t,n){var i,r,o;E.call(e);if(null!==e&&"object"==typeof e)if(r=t.indexOf(e),-1!==r)-1===n.indexOf(r)&&n.push(r);else if(t.push(e),Array.isArray(e))for(r=0,o=e.length;o>r;r+=1)w(e[r],t,n);else for(i=Object.keys(e),r=0,o=i.length;o>r;r+=1)w(e[i[r]],t,n)}function C(e,t){t=t||{};var n=new o(t);return b(e,n),A(n,0,e,!0,!0)?n.dump+"\n":""}function k(e,t){return C(e,j.extend({schema:O},t))}var j=e("./common"),I=e("./exception"),S=e("./schema/default_full"),O=e("./schema/default_safe"),E=Object.prototype.toString,F=Object.prototype.hasOwnProperty,N=9,T=10,_=13,M=32,L=33,D=34,U=35,Y=37,q=38,P=39,$=42,B=44,K=45,R=58,H=62,G=63,V=64,W=91,Z=93,J=96,z=123,Q=124,X=125,ee={};ee[0]="\\0",ee[7]="\\a",ee[8]="\\b",ee[9]="\\t",ee[10]="\\n",ee[11]="\\v",ee[12]="\\f",ee[13]="\\r",ee[27]="\\e",ee[34]='\\"',ee[92]="\\\\",ee[133]="\\N",ee[160]="\\_",ee[8232]="\\L",ee[8233]="\\P";var te=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];c.prototype.takeUpTo=function(e){var t;if(e<this.checkpoint)throw t=new Error("position should be > checkpoint"),t.position=e,t.checkpoint=this.checkpoint,t;return this.result+=this.source.slice(this.checkpoint,e),this.checkpoint=e,this},c.prototype.escapeChar=function(){var e,t;return e=this.source.charCodeAt(this.checkpoint),t=ee[e]||r(e),this.result+=t,this.checkpoint+=1,this},c.prototype.finish=function(){this.source.length>this.checkpoint&&this.takeUpTo(this.source.length)},t.exports.dump=C,t.exports.safeDump=k},{"./common":2,"./exception":4,"./schema/default_full":9,"./schema/default_safe":10}],4:[function(e,t,n){"use strict";function i(e,t){this.name="YAMLException",this.reason=e,this.mark=t,this.message=this.toString(!1)}i.prototype.toString=function(e){var t;return t="JS-YAML: "+(this.reason||"(unknown reason)"),!e&&this.mark&&(t+=" "+this.mark.toString()),t},t.exports=i},{}],5:[function(e,t,n){"use strict";function i(e){return 10===e||13===e}function r(e){return 9===e||32===e}function o(e){return 9===e||32===e||10===e||13===e}function a(e){return 44===e||91===e||93===e||123===e||125===e}function s(e){var t;return e>=48&&57>=e?e-48:(t=32|e,t>=97&&102>=t?t-97+10:-1)}function u(e){return 120===e?2:117===e?4:85===e?8:0}function c(e){return e>=48&&57>=e?e-48:-1}function l(e){return 48===e?"\x00":97===e?"":98===e?"\b":116===e?"	":9===e?"	":110===e?"\n":118===e?"":102===e?"\f":114===e?"\r":101===e?"":32===e?" ":34===e?'"':47===e?"/":92===e?"\\":78===e?"":95===e?" ":76===e?"\u2028":80===e?"\u2029":""}function p(e){return 65535>=e?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function f(e,t){this.input=e,this.filename=t.filename||null,this.schema=t.schema||R,this.onWarning=t.onWarning||null,this.legacy=t.legacy||!1,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function h(e,t){return new $(t,new B(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function d(e,t){throw h(e,t)}function m(e,t){var n=h(e,t);if(!e.onWarning)throw n;e.onWarning.call(null,n)}function g(e,t,n,i){var r,o,a,s;if(n>t){if(s=e.input.slice(t,n),i)for(r=0,o=s.length;o>r;r+=1)a=s.charCodeAt(r),9===a||a>=32&&1114111>=a||d(e,"expected valid JSON character");e.result+=s}}function y(e,t,n){var i,r,o,a;for(P.isObject(n)||d(e,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(n),o=0,a=i.length;a>o;o+=1)r=i[o],H.call(t,r)||(t[r]=n[r])}function x(e,t,n,i,r){var o,a;if(i=String(i),null===t&&(t={}),"tag:yaml.org,2002:merge"===n)if(Array.isArray(r))for(o=0,a=r.length;a>o;o+=1)y(e,t,r[o]);else y(e,t,r);else t[i]=r;return t}function v(e){var t;t=e.input.charCodeAt(e.position),10===t?e.position++:13===t?(e.position++,10===e.input.charCodeAt(e.position)&&e.position++):d(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function A(e,t,n){for(var o=0,a=e.input.charCodeAt(e.position);0!==a;){for(;r(a);)a=e.input.charCodeAt(++e.position);if(t&&35===a)do a=e.input.charCodeAt(++e.position);while(10!==a&&13!==a&&0!==a);if(!i(a))break;for(v(e),a=e.input.charCodeAt(e.position),o++,e.lineIndent=0;32===a;)e.lineIndent++,a=e.input.charCodeAt(++e.position)}return-1!==n&&0!==o&&e.lineIndent<n&&m(e,"deficient indentation"),o}function b(e){var t,n=e.position;return t=e.input.charCodeAt(n),45!==t&&46!==t||e.input.charCodeAt(n+1)!==t||e.input.charCodeAt(n+2)!==t||(n+=3,t=e.input.charCodeAt(n),0!==t&&!o(t))?!1:!0}function w(e,t){1===t?e.result+=" ":t>1&&(e.result+=P.repeat("\n",t-1))}function C(e,t,n){var s,u,c,l,p,f,h,d,m,y=e.kind,x=e.result;if(m=e.input.charCodeAt(e.position),o(m)||a(m)||35===m||38===m||42===m||33===m||124===m||62===m||39===m||34===m||37===m||64===m||96===m)return!1;if((63===m||45===m)&&(u=e.input.charCodeAt(e.position+1),o(u)||n&&a(u)))return!1;for(e.kind="scalar",e.result="",c=l=e.position,p=!1;0!==m;){if(58===m){if(u=e.input.charCodeAt(e.position+1),o(u)||n&&a(u))break}else if(35===m){if(s=e.input.charCodeAt(e.position-1),o(s))break}else{if(e.position===e.lineStart&&b(e)||n&&a(m))break;if(i(m)){if(f=e.line,h=e.lineStart,d=e.lineIndent,A(e,!1,-1),e.lineIndent>=t){p=!0,m=e.input.charCodeAt(e.position);continue}e.position=l,e.line=f,e.lineStart=h,e.lineIndent=d;break}}p&&(g(e,c,l,!1),w(e,e.line-f),c=l=e.position,p=!1),r(m)||(l=e.position+1),m=e.input.charCodeAt(++e.position)}return g(e,c,l,!1),e.result?!0:(e.kind=y,e.result=x,!1)}function k(e,t){var n,r,o;if(n=e.input.charCodeAt(e.position),39!==n)return!1;for(e.kind="scalar",e.result="",e.position++,r=o=e.position;0!==(n=e.input.charCodeAt(e.position));)if(39===n){if(g(e,r,e.position,!0),n=e.input.charCodeAt(++e.position),39!==n)return!0;r=o=e.position,e.position++}else i(n)?(g(e,r,o,!0),w(e,A(e,!1,t)),r=o=e.position):e.position===e.lineStart&&b(e)?d(e,"unexpected end of the document within a single quoted scalar"):(e.position++,o=e.position);d(e,"unexpected end of the stream within a single quoted scalar")}function j(e,t){var n,r,o,a,c,l;if(l=e.input.charCodeAt(e.position),34!==l)return!1;for(e.kind="scalar",e.result="",e.position++,n=r=e.position;0!==(l=e.input.charCodeAt(e.position));){if(34===l)return g(e,n,e.position,!0),e.position++,!0;if(92===l){if(g(e,n,e.position,!0),l=e.input.charCodeAt(++e.position),i(l))A(e,!1,t);else if(256>l&&re[l])e.result+=oe[l],e.position++;else if((c=u(l))>0){for(o=c,a=0;o>0;o--)l=e.input.charCodeAt(++e.position),(c=s(l))>=0?a=(a<<4)+c:d(e,"expected hexadecimal character");e.result+=p(a),e.position++}else d(e,"unknown escape sequence");n=r=e.position}else i(l)?(g(e,n,r,!0),w(e,A(e,!1,t)),n=r=e.position):e.position===e.lineStart&&b(e)?d(e,"unexpected end of the document within a double quoted scalar"):(e.position++,r=e.position)}d(e,"unexpected end of the stream within a double quoted scalar")}function I(e,t){var n,i,r,a,s,u,c,l,p,f,h,m=!0,g=e.tag,y=e.anchor;if(h=e.input.charCodeAt(e.position),91===h)a=93,c=!1,i=[];else{if(123!==h)return!1;a=125,c=!0,i={}}for(null!==e.anchor&&(e.anchorMap[e.anchor]=i),h=e.input.charCodeAt(++e.position);0!==h;){if(A(e,!0,t),h=e.input.charCodeAt(e.position),h===a)return e.position++,e.tag=g,e.anchor=y,e.kind=c?"mapping":"sequence",e.result=i,!0;m||d(e,"missed comma between flow collection entries"),p=l=f=null,s=u=!1,63===h&&(r=e.input.charCodeAt(e.position+1),o(r)&&(s=u=!0,e.position++,A(e,!0,t))),n=e.line,_(e,t,G,!1,!0),p=e.tag,l=e.result,A(e,!0,t),h=e.input.charCodeAt(e.position),!u&&e.line!==n||58!==h||(s=!0,h=e.input.charCodeAt(++e.position),A(e,!0,t),_(e,t,G,!1,!0),f=e.result),c?x(e,i,p,l,f):i.push(s?x(e,null,p,l,f):l),A(e,!0,t),h=e.input.charCodeAt(e.position),44===h?(m=!0,h=e.input.charCodeAt(++e.position)):m=!1}d(e,"unexpected end of the stream within a flow collection")}function S(e,t){var n,o,a,s,u=J,l=!1,p=t,f=0,h=!1;if(s=e.input.charCodeAt(e.position),124===s)o=!1;else{if(62!==s)return!1;o=!0}for(e.kind="scalar",e.result="";0!==s;)if(s=e.input.charCodeAt(++e.position),43===s||45===s)J===u?u=43===s?Q:z:d(e,"repeat of a chomping mode identifier");else{if(!((a=c(s))>=0))break;0===a?d(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):l?d(e,"repeat of an indentation width identifier"):(p=t+a-1,l=!0)}if(r(s)){do s=e.input.charCodeAt(++e.position);while(r(s));if(35===s)do s=e.input.charCodeAt(++e.position);while(!i(s)&&0!==s)}for(;0!==s;){for(v(e),e.lineIndent=0,s=e.input.charCodeAt(e.position);(!l||e.lineIndent<p)&&32===s;)e.lineIndent++,s=e.input.charCodeAt(++e.position);if(!l&&e.lineIndent>p&&(p=e.lineIndent),i(s))f++;else{if(e.lineIndent<p){u===Q?e.result+=P.repeat("\n",f):u===J&&l&&(e.result+="\n");break}for(o?r(s)?(h=!0,e.result+=P.repeat("\n",f+1)):h?(h=!1,e.result+=P.repeat("\n",f+1)):0===f?l&&(e.result+=" "):e.result+=P.repeat("\n",f):l&&(e.result+=P.repeat("\n",f+1)),l=!0,f=0,n=e.position;!i(s)&&0!==s;)s=e.input.charCodeAt(++e.position);g(e,n,e.position,!1)}}return!0}function O(e,t){var n,i,r,a=e.tag,s=e.anchor,u=[],c=!1;for(null!==e.anchor&&(e.anchorMap[e.anchor]=u),r=e.input.charCodeAt(e.position);0!==r&&45===r&&(i=e.input.charCodeAt(e.position+1),o(i));)if(c=!0,e.position++,A(e,!0,-1)&&e.lineIndent<=t)u.push(null),r=e.input.charCodeAt(e.position);else if(n=e.line,_(e,t,W,!1,!0),u.push(e.result),A(e,!0,-1),r=e.input.charCodeAt(e.position),(e.line===n||e.lineIndent>t)&&0!==r)d(e,"bad indentation of a sequence entry");else if(e.lineIndent<t)break;return c?(e.tag=a,e.anchor=s,e.kind="sequence",e.result=u,!0):!1}function E(e,t,n){var i,a,s,u,c=e.tag,l=e.anchor,p={},f=null,h=null,m=null,g=!1,y=!1;for(null!==e.anchor&&(e.anchorMap[e.anchor]=p),u=e.input.charCodeAt(e.position);0!==u;){if(i=e.input.charCodeAt(e.position+1),s=e.line,63!==u&&58!==u||!o(i)){if(!_(e,n,V,!1,!0))break;if(e.line===s){for(u=e.input.charCodeAt(e.position);r(u);)u=e.input.charCodeAt(++e.position);if(58===u)u=e.input.charCodeAt(++e.position),o(u)||d(e,"a whitespace character is expected after the key-value separator within a block mapping"),g&&(x(e,p,f,h,null),f=h=m=null),y=!0,g=!1,a=!1,f=e.tag,h=e.result;else{if(!y)return e.tag=c,e.anchor=l,!0;d(e,"can not read an implicit mapping pair; a colon is missed")}}else{if(!y)return e.tag=c,e.anchor=l,!0;d(e,"can not read a block mapping entry; a multiline key may not be an implicit key")}}else 63===u?(g&&(x(e,p,f,h,null),f=h=m=null),y=!0,g=!0,a=!0):g?(g=!1,a=!0):d(e,"incomplete explicit mapping pair; a key node is missed"),e.position+=1,u=i;if((e.line===s||e.lineIndent>t)&&(_(e,t,Z,!0,a)&&(g?h=e.result:m=e.result),g||(x(e,p,f,h,m),f=h=m=null),A(e,!0,-1),u=e.input.charCodeAt(e.position)),e.lineIndent>t&&0!==u)d(e,"bad indentation of a mapping entry");else if(e.lineIndent<t)break}return g&&x(e,p,f,h,null),y&&(e.tag=c,e.anchor=l,e.kind="mapping",e.result=p),y}function F(e){var t,n,i,r,a=!1,s=!1;if(r=e.input.charCodeAt(e.position),33!==r)return!1;if(null!==e.tag&&d(e,"duplication of a tag property"),r=e.input.charCodeAt(++e.position),60===r?(a=!0,r=e.input.charCodeAt(++e.position)):33===r?(s=!0,n="!!",r=e.input.charCodeAt(++e.position)):n="!",t=e.position,a){do r=e.input.charCodeAt(++e.position);while(0!==r&&62!==r);e.position<e.length?(i=e.input.slice(t,e.position),r=e.input.charCodeAt(++e.position)):d(e,"unexpected end of the stream within a verbatim tag")}else{for(;0!==r&&!o(r);)33===r&&(s?d(e,"tag suffix cannot contain exclamation marks"):(n=e.input.slice(t-1,e.position+1),ne.test(n)||d(e,"named tag handle cannot contain such characters"),s=!0,t=e.position+1)),r=e.input.charCodeAt(++e.position);i=e.input.slice(t,e.position),te.test(i)&&d(e,"tag suffix cannot contain flow indicator characters")}return i&&!ie.test(i)&&d(e,"tag name cannot contain such characters: "+i),a?e.tag=i:H.call(e.tagMap,n)?e.tag=e.tagMap[n]+i:"!"===n?e.tag="!"+i:"!!"===n?e.tag="tag:yaml.org,2002:"+i:d(e,'undeclared tag handle "'+n+'"'),!0}function N(e){var t,n;if(n=e.input.charCodeAt(e.position),38!==n)return!1;for(null!==e.anchor&&d(e,"duplication of an anchor property"),n=e.input.charCodeAt(++e.position),t=e.position;0!==n&&!o(n)&&!a(n);)n=e.input.charCodeAt(++e.position);return e.position===t&&d(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(t,e.position),!0}function T(e){var t,n,i;e.length,e.input;if(i=e.input.charCodeAt(e.position),42!==i)return!1;for(i=e.input.charCodeAt(++e.position),t=e.position;0!==i&&!o(i)&&!a(i);)i=e.input.charCodeAt(++e.position);return e.position===t&&d(e,"name of an alias node must contain at least one character"),n=e.input.slice(t,e.position),e.anchorMap.hasOwnProperty(n)||d(e,'unidentified alias "'+n+'"'),e.result=e.anchorMap[n],A(e,!0,-1),!0}function _(e,t,n,i,r){var o,a,s,u,c,l,p,f,h=1,g=!1,y=!1;if(e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=a=s=Z===n||W===n,i&&A(e,!0,-1)&&(g=!0,e.lineIndent>t?h=1:e.lineIndent===t?h=0:e.lineIndent<t&&(h=-1)),1===h)for(;F(e)||N(e);)A(e,!0,-1)?(g=!0,s=o,e.lineIndent>t?h=1:e.lineIndent===t?h=0:e.lineIndent<t&&(h=-1)):s=!1;if(s&&(s=g||r),(1===h||Z===n)&&(p=G===n||V===n?t:t+1,f=e.position-e.lineStart,1===h?s&&(O(e,f)||E(e,f,p))||I(e,p)?y=!0:(a&&S(e,p)||k(e,p)||j(e,p)?y=!0:T(e)?(y=!0,(null!==e.tag||null!==e.anchor)&&d(e,"alias node should not have any properties")):C(e,p,G===n)&&(y=!0,null===e.tag&&(e.tag="?")),null!==e.anchor&&(e.anchorMap[e.anchor]=e.result)):0===h&&(y=s&&O(e,f))),null!==e.tag&&"!"!==e.tag)if("?"===e.tag){for(u=0,c=e.implicitTypes.length;c>u;u+=1)if(l=e.implicitTypes[u],l.resolve(e.result)){e.result=l.construct(e.result),e.tag=l.tag,null!==e.anchor&&(e.anchorMap[e.anchor]=e.result);break}}else H.call(e.typeMap,e.tag)?(l=e.typeMap[e.tag],null!==e.result&&l.kind!==e.kind&&d(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+l.kind+'", not "'+e.kind+'"'),l.resolve(e.result)?(e.result=l.construct(e.result),null!==e.anchor&&(e.anchorMap[e.anchor]=e.result)):d(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):m(e,"unknown tag !<"+e.tag+">");return null!==e.tag||null!==e.anchor||y}function M(e){var t,n,a,s,u=e.position,c=!1;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};0!==(s=e.input.charCodeAt(e.position))&&(A(e,!0,-1),s=e.input.charCodeAt(e.position),!(e.lineIndent>0||37!==s));){for(c=!0,s=e.input.charCodeAt(++e.position),t=e.position;0!==s&&!o(s);)s=e.input.charCodeAt(++e.position);for(n=e.input.slice(t,e.position),a=[],n.length<1&&d(e,"directive name must not be less than one character in length");0!==s;){for(;r(s);)s=e.input.charCodeAt(++e.position);if(35===s){do s=e.input.charCodeAt(++e.position);while(0!==s&&!i(s));break}if(i(s))break;for(t=e.position;0!==s&&!o(s);)s=e.input.charCodeAt(++e.position);a.push(e.input.slice(t,e.position))}0!==s&&v(e),H.call(se,n)?se[n](e,n,a):m(e,'unknown document directive "'+n+'"')}return A(e,!0,-1),0===e.lineIndent&&45===e.input.charCodeAt(e.position)&&45===e.input.charCodeAt(e.position+1)&&45===e.input.charCodeAt(e.position+2)?(e.position+=3,A(e,!0,-1)):c&&d(e,"directives end mark is expected"),_(e,e.lineIndent-1,Z,!1,!0),A(e,!0,-1),e.checkLineBreaks&&ee.test(e.input.slice(u,e.position))&&m(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&b(e)?void(46===e.input.charCodeAt(e.position)&&(e.position+=3,A(e,!0,-1))):void(e.position<e.length-1&&d(e,"end of the stream or a document separator is expected"))}function L(e,t){e=String(e),t=t||{},0!==e.length&&(10!==e.charCodeAt(e.length-1)&&13!==e.charCodeAt(e.length-1)&&(e+="\n"),65279===e.charCodeAt(0)&&(e=e.slice(1)));var n=new f(e,t);for(X.test(n.input)&&d(n,"the stream contains non-printable characters"),n.input+="\x00";32===n.input.charCodeAt(n.position);)n.lineIndent+=1,n.position+=1;for(;n.position<n.length-1;)M(n);return n.documents}function D(e,t,n){var i,r,o=L(e,n);for(i=0,r=o.length;r>i;i+=1)t(o[i])}function U(e,t){var n=L(e,t);if(0===n.length)return void 0;if(1===n.length)return n[0];throw new $("expected a single document in the stream, but found more")}function Y(e,t,n){D(e,t,P.extend({schema:K},n))}function q(e,t){return U(e,P.extend({schema:K},t))}for(var P=e("./common"),$=e("./exception"),B=e("./mark"),K=e("./schema/default_safe"),R=e("./schema/default_full"),H=Object.prototype.hasOwnProperty,G=1,V=2,W=3,Z=4,J=1,z=2,Q=3,X=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,ee=/[\x85\u2028\u2029]/,te=/[,\[\]\{\}]/,ne=/^(?:!|!!|![a-z\-]+!)$/i,ie=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i,re=new Array(256),oe=new Array(256),ae=0;256>ae;ae++)re[ae]=l(ae)?1:0,oe[ae]=l(ae);var se={YAML:function(e,t,n){var i,r,o;null!==e.version&&d(e,"duplication of %YAML directive"),1!==n.length&&d(e,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(n[0]),null===i&&d(e,"ill-formed argument of the YAML directive"),r=parseInt(i[1],10),o=parseInt(i[2],10),1!==r&&d(e,"unacceptable YAML version of the document"),e.version=n[0],e.checkLineBreaks=2>o,1!==o&&2!==o&&m(e,"unsupported YAML version of the document")},TAG:function(e,t,n){var i,r;2!==n.length&&d(e,"TAG directive accepts exactly two arguments"),i=n[0],r=n[1],ne.test(i)||d(e,"ill-formed tag handle (first argument) of the TAG directive"),H.call(e.tagMap,i)&&d(e,'there is a previously declared suffix for "'+i+'" tag handle'),ie.test(r)||d(e,"ill-formed tag prefix (second argument) of the TAG directive"),e.tagMap[i]=r}};t.exports.loadAll=D,t.exports.load=U,t.exports.safeLoadAll=Y,t.exports.safeLoad=q},{"./common":2,"./exception":4,"./mark":6,"./schema/default_full":9,"./schema/default_safe":10}],6:[function(e,t,n){"use strict";function i(e,t,n,i,r){this.name=e,this.buffer=t,this.position=n,this.line=i,this.column=r}var r=e("./common");i.prototype.getSnippet=function(e,t){var n,i,o,a,s;if(!this.buffer)return null;for(e=e||4,t=t||75,n="",i=this.position;i>0&&-1==="\x00\r\n\u2028\u2029".indexOf(this.buffer.charAt(i-1));)if(i-=1,this.position-i>t/2-1){n=" ... ",i+=5;break}for(o="",a=this.position;a<this.buffer.length&&-1==="\x00\r\n\u2028\u2029".indexOf(this.buffer.charAt(a));)if(a+=1,a-this.position>t/2-1){o=" ... ",a-=5;break}return s=this.buffer.slice(i,a),r.repeat(" ",e)+n+s+o+"\n"+r.repeat(" ",e+this.position-i+n.length)+"^"},i.prototype.toString=function(e){var t,n="";return this.name&&(n+='in "'+this.name+'" '),n+="at line "+(this.line+1)+", column "+(this.column+1),e||(t=this.getSnippet(),t&&(n+=":\n"+t)),n},t.exports=i},{"./common":2}],7:[function(e,t,n){"use strict";function i(e,t,n){var r=[];return e.include.forEach(function(e){n=i(e,t,n)}),e[t].forEach(function(e){n.forEach(function(t,n){t.tag===e.tag&&r.push(n)}),n.push(e)}),n.filter(function(e,t){return-1===r.indexOf(t)})}function r(){function e(e){i[e.tag]=e}var t,n,i={};for(t=0,n=arguments.length;n>t;t+=1)arguments[t].forEach(e);return i}function o(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(e){if(e.loadKind&&"scalar"!==e.loadKind)throw new s("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=i(this,"implicit",[]),this.compiledExplicit=i(this,"explicit",[]),this.compiledTypeMap=r(this.compiledImplicit,this.compiledExplicit)}var a=e("./common"),s=e("./exception"),u=e("./type");o.DEFAULT=null,o.create=function(){var e,t;switch(arguments.length){case 1:e=o.DEFAULT,t=arguments[0];break;case 2:e=arguments[0],t=arguments[1];break;default:throw new s("Wrong number of arguments for Schema.create function")}if(e=a.toArray(e),t=a.toArray(t),!e.every(function(e){return e instanceof o}))throw new s("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(e){return e instanceof u}))throw new s("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new o({include:e,explicit:t})},t.exports=o},{"./common":2,"./exception":4,"./type":13}],8:[function(e,t,n){"use strict";var i=e("../schema");t.exports=new i({include:[e("./json")]})},{"../schema":7,"./json":12}],9:[function(e,t,n){"use strict";var i=e("../schema");t.exports=i.DEFAULT=new i({include:[e("./default_safe")],explicit:[e("../type/js/undefined"),e("../type/js/regexp"),e("../type/js/function")]})},{"../schema":7,"../type/js/function":18,"../type/js/regexp":19,"../type/js/undefined":20,"./default_safe":10}],10:[function(e,t,n){"use strict";var i=e("../schema");t.exports=new i({include:[e("./core")],implicit:[e("../type/timestamp"),e("../type/merge")],explicit:[e("../type/binary"),e("../type/omap"),e("../type/pairs"),e("../type/set")]})},{"../schema":7,"../type/binary":14,"../type/merge":22,"../type/omap":24,"../type/pairs":25,"../type/set":27,"../type/timestamp":29,"./core":8}],11:[function(e,t,n){"use strict";var i=e("../schema");t.exports=new i({explicit:[e("../type/str"),e("../type/seq"),e("../type/map")]})},{"../schema":7,"../type/map":21,"../type/seq":26,"../type/str":28}],12:[function(e,t,n){"use strict";var i=e("../schema");t.exports=new i({include:[e("./failsafe")],implicit:[e("../type/null"),e("../type/bool"),e("../type/int"),e("../type/float")]})},{"../schema":7,"../type/bool":15,"../type/float":16,"../type/int":17,"../type/null":23,"./failsafe":11}],13:[function(e,t,n){"use strict";function i(e){var t={};return null!==e&&Object.keys(e).forEach(function(n){e[n].forEach(function(e){t[String(e)]=n})}),t}function r(e,t){if(t=t||{},Object.keys(t).forEach(function(t){if(-1===a.indexOf(t))throw new o('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=t.kind||null,this.resolve=t.resolve||function(){return!0},this.construct=t.construct||function(e){return e},this.instanceOf=t.instanceOf||null,this.predicate=t.predicate||null,this.represent=t.represent||null,this.defaultStyle=t.defaultStyle||null,this.styleAliases=i(t.styleAliases||null),-1===s.indexOf(this.kind))throw new o('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var o=e("./exception"),a=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],s=["scalar","sequence","mapping"];t.exports=r},{"./exception":4}],14:[function(e,t,n){"use strict";function i(e){if(null===e)return!1;var t,n,i=0,r=e.length,o=c;for(n=0;r>n;n++)if(t=o.indexOf(e.charAt(n)),!(t>64)){if(0>t)return!1;i+=6}return i%8===0}function r(e){var t,n,i=e.replace(/[\r\n=]/g,""),r=i.length,o=c,a=0,u=[];for(t=0;r>t;t++)t%4===0&&t&&(u.push(a>>16&255),u.push(a>>8&255),u.push(255&a)),a=a<<6|o.indexOf(i.charAt(t));return n=r%4*6,0===n?(u.push(a>>16&255),u.push(a>>8&255),u.push(255&a)):18===n?(u.push(a>>10&255),u.push(a>>2&255)):12===n&&u.push(a>>4&255),s?new s(u):u}function o(e){var t,n,i="",r=0,o=e.length,a=c;for(t=0;o>t;t++)t%3===0&&t&&(i+=a[r>>18&63],i+=a[r>>12&63],i+=a[r>>6&63],i+=a[63&r]),r=(r<<8)+e[t];return n=o%3,0===n?(i+=a[r>>18&63],i+=a[r>>12&63],i+=a[r>>6&63],i+=a[63&r]):2===n?(i+=a[r>>10&63],i+=a[r>>4&63],i+=a[r<<2&63],i+=a[64]):1===n&&(i+=a[r>>2&63],i+=a[r<<4&63],i+=a[64],i+=a[64]),i}function a(e){return s&&s.isBuffer(e)}var s=e("buffer").Buffer,u=e("../type"),c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";t.exports=new u("tag:yaml.org,2002:binary",{kind:"scalar",resolve:i,construct:r,predicate:a,represent:o})},{"../type":13,buffer:30}],15:[function(e,t,n){"use strict";function i(e){if(null===e)return!1;var t=e.length;return 4===t&&("true"===e||"True"===e||"TRUE"===e)||5===t&&("false"===e||"False"===e||"FALSE"===e);
        }function r(e){return"true"===e||"True"===e||"TRUE"===e}function o(e){return"[object Boolean]"===Object.prototype.toString.call(e)}var a=e("../type");t.exports=new a("tag:yaml.org,2002:bool",{kind:"scalar",resolve:i,construct:r,predicate:o,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"})},{"../type":13}],16:[function(e,t,n){"use strict";function i(e){if(null===e)return!1;return c.test(e)?!0:!1}function r(e){var t,n,i,r;return t=e.replace(/_/g,"").toLowerCase(),n="-"===t[0]?-1:1,r=[],0<="+-".indexOf(t[0])&&(t=t.slice(1)),".inf"===t?1===n?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:".nan"===t?NaN:0<=t.indexOf(":")?(t.split(":").forEach(function(e){r.unshift(parseFloat(e,10))}),t=0,i=1,r.forEach(function(e){t+=e*i,i*=60}),n*t):n*parseFloat(t,10)}function o(e,t){if(isNaN(e))switch(t){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(t){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(t){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(s.isNegativeZero(e))return"-0.0";return e.toString(10)}function a(e){return"[object Number]"===Object.prototype.toString.call(e)&&(0!==e%1||s.isNegativeZero(e))}var s=e("../common"),u=e("../type"),c=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)\\.[0-9_]*(?:[eE][-+][0-9]+)?|\\.[0-9_]+(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");t.exports=new u("tag:yaml.org,2002:float",{kind:"scalar",resolve:i,construct:r,predicate:a,represent:o,defaultStyle:"lowercase"})},{"../common":2,"../type":13}],17:[function(e,t,n){"use strict";function i(e){return e>=48&&57>=e||e>=65&&70>=e||e>=97&&102>=e}function r(e){return e>=48&&55>=e}function o(e){return e>=48&&57>=e}function a(e){if(null===e)return!1;var t,n=e.length,a=0,s=!1;if(!n)return!1;if(t=e[a],("-"===t||"+"===t)&&(t=e[++a]),"0"===t){if(a+1===n)return!0;if(t=e[++a],"b"===t){for(a++;n>a;a++)if(t=e[a],"_"!==t){if("0"!==t&&"1"!==t)return!1;s=!0}return s}if("x"===t){for(a++;n>a;a++)if(t=e[a],"_"!==t){if(!i(e.charCodeAt(a)))return!1;s=!0}return s}for(;n>a;a++)if(t=e[a],"_"!==t){if(!r(e.charCodeAt(a)))return!1;s=!0}return s}for(;n>a;a++)if(t=e[a],"_"!==t){if(":"===t)break;if(!o(e.charCodeAt(a)))return!1;s=!0}return s?":"!==t?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(a)):!1}function s(e){var t,n,i=e,r=1,o=[];return-1!==i.indexOf("_")&&(i=i.replace(/_/g,"")),t=i[0],("-"===t||"+"===t)&&("-"===t&&(r=-1),i=i.slice(1),t=i[0]),"0"===i?0:"0"===t?"b"===i[1]?r*parseInt(i.slice(2),2):"x"===i[1]?r*parseInt(i,16):r*parseInt(i,8):-1!==i.indexOf(":")?(i.split(":").forEach(function(e){o.unshift(parseInt(e,10))}),i=0,n=1,o.forEach(function(e){i+=e*n,n*=60}),r*i):r*parseInt(i,10)}function u(e){return"[object Number]"===Object.prototype.toString.call(e)&&0===e%1&&!c.isNegativeZero(e)}var c=e("../common"),l=e("../type");t.exports=new l("tag:yaml.org,2002:int",{kind:"scalar",resolve:a,construct:s,predicate:u,represent:{binary:function(e){return"0b"+e.toString(2)},octal:function(e){return"0"+e.toString(8)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return"0x"+e.toString(16).toUpperCase()}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}})},{"../common":2,"../type":13}],18:[function(e,t,n){"use strict";function i(e){if(null===e)return!1;try{var t="("+e+")",n=s.parse(t,{range:!0});return"Program"!==n.type||1!==n.body.length||"ExpressionStatement"!==n.body[0].type||"FunctionExpression"!==n.body[0].expression.type?!1:!0}catch(i){return!1}}function r(e){var t,n="("+e+")",i=s.parse(n,{range:!0}),r=[];if("Program"!==i.type||1!==i.body.length||"ExpressionStatement"!==i.body[0].type||"FunctionExpression"!==i.body[0].expression.type)throw new Error("Failed to resolve function");return i.body[0].expression.params.forEach(function(e){r.push(e.name)}),t=i.body[0].expression.body.range,new Function(r,n.slice(t[0]+1,t[1]-1))}function o(e){return e.toString()}function a(e){return"[object Function]"===Object.prototype.toString.call(e)}var s;try{s=e("esprima")}catch(u){"undefined"!=typeof window&&(s=window.esprima)}var c=e("../../type");t.exports=new c("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:i,construct:r,predicate:a,represent:o})},{"../../type":13,esprima:"esprima"}],19:[function(e,t,n){"use strict";function i(e){if(null===e)return!1;if(0===e.length)return!1;var t=e,n=/\/([gim]*)$/.exec(e),i="";if("/"===t[0]){if(n&&(i=n[1]),i.length>3)return!1;if("/"!==t[t.length-i.length-1])return!1;t=t.slice(1,t.length-i.length-1)}try{new RegExp(t,i);return!0}catch(r){return!1}}function r(e){var t=e,n=/\/([gim]*)$/.exec(e),i="";return"/"===t[0]&&(n&&(i=n[1]),t=t.slice(1,t.length-i.length-1)),new RegExp(t,i)}function o(e){var t="/"+e.source+"/";return e.global&&(t+="g"),e.multiline&&(t+="m"),e.ignoreCase&&(t+="i"),t}function a(e){return"[object RegExp]"===Object.prototype.toString.call(e)}var s=e("../../type");t.exports=new s("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:i,construct:r,predicate:a,represent:o})},{"../../type":13}],20:[function(e,t,n){"use strict";function i(){return!0}function r(){return void 0}function o(){return""}function a(e){return"undefined"==typeof e}var s=e("../../type");t.exports=new s("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:i,construct:r,predicate:a,represent:o})},{"../../type":13}],21:[function(e,t,n){"use strict";var i=e("../type");t.exports=new i("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return null!==e?e:{}}})},{"../type":13}],22:[function(e,t,n){"use strict";function i(e){return"<<"===e||null===e}var r=e("../type");t.exports=new r("tag:yaml.org,2002:merge",{kind:"scalar",resolve:i})},{"../type":13}],23:[function(e,t,n){"use strict";function i(e){if(null===e)return!0;var t=e.length;return 1===t&&"~"===e||4===t&&("null"===e||"Null"===e||"NULL"===e)}function r(){return null}function o(e){return null===e}var a=e("../type");t.exports=new a("tag:yaml.org,2002:null",{kind:"scalar",resolve:i,construct:r,predicate:o,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"})},{"../type":13}],24:[function(e,t,n){"use strict";function i(e){if(null===e)return!0;var t,n,i,r,o,u=[],c=e;for(t=0,n=c.length;n>t;t+=1){if(i=c[t],o=!1,"[object Object]"!==s.call(i))return!1;for(r in i)if(a.call(i,r)){if(o)return!1;o=!0}if(!o)return!1;if(-1!==u.indexOf(r))return!1;u.push(r)}return!0}function r(e){return null!==e?e:[]}var o=e("../type"),a=Object.prototype.hasOwnProperty,s=Object.prototype.toString;t.exports=new o("tag:yaml.org,2002:omap",{kind:"sequence",resolve:i,construct:r})},{"../type":13}],25:[function(e,t,n){"use strict";function i(e){if(null===e)return!0;var t,n,i,r,o,s=e;for(o=new Array(s.length),t=0,n=s.length;n>t;t+=1){if(i=s[t],"[object Object]"!==a.call(i))return!1;if(r=Object.keys(i),1!==r.length)return!1;o[t]=[r[0],i[r[0]]]}return!0}function r(e){if(null===e)return[];var t,n,i,r,o,a=e;for(o=new Array(a.length),t=0,n=a.length;n>t;t+=1)i=a[t],r=Object.keys(i),o[t]=[r[0],i[r[0]]];return o}var o=e("../type"),a=Object.prototype.toString;t.exports=new o("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:i,construct:r})},{"../type":13}],26:[function(e,t,n){"use strict";var i=e("../type");t.exports=new i("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return null!==e?e:[]}})},{"../type":13}],27:[function(e,t,n){"use strict";function i(e){if(null===e)return!0;var t,n=e;for(t in n)if(a.call(n,t)&&null!==n[t])return!1;return!0}function r(e){return null!==e?e:{}}var o=e("../type"),a=Object.prototype.hasOwnProperty;t.exports=new o("tag:yaml.org,2002:set",{kind:"mapping",resolve:i,construct:r})},{"../type":13}],28:[function(e,t,n){"use strict";var i=e("../type");t.exports=new i("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return null!==e?e:""}})},{"../type":13}],29:[function(e,t,n){"use strict";function i(e){if(null===e)return!1;var t;return t=s.exec(e),null===t?!1:!0}function r(e){var t,n,i,r,o,a,u,c,l,p,f=0,h=null;if(t=s.exec(e),null===t)throw new Error("Date resolve error");if(n=+t[1],i=+t[2]-1,r=+t[3],!t[4])return new Date(Date.UTC(n,i,r));if(o=+t[4],a=+t[5],u=+t[6],t[7]){for(f=t[7].slice(0,3);f.length<3;)f+="0";f=+f}return t[9]&&(c=+t[10],l=+(t[11]||0),h=6e4*(60*c+l),"-"===t[9]&&(h=-h)),p=new Date(Date.UTC(n,i,r,o,a,u,f)),h&&p.setTime(p.getTime()-h),p}function o(e){return e.toISOString()}var a=e("../type"),s=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?)?$");t.exports=new a("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:i,construct:r,instanceOf:Date,represent:o})},{"../type":13}],30:[function(e,t,n){},{}],"/":[function(e,t,n){"use strict";var i=e("./lib/js-yaml.js");t.exports=i},{"./lib/js-yaml.js":1}]},{},[])("/")});
        
        ;
        
        // source: plugin/yamlpatcher/js/yamlpatcher.js
        $(function() {
            function YamlPatcherViewModel(parameters) {
                var self = this;
        
                self.settingsViewModel = parameters[0];
        
                self.diffView = undefined;
        
                self.patch = ko.observable();
                self.diff = ko.observableArray([{"text": "Preview...", "css": "separator"}]);
        
                self.patchJson = ko.observable();
                self.toBeApplied = ko.observable();
        
                self.invalidInput = ko.observable(false);
        
                self.previewing = ko.observable(false);
                self.applying = ko.observable(false);
        
                self.patch.subscribe(function(newValue) {
                    self.toBeApplied(undefined);
                    self.patchJson(undefined);
                    self.invalidInput(false);
        
                    if (!newValue) {
                        return;
                    }
        
                    if (self._parseAsYamlpatch(newValue)) {
                        return;
                    }
                    log.debug("Input is not a valid Yamlpatcher patch, trying to parse as YAML");
        
                    if (self._parseAsYaml(newValue)) {
                        return;
                    }
                    log.debug("Input is not valid YAML either");
                    self.invalidInput(true);
                });
        
                self._parseAsYamlpatch = function(data) {
                    try {
                        var patch = JSON.parse(data);
                        if (self._validateYamlPatch(patch)) {
                            self.patchJson(patch);
                            self.invalidInput(false);
                            return true;
                        }
                    } catch (e) {
                    }
        
                    return false;
                };
        
                self._parseAsYaml = function(data) {
                    try {
                        var lines = data.split("\n");
                        lines = _.filter(lines, function(line) {
                            return line.trim() != "...";
                        });
        
                        var node = jsyaml.load(lines.join("\n"));
        
                        if (!_.isPlainObject(node)) {
                            return false;
                        }
        
                        var keys = _.keys(node);
                        var path = [];
        
                        while (_.isPlainObject(node) && keys.length == 1) {
                            path.push(keys[0]);
                            node = node[keys[0]];
                            keys = _.keys(node);
                        }
        
                        if (path.length == 0 && !_.isPlainObject(node)) {
                            return false;
                        }
        
                        var nodes = [];
                        if (path.length == 0) {
                            _.each(keys, function(key) {
                                nodes.push([[key], node[key]]);
                            });
                        } else {
                            nodes.push([path, node]);
                        }
        
                        var patch = [];
                        _.each(nodes, function(entry) {
                            var p = entry[0];
                            var n = entry[1];
        
                            if (_.isPlainObject(n)) {
                                patch.push(["merge", p.join("."), n]);
                            } else if (_.isArray(n)) {
                                patch.push(["append", p.join("."), n]);
                            } else {
                                patch.push(["set", p.join("."), n]);
                            }
                        });
        
                        log.info("Loaded json from YAML:", patch);
                        if (self._validateYamlPatch(patch)) {
                            self.patchJson(patch);
                            self.invalidInput(false);
                            return true;
                        }
                    } catch (e2) {
                    }
        
                    return false;
                };
        
                self._validateYamlPatch = function(patch) {
                    if (!_.isArray(patch)) {
                        return false;
                    }
        
                    return _.every(patch, function(p) {
                        if (!_.isArray(p) || p.length != 3) {
                            return false;
                        }
        
                        if (!_.isString(p[0])) {
                            return false;
                        }
        
                        if (!_.isString(p[1]) && !_.isArray(p[1])) {
                            return false;
                        }
        
                        if (p[0] == "merge" && !(_.isArray(p[2]) || _.isPlainObject(p[2]) || _.isString(p[2]))) {
                            return false;
                        }
        
                        return true;
                    });
                };
        
                self.preview = function() {
                    var patch = self.patchJson();
                    if (!self.patchJson()) {
                        return;
                    }
        
                    self.previewing(true);
                    $.ajax({
                        url: API_BASEURL + "plugin/yamlpatcher",
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            command: "preview",
                            target: "settings",
                            patch: patch
                        }),
                        contentType: "application/json; charset=UTF-8",
                        success: function(response) {
                            self.previewing(false);
        
                            var contextSize = 3;
                            var diff = JsDiff.diffLines(response.old, response.new);
        
                            self.diff.removeAll();
        
                            if (diff.length <= 1) {
                                // no changes
                                self.diff.push({text: "No changes!", css: "separator"});
                                return;
                            }
        
                            self.toBeApplied(patch);
        
                            var unchanged = "";
                            var beginning = true;
                            var context, before, after, hidden;
        
                            _.each(diff, function(part) {
                                if (!part.added && !part.removed) {
                                    unchanged += part.value;
                                } else {
                                    if (unchanged) {
                                        context = unchanged.split("\n");
        
                                        if (context.length > contextSize * 2) {
                                            before = context.slice(0, contextSize);
                                            after = context.slice(-contextSize - 1);
        
                                            if (!beginning) {
                                                hidden = context.length - 2 * contextSize;
                                                self.diff.push({text: before.join("\n"), css: "unchanged"});
                                                self.diff.push({text: "\n[... " + hidden + " lines ...]\n", css: "separator"});
                                            } else {
                                                hidden = context.length - contextSize;
                                                self.diff.push({text: "[... " + hidden + " lines ...]\n", css: "separator"});
                                            }
                                            self.diff.push({text: after.join("\n"), css: "unchanged"});
                                        } else {
                                            self.diff.push({text: context.join("\n"), css: "unchanged"})
                                        }
                                        unchanged = "";
                                        beginning = false;
                                    }
        
                                    var css = part.added ? "added" : "removed";
                                    self.diff.push({text: part.value, css: css});
                                }
                            });
        
                            if (unchanged) {
                                context = unchanged.split("\n");
        
                                if (context.length > contextSize) {
                                    hidden = context.length - contextSize;
                                    context = context.slice(0, contextSize);
                                    self.diff.push({text: context.join("\n"), css: "unchanged"});
                                    self.diff.push({text: "\n[... " + hidden + " lines ...]", css: "separator"});
                                } else {
                                    self.diff.push({text: context.join("\n"), css: "unchanged"});
                                }
                            }
                        },
                        error: function(xhr) {
                            self.previewing(false);
                            var html = gettext("The patch could not be previewed.");
                            html += pnotifyAdditionalInfo('<pre style="overflow: auto">' + xhr.responseText + '</pre>');
                            new PNotify({
                                title: gettext("Preview failed"),
                                text: html,
                                type: "error"
                            })
                        }
                    })
                };
        
                self.apply = function() {
                    if (!self.toBeApplied()) {
                        return;
                    }
        
                    self.applying(true);
                    $.ajax({
                        url: API_BASEURL + "plugin/yamlpatcher",
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            command: "apply",
                            target: "settings",
                            patch: self.toBeApplied()
                        }),
                        contentType: "application/json; charset=UTF-8",
                        success: function() {
                            if (!self.settingsViewModel.hasOwnProperty("onEventSettingsUpdated")) {
                                self.settingsViewModel.requestData();
                            }
                            self._applied();
                        },
                        error: function(xhr) {
                            self.applying(false);
                            var html = gettext("The patch could not be applied successfully.");
                            html += pnotifyAdditionalInfo('<pre style="overflow: auto">' + xhr.responseText + '</pre>');
                            new PNotify({
                                title: gettext("Patch failed"),
                                text: html,
                                type: "error"
                            })
                        }
                    });
                };
        
                self._applied = function() {
                    self.applying(false);
                    self.patch("");
                    self.diff.removeAll();
                    self.toBeApplied(undefined);
                };
        
                self.onStartup = function() {
                    self.diffView = $("#settings_plugin_yamlpatcher_diffView");
                };
            }
        
            OCTOPRINT_VIEWMODELS.push([
                YamlPatcherViewModel,
                ["settingsViewModel"],
                "#settings_plugin_yamlpatcher"
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin yamlpatcher:", (error.stack || error));
    }
})();
