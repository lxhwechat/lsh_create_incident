sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"zwx/sm/itsm/createincident/util/Util",
	"sap/ui/core/routing/HashChanger"
], function(Controller, MessageBox, Util, HashChanger) {
	"use strict";

	return Controller.extend("zwx.sm.itsm.createincident.view.Details", {

		_oItemTemplate: null,
		_oNavigationTable: null,
		_sItemPath: "",
		_sNavigationPath: "",

		onInit: function() {
			this._oView = this.getView();
			this._oView.createdGuid = null;
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			this._oView.setModel(this._oComponent.getModel());
			this._oRouter = this._oComponent.getRouter();
			this._oNavigationTable = this.byId("navigationTable");
			this.numberOfAttachmentsToUpload = 0;
			this.eventBus = sap.ui.getCore().getEventBus();
			this.bundle = this._oComponent.getModel("i18n").getResourceBundle();
			this.getView().byId("ShortText").setModel(this._oComponent.getModel("incident"));
			this.getView().byId("ShortText").setMaxLength(40);
			this.getView().byId("fileUpload").setModel(new sap.ui.model.json.JSONModel({
				"items": []
			}));

			this.oTextArea = this.getView().byId("Description");
			this.oRichTextEditor = this.getView().byId("DescriptionRT");

			this.getView().byId("DetailsPage").setShowNavButton(Util.bShowNavButton);

			// this.oPrioritySelection = this.getView().byId("Priority");

			// // Set Priority when provided in Component.Js or as URL Param
			// if (this._oComponent.getPriority()) {
			// 	this.oPrioritySelection.setSelectedKey(this._oComponent.getPriority());
			// }

			// Set Config Item when provided in Component.Js or as URL Param
			if (this._oComponent.getConfigItem()) {
				this.getView().byId("ConfigItemInput").setValue(this._oComponent.getConfigItem());
			}

			// Set Additional Contact  when provided in Component.Js or as URL Param
			if (this._oComponent.getContactPerson()) {
				this.getView().byId("ContactPerson").setValue(this._oComponent.getContactPerson());
			}

			// Set Config Item when provided in Component.Js or as URL Param
			if (this._oComponent.getContactPerson()) {
				this.getView().byId("ContactPerson").setValue(this._oComponent.getContactPerson());
			}

			// Set Component to Model
			this.getView().byId("ComponentInput").setModel(this._oComponent.getModel("incident"));
			//this.getView().byId("ConfigItemInput").setModel(this._oComponent.getModel("incident"));

			// Set Description to Model
			//this.getView().byId("Description").setModel(this._oComponent.getModel("incident"));

			var uploadUrl = this.getView().getModel().sServiceUrl + "/AttachmentSet";
			this.getView().byId("fileUpload").setUploadUrl(uploadUrl);
			this.getView().byId("fileUpload").attachBeforeUploadStarts(this.onBeforeUploadStart);

			// 		this._oItemTemplate = this.byId("navigationListItem").clone();

			// Get Context Path for Page 2 Screen
			this._oRouter.attachRoutePatternMatched(this._onRoutePatternMatched, this);

			//  Change filter of ContactPerson suggestion item
			this.byId("ContactPerson").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				// 			return oItem.getText().match(new RegExp(sTerm, "i"));
				return oItem.getText();

			});

			//  Change filter of ConfigItem suggestion item
			this.byId("ConfigItemInput").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				// 			return oItem.getText().match(new RegExp(sTerm, "i"));
				return oItem.getText();

			});


			this._oView.byId("ContactPerson").getBinding("suggestionItems").attachDataReceived(
				function(oEvent) {

					if (oEvent.getParameter("data")) {

						if (oEvent.getParameter("data").results.length === 1) {
							this._oView.byId("ContactPerson").setValue(oEvent.getParameter("data").results[0].Name);

							this._oView.byId("ContactPerson").data("type", oEvent.getParameter("data").results[0].Partner);
							this.sValueContactPerson = oEvent.getParameter("data").results[0].Partner;
							this._oView.byId("ContactPerson").destroySuggestionItems();

						} else if (this._oView.byId("ContactPerson").getBindingContext()) {

							this._oView.byId("ContactPerson").data("type", "");
							this.sValueContactPerson = "";

						}
					}

				}, this
			);


			this._oView.byId("ConfigItemInput").getBinding("suggestionItems").attachDataReceived(
				function(oEvent) {

					if (oEvent.getParameter("data")) {

						if (oEvent.getParameter("data").results.length === 1) {
							this._oView.byId("ConfigItemInput").setValue(oEvent.getParameter("data").results[0].Description);
							this._oView.byId("ConfigItemInput").data("type", oEvent.getParameter("data").results[0].ConfigItemId);
							this.sValuesCItem = oEvent.getParameter("data").results[0].ConfigItemId;
							this._oView.byId("ConfigItemInput").setValueState(sap.ui.core.ValueState.None);
							this._oView.byId("ConfigItemInput").destroySuggestionItems();

						} else if (this._oView.byId("ConfigItemInput").getBindingContext()) {

							this._oView.byId("ConfigItemInput").data("type", "");
							this.sValuesCItem = "";

						}
					}

				}, this
			);

			this.aFilterStack = [];

			this.jModel = new sap.ui.model.json.JSONModel({
				title: "",
				component: "",
				description: ""
			});

			// this.oComponentInput = this.byId("ComponentInput");
			// this.oCategoryInput = this.byId("CategoryInput");

			Util.setModel(this._oComponent.getModel());

			this.hashChanger = HashChanger.getInstance();
			this.hashChanger.init();
		},

		// Bind Review Table using oData Reviews Entity
		_bindNavigationTable: function(sURL) {
			this._oNavigationTable.bindItems({
				path: sURL,
				template: this._oItemTemplate
			});

		},

		_onRoutePatternMatched: function(oEvent) {
			if (oEvent.getParameter("name") !== "details") {
				return;
			}

			this._sItemPath = "/" + oEvent.getParameters().arguments.entity;
			this.sValueProcessType = oEvent.getParameters().arguments.entity;
			this._sNavigationPath = this._sItemPath + "/" + "";

			// Set Category to Model
			if (this._oComponent.getCategory()) {
				// If CategoryID provided via URL get Text from Backend.
				Util.getCategoryDescription(this._oComponent.getModel(), this._oComponent.getCategory(), this.sValueProcessType, this.getView().byId(
					"CategoryInput"));
			}

			if (this._oComponent.getComponent()) {
				// If ComponentID provided via URL checks its validity in the Backend.
				Util.validateComponent(this._oComponent.getModel(), this._oComponent.getComponent(), this.getView().byId(
					"ComponentInput"));
			}

			if (this._oComponent.getConfigItem()) {
				// If Configuration Item ID provided via URL checks its validity in the Backend.
				// Util.validateConfigItem(this._oComponent.getModel(), this._oComponent.getConfigItem(), this.getView().byId(
				// 	"ConfigItemInput"));
				Util.getConfigItemDescription(this._oComponent.getModel(), this._oComponent.getConfigItem(), this.getView().byId(
					"ConfigItemInput"));
			}

			if (this._oComponent.getContactPerson()) {
				// If BP ID provided via URL checks its validity in the Backend.
				// Util.validateContactPerson(this._oComponent.getModel(), this._oComponent.getContactPerson(), this.getView().byId(
				// 	"ContactPerson"));

				Util.getContactPersonDescription(this._oComponent.getModel(), this._oComponent.getContactPerson(), this.getView().byId(
					"ContactPerson"));
			}

			// if (!this._oComponent.getPriority()) {
			// 	this.setDefaultPriority();
			// }

			Util.getTextMode(this._oComponent.getModel(), this.sValueProcessType, this.oRichTextEditor , this.oTextArea);

			// var sProcTypeDesc = this.bundle.getText("CREATE_INCIDENT_TITLE_PREFIX") + " " + Util.getProcTypeDesc();
			// this.getView().byId("DetailsPage").setTitle(sProcTypeDesc);
			this.getView().byId("ObjectHeader").setTitle(Util.getProcTypeDesc());

			/**
			 * @ControllerHook [Hook to update/initialize after Incident Type Selection]
			 *
			 * This hook is called after the Route "details" is called
			 * and the route pattern matched
			 * This happens after the selection of the Incident Type or when the Incident Type has been set externally
			 * @callback zwx.sm.itsm.createincident.view.Details~extHookOnIncidentTypeSelection
			 * @param {sap.ui.base.Event} Route Pattern Matched Event
			 * @return {void}  ...
			 */
			if (this.extHookOnIncidentTypeSelection) { // check whether any extension has implemented the hook...
				this.extHookOnIncidentTypeSelection(oEvent); // ...and call it
			}

		},

		onNavBack: function() {
			this._oRouter.navTo("main");
		},

		onCancel: function() {
			if (Util.hasCancelListener()) {
				this.eventBus.publish("zwx.sm.itsm.createincident", "afterCancel");
			} else {
				Util.navToLaunchpad();
			}
		},

		onValueHelpContact: function(oEvent) {

			var oModel = this.getView().getModel();

			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols: [{
					label: this.getView().getModel("i18n").getResourceBundle().getText("BP_ID"),
					template: "Partner"
				}, {
					label: this.getView().getModel("i18n").getResourceBundle().getText("BP_NAME"),
					template: "Name"
				}]
			});
			var title = this.getView().getModel("i18n").getResourceBundle().getText("CONTACT_PERSON");
			var oValueHelpDialog = Util.getPartnerValueHelp(oEvent, "/BusinessPartnerSet", oModel, oColModel, false, title, this);

			oValueHelpDialog.open();
			oValueHelpDialog.update();

		},

		onSave: function() {

			var oComponentData = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getComponentData();
			var sStringPType = "";
			if (typeof oComponentData.startupParameters.PROCESS_TYPE !== "undefined") {
				var pPType = oComponentData.startupParameters.PROCESS_TYPE[0];
				sStringPType = pPType.toString();
			}

			//      Get access to View
			var oView = this.getView();
			//      Get Process Type
			var sValueProcessType = this.sValueProcessType;

			//      If parameter is provided we will ignore the select field
			if (sStringPType !== "") {
				sValueProcessType = sStringPType;
			}

			//      Get value in Input Field
			// if (oView.byId("DescriptionRT").getVisible()) {
			// 	var sValueDescription = oView.byId("DescriptionRT").getValue();
			// 	var sTextMode = "H"; // HTML Text
			// 	sValueDescription = "<html>" + "<head>" + "</head>" + "<body>" + sValueDescription + "</body></html>";
			// }
			//
			// if (oView.byId("Description").getVisible()) {
			// 	sValueDescription = oView.byId("Description").getValue();
			// 	sTextMode = "P"; // Plain Text
			// }
			var sValueDescription = oView.byId("Description").getValue();

			var sValueShortText = oView.byId("ShortText").getValue();
			var sValueCategory = oView.byId("CategoryInput").data("CategoryId");
			var sValueCategoryCategoryCatalogType = oView.byId("CategoryInput").data("CategoryCatalogType");
			var sValueCategoryAspId = oView.byId("CategoryInput").data("CategoryAspId");
			var sValueComponent = oView.byId("ComponentInput").getValue();

			if (oView.byId("ConfigItemInput").data("type")) {
				var sValueConfigItem = oView.byId("ConfigItemInput").data("type");
			}

			if (oView.byId("ContactPerson").data("type")) {
				this.sValueContactPerson = oView.byId("ContactPerson").data("type");
			}

			// var sValuePriority = oView.byId("Priority").getSelectedKey();
			var sValueImpact = oView.byId("Impact").getSelectedKey();
			var sValueUrgency = oView.byId("Urgency").getSelectedKey();

			var inputsToCheckForMandatoryInput = [
				oView.byId("ShortText"),
				oView.byId("CategoryInput")
			];

			var selectToCheckForMandatoryInput = [
				oView.byId("Impact"),
				oView.byId("Urgency")
			];

			var inputsToCheckForValidation = [
				oView.byId("ConfigItemInput"),
				oView.byId("ContactPerson")
			];

			var inputsToCheckForErrorState = [
				oView.byId("ShortText"),
				oView.byId("ConfigItemInput"),
				oView.byId("ContactPerson"),
				oView.byId("Impact"),
				oView.byId("Urgency"),
				oView.byId("CategoryInput")
			];

			// check that inputs are not empty
			// this does not happen during data binding as this is only triggered by changes
			jQuery.each(inputsToCheckForMandatoryInput, function(i, input) {
				if (!input.getValue()) {
					input.setValueState("Error");
				} else if (/^\s*$/.test(input.getValue())) {
					input.setValueState("Error");
				} else {
					input.setValueState("None");
				}
			});

			jQuery.each(selectToCheckForMandatoryInput, function(i, input) {
				if (!input.getSelectedKey()) {
					input.setValueState("Error");
				} else if (/^\s*$/.test(input.getSelectedKey())) {
					input.setValueState("Error");
				} else if (/^0*$/.test(input.getSelectedKey())) {
					input.setValueState("Error");
				} else {
					input.setValueState("None");
				}
			});

			jQuery.each(inputsToCheckForValidation, function(i, input) {
				if (input.getValue()) {
					if (!input.data("type") === undefined || input.data("type") === "") {
						input.setValueState("Error");
					}

				}

			});

			// check states of inputs
			var canContinue = true;

			jQuery.each(inputsToCheckForErrorState, function(i, input) {
				if (input.getValueState() === "Error") {
					canContinue = false;
					return false;
				}
			});

			if (!canContinue) {
				MessageBox.alert(this.getView().getModel("i18n").getResourceBundle().getText("COMPLETE_INPUT"));
				return;

			}

			// jQuery.each(inputsToValidate, function(i, input) {

			// 	input.fn(input.input.getValue(),oView.getModel());

			// });

			// 		while (oView.getModel().hasPendingRequests()) {
			//     	jQuery.log("still running");
			// }

			var oUploadCollection = this.getView().byId("fileUpload");

			this.numberOfAttachmentsToUpload = oUploadCollection.getItems().length;
			//oUploadCollection.upload();

			this._dialog = Util.getBusyDialog("busyPopoverSave", this.getView().getModel("i18n").getResourceBundle().getText(
				"CREATING_IN_PROGRESS"), this.getView(), this);
			this._dialog.setTitle(this.getView().getModel("i18n").getResourceBundle().getText(
				"CREATING_IN_PROGRESS"));
			this._dialog.open();

			//      Define entity var for message for OData as Json
			var entity = {
				ProcessType: sValueProcessType,
				Description: sValueShortText,
				LongText: sValueDescription,
				// Priority: sValuePriority,
				Impact: sValueImpact,
				Urgency: sValueUrgency,
				SAPComponent: sValueComponent,
				CategoryCatalogType: sValueCategoryCategoryCatalogType,
				CategoryAspectId: sValueCategoryAspId,
				CategoryId: sValueCategory,
				ConfigurationItemId: sValueConfigItem,
				Partner2: this.sValueContactPerson,
				// TextMode : sTextMode
			};

			/**
			 * @ControllerHook [Hook to change entity data before Creation]
			 *
			 * This hook is called before the Incident is created
			 * This happens after the selection of the Create Button
			 * @callback zwx.sm.itsm.createincident.view.Details~extHookOnBeforeCreateIncident
			 * @param {array} Incident Data
			 * @return {void}  ...
			 */
			if (this.extHookOnBeforeCreateIncident) { // check whether any extension has implemented the hook...
				this.extHookOnBeforeCreateIncident(entity); // ...and call it
			}

			this.getView().getModel().create("/IncidentSet", entity, {
				success: jQuery.proxy(function(mResponse) {
					this._oView.createdGuid = mResponse.Guid;
					this._oView.createdObjectId = mResponse.ObjectId;
					sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText(
						"CREATED_NEW_INCIDENT") + " '" + mResponse.ObjectId + "' ");

					// Also Upload Attachments
					if (this.numberOfAttachmentsToUpload >= 1) {

						// construct Upload URL from response GUID
						var uploadURL = this.getView().getModel().sServiceUrl + "/IncidentSet(guid'" + mResponse.Guid + "')" + "/AttachmentSet";
						$.each(oUploadCollection._aFileUploadersForPendingUpload, function(index, value) {
							oUploadCollection._aFileUploadersForPendingUpload[index].setProperty("uploadUrl", uploadURL);
						});

						if (this.numberOfAttachmentsToUpload === 1) {
							this._dialog.setTitle(this.getView().getModel("i18n").getResourceBundle().getText("ATTACHMENT_IN_PROGRESS"));
						} else {
							this._dialog.setTitle(this.getView().getModel("i18n").getResourceBundle().getText("ATTACHMENTS_IN_PROGRESS"));
						}
						oUploadCollection.upload();
					} else {
						this.postProcessSave();
					}

				}, this),

				error: jQuery.proxy(function() {
					sap.m.MessageToast.show("Error posting Incident!");
					this._dialog.close();
				}, this)

			});

		},

		// onChangePriority: function(evt) {
		// 	// sap.m.MessageToast.show("Selected Priority: " + evt.getParameters().selectedItem.getText());
		// },

		// setDefaultPriority: function() {
		// 	if (this.oPrioritySelection) {
		// 		if (this.defaultPriority) {
		// 			this.oPrioritySelection.setSelectedKey(this.defaultPriority);
		//
		// 		} else {
		//
		// 			Util.getDefaultPriority(this._oComponent.getModel(), this.sValueProcessType, this.getView().byId(
		// 				"Priority"));
		//
		// 		}
		// 	}
		// },

		onCategoryValueHelp: function(oEvent) {
			this._oPopover = sap.ui.xmlfragment("categoryPopover", "zwx.sm.itsm.createincident.view.fragments.CategoryPopover", this);
			this._oPopover.setModel(this.getView().getModel());
			this._oPopover.setModel(this.getView().getModel("i18n"), "i18n");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oPopover);
			var oDetailPage = sap.ui.core.Fragment.byId("categoryPopover", "master");
			if (this.aFilterStack.length === 0) {
				oDetailPage.setShowNavButton(false);
			}

			// check if entry already exists to enable/disable "clear" button.
			var oClearButton = sap.ui.core.Fragment.byId("categoryPopover", "clearButton");
			if (!oEvent.getSource().getValue()) {
				oClearButton.setEnabled(false);
			} else {
				oClearButton.setEnabled(true);
			}

			var oListDetail = sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oFilterProcType = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this.sValueProcessType);

			listBinding.filter([oFilterProcType]);
			this._oPopover.open();
		},

		onComponentValueHelp: function(oEvent) {
			this._oPopover = sap.ui.xmlfragment("componentPopover", "zwx.sm.itsm.createincident.view.fragments.ComponentPopover", this);
			this._oPopover.setModel(this.getView().getModel());
			this._oPopover.setModel(this.getView().getModel("i18n"), "i18n");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oPopover);
			var oDetailPage = sap.ui.core.Fragment.byId("componentPopover", "master");
			if (this.aFilterStack.length === 0) {
				oDetailPage.setShowNavButton(false);
			}

			// check if entry already exists to enable/disable "clear" button.
			var oClearButton = sap.ui.core.Fragment.byId("componentPopover", "clearButton");
			if (!oEvent.getSource().getValue()) {
				oClearButton.setEnabled(false);
			} else {
				oClearButton.setEnabled(true);
			}
			this._oPopover.open();
		},

		onCatNavToNextLevel: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oDetailPage = sap.ui.core.Fragment.byId("categoryPopover", "master");
			var oEntity = oDetailPage.getModel().getData(oCtx.getPath(), oCtx);

			var oListDetail = sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oFilterCatID = new sap.ui.model.Filter("CategoryId", sap.ui.model.FilterOperator.EQ, oEntity.CategoryId);
			var oFilterProcType = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this.sValueProcessType);
			this.aFilterStack.unshift(oFilterCatID);

			if (this.aFilterStack.length >= 1) {
				oDetailPage.setShowNavButton(true);
			}

			jQuery.sap.delayedCall(100, this, function() {
				listBinding.filter([oFilterCatID, oFilterProcType]);
			});
		},

		onCompNavToNextLevel: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oDetailPage = sap.ui.core.Fragment.byId("componentPopover", "master");
			var oEntity = oDetailPage.getModel().getData(oCtx.getPath(), oCtx);

			var oListDetail = sap.ui.core.Fragment.byId("componentPopover", "compPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oFilter = new sap.ui.model.Filter("CompID", sap.ui.model.FilterOperator.EQ, oEntity.CompID);
			this.aFilterStack.unshift(oFilter);

			if (this.aFilterStack.length >= 1) {
				oDetailPage.setShowNavButton(true);
			}

			jQuery.sap.delayedCall(100, this, function() {
				listBinding.filter([oFilter]);
			});
		},

		onCatSearch: function(oEvent) {
			var searchedValue = oEvent.getParameter("newValue");
			var oListDetail = sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oDetailPage = sap.ui.core.Fragment.byId("categoryPopover", "master");
			if (searchedValue.length >= 1) {
				oDetailPage.setShowNavButton(false);
				this.aFilterStack = [];
				var oFilterCatID = new sap.ui.model.Filter("CategoryId", sap.ui.model.FilterOperator.Contains, searchedValue);
				var oFilterProcType = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this.sValueProcessType);
				jQuery.sap.delayedCall(0, this, function() {
					listBinding.filter([oFilterCatID, oFilterProcType]);
				});
			} else if (searchedValue.length === 0) {
				var oFilterProcType2 = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this.sValueProcessType);
				jQuery.sap.delayedCall(0, this, function() {
					listBinding.filter([oFilterProcType2]);
				});
			}
		},

		onCompSearch: function(oEvent) {
			var searchedValue = oEvent.getParameter("newValue");
			var oListDetail = sap.ui.core.Fragment.byId("componentPopover", "compPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oDetailPage = sap.ui.core.Fragment.byId("componentPopover", "master");
			if (searchedValue.length > 1) {
				oDetailPage.setShowNavButton(false);
				this.aFilterStack = [];
				var oFilter = new sap.ui.model.Filter("CompID", sap.ui.model.FilterOperator.Contains, searchedValue);
				jQuery.sap.delayedCall(0, this, function() {
					listBinding.filter([oFilter]);
				});
			} else if (searchedValue.length === 0) {
				var oFilter2 = new sap.ui.model.Filter("CompID", sap.ui.model.FilterOperator.Contains, searchedValue);
				jQuery.sap.delayedCall(0, this, function() {
					listBinding.filter([oFilter2]);
				});
			}
		},

		onCatTitleClicked: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oDetailPage = sap.ui.core.Fragment.byId("categoryPopover", "master");
			var oEntity = oDetailPage.getModel().getData(oCtx.getPath(), oCtx);
			var oInput = this.byId("CategoryInput");
			oInput.setValue(oEntity.CategoryName);
			oInput.data("CategoryId", oEntity.CategoryId);
			oInput.data("CategoryCatalogType", oEntity.CategoryCatalogType);
			oInput.data("CategoryAspId", oEntity.CategoryAspId);
			oInput.setValueState("None");
			this._oPopover.close();
			this.destroyPopover();
		},

		onCompTitleClicked: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oDetailPage = sap.ui.core.Fragment.byId("componentPopover", "master");
			var oEntity = oDetailPage.getModel().getData(oCtx.getPath(), oCtx);
			var oInput = this.byId("ComponentInput");
			oInput.setValue(oEntity.CompID);
			oInput.setValueState("None");
			this._oPopover.close();
			this.destroyPopover();
		},

		onCatNavButtonPress: function() {
			var oDetailPage = sap.ui.core.Fragment.byId("categoryPopover", "master");
			var oListDetail = sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList");
			var listBinding = oListDetail.getBinding("items");
			var oFilterProcType = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, this.sValueProcessType);

			if (this.aFilterStack.length > 1) {
				this.aFilterStack.shift();
				listBinding.filter([this.aFilterStack[0], oFilterProcType]);
			} else {
				oDetailPage.setShowNavButton(false);
				this.aFilterStack.shift();
				listBinding.filter(oFilterProcType);
			}
		},

		onValidatedFieldLiveChange: function(oEvent) {

			if (oEvent.getParameters().newValue === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			} else {
				oEvent.getSource().data("type", "");
			}

		},

		onCompNavButtonPress: function() {
			var oDetailPage = sap.ui.core.Fragment.byId("componentPopover", "master");
			var oListDetail = sap.ui.core.Fragment.byId("componentPopover", "compPopoverList");
			var listBinding = oListDetail.getBinding("items");

			if (this.aFilterStack.length > 1) {
				this.aFilterStack.shift();
				listBinding.filter([this.aFilterStack[0]]);
			} else {
				var oInitialFilter = [];
				oDetailPage.setShowNavButton(false);
				this.aFilterStack.shift();
				listBinding.filter(oInitialFilter);
			}
		},

		onPopoverCancel: function() {
			this._oPopover.close();
			this.destroyPopover();

		},

		onCatPopoverClear: function() {
			this._oPopover.close();
			this.destroyPopover();
			var oInput = this.byId("CategoryInput");
			oInput.setValue("");
			oInput.data("CategoryId", "");
			oInput.setValueState("None");

		},

		onCompPopoverClear: function() {
			this._oPopover.close();
			this.destroyPopover();
			var oInput = this.byId("ComponentInput");
			oInput.setValue("");
			oInput.setValueState("None");

		},

		onPopoverAfterClose: function() {
			this.destroyPopover();
		},

		destroyPopover: function() {

			//component Popover
			if (sap.ui.core.Fragment.byId("componentPopover", "compPopoverList")) {
				sap.ui.core.Fragment.byId("componentPopover", "compPopoverList").destroy();
			}
			if (sap.ui.core.Fragment.byId("componentPopover", "closeButton")) {
				sap.ui.core.Fragment.byId("componentPopover", "closeButton").destroy();
			}

			if (sap.ui.core.Fragment.byId("componentPopover", "searchField")) {
				sap.ui.core.Fragment.byId("componentPopover", "searchField").destroy();
			}

			if (sap.ui.core.Fragment.byId("componentPopover", "componentListItem")) {
				sap.ui.core.Fragment.byId("componentPopover", "componentListItem").destroy();
			}

			if (sap.ui.core.Fragment.byId("componentPopover", "master")) {
				sap.ui.core.Fragment.byId("componentPopover", "master").destroy();
			}

			//category Popover
			if (sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList")) {
				sap.ui.core.Fragment.byId("categoryPopover", "catPopoverList").destroy();
			}
			if (sap.ui.core.Fragment.byId("categoryPopover", "closeButton")) {
				sap.ui.core.Fragment.byId("categoryPopover", "closeButton").destroy();
			}

			if (sap.ui.core.Fragment.byId("componentPopover", "searchField")) {
				sap.ui.core.Fragment.byId("componentPopover", "searchField").destroy();
			}

			if (sap.ui.core.Fragment.byId("categoryPopover", "categoryListItem")) {
				sap.ui.core.Fragment.byId("categoryPopover", "categoryListItem").destroy();
			}

			if (sap.ui.core.Fragment.byId("categoryPopover", "master")) {
				sap.ui.core.Fragment.byId("categoryPopover", "master").destroy();
			}

			// if (this._oPopover) {
			// 	this._oPopover.destroy();
			// }

			this.aFilterStack = [];

		},

		// for the fast search in the business partner fields
		handleSuggest: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm.value !== "") {
				aFilters.push(new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sTerm));
				oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			}
		},

		// used to fill the custom data 'type into the Contact Person field input field so we can read it later
		suggestionItemSelected: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters("selectedItem");
			var oSelected = oSelectedItem.selectedItem;
			var sBp = oSelected.data("type");
			var oView = this.getView();
			var oInput = oView.byId("ContactPerson");
			oInput.data("type", sBp);
			this.sValueContactPerson = sBp;
			oInput.setValueState(sap.ui.core.ValueState.None);
		},

		// for the fast search in the config item field
		CIhandleSuggest: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm.value !== "") {
				aFilters.push(new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sTerm));
				oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			}
		},

		// used to fill the config Item input field
		CIsuggestionItemSelected: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters("selectedItem");
			var oSelected = oSelectedItem.selectedItem;
			var sCItem = oSelected.data("type");
			var oView = this.getView();
			var oInput = oView.byId("ConfigItemInput");
			oInput.data("type", sCItem);
			this.sValuesCItem = sCItem;
			oInput.setValueState(sap.ui.core.ValueState.None);
		},

		onShortTextLiveChange: function() {

			if (this.getView().byId("ShortText").getValue().length < 1 || this.getView().byId("ShortText").getValue().length > 40)

			{
				this.getView().byId("ShortText").setValueState("Error");
			} else {
				this.getView().byId("ShortText").setValueState("None");
			}

		},

		onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: this.getXsrfToken()
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

		},

		onBeforeUploadStart: function(oEvent) {

			var filename = oEvent.getParameter("fileName");

			if (filename.length > 40) {
				var aFilenameParts = filename.split(".");
				if (aFilenameParts.length === 1) {
					filename = filename.substring(0, 40);
				} else {
					var filenameExtension = aFilenameParts[aFilenameParts.length - 1];
					aFilenameParts = aFilenameParts.slice(0, aFilenameParts.length - 1);
					var remainingCharacters = 39 - filenameExtension.length;
					filename = aFilenameParts.join(".").substring(0, remainingCharacters) + "." + filenameExtension;
				}
			}

			// Header Content-Disposition
			var oCustomerHeaderContentDisp = new sap.m.UploadCollectionParameter({
				name: "content-disposition",
				value: "inline; filename=\"" + encodeURIComponent(filename) + "\""
			});

			oEvent.getParameter("addHeaderParameter")(oCustomerHeaderContentDisp);

		},

		getXsrfToken: function() {
			var sToken = this.getView().getModel().getHeaders()["x-csrf-token"];
			if (!sToken) {

				this.getView().getModel().refreshSecurityToken(
					function(e, o) {
						sToken = o.headers["x-csrf-token"];
					},
					function() {
						MessageBox.error(this.bundle.getText("XSRF_TOKEN_ERROR"));
					},
					false);
			}
			return sToken;
		},

		onUploadComplete: function(oEvent) {
			var that = this;

			if (oEvent.getParameters().getParameter("status") === 400) // Bad request
			{
				var errorMsg = $($.parseXML(oEvent.getParameters().getParameter("responseRaw"))).find("message").text();
				//util.Util.oDataServiceErrorHandling(this, this.bundle, response, this.bundle.getText("TEXT_POST_FAILURE"));
				Util.showErrorMessageBox(that.bundle, "ERROR_CONTACT_SYSADMIN", "ATTACHMENT_UPLOAD_ERROR", null, errorMsg); //function(resourceBundle, message, messageTitle, goBack, details)
			}

			this.numberOfAttachmentsToUpload = this.numberOfAttachmentsToUpload - 1;

			if (this.numberOfAttachmentsToUpload === 0) {

				this.postProcessSave();

			}

		},

		postProcessSave: function() {
			this._dialog.close();
			if (Util.hasCreateListener()) {

				this.eventBus.publish("zwx.sm.itsm.createincident", "afterCreate", {
					objectId: this._oView.createdObjectId,
					objectGuid: this._oView.createdGuid
				});
			} else {

				// Navigate per default to MyIncidents App (if exists)
				// Otherwise back to Launchpad
				if (Util.myIncidentsAvailable) {
					Util.navToMyIncidents(this._oView.createdGuid);
				} else {
					Util.navToLaunchpad();
				}
			}

			// this.hashChanger.setHash("itsmmy&/MessageResultSet/" + this._oView.createdGuid, true);
			// standalone workaround
			sap.m.URLHelper.redirect('/sap/wechat/my_incidents');
		}

		// hasCreateListener: function() {

		// 	var bReturn = false;

		// 	if (this.eventBus.getInterface()._mChannels["zwx.sm.itsm.createincident"]) {
		// 		if (this.eventBus.getInterface()._mChannels["zwx.sm.itsm.createincident"].hasListeners("afterCreate")) {
		// 			bReturn = true;
		// 		}
		// 	}
		// 	return bReturn;
		// },

		// hasCancelListener: function() {

		// 	var bReturn = false;

		// 	if (this.eventBus.getInterface()._mChannels["zwx.sm.itsm.createincident"]) {
		// 		if (this.eventBus.getInterface()._mChannels["zwx.sm.itsm.createincident"].hasListeners("afterCancel")) {
		// 			bReturn = true;
		// 		}
		// 	}
		// 	return bReturn;
		// },

		// navToMyIncidents: function(createdGuid) {

		// 	if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
		// 		var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

		// 		var semanticObject = "Action";
		// 		var action = "SMMyIncidents";

		//              /* eslint-disable sap-cross-application-navigation */

		// 		oCrossAppNavigator.toExternal({
		// 			target: {
		// 				semanticObject: semanticObject,
		// 				action: action

		// 			},
		// 			params: {
		// 				"Guid": createdGuid
		// 			}

		//              /* eslint-enable sap-cross-application-navigation */

		// 		});
		// 	} else {
		// 		jQuery.sap.log.info("Cannot Navigate - Application Running Standalone");
		// 	}

		// },

		// navToLaunchpad: function() {
		// 	if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
		// 		var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		// 		// Navigate back to FLP home
		// 		/* eslint-disable sap-cross-application-navigation */

		// 		oCrossAppNavigator.toExternal({
		// 			target: {
		// 				semanticObject: "#"
		// 			}

		// 		});
		//              /* eslint-enable sap-cross-application-navigation */
		// 		// sap.ui.getCore().byId("homeBtn").onclick();

		// 	} else {
		// 		jQuery.sap.log.info("Cannot Navigate - Application Running Standalone");
		// 	}
		// }
	});
});
