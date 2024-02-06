const _ = require('lodash');
const queryHelper = (query) => {
    const pagination = { startIndex: 0, limit: 50 }; // startIndex, limit
    const searching = { search: '', launchable: '0', active: '1' }; // search
    const sorting = { sort: 'createdOn', sortDirection: 'asc' }; // sort, sortDirection
    const filter = { ids: [], companyIds: [], projectIds: [], categoryIds: [], groupIds: [], microskillIds: [], challengeIds: [], adminIds: [], parentIds: [], courseIds: [], batchIds: [], trainingIds: [], eventIds: [], trainerIds: [], adminIds: [], skillTagsIds: [], languages: [] };

    for (const key in pagination) {
        if (Object.hasOwnProperty.call(pagination, key)) {
            if (Object.hasOwnProperty.call(query, key))
                pagination[key] = +query[key];
        }
    }
    for (const key in searching) {
        if (Object.hasOwnProperty.call(searching, key)) {
            searching[key] = query[key];
        }
    }
    for (const key in filter) {
        if (Object.hasOwnProperty.call(filter, key)) {
            let values = query[key] || '';
            const ids = values.split(',');
            const validIds = [];
            for (const id of ids) {
                const valid = !_.isEmpty(id);
                // const valid = cuid.isCuid(id);
                if (valid) validIds.push(id);
            }
            filter[key] = validIds;
        }
    }
    for (const key in sorting) {
        if (Object.hasOwnProperty.call(sorting, key)) {
            sorting[key] = query[key];
        }
    }

    return { pagination, searching, sorting, filter };
};

exports.default = queryHelper;