sap.ui.controller("zwx.sm.itsm.createincident.view.Main", {

  onInit : function() {
    if (sap.ui.Device.support.touch === false) {
      this.getView().addStyleClass("sapUiSizeCompact");
    }
  }
});
