sap.ui.define([
	"sm/itsm/createincident/Component",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(Component) {
	"use strict";

	module("ComponentTest", {
		setup: function() {
			this.oComponent = new Component();
		},

		teardown: function() {

		}
	});

	test("Check external URL Passing", function() {

		var aStartUpParamaters = {
			title: ["This is my unit test"],
			component: ["SV-SMG-SUP"],
			priority: ["1"],
			category: ["AIC_02"],
			configitem: ["71092312"],
			contactperson: ["134"],
			description: ["Hi, this is just a description, which I use for unit testing !"]
		};
		
		this.oComponent.setValuesFromStartupParameters(aStartUpParamaters);                         

		// Assertion calls
		equal(this.oComponent.getTitle(), "This is my unit test", "Title has been set from startup parameters");
		equal(this.oComponent.getComponent(), "SV-SMG-SUP", "Component has been set from startup parameters");
		equal(this.oComponent.getCategory(), "AIC_02", "Category has been set from startup parameters");
		equal(this.oComponent.getPriority(), "1", "Priority has been set from startup parameters");
		equal(this.oComponent.getConfigItem(), "71092312", "ConfigItem has been set from startup parameters");
		equal(this.oComponent.getContactPerson(), "134", "ContactPerson has been set from startup parameters");
		equal(this.oComponent.getDescription(), "Hi, this is just a description, which I use for unit testing !", "Description has been set from startup parameters");
		ok( (this.oComponent.getConfigItem() !== "Rubbish"), "Check if ConfigItem has not been set to another value" );
		
		
		
	});
	
	test("Set / Get Methods in Component.js", function() {
			this.oComponent.setTitle("NewTitle");
			equal(this.oComponent.getTitle(), "NewTitle" , "Title has been set from setMethod");
			this.oComponent.setComponent("Test");
			equal(this.oComponent.getComponent(), "Test" , "New Component has been set from setMethod");
			this.oComponent.setCategory("NewCategory");
			equal(this.oComponent.getCategory(), "NewCategory" , "Categroy has been set from setMethod");
			this.oComponent.setTitle("NewerTitle");
			equal(this.oComponent.getTitle(), "NewerTitle" , "Newer Title has been set from setMethod");
			this.oComponent.setPriority(1);
			equal(this.oComponent.getPriority(), 1 , "Priority has been set from setMethod");
			this.oComponent.setConfigItem("123456789");
			equal(this.oComponent.getConfigItem(), "123456789" , "ConfigItem has been set from setMethod");	
			this.oComponent.setContactPerson("123");
			equal(this.oComponent.getContactPerson(), "123" , "Contact Person has been set from setMethod");		
			this.oComponent.setDescription("I'm just a test ...");
			equal(this.oComponent.getDescription(), "I'm just a test ..." , "Description has been set from setMethod");		
	});	

});