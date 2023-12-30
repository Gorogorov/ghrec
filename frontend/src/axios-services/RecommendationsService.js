import AxiosApiInstance from './AxiosApiInstance'


export default class RecommendationsService {
	login(user_data) {
		const url = `/auth/token/`;
		return AxiosApiInstance.post(url, user_data).then(response => response.data);
	}
	refreshToken() {
		const url = `/auth/token/refresh/`;
		return AxiosApiInstance.post(url).then(response => response.data);
	}
	register(user_data) {
		const url = `/auth/register/`;
		return AxiosApiInstance.post(url, user_data).then(response => response.data);
	}
	logout() {
		const url = `/auth/logout/`;
		return AxiosApiInstance.get(url).then(response => response.data);
	}
    getWsToken(){
        const url = `/auth/ws_token/`;
        return AxiosApiInstance.get(url);
    }

    getUserRepositories(page){
        const url = `/user/repositories/?page=${page}`;
        return AxiosApiInstance.get(url).then(response => response.data);
    }
    reloadUserRepositories(){
        const url = `/user/repositories/reload/`;
        return AxiosApiInstance.get(url);
    }
    searchUserRepositories(queue){
        const url = `/user/repositories/search/`;
        return AxiosApiInstance.post(url, queue).then(response => response.data);
    }

    getUserGroups(page){
        const url = `/user/groups/?page=${page}`;
        return AxiosApiInstance.get(url).then(response => response.data);
    }
	createUserGroup(group){
        const url = `/user/groups/`;
		return AxiosApiInstance.post(url, group);
    }

	getUserGroup(groupName) {
		const url = encodeURI(`/user/groups/${groupName}/`);
        return AxiosApiInstance.get(url).then(response => response.data);
	}
    updateUserGroup(groupName, group){
        const url = encodeURI(`/user/groups/${groupName}/`);
        return AxiosApiInstance.patch(url, group);
    }
    deleteUserGroup(groupName){
        const url = encodeURI(`/user/groups/${groupName}/`);
        return AxiosApiInstance.delete(url);
    }

	getGroupRecommendations(groupName, page) {
		const url = encodeURI(`/user/groups/${groupName}/recommendations/?page=${page}`);
        return AxiosApiInstance.get(url).then(response => response.data);
	}
    computeRecommendations(groupName){
        const url = encodeURI(`/user/groups/${groupName}/recommendations/compute/`);
        return AxiosApiInstance.get(url);
    }
}
