(function () {

    const constants = {
        PAGE_LOAD: "PAGE_LOAD",
        ROUTE_CHANGE: "ROUTE_CHANGE",

        STATE_CHANGE: "STATE_CHANGE",
        STATE_REMOVE: "STATE_REMOVE",

        DATA_REQUEST: "DATA_REQUEST",
        DATA_SUCCESS: "DATA_SUCCESS",
        DATA_FAILURE: "DATA_FAILURE",

        ELEMENT_CREATE: "ELEMENT_CREATE",
        ELEMENT_ADD: "ELEMENT_ADD",
        ELEMENT_GET: "ELEMENT_GET",
        ELEMENT_REMOVE: "ELEMENT_REMOVE",
        ELEMENT_SHOW: "ELEMENT_SHOW",
        ELEMENT_HIDE: "ELEMENT_HIDE"
    };

    const routes = (userId) => {
        return {
            repos: `repos`,
            users: `users`,
            user: `users/${userId}`
        }
    };

    const initState = {
        currentRoute: "users",
        users: [],
        showPagination: true,
        selectedUser: {},
        searchRepos: false,
        repositories: [],
        search: "",
        activePages: 0
    };

    const dataUrl = `https://api.github.com`;

    const Events = new EventController();
    const Actions = new ActionsController();
    const State = new StateController();
    const Router = new RouterController();
    const UserInterface = new UserInterfaceController();

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

            State.saveState({currentRoute: window.history.state});
            Actions.routeUpdate(window.history.state.page);
        }

        this.getCurrentRoute = () => {
            return window.history.state;
        };
    };

    // Here I'm controlling state -> converting sessionStorage to usable format
    function StateController () {

        this.saveState = (stateProps) => { //Object
            let currentState = JSON.parse(window.sessionStorage.getItem('gitsearch'));

            window.sessionStorage.setItem('gitsearch', 
                JSON.stringify({...currentState, ...stateProps}));

            console.log(JSON.parse(window.sessionStorage.getItem('gitsearch')));
        };

        this.loadState = (stateProps) => { //String
            let currentState = JSON.parse(window.sessionStorage.getItem('gitsearch'));

            return (stateProps && currentState) ? 
                JSON.parse(window.sessionStorage.getItem('gitsearch'))[stateProps] :
                currentState;
        };

        this.removeStateItem = (stateItems) => { //Array[String]
            let currentState = 
                JSON.parse(window.sessionStorage.getItem('gitsearch'));

            stateItems.forEach(itm => {
                currentState[itm] = initState[itm];
            });

            window.sessionStorage.setItem('gitsearch', 
              JSON.stringify({...currentState, ...currentState}));
        };

        this.checkStorage = () => {
            let currentState = JSON.parse(window.sessionStorage.getItem('gitsearch'));

            console.log(currentState);
            currentState ? 
            Actions.loadFromStore()
            : 
            window.sessionStorage.setItem('gitsearch', JSON.stringify(initState));
        }
    }

    // here I'm listening custom and browser's actions and calling STATE, ROUTER, UI methods, ACTIONS
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

    // here I'm acting: creating requests actions, ui actions
    function ActionsController () {

        this.loadFromStore = () => {
            const evt = new Event(constants.PAGE_LOAD, 
                {"bubbles":true, "cancelable":false});
            document.dispatchEvent(evt);
        };

        this.routeUpdate = (route) => {
            const evt = new CustomEvent(constants.ROUTE_CHANGE, 
                {bubbles: true, cancelable: false, detail: {route}});
            document.dispatchEvent(evt);
        };

        this.searchCriteria = (val) => {
            let search = val;
            const evt = new CustomEvent(constants.STATE_CHANGE, 
                {bubbles: true, cancelable: false, detail: {search}});
            document.dispatchEvent(evt);
        };

        this.listingItems = (forward) => {
            let count = State.loadState(['activePages']),
                activePages = forward ? count + 20 : ((count > 0) ? count - 20 : 0);

            const evt = new CustomEvent(constants.STATE_CHANGE, 
                {bubbles: true, cancelable: false, detail: {activePages}});
            document.dispatchEvent(evt);
        };

        this.selectUser = (userName) => {
            let users = State.loadState(['users']),
                selectedUser = users.find(us => 
                    us.login === userName);

            const evt = new CustomEvent(constants.STATE_CHANGE, 
                {bubbles: true, cancelable: false, detail: {selectedUser}});
            document.dispatchEvent(evt);
        };

        this.loadData = async () => {

            let { currentRoute, search, selectedUser 
              } = State.loadState(),

              requestUrl = (currentRoute === 'repos') ? 
                `${dataUrl}/${'repositories'}` : 
              (selectedUser && selectedUser.login) ? 
                `${dataUrl}/${currentRoute}/repos` :
                `${dataUrl}/${currentRoute}/${search}`;

            myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/json');

            let getRequest = new Request(requestUrl, 
                { method: 'GET',
                  headers: myHeaders,
                  mode: 'cors',
                  cache: 'default' 
                }),
                futureData = await fetch(getRequest);

            futureData.json()
              .then(data => {
                let dataToSave = (selectedUser && selectedUser.login) ? {
                    selectedUser: {
                      ...selectedUser,
                      repositories: data
                    }
                  } :
                    (currentRoute === 'repos') ?
                      {
                        repositories: [...data]
                      } : 
                      {
                        [currentRoute]: [data]
                      };

                const evt = new CustomEvent(constants.STATE_CHANGE, 
                    {bubbles: true, cancelable: false, detail: dataToSave});

                document.dispatchEvent(evt);
                UserInterface.refreshData(currentRoute, selectedUser && selectedUser.login);
              })
              .catch(err => console.log('err', err));
        };
    }

    function DynamicComponent () {
        this.mainHeader = () => 
            loadElement({
                title: 'mainHeader', 
                elements: ['users', 'repos']
            });
        this.searchField = () => 
            loadElement({
                title: 'searchField'
            });
        this.pagination = () => 
            loadElement({
                title: 'pagination', 
                elements: ['prev', 'next']
            });
        this.backButton = () => 
            loadElement({
                title: 'backButton', 
                elements: [`back to ${'users'}`] 
            });
        this.userItems = (userData, upd) => 
            loadElement({
                title: 'userItems', 
                elements: userData, //[{avatar, username, about}]
                update: upd
            });
        this.userInfo = (info) => 
            loadElement({
                title: 'userInfo', 
                elements: [info] 
            });
        this.userAbout = (about) => 
            loadElement({
                title: 'userAbout', 
                elements: [`${about}`] 
            });
        this.repositoryEntries = (reposData, upd) => 
            loadElement({
                title: 'repositoryEntries', 
                elements: reposData,
                update: upd
            });

        const loadElement = function ({title, elements, update}) {
            switch (title) {
                case 'backButton':
                    let backButton = document.createElement('div'),
                        button = document.createElement('button'),
                        arrow = document.createElement('span');
        
                    button.appendChild(arrow);
                    backButton.appendChild(button)
                        .appendChild(document.createTextNode(elements[0]));
    
                    backButton.setAttribute('class', 'back-button');
    
                    backButton.addEventListener('click', function () {
                        Router.goBack();
                    });
                    return backButton;
                case 'mainHeader':
                    let header = document.createElement('header'),
                        nav = document.createElement('nav');
        
                    elements.forEach(element => {
                        let button = document.createElement('button');
                        button.setAttribute('class', 'nav-buttons');
                        button.setAttribute('value', element);

                        button.addEventListener('click', function (e) {
                            Router.navigate(e.target.value);
                            // button.className = button.className ? '' : 'active'; //e.target
                        });
                        nav.appendChild(button)
                            .appendChild(document.createTextNode(element));
                    });
        
                    header.appendChild(nav);
                    return header;
                case 'searchField':
                    let field = document.createElement('input');
                    field.setAttribute('class', 'search-field');
                    field.addEventListener('input', function (e) {
                        Actions.searchCriteria(e.target.value);
                    });
    
                    field.addEventListener('keypress', function(ev) {
                        if (ev.keyCode === 13) {
                            ev.preventDefault();
                            Actions.loadData();
                        }
                    });
    
                    return field;
                case 'pagination':
                    let pagination = document.createElement('div');
                    pagination.setAttribute('class', 'pagination');
                    elements.forEach(element => {
                        let button = document.createElement('button'),
                            arrow = document.createElement('span');
    
                        button.setAttribute('value', element);
                        button.addEventListener('click', function (e) {
                            let forward = (e.target.innerText === 'next') ||
                                (e.target.value === 'next');
                            Actions.listingItems(forward);
                        });
    
                        button.appendChild(arrow);
                        pagination.appendChild(button)
                            .appendChild(document.createTextNode(element));
                    });
        
                    return pagination;
                case 'userItems':
                    let usersList = update ? 
                        (
                            document.getElementsByClassName('user-items')[0] ||
                            document.createElement('ul')
                        ) : 
                        document.createElement('ul');
                    !update && usersList.setAttribute('class', 'user-items');
                    elements && elements.forEach(element => {
                        let listItem = document.createElement('li'),
                            itemButton = document.createElement('button'),
                            avatar = document.createElement('img');
                        itemButton.setAttribute('value', element.login);
                        avatar.setAttribute('src', element.avatar_url);
                        itemButton.appendChild(avatar);
                        itemButton.appendChild(document.createTextNode(element.login));
                        itemButton.addEventListener('click', function (e) {
                            let userName = element.login || 
                                e.target.value || e.target.innerText;
                            Actions.selectUser(userName);
                            Router.navigate('user', userName);
                            Actions.loadData();
                        });
                        listItem.appendChild(itemButton);
                        usersList.appendChild(listItem);
                    });
        
                    return usersList;
                case 'userInfo':
                    let listItem = document.createElement('div'),
                            avatar = document.createElement('img');
                        avatar.setAttribute('src', elements[0].avatar_url);
                        listItem.appendChild(avatar);
                        listItem.appendChild(document.createTextNode(elements[0].login));
        
                    return listItem;
                case 'userAbout':
                    let about = document.createElement('p');
                    about.setAttribute('class', 'user-about');
                    about.appendChild(document.createTextNode(elements[0]));
                    return about;
                case 'repositoryEntries':
                    let reposList = update ? 
                        document.getElementsByClassName('repos-list')[0] : 
                        document.createElement('ul');
                    !update && reposList.setAttribute('class', 'repos-list');
                    elements && elements.forEach(element => {
                        let listItem = document.createElement('li');
                        listItem.appendChild(document.createTextNode(element.description));
                        reposList.appendChild(listItem);
                    });
        
                    return reposList;
            }
        };
    };

    function UserInterfaceController () {
        // Here I'm creating DOM

        // pagination method:
        // let active = State.loadState(['activePages']);
        // items.slice(active, active+20);

        let Builder = new DynamicComponent();

        const app = document.getElementsByClassName('app')[0];
        let usersPage = document.createElement('div'),
            reposPage = document.createElement('div'),
            userPage = document.createElement('div');
        app.appendChild(Builder.mainHeader());

        this.reportRoute = (currentRoute) => {
            if (currentRoute === 'users') {
                this.buildUsers();
            } 
            if (currentRoute === 'repos') {
                this.buildRepos();
            } 
            if (
                currentRoute &&
                currentRoute.split("/")[0] === 'users' &&
                currentRoute.split("/")[1]
            ) {
                this.buildUser();
            }
        }

        this.buildUser = () => {
            console.log('will build user');
            let curState = State.loadState();
            userPage.innerHTML = '';

            reposPage.parentNode &&  reposPage.parentNode.removeChild(reposPage);
            userPage.parentNode &&  userPage.parentNode.removeChild(userPage);
            usersPage.parentNode &&  usersPage.parentNode.removeChild(usersPage);

            let userInfo = document.createElement('div');
                userInfo.setAttribute('class', 'user-main-info');
            userPage.setAttribute('class', 'single-user-page');
            // userPage.appendChild(Builder.searchField()); replace by title
            userPage.appendChild(Builder.backButton());
            userInfo.appendChild(Builder.userInfo(curState.selectedUser));
            userInfo.appendChild(Builder.userAbout(curState.selectedUser.bio));
            userPage.appendChild(Builder.pagination());
            userPage.appendChild(userInfo);
            userPage.appendChild(Builder.repositoryEntries(curState.selectedUser.repositories));
            userPage.appendChild(Builder.pagination());
            !userPage.parentNode && app.appendChild(userPage);
        };

        this.buildUsers = () => {
            console.log('will build users');
            let curState = State.loadState();
            usersPage.innerHTML = '';

            reposPage.parentNode &&  reposPage.parentNode.removeChild(reposPage);
            userPage.parentNode &&  userPage.parentNode.removeChild(userPage);
            usersPage.parentNode &&  usersPage.parentNode.removeChild(usersPage);

            // /users:
            usersPage.setAttribute('class', 'users-page');
            usersPage.appendChild(Builder.searchField());
            usersPage.appendChild(Builder.pagination());
            usersPage.appendChild(Builder.userItems(curState.users));
            usersPage.appendChild(Builder.pagination());

            !usersPage.parentNode && app.appendChild(usersPage);
        };

        this.buildRepos = () => {
            console.log('will build repos');
            let curState = State.loadState();
            reposPage.innerHTML = '';

            reposPage.parentNode && reposPage.parentNode.removeChild(reposPage);
            userPage.parentNode &&  userPage.parentNode.removeChild(userPage);
            usersPage.parentNode &&  usersPage.parentNode.removeChild(usersPage);

            reposPage.setAttribute('class', 'repos-page');
            reposPage.appendChild(Builder.searchField());
            reposPage.appendChild(Builder.pagination());
            reposPage.appendChild(Builder.repositoryEntries(curState.repositories));
            reposPage.appendChild(Builder.pagination());

            app.appendChild(reposPage);
        };

        this.refreshData = (dataType, user) => {
            let lastUpdates = State.loadState();
            
            dataType === 'repos' ?
            Builder.repositoryEntries(lastUpdates.repositories, 
                (lastUpdates.repositories && lastUpdates.repositories.length > 0))
                :
            Builder.userItems(lastUpdates.users, 
                (lastUpdates.users.length > 0));

            user && Builder.repositoryEntries(lastUpdates.selectedUser.repositories, 
                (lastUpdates.selectedUser.repositories.length > 0))
        };
    }
})();