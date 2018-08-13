sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/TablePersoController",
	"zwx/sm/itsm/createincident/util/Util"
], function(Controller, TablePersoController, Util) {
	"use strict";

	return Controller.extend("zwx.sm.itsm.createincident.view.Master", {

		_oCatalog: null,
		_oResourceBundle: null,

		onInit: function() {

			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			this._oResourceBundle = this._oComponent.getModel("i18n").getResourceBundle();
			this._oRouter = this._oComponent.getRouter();
			this._oCatalog = this.byId("catalogTable");
			this._oRouter.attachRoutePatternMatched(this._onRoutePatternMatched, this);
		
		},


		_onRoutePatternMatched: function(oEvent) {
			if (oEvent.getParameter("name") !== "details") {
				return;
			}

		},

		// --- List Handling

		// Handler method for the table search.
		onSearchPressed: function() {
			var sValue = this.byId("searchField").getValue();
			var oFilter = new sap.ui.model.Filter("Description",
				sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = this.byId("catalogTable").getBinding("items");
			oBinding.filter([oFilter]);
		},

		// --- Navigation
		onLineItemPressed: function(oEvent) {
			var bReplace = sap.ui.Device.system.phone ? false : true;

			Util.setProcTypeDesc(oEvent.getSource().getAggregation("cells")[1].getProperty("text"));

			this._oRouter.navTo("details", {
				from: "main",
				entity: oEvent.getSource().getAggregation("cells")[0].getProperty("title"),
				tab: null
			}, bReplace);
		}
	});
});