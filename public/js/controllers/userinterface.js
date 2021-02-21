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

        userPage.appendChild(Builder.repositoryEntries(curState.selectedUser.activeRepos));

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

        usersPage.appendChild(Builder.userItems(curState.activeUsers));

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

        reposPage.appendChild(Builder.repositoryEntries(curState.activeRepos));

        reposPage.appendChild(Builder.pagination());

        app.appendChild(reposPage);
    };

    this.refreshData = (dataType, user) => {
        
        let lastUpdates = State.loadState();
        
        dataType === 'repos' ?
        Builder.repositoryEntries(lastUpdates.activeRepos, 
            (lastUpdates.activeRepos && lastUpdates.activeRepos.length > 0))
            :
        Builder.userItems(lastUpdates.activeUsers, 
            (lastUpdates.activeUsers.length > 0));

        user && Builder.repositoryEntries(lastUpdates.selectedUser.activeRepos, 
            (lastUpdates.selectedUser.activeRepos.length > 0))
    };
}