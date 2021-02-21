    // Here I'm controlling routing -> converting location to usable format
    function RouterController () {

        this.init = () => {

            let initRoute = State.loadState(["currentRoute"]) || initState.currentRoute;

            window.history.pushState({page: initRoute}, "title 1", `/#/${initRoute}`);

            Actions.routeUpdate(initRoute);
        }

        this.navigate = (route, id) => { //String

            console.log('route: ', route);

            let curState = window.history.state,
                nextRoute = routes(id)[route];

            console.log(nextRoute);

            id ? window.history.pushState(
                {page: nextRoute}, "title 1", `/#/${nextRoute}`) 
                : window.history.replaceState(
                  {page: nextRoute}, "title 1", `/#/${nextRoute}`);

            State.saveState({currentRoute: nextRoute});
            Actions.routeUpdate(window.history.state.page);
        };

        this.goBack = () => {
            
            window.history.back();

            State.saveState({
                currentRoute: window.history.state.page.split('/')[0]});

            Actions.routeUpdate(window.history.state.page);
        }

        this.getCurrentRoute = () => {
            return window.history.state;
        };
    };