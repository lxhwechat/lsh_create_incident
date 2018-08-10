sap.ui.controller("sm.itsm.createincident.view.Main", {

    onInit : function() {
        if (sap.ui.Device.support.touch === false) {
            this.getView().addStyleClass("sapUiSizeCompact");
        }
    }
});