import {
  FETCH_TODOS, FETCH_TODOS_SUCCESS, FETCH_TODOS_FAILURE,
  CREATE_TODO, CREATE_TODO_SUCCESS, CREATE_TODO_FAILURE,
  DELETE_TODO, DELETE_TODO_SUCCESS, DELETE_TODO_FAILURE,
  COMPLETE_TODO, COMPLETE_TODO_SUCCESS, COMPLETE_TODO_FAILURE,
  EDIT_TODO, EDIT_TODO_SUCCESS, EDIT_TODO_FAILURE
} from '../constants/ActionTypes'

export default function todos (state = {
  isLoading: false,
  items: []
}, action) {
  switch (action.type) {
    case FETCH_TODOS:
    case CREATE_TODO:
    case DELETE_TODO:
      return {
        ...state,
        isLoading: true
      };

    case COMPLETE_TODO:
      return {
        ...state,
        items: state.items.map(todo => {
          return todo._id === action.id ? {
            ...todo,
            completed: action.completed
          } : todo;
        }),
        isLoading: true
      };

    case EDIT_TODO:
      return {
        ...state,
        items: state.items.map(todo => {
          return todo._id === action.id ? {
            ...todo,
            text: action.text
          } : todo;
        }),
        isLoading: true
      };

    case FETCH_TODOS_FAILURE:
    case CREATE_TODO_FAILURE:
    case DELETE_TODO_FAILURE:
    case COMPLETE_TODO_FAILURE:
    case EDIT_TODO_FAILURE:
      return {
        ...state,
        isLoading: false
      };

    case FETCH_TODOS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        items: action.items
      };

    case CREATE_TODO_SUCCESS:
    case DELETE_TODO_SUCCESS:
    case COMPLETE_TODO_SUCCESS:
    case EDIT_TODO_SUCCESS:
      return {
        ...state,
        isLoading: false
      };

    // case COMPLETE_TODO:
    //   return state.map(todo =>
    //     todo.id === action.id ?
    //       { ...todo, completed: !todo.completed } :
    //       todo
    //   )
    //
    // case COMPLETE_ALL:
    //   const areAllMarked = state.every(todo => todo.completed)
    //   return state.map(todo => ({
    //     ...todo,
    //     completed: !areAllMarked
    //   }))
    //
    // case CLEAR_COMPLETED:
    //   return state.filter(todo => todo.completed === false)

    default:
      return state;
  }
}
