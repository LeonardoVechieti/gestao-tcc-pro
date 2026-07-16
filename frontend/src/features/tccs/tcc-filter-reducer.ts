export type TccStatus = string

export type TccFiltersState = {
  search: string
  status: TccStatus
}

type TccFiltersAction =
  | { type: 'search_changed'; value: string }
  | { type: 'status_changed'; value: TccStatus }
  | { type: 'cleared' }

export const initialTccFilters: TccFiltersState = {
  search: '',
  status: 'todos',
}

export function tccFiltersReducer(
  state: TccFiltersState,
  action: TccFiltersAction,
): TccFiltersState {
  switch (action.type) {
    case 'search_changed':
      return { ...state, search: action.value }
    case 'status_changed':
      return { ...state, status: action.value }
    case 'cleared':
      return initialTccFilters
  }
}
