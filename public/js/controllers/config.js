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
    activeUsers: [],
    activeRepos: [],
    paginationCurrent: 0,
    paginationDivider: 20
};

const dataUrl = `https://api.github.com`;