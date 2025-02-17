export const splitReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_SPLIT':
      return {
        ...state,
        splits: [...state.splits, { amount: '', description: '', category: action.category }],
        openSplitIndex: state.splits.length
      };
    case 'UPDATE_SPLIT':
      return {
        ...state,
        splits: state.splits.map((split, i) =>
          i === action.index ? { ...split, [action.field]: action.value } : split
        )
      };
    case 'REMOVE_SPLIT':
      return {
        ...state,
        splits: state.splits.filter((_, i) => i !== action.index),
        openSplitIndex: state.openSplitIndex === action.index
          ? Math.max(0, action.index - 1)
          : state.openSplitIndex
      };
    case 'SET_OPEN_INDEX':
      return { ...state, openSplitIndex: action.index };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'RESET':
      return { splits: [], openSplitIndex: 0, step: 1 };
    default:
      return state;
  }
}; 