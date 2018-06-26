// define ADD, addMessage(), messageReducer(), and store here:
const ADD = "ADD";

function addMessage (message){
    return {
        type: ADD,
        message: message
    }
}
function messageReducer (state = [],action) {
    if (action.type == ADD){
        return state.concat(action.message);
    }else{
        return state;
    }
}

const store = Redux.createStore(
  messageReducer
);