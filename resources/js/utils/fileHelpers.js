import axios from 'axios';

export const toggleFileStar = (fileId, callback) => {
    return axios.post(route('files.toggle-star', fileId))
        .then(response => {
            if (callback && typeof callback === 'function') {
                callback(response.data);
            }
            return response.data;
        })
        .catch(error => {
            console.error('Error toggling star:', error);
            throw error;
        });
};

export const toggleFolderStar = (folderId, callback) => {
    return axios.post(route('folders.toggle-star', folderId))
        .then(response => {
            if (callback && typeof callback === 'function') {
                callback(response.data);
            }
            return response.data;
        })
        .catch(error => {
            console.error('Error toggling folder star:', error);
            throw error;
        });
};
