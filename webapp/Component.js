sap.ui.define([
	"sap/ui/core/UIComponent",
	"zwx/sm/itsm/createincident/util/Util",
	"sap/ui/core/routing/History",
	"zwx/sm/itsm/createincident/model/models"
], function(UIComponent, Util, History, models) {
	"use strict";

	return UIComponent.extend("zwx.sm.itsm.createincident.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			// call super init (will call function "create content")
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			var that = this;
			Util.init();
			this.clientModel = new sap.ui.model.json.JSONModel({
				title: "",
				// priority: "",
				category: "",
				categoryId: "",
				component: "",
				configItem: "",
				contactPerson: "",
				description: ""
			});
			this.setModel(this.clientModel, "incident");

			// Check for URL Parameters and set Value in the Model

			if (this.oComponentData) {
				this.setValuesFromStartupParameters(this.oComponentData.startupParameters);

				if (this.oComponentData.startupParameters.PROCESS_TYPE) {
					this.sValueProcessType = this.oComponentData.startupParameters.PROCESS_TYPE[0];
				}

				if (this.oComponentData.startupParameters.sapWxDelegater) {
					// init ODataModel header
					this.getModel().setHeaders({"sap-wx-delegater":this.oComponentData.startupParameters.sapWxDelegater[0]});
					// this.getModel().setHeaders({
					// 	"Authorization":"Bearer " + "AFBWh2xvHuin2eUDHYCOLlakVYHRjqDOHGV3R4ISrfkGXvM9"
					// });
					//
				}
			} else {
				this.oComponentData = {
					startupParameters: {}
				};
			}

			//////////
			// test
			//////////
			// this.getModel().setHeaders({"Authorization": "Basic U0FQX09MSVZFUjpTb2xtYW43MjA="});
			//////////
			// test
			//////////

			this.getModel().read("/ProcessTypeSet", {
				success: function(oResponse) {

					if (oResponse.results.length === 0) {
						Util.showErrorMessageBox(that.getModel("i18n").getResourceBundle(), "ERROR_CONTACT_SYSADMIN", "NO_VALID_PROCESS_TYPE", null,
							null, that.onErrorClose);
					}

					if (that.sValueProcessType) {
						if (!Util.isProcessTypeValid(that.sValueProcessType, oResponse.results)) {
							Util.showErrorMessageBox(that.getModel("i18n").getResourceBundle(), "ERROR_CONTACT_SYSADMIN", "NO_VALID_PROCESS_TYPE", null,
								null, that.onErrorClose);
							that.sValueProcessType = undefined;
						}
					} else {
						if (oResponse.results.length === 1) {
							that.sValueProcessType = oResponse.results[0].ProcessTypeCode;
						}
					}

					that.getRouter().initialize();
					var bReplace = sap.ui.Device.system.phone ? false : true;
					if (that.sValueProcessType) {

						that.getRouter().navTo("details", {
							from: "main",
							entity: that.sValueProcessType,
							tab: null
						}, bReplace);
					} else {

						Util.bShowNavButton = true;
						that.getRouter().navTo("main", {

							entity: that.sValueProcessType,
							tab: null
						}, bReplace);
					}

				},
				error: function() {
					Util.showErrorMessageBox(that.getModel("i18n").getResourceBundle(), "ERROR_CONTACT_SYSADMIN", "NO_VALID_PROCESS_TYPE", null,
						null, that.onErrorClose);

				}
			});

			// initialize router and navigate to the first page
			//

		},

		onErrorClose: function() {
			if (Util.hasCancelListener()) {
				this.eventBus.publish("zwx.sm.itsm.createincident", "afterCancel");
			} else {
				Util.navToLaunchpad();
			}
		},

		setValuesFromStartupParameters: function(startupParameters) {

			if (startupParameters.title) {
				this.setTitle(startupParameters.title[0]);
			}
			// Component
			if (startupParameters.component) {
				this.setComponent(startupParameters.component[0]);
			}
			// // Priority
			// if (startupParameters.priority) {
			// 	this.setPriority(startupParameters.priority[0]);
			// }
			// Category
			if (startupParameters.category) {
				this.setCategory(startupParameters.category[0]);
			}
			// Configuration Item
			if (startupParameters.configitem) {
				this.setConfigItem(startupParameters.configitem[0]);
			}
			// Contact Person
			if (startupParameters.contactperson) {
				this.setContactPerson(startupParameters.contactperson[0]);
			}
			// Description
			if (startupParameters.description) {
				this.setDescription(startupParameters.description[0]);
			}

		},
		setComponent: function(sComponent) {
			this.getModel("incident").setProperty("/component", sComponent);
		},
		// setPriority: function(sPriority) {
		// 	this.getModel("incident").setProperty("/priority", sPriority);
		// },
		setTitle: function(sTitle) {
			this.getModel("incident").setProperty("/title", sTitle);
		},
		setCategory: function(sCategory) {
			this.getModel("incident").setProperty("/categoryId", sCategory);
		},
		setConfigItem: function(sConfigItem) {
			this.getModel("incident").setProperty("/configItem", sConfigItem);
		},
		setContactPerson: function(sContactPerson) {
			this.getModel("incident").setProperty("/contactPerson", sContactPerson);
		},
		setDescription: function(sDescription) {
			this.getModel("incident").setProperty("/description", sDescription);
		},
		getComponent: function() {
			return this.getModel("incident").getProperty("/component");
		},
		// getPriority: function() {
		// 	return this.getModel("incident").getProperty("/priority");
		// },
		getTitle: function() {
			return this.getModel("incident").getProperty("/title");
		},
		getCategory: function() {
			return this.getModel("incident").getProperty("/categoryId");
		},
		getConfigItem: function() {
			return this.getModel("incident").getProperty("/configItem");
		},
		getContactPerson: function() {
			return this.getModel("incident").getProperty("/contactPerson");
		},
		getDescription: function() {
			return this.getModel("incident").getProperty("/description");
		}
	});
});
