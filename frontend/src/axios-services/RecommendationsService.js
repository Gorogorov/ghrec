import AxiosApiInstance from './AxiosApiInstance'

const API_URL = 'http://localhost:8000';

export default class RecommendationsService {
	login(user_data) {
		const url = `${API_URL}/api/auth/token/`;
		return AxiosApiInstance.post(url, user_data).then(response => response.data);
	}
	refreshToken() {
		const url = `${API_URL}/api/auth/token/refresh/`;
		return AxiosApiInstance.get(url).then(response => response.data);
	}
	register(user_data) {
		const url = `${API_URL}/api/auth/register/`;
		return AxiosApiInstance.post(url, user_data).then(response => response.data);
	}
	logout() {
		const url = `${API_URL}/api/auth/logout/`;
		return AxiosApiInstance.get(url).then(response => response.data);
	}
    getWsToken(){
        const url = `${API_URL}/api/auth/ws_token/`;
        return AxiosApiInstance.get(url).then(response => response.data);
    }

    getUserRepositories(page){
        const url = `${API_URL}/api/user/repositories/?page=${page}`;
        return AxiosApiInstance.get(url).then(response => response.data);
    }
    searchUserRepositories(queue){
        const url = `${API_URL}/api/user/repositories/search/`;
        return AxiosApiInstance.post(url, queue).then(response => response.data);
    }

    getUserGroups(page){
        const url = `${API_URL}/api/user/groups/?page=${page}`;
        return AxiosApiInstance.get(url).then(response => response.data);
    }
	createUserGroup(group){
        const url = `${API_URL}/api/user/groups/`;
		return AxiosApiInstance.post(url, group);
    }

	getUserGroup(groupName) {
		const url = encodeURI(`${API_URL}/api/user/groups/${groupName}/`);
        return AxiosApiInstance.get(url).then(response => response.data);
	}
    updateUserGroup(groupName, group){
        const url = encodeURI(`${API_URL}/api/user/groups/${groupName}/`);
        return AxiosApiInstance.patch(url, group);
    }
    deleteUserGroup(groupName){
        const url = encodeURI(`${API_URL}/api/user/groups/${groupName}/`);
        return AxiosApiInstance.delete(url);
    }

	getGroupRecommendations(groupName, page) {
		const url = encodeURI(`${API_URL}/api/user/groups/${groupName}/recommendations/?page=${page}`);
        return AxiosApiInstance.get(url).then(response => response.data);
	}
    computeRecommendations(groupName){
        const url = encodeURI(`${API_URL}/api/user/groups/${groupName}/recommendations/compute/`);
        return AxiosApiInstance.get(url);
    }
    reloadUserRepositories(){
        const url = `${API_URL}/api/user/repositories/reload/`;
        return AxiosApiInstance.get(url);
    }
}
