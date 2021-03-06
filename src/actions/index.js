import * as tarabaas from 'tarabaas-js';
import * as types from '../constants/ActionTypes';
import { LS_PROJECT_ID_KEY, COLLECTION_NAME } from '../constants/common';

import getProjectSchema from '../schema/project';
import getTodosSchema from '../schema/todos';

const api = tarabaas.init();

const getProjectId = () => window.localStorage.getItem(LS_PROJECT_ID_KEY);
const getProject = () => api.projects().get(getProjectId());
const getCOL = () => getProject().collections().get(COLLECTION_NAME);

export function init () {
  return (dispatch) => {
    dispatch({type: types.INIT});

    return new Promise((resolve, reject) => {
      // проверям установлен ли project uuid
      if (getProjectId()) {
        resolve();
      } else {
        reject();
      }
    })
    .then(() => {
      // ключ есть, проверям есть ли проект с таким ключом
      return getProject().commit();
    })
    .catch(err => {
      // проекта нет, или ошибка, значит создаём его
      let schema = getProjectSchema();
      return api
        .projects()
        .create(schema)
        .commit();
    })
    .then(json => {
      // создали проект и сохранили его uuid
      window.localStorage.setItem(LS_PROJECT_ID_KEY, json.uuid);
      return json;
    })
    .then(json => {
      // проверям, есть ли база у проекта
      return getCOL()
        .commit()
        .catch(err => {
          // такой базы нет, значит создаём её
          let schema = getTodosSchema();
          return getProject()
            .collections()
            .create(schema)
            .commit();
        });
    })
    .then(json => {
      dispatch(fetchAll());
    });
  };

};

export function fetchAll () {
  const request = () => {
    return {
      type: types.FETCH_TODOS
    };
  };
  const success = (json) => {
    return {
      type: types.FETCH_TODOS_SUCCESS,
      items: json
    }
  };
  const failure = (error) => {
    return {
      error,
      type: types.FETCH_TODOS_FAILURE
    };
  };
  return (dispatch) => {
    dispatch(request());
    return getCOL()
      .listItems()
      .commit()
      .then(json => dispatch(success(json)))
      .catch(error => dispatch(failure(error)));
  };
};

function fetchAfter (f) {
  return (...args) => {
    return (dispatch) => {
      return dispatch(f(...args))
        .then(() => {
          dispatch(fetchAll());
        });
    };
  }
}

export const createTodo = fetchAfter(text => {
  const request = () => {
    return {
      type: types.CREATE_TODO
    };
  };
  const success = (json) => {
    return {
      type: types.CREATE_TODO_SUCCESS
    };
  };
  const failure = (error) => {
    return {
      error,
      type: types.CREATE_TODO_FAILURE
    };
  };

  return (dispatch) => {
    dispatch(request());

    return getCOL()
      .createItem({text})
      .commit()
      .then(json => dispatch(success(json)))
      .catch(error => dispatch(failure(error)));
  };
});

export const deleteTodo = fetchAfter(id => {
  const request = () => {
    return {
      type: types.DELETE_TODO
    };
  };
  const success = () => {
    return {
      type: types.DELETE_TODO_SUCCESS
    };
  };
  const failure = (error) => {
    return {
      error,
      type: types.DELETE_TODO_FAILURE
    };
  };

  return (dispatch) => {
    dispatch(request());
    return getCOL()
      .destroyItem(id)
      .commit()
      .then(() => dispatch(success()))
      .catch(error => dispatch(failure(error)));
  };
});

export const completeTodo = fetchAfter((id, completed) => {
  const request = () => {
    return {
      id,
      completed,
      type: types.COMPLETE_TODO
    };
  };
  const success = (json) => {
    return {
      type: types.COMPLETE_TODO_SUCCESS
    };
  };
  const failure = (error) => {
    return {
      error,
      type: types.COMPLETE_TODO_FAILURE
    };
  };

  return (dispatch) => {
    dispatch(request());

    return getCOL()
      .updateItem(id, {completed})
      .commit()
      .then(json => dispatch(success(json)))
      .catch(error => dispatch(failure(error)));
  };
});

export const editTodo = fetchAfter((id, text) => {
  const request = () => {
    return {
      id,
      text,
      type: types.EDIT_TODO
    };
  };
  const success = (json) => {
    return {
      type: types.EDIT_TODO_SUCCESS,
      todo: json
    };
  };
  const failure = (error) => {
    return {
      error,
      type: types.EDIT_TODO_FAILURE
    };
  };

  return (dispatch) => {
    dispatch(request());
    return getCOL()
      .updateItem(id, {text})
      .commit()
      .then(json => dispatch(success(json)))
      .catch(error => dispatch(failure(error)));
  };
});
