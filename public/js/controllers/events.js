    // here I'm listening custom and browser's actions 
    // and calling STATE, ROUTER, UI methods, ACTIONS
    
    function EventController () {

        this.pageInitialized = () => {
            window.addEventListener('DOMContentLoaded', function(event) {
                State.checkStorage();
                Router.init();
            });
        };

        this.setStateChanges = () => {
            window.addEventListener(constants.STATE_CHANGE, function(event) {
                console.log('STATE_CHANGE', event, event.detail);
                State.saveState({...event.detail});
            });
        };

        this.observeRoutes = () => {
            window.addEventListener(constants.ROUTE_CHANGE, function (event) {
                console.log(event.detail.route);
                UserInterface.reportRoute(event.detail.route);
            });

            window.addEventListener('popstate', function (event) {
                console.log(event.state && event.state.page);
                UserInterface.reportRoute(event.state && event.state.page);
            });
        };

        this.rebuildContent = () => {
            window.addEventListener(constants.PAGE_LOAD, function(event) {
                let storedState = State.loadState();
                console.log(`State loaded`, event, storedState);
                UserInterface.reportRoute(storedState.currentRoute);
            });
        };

        this.pageInitialized();
        this.rebuildContent();
        this.setStateChanges();
        this.observeRoutes();
    };