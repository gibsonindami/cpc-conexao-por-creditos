const conversations = new Map();

const MAX_HISTORY = 12;

function get(id) {

    if (!conversations.has(id)) {

        conversations.set(id, []);

    }

    return conversations.get(id);

}

function add(id, role, content) {

    if (!conversations.has(id)) {

        conversations.set(id, []);

    }

    const history = conversations.get(id);

    history.push({

        role,

        content

    });

    while (history.length > MAX_HISTORY) {

        history.shift();

    }

}

function clear(id) {

    conversations.delete(id);

}

module.exports = {

    get,

    add,

    clear

};