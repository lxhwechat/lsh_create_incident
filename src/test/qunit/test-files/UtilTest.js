sap.ui.define([
	"sm/itsm/createincident/util/Util"
], function(Util) {
	"use strict";

	module("util.UtilTest", {
		setup: function() {
			Util.init();
		},
		teardown: function() {

		}
	});

	test("Check if ProcType Description is empty on start", function() {

		// Instantiate the object to be tested
		// A placeholder for the actual result
		var actualResult;
		// Input parameters for the tested function    
		// Call the tested function
		if (typeof objectToTest === "function") {
			actualResult = Util.prototype.getProcTypeDesc();
		} else {
			actualResult = Util.getProcTypeDesc();
		}
		// Assertion calls
		equal(actualResult, "", "Proc type desxcription is empty");
	});
	
	test("Check if ProcType Description is can be set", function() {
		Util.setProcTypeDesc("Test Proc Type");
		
		equal(Util.getProcTypeDesc(), "Test Proc Type", "Proc type description is set");
		
	});
	
	
	test("Model can be set", function() {
		var TestModel = new sap.ui.model.json.JSONModel({
				title: "",
				priority: "",
				category: "",
				categoryId: "",
				component: "",
				configItem: "",
				contactPerson: "",
				description: ""
			});
		Util.setModel(TestModel);
		
			equal(Util.getModel(),TestModel, "Model can be set");
	});

});