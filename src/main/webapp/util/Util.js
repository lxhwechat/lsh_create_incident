sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox",
		"sap/ui/comp/valuehelpdialog/ValueHelpDialog"
], function(Object, MessageBox, ValueHelpDialog) {
	"use strict";

	return {

		init: function() {

			this.bShowNavButton = false;
			this.busyDialogBuffer = [];
			this.createdObejctId = "";
			this.validateStatus = true;
			this.ProcTypeDescription = "";
			this.myIncidentsAvailable = false;
			this.checkForDisplayApp();
			this.eventBus = sap.ui.getCore().getEventBus();

		},

		isIntentSupported: function(semanticObject, action, parameters) {
			//Check parameters
			if (!(semanticObject && action)) {
				jQuery.sap.log.error("Util.isIntentSupported called without semantic object or action: (" + semanticObject + ", " + action + ")");
				return false;
			}

			//Build intent string
			var intent = "#" + semanticObject + "-" + action;
			if (parameters) {
				intent += "?" + parameters;
			}
			//Call is async, create deferred object to pass result to called
			var deferredResult = jQuery.Deferred();
			//Call service and check response
			sap.ushell.Container.getService("CrossApplicationNavigation").isIntentSupported([intent]).done(function(oContainer) {
				//Return value may be undefined
				if (oContainer[intent].supported === false) {
					deferredResult.resolve(false);
				} else {
					deferredResult.resolve(true);
				}
			});
			//Default to true if service returned undefined value.
			return deferredResult;
		},

		checkForDisplayApp: function() {
			var that = this;
			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

				oCrossAppNavigator.isNavigationSupported([{
					target: {
						semanticObject: "Action",
						action: "SMMyIncidents"
					}
				}]).done(function(aResponses) {
					if (aResponses[0].supported === true) {
						that.myIncidentsAvailable = true;
					} else {
						that.myIncidentsAvailable = false;
					}
				}).fail(function() {
					that.myIncidentsAvailable = false;
				});

			}
		},

		getCategoryDescription: function(oModel, catId, procType, oInputCategory) {
			var that = this;
			var fnSuccess = function(oData) {

				if (oData.getCategoryDescription.catDescription) {
					that.oInputCategory.setValue(oData.getCategoryDescription.catDescription);
					that.oInputCategory.data("CategoryId", oData.getCategoryDescription.catID);
					that.oInputCategory.data("CategoryCatalogType", oData.getCategoryDescription.catCatalogType);
					that.oInputCategory.data("CategoryAspId", oData.getCategoryDescription.catAspectID);

				}
			};

			var fnError = function() {};

			that.oInputCategory = oInputCategory;
			var url = "/getCategoryDescription";

			oModel.callFunction(url, {
				method: "GET",
				urlParameters: {
					"catId": catId,
					"procType": procType
				},
				success: fnSuccess,
				error: fnError
			});
		},

		getDefaultPriority: function(oModel, procType, oInputPrio) {
			var that = this;

			var fnSuccess = function(oData) {

				if (oData.getDefaultPriority.defaultPrio) {
					that.oInputPrio.setSelectedKey(oData.getDefaultPriority.defaultPrio);
				}
			};

			var fnError = function() {};

			that.oInputPrio = oInputPrio;

			var url = "/getDefaultPriority";

			oModel.callFunction(url, {
				method: "GET",
				urlParameters: {
					"ProcessType": procType
				},
				success: fnSuccess,
				error: fnError
			});
		},

		getBusyDialog: function(id, oTitle, oView, oController) {

			var oDialog;

			$.each(this.busyDialogBuffer, function(index, value) {
				if (value.id === id) {

					oDialog = {
						id: value.id,
						title: value.title,
						view: value.view,
						dialog: value.dialog

					};
				}
			});

			// instantiate dialog
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(id, "sm.itsm.createincident.view.fragments.BusyDialog", oController);
				oView.addDependent(oDialog);
				oDialog.setTitle(oTitle);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, oDialog);
				oDialog = {
					id: id,
					title: oTitle,
					view: oView,
					dialog: oDialog

				};

				this.busyDialogBuffer.push(oDialog);

			}

			return oDialog.dialog;

		},

		showErrorMessageBox: function(resourceBundle, message, messageTitle, goBack, details, onClose) {

			var errorMessage, errorMessageTitle;
			if (resourceBundle) {
				errorMessage = resourceBundle.getText(message);
				errorMessageTitle = resourceBundle.getText(messageTitle);
			} else {
				errorMessage = message;
			}

			// if the optional details parameter has been specified
			if (!details) {
				MessageBox.show(errorMessage, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: errorMessageTitle,
					actions: resourceBundle.getText("CLOSE_POPUP"),
					onClose: onClose,
					initialFocus: null

				});
			}
			//
			else {
				MessageBox.show(errorMessage, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: errorMessageTitle,
					actions: resourceBundle.getText("CLOSE_POPUP"),
					onClose: onClose,
					initialFocus: null,
					verticalScrolling: true,
					horizontalScrolling: true,
					details: details
				});
			}
		},

		validateComponent: function(oModel, compId, oInputComponent) {
			var that = this;
			var fnSuccess = function(oData) {
				if (!oData.validateComponent.valid) {
					that.oInputComponent.setValue("");
				}
			};

			var fnError = function() {};

			that.oInputComponent = oInputComponent;

			oModel.setUseBatch(false);
			var url = "/validateComponent";

			oModel.callFunction(url, {
				method: "GET",
				urlParameters: {
					"compId": compId
				},
				success: fnSuccess,
				error: fnError
			});
			oModel.setUseBatch(true);
		},

		validateConfigItem: function(oModel, configItemId, oInputConfigItem) {
			var that = this;
			var fnSuccess = function(oData) {
				if (!oData.validateConfigItem.valid) {
					that.oInputConfigItem.setValue("");
				}
			};

			var fnError = function() {};

			that.oInputConfigItem = oInputConfigItem;

			oModel.setUseBatch(false);
			var url = "/validateConfigItem";

			oModel.callFunction(url, {
				method: "GET",
				urlParameters: {
					"configItemId": configItemId
				},
				success: fnSuccess,
				error: fnError
			});
			oModel.setUseBatch(true);
		},

		validateContactPerson: function(oModel, bpId, oInputContactPerson) {
			var that = this;
			var fnSuccess = function(oData) {
				if (!oData.validateContactPerson.valid) {
					that.oInputContactPerson.setValue("");
				}
			};

			var fnError = function() {};

			that.oInputContactPerson = oInputContactPerson;

			oModel.setUseBatch(false);
			var url = "/validateContactPerson";

			oModel.callFunction(url, {
				method: "GET",
				urlParameters: {
					"bpId": bpId
				},
				success: fnSuccess,
				error: fnError
			});
			oModel.setUseBatch(true);

		},

		getConfigItemDescription: function(oModel, configItemId, oInputConfigItem) {
			var that = this;
			var fnSuccess = function(oData) {
				if (!oData.getConfigItemDescription.configItemDescription) {
					that.oInputConfigItem.setValue("");
				} else {
					that.oInputConfigItem.setValue(oData.getConfigItemDescription.configItemDescription);
					that.oInputConfigItem.data("type", oData.getConfigItemDescription.configItemId);
				}
			};

			var fnError = function() {};

			that.oInputConfigItem = oInputConfigItem;

			oModel.setUseBatch(false);
			var url = "/getConfigItemDescription";

			oModel.callFunction(url, {
				method: "GET",
				urlParameters: {
					"configItemId": configItemId
				},
				success: fnSuccess,
				error: fnError
			});
			oModel.setUseBatch(true);
		},

		getContactPersonDescription: function(oModel, bpId, oInputContactPerson) {
			var that = this;
			var fnSuccess = function(oData) {
				if (!oData.getContactPersonDescription.contactPersonDescription) {
					that.oInputContactPerson.setValue("");
				} else {
					that.oInputContactPerson.setValue(oData.getContactPersonDescription.contactPersonDescription);
					that.oInputContactPerson.data("type", oData.getContactPersonDescription.contactPersonId);
				}
			};

			var fnError = function() {};

			that.oInputContactPerson = oInputContactPerson;

			oModel.setUseBatch(false);
			var url = "/getContactPersonDescription";

			oModel.callFunction(url, {
				method: "GET",
				urlParameters: {
					"bpId": bpId
				},
				success: fnSuccess,
				error: fnError
			});
			oModel.setUseBatch(true);

		},

		getModel: function() {
			return this.oModel;
		},
		setModel: function(oModel) {
			this.oModel = oModel;
		},

		getProcTypeDesc: function() {
			return this.ProcTypeDescription;
		},
		setProcTypeDesc: function(sProcTypeDescription) {
			this.ProcTypeDescription = sProcTypeDescription;
		},

		isProcessTypeValid: function(sProcType, procTypes) {
			var found = false;
			for (var i = 0; i < procTypes.length; i++) {
				if (procTypes[i].ProcessTypeCode === sProcType) {
					found = true;
					break;
				}
			}
			return found;
		},

		hasCreateListener: function() {

			var bReturn = false;

			if (this.eventBus.getInterface()._mChannels["sm.itsm.createincident"]) {
				if (this.eventBus.getInterface()._mChannels["sm.itsm.createincident"].hasListeners("afterCreate")) {
					bReturn = true;
				}
			}
			return bReturn;
		},

		hasCancelListener: function() {

			var bReturn = false;

			if (this.eventBus.getInterface()._mChannels["sm.itsm.createincident"]) {
				if (this.eventBus.getInterface()._mChannels["sm.itsm.createincident"].hasListeners("afterCancel")) {
					bReturn = true;
				}
			}
			return bReturn;
		},

		navToMyIncidents: function(createdGuid) {

			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

				var semanticObject = "Action";
				var action = "SMMyIncidents";

				/* eslint-disable sap-cross-application-navigation */

				oCrossAppNavigator.toExternal({
					target: {
						semanticObject: semanticObject,
						action: action

					},
					params: {
						"Guid": createdGuid
					}

					/* eslint-enable sap-cross-application-navigation */

				});
			} else {
				jQuery.sap.log.info("Cannot Navigate - Application Running Standalone");
			}

		},

		navToLaunchpad: function() {
			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				// Navigate back to FLP home
				/* eslint-disable sap-cross-application-navigation */

				oCrossAppNavigator.toExternal({
					target: {
						semanticObject: "#"
					}

				});
				/* eslint-enable sap-cross-application-navigation */
				// sap.ui.getCore().byId("homeBtn").onclick();

			} else {
				jQuery.sap.log.info("Cannot Navigate - Application Running Standalone");
			}
		},

		getPartnerValueHelp: function(oEvent, sPathSet, oModel, oColModel, multi, title, controller) {
			var that = this;
			var oMultiInput = oEvent.getSource();

			var oValueHelpDialog = new ValueHelpDialog({

				title: title,
				supportMultiselect: multi,
				supportRanges: false,
				supportRangesOnly: false,

				stretch: sap.ui.Device.system.phone,

				ok: function(oControlEvent) {
					that.aTokens = oControlEvent.getParameter("tokens");
					if (oMultiInput instanceof sap.m.MultiInput) {
						oMultiInput.setTokens(that.aTokens);
					} else if (oMultiInput instanceof sap.m.Input) {
						if (that.aTokens[0]) {
							oMultiInput.setValue(that.aTokens[0].getText());
							oMultiInput.data("type",that.aTokens[0].getKey());
							oMultiInput.setValueState("None");
							controller.sValueContactPerson =  that.aTokens[0].getKey();
						}

					}
					oValueHelpDialog.close();
				},

				cancel: function(oControlEvent) {
					oValueHelpDialog.close();
				},

				afterClose: function() {
					oValueHelpDialog.destroy();
				}
			});

			if (oMultiInput instanceof sap.m.MultiInput) {
				// set already selected Tokens
				oValueHelpDialog.setTokens(oMultiInput.getTokens());
			}

			oValueHelpDialog.getTable().setModel(oColModel, "columns");
			oValueHelpDialog.setTokenDisplayBehaviour(sap.ui.comp.smartfilterbar.DisplayBehaviour.descriptionOnly);
			oValueHelpDialog.setDescriptionKey("Name");
			oValueHelpDialog.setKey("Partner");
			// var oRowsModel = new sap.ui.model.json.JSONModel();
			// oRowsModel.setData(this.aItems);
			oValueHelpDialog.getTable().setModel(oModel);

			if (oValueHelpDialog.getTable().bindRows) {
				oValueHelpDialog.getTable().bindRows(sPathSet);
			}
			if (oValueHelpDialog.getTable().bindItems) {
				var oTable = oValueHelpDialog.getTable();

				oTable.bindAggregation("items", sPathSet, function(sId, oContext) {
					var aCols = oTable.getModel("columns").getData().cols;

					return new sap.m.ColumnListItem({
						cells: aCols.map(function(column) {
							var colname = column.template;
							return new sap.m.Label({
								text: "{" + colname + "}"
							});
						})
					});
				});
			}

			//	oValueHelpDialog.getTable().bindAggregation("rows", sPathSet);
			
			var fnSearch = function(oEvt) {
				// add filter for search
				var aFilters = [];
				var sQuery = sap.ui.getCore().byId(this.getFilterBar().getBasicSearch()).getValue();
				if (sQuery && sQuery.length > 0) {
					var filter = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
					aFilters.push(filter);
				}

				var binding;
				// update list binding
				if (oValueHelpDialog.getTable().bindRows) {
					binding = this.getTable().getBinding("rows");
				}
				if (oValueHelpDialog.getTable().bindItems) {
					binding = this.getTable().getBinding("items");
				}
				binding.filter(aFilters);
			};

			var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterBarExpanded: false,
				showGoOnFB: !sap.ui.Device.system.phone,

				search: jQuery.proxy(fnSearch, oValueHelpDialog)
			});

			

			if (oFilterBar.setBasicSearch) {
				oFilterBar.setBasicSearch(new sap.m.SearchField({
					showSearchButton: sap.ui.Device.system.phone,
					placeholder: "Search",
					search: jQuery.proxy(fnSearch, oValueHelpDialog)
				}));
			}
			oValueHelpDialog.setFilterBar(oFilterBar);
			return oValueHelpDialog;
		}

	};
});