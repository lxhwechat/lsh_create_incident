/*
 * Util.js testsuite
 */
 
 /*global sm*/
QUnit.config.testTimeout = 60000;

// test alias, relative path from Util.testsuite.qunit.js to the test resources
jQuery.sap.registerModulePath("sm.itsm.createincidentTest", "test-files");

jQuery.sap.require("sm.itsm.createincidentTest.ModulePathForTests");
sm.itsm.createincidentTest.ModulePathForTests.registerModulePathForTests("sm.itsm.createincident");


jQuery.sap.require("sm.itsm.createincidentTest.UtilTest");
// jQuery.sap.require("sm.itsm.createincidentTest.ComponentTest");
jQuery.sap.require("sm.itsm.createincidentTest.DetailsControllerTest");